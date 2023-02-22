import { Theme } from "@emotion/react";
import { SxProps } from "@mui/material";
import { ClientIdEnum } from "../../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { TransactionStatusEnum } from "../../../../generated/definitions/payment-ecommerce/TransactionStatus";
import { PaymentInfo as PaymentData } from "../../../../generated/definitions/payment-ecommerce/PaymentInfo";
import { TransactionMethods } from "../../../routes/models/paymentMethodRoutes";
import { AmountEuroCents } from "../../../../generated/definitions/payment-ecommerce/AmountEuroCents";

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
}

export interface PaymentId {
  paymentId: string;
}

export interface PaymentMethod {
  paymentTypeCode: string;
  paymentMethodId: string;
}

export interface PspSelected {
  pspCode: string;
  businessName: string;
  fee: number;
}

export interface PspList {
  name: string | undefined;
  label: string | undefined;
  image: string | undefined;
  commission: number;
  idPsp: string | undefined;
}

export interface PaymentInstruments {
  id: string;
  name: string;
  description: string;
  status: string;
  paymentTypeCode: TransactionMethods;
  asset: string | ((sx: SxProps<Theme>) => JSX.Element);
  label: string;
  ranges: Array<{
    min: number;
    max: number;
  }>;
}

export interface PaymentNotice {
  noticeNumber: any;
  fiscalCode: any;
  amount: number;
  companyName?: string;
  description?: string;
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
}

export interface Transaction {
  transactionId: string;
  status: TransactionStatusEnum;
  payments: ReadonlyArray<PaymentData>;
  feeTotal?: AmountEuroCents;
  clientId?: ClientIdEnum;
  authToken?: string;
}
