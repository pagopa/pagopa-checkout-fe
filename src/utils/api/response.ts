import { fromNullable, none } from "fp-ts/lib/Option";
import { fromPredicate, toError } from "fp-ts/lib/Either";
import { DeferredPromise } from "italia-ts-commons/lib/promises";
import { Millisecond } from "italia-ts-commons/lib/units";
import {
  UNKNOWN,
  GENERIC_STATUS,
} from "../transactions/TransactionStatesTypes";
import {
  mixpanel,
  THREEDSACSCHALLENGEURL_STEP2_RESP_ERR,
  THREEDSACSCHALLENGEURL_STEP2_SUCCESS,
  THREEDSMETHODURL_STEP1_RESP_ERR,
  THREEDSMETHODURL_STEP1_SUCCESS,
  THREEDS_CHECK_XPAY_RESP_ERR,
  THREEDS_CHECK_XPAY_RESP_SUCCESS,
} from "../config/pmMixpanelHelperInit";
import { WalletSession } from "../sessionData/WalletSession";
import {
  getStringFromSessionStorageTask,
  resumeTransactionTask,
  checkStatusTask,
  getXpay3DSResponseFromUrl,
  resumeXpayTransactionTask,
  nextTransactionStep,
} from "../transactions/transactionHelper";
import { TransactionStatus } from "../../../generated/definitions/payment-manager-api/TransactionStatus";
import {
  createIFrame,
  start3DS2AcsChallengeStep,
  start3DS2MethodStep,
} from "../iframe/iframe";

import { getConfigOrThrow } from "../config/pmConfig";
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

const config = getConfigOrThrow();
/**
 * Polling configuration params
 */
const retries: number = 10;
const delay: number = 3000;
const timeout: Millisecond = config.IO_PAY_API_TIMEOUT as Millisecond;

/**
 * Payment Manager Client with polling until the transaction has the methodUrl or xpayHtml
 * or acsUrl and it is in a non final state.
 */
const paymentManagerClientWithPolling: Client = createPmClient({
  baseUrl: config.IO_PAY_PAYMENT_MANAGER_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    timeout,
    async (r: Response): Promise<boolean> => {
      const myJson = (await r.clone().json()) as TransactionStatusResponse;
      return (
        myJson.data.finalStatus === false &&
        fromNullable(myJson.data.methodUrl).isNone() &&
        fromNullable(myJson.data.xpayHtml).isNone() &&
        fromNullable(myJson.data.acsUrl).isNone()
      );
    }
  ),
});
/**
 * Payment Manager Client with polling until the transaction is in a final state.
 */
