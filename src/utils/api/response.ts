/* eslint-disable functional/immutable-data */
/* eslint-disable no-bitwise */
/* eslint @typescript-eslint/no-var-requires: "off" */
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as O from "fp-ts/Option";
import * as T from "fp-ts/Task";
import { pipe } from "fp-ts/function";
import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import { Millisecond } from "@pagopa/ts-commons//lib/units";
import * as t from "io-ts";
import { TypeofApiResponse } from "@pagopa/ts-commons/lib/requests";
import { Validation } from "io-ts";
import { errorsToReadableMessages } from "@pagopa/ts-commons/lib/reporters";
import { createCounter } from "../../utils/counter";
import {
  THREEDSACSCHALLENGEURL_STEP2_RESP_ERR,
  THREEDSACSCHALLENGEURL_STEP2_SUCCESS,
  THREEDSMETHODURL_STEP1_RESP_ERR,
} from "../config/mixpanelDefs";
import { mixpanel } from "../config/mixpanelHelperInit";
import { constantPollingWithPromisePredicateFetch } from "../config/fetch";
import { getUrlParameter } from "../regex/urlUtilities";
import { getConfigOrThrow } from "../config/config";
import {
  getSessionItem,
  setSessionItem,
  clearSessionItem,
  SessionItems,
} from "../storage/sessionStorage";
import { ViewOutcomeEnum } from "../transactions/TransactionResultUtil";
import { NewTransactionResponse } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import {
  createClient as createEcommerceClientV1,
  Client as EcommerceClientV1,
} from "../../../generated/definitions/payment-ecommerce/client";
import { TransactionOutcomeInfo } from "../../../generated/definitions/payment-ecommerce/TransactionOutcomeInfo";
import { ProblemJson } from "../../../generated/definitions/payment-ecommerce/ProblemJson";
import { GetTransactionOutcomesT } from "../../../generated/definitions/payment-ecommerce/requestTypes";

const config = getConfigOrThrow();
const retries: number = config.CHECKOUT_API_RETRY_NUMBERS;
const delay: number = config.CHECKOUT_API_RETRY_DELAY;
const timeout: Millisecond = config.CHECKOUT_API_TIMEOUT as Millisecond;

const hexToUuid = require("hex-to-uuid");
export const decodeToUUID = (base64: string) => {
  const bytes = Buffer.from(base64, "base64");
  bytes[6] &= 0x0f;
  bytes[6] |= 0x40;
  bytes[8] &= 0x3f;
  bytes[8] |= 0x80;
  return hexToUuid(bytes.toString("hex")).replace(/-/g, "");
};

const outcomePollingCounter = createCounter();

// predicate function for the polling fetcher
const outcomePollingPredicate = async (r: Response): Promise<boolean> => {
  outcomePollingCounter.increment();
  const status = r.status;

  // TODO dylan remove debug log
  console.log(
    `Polling /outcomes attempt ${outcomePollingCounter.getValue()}, status: ${status}`
  );

  // if status it not 200, keep polling (true)
  if (status !== 200) {
    // check for max retries
    if (outcomePollingCounter.getValue() >= retries) {
      console.error(
        `Polling /outcomes (V1) reached max retries (${retries}) on non-200 status: ${status}. Stopping.`
      );
      outcomePollingCounter.reset();
      return false; // max retries reached, stop polling
    }
    // TODO dylan remove debug log
    console.log("Non-200 status, continuing polling...");
    return true; // keep polling
  }

  // status is 200, check the body
  try {
    // clone response to read body without touching the original resp
    const body = await r.clone().json();
    const decoded = TransactionOutcomeInfo.decode(body);

    if (E.isRight(decoded)) {
      // decoding successful, check if outcome is present
      const outcomeData = decoded.right;
      if (outcomeData.outcome !== undefined && outcomeData.outcome !== null) {
        // outcome is present, stop polling
        // TODO dylan remove
        console.log(
          `Outcome received (${outcomeData.outcome}). Stopping polling.`
        );
        outcomePollingCounter.reset();
        return false;
      } else {
        // outcome is missing (empty object {} case), keep polling
        if (outcomePollingCounter.getValue() >= retries) {
          console.error(
            `Polling /outcomes (V1) reached max retries (${retries}) while waiting for outcome field. Stopping.`
          );
          outcomePollingCounter.reset();
          return false;
        }
        // TODO dylan remove
        console.log("Status 200, but outcome missing. Continuing polling...");
        return true;
      }
    } else {
      // decode failed for 200 OK response, unexpected
      console.warn(
        `Polling /outcomes (V1) received 200 OK but failed to decode body: ${errorsToReadableMessages(
          decoded.left
        )}. Continuing polling.`
      );
      if (outcomePollingCounter.getValue() >= retries) {
        console.error(
          `Polling /outcomes (V1) reached max retries (${retries}) after body decode failure. Stopping.`
        );
        outcomePollingCounter.reset();
        return false;
      }
      return true; // keep polling, treating decode error as "not ready"
    }
  } catch (e) {
    // error reading response body (e.g., not valid JSON)
    console.warn(
      `Polling /outcomes (V1) received 200 OK but error reading body: ${e}. Continuing polling.`
    );
    if (outcomePollingCounter.getValue() >= retries) {
      console.error(
        `Polling /outcomes (V1) reached max retries (${retries}) after body read error. Stopping.`
      );
      outcomePollingCounter.reset();
      return false;
    }
    return true; // keep polling, treating read error as "not ready"
  }
};

