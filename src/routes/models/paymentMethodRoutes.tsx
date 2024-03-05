import { Theme } from "@emotion/react";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import MobileFriendlyIcon from "@mui/icons-material/MobileFriendly";
import { SxProps } from "@mui/material";
import { PaymentMethodCodeTypes } from "features/payment/models/paymentModel";
import * as React from "react";

interface PaymentMethodAttr {
  label?: string;
  asset?: (sx: SxProps<Theme>) => JSX.Element;
  route: string;
}
type PaymentTypecode = Record<PaymentMethodCodeTypes, PaymentMethodAttr>;

export const PaymentMethodRoutes: PaymentTypecode = {
  RBPP: {
    label: "paymentMethods.ppay",
    asset: (sx: SxProps<Theme>) => (
      <MobileFriendlyIcon color="primary" fontSize="small" sx={sx} />
    ),
    route: "inserisci-carta",
  },
  CP: {
    label: "paymentMethods.cp",
    asset: (sx: SxProps<Theme>) => (
      <CreditCardIcon color="primary" fontSize="small" sx={sx} />
    ),
    route: "inserisci-carta",
  },
  RBPR: {
    route: "",
  },
  RBPB: {
    route: "",
  },
  RPIC: {
    route: "",
    asset: (sx: SxProps<Theme>) => (
      <AccountBalanceIcon color="primary" fontSize="small" sx={sx} />
    ),
  },
  RBPS: {
    route: "",
  },
  BPAY: {
    route: "",
  },
  APPL: {
    route: "",
  },
  GOOG: {
    route: "",
  },
  MYBK: {
    route: "",
  },
  SATY: {
    route: "",
  },
};
