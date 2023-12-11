import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Client as EcommerceClient } from "../../../generated/definitions/payment-ecommerce/client";
import { Client as IOClient } from "../../../generated/definitions/payment-ecommerce-IO/client";
import {
  TRANSACTION_POLLING_CHECK_INIT,
  TRANSACTION_POLLING_CHECK_NET_ERR,
  TRANSACTION_POLLING_CHECK_SVR_ERR,
  TRANSACTION_POLLING_CHECK_SUCCESS,
  TRANSACTION_POLLING_CHECK_RESP_ERR,
} from "../config/mixpanelDefs";
import { mixpanel } from "../config/mixpanelHelperInit";
import { TransactionInfo } from "../../../generated/definitions/payment-ecommerce/TransactionInfo";
import { TransactionInfo as TransactionInfoIO } from "../../../generated/definitions/payment-ecommerce-IO/TransactionInfo";
import { UNKNOWN } from "./TransactionStatesTypes";

export const ecommerceTransaction = (
  transactionId: string,
  bearerAuth: string,
  ecommerceClient: EcommerceClient
): TE.TaskEither<UNKNOWN, TransactionInfo> => {
  mixpanel.track(TRANSACTION_POLLING_CHECK_INIT.value, {
    EVENT_ID: TRANSACTION_POLLING_CHECK_INIT.value,
  });
  return pipe(
    TE.tryCatch(
      () =>
        ecommerceClient.getTransactionInfo({
          bearerAuth,
          transactionId,
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

export const ecommerceIOTransaction = (
  transactionId: string,
  eCommerceSessionToken: string,
  IOClient: IOClient
): TE.TaskEither<UNKNOWN, TransactionInfoIO> => {
  mixpanel.track(TRANSACTION_POLLING_CHECK_INIT.value, {
    EVENT_ID: TRANSACTION_POLLING_CHECK_INIT.value,
  });
  return pipe(
    TE.tryCatch(
      () =>
        IOClient.getTransactionInfo({
          eCommerceSessionToken,
          transactionId,
        }),
      // eslint-disable-next-line sonarjs/no-identical-functions
      () => {
        mixpanel.track(TRANSACTION_POLLING_CHECK_NET_ERR.value, {
          EVENT_ID: TRANSACTION_POLLING_CHECK_NET_ERR.value,
        });
        return E.toError;
      }
    ),
    TE.fold(
      // eslint-disable-next-line sonarjs/no-identical-functions
      () => {
        mixpanel.track(TRANSACTION_POLLING_CHECK_SVR_ERR.value, {
          EVENT_ID: TRANSACTION_POLLING_CHECK_SVR_ERR.value,
        });
        return TE.left(UNKNOWN.value);
      },
      // eslint-disable-next-line sonarjs/no-identical-functions
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            // eslint-disable-next-line sonarjs/no-identical-functions
            () => {
              mixpanel.track(TRANSACTION_POLLING_CHECK_RESP_ERR.value, {
                EVENT_ID: TRANSACTION_POLLING_CHECK_RESP_ERR.value,
              });
              return TE.left(UNKNOWN.value);
            },
            // eslint-disable-next-line sonarjs/no-identical-functions
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
