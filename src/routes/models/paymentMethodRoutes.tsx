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
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  RBPR: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  RBPB: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  RPIC: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  RBPS: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  BPAY: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  APPL: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  GOOG: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  MYBK: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  SATY: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  KLAR: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
};
