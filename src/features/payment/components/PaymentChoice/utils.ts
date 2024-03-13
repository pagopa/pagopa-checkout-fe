import {
  PaymentInstrumentsType,
  PaymentCodeTypeEnum,
  PaymentCodeType,
} from "../../models/paymentModel";
import { PaymentMethodStatusEnum } from "../../../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";

const isFirstPaymentMethod = (method: PaymentInstrumentsType) =>
  method.paymentTypeCode === PaymentCodeTypeEnum.CP;

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
