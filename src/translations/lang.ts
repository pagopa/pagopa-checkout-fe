import translationIT from "./it/translations.json";
import translationEN from "./en/translations.json";
import translationFR from "./fr/translations.json";
import translationDE from "./de/translations.json";
import translationSL from "./sl/translations.json";

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

export default lang;
