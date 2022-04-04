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
  const originUrl = loadState(SessionItems.originUrlRedirect) as string;
  sessionStorage.clear();
  sessionStorage.setItem(
    SessionItems.originUrlRedirect,
    JSON.stringify(originUrl)
  );
};
