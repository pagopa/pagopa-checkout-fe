/* eslint-disable sonarjs/cognitive-complexity */
import {
  Cart,
  PaymentCheckData,
  PaymentEmailFormFields,
  PaymentFormFields,
  PaymentId,
  PaymentInfo,
  ReturnUrls,
  Wallet,
} from "../../features/payment/models/paymentModel";
import { getConfigOrThrow } from "../config/config";
import { loadState, SessionItems } from "../storage/sessionStorage";
import { paymentSubjectTransform } from "../transformers/paymentTransformers";

export function getReCaptchaKey() {
  return getConfigOrThrow().CHECKOUT_RECAPTCHA_SITE_KEY;
}

export function getNoticeInfo(): PaymentFormFields {
  const noticeInfo = loadState(SessionItems.noticeInfo) as
    | PaymentFormFields
    | undefined;
  return {
    billCode: noticeInfo?.billCode || "",
    cf: noticeInfo?.cf || "",
  };
}

export function getPaymentInfo(): PaymentInfo {
  const paymentInfo = loadState(SessionItems.paymentInfo) as
    | PaymentInfo
    | undefined;
  return {
    amount: paymentInfo?.amount || 0,
    paymentContextCode: paymentInfo?.paymentContextCode || "",
    rptId: paymentInfo?.rptId || "",
    paFiscalCode: paymentInfo?.paFiscalCode || "",
    paName: paymentInfo?.paName || "",
    description: paymentInfo?.description || "",
    dueDate: paymentInfo?.dueDate || "",
  };
}

export function getEmailInfo(noConfirmEmail = false): PaymentEmailFormFields {
  const emailInfo = loadState(SessionItems.useremail) as string | undefined;
  return {
    email: emailInfo || "",
    confirmEmail: noConfirmEmail ? "" : emailInfo || "",
  };
}

export function getPaymentId(): PaymentId {
  const id = loadState(SessionItems.paymentId) as PaymentId | undefined;
  return {
    paymentId: id?.paymentId || "",
  };
}

export function getCheckData(): PaymentCheckData {
  const data = loadState(SessionItems.checkData) as
    | PaymentCheckData
    | undefined;
  return {
    amount: {
      currency: data?.amount?.currency || "",
      amount: data?.amount?.amount || 0,
      decimalDigits: data?.amount?.decimalDigits || 0,
    },
    bolloDigitale: data?.bolloDigitale || false,
    fiscalCode: data?.fiscalCode || "",
    iban: data?.iban || "",
    id: data?.id || 0,
    idPayment: data?.idPayment || "",
    isCancelled: data?.isCancelled || false,
    origin: data?.origin || "",
    receiver: data?.receiver || "",
    subject: paymentSubjectTransform(data?.subject) || "",
    urlRedirectEc: data?.urlRedirectEc || "",
    detailsList: data?.detailsList || [],
  };
}

export function getWallet(): Wallet {
  const data = loadState(SessionItems.wallet) as Wallet | undefined;
  return {
    creditCard: {
      brand: data?.creditCard?.brand || "",
      pan: data?.creditCard?.pan || "",
      holder: data?.creditCard?.holder || "",
      expireMonth: data?.creditCard?.expireMonth || "",
      expireYear: data?.creditCard?.expireYear || "",
    },
    idWallet: data?.idWallet || 0,
    psp: {
      businessName: data?.psp?.businessName || "",
      directAcquire: data?.psp?.directAcquire || false,
      fixedCost: {
        currency: data?.psp?.fixedCost?.currency || "",
        amount: data?.psp?.fixedCost?.amount || 0,
        decimalDigits: data?.psp?.fixedCost?.decimalDigits || 0,
      },
      logoPSP: data?.psp?.logoPSP || "",
      serviceAvailability: data?.psp?.serviceAvailability || "",
    },
    pspEditable: data?.pspEditable || false,
    type: data?.type || "",
  };
}

export function getCart(): Cart | undefined {
  const data = loadState(SessionItems.cart) as Cart | undefined;
  return data
    ? {
        emailNotice: data?.emailNotice || "",
        paymentNotices:
          data?.paymentNotices?.map((notice) => ({
            noticeNumber: notice?.noticeNumber || "",
            fiscalCode: notice?.fiscalCode || "",
            amount: notice?.amount || 0,
            companyName: notice?.companyName || "",
            description: notice?.description || "",
          })) || [],
        returnUrls: {
          returnOkUrl: data?.returnUrls?.returnOkUrl || "",
          returnCancelUrl: data?.returnUrls?.returnCancelUrl || "",
          returnErrorUrl: data?.returnUrls?.returnErrorUrl || "",
        },
      }
    : undefined;
}

export function getReturnUrls(): ReturnUrls {
  const data = loadState(SessionItems.originUrlRedirect) as
    | ReturnUrls
    | undefined;
  return {
    returnOkUrl: data?.returnOkUrl || "",
    returnErrorUrl: data?.returnErrorUrl || "",
    returnCancelUrl: data?.returnCancelUrl || "",
  };
}

export function setReturnUrls(item: ReturnUrls) {
  sessionStorage.setItem(SessionItems.originUrlRedirect, JSON.stringify(item));
}

export function setCart(item: Cart) {
  sessionStorage.setItem(SessionItems.cart, JSON.stringify(item));
}

export function setWallet(item: Wallet) {
  sessionStorage.setItem(SessionItems.wallet, JSON.stringify(item));
}

export function setPaymentId(item: PaymentId) {
  sessionStorage.setItem(SessionItems.paymentId, JSON.stringify(item));
}

export function setEmailInfo(item: PaymentEmailFormFields) {
  sessionStorage.setItem(SessionItems.useremail, JSON.stringify(item.email));
}

export function setCheckData(item: PaymentCheckData) {
  sessionStorage.setItem(SessionItems.checkData, JSON.stringify(item));
}

export function setPaymentInfo(item: PaymentInfo) {
  sessionStorage.setItem(SessionItems.paymentInfo, JSON.stringify(item));
}

export function setRptId(item: PaymentFormFields) {
  sessionStorage.setItem(SessionItems.noticeInfo, JSON.stringify(item));
}
