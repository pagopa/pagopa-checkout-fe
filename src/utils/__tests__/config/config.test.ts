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

import * as E from "fp-ts/Either";
import { getConfig, getConfigOrThrow } from "../../config/config";

describe("Config Module", () => {
  it("should return a valid configuration when environment variables are set correctly", () => {
    const result = getConfig();
    expect(E.isRight(result)).toBe(true);
  });

  it("should correctly parse numerical and boolean values", () => {
    const config = getConfigOrThrow();
    expect(config.CHECKOUT_API_TIMEOUT).toBe(5000);
    expect(config.CHECKOUT_POLLING_ACTIVATION_INTERVAL).toBe(2000);
    expect(config.CHECKOUT_POLLING_ACTIVATION_ATTEMPTS).toBe(3);
    expect(config.CHECKOUT_SURVEY_SHOW).toBe(true);
    expect(config.CHECKOUT_API_RETRY_NUMBERS).toBe(10);
    expect(config.CHECKOUT_PM_API_BASEPATH).toBe("/api");
    expect(config.CHECKOUT_API_ECOMMERCE_BASEPATH).toBe("/ecommerce");
    expect(config.CHECKOUT_API_ECOMMERCE_BASEPATH_V2).toBe("/ecommerce/v2");
    expect(config.CHECKOUT_API_ECOMMERCE_BASEPATH_V3).toBe("/ecommerce/v3");
    expect(config.CHECKOUT_API_FEATURE_FLAGS_BASEPATH).toBe("/features");
    expect(config.CHECKOUT_API_TIMEOUT).toBe(5000);
    expect(config.CHECKOUT_ENV).toBe("test");
    expect(config.CHECKOUT_PAGOPA_APIM_HOST).toBe("https://pagopa.com");
    expect(config.CHECKOUT_PAGOPA_ASSETS_CDN).toBe(
      "https://cdn.pagopa.com/assets"
    );
    expect(config.CHECKOUT_PAGOPA_LOGOS_CDN).toBe(
      "https://cdn.pagopa.com/logos"
    );
    expect(config.CHECKOUT_API_PAYMENT_ACTIVATIONS_BASEPATH).toBe(
      "/activations"
    );
    expect(config.CHECKOUT_API_PAYMENT_TRANSACTIONS_BASEPATH).toBe(
      "/transactions"
    );
    expect(config.CHECKOUT_POLLING_ACTIVATION_INTERVAL).toBe(2000);
    expect(config.CHECKOUT_POLLING_ACTIVATION_ATTEMPTS).toBe(3);
    expect(config.CHECKOUT_RECAPTCHA_SITE_KEY).toBe("recaptcha-key");
    expect(config.CHECKOUT_DONATIONS_URL).toBe("https://donations.com");
    expect(config.CHECKOUT_SURVEY_SHOW).toBe(true);
    expect(config.CHECKOUT_NPG_SDK_URL).toBe("https://sdk.npg.com");
    expect(config.CHECKOUT_API_RETRY_DELAY).toBe(2000);
    expect(config.CHECKOUT_GDI_CHECK_TIMEOUT).toBe(5000);
    expect(config.CHECKOUT_API_AUTH_SERVICE_BASEPATH_V1).toBe("/auth");
  });
});
