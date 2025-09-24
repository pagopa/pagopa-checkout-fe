import * as t from "io-ts";
import { SxProps } from "@mui/material";
import { Theme } from "@emotion/react";
import {
  MethodManagementEnum,
  PaymentTypeCodeEnum,
} from "../../../../generated/definitions/payment-ecommerce-v2/PaymentMethodResponse";
import { FeeRange } from "../../../../generated/definitions/payment-ecommerce-v2/FeeRange";

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

export const MapField = t.record(
  t.string,

  t.string
);

export type MapField = t.TypeOf<typeof MapField>;

export interface PaymentInstrumentsType {
  id: string;
  name: MapField;
  description: MapField;
  status: string;
  paymentTypeCode: PaymentTypeCodeEnum;
  methodManagement: MethodManagementEnum;
  feeRange?: FeeRange;
  asset?: string;
  brandAsset?: MapField;
}

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
