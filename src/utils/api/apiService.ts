import {
  PaymentCheckData,
  PaymentEmailFormFields,
  PaymentFormFields,
  PaymentId,
  PaymentInfo,
  Wallet,
} from "../../features/payment/models/paymentModel";
import { getConfig } from "../config/config";
import { loadState, SessionItems } from "../storage/sessionStorage";

export function getReCaptchaKey() {
  return getConfig("IO_PAY_PORTAL_SITE_KEY");
}

export function getNoticeInfo() {
  const noticeInfo = loadState(SessionItems.noticeInfo) as PaymentFormFields;
  return {
    billCode: noticeInfo?.billCode || "",
    cf: noticeInfo?.cf || "",
  };
}

export function getPaymentInfo() {
  const paymentInfo = loadState(SessionItems.paymentInfo) as PaymentInfo;
  return {
    importoSingoloVersamento: paymentInfo?.importoSingoloVersamento || 0,
    enteBeneficiario: paymentInfo.enteBeneficiario
      ? {
          denominazioneBeneficiario:
            paymentInfo?.enteBeneficiario?.denominazioneBeneficiario || "",
          identificativoUnivocoBeneficiario:
            paymentInfo?.enteBeneficiario?.identificativoUnivocoBeneficiario ||
            "",
        }
      : undefined,
    causaleVersamento: paymentInfo.causaleVersamento
      ? paymentInfo.causaleVersamento
      : undefined,
    codiceContestoPagamento: paymentInfo?.codiceContestoPagamento || "",
    ibanAccredito: paymentInfo.ibanAccredito
      ? paymentInfo.ibanAccredito
      : undefined,
  };
}

export function getEmailInfo() {
  const emailInfo = loadState(SessionItems.useremail) as string;
  return {
    email: emailInfo || "",
    confirmEmail: emailInfo || "",
  };
}

export function getPaymentId() {
  const id = loadState(SessionItems.paymentId) as PaymentId;
  return {
    paymentId: id?.idPagamento || "",
  };
}

export function getCheckData() {
  const data = loadState(SessionItems.checkData) as PaymentCheckData;
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
    subject: data?.subject || "",
    urlRedirectEc: data?.urlRedirectEc || "",
    detailsList: data?.detailsList || [],
  };
}

export function getWallet() {
  const data = loadState(SessionItems.wallet) as Wallet;
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

export function setWaller(item: Wallet) {
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
