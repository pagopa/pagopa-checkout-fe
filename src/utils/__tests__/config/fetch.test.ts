/* eslint-disable functional/immutable-data */
Object.defineProperty(global, "window", {
  value: {
    _env_: {
      CHECKOUT_PM_HOST: "https://example.com",
      CHECKOUT_PM_API_BASEPATH: "/api",
      CHECKOUT_API_ECOMMERCE_BASEPATH: "/ecommerce",
      CHECKOUT_API_ECOMMERCE_BASEPATH_V2: "/ecommerce/v2",
      CHECKOUT_API_ECOMMERCE_BASEPATH_V3: "/ecommerce/v3",
      CHECKOUT_API_FEATURE_FLAGS_BASEPATH: "/features",
      CHECKOUT_API_TIMEOUT: "5000",
      CHECKOUT_ENV: "test",
      CHECKOUT_PAGOPA_APIM_HOST: "https://pagopa.com",
      CHECKOUT_PAGOPA_ASSETS_CDN: "https://cdn.pagopa.com/assets",
      CHECKOUT_PAGOPA_LOGOS_CDN: "https://cdn.pagopa.com/logos",
      CHECKOUT_API_PAYMENT_ACTIVATIONS_BASEPATH: "/activations",
      CHECKOUT_API_PAYMENT_TRANSACTIONS_BASEPATH: "/transactions",
      CHECKOUT_POLLING_ACTIVATION_INTERVAL: "2000",
      CHECKOUT_POLLING_ACTIVATION_ATTEMPTS: "3",
      CHECKOUT_RECAPTCHA_SITE_KEY: "recaptcha-key",
      CHECKOUT_DONATIONS_URL: "https://donations.com",
      CHECKOUT_SURVEY_SHOW: "1",
      CHECKOUT_NPG_SDK_URL: "https://sdk.npg.com",
      CHECKOUT_API_RETRY_NUMBERS: "10",
      CHECKOUT_API_RETRY_DELAY: "2000",
      CHECKOUT_GDI_CHECK_TIMEOUT: "5000",
      CHECKOUT_API_AUTH_SERVICE_BASEPATH_V1: "/auth",
    },
  },
  writable: true,
});

import { Millisecond } from "@pagopa/ts-commons/lib/units";
import {
  constantPollingWithPromisePredicateFetch,
  retryingFetch,
} from "../../config/fetch";

describe("retryingFetch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  jest.setTimeout(20000);

  const mockResponse429 = {
    json: jest.fn().mockResolvedValue({}),
    status: 429,
  };
  const mockResponse200 = {
    json: jest.fn().mockResolvedValue({}),
    status: 200,
  };

  const mockResponse503 = {
    json: jest.fn().mockResolvedValue({}),
    status: 503,
  };

  it("should return a successful response without retries", async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse200);

    const fetchWithRetry = retryingFetch(fetch);
    const response = await fetchWithRetry("https://api.example.com");

    expect(response.status).toBe(200);
  });

  it("should retry on 429 responses", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockResponse429)
      .mockResolvedValueOnce(mockResponse429)
      .mockResolvedValueOnce(mockResponse200);

    const fetchWithRetry = retryingFetch(fetch, 1000 as Millisecond, 3);
    const response = await fetchWithRetry("https://api.example.com");

    expect(response.status).toBe(200);
  });

  it("should return an error after max retries", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce(mockResponse429);

    const fetchWithRetry = retryingFetch(fetch, 1000 as Millisecond, 2);

    await expect(fetchWithRetry("https://api.example.com")).rejects.toThrow();
  });

  it("should return a 503 response without retries", async () => {
    global.fetch = jest.fn().mockResolvedValue(mockResponse503);

    const fetchWithRetry = retryingFetch(fetch);
    const response = await fetchWithRetry("https://api.example.com");

    expect(response.status).toBe(503);
  });

  it("should use custom retryCondition", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockResponse503) // status != 429
      .mockResolvedValueOnce(mockResponse200);

    const customRetryCondition = (res: Response) => res.status === 503;

    const fetchWithRetry = retryingFetch(
      global.fetch,
      1000 as Millisecond,
      2,
      customRetryCondition
    );
    const response = await fetchWithRetry("https://api.example.com");

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("should use constantPollingWithPromisePredicateFetch and retry", async () => {
    const condition = jest
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValue(false);

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(mockResponse503)
      .mockResolvedValueOnce(mockResponse200);

    const shouldAbort = Promise.resolve(false);

    const fetchWithRetry = constantPollingWithPromisePredicateFetch(
      shouldAbort,
      2,
      1000,
      1000 as Millisecond,
      condition
    );

    const response = await fetchWithRetry("https://api.example.com");

    expect(response.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(condition).toHaveBeenCalledTimes(2);
  });
});
