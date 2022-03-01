import * as t from "io-ts";

export const TX_TO_BE_AUTHORIZED = t.literal(0);
export type TX_TO_BE_AUTHORIZED = t.TypeOf<typeof TX_TO_BE_AUTHORIZED>;

export const TX_PROCESSING = t.literal(1);
export type TX_PROCESSING = t.TypeOf<typeof TX_PROCESSING>;

export const TX_PROCESSING_MOD1 = t.literal(2);
export type TX_PROCESSING_MOD1 = t.TypeOf<typeof TX_PROCESSING_MOD1>;

export const TX_ACCEPTED = t.literal(3);
export type TX_ACCEPTED = t.TypeOf<typeof TX_ACCEPTED>;

export const TX_REFUSED = t.literal(4);
export type TX_REFUSED = t.TypeOf<typeof TX_REFUSED>;

export const TX_WAIT_FOR_3DS = t.literal(5);
export type TX_WAIT_FOR_3DS = t.TypeOf<typeof TX_WAIT_FOR_3DS>;

export const TX_ERROR = t.literal(6);
export type TX_ERROR = t.TypeOf<typeof TX_ERROR>;

export const TX_RESUMING_3DS = t.literal(7);
export type TX_RESUMING_3DS = t.TypeOf<typeof TX_RESUMING_3DS>;

export const TX_ACCEPTED_MOD1 = t.literal(8);
export type TX_ACCEPTED_MOD1 = t.TypeOf<typeof TX_ACCEPTED_MOD1>;

export const TX_ACCEPTED_MOD2 = t.literal(9);
export type TX_ACCEPTED_MOD2 = t.TypeOf<typeof TX_ACCEPTED_MOD2>;

export const TX_ERROR_FROM_PSP = t.literal(10);
export type TX_ERROR_FROM_PSP = t.TypeOf<typeof TX_ERROR_FROM_PSP>;

export const TX_MISSING_CALLBACK_FROM_PSP = t.literal(11);
export type TX_MISSING_CALLBACK_FROM_PSP = t.TypeOf<
  typeof TX_MISSING_CALLBACK_FROM_PSP
>;

export const TX_DIFFERITO_MOD1 = t.literal(12);
export type TX_DIFFERITO_MOD1 = t.TypeOf<typeof TX_DIFFERITO_MOD1>;

export const TX_EXPIRED_3DS = t.literal(13);
export type TX_EXPIRED_3DS = t.TypeOf<typeof TX_EXPIRED_3DS>;

export const TX_ACCEPTED_NODO_TIMEOUT = t.literal(14);
export type TX_ACCEPTED_NODO_TIMEOUT = t.TypeOf<
  typeof TX_ACCEPTED_NODO_TIMEOUT
>;

export const UNKNOWN = t.literal(-1);
export type UNKNOWN = t.TypeOf<typeof UNKNOWN>;

export const TX_WAIT_FOR_3DS2_ACS_METHOD = t.literal(15);
export type TX_WAIT_FOR_3DS2_ACS_METHOD = t.TypeOf<
  typeof TX_WAIT_FOR_3DS2_ACS_METHOD
>;

export const TX_WAIT_FOR_3DS2_ACS_CHALLENGE = t.literal(16);
export type TX_WAIT_FOR_3DS2_ACS_CHALLENGE = t.TypeOf<
  typeof TX_WAIT_FOR_3DS2_ACS_CHALLENGE
>;

export const TX_RESUME_3DS2_ACS_METHOD = t.literal(17);
export type TX_RESUME_3DS2_ACS_METHOD = t.TypeOf<
  typeof TX_RESUME_3DS2_ACS_METHOD
>;

export const TX_RESUME_3DS2_ACS_CHALLENGE = t.literal(18);
export type TX_RESUME_3DS2_ACS_CHALLENGE = t.TypeOf<
  typeof TX_RESUME_3DS2_ACS_CHALLENGE
>;

export const GENERIC_STATUS = t.number;
export type GENERIC_STATUS = t.TypeOf<typeof GENERIC_STATUS>;
