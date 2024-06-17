import translationIT from "./it/translations.json";

/**
 * adds type-safety to the react-i18next module
 */
declare module "react-i18next" {
  export interface Resources {
    translation: Translation;
  }
}
