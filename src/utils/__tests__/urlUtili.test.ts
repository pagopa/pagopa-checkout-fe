import { ROUTE_FRAGMENT } from "../../routes/models/routeModel";
import { getFragmentParameter } from "../../utils/regex/urlUtilities";

describe("getFragmentParameter function utility", () => {
  it("Should return the param value correctly", () => {
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
        "http://localhost:1234/v2/esito#outcome=0",
        "invalidParamName" as ROUTE_FRAGMENT
      )
    ).toEqual("");

    expect(
      getFragmentParameter(
        "http://localhost:1234/v2/esito",
        ROUTE_FRAGMENT.OUTCOME
      )
    ).toEqual("");

    expect(getFragmentParameter("invalidUrl", ROUTE_FRAGMENT.OUTCOME)).toEqual(
      ""
    );
  });
});
