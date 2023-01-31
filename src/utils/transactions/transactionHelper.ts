import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { Client } from "../../../generated/definitions/payment-manager-api/client";
import { Client as EcommerceClient } from "../../../generated/definitions/payment-ecommerce/client";
import { Transaction } from "../../../generated/definitions/payment-manager-api/Transaction";
import { TransactionStatusResponse } from "../../../generated/definitions/payment-manager-api/TransactionStatusResponse";
import { Xpay3DSResponse } from "../../../generated/definitions/payment-manager-api/Xpay3DSResponse";
import { getUrlParameter } from "../regex/urlUtilities";
import {
  TRANSACTION_POLLING_CHECK_INIT,
  TRANSACTION_POLLING_CHECK_NET_ERR,
  TRANSACTION_POLLING_CHECK_SVR_ERR,
  TRANSACTION_POLLING_CHECK_SUCCESS,
  TRANSACTION_POLLING_CHECK_RESP_ERR,
  TRANSACTION_RESUME3DS2_INIT,
  TRANSACTION_RESUME3DS2_NET_ERR,
  TRANSACTION_RESUME3DS2_SVR_ERR,
  TRANSACTION_RESUME3DS2_RESP_ERR,
  TRANSACTION_RESUME3DS2_SUCCESS,
  TRANSACTION_RESUMEXPAY_INIT,
  TRANSACTION_RESUMEXPAY_NET_ERR,
  TRANSACTION_RESUMEXPAY_SVR_ERR,
  TRANSACTION_RESUMEXPAY_SUCCESS,
  TRANSACTION_RESUMEXPAY_RESP_ERR,
} from "../config/mixpanelDefs";
import { mixpanel } from "../config/mixpanelHelperInit";
import { UNKNOWN } from "./TransactionStatesTypes";
import { TransactionInfo } from "../../../generated/definitions/payment-ecommerce/TransactionInfo";

export const getXpay3DSResponseFromUrl = (): TE.TaskEither<
  UNKNOWN,
  Xpay3DSResponse
> =>
  pipe(
    Xpay3DSResponse.decode({
      esito: getUrlParameter("esito"),
      idOperazione: getUrlParameter("idOperazione"),
      timestamp: getUrlParameter("timeStamp"),
      mac: getUrlParameter("mac"),
      xpayNonce: getUrlParameter("xpayNonce"),
      codice: getUrlParameter("codice"),
      messaggio: getUrlParameter("messaggio"),
      resumeType: getUrlParameter("resumeType"),
    }),
    E.fold(
      (_) => TE.left(UNKNOWN.value),
      (xpay3DSresponse) => TE.of(xpay3DSresponse)
    )
  );

export const resumeXpayTransactionTask = (
  xpay3DSResponse: Xpay3DSResponse,
  outcome: string,
  sessionToken: string,
  idTransaction: string,
  paymentManagerClient: Client
): TE.TaskEither<UNKNOWN, number> => {
  mixpanel.track(TRANSACTION_RESUMEXPAY_INIT.value, {
    EVENT_ID: TRANSACTION_RESUMEXPAY_INIT.value,
  });
  return pipe(
    TE.tryCatch(
      () =>
        paymentManagerClient.resumeUsingPOST({
          Bearer: `Bearer ${sessionToken}`,
          id: idTransaction,
          resumeRequest: { data: { esito: outcome, xpay3DSResponse } },
          language: "it", // TODO it-it is not valid!
        }),
      () => {
        mixpanel.track(TRANSACTION_RESUMEXPAY_NET_ERR.value, {
          EVENT_ID: TRANSACTION_RESUMEXPAY_NET_ERR.value,
        });
        return E.toError;
      }
    ),
    TE.fold(
      () => {
        mixpanel.track(TRANSACTION_RESUMEXPAY_SVR_ERR.value, {
          EVENT_ID: TRANSACTION_RESUMEXPAY_SVR_ERR.value,
        });
        return TE.left(UNKNOWN.value);
      },
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () => TE.left(UNKNOWN.value),
            (responseType) => {
              if (responseType.status === 200) {
                mixpanel.track(TRANSACTION_RESUMEXPAY_SUCCESS.value, {
                  EVENT_ID: TRANSACTION_RESUMEXPAY_SUCCESS.value,
                });
              } else {
                mixpanel.track(TRANSACTION_RESUMEXPAY_RESP_ERR.value, {
                  EVENT_ID: TRANSACTION_RESUMEXPAY_RESP_ERR.value,
                });
              }
              return responseType.status !== 200
                ? TE.left(UNKNOWN.value)
                : TE.of(responseType.status);
            }
          )
        )
    )
  );
};

