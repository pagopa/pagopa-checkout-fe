/**
 * This module exports an instance of fetch augmented with
 * timeout and retries with exponential backoff.
 */
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { calculateExponentialBackoffInterval } from "@pagopa/ts-commons/lib/backoff";
import {
  AbortableFetch,
  retriableFetch,
  setFetchTimeout,
  toFetch,
} from "@pagopa/ts-commons/lib/fetch";
import {
  RetriableTask,
  TransientError,
  withRetries,
} from "@pagopa/ts-commons/lib/tasks";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { getConfigOrThrow } from "./config";

//
// Returns a fetch wrapped with timeout and retry logic
//
const API_TIMEOUT = getConfigOrThrow().CHECKOUT_API_TIMEOUT as Millisecond;
const RETRY_NUMBERS_LINEAR = getConfigOrThrow()
  .CHECKOUT_API_RETRY_NUMBERS_LINEAR as number;

export function retryingFetch(
  fetchApi: typeof fetch,
  timeout: Millisecond = API_TIMEOUT,
  maxRetries: number = 3,
  retryCondition?: (r: Response) => boolean
): typeof fetch {
  // a fetch that can be aborted and that gets cancelled after fetchTimeoutMs
  const abortableFetch = AbortableFetch(fetchApi);
  const timeoutFetch = toFetch(setFetchTimeout(timeout, abortableFetch));
  // configure retry logic with default exponential backoff
  // @see https://github.com/pagopa/io-ts-commons/blob/master/src/backoff.ts
  const exponentialBackoff = calculateExponentialBackoffInterval();
  const retryLogic = withRetries<Error, Response>(
    maxRetries,
    exponentialBackoff
  );
  const retryWithTransient = retryLogicForTransientResponseError(
    retryCondition != null ? retryCondition : (_: Response) => _.status === 429,
    retryLogic
  );
  return retriableFetch(retryWithTransient)(timeoutFetch as any);
}

//
// Fetch with transient error handling. Handle error that occurs once or at unpredictable intervals.
//
function retryLogicForTransientResponseError(
  p: (r: Response) => boolean,
  retryLogic: (
    t: RetriableTask<Error, Response>,
    shouldAbort?: Promise<boolean>
  ) => TE.TaskEither<Error | "max-retries" | "retry-aborted", Response>
): typeof retryLogic {
  return (t: RetriableTask<Error, Response>, shouldAbort?: Promise<boolean>) =>
    retryLogic(
      // when the result of the task is a Response that satisfies
      // the predicate p, map it to a transient error
      pipe(
        t,
        TE.chain((r: Response) =>
          TE.fromEither(p(r) ? E.left(TransientError) : E.right(r))
        )
      ),
      shouldAbort
    );
}

//
// Given predicate that return a boolean promise, fetch with transient error handling.
// Handle error that occurs once or at unpredictable intervals.
//
function retryLogicOnPromisePredicate(
  p: (r: Response) => Promise<boolean>,
  retryLogic: (
    t: RetriableTask<Error, Response>,
    shouldAbort?: Promise<boolean>
  ) => TE.TaskEither<Error | "max-retries" | "retry-aborted", Response>
): typeof retryLogic {
  return (t: RetriableTask<Error, Response>, shouldAbort?: Promise<boolean>) =>
    retryLogic(
      pipe(
        t,
        TE.chain((r: Response) =>
          pipe(
            TE.tryCatch(
              () => p(r),
              () => TransientError
            ),
            TE.chain<Error | TransientError, boolean, Response>((d) =>
              TE.fromEither(d ? E.left(TransientError) : E.right(r))
            )
          )
        )
      ),
      shouldAbort
    );
}

// This is a fetch with timeouts, constant backoff and with the logic
// that handles 404s as transient errors, this "fetch" must be passed to
// createFetchRequestForApi when creating "getPaymentId"

export const constantPollingWithPromisePredicateFetch = (
  shouldAbort: Promise<boolean>,
  retries: number,
  delay: number,
  timeout: Millisecond = API_TIMEOUT,
  condition: (r: Response) => Promise<boolean>
) => {
  // fetch client that can be aborted for timeout
  const abortableFetch = AbortableFetch((global as any).fetch);
  const timeoutFetch = toFetch(setFetchTimeout(timeout, abortableFetch));

  // use a constant backoff
  const constantBackoff = () => delay as Millisecond;
  const retryLogic = withRetries<Error, Response>(retries, constantBackoff);

  // use to define transient errors
  const retryWithPromisePredicate = retryLogicOnPromisePredicate(
    condition,
    retryLogic
  );

  return retriableFetch(
    retryWithPromisePredicate,
    shouldAbort
  )(timeoutFetch as any);
};

export const exponetialPollingWithPromisePredicateFetch = (
  shouldAbort: Promise<boolean>,
  retries: number,
  delay: number,
  timeout: Millisecond = API_TIMEOUT,
  condition: (r: Response) => Promise<boolean>
) => {
  // fetch client that can be aborted for timeout
  const abortableFetch = AbortableFetch((global as any).fetch);
  const timeoutFetch = toFetch(setFetchTimeout(timeout, abortableFetch));

  // use a exponetial backoff
  /* eslint-disable functional/no-let */
  const variableBackoff = (attempt: number): Millisecond => {
    const totalAttempts = attempt + 1;
    if (totalAttempts <= RETRY_NUMBERS_LINEAR) {
      return delay as Millisecond;
    }

    const multiplier = totalAttempts - RETRY_NUMBERS_LINEAR + 1;
    return (delay * multiplier) as Millisecond;
  };
  const retryLogic = withRetries<Error, Response>(retries, variableBackoff);

  // use to define transient errors
  const retryWithPromisePredicate = retryLogicOnPromisePredicate(
    condition,
    retryLogic
  );

  return retriableFetch(
    retryWithPromisePredicate,
    shouldAbort
  )(timeoutFetch as any);
};
