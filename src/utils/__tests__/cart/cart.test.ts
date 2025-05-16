import { Cart } from "features/payment/models/paymentModel";
import {
  getTotalFromCart,
  adaptCartAsPaymentInfo,
  adaptCartAsRptId,
} from "../../cart/cart";
import { setSessionItem, SessionItems } from "../../storage/sessionStorage";

jest.mock("../../storage/sessionStorage", () => ({
  setSessionItem: jest.fn(),
  SessionItems: {
    paymentInfo: "paymentInfo",
  },
}));

describe("getTotalFromCart", () => {
  it("should return the total sum of payment notices", () => {
    const cart = { paymentNotices: [{ amount: 100 }, { amount: 200 }] } as Cart;
    expect(getTotalFromCart(cart)).toBe(300);
  });

  it("should return 0 for an empty cart", () => {
    const cart = { paymentNotices: [] } as unknown as Cart;
    expect(getTotalFromCart(cart)).toBe(0);
  });
});

describe("adaptCartAsPaymentInfo", () => {
  it("should correctly set session item for payment info", () => {
    const cart = {
      paymentNotices: [
        {
          amount: 150,
          fiscalCode: "12345678901",
          noticeNumber: "000123456789",
          companyName: "Test Company",
          description: "Test payment",
        },
      ],
    } as Cart;
    adaptCartAsPaymentInfo(cart);
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentInfo, {
      amount: 150,
      paymentContextCode: "CART0000000000000000000000000000",
      rptId: "12345678901000123456789",
      paFiscalCode: "12345678901",
      paName: "Test Company",
      description: "Test payment",
    });
  });
});

describe("adaptCartAsRptId", () => {
  it("should correctly set session item for RPT ID", () => {
    const cart = {
      paymentNotices: [
        {
          fiscalCode: "12345678901",
          noticeNumber: "000123456789",
        },
      ],
    } as Cart;
    adaptCartAsRptId(cart);
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.noticeInfo, {
      billCode: "000123456789",
      cf: "12345678901",
    });
  });
});
