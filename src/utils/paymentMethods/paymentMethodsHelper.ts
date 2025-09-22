import { PaymentInstrumentsType } from "features/payment/models/paymentModel";

export const getMethodDescriptionForCurrentLanguage = (
  method: PaymentInstrumentsType
): string => {
  const currentLanguage = localStorage.getItem("i18nextLng") ?? "IT";
  // case insensitive vs backend response
  const selectedKey =
    Object.keys(method.description).find(
      (key) => key.toUpperCase() === currentLanguage.toUpperCase()
    ) ?? "IT";
  return method.description[selectedKey] ?? method.description.IT;
};

export const getMethodNameForCurrentLanguage = (
  method: PaymentInstrumentsType
): string => {
  const currentLanguage = localStorage.getItem("i18nextLng") ?? "IT";
  // case insensitive vs backend response
  const selectedKey =
    Object.keys(method.name).find(
      (key) => key.toUpperCase() === currentLanguage.toUpperCase()
    ) ?? "IT";
  return method.name[selectedKey] ?? method.name.IT;
};
