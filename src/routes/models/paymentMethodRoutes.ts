interface PaymentTypecode {
  [key: string]: string;
}

export const PaymentMethodRoutes: PaymentTypecode = {
  PPAY: "paga-con-paypal",
  BPAY: "paga-con-bancomat-pay",
  CP: "inserisci-carta",
};

export enum TransactionMethods {
  PPAY = "PPAY",
  BPAY = "BPAY",
  CP = "CP",
}
