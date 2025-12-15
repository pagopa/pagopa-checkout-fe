import {
  MapField,
  PaymentInstrumentsType,
} from "features/payment/models/paymentModel";
import { LanguageEnum } from "../../../generated/definitions/payment-ecommerce/RequestAuthorizationRequest";

const italianLanguageKey = "IT";

export const getLanguage = (): LanguageEnum =>
  (localStorage.getItem("i18nextLng") ?? italianLanguageKey).toUpperCase() as LanguageEnum;

const getLanguageKey = (mapField: MapField): string => {
  const currentLanguage =
    localStorage.getItem("i18nextLng") ?? italianLanguageKey;
  // case insensitive vs backend response
  // default key is italian or the first received by the b.e.
  const defaultKey =
    Object.keys(mapField).find(
      (key) => key.toUpperCase() === italianLanguageKey
    ) ?? Object.keys(mapField)[0];
  return (
    Object.keys(mapField).find(
      (key) => key.toUpperCase() === currentLanguage.toUpperCase()
    ) ?? defaultKey
  );
};

export const getMethodDescriptionForCurrentLanguage = (
  method: PaymentInstrumentsType
): string => {
  const languageKey = getLanguageKey(method.description);
  return method.description[languageKey] ?? method.description.IT;
};

export const getMethodNameForCurrentLanguage = (
  method: PaymentInstrumentsType
): string => {
  const languageKey = getLanguageKey(method.name);
  return method.name[languageKey] ?? method.name.IT;
};