const ecommerceV1OutcomeClientWithPolling: EcommerceClientV1 =
  createEcommerceClientV1({
    baseUrl: config.CHECKOUT_PAGOPA_APIM_HOST,
    basePath: config.CHECKOUT_API_ECOMMERCE_BASEPATH,
    fetchApi: constantPollingWithPromisePredicateFetch(
      DeferredPromise<boolean>().e1,
      retries,
      delay,
      timeout,
      outcomePollingPredicate
    ),
  });

// define a type for potential errors from polling
type PollingError = Error | ProblemJson | t.Errors;

// define the successful result structure
interface OutcomeResult {
  outcome: TransactionOutcomeInfo["outcome"];
  totalAmount: TransactionOutcomeInfo["totalAmount"];
}

/**
 * Calls the V1 getTransactionOutcomes endpoint using the configured polling client.
 * Assumes polling stops ONLY when the outcome is ready or retries are exhausted.
 * Returns the final outcome and potentially the total amount.
 */
const pollTransactionOutcomeV1 = (
  transactionId: string,
  bearerAuth: string,
  client: EcommerceClientV1 = ecommerceV1OutcomeClientWithPolling
): TE.TaskEither<PollingError, OutcomeResult> =>
  pipe(
    // execute the polling call
    TE.tryCatch(
      () =>
        client.getTransactionOutcomes({
          transactionId,
          bearerAuth,
        }),
      (error) =>
        new Error(
          `Polling Promise rejected: ${
            error instanceof Error ? error.message : String(error)
          }`
        ) as PollingError
    ),

    // handle potential validation errors
    TE.chainEitherKW(
      (
        validationResult: Validation<TypeofApiResponse<GetTransactionOutcomesT>>
      ) => E.mapLeft((errors) => errors as PollingError)(validationResult)
    ),

    // process the final ApiResponse after polling has stopped
    TE.chainEitherKW((response: TypeofApiResponse<GetTransactionOutcomesT>) => {
      if (response.status === 200) {
        // likely outcome was found -> decode final response.
        return pipe(
          TransactionOutcomeInfo.decode(response.value),
          E.mapLeft(
            (errors) =>
              new Error(
                `FINAL response decode failed: ${errorsToReadableMessages(
                  errors
                )}`
              ) as PollingError
          ),
          E.chainW((decodedInfo) => {
            // double check outcome is present inf the final resp
            if (
              decodedInfo.outcome === undefined ||
              decodedInfo.outcome === null
            ) {
              return E.left(
                new Error(
                  `Polling stopped but FINAL response missing outcome field!`
                ) as PollingError
              );
            }
            return E.right({
              outcome: decodedInfo.outcome,
              totalAmount: decodedInfo.totalAmount,
            } as OutcomeResult);
          })
        );
      } else {
        // non-200 status on last attempt OR retries maxed out.
        return pipe(
          ProblemJson.decode(response.value),
          E.fold(
            () =>
              E.left(
                new Error(
                  `Polling stopped on error status: ${response.status}, body not ProblemJson`
                ) as PollingError
              ),
            (problem) => E.left(problem as PollingError)
          )
        );
      }
    })
  );

