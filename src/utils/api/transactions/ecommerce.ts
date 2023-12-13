import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { TransactionInfo } from "../../../../generated/definitions/payment-ecommerce/TransactionInfo";
import { Client as EcommerceClient } from "../../../../generated/definitions/payment-ecommerce/client";
import {
  TRANSACTION_POLLING_CHECK_INIT,
  TRANSACTION_POLLING_CHECK_NET_ERR,
  TRANSACTION_POLLING_CHECK_RESP_ERR,
  TRANSACTION_POLLING_CHECK_SUCCESS,
  TRANSACTION_POLLING_CHECK_SVR_ERR,
} from "../../config/mixpanelDefs";
import { mixpanel } from "../../config/mixpanelHelperInit";
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
