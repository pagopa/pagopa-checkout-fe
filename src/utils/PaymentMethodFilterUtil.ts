export enum PaymentMethodFilterType {
  CARD = "CARD",
  BALANCE = "BALANCE",
  APP_APM = "APP_APM",
}

export type PaymentMethodFilter = {
  paymentType?: PaymentMethodFilterType;
  installment: boolean;
};