export const resumeTransactionTask = (
  methodCompleted: "Y" | "N" | undefined,
  sessionToken: string,
  idTransaction: string,
  paymentManagerClient: Client
): TE.TaskEither<UNKNOWN, number> => {
  mixpanel.track(TRANSACTION_RESUME3DS2_INIT.value, {
    EVENT_ID: TRANSACTION_RESUME3DS2_INIT.value,
    methodCompleted,
  });
  return pipe(
    TE.tryCatch(
      () =>
        paymentManagerClient.resume3ds2UsingPOST({
          Bearer: `Bearer ${sessionToken}`,
          id: idTransaction,
          resumeRequest: { data: { methodCompleted } },
          language: "it", // TODO it-it is not valid!
        }),
      () => {
        // TODO: #RENDERING_ERROR
        mixpanel.track(TRANSACTION_RESUME3DS2_NET_ERR.value, {
          EVENT_ID: TRANSACTION_RESUME3DS2_NET_ERR.value,
        });
        return E.toError;
      }
    ),
    TE.fold(
      () => {
        // TODO: #RENDERING_ERROR
        mixpanel.track(TRANSACTION_RESUME3DS2_SVR_ERR.value, {
          EVENT_ID: TRANSACTION_RESUME3DS2_SVR_ERR.value,
        });
        return TE.left(UNKNOWN.value);
      }, // to be replaced with logic to handle failures
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () => TE.left(UNKNOWN.value),
            (responseType) => {
              if (responseType.status === 200) {
                mixpanel.track(TRANSACTION_RESUME3DS2_SUCCESS.value, {
                  EVENT_ID: TRANSACTION_RESUME3DS2_SUCCESS.value,
                });
              } else {
                mixpanel.track(TRANSACTION_RESUME3DS2_RESP_ERR.value, {
                  EVENT_ID: TRANSACTION_RESUME3DS2_RESP_ERR.value,
                });
              }
              return responseType.status !== 200
                ? TE.left(UNKNOWN.value)
                : TE.of(responseType.status);
            }
          )
        )
    )
  );
};

export const ecommerceTransaction = (
  transactionId: string,
  ecommerceClient: EcommerceClient
): TE.TaskEither<UNKNOWN, TransactionInfo> => {
  mixpanel.track(TRANSACTION_POLLING_CHECK_INIT.value, {
    EVENT_ID: TRANSACTION_POLLING_CHECK_INIT.value,
  });
  return pipe(
    TE.tryCatch(
      () =>
       ecommerceClient.getTransactionInfo({
          transactionId: transactionId,
        }),
      () => {
        mixpanel.track(TRANSACTION_POLLING_CHECK_NET_ERR.value, {
          EVENT_ID: TRANSACTION_POLLING_CHECK_NET_ERR.value,
        });
        return E.toError;
      }
    ),
    TE.fold(
      () => {
        mixpanel.track(TRANSACTION_POLLING_CHECK_SVR_ERR.value, {
          EVENT_ID: TRANSACTION_POLLING_CHECK_SVR_ERR.value,
        });
        return TE.left(UNKNOWN.value);
      },
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () => {
              mixpanel.track(TRANSACTION_POLLING_CHECK_RESP_ERR.value, {
                EVENT_ID: TRANSACTION_POLLING_CHECK_RESP_ERR.value,
              });
              return TE.left(UNKNOWN.value);
            },
            (responseType) => {
              if (responseType.status === 200) {
                mixpanel.track(TRANSACTION_POLLING_CHECK_SUCCESS.value, {
                  EVENT_ID: TRANSACTION_POLLING_CHECK_SUCCESS.value,
                });
                return TE.of(responseType.value);
              } else {
                mixpanel.track(TRANSACTION_POLLING_CHECK_RESP_ERR.value, {
                  EVENT_ID: TRANSACTION_POLLING_CHECK_RESP_ERR.value,
                });
                return TE.left(UNKNOWN.value);
              }
            }
          )
        )
    )
  );
};

