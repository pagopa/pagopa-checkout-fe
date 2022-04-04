import {
  PaymentCheckData,
  PaymentFormFields,
  PaymentId,
  PaymentInfo,
  SecurityCode,
  Wallet,
} from "../../features/payment/models/paymentModel";

export enum SessionItems {
  paymentInfo = "paymentInfo",
  noticeInfo = "rptId",
  useremail = "useremail",
  paymentId = "paymentId",
  checkData = "checkData",
  securityCode = "securityCode",
  wallet = "wallet",
  originUrlRedirect = "originUrlRedirect",
  sessionToken = "sessionToken",
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
      | Wallet
      | SecurityCode;
  } catch (e) {
    return undefined;
  }
};

export const isStateEmpty = (item: string) => !loadState(item);

export const clearSensitiveItems = () => {
  sessionStorage.removeItem(SessionItems.checkData);
  sessionStorage.removeItem(SessionItems.noticeInfo);
  sessionStorage.removeItem(SessionItems.paymentId);
  sessionStorage.removeItem(SessionItems.paymentInfo);
  sessionStorage.removeItem(SessionItems.wallet);
  sessionStorage.removeItem(SessionItems.useremail);
  sessionStorage.removeItem(SessionItems.securityCode);
  sessionStorage.removeItem(SessionItems.sessionToken);
};
