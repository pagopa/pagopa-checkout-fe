import { toError } from "fp-ts/lib/Either";
import { fromNullable } from "fp-ts/lib/Option";
import {
  fromLeft,
  taskEither,
  TaskEither,
  tryCatch,
} from "fp-ts/lib/TaskEither";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Client } from "../../../generated/definitions/payment-manager-api/client";
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
  mixpanel,
} from "../config/pmMixpanelHelperInit";
import { UNKNOWN } from "./TransactionStatesTypes";

export const getXpay3DSResponseFromUrl = (): TaskEither<
  UNKNOWN,
  Xpay3DSResponse
> =>
  Xpay3DSResponse.decode({
    esito: getUrlParameter("esito"),
    idOperazione: getUrlParameter("idOperazione"),
    timestamp: getUrlParameter("timeStamp"),
    mac: getUrlParameter("mac"),
    xpayNonce: getUrlParameter("xpayNonce"),
    codice: getUrlParameter("codice"),
    messaggio: getUrlParameter("messaggio"),
    resumeType: getUrlParameter("resumeType"),
  }).fold(
    (_) => fromLeft(UNKNOWN.value),
    (xpay3DSresponse) => taskEither.of(xpay3DSresponse)
  );

export const resumeXpayTransactionTask = (
  xpay3DSResponse: Xpay3DSResponse,
  outcome: string,
  sessionToken: string,
  idTransaction: string,
  paymentManagerClient: Client
): TaskEither<UNKNOWN, number> => {
  mixpanel.track(TRANSACTION_RESUMEXPAY_INIT.value, {
    EVENT_ID: TRANSACTION_RESUMEXPAY_INIT.value,
  });
  return tryCatch(
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
      return toError;
    }
  ).foldTaskEither(
    () => {
      mixpanel.track(TRANSACTION_RESUMEXPAY_SVR_ERR.value, {
        EVENT_ID: TRANSACTION_RESUMEXPAY_SVR_ERR.value,
      });
      return fromLeft(UNKNOWN.value);
    },
    (errorOrResponse) =>
      errorOrResponse.fold(
        () => fromLeft(UNKNOWN.value),
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
            ? fromLeft(UNKNOWN.value)
            : taskEither.of(responseType.status);
        }
      )
  );
};

export const resumeTransactionTask = (
  methodCompleted: "Y" | "N" | undefined,
  sessionToken: string,
  idTransaction: string,
  paymentManagerClient: Client
): TaskEither<UNKNOWN, number> => {
  mixpanel.track(TRANSACTION_RESUME3DS2_INIT.value, {
    EVENT_ID: TRANSACTION_RESUME3DS2_INIT.value,
    methodCompleted,
  });
  return tryCatch(
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
      return toError;
    }
  ).foldTaskEither(
    () => {
      // TODO: #RENDERING_ERROR
      mixpanel.track(TRANSACTION_RESUME3DS2_SVR_ERR.value, {
        EVENT_ID: TRANSACTION_RESUME3DS2_SVR_ERR.value,
      });
      return fromLeft(UNKNOWN.value);
    }, // to be replaced with logic to handle failures
    (errorOrResponse) =>
      errorOrResponse.fold(
        () => fromLeft(UNKNOWN.value),
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
            ? fromLeft(UNKNOWN.value)
            : taskEither.of(responseType.status);
        }
      )
  );
};

export const checkStatusTask = (
  transactionId: string,
  sessionToken: string,
  paymentManagerClient: Client
): TaskEither<UNKNOWN, TransactionStatusResponse> => {
  mixpanel.track(TRANSACTION_POLLING_CHECK_INIT.value, {
    EVENT_ID: TRANSACTION_POLLING_CHECK_INIT.value,
  });
  return tryCatch(
    () =>
      paymentManagerClient.checkStatusUsingGET({
        Bearer: `Bearer ${sessionToken}`,
        id: transactionId,
      }),
    () => {
      mixpanel.track(TRANSACTION_POLLING_CHECK_NET_ERR.value, {
        EVENT_ID: TRANSACTION_POLLING_CHECK_NET_ERR.value,
      });
      return toError;
    }
  ).foldTaskEither(
    () => {
      mixpanel.track(TRANSACTION_POLLING_CHECK_SVR_ERR.value, {
        EVENT_ID: TRANSACTION_POLLING_CHECK_SVR_ERR.value,
      });
      return fromLeft(UNKNOWN.value);
    },
    (errorOrResponse) =>
      errorOrResponse.fold(
        () => {
          mixpanel.track(TRANSACTION_POLLING_CHECK_RESP_ERR.value, {
            EVENT_ID: TRANSACTION_POLLING_CHECK_RESP_ERR.value,
          });
          return fromLeft(UNKNOWN.value);
        },
        (responseType) => {
          if (responseType.status === 200) {
            mixpanel.track(TRANSACTION_POLLING_CHECK_SUCCESS.value, {
              EVENT_ID: TRANSACTION_POLLING_CHECK_SUCCESS.value,
            });
            return taskEither.of(responseType.value);
          } else {
            mixpanel.track(TRANSACTION_POLLING_CHECK_RESP_ERR.value, {
              EVENT_ID: TRANSACTION_POLLING_CHECK_RESP_ERR.value,
            });
            return fromLeft(UNKNOWN.value);
          }
        }
      )
  );
};

export const getTransactionFromSessionStorageTask = (
  key: string
): TaskEither<UNKNOWN, Transaction> =>
  Transaction.decode(
    JSON.parse(fromNullable(sessionStorage.getItem(key)).getOrElse(""))
  ).fold(
    (_) => fromLeft(UNKNOWN.value),
    (data) => taskEither.of(data)
  );

export const getStringFromSessionStorageTask = (
  key: string
): TaskEither<UNKNOWN, string> =>
  fromNullable(sessionStorage.getItem(key)).fold(
    fromLeft(UNKNOWN.value),
    (data) => taskEither.of(data)
  );

export const nextTransactionStep = (
  transactionStatusResponse: TransactionStatusResponse
): "challenge" | "xpay" | "method" | "error" =>
  NonEmptyString.decode(transactionStatusResponse.data.methodUrl).isRight()
    ? "method"
    : NonEmptyString.decode(transactionStatusResponse.data.xpayHtml).isRight()
    ? "xpay"
    : NonEmptyString.decode(transactionStatusResponse.data.acsUrl).isRight()
    ? "challenge"
    : "error";
