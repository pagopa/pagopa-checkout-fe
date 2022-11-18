import { Cart } from "../../features/payment/models/paymentModel";

export function getTotalFromCart(cart: Cart): number {
  const payments = cart.paymentNotices;
  return payments.reduce(
    (accumulator: number, paymentNotice) => accumulator + paymentNotice.amount,
    0
  );
}
