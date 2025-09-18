import { Theme } from "@emotion/react";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { SxProps } from "@mui/material";
import { PaymentMethodAttr } from "features/payment/models/paymentModel";
import * as React from "react";
import { PaymentTypeCodeEnum } from "../../../generated/definitions/payment-ecommerce-v2/PaymentMethodResponse";
import { CheckoutRoutes } from "./routeModel";

type PaymentTypecode = Record<PaymentTypeCodeEnum, PaymentMethodAttr>;

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
  KLRN: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  PPAL: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
  RICO: {
    route: CheckoutRoutes.RIEPILOGO_PAGAMENTO,
  },
};
