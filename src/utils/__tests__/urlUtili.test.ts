import { ROUTE_FRAGMENT } from "../../routes/models/routeModel";
import { getFragmentParameter } from "../../utils/regex/urlUtilities";

describe("getFragmentParameter function utility", () => {
  it("Should return the param value correctly", () => {
    expect(
      getFragmentParameter(
        "https://dev.checkout.it/gdi-check#gdiIframeUrl=aHR0cHM6Ly9nb29nbGUuaXQv",
        ROUTE_FRAGMENT.GDI_IFRAME_URL
      )
    ).toEqual("https://google.it/");
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
