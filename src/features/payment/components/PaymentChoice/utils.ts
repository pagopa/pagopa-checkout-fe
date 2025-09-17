import {
  PaymentInstrumentsType,
  PaymentCodeTypeEnum,
  PaymentCodeType,
  PaymentInstrumentsTypeV4,
} from "../../models/paymentModel";
import { PaymentMethodStatusEnum } from "../../../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import {
  PaymentTypeCodeEnum,
} from "../../../../../generated/definitions/payment-ecommerce-v2/PaymentMethodResponse";

const isFirstPaymentMethod = (method: PaymentInstrumentsType) =>
  method.paymentTypeCode === PaymentCodeTypeEnum.CP;

const isFirstPaymentMethodV4 = (method: PaymentInstrumentsTypeV4) =>
  method.paymentTypeCode === PaymentTypeCodeEnum.CP;

const compareMethods = (
  a: PaymentInstrumentsType,
  b: PaymentInstrumentsType
) => {
  if (isFirstPaymentMethod(a)) {
    return -1;
  } else if (isFirstPaymentMethod(b)) {
    return 1;
  }

  // If not the first payment method, sort by description
  return a.description.localeCompare(b.description);
};

const compareMethodsV4 = (
  a: PaymentInstrumentsTypeV4,
  b: PaymentInstrumentsTypeV4
) => {
  if (isFirstPaymentMethodV4(a)) {
    return -1;
  } else if (isFirstPaymentMethodV4(b)) {
    return 1;
  }
  const currentLanguage = (
    localStorage.getItem("i18nextLng") ?? "IT"
  ).toUpperCase();
  // If not the first payment method, sort by description
  const aMethodDescription = a.description[currentLanguage] ?? a.description.IT;
  const bMethodDescription = b.description[currentLanguage] ?? b.description.IT;
  return aMethodDescription.localeCompare(bMethodDescription);
};

export const getNormalizedMethods = (
  paymentInstruments: Array<PaymentInstrumentsType> | Array<PaymentInstrumentsTypeV4>
) => {
  const { methods, duplicatedMethods } = paymentInstruments.reduce<{
    foundTypes: Array<PaymentCodeType | PaymentTypeCodeEnum>;
    methods: Array<PaymentInstrumentsType | PaymentInstrumentsTypeV4>;
    duplicatedMethods: Array<PaymentInstrumentsType | PaymentInstrumentsTypeV4>;
  }>(
    ({ foundTypes, duplicatedMethods, methods }, method) => {
      if (foundTypes.includes(method.paymentTypeCode)) {
        return {
          duplicatedMethods: duplicatedMethods.concat(method),
          foundTypes,
          methods,
        };
      } else {
        return {
          duplicatedMethods,
          foundTypes: foundTypes.concat(method.paymentTypeCode),
          methods: methods.concat(method),
        };
      }
    },
    {
      foundTypes: [],
      methods: [],
      duplicatedMethods: [],
    }
  );

  const { enabledMethods, disabledMethods } = methods.reduce<{
    enabledMethods: Array<PaymentInstrumentsType | PaymentInstrumentsTypeV4>;
    disabledMethods: Array<PaymentInstrumentsType | PaymentInstrumentsTypeV4>;
  }>(
    ({ enabledMethods, disabledMethods }, method) =>
      method.status === PaymentMethodStatusEnum.ENABLED
        ? { disabledMethods, enabledMethods: enabledMethods.concat(method) }
        : { enabledMethods, disabledMethods: disabledMethods.concat(method) },
    { disabledMethods: [], enabledMethods: [] }
  );

  const isV4 = methods.length > 0 && typeof methods[0].description === 'object';
  const sortFunction = isV4 ? compareMethodsV4 : compareMethods;

  return {
    enabled: enabledMethods.slice().sort(sortFunction as any),
    disabled: disabledMethods.slice().sort(sortFunction as any),
    duplicatedMethods,
  };
};

