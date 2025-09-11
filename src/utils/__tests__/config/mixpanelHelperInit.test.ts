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
      CHECKOUT_ENV: "PROD",
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
import mixpanelBrowser from "mixpanel-browser";
import { mixpanel } from "../../mixpanel/mixpanelHelperInit";

jest.mock("mixpanel-browser", () => {
  const track = jest.fn();
  const init = jest.fn();
  const reset = jest.fn();
  const get_distinct_id = jest.fn(() => "distinct-1");

  const defaultExport = {
    get_property: jest.fn(() => "device-1"),
    register: jest.fn(),
    reset,
    track,
    init,
  };

  return {
    __esModule: true,
    default: defaultExport,
    init,
    track,
    reset,
    get_distinct_id,
  };
});

describe("Mixpanel integration tests", () => {
  it("should call mixpanel.track with event name and properties in PROD environment", () => {
    mixpanel.track("test_event", { prop: "value" });

    expect(mixpanelBrowser.track).toHaveBeenCalledWith("test_event", {
      prop: "value",
    });
  });
});
