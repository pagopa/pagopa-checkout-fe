import {
  Cart,
  PaymentCheckData,
  PaymentFormFields,
  PaymentInfo,
  ReturnUrls,
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
  idTransaction = "idTransaction",
}

const isParsable = (item: SessionItems) =>
  !(
    item === SessionItems.idTransaction ||
    item === SessionItems.paymentId ||
    item === SessionItems.securityCode ||
    item === SessionItems.sessionToken ||
    item === SessionItems.useremail
  );

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
          | PaymentCheckData
          | Wallet
          | Cart
          | ReturnUrls)
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
    | PaymentCheckData
    | Wallet
    | Cart
    | ReturnUrls
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
