interface PaymentTypecode {
  [key: string]: string;
}

export const PaymentMethodRoutes: PaymentTypecode = {
  PPAY: "paga-con-paypal",
  BPAY: "paga-con-bancomat-pay",
  PO: "inserisci-carta",
};
