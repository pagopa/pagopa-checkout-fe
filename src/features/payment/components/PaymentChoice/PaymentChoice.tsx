/* eslint-disable @typescript-eslint/no-empty-function */
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useTheme } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import { PaymentMethodRoutes } from "../../../../routes/models/paymentMethodRoutes";
import { validateRange } from "../../../../utils/form/validators";
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

  const getPaymentsMethods = React.useCallback(
    (status: string = "ENABLED") =>
      props.paymentInstruments
        .filter(
          (method) =>
            !!method.ranges.filter((range) =>
              validateRange(props.amount, range)
            ).length
        )
        .filter((method) => method.status === status)
        .map((method, index) => makeMethodComponent(method, index)),
    [props.amount, props.paymentInstruments]
  );
  const makeMethodComponent = React.useCallback(
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
          method.status === "ENABLED" && (
            <ArrowForwardIosIcon
              sx={{ color: "primary.main" }}
              fontSize="small"
            />
          )
        }
        disabled={method.status === "DISABLED"}
        clickable={method.status === "ENABLED"}
      />
    ),
    []
  );

  return (
    <>
      {getPaymentsMethods()}
      {getPaymentsMethods("DISABLED")}
    </>
  );
}