export const checkStatusTask = (
  transactionId: string,
  sessionToken: string,
  paymentManagerClient: Client
): TE.TaskEither<UNKNOWN, TransactionStatusResponse> => {
  mixpanel.track(TRANSACTION_POLLING_CHECK_INIT.value, {
    EVENT_ID: TRANSACTION_POLLING_CHECK_INIT.value,
  });
  return pipe(
    TE.tryCatch(
      () =>
        paymentManagerClient.checkStatusUsingGET({
          Bearer: `Bearer ${sessionToken}`,
          id: transactionId,
        }),
      () => {
        mixpanel.track(TRANSACTION_POLLING_CHECK_NET_ERR.value, {
          EVENT_ID: TRANSACTION_POLLING_CHECK_NET_ERR.value,
        });
        return E.toError;
      }
    ),
    TE.fold(
      () => {
        mixpanel.track(TRANSACTION_POLLING_CHECK_SVR_ERR.value, {
          EVENT_ID: TRANSACTION_POLLING_CHECK_SVR_ERR.value,
        });
        return TE.left(UNKNOWN.value);
      },
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () => {
              mixpanel.track(TRANSACTION_POLLING_CHECK_RESP_ERR.value, {
                EVENT_ID: TRANSACTION_POLLING_CHECK_RESP_ERR.value,
              });
              return TE.left(UNKNOWN.value);
            },
            (responseType) => {
              if (responseType.status === 200) {
                mixpanel.track(TRANSACTION_POLLING_CHECK_SUCCESS.value, {
                  EVENT_ID: TRANSACTION_POLLING_CHECK_SUCCESS.value,
                });
                return TE.of(responseType.value);
              } else {
                mixpanel.track(TRANSACTION_POLLING_CHECK_RESP_ERR.value, {
                  EVENT_ID: TRANSACTION_POLLING_CHECK_RESP_ERR.value,
                });
                return TE.left(UNKNOWN.value);
              }
            }
          )
        )
    )
  );
};

export const getTransactionFromSessionStorageTask = (
  key: string
): TE.TaskEither<UNKNOWN, Transaction> =>
  pipe(
    Transaction.decode(
      JSON.parse(
        pipe(
          O.fromNullable(sessionStorage.getItem(key)),
          O.getOrElse(() => "")
        )
      )
    ),
    E.fold(
      (_) => TE.left(UNKNOWN.value),
      (data) => TE.of(data)
    )
  );

export const getStringFromSessionStorageTask = (
  key: string
): TE.TaskEither<UNKNOWN, string> =>
  pipe(
    O.fromNullable(sessionStorage.getItem(key)),
    O.fold(
      () => TE.left(UNKNOWN.value),
      (data) => TE.of(data)
    )
  );

export const nextTransactionStep = (
  transactionStatusResponse: TransactionStatusResponse
): "challenge" | "xpay" | "method" | "error" =>
  E.isRight(NonEmptyString.decode(transactionStatusResponse.data.methodUrl))
    ? "method"
    : E.isRight(NonEmptyString.decode(transactionStatusResponse.data.xpayHtml))
    ? "xpay"
    : E.isRight(NonEmptyString.decode(transactionStatusResponse.data.acsUrl))
    ? "challenge"
    : "error";
