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

/**
 * return a `TemplateStringsArray` value from a key string value.
 * This function is used to handle the case of calling `useTranslation` when the key to be searched is variable and not known in advance."
 * @param key contain the key used to search the text related to the translation structure
 * @returns a Normalize translation, needed by i18n-react module for the search of the key.
 */
export function normalizeKey(key: string | undefined): TemplateStringsArray {
  return key
    ? (key as unknown as TemplateStringsArray)
    : ("" as unknown as TemplateStringsArray);
}

export default lang;
