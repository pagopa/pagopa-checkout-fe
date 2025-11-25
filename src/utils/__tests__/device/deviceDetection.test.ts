import {
  isSafari,
  getUserDevice,
  UserDeviceValues,
} from "../../device/deviceDetection";

describe("deviceDetection", () => {
  const originalUserAgent = window.navigator.userAgent;

  const mockUserAgent = (ua: string) => {
    Object.defineProperty(window.navigator, "userAgent", {
      value: ua,
      configurable: true,
      writable: true,
    });
  };

  const mockWindowUndefined = () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;
    return () => {
      global.window = originalWindow;
    };
  };

  afterEach(() => {
    mockUserAgent(originalUserAgent);
  });

  describe("isSafari", () => {
    it("Should return false if window is undefined", () => {
      const restoreWindow = mockWindowUndefined();
      expect(isSafari()).toBe(false);
      restoreWindow();
    });

    it("Should return false if navigator.userAgent is missing", () => {
      Object.defineProperty(window.navigator, "userAgent", {
        value: undefined,
        configurable: true,
      });
      expect(isSafari()).toBe(false);
    });

    it("Should return true for a standard Safari user agent", () => {
      // Contains "safari", does NOT contain "chrome" or "crios"
      mockUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15"
      );
      expect(isSafari()).toBe(true);
    });

    it("Should return false for Chrome (which contains 'safari' string)", () => {
      // Contains "safari" AND "chrome"
      mockUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      expect(isSafari()).toBe(false);
    });

    it("Should return false for Chrome on iOS (CriOS)", () => {
      // Contains "safari" AND "crios"
      mockUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/91.0.4472.80 Mobile/15E148 Safari/604.1"
      );
      expect(isSafari()).toBe(false);
    });

    it("Should return false for Firefox (no 'safari' string)", () => {
      mockUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0"
      );
      expect(isSafari()).toBe(false);
    });
  });

  describe("getUserDevice", () => {
    it("Should return IOS when clientId is IO and platform is IOS", () => {
      const result = getUserDevice("IO", "IOS");
      expect(result).toBe(UserDeviceValues.IOS);
    });

    it("Should return ANDROID when clientId is IO and platform is ANDROID", () => {
      const result = getUserDevice("IO", "ANDROID");
      expect(result).toBe(UserDeviceValues.ANDROID);
    });

    it("Should return SAFARI when clientId is CHECKOUT and browser is Safari", () => {
      mockUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15"
      );
      const result = getUserDevice("CHECKOUT");
      expect(result).toBe(UserDeviceValues.SAFARI);
    });

    it("Should return WEB when clientId is CHECKOUT and browser is Chrome", () => {
      mockUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      );
      const result = getUserDevice("CHECKOUT");
      expect(result).toBe(UserDeviceValues.WEB);
    });

    it("Should return WEB when clientId is CHECKOUT_CART and browser is not Safari", () => {
      mockUserAgent("Firefox");
      const result = getUserDevice("CHECKOUT_CART");
      expect(result).toBe(UserDeviceValues.WEB);
    });

    it("Should return WEB when clientId is undefined (default web behavior)", () => {
      mockUserAgent("Chrome");
      const result = getUserDevice(undefined);
      expect(result).toBe(UserDeviceValues.WEB);
    });

    // undefined/fallback tests
    it("Should return undefined when clientId is IO but no platform is provided", () => {
      const result = getUserDevice("IO", undefined);
      expect(result).toBeUndefined();
    });

    it("Should return undefined for unknown clientIds", () => {
      // "UNKNOWN" doesn't match IO (with params) or CHECKOUT logic
      const result = getUserDevice("UNKNOWN_CLIENT");
      expect(result).toBeUndefined();
    });
  });
});