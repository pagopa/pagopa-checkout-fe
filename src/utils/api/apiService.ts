/* eslint-disable sonarjs/cognitive-complexity */
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";
import {
  Cart,
  PaymentCheckData,
  PaymentEmailFormFields,
  PaymentFormFields,
  PaymentId,
  PaymentInfo,
  PaymentMethod,
  PspSelected,
  ReturnUrls,
  Wallet,
  Transaction,
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

export function getPaymentMethod(): PaymentMethod {
  const paymentMethod = loadState(SessionItems.paymentMethod) as
    | PaymentMethod
    | undefined;
  return {
    paymentTypeCode: paymentMethod?.paymentTypeCode || "",
    paymentMethodId: paymentMethod?.paymentMethodId || "",
  };
}

export function getPspSelected(): PspSelected {
  const pspSelected = loadState(SessionItems.pspSelected) as
    | PspSelected
    | undefined;
  return {
    pspCode: pspSelected?.pspCode || "",
    businessName: pspSelected?.businessName || "",
    fee: pspSelected?.fee || 0,
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
    returnOkUrl: data?.returnOkUrl || "/",
    returnErrorUrl: data?.returnErrorUrl || "/",
    returnCancelUrl: data?.returnCancelUrl || "/",
  };
}

export function getTransaction(): Transaction {
  const data = loadState(SessionItems.transaction) as Transaction | undefined;
  return {
    transactionId: data?.transactionId || "",
    status: data?.status || TransactionStatusEnum.AUTHORIZATION_FAILED,
    payments: data?.payments || [],
    feeTotal: data?.feeTotal,
    clientId: data?.clientId,
    authToken: data?.authToken,
  };
}

export function setReturnUrls(item: ReturnUrls) {
  sessionStorage.setItem(SessionItems.originUrlRedirect, JSON.stringify(item));
}

export function setCart(item: Cart) {
  sessionStorage.setItem(SessionItems.cart, JSON.stringify(item));
}

export function setPaymentId(item: PaymentId) {
  sessionStorage.setItem(SessionItems.paymentId, JSON.stringify(item));
}

export function setPaymentMethodId(item: PaymentMethod) {
  sessionStorage.setItem(SessionItems.paymentMethod, JSON.stringify(item));
}

export function setPspSelected(item: PspSelected) {
  sessionStorage.setItem(SessionItems.pspSelected, JSON.stringify(item));
}

export function setEmailInfo(item: PaymentEmailFormFields) {
  sessionStorage.setItem(SessionItems.useremail, JSON.stringify(item.email));
}

export function setPaymentInfo(item: PaymentInfo) {
  sessionStorage.setItem(SessionItems.paymentInfo, JSON.stringify(item));
}

export function setRptId(item: PaymentFormFields) {
  sessionStorage.setItem(SessionItems.noticeInfo, JSON.stringify(item));
}

export function setTransaction(item: Transaction) {
  sessionStorage.setItem(SessionItems.transaction, JSON.stringify(item));
}
