import {
  PaymentInstrumentsType,
  PaymentCodeTypeEnum,
  PaymentCodeType,
  PaymentInstrumentsTypeV4,
} from "../../models/paymentModel";
import { PaymentMethodStatusEnum } from "../../../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import { PaymentTypeCodeEnum } from "../../../../../generated/definitions/payment-ecommerce-v4/PaymentMethodResponse";

const isFirstPaymentMethod = (method: PaymentInstrumentsType | PaymentInstrumentsTypeV4) =>
  method.paymentTypeCode === PaymentCodeTypeEnum.CP;

const compareMethods = (
  a: PaymentInstrumentsType | PaymentInstrumentsTypeV4,
  b: PaymentInstrumentsType | PaymentInstrumentsTypeV4
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
  paymentInstruments: Array<PaymentInstrumentsType | PaymentInstrumentsTypeV4>
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

  return {
    enabled: enabledMethods.slice().sort(compareMethods),
    disabled: disabledMethods.slice().sort(compareMethods),
    duplicatedMethods,
  };
};
