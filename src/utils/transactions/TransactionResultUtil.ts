import * as t from "io-ts";
import { enumType } from "@pagopa/ts-commons/lib/types";

export enum ViewOutcomeEnum {
  SUCCESS = "0",
  GENERIC_ERROR = "1",
  AUTH_ERROR = "2",
  INVALID_DATA = "3",
  TIMEOUT = "4",
  CIRCUIT_ERROR = "5",
  MISSING_FIELDS = "6",
  INVALID_CARD = "7",
  CANCELED_BY_USER = "8",
  EXCESSIVE_AMOUNT = "10",
  INVALID_METHOD = "12",
  TAKING_CHARGE = "17",
  REFUNDED = "18",
  PSP_ERROR = "25",
  BALANCE_LIMIT = "116",
  CVV_ERROR = "117",
  LIMIT_EXCEEDED = "121",
}

export type ViewOutcomeEnumType = t.TypeOf<typeof ViewOutcomeEnumType>;
export const ViewOutcomeEnumType = enumType<ViewOutcomeEnum>(
  ViewOutcomeEnum,
  "ViewOutcomeEnumType"
);
