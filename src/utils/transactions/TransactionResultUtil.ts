import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";
import { SendPaymentResultOutcomeEnum } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { TransactionInfo } from "../../../generated/definitions/payment-ecommerce/TransactionInfo";

export enum ViewOutcomeEnum {
  SUCCESS = "0",
  GENERIC_ERROR = "1",
  AUTH_ERROR = "2",
  INVALID_DATA = "3",
  TIMEOUT = "4",
  INVALID_CARD = "7",
  CANCELED_BY_USER = "8",
  EXCESSIVE_AMOUNT = "10",
  TAKING_CHARGE = "17",
}

export enum EcommerceFinalStatusCodeEnum {
  NOTIFIED_OK,
  NOTIFICATION_REQUESTED,
  NOTIFICATION_ERROR,
  NOTIFIED_KO,
  REFUNDED,
  REFUND_REQUESTED,
  REFUND_ERROR,
  CLOSURE_ERROR,
  EXPIRED_NOT_AUTHORIZED,
  CANCELED,
  CANCELLATION_EXPIRED,
  CANCELED_BY_USER,
  UNAUTHORIZED,
  EXPIRED,
}

//* ecommerce states which interrupts polling */
export enum EcommerceInterruptStatusCodeEnum {
  NOTIFICATION_REQUESTED,
  NOTIFICATION_ERROR,
  NOTIFIED_OK,
  NOTIFIED_KO,
  EXPIRED,
  REFUND_REQUESTED,
  REFUND_ERROR,
  REFUNDED,
  UNAUTHORIZED,
}

//* ecommerce states which maybe interrupts polling */
export enum EcommerceMaybeInterruptStatusCodeEnum {
  AUTHORIZATION_COMPLETED,
  CLOSURE_REQUESTED,
  CLOSURE_ERROR,
}

export type NpgErrorCode =
  | "000"
  | "100"
  | "101"
  | "102"
  | "104"
  | "106"
  | "109"
  | "110"
  | "111"
  | "115"
  | "116"
  | "117"
  | "118"
  | "119"
  | "120"
  | "121"
  | "122"
  | "123"
  | "124"
  | "125"
  | "126"
  | "129"
  | "200"
  | "202"
  | "204"
  | "208"
  | "209"
  | "210"
  | "413"
  | "888"
  | "902"
  | "903"
  | "904"
  | "906"
  | "907"
  | "908"
  | "909"
  | "904"
  | "911"
  | "913"
  | "999";

export const NpgErrorCodeToOutcome = new Map<NpgErrorCode, ViewOutcomeEnum>([
  ["100", ViewOutcomeEnum.AUTH_ERROR],
  ["101", ViewOutcomeEnum.INVALID_CARD],
  ["102", ViewOutcomeEnum.AUTH_ERROR],
  ["104", ViewOutcomeEnum.INVALID_DATA],
  ["106", ViewOutcomeEnum.AUTH_ERROR],
  ["109", ViewOutcomeEnum.GENERIC_ERROR],
  ["110", ViewOutcomeEnum.INVALID_DATA],
  ["111", ViewOutcomeEnum.INVALID_CARD],
  ["115", ViewOutcomeEnum.GENERIC_ERROR],
  ["116", ViewOutcomeEnum.AUTH_ERROR],
  ["117", ViewOutcomeEnum.AUTH_ERROR],
  ["118", ViewOutcomeEnum.INVALID_DATA],
  ["119", ViewOutcomeEnum.AUTH_ERROR],
  ["120", ViewOutcomeEnum.AUTH_ERROR],
  ["121", ViewOutcomeEnum.AUTH_ERROR],
  ["122", ViewOutcomeEnum.AUTH_ERROR],
  ["123", ViewOutcomeEnum.AUTH_ERROR],
  ["124", ViewOutcomeEnum.AUTH_ERROR],
  ["125", ViewOutcomeEnum.INVALID_DATA],
  ["126", ViewOutcomeEnum.AUTH_ERROR],
  ["129", ViewOutcomeEnum.AUTH_ERROR],
  ["200", ViewOutcomeEnum.AUTH_ERROR],
  ["202", ViewOutcomeEnum.AUTH_ERROR],
  ["204", ViewOutcomeEnum.AUTH_ERROR],
  ["208", ViewOutcomeEnum.INVALID_DATA],
  ["209", ViewOutcomeEnum.INVALID_DATA],
  ["210", ViewOutcomeEnum.INVALID_DATA],
  ["413", ViewOutcomeEnum.AUTH_ERROR],
  ["888", ViewOutcomeEnum.AUTH_ERROR],
  ["902", ViewOutcomeEnum.AUTH_ERROR],
  ["903", ViewOutcomeEnum.AUTH_ERROR],
  ["904", ViewOutcomeEnum.GENERIC_ERROR],
  ["906", ViewOutcomeEnum.GENERIC_ERROR],
  ["907", ViewOutcomeEnum.GENERIC_ERROR],
  ["908", ViewOutcomeEnum.GENERIC_ERROR],
  ["909", ViewOutcomeEnum.GENERIC_ERROR],
  ["911", ViewOutcomeEnum.GENERIC_ERROR],
  ["913", ViewOutcomeEnum.GENERIC_ERROR],
  ["999", ViewOutcomeEnum.GENERIC_ERROR],
]);

export enum PaymentGateway {
  NPG = "NPG",
}

