import {
  Cart,
  PaymentFormFields,
  PaymentInfo,
  ReturnUrls,
  PaymentId,
  Transaction,
  PaymentEmailFormFields,
  PaymentMethod,
  PspSelected,
} from "../../features/payment/models/paymentModel";
import { getConfigOrThrow } from "../config/config";

export enum SessionItems {
  paymentInfo = "paymentInfo",
  noticeInfo = "rptId",
  useremail = "useremail",
  paymentMethod = "paymentMethod",
  pspSelected = "pspSelected",
  sessionToken = "sessionToken",
  cart = "cart",
  transaction = "transaction",
  returnUrls = "returnUrls",
}
const isParsable = (item: SessionItems) =>
  !(item === SessionItems.sessionToken || item === SessionItems.useremail);

export const getSessionItem = (item: SessionItems) => {
  try {
    const serializedState = sessionStorage.getItem(item);

    if (!serializedState) {
      return undefined;
    }

    return isParsable(item)
      ? (JSON.parse(serializedState) as
          | PaymentInfo
          | PaymentFormFields
          | PaymentEmailFormFields
          | PaymentId
          | Transaction
          | Cart
          | ReturnUrls
          | PspSelected)
      : serializedState;
  } catch (e) {
    return undefined;
  }
};

export function setSessionItem(
  name: SessionItems,
  item:
    | string
    | PaymentInfo
    | PaymentFormFields
    | PaymentEmailFormFields
    | PaymentMethod
    | PaymentId
    | Transaction
    | Cart
    | ReturnUrls
    | PspSelected
) {
  sessionStorage.setItem(
    name,
    typeof item === "string" ? item : JSON.stringify(item)
  );
}

export const isStateEmpty = (item: SessionItems) => !getSessionItem(item);

export const clearSensitiveItems = () => {
  const originUrl = getSessionItem(SessionItems.returnUrls) as
    | ReturnUrls
    | undefined;
  sessionStorage.clear();
  setSessionItem(SessionItems.returnUrls, originUrl || "");
};

export function getReCaptchaKey() {
  return getConfigOrThrow().CHECKOUT_RECAPTCHA_SITE_KEY;
}
