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
import {
  getSessionItem,
  setSessionItem,
  clearSessionItem,
  getAndClearSessionItem,
  isStateEmpty,
  clearStorage,
  clearStorageAndMaintainAuthData,
  getRptIdsFromSession,
  SessionItems,
} from "../../storage/sessionStorage";

describe("sessionStorage utils", () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  test("setSessionItem and getSessionItem for parsable item", () => {
    const item = { cf: "CF123", billCode: "001" };
    setSessionItem(SessionItems.noticeInfo, item);
    const result = getSessionItem(SessionItems.noticeInfo);
    expect(result).toEqual(item);
  });

  test("setSessionItem and getSessionItem for non-parsable item", () => {
    setSessionItem(SessionItems.useremail, "test@example.com");
    const result = getSessionItem(SessionItems.useremail);
    expect(result).toBe("test@example.com");
  });

  test("getAndClearSessionItem", () => {
    setSessionItem(SessionItems.useremail, "test@example.com");
    const result = getAndClearSessionItem(SessionItems.useremail);
    expect(result).toBe("test@example.com");
    expect(sessionStorage.getItem(SessionItems.useremail)).toBeNull();
  });

  test("clearSessionItem", () => {
    setSessionItem(SessionItems.useremail, "test@example.com");
    clearSessionItem(SessionItems.useremail);
    expect(sessionStorage.getItem(SessionItems.useremail)).toBeNull();
  });

  test("isStateEmpty returns true when not set", () => {
    expect(isStateEmpty(SessionItems.useremail)).toBe(true);
  });

  test("isStateEmpty returns false when set", () => {
    setSessionItem(SessionItems.useremail, "test@example.com");
    expect(isStateEmpty(SessionItems.useremail)).toBe(false);
  });

  test("clearStorage removes all items", () => {
    setSessionItem(SessionItems.useremail, "test@example.com");
    clearStorage();
    expect(sessionStorage.getItem(SessionItems.useremail)).toBeNull();
  });

  test("clearStorageAndMaintainAuthData keeps auth token and flags", () => {
    setSessionItem(SessionItems.authToken, "token123");
    setSessionItem(SessionItems.enableAuthentication, "true");
    setSessionItem(SessionItems.isScheduledMaintenanceBannerEnabled, "true");
    setSessionItem(SessionItems.useremail, "shouldClear");

    clearStorageAndMaintainAuthData();

    expect(getSessionItem(SessionItems.authToken)).toBe("token123");
    expect(getSessionItem(SessionItems.enableAuthentication)).toBe("true");
    expect(
      getSessionItem(SessionItems.isScheduledMaintenanceBannerEnabled)
    ).toBe("true");
    expect(getSessionItem(SessionItems.useremail)).toBeUndefined();
  });

  test("getRptIdsFromSession with cart", () => {
    const cartMock = {
      paymentNotices: [
        { fiscalCode: "123", noticeNumber: "456" },
        { fiscalCode: "789", noticeNumber: "000" },
      ],
    };
    setSessionItem(SessionItems.cart, cartMock);
    const result = getRptIdsFromSession();
    expect(result).toBe("123456,789000");
  });

  test("getRptIdsFromSession with noticeInfo", () => {
    const noticeInfo = { cf: "ABC", billCode: "123" };
    setSessionItem(SessionItems.noticeInfo, noticeInfo);
    const result = getRptIdsFromSession();
    expect(result).toBe("ABC123");
  });
});