/**
 * Main function orchestrating the polling process using the V1 /outcomes endpoint.
 * It determines the transaction ID, initiates polling which continues until an 'outcome'
 * is received from the backend or retries are exhausted.
 * Stores the final outcome string and amount (if applicable for success) in session storage.
 * Invokes the callback ONLY to signal completion (success or failure).
 *
 * @param onPollingComplete Callback function invoked once polling is finished, regardless of success or failure.
 */
export const callServices = async (
  onPollingComplete: () => void
): Promise<void> => {
  // retrieve transaction details from session storage
  const transaction = pipe(
    getSessionItem(SessionItems.transaction),
    NewTransactionResponse.decode,
    E.fold(
      () => undefined,
      (transaction) => transaction
    )
  );

  const transactionIdFromSession = pipe(
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

  // determine the definitive transaction id
  const transactionIdTask: T.Task<string> = pipe(
    getUrlParameter("id"),
    O.fromNullable,
    O.match(
      () => {
        if (transactionIdFromSession) {
          mixpanel.track(THREEDSMETHODURL_STEP1_RESP_ERR.value, {
            EVENT_ID: THREEDSMETHODURL_STEP1_RESP_ERR.value,
            TRANSACTION_ID: transactionIdFromSession,
          });
        }
        return T.of(transactionIdFromSession);
      },
      (idParam) => {
        mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value, {
          EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_RESP_ERR.value,
        });
        try {
          const decodedId = decodeToUUID(idParam);
          return T.of(decodedId);
        } catch (e) {
          console.error("Error decoding transactionId from URL parameter:", e);
          return T.of(transactionIdFromSession);
        }
      }
    )
  );

  // execute the polling logic
  await pipe(
    transactionIdTask,
    T.chain((transactionId) => {
      // pre polling check
      if (!transactionId || !bearerAuth) {
        console.error("Missing transactionId or bearerAuth for polling.");
        setSessionItem(SessionItems.outcome, ViewOutcomeEnum.GENERIC_ERROR);
        clearSessionItem(SessionItems.totalAmount);
        return T.fromIO(onPollingComplete);
      }

      return pipe(
        pollTransactionOutcomeV1(transactionId, bearerAuth), // call the polling function
        TE.fold(
          // failure case -> executes if pollTransactionOutcomeV1 returns Left<PollingError>
          (error) =>
            T.fromIO(() => {
              console.error("Polling V1 /outcomes failed:", error);
              const errorDetails =
                error instanceof Error ? error.message : JSON.stringify(error);
              mixpanel.track("CHECKOUT_POLLING_OUTCOME_ERROR", {
                EVENT_ID: "CHECKOUT_POLLING_OUTCOME_ERROR",
                TRANSACTION_ID: transactionId,
                error: errorDetails,
              });

              setSessionItem(
                SessionItems.outcome,
                ViewOutcomeEnum.GENERIC_ERROR
              );
              clearSessionItem(SessionItems.totalAmount);
              onPollingComplete();
            }),
          // success case -> executes if pollTransactionOutcomeV1 returns Right<OutcomeResult>
          (outcomeResult) =>
            T.fromIO(() => {
              mixpanel.track(THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value, {
                EVENT_ID: THREEDSACSCHALLENGEURL_STEP2_SUCCESS.value,
                TRANSACTION_ID: transactionId,
                OUTCOME: outcomeResult.outcome,
              });

              const finalOutcome = String(
                outcomeResult.outcome
              ) as ViewOutcomeEnum;

              if (Object.values(ViewOutcomeEnum).includes(finalOutcome)) {
                setSessionItem(SessionItems.outcome, finalOutcome);
                // store amount only if outcome is success and amount is present
                if (
                  finalOutcome === ViewOutcomeEnum.SUCCESS &&
                  outcomeResult.totalAmount !== undefined
                ) {
                  setSessionItem(
                    SessionItems.totalAmount,
                    outcomeResult.totalAmount
                  );
                } else {
                  // clear amount
                  clearSessionItem(SessionItems.totalAmount);
                }
              } else {
                console.error(
                  `Received unexpected outcome code from backend (V1): ${outcomeResult.outcome}`
                );
                setSessionItem(
                  SessionItems.outcome,
                  ViewOutcomeEnum.GENERIC_ERROR
                );
                clearSessionItem(SessionItems.totalAmount); // clear amount
              }
              onPollingComplete();
            })
        )
      );
    })
  )();
};
