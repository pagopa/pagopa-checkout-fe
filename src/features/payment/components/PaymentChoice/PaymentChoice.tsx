import React from "react";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import { PaymentMethodRoutes } from "../../../../routes/models/paymentMethodRoutes";
import {
  SessionItems,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";
import { PaymentInstruments } from "../../models/paymentModel";
import { DisabledPaymentMethods, MethodComponentList } from "./PaymentMethod";

const sortMethods = (a: PaymentInstruments, b: PaymentInstruments) =>
  a.paymentTypeCode === "CP" ? -1 : a.label.localeCompare(b.label);

const getNormalizedMethods = (
  paymentInstruments: Array<PaymentInstruments>
) => {
  const { methods, duplicatedMethods } = paymentInstruments.reduce<{
    foundTypes: Array<string>;
    methods: Array<PaymentInstruments>;
    duplicatedMethods: Array<PaymentInstruments>;
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
    enabled: Array<PaymentInstruments>;
    disabled: Array<PaymentInstruments>;
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
  paymentInstruments: Array<PaymentInstruments>;
  loading?: boolean;
}) {
  const handleClickOnMethod = React.useCallback(
    (paymentType: string, paymentMethodId: string) => {
      const route: string =
        PaymentMethodRoutes[paymentType as keyof typeof PaymentMethodRoutes]
          ?.route;
      setSessionItem(SessionItems.paymentMethod, {
        paymentMethodId,
        paymentTypeCode: paymentType,
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
