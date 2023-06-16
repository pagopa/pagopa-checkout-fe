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

export enum PaymentGateway {
  VPOS = "VPOS",
  XPAY = "XPAY",
}

export const getViewOutcomeFromEcommerceResultCode = (
  transactionStatus?: TransactionStatusEnum,
  sendPaymentResultOutcome?: SendPaymentResultOutcomeEnum,
  gateway?: string,
  errorCode?: string
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
      return sendPaymentResultOutcome === SendPaymentResultOutcomeEnum.NOT_RECEIVED
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
    default:
      return ViewOutcomeEnum.GENERIC_ERROR;
  }
}
