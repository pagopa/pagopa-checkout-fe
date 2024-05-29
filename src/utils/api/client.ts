import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import { createClient as createEcommerceClient } from "../../../generated/definitions/payment-ecommerce/client";
import { createClient as createEcommerceClientV2 } from "../../../generated/definitions/payment-ecommerce-v2/client";
import { createClient as createTransactionsClient } from "../../../generated/definitions/payment-transactions-api/client";
import { getConfigOrThrow } from "../config/config";
import {
  constantPollingWithPromisePredicateFetch,
  retryingFetch,
} from "../config/fetch";

const conf = getConfigOrThrow();
const retries: number = 10;
const delay: number = 1000;

/**
 * Api client for payment transactions API
 */
export const apiPaymentTransactionsClient = createTransactionsClient({
  baseUrl: conf.CHECKOUT_PAGOPA_APIM_HOST,
  basePath: conf.CHECKOUT_API_PAYMENT_TRANSACTIONS_BASEPATH as string,
  fetchApi: retryingFetch(fetch, conf.CHECKOUT_API_TIMEOUT as Millisecond, 3),
});

/**
 * Api client for payment ecommerce API V1
 */
export const apiPaymentEcommerceClient = createEcommerceClient({
  baseUrl: conf.CHECKOUT_ECOMMERCE_HOST,
  basePath: conf.CHECKOUT_API_ECOMMERCE_BASEPATH as string,
  fetchApi: retryingFetch(fetch, conf.CHECKOUT_API_TIMEOUT as Millisecond, 3),
});

/**
 * Api client for payment ecommerce API V2
 */
export const apiPaymentEcommerceClientV2 = createEcommerceClientV2({
  baseUrl: conf.CHECKOUT_ECOMMERCE_HOST,
  basePath: conf.CHECKOUT_API_ECOMMERCE_BASEPATH_V2 as string,
  fetchApi: retryingFetch(fetch, conf.CHECKOUT_API_TIMEOUT as Millisecond, 3),
});

/**
 * Api client for ecommerce API calculate fee with retry execution
 */
export const apiPaymentEcommerceClientWithRetry = createEcommerceClient({
  baseUrl: conf.CHECKOUT_ECOMMERCE_HOST,
  basePath: conf.CHECKOUT_API_ECOMMERCE_BASEPATH as string,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    conf.CHECKOUT_API_TIMEOUT as Millisecond,
    async (r: Response): Promise<boolean> => r.status > 499
  ),
});

/**
 * Api client for ecommerce API calculate fee with retry execution
 */
export const apiPaymentEcommerceClientWithRetryV2 = createEcommerceClientV2({
  baseUrl: conf.CHECKOUT_ECOMMERCE_HOST,
  basePath: conf.CHECKOUT_API_ECOMMERCE_BASEPATH_V2 as string,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retries,
    delay,
    conf.CHECKOUT_API_TIMEOUT as Millisecond,
    async (r: Response): Promise<boolean> => r.status > 499
  ),
});
