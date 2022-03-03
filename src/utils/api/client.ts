import { agent } from "@pagopa/ts-commons";
import {
  AbortableFetch,
  setFetchTimeout,
  toFetch,
} from "@pagopa/ts-commons/lib/fetch";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { createClient } from "../../../generated/definitions/payment-transactions-api/client";
import { createClient as createPmClient } from "../../../generated/definitions/payment-manager-api/client";
import { createClient as createTransactionsClient } from "../../../generated/definitions/payment-transactions-api/client";
import { getConfigOrThrow } from "../config/config";
import { retryingFetch } from "../config/fetch";

const conf = getConfigOrThrow();

// Must be an https endpoint so we use an https agent
const abortableFetch = AbortableFetch(agent.getHttpFetch(process.env));
const fetchWithTimeout = toFetch(
  setFetchTimeout(conf.CHECKOUT_API_TIMEOUT as Millisecond, abortableFetch)
);
// tslint:disable-next-line: no-any
const fetchApi: typeof fetchWithTimeout =
  fetch as any as typeof fetchWithTimeout;

/**
 * Api client for payment activations API
 */
export const apiPaymentActivationsClient = createClient({
  baseUrl: conf.CHECKOUT_PAGOPA_APIM_HOST,
  basePath: conf.CHECKOUT_API_PAYMENT_ACTIVATIONS_BASEPATH as string,
  fetchApi,
});

export type APIClient = typeof apiPaymentActivationsClient;

/**
 * Api client for Payment Manager API
 */
export const pmClient = createPmClient({
  baseUrl: conf.CHECKOUT_PM_HOST,
  basePath: conf.CHECKOUT_PM_API_BASEPATH,
  fetchApi: retryingFetch(fetch, conf.CHECKOUT_API_TIMEOUT as Millisecond, 3),
});

/**
 * Api client for payment transactions API
 */
export const apiPaymentTransactionsClient = createTransactionsClient({
  baseUrl: conf.CHECKOUT_PAGOPA_APIM_HOST,
  basePath: conf.CHECKOUT_API_PAYMENT_ACTIVATIONS_BASEPATH as string,
  fetchApi: retryingFetch(fetch, conf.CHECKOUT_API_TIMEOUT as Millisecond, 3),
});