export enum NpgAuthorizationStatus {
  AUTHORIZED = "AUTHORIZED",
  EXECUTED = "EXECUTED",
  DECLINED = "DECLINED",
  DENIED_BY_RISK = "DENIED_BY_RISK",
  THREEDS_VALIDATED = "THREEDS_VALIDATED",
  THREEDS_FAILED = "THREEDS_FAILED",
  PENDING = "PENDING",
  CANCELED = "CANCELED",
  VOIDED = "VOIDED",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export type GetViewOutcomeFromEcommerceResultCode = (
  transactionStatus?: TransactionStatusEnum,
  sendPaymentResultOutcome?: SendPaymentResultOutcomeEnum,
  gateway?: string,
  errorCode?: string,
  gatewayAuthorizationStatus?: TransactionInfo["gatewayAuthorizationStatus"]
) => ViewOutcomeEnum;

export const getViewOutcomeFromEcommerceResultCode: GetViewOutcomeFromEcommerceResultCode =
  // eslint-disable-next-line complexity
  (
    transactionStatus,
    sendPaymentResultOutcome,
    gateway,
    errorCode,
    gatewayAuthorizationStatus
  ): ViewOutcomeEnum => {
    switch (transactionStatus) {
      case TransactionStatusEnum.NOTIFIED_OK:
        return ViewOutcomeEnum.SUCCESS;
      case TransactionStatusEnum.NOTIFICATION_REQUESTED:
      case TransactionStatusEnum.NOTIFICATION_ERROR:
        return sendPaymentResultOutcome === SendPaymentResultOutcomeEnum.OK
          ? ViewOutcomeEnum.SUCCESS
          : ViewOutcomeEnum.GENERIC_ERROR;
      case TransactionStatusEnum.NOTIFIED_KO:
      case TransactionStatusEnum.REFUNDED:
      case TransactionStatusEnum.REFUND_REQUESTED:
      case TransactionStatusEnum.REFUND_ERROR:
        return ViewOutcomeEnum.GENERIC_ERROR;
      case TransactionStatusEnum.EXPIRED_NOT_AUTHORIZED:
        return ViewOutcomeEnum.TIMEOUT;
      case TransactionStatusEnum.CANCELED:
      case TransactionStatusEnum.CANCELLATION_EXPIRED:
        return ViewOutcomeEnum.CANCELED_BY_USER;
      case TransactionStatusEnum.CLOSURE_ERROR:
      case TransactionStatusEnum.CLOSURE_REQUESTED:
      case TransactionStatusEnum.AUTHORIZATION_COMPLETED:
      case TransactionStatusEnum.UNAUTHORIZED:
        return gatewayAuthorizationStatus !== NpgAuthorizationStatus.EXECUTED
          ? evaluateUnauthorizedStatus(
              gateway,
              errorCode,
              gatewayAuthorizationStatus
            )
          : ViewOutcomeEnum.GENERIC_ERROR;
      case TransactionStatusEnum.CLOSED:
        return sendPaymentResultOutcome ===
          SendPaymentResultOutcomeEnum.NOT_RECEIVED
          ? ViewOutcomeEnum.TAKING_CHARGE
          : ViewOutcomeEnum.GENERIC_ERROR;
      case TransactionStatusEnum.EXPIRED: {
        if (gatewayAuthorizationStatus !== NpgAuthorizationStatus.EXECUTED) {
          return evaluateUnauthorizedStatus(
            gateway,
            errorCode,
            gatewayAuthorizationStatus
          );
        }
        if (
          sendPaymentResultOutcome === SendPaymentResultOutcomeEnum.OK &&
          gatewayAuthorizationStatus === NpgAuthorizationStatus.EXECUTED
        ) {
          return ViewOutcomeEnum.SUCCESS;
        }
        return ViewOutcomeEnum.GENERIC_ERROR;
      }
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

export type EcommerceInterruptStatusCodeEnumType = t.TypeOf<
  typeof EcommerceInterruptStatusCodeEnumType
>;
export const EcommerceInterruptStatusCodeEnumType =
  enumType<EcommerceInterruptStatusCodeEnum>(
    EcommerceInterruptStatusCodeEnum,
    "EcommerceInterruptStatusCodeEnumType"
  );

export type EcommerceMaybeInterruptStatusCodeEnumType = t.TypeOf<
  typeof EcommerceMaybeInterruptStatusCodeEnumType
>;
export const EcommerceMaybeInterruptStatusCodeEnumType =
  enumType<EcommerceMaybeInterruptStatusCodeEnum>(
    EcommerceMaybeInterruptStatusCodeEnum,
    "EcommerceMaybeInterruptStatusCodeEnumType"
  );

function evaluateUnauthorizedStatus(
  gateway?: string,
  errorCode?: string,
  gatewayAuthorizationStatus?: string
): ViewOutcomeEnum {
  switch (gateway) {
    case PaymentGateway.NPG:
      switch (gatewayAuthorizationStatus) {
        case NpgAuthorizationStatus.EXECUTED:
        case NpgAuthorizationStatus.AUTHORIZED:
        case NpgAuthorizationStatus.PENDING:
        case NpgAuthorizationStatus.VOIDED:
        case NpgAuthorizationStatus.REFUNDED:
        case NpgAuthorizationStatus.FAILED:
          return ViewOutcomeEnum.GENERIC_ERROR;
        case NpgAuthorizationStatus.CANCELED:
          return ViewOutcomeEnum.CANCELED_BY_USER;
        case NpgAuthorizationStatus.DENIED_BY_RISK:
        case NpgAuthorizationStatus.THREEDS_VALIDATED:
        case NpgAuthorizationStatus.THREEDS_FAILED:
          return ViewOutcomeEnum.AUTH_ERROR;
        case NpgAuthorizationStatus.DECLINED:
          return (
            NpgErrorCodeToOutcome.get(errorCode as NpgErrorCode) ||
            ViewOutcomeEnum.GENERIC_ERROR
          );
        default:
          return ViewOutcomeEnum.GENERIC_ERROR;
      }
    default:
      return ViewOutcomeEnum.GENERIC_ERROR;
  }
}
