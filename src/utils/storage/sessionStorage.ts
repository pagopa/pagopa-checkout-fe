import {
  Cart,
  PaymentCheckData,
  PaymentFormFields,
  PaymentInfo,
  ReturnUrls,
  SecurityCode,
  Wallet,
} from "../../features/payment/models/paymentModel";
import { getConfigOrThrow } from "../config/config";

export enum SessionItems {
  paymentInfo = "paymentInfo",
  noticeInfo = "rptId",
  useremail = "useremail",
  paymentId = "paymentId",
  checkData = "checkData",
  securityCode = "securityCode",
  wallet = "wallet",
  returnUrls = "returnUrls",
  sessionToken = "sessionToken",
  cart = "cart",
}
export const getSessionItem = (item: SessionItems) => {
  try {
    const serializedState = sessionStorage.getItem(item);

    if (!serializedState) {
      return undefined;
    }
    return JSON.parse(serializedState) as
      | string
      | PaymentInfo
      | PaymentFormFields
      | PaymentCheckData
      | Wallet
      | Cart
      | ReturnUrls
      | SecurityCode;
  } catch (e) {
    return undefined;
  }
};

export function setSessionItem(name: SessionItems, item: any) {
  sessionStorage.setItem(name, JSON.stringify(item));
}

export const isStateEmpty = (item: SessionItems) => !getSessionItem(item);

export const clearSensitiveItems = () => {
  const originUrl = getSessionItem(SessionItems.returnUrls);
  sessionStorage.clear();
  setSessionItem(SessionItems.returnUrls, originUrl);
};

export function getReCaptchaKey() {
  return getConfigOrThrow().CHECKOUT_RECAPTCHA_SITE_KEY;
}
