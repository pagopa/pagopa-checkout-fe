export enum PaymentMethodFilterType {
  CARD = "CARTE",
  BALANCE = "CONTO",
  APP_APM = "APP",
}

export type PaymentMethodFilter = {
  paymentType?: PaymentMethodFilterType;
  installment: boolean;
};
