import { getSessionItem, SessionItems } from "../storage/sessionStorage";
import { PaymentInfo } from "../../features/payment/models/paymentModel";
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
  return typeof paymentInfoRaw === "object" && paymentInfoRaw !== null
    ? (paymentInfoRaw as PaymentInfo)
    : undefined;
}

export function getFlowFromSessionStorage() {
  const flowCartRaw = getSessionItem(SessionItems.cart);
  return typeof flowCartRaw === "object" && flowCartRaw !== null
    ? MixpanelFlow.CART
    : MixpanelFlow.DATA_ENTRY;
}
