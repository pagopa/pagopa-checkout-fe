import {
  getDataEntryTypeFromSessionStorage,
  getPaymentInfoFromSessionStorage,
  getFlowFromSessionStorage,
  getPaymentMethodSelectedFromSessionStorage,
} from "../../mixpanel/mixpanelTracker";
import { getSessionItem } from "../../storage/sessionStorage";
import { MixpanelFlow } from "../../mixpanel/mixpanelEvents";
import { MixpanelDataEntryType } from "../../mixpanel/mixpanelEvents";
import { paymentInfo } from "../../../routes/__tests__/_model";
import { PaymentTypeCodeEnum } from "../../../../generated/definitions/payment-ecommerce-v2/PaymentMethodResponse";
import {
  paymentInfoWIthFormattedAmount,
} from "../../../routes/__tests__/_model";

jest.mock("../../storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  SessionItems: {
    noticeCodeDataEntry: "noticeCodeDataEntry",
    paymentInfo: "paymentInfo",
    cart: "cart",
  },
}));

describe("getDataEntryTypeFromSessionStorage", () => {
  it("should return correct MixpanelDataEntryType from sessionStorage", () => {
    (getSessionItem as jest.Mock).mockReturnValue("qr_code");

    const result = getDataEntryTypeFromSessionStorage();

    expect(result).toBe(MixpanelDataEntryType.QR_CODE);
  });

  it("should return undefined if sessionStorage contains invalid value", () => {
    (getSessionItem as jest.Mock).mockReturnValue("invalid");

    const result = getDataEntryTypeFromSessionStorage();

    expect(result).toBeUndefined();
  });

  it("should return undefined if sessionStorage value is not a string", () => {
    (getSessionItem as jest.Mock).mockReturnValue(null);

    const result = getDataEntryTypeFromSessionStorage();

    expect(result).toBeUndefined();
  });
});

describe("getPaymentInfoFromSessionStorage", () => {
  it("should return correct PaymentInfo from sessionStorage", () => {
    (getSessionItem as jest.Mock).mockReturnValue(paymentInfo);
    const normalizeSpaces = (s?: string) => s?.replace(/\s/g, " ") ?? "";

    const result = getPaymentInfoFromSessionStorage();

    expect({
      ...result,
      amount: normalizeSpaces(result?.amount),
    }).toStrictEqual(paymentInfoWIthFormattedAmount);
  });

  it("should return undefined if sessionStorage does not contain a valid PaymentInfo object", () => {
    (getSessionItem as jest.Mock).mockReturnValue(null);

    const result = getPaymentInfoFromSessionStorage();

    expect(result).toBeUndefined();
  });

  it("should return undefined if sessionStorage contains an invalid PaymentInfo object", () => {
    (getSessionItem as jest.Mock).mockReturnValue({ invalid: "object" });

    const result = getPaymentInfoFromSessionStorage();

    expect(result).toBeUndefined();
  });
});

describe("getFlowFromSessionStorage", () => {
  it("should return MixpanelFlow.CART if sessionStorage contains a valid cart object", () => {
    (getSessionItem as jest.Mock).mockReturnValue({});

    const result = getFlowFromSessionStorage();

    expect(result).toBe(MixpanelFlow.CART);
  });

  it("should return MixpanelFlow.DATA_ENTRY if sessionStorage does not contain a valid cart object", () => {
    (getSessionItem as jest.Mock).mockReturnValue(null);
    const result = getFlowFromSessionStorage();

    expect(result).toBe(MixpanelFlow.DATA_ENTRY);
  });
});

describe("getPaymentMethodSelectedFromSessionStorage", () => {
  it("should return the correct paymentTypeCode when sessionStorage contains a valid PaymentMethod object", () => {
    const paymentMethodMock = { paymentTypeCode: PaymentTypeCodeEnum.CP };
    (getSessionItem as jest.Mock).mockReturnValue(paymentMethodMock);

    const result = getPaymentMethodSelectedFromSessionStorage();

    expect(result).toBe(PaymentTypeCodeEnum.CP);
  });

  it("should return undefined if sessionStorage contains null", () => {
    (getSessionItem as jest.Mock).mockReturnValue(null);

    const result = getPaymentMethodSelectedFromSessionStorage();

    expect(result).toBeUndefined();
  });

  it("should return undefined if sessionStorage contains an invalid PaymentMethod object", () => {
    (getSessionItem as jest.Mock).mockReturnValue({ invalidKey: "invalid" });

    const result = getPaymentMethodSelectedFromSessionStorage();

    expect(result).toBeUndefined();
  });

  it("should return undefined if sessionStorage does not contain a PaymentMethod object", () => {
    (getSessionItem as jest.Mock).mockReturnValue(undefined);

    const result = getPaymentMethodSelectedFromSessionStorage();

    expect(result).toBeUndefined();
  });
});
