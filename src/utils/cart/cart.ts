import {
  Cart,
  PaymentFormFields,
  PaymentInfo,
} from "../../features/payment/models/paymentModel";
import { setPaymentInfo, setRptId } from "../api/apiService";

export function getTotalFromCart(cart: Cart): number {
  const payments = cart.paymentNotices;
  return payments.reduce(
    (accumulator: number, paymentNotice) => accumulator + paymentNotice.amount,
    0
  );
}

// these are a tempo adapters to convert the Cart with only one item
export function adaptCartAsPaymentInfo(cart: Cart): void {
  const CartItem = cart.paymentNotices[0];
  const CartAsPI: PaymentInfo = {
    amount: CartItem.amount,
    paymentContextCode: "",
    rptId: `${CartItem.fiscalCode}${CartItem.noticeNumber}`,
    paFiscalCode: CartItem.fiscalCode,
    paName: CartItem.companyName || "",
    description: CartItem.description || "",
  };
  setPaymentInfo(CartAsPI);
}
export function adaptCartAsRptId(cart: Cart): void {
  const CartItem = cart.paymentNotices[0];
  const CartAsRpt: PaymentFormFields = {
    billCode: CartItem.noticeNumber,
    cf: CartItem.fiscalCode,
  };
  setRptId(CartAsRpt);
}
