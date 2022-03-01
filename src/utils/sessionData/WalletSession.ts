import * as t from "io-ts";
import { enumType } from "italia-ts-commons/lib/types";

const CreditCard = t.exact(
  t.interface({
    expireMonth: t.string,

    expireYear: t.string,

    holder: t.string,

    pan: t.string,

    brand: t.string,
  })
);

type CreditCard = t.TypeOf<typeof CreditCard>;

const Amount = t.exact(
  t.interface({
    amount: t.Integer,

    currency: t.string,

    decimalDigits: t.Integer,
  })
);

type Amount = t.TypeOf<typeof Amount>;

const Psp = t.exact(
  t.interface({
    businessName: t.string,

    directAcquirer: t.boolean,

    fixedCost: Amount,

    logoPSP: t.string,

    serviceAvailability: t.string,
  })
);

type Psp = t.TypeOf<typeof Psp>;

enum TypeEnum {
  "CREDIT_CARD" = "CREDIT_CARD",

  "BANK_ACCOUNT" = "BANK_ACCOUNT",

  "EXTERNAL_PS" = "EXTERNAL_PS",
}

export const WalletSession = t.exact(
  t.interface({
    creditCard: CreditCard,

    idWallet: t.Integer,

    psp: Psp,

    pspEditable: t.boolean,

    type: enumType<TypeEnum>(TypeEnum, "type"),
  })
);

export type WalletSession = t.TypeOf<typeof WalletSession>;
