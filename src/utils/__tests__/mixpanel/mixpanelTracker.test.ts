import {
  getDataEntryTypeFromSessionStorage,
  getPaymentInfoFromSessionStorage,
  getFlowFromSessionStorage,
} from "../../mixpanel/mixpanelTracker";
import { getSessionItem } from "../../storage/sessionStorage";
import { MixpanelFlow } from "../../mixpanel/mixpanelEvents";
import { MixpanelDataEntryType } from "../../mixpanel/mixpanelEvents";
import { paymentInfo } from "../../../routes/__tests__/_model";

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

    const result = getPaymentInfoFromSessionStorage();

    expect(result).toBe(paymentInfo);
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
