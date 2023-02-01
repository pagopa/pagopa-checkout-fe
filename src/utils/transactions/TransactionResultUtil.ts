import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { pipe } from "fp-ts/function";
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
  NOTIFIED = "0",
  GENERIC_ERROR = "1",
}

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

export const getOutcomeFromEcommerceAuthCode = (
  authCode?: TransactionStatusEnum
): EcommerceFinalStatusCodeEnum =>
  pipe(
    EcommerceFinalStatusCodeEnumType.decode(authCode),
    E.getOrElse(
      () =>
        EcommerceFinalStatusCodeEnum.GENERIC_ERROR as EcommerceFinalStatusCodeEnum
    )
  );
