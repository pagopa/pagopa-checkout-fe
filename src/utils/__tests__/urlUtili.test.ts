import { getFragmentParameter } from "../../utils/regex/urlUtilities";

describe("getFragmentParameter function utility", () => {
  it("Should return the param value correctly", () => {
    expect(
      getFragmentParameter(
        "https://dev.checkout.it/gdi-check#gdiIframeUrl=https://google.it/",
        "gdiIframeUrl"
      )
    ).toEqual("https://google.it/");

    expect(
      getFragmentParameter(
        "https://dev.checkout.it/gdi-check#gdiIframeUrl=https%3A%2F%2Fgoogle.it%2F",
        "gdiIframeUrl"
      )
    ).toEqual("https://google.it/");
  });

  it("Should return an empty string when the url is not valid or the paramater cant't be found", () => {
    expect(
      getFragmentParameter(
        "https://dev.checkout.it/gdi-check#gdiIframeUrl=https://google.it/",
        "invalidParamName"
      )
    ).toEqual("");

    expect(
      getFragmentParameter("https://dev.checkout.it/gdi-check", "gdiIframeUrl")
    ).toEqual("");

    expect(getFragmentParameter("invalidUrl", "gdiIframeUrl")).toEqual("");
  });
});
