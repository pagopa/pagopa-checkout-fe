export const URL: {
  CHECKOUT_URL: string;
  CHECKOUT_URL_AFTER_AUTHORIZATION: string;
  CHECKOUT_ESITO_V2_BASE_URL: string;
  CHECKOUT_URL_PAYMENT_SUMMARY: string;
  CHECKOUT_URL_PSP_LIST: string;
  BASE_CALLBACK_URL: string;
  BASE_CALLBACK_URL_PAYMENT_DATA: string;
  BASE_CALLBACK_URL_REGEX: string;
  CALLBACK_URL_NO_CODE: string;
  CALLBACK_URL_NO_STATE: string;
  PAGE_LOGIN_COMEBACK_URL: string;
  PAYMENT_METHODS_PAGE: string;
  INSERT_CARD_PAGE: string;
  FEATURE_FLAG_PATH: string;
  SITE_URL: string;
};

export const OKPaymentInfo: {
  VALID_RPTID: string;
  VALID_NOTICE_CODE: string;
  VALID_FISCAL_CODE: string;
  EMAIL: string;
  VALID_CARD_DATA: {
    number: string;
    expirationDate: string;
    ccv: string;
    holderName: string;
  };
};

export const KORPTIDs: Record<string, string>;

export const KONoticeCodes: Record<string, string>;
