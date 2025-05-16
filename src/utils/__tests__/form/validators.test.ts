import { expirationDateChangeValidation } from "../../form/validators";
import { digitValidation } from "../../regex/validators";

jest.mock("../../regex/validators", () => ({
  digitValidation: jest.fn(),
}));

describe("expirationDateChangeValidation", () => {
  it("should return true if value is empty", () => {
    expect(expirationDateChangeValidation("")).toBe(true);
  });

  it("should return false if value length is 1 and not a valid digit", () => {
    (digitValidation as jest.Mock).mockReturnValue(false);
    expect(expirationDateChangeValidation("a")).toBe(false);
  });

  it("should return false if value length is 2 and starts with '0/'", () => {
    expect(expirationDateChangeValidation("0/")).toBe(false);
  });

  it("should return true for valid date format greater than 3 characters", () => {
    expect(expirationDateChangeValidation("12/2025")).toBe(true);
  });

  it("should return false for invalid date format with 2 slashes", () => {
    expect(expirationDateChangeValidation("12//25")).toBe(false);
  });

  it("should return true if value is a valid date without slash", () => {
    (digitValidation as jest.Mock).mockReturnValue(true);
    expect(expirationDateChangeValidation("123")).toBe(true);
  });

  it("should return true for valid expiration date with slash", () => {
    expect(expirationDateChangeValidation("12/25")).toBe(true);
  });
});
