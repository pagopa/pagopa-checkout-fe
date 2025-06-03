import { getSessionItem, SessionItems } from "../storage/sessionStorage";
import {
  PaymentInfo,
  PaymentMethod,
} from "../../features/payment/models/paymentModel";
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

export function getPaymentMethodSelectedFromSessionStorage() {
  // cards, paypal, bancomatpay, Pay with Postepay, satispay, mybank (retrieve from sessionStorage.paymentMethod)
  // TODO-FDT we need to verify if the correct data is returned
  const paymentMethodSelectedRaw = getSessionItem(SessionItems.paymentMethod);
  return typeof paymentMethodSelectedRaw === "object" &&
    paymentMethodSelectedRaw !== null
    ? (paymentMethodSelectedRaw as PaymentMethod).paymentMethodId
    : undefined;
}