const paymentManagerClientWithPollingOnFinalStatus: Client = createPmClient({
  baseUrl: config.IO_PAY_PAYMENT_MANAGER_HOST,
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
  baseUrl: config.IO_PAY_PAYMENT_MANAGER_HOST,
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
  const isDirectAcquirer: boolean | undefined = WalletSession.decode(
    JSON.parse(sessionStorage.getItem("wallet") || "")
  ).fold(
    (_) => undefined,
    (wallet) => wallet.psp.directAcquirer
  );

  // 2. METHOD RESUME and ACS CHALLENGE step on 3ds2
  window.addEventListener(
    "message",
    async function (e) {
      if (/^react-devtools/gi.test(e.data.source)) {
        return;
      }
      fromPredicate<Error, MessageEvent<any>>(
        // Addresses must be static
        (e1) =>
          e1.origin === config.IO_PAY_FUNCTIONS_HOST &&
          e1.data === "3DS.Notification.Received",
        toError
      )(e).fold(
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
          void getStringFromSessionStorageTask("idTransaction")
            .chain((idTransaction) =>
              getStringFromSessionStorageTask("sessionToken").chain(
                (sessionToken) =>
                  resumeTransactionTask(
                    "Y",
                    sessionToken,
                    idTransaction,
                    pmClient
                  ).chain((_) =>
                    checkStatusTask(
                      idTransaction,
                      sessionToken,
                      paymentManagerClientWithPolling
                    )
                  )
              )
            )
            .fold(
              // eslint-disable-next-line sonarjs/no-identical-functions
              () => {
                mixpanel.track(THREEDSMETHODURL_STEP1_RESP_ERR.value, {
                  EVENT_ID: THREEDSMETHODURL_STEP1_RESP_ERR.value,
                });
                handleFinalStatusResult(UNKNOWN.value);
              },
              (transactionStatus) =>
                fromPredicate<Error, TransactionStatus>(
                  (data) => data.finalStatus === false,
                  toError
                )(transactionStatus.data).fold(
                  () =>
                    handleFinalStatusResult(
                      transactionStatus.data.idStatus,
                      transactionStatus.data.authorizationCode,
                      isDirectAcquirer
                    ),
                  () =>
                    start3DS2AcsChallengeStep(
                      transactionStatus.data.acsUrl,
                      transactionStatus.data.params,
                      document.body
                    )
                )
            )
            .run();
        }
      );
    },

    false
  );

  await fromPredicate<Error, string>(
    (idTransaction) => idTransaction !== "",
    toError
  )(getUrlParameter("id")).fold(
    async (_) => {
      // 1. Challenge or METHOD or XPAY step on 3ds2 or final status
      await getStringFromSessionStorageTask("sessionToken")
        .chain((sessionToken) =>
          getStringFromSessionStorageTask(
            "idTransaction"
            // eslint-disable-next-line sonarjs/no-identical-functions
          ).chain((idTransaction) =>
            checkStatusTask(
              idTransaction,
              sessionToken,
              paymentManagerClientWithPolling
            )
          )
        )
        .fold(
          // eslint-disable-next-line sonarjs/no-identical-functions
          () => {
            mixpanel.track(THREEDSMETHODURL_STEP1_RESP_ERR.value, {
              EVENT_ID: THREEDSMETHODURL_STEP1_RESP_ERR.value,
            });
            handleFinalStatusResult(UNKNOWN.value);
          },
          (transactionStatus) =>
            fromPredicate<Error, TransactionStatus>(
              (data) => data.finalStatus === false,
              toError
            )(transactionStatus.data).fold(
              // eslint-disable-next-line sonarjs/no-identical-functions
              (_) =>
                // 1.0 final status
                handleFinalStatusResult(
                  transactionStatus.data.idStatus,
                  transactionStatus.data.authorizationCode,
                  isDirectAcquirer
                ),
              (_) => {
                switch (nextTransactionStep(transactionStatus)) {
                  // 1.1 METHOD step 3ds2
                  case "method": {
                    fromNullable(transactionStatus.data.threeDSMethodData).fold(
                      none,
                      (threeDSMethodData) => {
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
                      }
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
                    fromNullable(transactionStatus.data.xpayHtml).map(
                      (xpayHtml) => {
                        document.write(xpayHtml);
                      }
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
        .run();
    },
    async (idTransaction) =>
      getXpay3DSResponseFromUrl()
        .fold(
          async (_) => {
            // 3. ACS RESUME and CHECK FINAL STATUS POLLING step on 3ds2
            await getStringFromSessionStorageTask("sessionToken")
              .chain((sessionToken) =>
                resumeTransactionTask(
                  undefined,
                  sessionToken,
                  idTransaction,
                  pmClient
                ).chain((_) =>
                  checkStatusTask(
                    idTransaction,
                    sessionToken,
                    paymentManagerClientWithPollingOnFinalStatus
                  )
                )
              )
              .fold(
                (_) => {
                  mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value, {
                    EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value,
                  });
                  handleFinalStatusResult(UNKNOWN.value);
                },
                (transactionStatusResponse) => {
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
              .run();
          },
          async (xpay3DSResponse) => {
            // 4. XPAY transaction resume
            await getStringFromSessionStorageTask("sessionToken")
              .chain((sessionToken) =>
                resumeXpayTransactionTask(
                  xpay3DSResponse,
                  getUrlParameter("outcome"),
                  sessionToken,
                  idTransaction,
                  pmClient
                  // eslint-disable-next-line sonarjs/no-identical-functions
                ).chain((_) =>
                  checkStatusTask(
                    idTransaction,
                    sessionToken,
                    paymentManagerClientWithPollingOnFinalStatus
                  )
                )
              )
              .fold(
                (_) => {
                  mixpanel.track(THREEDS_CHECK_XPAY_RESP_ERR.value, {
                    EVENT_ID: THREEDS_CHECK_XPAY_RESP_ERR.value,
                  });
                  handleFinalStatusResult(UNKNOWN.value);
                },
                (transactionStatusResponse) => {
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
              .run();
          }
        )
        .run()
  );
};
