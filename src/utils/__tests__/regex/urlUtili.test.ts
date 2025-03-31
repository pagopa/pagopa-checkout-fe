import { ROUTE_FRAGMENT } from "../../../routes/models/routeModel";
import { getFragmentParameter, getUrlParameter } from "../../../utils/regex/urlUtilities";

describe("urlUtilities tests", () => {
  describe("getFragmentParameter function", () => {
    it("Should return the param value correctly", () => {
      expect(
        getFragmentParameter(
          "https://dev.checkout.it/gdi-check#gdiIframeUrl=aHR0cHM6Ly9nb29nbGUuaXQv",
          ROUTE_FRAGMENT.GDI_IFRAME_URL
        )
      ).toEqual("https://google.it/");

      expect(
        getFragmentParameter(
          "http://localhost:1234/v2/esito#outcome=0",
          ROUTE_FRAGMENT.OUTCOME,
          false
        )
      ).toEqual("0");
    });

    it("Should return an empty string when the url is not valid or the paramater cant't be found", () => {
      expect(
        getFragmentParameter(
          "https://dev.checkout.it/gdi-check#gdiIframeUrl=https://google.it/",
          "invalidParamName" as ROUTE_FRAGMENT
        )
      ).toEqual("");

      expect(
        getFragmentParameter(
          "https://dev.checkout.it/gdi-check",
          ROUTE_FRAGMENT.GDI_IFRAME_URL
        )
      ).toEqual("");

      expect(
        getFragmentParameter("invalidUrl", ROUTE_FRAGMENT.GDI_IFRAME_URL)
      ).toEqual("");
    });
  });

  describe("getUrlParameter function", () => {
    let originalLocationSearch: string;

    beforeEach(() => {
      originalLocationSearch = window.location.search;
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: {
          ...window.location,
          search: ''
        }
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: {
          ...window.location,
          search: originalLocationSearch
        }
      });
    });

    it("should return the correct parameter value from the URL", () => {
      Object.defineProperty(window.location, 'search', {
        writable: true,
        value: "?param1=value1&param2=value2&special[param]=special%20value"
      });
      
      expect(getUrlParameter("param1")).toBe("value1");
      expect(getUrlParameter("param2")).toBe("value2");
      expect(getUrlParameter("special[param]")).toBe("special value");
    });

    it("should return an empty string when the parameter doesn't exist", () => {
      Object.defineProperty(window.location, 'search', {
        writable: true,
        value: "?param1=value1&param2=value2"
      });
      
      expect(getUrlParameter("nonexistent")).toBe("");
    });

    it("should handle empty search string", () => {
      Object.defineProperty(window.location, 'search', {
        writable: true,
        value: ""
      });
      
      expect(getUrlParameter("param")).toBe("");
    });

    it("should handle URL with no parameters", () => {
      Object.defineProperty(window.location, 'search', {
        writable: true,
        value: "?"
      });
      
      expect(getUrlParameter("param")).toBe("");
    });
  });
});