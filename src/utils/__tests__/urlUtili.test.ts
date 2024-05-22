import { ROUTE_FRAGMENT } from "../../routes/models/routeModel";
import {
  getFragmentParameter,
  isEcommerceFrontendRedirection,
} from "../../utils/regex/urlUtilities";

describe("getFragmentParameter function utility", () => {
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

  it("Should return true if the URL require ecommerce-fe redirection", () => {
    expect(
      isEcommerceFrontendRedirection(
        new URL("http://localhost:1234/ecommerce-fe/gdi-check#iframe=0")
      )
    ).toEqual(true);

    expect(
      isEcommerceFrontendRedirection(
        new URL("http://localhost:1234/v2/esito#outcome=0")
      )
    ).toEqual(false);
  });
});
