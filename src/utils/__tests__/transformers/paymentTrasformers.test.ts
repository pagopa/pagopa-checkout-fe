import { paymentSubjectTransform } from "../../transformers/paymentTransformers";

describe("paymentSubjectTransform", () => {
  it("should return the part after /TXT/ if present", () => {
    const input = "SOMETHING/TXT/REAL SUBJECT";
    const result = paymentSubjectTransform(input);
    expect(result).toBe("REAL SUBJECT");
  });

  it("should return the original subject if /TXT/ is not present", () => {
    const input = "SOMETHING WITHOUT TXT";
    const result = paymentSubjectTransform(input);
    expect(result).toBe(input);
  });

  it("should return null if subject is null", () => {
    const result = paymentSubjectTransform(null);
    expect(result).toBeNull();
  });

  it("should return undefined if subject is undefined", () => {
    const result = paymentSubjectTransform(undefined);
    expect(result).toBeUndefined();
  });
});
