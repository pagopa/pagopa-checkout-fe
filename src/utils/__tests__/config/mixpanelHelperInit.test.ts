/* eslint-disable functional/immutable-data */
import mixpanelBrowser, { get_distinct_id } from "mixpanel-browser";
import { mixpanel } from "../../mixpanel/mixpanelHelperInit";
import { SessionItems } from "../../storage/sessionStorage";

Object.defineProperty(global, "window", {
  value: {
    _env_: {
      CHECKOUT_PM_HOST: "https://example.com",
      CHECKOUT_PM_API_BASEPATH: "/api",
      CHECKOUT_API_ECOMMERCE_BASEPATH: "/ecommerce",
      CHECKOUT_API_ECOMMERCE_BASEPATH_V2: "/ecommerce/v2",
      CHECKOUT_API_ECOMMERCE_BASEPATH_V3: "/ecommerce/v3",
      CHECKOUT_API_ECOMMERCE_BASEPATH_V4: "/ecommerce/v4",
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

jest.mock("../../config/config", () => ({
  __esModule: true,
  getConfigOrThrow: jest.fn(() => ({
    CHECKOUT_ENV: "PROD",
  })),
}));

jest.mock("../../storage/sessionStorage", () => {
  const key = "mixpanelInitialized";
  return {
    __esModule: true,
    SessionItems: { mixpanelInitialized: key },
    getSessionItem: (k: string) => sessionStorage.getItem(k),
    setSessionItem: (k: string, v: unknown) =>
      sessionStorage.setItem(k, String(v)),
  };
});

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
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it("should call mixpanel.track with event name and properties in PROD environment", () => {
    mixpanel.track("test_event", { prop: "value" });

    expect(mixpanelBrowser.track).toHaveBeenCalledWith("test_event", {
      prop: "value",
    });
  });

  it("should call mixpanelInit when isMixpanelReady is false", () => {
    (get_distinct_id as jest.Mock).mockImplementationOnce(() => {
      throw new Error("no distinct id");
    });

    mixpanel.track("init_event");

    expect(mixpanelBrowser.init).toHaveBeenCalled();
  });

  it("should reset and register old device_id in mixpanelInit", () => {
    sessionStorage.clear();

    (mixpanelBrowser.get_property as jest.Mock)
      .mockReturnValueOnce("device-1")
      .mockReturnValueOnce("device-2");

    mixpanel.track("device_event");

    expect(mixpanelBrowser.reset).toHaveBeenCalled();
    expect(mixpanelBrowser.register).toHaveBeenCalledWith({
      $device_id: "device-1",
    });
  });

  it("does NOT init when isMixpanelReady === true (distinct id present and flag 'true')", () => {
    (get_distinct_id as jest.Mock).mockReturnValueOnce("distinct-123");
    sessionStorage.setItem(SessionItems.mixpanelInitialized, "true");

    mixpanel.track("ready_event");

    expect(mixpanelBrowser.init).not.toHaveBeenCalled();
    expect(mixpanelBrowser.track).toHaveBeenCalledWith("ready_event", {});
  });

  it("calls init when distinct id is empty string (hasDistinctId === false)", () => {
    (get_distinct_id as jest.Mock).mockReturnValueOnce("");
    sessionStorage.setItem(SessionItems.mixpanelInitialized, "true");

    mixpanel.track("empty_distinct");

    expect(mixpanelBrowser.init).toHaveBeenCalled();
  });

  it("calls init when mixpanelInitialized flag is not 'true'", () => {
    (get_distinct_id as jest.Mock).mockReturnValueOnce("distinct-123");

    mixpanel.track("no_flag_event");

    expect(mixpanelBrowser.init).toHaveBeenCalled();
  });
});
