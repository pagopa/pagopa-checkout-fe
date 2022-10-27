/* eslint-disable functional/immutable-data */
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MobileFriendlyIcon from "@mui/icons-material/MobileFriendly";
import { Chip, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";
import {
  PaymentMethodRoutes,
  TransactionMethods,
} from "../../../../routes/models/paymentMethodRoutes";
import { getConfigOrThrow } from "../../../../utils/config/config";
import { PaymentInstruments } from "../../models/paymentModel";

function ImageComponent(method: PaymentInstruments) {
  const theme = useTheme();
  const config = getConfigOrThrow();
  const [image, setImage] = React.useState<"main" | "alt">("main");
  const onError = React.useCallback(() => setImage("alt"), []);
  const imgSize = { width: "23px", height: "23px" };

  return image === "main" ? (
    <img
      src={config.CHECKOUT_PAGOPA_ASSETS_CDN + `/${method.paymentTypeCode}.png`}
      onError={onError}
      style={
        method.status === "DISABLED"
          ? { color: theme.palette.text.disabled, ...imgSize }
          : { color: theme.palette.text.primary, ...imgSize }
      }
    />
  ) : (
    <MobileFriendlyIcon
      color="primary"
      fontSize="small"
      sx={
        method.status === "DISABLED"
          ? { color: theme.palette.text.disabled }
          : {}
      }
    />
  );
}

export function PaymentChoice(props: {
  amount: number;
  paymentInstruments: Array<PaymentInstruments>;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleClickOnMethod = React.useCallback((paymentType: string) => {
    navigate(`/${PaymentMethodRoutes[paymentType]}`);
  }, []);

  const getPaymentsMethods = React.useCallback(
    (status: string = "ENABLED") =>
      props.paymentInstruments
        .filter((method) => method.status === status)
        .map((method, index) => makeMethodComponent(method, index)),
    [props.amount, props.paymentInstruments]
  );
  const makeMethodComponent = React.useCallback(
    (method: PaymentInstruments, index: number) => (
      <ClickableFieldContainer
        key={index}
        title={
          method.paymentTypeCode === TransactionMethods.CP
            ? "paymentChoicePage.creditCard"
            : method.name
        }
        onClick={() => handleClickOnMethod(method.paymentTypeCode)}
        icon={
          method.paymentTypeCode === TransactionMethods.CP ? (
            <CreditCardIcon
              color="primary"
              fontSize="small"
              sx={
                method.status === "DISABLED"
                  ? { color: theme.palette.text.disabled }
                  : {}
              }
            />
          ) : (
            <ImageComponent {...method} />
          )
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
      {props.loading
        ? Array(3)
            .fill(1)
            .map((_, index) => <ClickableFieldContainer key={index} loading />)
        : [getPaymentsMethods(), getPaymentsMethods("DISABLED")]}
      <ClickableFieldContainer
        title="paymentChoicePage.others"
        clickable={false}
        icon={<MobileFriendlyIcon color="primary" fontSize="small" />}
        endAdornment={
          <Chip label={t("paymentChoicePage.incoming")} color="secondary" />
        }
      />
    </>
  );
}
