import { Theme } from "@emotion/react";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MobileFriendlyIcon from "@mui/icons-material/MobileFriendly";
import { SxProps } from "@mui/material";
import * as React from "react";

export const PaymentMethodRoutes = {
  PPAY: {
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
  CC: {
    label: "paymentMethods.cc",
    asset: (sx: SxProps<Theme>) => (
      <AccountBalanceIcon color="primary" fontSize="small" sx={sx} />
    ),
    route: "inserisci-carta",
  },
};
