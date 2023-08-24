export type FieldsFormStatus = Map<
  keyof typeof IdFields | string,
  FieldFormStatus
>;

export interface FieldFormStatus {
  isValid?: boolean;
  errorCode: null | string;
  errorMessage: null | string;
}

export enum IdFields {
  CARD_NUMBER = "CARD_NUMBER",
  EXPIRATION_DATE = "EXPIRATION_DATE",
  SECURITY_CODE = "SECURITY_CODE",
  CARDHOLDER_NAME = "CARDHOLDER_NAME",
}
