import {
  PaymentInstrumentsType,
  PaymentCodeTypeEnum,
  PaymentCodeType,
  PaymentInstrumentsTypeV2,
} from "../../models/paymentModel";
import { PaymentMethodStatusEnum } from "../../../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import {
  PaymentTypeCodeEnum,
  StatusEnum,
} from "../../../../../generated/definitions/payment-ecommerce-v2/PaymentMethodResponse";

const isFirstPaymentMethod = (method: PaymentInstrumentsType) =>
  method.paymentTypeCode === PaymentCodeTypeEnum.CP;

const isFirstPaymentMethodV2 = (method: PaymentInstrumentsTypeV2) =>
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

const compareMethodsV2 = (
  a: PaymentInstrumentsTypeV2,
  b: PaymentInstrumentsTypeV2
) => {
  if (isFirstPaymentMethodV2(a)) {
    return -1;
  } else if (isFirstPaymentMethodV2(b)) {
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
  paymentInstruments: Array<PaymentInstrumentsType>
) => {
  const { methods, duplicatedMethods } = paymentInstruments.reduce<{
    foundTypes: Array<PaymentCodeType>;
    methods: Array<PaymentInstrumentsType>;
    duplicatedMethods: Array<PaymentInstrumentsType>;
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
    enabledMethods: Array<PaymentInstrumentsType>;
    disabledMethods: Array<PaymentInstrumentsType>;
  }>(
    ({ enabledMethods, disabledMethods }, method) =>
      method.status === PaymentMethodStatusEnum.ENABLED
        ? { disabledMethods, enabledMethods: enabledMethods.concat(method) }
        : { enabledMethods, disabledMethods: disabledMethods.concat(method) },
    { disabledMethods: [], enabledMethods: [] }
  );

  return {
    enabled: enabledMethods.slice().sort(compareMethods),
    disabled: disabledMethods.slice().sort(compareMethods),
    duplicatedMethods,
  };
};

export const getNormalizedMethodsV2 = (
  paymentInstruments: Array<PaymentInstrumentsTypeV2>
) => {
  const { methods, duplicatedMethods } = paymentInstruments.reduce<{
    foundTypes: Array<PaymentTypeCodeEnum>;
    methods: Array<PaymentInstrumentsTypeV2>;
    duplicatedMethods: Array<PaymentInstrumentsTypeV2>;
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
    enabledMethods: Array<PaymentInstrumentsTypeV2>;
    disabledMethods: Array<PaymentInstrumentsTypeV2>;
  }>(
    ({ enabledMethods, disabledMethods }, method) =>
      method.status === StatusEnum.ENABLED
        ? { disabledMethods, enabledMethods: enabledMethods.concat(method) }
        : { enabledMethods, disabledMethods: disabledMethods.concat(method) },
    { disabledMethods: [], enabledMethods: [] }
  );

  return {
    enabled: enabledMethods.slice().sort(compareMethodsV2),
    disabled: disabledMethods.slice().sort(compareMethodsV2),
    duplicatedMethods,
  };
};
