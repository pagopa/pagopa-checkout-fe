import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import {
  NewTransactionResponse,
  SendPaymentResultOutcomeEnum,
} from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";
import { decodeToUUID } from "../../utils/uuid";
import {
  THREEDSACSCHALLENGEURL_STEP2_RESP_ERR,
  THREEDSACSCHALLENGEURL_STEP2_SUCCESS,
  THREEDSMETHODURL_STEP1_RESP_ERR,
} from "../config/mixpanelDefs";
import { mixpanel } from "../config/mixpanelHelperInit";
import { getUrlParameter } from "../regex/urlUtilities";
import { SessionItems, getSessionItem } from "../storage/sessionStorage";
import {
  ecommerceClientWithPolling,
  ecommerceClientWithoutPolling,
} from "./client";
import { ecommerceTransaction } from "./transactions/ecommerce";

export const callServices = async (
  handleFinalStatusResult: (
    status?: TransactionStatusEnum,
    sendPaymentResultOutcome?: SendPaymentResultOutcomeEnum,
    gateway?: string,
    errorCode?: string
  ) => void
) => {
  const transaction = pipe(
    getSessionItem(SessionItems.transaction),
    NewTransactionResponse.decode,
    E.fold(
      () => undefined,
      (transaction) => transaction
    )
  );

  const transactionId = pipe(
    transaction,
    O.fromNullable,
    O.map((transaction) => transaction.transactionId),
    O.getOrElse(() => "")
  );

  const bearerAuth = pipe(
    transaction,
    O.fromNullable,
    O.chain((transaction) => O.fromNullable(transaction.authToken)),
    O.getOrElse(() => "")
  );

  await pipe(
    TE.fromPredicate(
      (idTransaction) => idTransaction !== "",
      E.toError
    )(getUrlParameter("id")),

    TE.fold(
      (_) => async () => {
        mixpanel.track(THREEDSMETHODURL_STEP1_RESP_ERR.value, {
          EVENT_ID: THREEDSMETHODURL_STEP1_RESP_ERR.value,
        });
        return transactionId;
      },
      (idTransaction) => async () => {
        mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value, {
          EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value,
        });
        return decodeToUUID(idTransaction) as string;
      }
    ),
    T.chain(
      (transactionId) => async () =>
        pipe(
          ecommerceTransaction(
            transactionId,
            bearerAuth,
            ecommerceClientWithPolling
          ),
          TE.fold(
            () => async () =>
              await pipe(
                ecommerceTransaction(
                  transactionId,
                  bearerAuth,
                  ecommerceClientWithoutPolling
                ),
                TE.fold(
                  () => async () => handleFinalStatusResult(),
                  // eslint-disable-next-line sonarjs/no-identical-functions
                  (transactionInfo) => async () => {
                    mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value, {
                      EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value,
                    });
                    handleFinalStatusResult(
                      transactionInfo.status,
                      transactionInfo.sendPaymentResultOutcome,
                      transactionInfo.gateway,
                      transactionInfo.errorCode
                    );
                  }
                )
              )(),
            // eslint-disable-next-line sonarjs/no-identical-functions
            (transactionInfo) => async () => {
              mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value, {
                EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value,
              });
              handleFinalStatusResult(
                transactionInfo.status,
                transactionInfo.sendPaymentResultOutcome,
                transactionInfo.gateway,
                transactionInfo.errorCode
              );
            }
          )
        )()
    )
  )();
};
