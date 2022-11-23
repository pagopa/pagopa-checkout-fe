/* eslint-disable sonarjs/cognitive-complexity */
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useLocation } from "react-router-dom";
import pagopaLogo from "../../assets/images/pagopa-logo.svg";
import { PaymentNotice } from "../../features/payment/models/paymentModel";
import { CheckoutRoutes } from "../../routes/models/routeModel";
import { getPaymentInfo, getCart } from "../../utils/api/apiService";
import { getTotalFromCart } from "../../utils/cart/cart";
import { moneyFormat } from "../../utils/form/formatters";
import { paymentSubjectTransform } from "../../utils/transformers/paymentTransformers";
import DrawerDetail from "../Header/DrawerDetail";

function amountToShow() {
  const CartInfo = getCart();
  return (
    (getPaymentInfo() && getPaymentInfo().amount) ||
    (CartInfo && CartInfo.paymentNotices && getTotalFromCart(CartInfo)) ||
    0
  );
}

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname.split("/").slice(-1)[0];
  const PaymentInfoData = getPaymentInfo();
  const PaymentInfo = {
    receiver: PaymentInfoData.paName,
    subject: paymentSubjectTransform(PaymentInfoData.description) || "",
    amount: PaymentInfoData.amount,
  };
  const CartInfo = getCart();
  const [drawstate, setDrawstate] = React.useState(false);
  const ignoreRoutes: Array<string> = [
    CheckoutRoutes.ROOT,
    CheckoutRoutes.LEGGI_CODICE_QR,
    CheckoutRoutes.INSERISCI_DATI_AVVISO,
    CheckoutRoutes.DATI_PAGAMENTO,
    CheckoutRoutes.ANNULLATO,
    CheckoutRoutes.ERRORE,
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
          noticeNumber: PaymentInfoData.rptId
            ? PaymentInfoData.rptId.slice(10)
            : "",
          fiscalCode: PaymentInfoData.paFiscalCode,
          amount: PaymentInfoData.amount,
          companyName: PaymentInfoData.paName || "",
          description: PaymentInfoData.description || "",
        },
      ];

  return (
    <Box p={3} bgcolor={"white"}>
      <Grid container spacing={0}>
        <Grid item xs={2} display="flex" alignItems="center">
          <img
            src={pagopaLogo}
            alt="pagoPA"
            style={{ width: "56px", height: "36px" }}
            aria-hidden="true"
          />
        </Grid>
        {(!!PaymentInfo.receiver || !!CartInfo?.paymentNotices) &&
          !ignoreRoutes.includes(currentPath) && (
            <>
              <Grid
                item
                xs={10}
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                sx={{ cursor: "pointer" }}
              >
                <Typography
                  color="primary.main"
                  variant="body2"
                  component="div"
                  fontWeight={600}
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-end"
                  onClick={() => toggleDrawer(true)}
                >
                  {moneyFormat(amountToShow())}
                  <InfoOutlinedIcon color="primary" sx={{ ml: 1 }} />
                </Typography>
              </Grid>
              <DrawerDetail
                paymentNotices={paymentNotices}
                amountToShow={amountToShow}
                drawstate={drawstate}
                toggleDrawer={() => toggleDrawer(false)}
              />
            </>
          )}
      </Grid>
    </Box>
  );
}
