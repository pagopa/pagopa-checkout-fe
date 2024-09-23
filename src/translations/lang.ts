import translationIT from "./it/translations.json";
import translationEN from "./en/translations.json";
import translationFR from "./fr/translations.json";
import translationDE from "./de/translations.json";
import translationSL from "./sl/translations.json";
import { CheckoutRoutes } from "../routes/models/routeModel";

const lang: Languages = {
  it: {
    label: "Italiano",
    lang: "it-IT",
    translation: translationIT,
  },
  en: {
    label: "English",
    lang: "en-EN",
    translation: translationEN,
  },
  fr: {
    label: "Français",
    lang: "fr-FR",
    translation: translationFR,
  },
  de: {
    label: "Deutsch",
    lang: "de-DE",
    translation: translationDE,
  },
  sl: {
    label: "Slovenščina",
    lang: "sl-SI",
    translation: translationSL,
  },
};

export function getSortedLang(): Array<{
  label: string;
  lang: string;
}> {
  // eslint-disable-next-line functional/immutable-data
  return Object.keys(lang)
    .sort()
    .reduce((obj: Array<{ label: string; lang: string }>, key: string) => {
      // eslint-disable-next-line functional/immutable-data
      obj.push(lang[key]);
      return obj;
    }, []);
}

export const langSelectVisibleOnPages = [
  CheckoutRoutes.ROOT,
  CheckoutRoutes.INSERISCI_DATI_AVVISO,
  CheckoutRoutes.DATI_PAGAMENTO,
  CheckoutRoutes.LEGGI_CODICE_QR,
  CheckoutRoutes.INSERISCI_EMAIL,
  CheckoutRoutes.SCEGLI_METODO
];

export default lang;