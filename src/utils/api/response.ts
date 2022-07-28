import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import { Millisecond } from "@pagopa/ts-commons//lib/units";
import {
  UNKNOWN,
  GENERIC_STATUS,
} from "../transactions/TransactionStatesTypes";
import {
  THREEDSACSCHALLENGEURL_STEP2_RESP_ERR,
  THREEDSACSCHALLENGEURL_STEP2_SUCCESS,
  THREEDSMETHODURL_STEP1_RESP_ERR,
  THREEDSMETHODURL_STEP1_SUCCESS,
  THREEDS_CHECK_XPAY_RESP_ERR,
  THREEDS_CHECK_XPAY_RESP_SUCCESS,
} from "../config/mixpanelDefs";
import { mixpanel } from "../config/mixpanelHelperInit";
import { WalletSession } from "../sessionData/WalletSession";
import {
  getStringFromSessionStorageTask,
  resumeTransactionTask,
  checkStatusTask,
  getXpay3DSResponseFromUrl,
  resumeXpayTransactionTask,
  nextTransactionStep,
} from "../transactions/transactionHelper";
import {
  createIFrame,
  start3DS2AcsChallengeStep,
  start3DS2MethodStep,
} from "../iframe/iframe";

import {
  constantPollingWithPromisePredicateFetch,
  retryingFetch,
} from "../config/fetch";
import { TransactionStatusResponse } from "../../../generated/definitions/payment-manager-api/TransactionStatusResponse";
import {
  createClient as createPmClient,
  Client,
} from "../../../generated/definitions/payment-manager-api/client";

import { getUrlParameter } from "../regex/urlUtilities";
import { getConfigOrThrow } from "../config/config";
import { TransactionStatus } from "../../../generated/definitions/payment-manager-api/TransactionStatus";

const config = getConfigOrThrow();
/**
 * Polling configuration params
 */
const retries: number = 10;
const delay: number = 3000;
const timeout: Millisecond = config.CHECKOUT_API_TIMEOUT as Millisecond;

/**
 * Payment Manager Client with polling until the transaction has the methodUrl or xpayHtml
 * or acsUrl and it is in a non final state.
 */
const paymentManagerClientWithPolling: Client = createPmClient({
  baseUrl: config.CHECKOUT_PM_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    timeout,
    async (r: Response): Promise<boolean> => {
      const myJson = (await r.clone().json()) as TransactionStatusResponse;
      return (
        myJson.data.finalStatus === false &&
        O.isNone(O.fromNullable(myJson.data.methodUrl)) &&
        O.isNone(O.fromNullable(myJson.data.xpayHtml)) &&
        O.isNone(O.fromNullable(myJson.data.acsUrl))
      );
    }
  ),
});
/**
 * Payment Manager Client with polling until the transaction is in a final state.
 */
const paymentManagerClientWithPollingOnFinalStatus: Client = createPmClient({
  baseUrl: config.CHECKOUT_PM_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    timeout,
    async (r: Response): Promise<boolean> => {
      const myJson = (await r.clone().json()) as TransactionStatusResponse;
      return r.status === 200 && myJson.data.finalStatus === false;
    }
  ),
});

/**
 * Payment Manager Client.
 */
const pmClient: Client = createPmClient({
  baseUrl: config.CHECKOUT_PM_HOST,
  fetchApi: retryingFetch(fetch, timeout as Millisecond, 5),
});

