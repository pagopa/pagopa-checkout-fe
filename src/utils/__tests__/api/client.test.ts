describe("API Clients", () => {
  const mockConfig = {
    CHECKOUT_PAGOPA_APIM_HOST: "https://mock-host",
    CHECKOUT_API_ECOMMERCE_BASEPATH: "/v1",
    CHECKOUT_API_ECOMMERCE_BASEPATH_V2: "/v2",
    CHECKOUT_API_ECOMMERCE_BASEPATH_V3: "/v3",
    CHECKOUT_API_FEATURE_FLAGS_BASEPATH: "/feature-flags",
    CHECKOUT_API_AUTH_SERVICE_BASEPATH_V1: "/auth-service",
    CHECKOUT_API_TIMEOUT: 5000,
  };

  jest.mock("../../config/config", () => ({
    getConfigOrThrow: jest.fn(() => mockConfig),
  }));

  jest.mock("../../config/fetch", () => ({
    retryingFetch: jest.fn((_) => jest.fn()),
    exponetialPollingWithPromisePredicateFetch: jest.fn((_) => jest.fn()),
    constantPollingWithPromisePredicateFetch: jest.fn((_) => jest.fn()),
    e: jest.fn((_) => jest.fn()),
  }));

  /* eslint-disable functional/immutable-data */
  global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({}),
    status: 200,
  });
  /* eslint-disable @typescript-eslint/no-var-requires */
  const {
    apiPaymentEcommerceClient,
    apiPaymentEcommerceClientV2,
    apiPaymentEcommerceClientV3,
    apiCheckoutFeatureFlags,
    apiPaymentEcommerceClientWithRetry,
    apiPaymentEcommerceClientWithRetryV2,
    apiPaymentEcommerceClientWithRetryV3,
    apiCheckoutAuthServiceClientV1,
    apiCheckoutAuthServiceClientAuthTokenV1,
    apiCheckoutAuthServiceWithRetryV1,
  } = require("../../api/client");

  it("should create apiPaymentEcommerceClient with correct configuration", () => {
    expect(apiPaymentEcommerceClient).toBeDefined();
  });

  it("should create apiPaymentEcommerceClientV2 with correct configuration", () => {
    expect(apiPaymentEcommerceClientV2).toBeDefined();
  });

  it("should create apiPaymentEcommerceClientV3 with correct configuration", () => {
    expect(apiPaymentEcommerceClientV3).toBeDefined();
  });

  it("should create apiCheckoutFeatureFlags with correct configuration", () => {
    expect(apiCheckoutFeatureFlags).toBeDefined();
  });

  it("should create apiPaymentEcommerceClientWithRetry with correct configuration", () => {
    expect(apiPaymentEcommerceClientWithRetry).toBeDefined();
  });

  it("should create apiPaymentEcommerceClientWithRetryV2 with correct configuration", () => {
    expect(apiPaymentEcommerceClientWithRetryV2).toBeDefined();
  });

  it("should create apiPaymentEcommerceClientWithRetryV3 with correct configuration", () => {
    expect(apiPaymentEcommerceClientWithRetryV3).toBeDefined();
  });

  it("should create apiCheckoutAuthServiceClientV1 with correct configuration", () => {
    expect(apiCheckoutAuthServiceClientV1).toBeDefined();
  });

  it("should create apiCheckoutAuthServiceClientAuthTokenV1 with correct configuration", () => {
    expect(apiCheckoutAuthServiceClientAuthTokenV1).toBeDefined();
  });

  it("should create apiCheckoutAuthServiceWithRetryV1 with correct configuration", () => {
    expect(apiCheckoutAuthServiceWithRetryV1).toBeDefined();
  });
});
