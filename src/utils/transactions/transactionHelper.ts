/* eslint-disable sonarjs/no-identical-functions */
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Client as EcommerceClientV1 } from "../../../generated/definitions/payment-ecommerce/client";
import { TransactionOutcomeInfo } from "../../../generated/definitions/payment-ecommerce/TransactionOutcomeInfo";
import { UNKNOWN } from "./TransactionStatesTypes";

export const ecommerceTransactionOutcome = (
  transactionId: string,
  bearerAuth: string,
  ecommerceClient: EcommerceClientV1
): TE.TaskEither<UNKNOWN, TransactionOutcomeInfo> =>
  pipe(
    TE.tryCatch(
      () =>
        ecommerceClient.getTransactionOutcomes({
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
