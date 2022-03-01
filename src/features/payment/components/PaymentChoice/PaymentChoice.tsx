/* eslint-disable @typescript-eslint/no-empty-function */
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MobileFriendlyIcon from "@mui/icons-material/MobileFriendly";
import { Chip } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import ClickableFieldContainer from "../../../../components/TextFormField/ClickableFieldContainer";

export function PaymentChoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split("/")[1];

  const handleClickOnCard = React.useCallback(() => {
    navigate(`/${currentPath}/email`);
  }, []);

  return (
    <>
      <ClickableFieldContainer
        title="paymentChoicePage.creditCard"
        onClick={handleClickOnCard}
        icon={<CreditCardIcon color="primary" fontSize="small" />}
        endAdornment={
          <ArrowForwardIosIcon
            sx={{ color: "primary.main" }}
            fontSize="small"
          />
        }
      />
      <ClickableFieldContainer
        title="paymentChoicePage.bank"
        onClick={() => {}}
        clickable={false}
        icon={<AccountBalanceIcon color="primary" fontSize="small" />}
        endAdornment={
          <Chip label={t("paymentChoicePage.incoming")} color="secondary" />
        }
      />
      <ClickableFieldContainer
        title="paymentChoicePage.others"
        onClick={() => {}}
        clickable={false}
        icon={<MobileFriendlyIcon color="primary" fontSize="small" />}
        endAdornment={
          <Chip label={t("paymentChoicePage.incoming")} color="secondary" />
        }
      />
    </>
  );
}
