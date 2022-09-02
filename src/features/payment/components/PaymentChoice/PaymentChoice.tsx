/* eslint-disable @typescript-eslint/no-empty-function */
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useTheme } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import { PaymentMethodRoutes } from "../../../../routes/models/paymentMethodRoutes";
import { PaymentInstruments } from "../../models/paymentModel";

export function PaymentChoice(props: {
  amount: number;
  paymentInstruments: Array<PaymentInstruments>;
}) {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleClickOnMethod = React.useCallback((paymentType: string) => {
    navigate(`/${PaymentMethodRoutes[paymentType]}`);
  }, []);

  const checkRange = (amount: number, range: { min: number; max: number }) =>
    amount >= range.min && amount <= range.max;
  const getPaymentsMethods = React.useCallback(
    (status: string = "ENABLED") =>
      props.paymentInstruments
        .filter(
          (method) =>
            !!method.ranges.filter((range) => checkRange(props.amount, range))
              .length
        )
        .filter((instrument) => instrument.status === status),
    [props.amount, props.paymentInstruments]
  );
  const getContainerComponent = React.useCallback(
    (method: PaymentInstruments, index: number) => (
      <ClickableFieldContainer
        key={index}
        title={
          method.name.toLowerCase() === "carte"
            ? "paymentChoicePage.creditCard"
            : method.name
        }
        onClick={() => handleClickOnMethod(method.paymentTypeCode)}
        icon={
          <CreditCardIcon
            color="primary"
            fontSize="small"
            sx={
              method.status === "DISABLED"
                ? { color: theme.palette.text.disabled }
                : {}
            }
          />
        }
        endAdornment={
          <ArrowForwardIosIcon
            sx={{ color: "primary.main" }}
            fontSize="small"
          />
        }
        disabled={method.status === "DISABLED"}
        clickable={method.status === "ENABLED"}
      />
    ),
    []
  );

  return (
    <>
      {getPaymentsMethods().map((method, index) =>
        getContainerComponent(method, index)
      )}
      {getPaymentsMethods("DISABLED").map((method, index) =>
        getContainerComponent(method, index)
      )}
    </>
  );
}
