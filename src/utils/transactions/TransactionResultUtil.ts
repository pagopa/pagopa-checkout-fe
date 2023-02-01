import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";

export enum ViewOutcomeEnum {
  SUCCESS = "0",
  GENERIC_ERROR = "1",
  AUTH_ERROR = "2",
  INVALID_DATA = "3",
  TIMEOUT = "4",
  INVALID_CARD = "7",
  CANCELED_BY_USER = "8",
  EXCESSIVE_AMOUNT = "10",
}

export enum EcommerceFinalStatusCodeEnum {
  NOTIFIED,
  GENERIC_ERROR,
}

// TODO add case for all transaction status
export const getViewOutcomeFromEcommerceResultCode = (
  ecommerceStatus?: TransactionStatusEnum
): ViewOutcomeEnum => {
  switch (ecommerceStatus) {
    case TransactionStatusEnum.NOTIFIED:
      return ViewOutcomeEnum.SUCCESS;
    default:
      return ViewOutcomeEnum.GENERIC_ERROR;
  }
};

export type ViewOutcomeEnumType = t.TypeOf<typeof ViewOutcomeEnumType>;
export const ViewOutcomeEnumType = enumType<ViewOutcomeEnum>(
  ViewOutcomeEnum,
  "ViewOutcomeEnumType"
);

export type EcommerceFinalStatusCodeEnumType = t.TypeOf<
  typeof EcommerceFinalStatusCodeEnumType
>;
export const EcommerceFinalStatusCodeEnumType =
  enumType<EcommerceFinalStatusCodeEnum>(
    EcommerceFinalStatusCodeEnum,
    "EcommerceFinalStatusCodeEnumType"
  );
