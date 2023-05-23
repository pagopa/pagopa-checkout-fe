import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";
import { NewTransactionResponse } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";

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
  NOTIFIED_OK,
  AUTHORIZATION_FAILED,
  CLOSURE_FAILED,
  NOTIFIED_KO,
}

export const getViewOutcomeFromEcommerceResultCode = (
  transactionData?: NewTransactionResponse
): ViewOutcomeEnum => {
  switch (transactionData?.status) {
    case TransactionStatusEnum.NOTIFIED_OK:
      return ViewOutcomeEnum.SUCCESS;
    case TransactionStatusEnum.NOTIFICATION_REQUESTED:
    case TransactionStatusEnum.NOTIFICATION_ERROR:
      return transactionData.authorizationResult === "OK"
        ? ViewOutcomeEnum.SUCCESS
        : ViewOutcomeEnum.GENERIC_ERROR;
    case TransactionStatusEnum.NOTIFIED_KO:
    case TransactionStatusEnum.REFUNDED:
    case TransactionStatusEnum.REFUND_REQUESTED:
    case TransactionStatusEnum.REFUND_ERROR:
    case TransactionStatusEnum.CLOSURE_ERROR:
      return ViewOutcomeEnum.GENERIC_ERROR;
    case TransactionStatusEnum.EXPIRED_NOT_AUTHORIZED:
      return ViewOutcomeEnum.TIMEOUT;
    case TransactionStatusEnum.CANCELED:
    case TransactionStatusEnum.CANCELLATION_EXPIRED:
      return ViewOutcomeEnum.CANCELED_BY_USER;
    case TransactionStatusEnum.EXPIRED:
      // TODO Check expired status conditions
      return ViewOutcomeEnum.GENERIC_ERROR;
    case TransactionStatusEnum.UNAUTHORIZED:
      return evaluateUnauthorizedStatus(transactionData.gateway, transactionData.errorCode);
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

function evaluateUnauthorizedStatus(
  gateway: string,
  errorCode?: string
): ViewOutcomeEnum {
  // eslint-disable-next-line sonarjs/no-all-duplicated-branches
  if (gateway === "XPAY") {
    return ViewOutcomeEnum.AUTH_ERROR;
  } else if (gateway === "VPOS") {
    return ViewOutcomeEnum.AUTH_ERROR;
  } else {
    return ViewOutcomeEnum.AUTH_ERROR;
  }
}
