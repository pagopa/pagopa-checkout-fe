import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";
import { SendPaymentResultOutcomeEnum } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";

export enum ViewOutcomeEnum {
  SUCCESS = "0",
  GENERIC_ERROR = "1",
  AUTH_ERROR = "2",
  INVALID_DATA = "3",
  TIMEOUT = "4",
  INVALID_CARD = "7",
  CANCELED_BY_USER = "8",
  EXCESSIVE_AMOUNT = "10",
  TAKING_CHARGE = "15",
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

export enum NexiResultCodeEnum {
  SUCCESS = "0",
  INCORRECT_PARAMS = "1",
  NOT_FOUND = "2",
  INCORRECT_MAC = "3",
  MAC_NOT_PRESENT = "4",
  TIMEOUT = "5",
  INVALID_APIKEY = "7",
  INVALID_CONTRACT = "8",
  DUPLICATE_TRANSACTION = "9",
  INVALID_GROUP = "12",
  TRANSACTION_NOT_FOUND = "13",
  EXPIRED_CARD = "14",
  CARD_BRAND_NOT_PERMITTED = "15",
  INVALID_STATUS = "16",
  EXCESSIVE_AMOUNT = "17",
  RETRY_EXHAUSTED = "18",
  REFUSED_PAYMENT = "19",
  CANCELED_3DS_AUTH = "20",
  FAILED_3DS_AUTH = "21",
  INVALID_CARD = "22",
  INVALID_MAC_ALIAS = "50",
  KO_RETRIABLE = "96",
  GENERIC_ERROR = "97",
  UNAVAILABLE_METHOD = "98",
  FORBIDDEN_OPERATION = "99",
  INTERNAL_ERROR = "100",
}

export enum VposResultCodeEnum {
  SUCCESS = "00",
  ORDER_OR_REQREFNUM_NOT_FOUND = "01",
  REQREFNUM_INVALID = "02",
  INCORRECT_FORMAT = "03",
  INCORRECT_MAC_OR_TIMESTAMP = "04",
  INCORRECT_DATE = "05",
  UNKNOWN_ERROR = "06",
  TRANSACTION_ID_NOT_FOUND = "07",
  OPERATOR_NOT_FOUND = "08",
  TRANSACTION_ID_NOT_CONSISTENT = "09",
  EXCEEDING_AMOUNT = "10",
  INCORRECT_STATUS = "11",
  CIRCUIT_DISABLED = "12",
  DUPLICATED_ORDER = "13",
  UNSUPPORTED_CURRENCY = "16",
  UNSUPPORTED_EXPONENT = "17",
  REDIRECTION_3DS1 = "20",
  TIMEOUT = "21",
  METHOD_REQUESTED = "25",
  CHALLENGE_REQUESTED = "26",
  PAYMENT_INSTRUMENT_NOT_ACCEPTED = "35",
  MISSING_CVV2 = "37",
  INVALID_PAN = "38",
  XML_EMPTY = "40",
  XML_NOT_PARSABLE = "41",
  INSTALLMENTS_NOT_AVAILABLE = "50",
  INSTALLMENT_NUMBER_OUT_OF_BOUNDS = "51",
  APPLICATION_ERROR = "98",
  TRANSACTION_FAILED = "99",
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
  ["000", ViewOutcomeEnum.SUCCESS],
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
  ["200", ViewOutcomeEnum.AUTH_ERROR],
  ["202", ViewOutcomeEnum.AUTH_ERROR],
  ["204", ViewOutcomeEnum.AUTH_ERROR],
  ["208", ViewOutcomeEnum.INVALID_DATA],
  ["209", ViewOutcomeEnum.INVALID_CARD],
  ["210", ViewOutcomeEnum.INVALID_CARD],
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
  VPOS = "VPOS",
  XPAY = "XPAY",
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
  gatewayAuthorizationStatus?: string
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
    if (gateway === PaymentGateway.NPG) {
      switch (gatewayAuthorizationStatus) {
        case NpgAuthorizationStatus.EXECUTED:
          return ViewOutcomeEnum.SUCCESS;
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
          return evaluateUnauthorizedStatus(PaymentGateway.NPG, errorCode);
        default:
          return ViewOutcomeEnum.GENERIC_ERROR;
      }
    }
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
      case TransactionStatusEnum.CLOSURE_ERROR:
      case TransactionStatusEnum.EXPIRED:
        return ViewOutcomeEnum.GENERIC_ERROR;
      case TransactionStatusEnum.EXPIRED_NOT_AUTHORIZED:
        return ViewOutcomeEnum.TIMEOUT;
      case TransactionStatusEnum.CANCELED:
      case TransactionStatusEnum.CANCELLATION_EXPIRED:
        return ViewOutcomeEnum.CANCELED_BY_USER;
      case TransactionStatusEnum.UNAUTHORIZED:
        return evaluateUnauthorizedStatus(gateway, errorCode);
      case TransactionStatusEnum.CLOSED:
        return sendPaymentResultOutcome ===
          SendPaymentResultOutcomeEnum.NOT_RECEIVED
          ? ViewOutcomeEnum.TAKING_CHARGE
          : ViewOutcomeEnum.GENERIC_ERROR;
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

// eslint-disable-next-line complexity
function evaluateUnauthorizedStatus(
  gateway: string | undefined,
  errorCode: string | undefined
): ViewOutcomeEnum {
  switch (gateway) {
    case PaymentGateway.XPAY:
      switch (errorCode) {
        case NexiResultCodeEnum.INVALID_CARD:
        case NexiResultCodeEnum.EXPIRED_CARD:
        case NexiResultCodeEnum.CARD_BRAND_NOT_PERMITTED:
          return ViewOutcomeEnum.INVALID_CARD;
        case NexiResultCodeEnum.DUPLICATE_TRANSACTION:
        case NexiResultCodeEnum.FORBIDDEN_OPERATION:
        case NexiResultCodeEnum.UNAVAILABLE_METHOD:
        case NexiResultCodeEnum.KO_RETRIABLE:
        case NexiResultCodeEnum.GENERIC_ERROR:
        case NexiResultCodeEnum.INTERNAL_ERROR:
        case NexiResultCodeEnum.INVALID_STATUS:
          return ViewOutcomeEnum.GENERIC_ERROR;
        case NexiResultCodeEnum.CANCELED_3DS_AUTH:
          return ViewOutcomeEnum.CANCELED_BY_USER;
        default:
          return ViewOutcomeEnum.GENERIC_ERROR;
      }
    case PaymentGateway.VPOS:
      switch (errorCode) {
        case VposResultCodeEnum.TIMEOUT:
          return ViewOutcomeEnum.TIMEOUT;
        case VposResultCodeEnum.REQREFNUM_INVALID:
        case VposResultCodeEnum.INCORRECT_FORMAT:
        case VposResultCodeEnum.INCORRECT_MAC_OR_TIMESTAMP:
        case VposResultCodeEnum.INCORRECT_DATE:
        case VposResultCodeEnum.TRANSACTION_ID_NOT_CONSISTENT:
        case VposResultCodeEnum.UNSUPPORTED_CURRENCY:
        case VposResultCodeEnum.UNSUPPORTED_EXPONENT:
        case VposResultCodeEnum.INVALID_PAN:
        case VposResultCodeEnum.XML_NOT_PARSABLE:
        case VposResultCodeEnum.INSTALLMENT_NUMBER_OUT_OF_BOUNDS:
          return ViewOutcomeEnum.INVALID_DATA;
        case VposResultCodeEnum.MISSING_CVV2:
        case VposResultCodeEnum.XML_EMPTY:
        case VposResultCodeEnum.TRANSACTION_ID_NOT_FOUND:
        case VposResultCodeEnum.CIRCUIT_DISABLED:
        case VposResultCodeEnum.INSTALLMENTS_NOT_AVAILABLE:
        case VposResultCodeEnum.OPERATOR_NOT_FOUND:
        case VposResultCodeEnum.ORDER_OR_REQREFNUM_NOT_FOUND:
        case VposResultCodeEnum.DUPLICATED_ORDER:
        case VposResultCodeEnum.UNKNOWN_ERROR:
        case VposResultCodeEnum.APPLICATION_ERROR:
        case VposResultCodeEnum.REDIRECTION_3DS1:
        case VposResultCodeEnum.METHOD_REQUESTED:
        case VposResultCodeEnum.CHALLENGE_REQUESTED:
        case VposResultCodeEnum.INCORRECT_STATUS:
          return ViewOutcomeEnum.GENERIC_ERROR;
        case VposResultCodeEnum.TRANSACTION_FAILED:
          return ViewOutcomeEnum.AUTH_ERROR;
        case VposResultCodeEnum.EXCEEDING_AMOUNT:
          return ViewOutcomeEnum.EXCESSIVE_AMOUNT;
        case VposResultCodeEnum.PAYMENT_INSTRUMENT_NOT_ACCEPTED:
          return ViewOutcomeEnum.INVALID_CARD;
        default:
          return ViewOutcomeEnum.GENERIC_ERROR;
      }
    case PaymentGateway.NPG:
      return (
        NpgErrorCodeToOutcome.get(errorCode as NpgErrorCode) ||
        ViewOutcomeEnum.GENERIC_ERROR
      );
    default:
      return ViewOutcomeEnum.GENERIC_ERROR;
  }
}
