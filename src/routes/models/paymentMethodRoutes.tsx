import { Theme } from "@emotion/react";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { SxProps } from "@mui/material";
import {
  PaymentCodeType,
  PaymentMethodAttr,
} from "features/payment/models/paymentModel";
import * as React from "react";
import { CheckoutRoutes } from "./routeModel";

type PaymentTypecode = Record<PaymentCodeType, PaymentMethodAttr>;

export const PaymentMethodRoutes: PaymentTypecode = {
  CP: {
    asset: (sx: SxProps<Theme>) => (
      <CreditCardIcon color="primary" fontSize="small" sx={sx} />
    ),
    route: CheckoutRoutes.INSERISCI_CARTA,
  },
  RBPP: {
    route: CheckoutRoutes.LISTA_PSP,
  },
  RBPR: {
    route: CheckoutRoutes.LISTA_PSP,
  },
  RBPB: {
    route: CheckoutRoutes.LISTA_PSP,
  },
  RPIC: {
    route: CheckoutRoutes.LISTA_PSP,
  },
  RBPS: {
    route: CheckoutRoutes.LISTA_PSP,
  },
  BPAY: {
    route: CheckoutRoutes.LISTA_PSP,
  },
  APPL: {
    route: CheckoutRoutes.LISTA_PSP,
  },
  GOOG: {
    route: CheckoutRoutes.LISTA_PSP,
  },
  MYBK: {
    route: CheckoutRoutes.LISTA_PSP,
  },
  SATY: {
    route: CheckoutRoutes.LISTA_PSP,
  },
};
