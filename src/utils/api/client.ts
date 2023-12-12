import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { DeferredPromise } from "@pagopa/ts-commons//lib/promises";
import * as E from "fp-ts/Either";
import nodeFetch from "node-fetch";
import { pipe } from "fp-ts/function";
import { createClient as createEcommerceClient } from "../../../generated/definitions/payment-ecommerce/client";
import { createClient as createEcommerceClientV2 } from "../../../generated/definitions/payment-ecommerce-v2/client";
import { createClient as createTransactionsClient } from "../../../generated/definitions/payment-transactions-api/client";
import { createClient as createIOClient } from "../../../generated/definitions/payment-ecommerce-IO/client";
import { getConfigOrThrow } from "../config/config";
import {
  constantPollingWithPromisePredicateFetch,
  retryingFetch,
} from "../config/fetch";
import { TransactionInfo } from "../../../generated/definitions/payment-ecommerce/TransactionInfo";
import { EcommerceFinalStatusCodeEnumType } from "./transactions/TransactionResultUtil";

const config = getConfigOrThrow();

const retryConfig = {
  retries: 10,
  delay: 1000,
  timeout: config.CHECKOUT_API_TIMEOUT as Millisecond,
  maxRetries: 3,
};

const pollingConfig = {
  retries: 20,
  delay: 3000,
  timeout: config.CHECKOUT_API_TIMEOUT as Millisecond,
};

/**
 * Api client for payment transactions API
 */
export const apiPaymentTransactionsClient = createTransactionsClient({
  baseUrl: config.CHECKOUT_PAGOPA_APIM_HOST,
  basePath: config.CHECKOUT_API_PAYMENT_TRANSACTIONS_BASEPATH as string,
  fetchApi: retryingFetch(fetch, retryConfig.timeout, retryConfig.maxRetries),
});

/**
 * Api client for payment ecommerce API V1
 */
export const apiPaymentEcommerceClient = createEcommerceClient({
  baseUrl: config.CHECKOUT_ECOMMERCE_HOST,
  basePath: config.CHECKOUT_API_ECOMMERCE_BASEPATH as string,
  fetchApi: retryingFetch(fetch, retryConfig.timeout, retryConfig.maxRetries),
});

/**
 * Api client for payment ecommerce API V2
 */
export const apiPaymentEcommerceClientV2 = createEcommerceClientV2({
  baseUrl: config.CHECKOUT_ECOMMERCE_HOST,
  basePath: config.CHECKOUT_API_ECOMMERCE_BASEPATH_V2 as string,
  fetchApi: retryingFetch(fetch, retryConfig.timeout, retryConfig.maxRetries),
});

/**
 * Api client for ecommerce API calculate fee with retry execution
 */
export const apiPaymentEcommerceClientWithRetry = createEcommerceClient({
  baseUrl: config.CHECKOUT_ECOMMERCE_HOST,
  basePath: config.CHECKOUT_API_ECOMMERCE_BASEPATH as string,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    retryConfig.retries,
    retryConfig.delay,
    pollingConfig.timeout,
    async (r: Response): Promise<boolean> => r.status !== 200
  ),
});

const decodeFinalStatusResult = async (r: Response): Promise<boolean> => {
  const myJson = (await r.clone().json()) as TransactionInfo;
  return (
    r.status === 200 &&
    !pipe(EcommerceFinalStatusCodeEnumType.decode(myJson.status), E.isRight)
  );
};

export const ecommerceClientWithPolling = createEcommerceClient({
  baseUrl: config.CHECKOUT_ECOMMERCE_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    pollingConfig.retries,
    pollingConfig.delay,
    pollingConfig.timeout,
    decodeFinalStatusResult
  ),
  basePath: config.CHECKOUT_API_ECOMMERCE_BASEPATH,
});

export const ecommerceIOClientWithPolling = createIOClient({
  baseUrl: config.CHECKOUT_ECOMMERCE_HOST,
  fetchApi: constantPollingWithPromisePredicateFetch(
    DeferredPromise<boolean>().e1,
    pollingConfig.retries,
    pollingConfig.delay,
    pollingConfig.timeout,
    decodeFinalStatusResult
  ),
  basePath: "/ecommerce/io/v1",
});

export const ecommerceClientWithoutPolling = createEcommerceClient({
  baseUrl: config.CHECKOUT_ECOMMERCE_HOST,
  fetchApi: nodeFetch as any as typeof fetch,
  basePath: config.CHECKOUT_API_ECOMMERCE_BASEPATH,
});
