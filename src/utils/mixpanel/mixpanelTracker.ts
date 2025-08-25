import { getSessionItem, SessionItems } from "../storage/sessionStorage";
import { PaymentMethod } from "../../features/payment/models/paymentModel";
import { moneyFormat } from "../form/formatters";
import {
  mixpanelDataEntryTypeFromString,
  MixpanelFlow,
} from "./mixpanelEvents";

export function getDataEntryTypeFromSessionStorage() {
  const dataEntryRaw = getSessionItem(SessionItems.noticeCodeDataEntry);
  return mixpanelDataEntryTypeFromString(
    typeof dataEntryRaw === "string" ? dataEntryRaw : ""
  );
}

export function getPaymentInfoFromSessionStorage() {
  const paymentInfoRaw = getSessionItem(SessionItems.paymentInfo);

  if (
    typeof paymentInfoRaw === "object" &&
    paymentInfoRaw !== null &&
    "amount" in paymentInfoRaw
  ) {
    const convertedAmount = moneyFormat(paymentInfoRaw.amount);

    return {
      ...paymentInfoRaw,
      amount: convertedAmount,
    };
  }

  return undefined;
}

export function getFlowFromSessionStorage() {
  const flowCartRaw = getSessionItem(SessionItems.cart);
  return typeof flowCartRaw === "object" && flowCartRaw !== null
    ? MixpanelFlow.CART
    : MixpanelFlow.DATA_ENTRY;
}

export function getPaymentMethodSelectedFromSessionStorage() {
  const paymentMethodSelectedRaw = getSessionItem(SessionItems.paymentMethod);
  return typeof paymentMethodSelectedRaw === "object" &&
    paymentMethodSelectedRaw !== null
    ? (paymentMethodSelectedRaw as PaymentMethod).paymentTypeCode
    : undefined;
}
