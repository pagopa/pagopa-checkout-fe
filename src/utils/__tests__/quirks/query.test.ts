import { sanitizeSearchParams } from "../../quirks/query";

describe("Querystring quirks", () => {
  it("should leave empty search params intact", () => {
    const validSearchParams = new URLSearchParams();
    expect(sanitizeSearchParams("?" + validSearchParams.toString())).toEqual(
      validSearchParams
    );
  });

  it("should leave valid search params intact", () => {
    const validSearchParams = new URLSearchParams({ a: "b", c: "d" });
    expect(sanitizeSearchParams("?" + validSearchParams.toString())).toEqual(
      validSearchParams
    );
  });

  it("should recover search params with question mark instead of ampersand", () => {
    const malformedSearchParams = "?foo=bar&quux=jk?aa=bb&cc=dd?ee=ff";
    const recoveredSearchParams = new URLSearchParams({
      foo: "bar",
      quux: "jk",
      aa: "bb",
      cc: "dd",
      ee: "ff",
    });
    expect(sanitizeSearchParams(malformedSearchParams)).toEqual(
      recoveredSearchParams
    );
  });
});
