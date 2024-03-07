import React from "react";
import mixpanel from "mixpanel-browser";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import { PaymentMethodRoutes } from "../../../../routes/models/paymentMethodRoutes";
import {
  SessionItems,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";
import {
  PaymentCodeType,
  PaymentCodeTypeEnum,
  PaymentInstrumentsType,
} from "../../models/paymentModel";
import { PAYMENT_METHODS_CHOICE } from "../../../../utils/config/mixpanelDefs";
import { DisabledPaymentMethods, MethodComponentList } from "./PaymentMethod";

const shouldBeFirst = (method: PaymentInstrumentsType) =>
  method.paymentTypeCode === PaymentCodeTypeEnum.CP;

const sortMethods = (a: PaymentInstrumentsType, b: PaymentInstrumentsType) => {
  if (shouldBeFirst(a)) {
    return -1;
  } else if (shouldBeFirst(b)) {
    return 1;
  }
  return a.name.localeCompare(b.name);
};

const getNormalizedMethods = (
  paymentInstruments: Array<PaymentInstrumentsType>
) => {
  const { methods, duplicatedMethods } = paymentInstruments.reduce<{
    foundTypes: Array<PaymentCodeType>;
    methods: Array<PaymentInstrumentsType>;
    duplicatedMethods: Array<PaymentInstrumentsType>;
  }>(
    (acc, method) =>
      acc.foundTypes.includes(method.paymentTypeCode)
        ? { ...acc, duplicatedMethods: acc.duplicatedMethods.concat(method) }
        : {
            ...acc,
            methods: acc.methods.concat(method),
            foundTypes: acc.foundTypes.concat(method.paymentTypeCode),
          },
    {
      foundTypes: [],
      methods: [],
      duplicatedMethods: [],
    }
  );

  const { enabled, disabled } = methods.reduce<{
    enabled: Array<PaymentInstrumentsType>;
    disabled: Array<PaymentInstrumentsType>;
  }>(
    (acc, method) =>
      method.status === "ENABLED"
        ? { ...acc, enabled: acc.enabled.concat(method) }
        : { ...acc, disabled: acc.disabled.concat(method) },
    { disabled: [], enabled: [] }
  );
  return {
    enabled: enabled.slice().sort(sortMethods),
    disabled: disabled.slice().sort(sortMethods),
    duplicatedMethods,
  };
};

export function PaymentChoice(props: {
  amount: number;
  paymentInstruments: Array<PaymentInstrumentsType>;
  loading?: boolean;
}) {
  const handleClickOnMethod = React.useCallback(
    (paymentTypeCode: PaymentCodeType, paymentMethodId: string) => {
      const route: string = PaymentMethodRoutes[paymentTypeCode]?.route;
      setSessionItem(SessionItems.paymentMethod, {
        paymentMethodId,
        paymentTypeCode,
      });
      mixpanel.track(PAYMENT_METHODS_CHOICE.value, {
        EVENT_ID: PAYMENT_METHODS_CHOICE.value,
        paymentTypeCode,
      });

      window.location.assign(`/${route}`);
    },
    []
  );

  const paymentMethods = React.useMemo(
    () => getNormalizedMethods(props.paymentInstruments),
    [props.amount, props.paymentInstruments]
  );

  return (
    <>
      {props.loading ? (
        Array.from({ length: 5 }, (_, index) => (
          <ClickableFieldContainer key={index} loading />
        ))
      ) : (
        <>
          <MethodComponentList
            methods={paymentMethods.enabled}
            onClick={handleClickOnMethod}
            testable
          />
          <DisabledPaymentMethods methods={paymentMethods.disabled} />
        </>
      )}
    </>
  );
}
