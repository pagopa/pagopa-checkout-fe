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
    receiver: getPaymentInfo().paName,
    subject: paymentSubjectTransform(getPaymentInfo().description) || "",
    amount: getPaymentInfo().amount,
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
  const toggleDrawer = (open: boolean) => {
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
                {PaymentInfo ? moneyFormat(PaymentInfo.amount) : ""}
                <InfoOutlinedIcon color="primary" sx={{ ml: 1 }} />
              </Typography>
            </Grid>
            <DrawerDetail
              PaymentInfo={PaymentInfo}
              drawstate={drawstate}
              toggleDrawer={() => toggleDrawer(false)}
            />
          </>
        )}
      </Grid>
    </Box>
  );
}
