import {
  Cart,
  PaymentCheckData,
  PaymentFormFields,
  PaymentId,
  PaymentInfo,
  ReturnUrls,
  Wallet,
} from "../../features/payment/models/paymentModel";
import { getReturnUrls, setReturnUrls } from "../api/apiService";

export enum SessionItems {
  paymentInfo = "paymentInfo",
  noticeInfo = "rptId",
  useremail = "useremail",
  paymentId = "paymentId",
  checkData = "checkData",
  wallet = "wallet",
  originUrlRedirect = "originUrlRedirect",
  sessionToken = "sessionToken",
  cart = "cart",
  transaction = "transaction",
}
export const loadState = (item: string) => {
  try {
    const serializedState = sessionStorage.getItem(item);

    if (!serializedState) {
      return undefined;
    }
    return JSON.parse(serializedState) as
      | string
      | PaymentInfo
      | PaymentFormFields
      | PaymentId
      | PaymentCheckData
      | ReturnUrls
      | Cart
      | Wallet;
  } catch (e) {
    return undefined;
  }
};

export const isStateEmpty = (item: string) => !loadState(item);

export const clearSensitiveItems = () => {
  const originUrl = getReturnUrls();
  sessionStorage.clear();
  setReturnUrls(originUrl);
};
