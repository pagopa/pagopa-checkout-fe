import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";
import { SxProps } from "@mui/material";
import { Theme } from "@emotion/react";
import { PaymentMethodResponse } from "../../../../generated/definitions/payment-ecommerce/PaymentMethodResponse";

export interface PaymentFormFields {
  billCode: string;
  cf: string;
}

export interface PaymentFormErrors {
  billCode?: string;
  cf?: string;
}

export interface PaymentEmailFormFields {
  email: string;
  confirmEmail: string;
}

export interface PaymentEmailFormErrors {
  email?: string;
  confirmEmail?: string;
}

export interface InputCardFormFields {
  name: string;
  number: string;
  expirationDate: string;
  cvv: string;
}

export interface InputCardFormErrors {
  name?: string;
  number?: string;
  expirationDate?: string;
  cvv?: string;
}

export interface PaymentMethodAttr {
  asset?: (sx: SxProps<Theme>) => JSX.Element;
  route: string;
}

export type PaymentMethodInfo = {
  title: string;
  body: string;
  asset?: string;
  icon?: string;
};

export enum SecureCodeDigits {
  cvv = 3,
  cid = 4,
}

export const SecureCodeLabels: {
  [key: number]: { label: string; error: string };
} = {
  3: {
    label: "inputCardPage.formFields.cvv",
    error: "inputCardPage.formErrors.cvv",
  },
  4: {
    label: "inputCardPage.formFields.cid",
    error: "inputCardPage.formErrors.cid",
  },
};

export interface PaymentInfo {
  amount: number;
  paymentContextCode: string;
  rptId?: string;
  paFiscalCode?: string;
  paName?: string;
  description?: string;
  dueDate?: string;
  creditorReferenceId?: string;
}

export interface PaymentId {
  paymentId: string;
}

export interface PaymentMethod {
  paymentTypeCode: string;
  paymentMethodId: string;
}

export enum PaymentCodeTypeEnum {
  PPAL = "PPAL", // PayPal
  RBPR = "RBPR", // Conto BancoPosta Retail
  RBPB = "RBPB", // Conto BancoPosta Impresa
  RBPP = "RBPP", // Paga con Postepay
  RPIC = "RPIC", // Pago in Conto Intesa
  RBPS = "RBPS", // SCRIGNO Internet Banking
  BPAY = "BPAY", // BancomatPay
  APPL = "APPL", // ApplePay
  GOOG = "GOOG", // GooglePay
  MYBK = "MYBK", // MyBank
  SATY = "SATY", // Satispay
  CP = "CP", // Carte
}

/**
 * Payment method status
 */

export type PaymentCodeType = t.TypeOf<typeof PaymentCodeType>;
export const PaymentCodeType = enumType<PaymentCodeTypeEnum>(
  PaymentCodeTypeEnum,
  "PaymentCodeType"
);

export const PaymentInstruments = t.intersection([
  t.type({
    paymentTypeCode: PaymentCodeType,
  }),
  PaymentMethodResponse,
]);

export type PaymentInstrumentsType = t.TypeOf<typeof PaymentInstruments>;

export interface PaymentNotice {
  noticeNumber: any;
  fiscalCode: any;
  amount: number;
  companyName?: string;
  description?: string;
  creditorReferenceId?: string;
}

interface ReturnUrls {
  returnOkUrl: string;
  returnCancelUrl: string;
  returnErrorUrl: string;
}

export interface Cart {
  paymentNotices: Array<PaymentNotice>;
  returnUrls: ReturnUrls;
  emailNotice?: string;
  idCart?: string;
}