export const callServices = async (
  handleFinalStatusResult: (
    idStatus: GENERIC_STATUS,
    authorizationCode?: string,
    isDirectAcquirer?: boolean
  ) => void
) => {
  // set isDirectAcquirer to decide the final outcome
  const isDirectAcquirer: boolean | undefined = pipe(
    WalletSession.decode(
      JSON.parse(sessionStorage.getItem("wallet") || JSON.stringify(""))
    ),
    E.fold(
      (_) => undefined,
      (wallet) => wallet.psp.directAcquirer
    )
  );

  // 2. METHOD RESUME and ACS CHALLENGE step on 3ds2
  window.addEventListener(
    "message",
    async function (e: MessageEvent<any>) {
      if (/^react-devtools/gi.test(e.data.source)) {
        return;
      }
      pipe(
        E.fromPredicate(
          // Addresses must be static
          (e1: MessageEvent<any>) =>
            e1.origin === config.CHECKOUT_PAGOPA_APIM_HOST &&
            e1.data === "3DS.Notification.Received",
          E.toError
        )(e),
        E.fold(
          () => {
            mixpanel.track(THREEDSMETHODURL_STEP1_RESP_ERR.value, {
              EVENT_ID: THREEDSMETHODURL_STEP1_RESP_ERR.value,
            });
            handleFinalStatusResult(UNKNOWN.value);
          },
          (_) => {
            mixpanel.track(THREEDSMETHODURL_STEP1_SUCCESS.value, {
              EVENT_ID: THREEDSMETHODURL_STEP1_SUCCESS.value,
            });
            void pipe(
              getStringFromSessionStorageTask("idTransaction"),
              TE.chain((idTransaction: string) =>
                pipe(
                  getStringFromSessionStorageTask("sessionToken"),
                  TE.chain((sessionToken: string) =>
                    pipe(
                      resumeTransactionTask(
                        "Y",
                        sessionToken,
                        idTransaction,
                        pmClient
                      ),
                      TE.chain((_) =>
                        checkStatusTask(
                          idTransaction,
                          sessionToken,
                          paymentManagerClientWithPolling
                        )
                      )
                    )
                  )
                )
              ),
              TE.fold(
                // eslint-disable-next-line sonarjs/no-identical-functions
                () => async () => {
                  mixpanel.track(THREEDSMETHODURL_STEP1_RESP_ERR.value, {
                    EVENT_ID: THREEDSMETHODURL_STEP1_RESP_ERR.value,
                  });
                  handleFinalStatusResult(UNKNOWN.value);
                },
                (transactionStatus) =>
                  pipe(
                    TE.fromPredicate(
                      (data: TransactionStatus) => data.finalStatus === false,
                      E.toError
                    )(transactionStatus.data),
                    TE.fold(
                      () => async () =>
                        handleFinalStatusResult(
                          transactionStatus.data.idStatus,
                          transactionStatus.data.authorizationCode,
                          isDirectAcquirer
                        ),
                      () => async () =>
                        start3DS2AcsChallengeStep(
                          transactionStatus.data.acsUrl,
                          transactionStatus.data.params,
                          document.body
                        )
                    )
                  )
              )
            )();
          }
        )
      );
    },

    false
  );

  await pipe(
    TE.fromPredicate(
      (idTransaction) => idTransaction !== "",
      E.toError
    )(getUrlParameter("id")),
    TE.fold(
      (_) => async () => {
        // 1. Challenge or METHOD or XPAY step on 3ds2 or final status
        await pipe(
          getStringFromSessionStorageTask("sessionToken"),
          TE.chain((sessionToken) =>
            pipe(
              getStringFromSessionStorageTask(
                "idTransaction"
                // eslint-disable-next-line sonarjs/no-identical-functions
              ),
              // eslint-disable-next-line sonarjs/no-identical-functions
              TE.chain((idTransaction) =>
                checkStatusTask(
                  idTransaction,
                  sessionToken,
                  paymentManagerClientWithPolling
                )
              )
            )
          ),
          TE.fold(
            // eslint-disable-next-line sonarjs/no-identical-functions
            () => async () => {
              mixpanel.track(THREEDSMETHODURL_STEP1_RESP_ERR.value, {
                EVENT_ID: THREEDSMETHODURL_STEP1_RESP_ERR.value,
              });
              handleFinalStatusResult(UNKNOWN.value);
            },
            (transactionStatus) =>
              pipe(
                TE.fromPredicate(
                  (data: TransactionStatus) => data.finalStatus === false,
                  E.toError
                )(transactionStatus.data),
                TE.fold(
                  // eslint-disable-next-line sonarjs/no-identical-functions
                  (_) => async () =>
                    // 1.0 final status
                    handleFinalStatusResult(
                      transactionStatus.data.idStatus,
                      transactionStatus.data.authorizationCode,
                      isDirectAcquirer
                    ),
                  (_) => async () => {
                    switch (nextTransactionStep(transactionStatus)) {
                      // 1.1 METHOD step 3ds2
                      case "method": {
                        pipe(
                          O.fromNullable(
                            transactionStatus.data.threeDSMethodData
                          ),
                          O.map((threeDSMethodData) => {
                            sessionStorage.setItem(
                              "threeDSMethodData",
                              threeDSMethodData
                            );
                            return start3DS2MethodStep(
                              transactionStatus.data.methodUrl,
                              transactionStatus.data.threeDSMethodData,
                              createIFrame(
                                document.body,
                                "myIdFrame",
                                "myFrameName"
                              )
                            );
                          })
                        );
                        break;
                      }
                      // 1.2 Challenge step 3ds2 (without a previous method 3ds2 step)
                      case "challenge": {
                        start3DS2AcsChallengeStep(
                          transactionStatus.data.acsUrl,
                          transactionStatus.data.params,
                          document.body
                        );
                        break;
                      }
                      // 1.3 Xpay step 3ds2
                      case "xpay": {
                        pipe(
                          O.fromNullable(transactionStatus.data.xpayHtml),
                          O.map((xpayHtml) => {
                            document.write(xpayHtml);
                          })
                        );
                        break;
                      }
                      default: {
                        handleFinalStatusResult(UNKNOWN.value);
                        break;
                      }
                    }
                  }
                )
              )
          )
        )();
      },
      (idTransaction) => async () =>
        pipe(
          getXpay3DSResponseFromUrl(),
          TE.fold(
            (_) => async () => {
              // 3. ACS RESUME and CHECK FINAL STATUS POLLING step on 3ds2
              await pipe(
                getStringFromSessionStorageTask("sessionToken"),
                TE.chain((sessionToken) =>
                  pipe(
                    resumeTransactionTask(
                      undefined,
                      sessionToken,
                      idTransaction,
                      pmClient
                    ),
                    TE.chain((_) =>
                      checkStatusTask(
                        idTransaction,
                        sessionToken,
                        paymentManagerClientWithPollingOnFinalStatus
                      )
                    )
                  )
                ),
                TE.fold(
                  (_) => async () => {
                    mixpanel.track(
                      THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value,
                      {
                        EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value,
                      }
                    );
                    handleFinalStatusResult(UNKNOWN.value);
                  },
                  (transactionStatusResponse) => async () => {
                    mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value, {
                      EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value,
                    });
                    handleFinalStatusResult(
                      transactionStatusResponse.data.idStatus,
                      transactionStatusResponse.data.authorizationCode,
                      isDirectAcquirer
                    );
                  }
                )
              )();
            },
            (xpay3DSResponse) => async () => {
              // 4. XPAY transaction resume
              await pipe(
                getStringFromSessionStorageTask("sessionToken"),
                TE.chain((sessionToken) =>
                  pipe(
                    resumeXpayTransactionTask(
                      xpay3DSResponse,
                      getUrlParameter("outcome"),
                      sessionToken,
                      idTransaction,
                      pmClient
                      // eslint-disable-next-line sonarjs/no-identical-functions
                    ),
                    // eslint-disable-next-line sonarjs/no-identical-functions
                    TE.chain((_) =>
                      checkStatusTask(
                        idTransaction,
                        sessionToken,
                        paymentManagerClientWithPollingOnFinalStatus
                      )
                    )
                  )
                ),
                TE.fold(
                  (_) => async () => {
                    mixpanel.track(THREEDS_CHECK_XPAY_RESP_ERR.value, {
                      EVENT_ID: THREEDS_CHECK_XPAY_RESP_ERR.value,
                    });
                    handleFinalStatusResult(UNKNOWN.value);
                  },
                  (transactionStatusResponse) => async () => {
                    mixpanel.track(THREEDS_CHECK_XPAY_RESP_SUCCESS.value, {
                      EVENT_ID: THREEDS_CHECK_XPAY_RESP_SUCCESS.value,
                    });
                    handleFinalStatusResult(
                      transactionStatusResponse.data.idStatus,
                      transactionStatusResponse.data.authorizationCode,
                      isDirectAcquirer
                    );
                  }
                )
              )();
            }
          )
        )()
    )
  )();
};
