import * as t from "io-ts";

const DettaglioR = t.interface({
  IUV: t.string,

  enteBeneficiario: t.string,

  importo: t.number,
});

const DettaglioO = t.partial({
  codicePagatore: t.string,

  nomePagatore: t.string,
});

const Dettaglio = t.intersection([DettaglioR, DettaglioO]);

type Dettaglio = t.TypeOf<typeof Dettaglio>;

const Amount = t.exact(
  t.interface({
    amount: t.Integer,

    currency: t.string,

    decimalDigits: t.Integer,
  })
);

type Amount = t.TypeOf<typeof Amount>;

const PaymentSessionR = t.interface({
  amount: Amount,

  detailsList: t.readonlyArray(Dettaglio, "array of Dettaglio"),

  idPayment: t.string,

  subject: t.string,
});

const PaymentSessionO = t.partial({
  fiscalCode: t.string,
});

export const PaymentSession = t.intersection([
  PaymentSessionR,
  PaymentSessionO,
]);

export type PaymentSession = t.TypeOf<typeof PaymentSession>;
