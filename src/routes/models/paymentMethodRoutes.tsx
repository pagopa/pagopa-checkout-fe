import { Theme } from "@emotion/react";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { SxProps } from "@mui/material";
import { PaymentCodeType } from "features/payment/models/paymentModel";
import * as React from "react";
import { CheckoutRoutes } from "./routeModel";

export interface PaymentMethodAttr {
  label?: string;
  asset?: (sx: SxProps<Theme>) => JSX.Element;
  route: string;
}
type PaymentTypecode = Record<PaymentCodeType, PaymentMethodAttr>;

export const PaymentMethodRoutes: PaymentTypecode = {
  RBPP: {
    route: "",
  },
  CP: {
    label: "paymentMethods.cp",
    asset: (sx: SxProps<Theme>) => (
      <CreditCardIcon color="primary" fontSize="small" sx={sx} />
    ),
    route: CheckoutRoutes.INSERISCI_CARTA,
  },
  RBPR: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  RBPB: {
    route: "",
  },
  RPIC: {
    route: "",
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
