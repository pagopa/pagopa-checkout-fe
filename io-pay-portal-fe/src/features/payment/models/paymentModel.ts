export interface PaymentFormFields {
  billCode: string;
  cf: string;
}

export interface PaymentFormErrors {
  billCode?: string;
  cf?: string;
}

export interface PaymentEmailFormFields {
  email: string;
  confirmEmail: string;
}

export interface PaymentEmailFormErrors {
  email?: string;
  confirmEmail?: string;
}

export interface InputCardFormFields {
  name: string;
  number: string;
  expirationDate: string;
  cvv: string;
}

export interface InputCardFormErrors {
  name?: string;
  number?: string;
  expirationDate?: string;
  cvv?: string;
}

export enum SecureCodeDigits {
  cvv = 3,
  cid = 4,
}

export const SecureCodeLabels: {
  [key: number]: { label: string; error: string };
} = {
  3: {
    label: "inputCardPage.formFields.cvv",
    error: "inputCardPage.formErrors.cvv",
  },
  4: {
    label: "inputCardPage.formFields.cid",
    error: "inputCardPage.formErrors.cid",
  },
};

export interface PaymentInfo {
  importoSingoloVersamento: number;
  codiceContestoPagamento: string;
  ibanAccredito: string;
  causaleVersamento: string;
  enteBeneficiario: {
    identificativoUnivocoBeneficiario: string;
    denominazioneBeneficiario: string;
  };
}

export interface PaymentId {
  idPagamento: string;
}

export interface PaymentCheckDetail {
  CCP: string;
  IUV: string;
  codicePagatore: string;
  enteBeneficiario: string;
  idDominio: string;
  importo: number;
  nomePagatore: string;
  tipoPagatore: string;
}
export interface PaymentCheckData {
  amount: {
    currency: string;
    amount: number;
    decimalDigits: number;
  };
  bolloDigitale: boolean;
  fiscalCode: string;
  iban: string;
  id: number;
  idPayment: string;
  isCancelled: boolean;
  origin: string;
  receiver: string;
  subject: string;
  urlRedirectEc: string;
  detailsList: Array<PaymentCheckDetail>;
}

export interface Wallet {
  creditCard: {
    brand: string;
    pan: string;
    holder: string;
    expireMonth: string;
    expireYear: string;
  };
  idWallet: number;
  psp: {
    businessName: string;
    directAcquire: false;
    fixedCost: {
      currency: string;
      amount: number;
      decimalDigits: number;
    };
    logoPSP: string;
    serviceAvailability: string;
  };
  pspEditable: false;
  type: string;
}

export interface SecurityCode {
  securityCode: string;
}

export interface PspList {
  name: string | undefined;
  label: string | undefined;
  image: string | undefined;
  commission: number;
  idPsp: number | undefined;
}
