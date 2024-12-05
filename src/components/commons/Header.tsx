/* eslint-disable sonarjs/cognitive-complexity */
import { Box, Button, Stack } from "@mui/material";
import React from "react";
import { useLocation } from "react-router-dom";
import { ShoppingCart } from "@mui/icons-material";
import pagopaLogo from "../../assets/images/pagopa-logo.svg";
import {
  Cart,
  PaymentInfo,
  PaymentNotice,
} from "../../features/payment/models/paymentModel";
import { CheckoutRoutes } from "../../routes/models/routeModel";
import {
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import { getTotalFromCart } from "../../utils/cart/cart";
import { moneyFormat } from "../../utils/form/formatters";
import { paymentSubjectTransform } from "../../utils/transformers/paymentTransformers";
import DrawerDetail from "../Header/DrawerDetail";
import SkipToContent from "./SkipToContent";

function amountToShow() {
  const cartInfo = getSessionItem(SessionItems.cart) as Cart | undefined;
  const paymentInfo = getSessionItem(SessionItems.paymentInfo) as
    | PaymentInfo
    | undefined;
  return (
    (cartInfo && cartInfo.paymentNotices && getTotalFromCart(cartInfo)) ||
    paymentInfo?.amount ||
    0
  );
}

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname.split("/").slice(-1)[0];
  const paymentInfoData = getSessionItem(SessionItems.paymentInfo) as
    | PaymentInfo
    | undefined;
  const PaymentInfo = {
    receiver: paymentInfoData?.paName || "",
    subject: paymentSubjectTransform(paymentInfoData?.description) || "",
    amount: paymentInfoData?.amount || 0,
  };
  const CartInfo = getSessionItem(SessionItems.cart) as Cart | undefined;
  const [drawstate, setDrawstate] = React.useState(false);
  const ignoreRoutes: Array<string> = [
    CheckoutRoutes.ROOT,
    CheckoutRoutes.LEGGI_CODICE_QR,
    CheckoutRoutes.INSERISCI_DATI_AVVISO,
    CheckoutRoutes.DATI_PAGAMENTO,
    CheckoutRoutes.ANNULLATO,
    CheckoutRoutes.ERRORE,
    CheckoutRoutes.SESSIONE_SCADUTA,
    CheckoutRoutes.ESITO,
    CheckoutRoutes.DONA,
  ];
  const toggleDrawer = (open: boolean) => {
    setDrawstate(open);
  };
  const paymentNotices: Array<PaymentNotice> = CartInfo
    ? CartInfo.paymentNotices
    : [
        {
          noticeNumber: paymentInfoData?.rptId
            ? paymentInfoData?.rptId.slice(11)
            : "",
          creditorReferenceId: paymentInfoData?.creditorReferenceId,
          fiscalCode: paymentInfoData?.paFiscalCode || "",
          amount: paymentInfoData?.amount || 0,
          companyName: paymentInfoData?.paName || "",
          description: paymentInfoData?.description || "",
        },
      ];

  return (
    <header>
      <Box p={3} bgcolor={"white"}>
        <Stack
          spacing={0}
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          position="relative"
          zIndex="1000"
        >
          <Stack
            spacing={4}
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            position="relative"
          >
            <img
              src={pagopaLogo}
              alt="pagoPA"
              style={{ width: "56px", height: "36px" }}
              aria-hidden="true"
            />
            <SkipToContent />
          </Stack>

          {(!!PaymentInfo.receiver || !!CartInfo?.paymentNotices) &&
            !ignoreRoutes.includes(currentPath) && (
              <Button
                onClick={() => toggleDrawer(true)}
                endIcon={<ShoppingCart />}
              >
                {moneyFormat(amountToShow())}
              </Button>
            )}
        </Stack>
      </Box>
      <DrawerDetail
        paymentNotices={paymentNotices}
        amountToShow={amountToShow}
        drawstate={drawstate}
        toggleDrawer={() => toggleDrawer(false)}
      />
    </header>
  );
}
