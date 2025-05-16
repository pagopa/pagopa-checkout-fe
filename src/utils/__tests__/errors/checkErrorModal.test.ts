import { ErrorsType } from "../../errors/checkErrorsModel";

describe("ErrorsType enum", () => {
  it("should have the correct values for all enum members", () => {
    expect(ErrorsType.UNAUTHORIZED).toBe("UNAUTHORIZED");
    expect(ErrorsType.CONNECTION).toBe("CONNECTION");
    expect(ErrorsType.SERVER).toBe("SERVER");
    expect(ErrorsType.GENERIC_ERROR).toBe("GENERIC_ERROR");
    expect(ErrorsType.AUTH_ERROR).toBe("AUTH_ERROR");
    expect(ErrorsType.INVALID_DATA).toBe("INVALID_DATA");
    expect(ErrorsType.TIMEOUT).toBe("TIMEOUT");
    expect(ErrorsType.INVALID_CARD).toBe("INVALID_CARD");
    expect(ErrorsType.CANCELLED_BY_USER).toBe("CANCELLED_BY_USER");
    expect(ErrorsType.EXCESSIVE_AMOUNT).toBe("EXCESSIVE_AMOUNT");
    expect(ErrorsType.POLLING_SLOW).toBe("POLLING_SLOW");
    expect(ErrorsType.STATUS_ERROR).toBe("STATUS_ERROR");
    expect(ErrorsType.INVALID_QRCODE).toBe("INVALID_QRCODE");
    expect(ErrorsType.DONATIONLIST_ERROR).toBe("DONATIONLIST_ERROR");
    expect(ErrorsType.ECOMMERCE_ERROR).toBe("ECOMMERCE_ERROR");
    expect(ErrorsType.INVALID_DECODE).toBe("INVALID_DECODE");
  });

  it("should have no unexpected values in the ErrorsType enum", () => {
    const enumValues = Object.values(ErrorsType);
    const expectedValues = [
      "UNAUTHORIZED",
      "CONNECTION",
      "SERVER",
      "GENERIC_ERROR",
      "AUTH_ERROR",
      "INVALID_DATA",
      "TIMEOUT",
      "INVALID_CARD",
      "CANCELLED_BY_USER",
      "EXCESSIVE_AMOUNT",
      "POLLING_SLOW",
      "STATUS_ERROR",
      "INVALID_QRCODE",
      "DONATIONLIST_ERROR",
      "ECOMMERCE_ERROR",
      "INVALID_DECODE",
    ];

    expect(enumValues).toEqual(expectedValues);
  });
});
