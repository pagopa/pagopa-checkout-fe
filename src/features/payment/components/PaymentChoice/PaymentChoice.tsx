/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable functional/immutable-data */
import React from "react";
import { useNavigate } from "react-router";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import {
  PaymentMethodRoutes,
  TransactionMethods,
} from "../../../../routes/models/paymentMethodRoutes";
import { PaymentInstruments } from "../../models/paymentModel";
import { DisabledPaymentMethods, EnabledPaymentMethods } from "./PaymentMethod";

function groupByTypeCode(array: Array<PaymentInstruments>) {
  return array.reduce((acc, current) => {
    if (!acc[current.paymentTypeCode]) {
      acc[current.paymentTypeCode] = [];
    }

    acc[current.paymentTypeCode].push(current);
    return acc;
  }, {} as { [key: string]: Array<PaymentInstruments> });
}

function getSortedPaymentMethods(groupedMethods: {
  [key: string]: Array<PaymentInstruments>;
}) {
  const paymentMethods: Array<PaymentInstruments> = [];
  const methodCP = groupedMethods[TransactionMethods.CP]?.[0];
  const methodCC = groupedMethods[TransactionMethods.CC]?.[0];

  for (const key in groupedMethods) {
    if (
      key !== TransactionMethods.CP &&
      key !== TransactionMethods.CC &&
      PaymentMethodRoutes[key]
    ) {
      paymentMethods.push(groupedMethods[key][0]);
    }
  }

  const sortedMethods = paymentMethods.sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  methodCC && sortedMethods.unshift(methodCC);
  methodCP && sortedMethods.unshift(methodCP);

  return sortedMethods;
}

export function PaymentChoice(props: {
  amount: number;
  paymentInstruments: Array<PaymentInstruments>;
  loading?: boolean;
}) {
  const navigate = useNavigate();

  const handleClickOnMethod = React.useCallback((paymentType: string) => {
    const route: string = PaymentMethodRoutes[paymentType]?.route;
    navigate(`/${route}`);
  }, []);

  const getPaymentMethods = React.useCallback(
    (status: "ENABLED" | "DISABLED" = "ENABLED") =>
      getSortedPaymentMethods(
        groupByTypeCode(
          props.paymentInstruments.filter((method) => method.status === status)
        )
      ),
    [props.amount, props.paymentInstruments]
  );

  return (
    <>
      {props.loading ? (
        Array(3)
          .fill(1)
          .map((_, index) => <ClickableFieldContainer key={index} loading />)
      ) : (
        <>
          <EnabledPaymentMethods
            methods={getPaymentMethods()}
            onClick={handleClickOnMethod}
          />
          <DisabledPaymentMethods methods={getPaymentMethods("DISABLED")} />
        </>
      )}
    </>
  );
}
