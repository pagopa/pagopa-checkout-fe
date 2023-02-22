import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { createClient as createEcommerceClient } from "../../../generated/definitions/payment-ecommerce/client";
import { createClient as createTransactionsClient } from "../../../generated/definitions/payment-transactions-api/client";
import { getConfigOrThrow } from "../config/config";
import { retryingFetch } from "../config/fetch";

const conf = getConfigOrThrow();

/**
 * Api client for payment transactions API
 */
export const apiPaymentTransactionsClient = createTransactionsClient({
  baseUrl: conf.CHECKOUT_PAGOPA_APIM_HOST,
  basePath: conf.CHECKOUT_API_PAYMENT_TRANSACTIONS_BASEPATH as string,
  fetchApi: retryingFetch(fetch, conf.CHECKOUT_API_TIMEOUT as Millisecond, 3),
});

/**
 * Api client for payment ecommerce API
 */
export const apiPaymentEcommerceClient = createEcommerceClient({
  baseUrl: conf.CHECKOUT_ECOMMERCE_HOST,
  basePath: conf.CHECKOUT_API_ECOMMERCE_BASEPATH as string,
  fetchApi: retryingFetch(fetch, conf.CHECKOUT_API_TIMEOUT as Millisecond, 3),
});
