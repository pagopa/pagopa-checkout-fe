import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Client as EcommerceClient } from "../../../generated/definitions/payment-ecommerce-v2/client";
import { TransactionInfo } from "../../../generated/definitions/payment-ecommerce-v2/TransactionInfo";
import { UNKNOWN } from "./TransactionStatesTypes";

export const ecommerceTransaction = (
  transactionId: string,
  bearerAuth: string,
  ecommerceClient: EcommerceClient
): TE.TaskEither<UNKNOWN, TransactionInfo> =>
  pipe(
    TE.tryCatch(
      () =>
        ecommerceClient.getTransactionInfo({
          bearerAuth,
          transactionId,
        }),
      () => E.toError
    ),
    TE.fold(
      () => TE.left(UNKNOWN.value),
      (errorOrResponse) =>
        pipe(
          errorOrResponse,
          E.fold(
            () => TE.left(UNKNOWN.value),
            (responseType) => {
              if (responseType.status === 200) {
                return TE.of(responseType.value);
              } else {
                return TE.left(UNKNOWN.value);
              }
            }
          )
        )
    )
  );
