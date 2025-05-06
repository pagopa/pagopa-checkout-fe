import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";
import { TransactionInfoNodeInfoClosePaymentResultError } from "../../../generated/definitions/payment-ecommerce-v2/TransactionInfo";
import {
  getClosePaymentErrorsMap,
  IClosePaymentErrorItem,
} from "./transactionClosePaymentErrorUtil";

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
  REFUNDED = "18",
  PSP_ERROR = "25",
  BALANCE_LIMIT = "116",
  CVV_ERROR = "117",
  LIMIT_EXCEEDED = "121",
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
  ["109", ViewOutcomeEnum.PSP_ERROR],
  ["110", ViewOutcomeEnum.INVALID_DATA],
  ["111", ViewOutcomeEnum.INVALID_CARD],
  ["115", ViewOutcomeEnum.PSP_ERROR],
  ["116", ViewOutcomeEnum.BALANCE_LIMIT],
  ["117", ViewOutcomeEnum.CVV_ERROR],
  ["118", ViewOutcomeEnum.INVALID_DATA],
  ["119", ViewOutcomeEnum.AUTH_ERROR],
  ["120", ViewOutcomeEnum.AUTH_ERROR],
  ["121", ViewOutcomeEnum.LIMIT_EXCEEDED],
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
  ["904", ViewOutcomeEnum.PSP_ERROR],
  ["906", ViewOutcomeEnum.PSP_ERROR],
  ["907", ViewOutcomeEnum.PSP_ERROR],
  ["908", ViewOutcomeEnum.PSP_ERROR],
  ["909", ViewOutcomeEnum.PSP_ERROR],
  ["911", ViewOutcomeEnum.PSP_ERROR],
  ["913", ViewOutcomeEnum.PSP_ERROR],
  ["999", ViewOutcomeEnum.PSP_ERROR],
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

export type ViewOutcomeEnumType = t.TypeOf<typeof ViewOutcomeEnumType>;
export const ViewOutcomeEnumType = enumType<ViewOutcomeEnum>(
  ViewOutcomeEnum,
  "ViewOutcomeEnumType"
);

/**
 * This function will match any status code from closePaymentResultError with any
 * status code defined in the ClosePaymentErrorsMap item.
 *
 * NOTE:
 * ClosePaymentErrorsMap supports placeholders, so 5xx will match any error >= 500
 */
export const evaluateClosePaymentResultError = (
  closePaymentResultError?: TransactionInfoNodeInfoClosePaymentResultError
): ViewOutcomeEnum => {
  // NOTE: this should never happen by design,
  // is only added just to be sure
  if (closePaymentResultError === undefined) {
    return ViewOutcomeEnum.GENERIC_ERROR;
  }

  function matchStatusCode(numericCode: number, statusCode: string) {
    const numericCodeStr = numericCode.toString();
    const regex = new RegExp("^" + statusCode.replace(/x/g, "\\d") + "$");
    return regex.test(numericCodeStr);
  }
  // find the proper error output configuration based on the closePaymentResultError
  const matchingItem: IClosePaymentErrorItem | undefined =
    getClosePaymentErrorsMap().find(
      (x: IClosePaymentErrorItem) =>
        matchStatusCode(
          closePaymentResultError?.statusCode ?? 0,
          x.statusCode
        ) &&
        (x.enablingDescriptions === undefined ||
          x.enablingDescriptions.includes(
            closePaymentResultError?.description as string
          ))
    );

  // return outcome
  if (matchingItem) {
    return matchingItem.outcome;
  }

  // default
  return ViewOutcomeEnum.GENERIC_ERROR;
};
