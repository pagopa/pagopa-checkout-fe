import { fromPredicate, toError } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";

export enum OutcomeEnum {
  SUCCESS = "0",
  GENERIC_ERROR = "1",
  AUTH_ERROR = "2",
  INVALID_DATA = "3",
  TIMEOUT = "4",
  CIRCUIT_ERROR = "5",
  MISSING_FIELDS = "6",
  INVALID_CARD = "7",
  CANCELED_BY_USER = "8",
  DUPLICATE_ORDER = "9",
  EXCESSIVE_AMOUNT = "10",
  ORDER_NOT_PRESENT = "11",
  INVALID_METHOD = "12",
  KO_RETRIABLE = "13",
  INVALID_SESSION = "14",
}

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

export type OutcomeEnumType = t.TypeOf<typeof OutcomeEnumType>;
export const OutcomeEnumType = enumType<OutcomeEnum>(
  OutcomeEnum,
  "OutcomeEnumType"
);

export type ViewOutcomeEnumType = t.TypeOf<typeof ViewOutcomeEnumType>;
export const ViewOutcomeEnumType = enumType<ViewOutcomeEnum>(
  ViewOutcomeEnum,
  "ViewOutcomeEnumType"
);

export type NexiResultCodeEnumType = t.TypeOf<typeof NexiResultCodeEnumType>;
export const NexiResultCodeEnumType = enumType<NexiResultCodeEnum>(
  NexiResultCodeEnum,
  "NexiResultCodeEnumType"
);

export type VposResultCodeEnumType = t.TypeOf<typeof VposResultCodeEnumType>;
export const VposResultCodeEnumType = enumType<VposResultCodeEnum>(
  VposResultCodeEnum,
  "VposResultCodeEnumType"
);

// eslint-disable-next-line complexity
export const getOutcomeFromNexiResultCode = (
  nexiResultCode: NexiResultCodeEnumType
): OutcomeEnumType => {
  switch (nexiResultCode) {
    case NexiResultCodeEnum.SUCCESS:
      return OutcomeEnum.SUCCESS;
    case NexiResultCodeEnum.TIMEOUT:
    case NexiResultCodeEnum.RETRY_EXHAUSTED:
      return OutcomeEnum.TIMEOUT;
    case NexiResultCodeEnum.REFUSED_PAYMENT:
    case NexiResultCodeEnum.FAILED_3DS_AUTH:
      return OutcomeEnum.AUTH_ERROR;
    case NexiResultCodeEnum.INVALID_CARD:
    case NexiResultCodeEnum.EXPIRED_CARD:
    case NexiResultCodeEnum.CARD_BRAND_NOT_PERMITTED:
      return OutcomeEnum.INVALID_CARD;
    case NexiResultCodeEnum.INCORRECT_PARAMS:
    case NexiResultCodeEnum.INCORRECT_MAC:
    case NexiResultCodeEnum.INVALID_MAC_ALIAS:
    case NexiResultCodeEnum.INVALID_APIKEY:
    case NexiResultCodeEnum.INVALID_CONTRACT:
    case NexiResultCodeEnum.INVALID_GROUP:
      return OutcomeEnum.INVALID_DATA;
    case NexiResultCodeEnum.MAC_NOT_PRESENT:
      return OutcomeEnum.MISSING_FIELDS;
    case NexiResultCodeEnum.NOT_FOUND:
      return OutcomeEnum.CIRCUIT_ERROR;
    case NexiResultCodeEnum.DUPLICATE_TRANSACTION:
      return OutcomeEnum.DUPLICATE_ORDER;
    case NexiResultCodeEnum.CANCELED_3DS_AUTH:
      return OutcomeEnum.CANCELED_BY_USER;
    case NexiResultCodeEnum.EXCESSIVE_AMOUNT:
      return OutcomeEnum.EXCESSIVE_AMOUNT;
    case NexiResultCodeEnum.TRANSACTION_NOT_FOUND:
      return OutcomeEnum.ORDER_NOT_PRESENT;
    case NexiResultCodeEnum.FORBIDDEN_OPERATION:
    case NexiResultCodeEnum.UNAVAILABLE_METHOD:
      return OutcomeEnum.INVALID_METHOD;
    case NexiResultCodeEnum.KO_RETRIABLE:
      return OutcomeEnum.KO_RETRIABLE;
    case NexiResultCodeEnum.GENERIC_ERROR:
    case NexiResultCodeEnum.INTERNAL_ERROR:
    case NexiResultCodeEnum.INVALID_STATUS:
    default:
      return OutcomeEnum.GENERIC_ERROR;
  }
};

// eslint-disable-next-line complexity
export const getOutcomeFromVposStatus = (
  vposResultCode: VposResultCodeEnumType
): OutcomeEnumType => {
  switch (vposResultCode) {
    case VposResultCodeEnum.SUCCESS:
      return OutcomeEnum.SUCCESS;
    case VposResultCodeEnum.TIMEOUT:
      return OutcomeEnum.TIMEOUT;
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
      return OutcomeEnum.INVALID_DATA;
    case VposResultCodeEnum.MISSING_CVV2:
    case VposResultCodeEnum.XML_EMPTY:
    case VposResultCodeEnum.TRANSACTION_ID_NOT_FOUND:
      return OutcomeEnum.MISSING_FIELDS;
    case VposResultCodeEnum.CIRCUIT_DISABLED:
    case VposResultCodeEnum.INSTALLMENTS_NOT_AVAILABLE:
    case VposResultCodeEnum.OPERATOR_NOT_FOUND:
      return OutcomeEnum.CIRCUIT_ERROR;
    case VposResultCodeEnum.TRANSACTION_FAILED:
      return OutcomeEnum.AUTH_ERROR;
    case VposResultCodeEnum.ORDER_OR_REQREFNUM_NOT_FOUND:
      return OutcomeEnum.ORDER_NOT_PRESENT;
    case VposResultCodeEnum.EXCEEDING_AMOUNT:
      return OutcomeEnum.EXCESSIVE_AMOUNT;
    case VposResultCodeEnum.PAYMENT_INSTRUMENT_NOT_ACCEPTED:
      return OutcomeEnum.INVALID_CARD;
    case VposResultCodeEnum.DUPLICATED_ORDER:
      return OutcomeEnum.DUPLICATE_ORDER;
    case VposResultCodeEnum.UNKNOWN_ERROR:
    case VposResultCodeEnum.APPLICATION_ERROR:
    case VposResultCodeEnum.REDIRECTION_3DS1:
    case VposResultCodeEnum.METHOD_REQUESTED:
    case VposResultCodeEnum.CHALLENGE_REQUESTED:
    case VposResultCodeEnum.INCORRECT_STATUS:
    default:
      return OutcomeEnum.GENERIC_ERROR;
  }
};

export const getOutcomeFromAuthcodeAndIsDirectAcquirer = (
  authCode?: string,
  isDirectAcquirer?: boolean
): OutcomeEnumType =>
  fromPredicate(
    (directAcquirer) => directAcquirer === true,
    toError
  )(isDirectAcquirer).fold(
    () =>
      getOutcomeFromVposStatus(
        VposResultCodeEnumType.decode(authCode).getOrElse(
          VposResultCodeEnum.UNKNOWN_ERROR
        )
      ),
    () =>
      getOutcomeFromNexiResultCode(
        NexiResultCodeEnumType.decode(authCode).getOrElse(
          NexiResultCodeEnum.GENERIC_ERROR
        )
      )
  );
