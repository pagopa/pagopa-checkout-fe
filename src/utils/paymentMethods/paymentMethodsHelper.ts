import { PaymentInstrumentsType } from "features/payment/models/paymentModel";

export const getMethodDescriptionForCurrentLanguage = (
  method: PaymentInstrumentsType
): string => {
  // method or description might be undefined
  if (!method || !method.description) {
    return "";
  }

  const currentLanguage = localStorage.getItem("i18nextLng") ?? "IT";

  // description might be a string instead of an object
  if (typeof method.description === "string") {
    return method.description;
  }

  // make sure desc is an object before accessing keys
  if (typeof method.description !== "object" || method.description === null) {
    return "";
  }

  // case insensitive vs backend response
  const selectedKey =
    Object.keys(method.description).find(
      (key) => key.toUpperCase() === currentLanguage.toUpperCase()
    ) ?? "IT";
  return method.description[selectedKey] ?? method.description.IT ?? "";
};

export const getMethodNameForCurrentLanguage = (
  method: PaymentInstrumentsType
): string => {
  // method or name might be undefined
  if (!method || !method.name) {
    return "";
  }

  const currentLanguage = localStorage.getItem("i18nextLng") ?? "IT";

  // name might be a string instead of an object
  if (typeof method.name === "string") {
    return method.name;
  }

  // make sure name is an object before accessing keys
  if (typeof method.name !== "object" || method.name === null) {
    return "";
  }

  // case insensitive vs backend response
  const selectedKey =
    Object.keys(method.name).find(
      (key) => key.toUpperCase() === currentLanguage.toUpperCase()
    ) ?? "IT";
  return method.name[selectedKey] ?? method.name.IT ?? "";
};
