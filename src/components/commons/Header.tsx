/* eslint-disable sonarjs/cognitive-complexity */
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useLocation } from "react-router-dom";
import pagopaLogo from "../../assets/images/pagopa-logo.svg";
import { CheckoutRoutes } from "../../routes/models/routeModel";
import { getPaymentInfo } from "../../utils/api/apiService";
import { moneyFormat } from "../../utils/form/formatters";
import { paymentSubjectTransform } from "../../utils/transformers/paymentTransformers";
import DrawerDetail from "../Header/DrawerDetail";

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname.split("/").slice(-1)[0];
  const PaymentInfo = {
    receiver:
      getPaymentInfo().enteBeneficiario?.denominazioneBeneficiario || "",
    subject: paymentSubjectTransform(getPaymentInfo().causaleVersamento) || "",
    amount: getPaymentInfo().importoSingoloVersamento,
  };
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
  const toggleDrawer =
    (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }

      setDrawstate(open);
    };

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
        {!!PaymentInfo.receiver && !ignoreRoutes.includes(currentPath) && (
          <>
            <Grid item xs={8} sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography
                variant="body2"
                component="div"
                sx={{ textAlign: "center" }}
              >
                {PaymentInfo.receiver}
              </Typography>
              <Typography
                fontWeight={600}
                variant="body2"
                component="div"
                sx={{ textAlign: "center", overflowWrap: "anywhere" }}
              >
                {PaymentInfo.subject.length > 140
                  ? PaymentInfo.subject.substring(0, 140)
                  : PaymentInfo.subject}
              </Typography>
              <Typography
                color="primary.main"
                variant="body2"
                component="div"
                fontWeight={600}
                sx={{ textAlign: "center" }}
              >
                {`${moneyFormat(PaymentInfo.amount)}`}
              </Typography>
            </Grid>
            <Grid
              item
              xs={10}
              sx={{ display: { sm: "none" } }}
              display="flex"
              alignItems="center"
            >
              <Typography
                color="primary.main"
                variant="body2"
                component="div"
                fontWeight={600}
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
                onClick={toggleDrawer(true)}
              >
                {PaymentInfo ? moneyFormat(PaymentInfo.amount) : ""}
                <InfoOutlinedIcon color="primary" sx={{ ml: 1 }} />
              </Typography>
            </Grid>
            <DrawerDetail
              PaymentInfo={PaymentInfo}
              drawstate={drawstate}
              toggleDrawer={toggleDrawer}
            />
          </>
        )}
      </Grid>
    </Box>
  );
}
