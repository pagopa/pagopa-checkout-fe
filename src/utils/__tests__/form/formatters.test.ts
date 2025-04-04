import { cleanSpaces, expireDateFormatter } from "../../form/formatters";
describe("expireDateFormatter", () => {
  it("should add leading zero if current month is single digit", () => {
    expect(expireDateFormatter("01", "3")).toBe("03");
  });

  it("should return formatted date if current month is a valid two-digit number", () => {
    expect(expireDateFormatter("01", "12")).toBe("12");
  });

  it("should return formatted date with slash if current is a single digit and greater than 1", () => {
    expect(expireDateFormatter("12", "5")).toBe("05");
  });

  it("should format date as MM/YY if current contains month and year", () => {
    expect(expireDateFormatter("12", "05/2023")).toBe("05/23");
  });

  it("should format date correctly if current length is 3 without slash", () => {
    expect(expireDateFormatter("12", "123")).toBe("12/3");
  });

  it("should return current if no specific formatting is needed", () => {
    expect(expireDateFormatter("12", "05")).toBe("05");
  });
});

describe("cleanSpaces", () => {
  it("should remove all spaces from the string", () => {
    expect(cleanSpaces("Hello World")).toBe("HelloWorld");
    expect(cleanSpaces("No spaces here")).toBe("Nospaceshere");
  });

  it("should return an empty string if the input is only spaces", () => {
    expect(cleanSpaces("     ")).toBe("");
  });

  it("should return the same string if no spaces are present", () => {
    expect(cleanSpaces("NoSpaces")).toBe("NoSpaces");
  });
});
