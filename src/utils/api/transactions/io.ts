import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { flow, pipe } from "fp-ts/function";
import { TransactionInfo as TransactionInfoIO } from "../../../../generated/definitions/payment-ecommerce-IO/TransactionInfo";
import { Client as IOClient } from "../../../../generated/definitions/payment-ecommerce-IO/client";
import {
  TRANSACTION_POLLING_CHECK_INIT,
  TRANSACTION_POLLING_CHECK_NET_ERR,
  TRANSACTION_POLLING_CHECK_RESP_ERR,
  TRANSACTION_POLLING_CHECK_SUCCESS,
  TRANSACTION_POLLING_CHECK_SVR_ERR,
} from "../../config/mixpanelDefs";
import { mixpanel } from "../../config/mixpanelHelperInit";

export const ecommerceIOTransaction = (
  transactionId: string,
  eCommerceSessionToken: string,
  IOClient: IOClient
): Promise<O.Option<TransactionInfoIO>> => {
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
    TE.match(
      () => {
        mixpanel.track(TRANSACTION_POLLING_CHECK_SVR_ERR.value, {
          EVENT_ID: TRANSACTION_POLLING_CHECK_SVR_ERR.value,
        });
        return O.none;
      },
      flow(
        E.match(
          () => {
            mixpanel.track(TRANSACTION_POLLING_CHECK_RESP_ERR.value, {
              EVENT_ID: TRANSACTION_POLLING_CHECK_RESP_ERR.value,
            });
            return O.none;
          },
          (responseType) => {
            if (responseType.status === 200) {
              mixpanel.track(TRANSACTION_POLLING_CHECK_SUCCESS.value, {
                EVENT_ID: TRANSACTION_POLLING_CHECK_SUCCESS.value,
              });
              return O.some(responseType.value);
            } else {
              mixpanel.track(TRANSACTION_POLLING_CHECK_RESP_ERR.value, {
                EVENT_ID: TRANSACTION_POLLING_CHECK_RESP_ERR.value,
              });
              return O.none;
            }
          }
        )
      )
    )
  )();
};
