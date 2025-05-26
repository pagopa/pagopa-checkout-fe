import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { CheckoutRoutes } from "../../../../routes/models/routeModel";

export function PaymentNoticeChoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClickOnQR = React.useCallback(() => {
    navigate(`/${CheckoutRoutes.LEGGI_CODICE_QR}`);
  }, []);
  const handleClickOnForm = React.useCallback(() => {
    navigate(`/${CheckoutRoutes.INSERISCI_DATI_AVVISO}`);
  }, []);

  const defaultStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    cursor: "pointer",
    pt: 3,
    pb: 3,
  };

  return (
    <>
      <Grid
        container
        sx={{
          ...defaultStyle,
          borderBottom: "1px solid",
          borderBottomColor: "#EFEFEF",
        }}
        onClick={() => handleClickOnQR()}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter") {
            handleClickOnQR();
          }
        }}
        tabIndex={0}
        role="link"
      >
        <Grid item xs={9}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              pl: 2,
              pr: 2,
            }}
          >
            <QrCodeScannerIcon sx={{ color: "primary.main" }} />
            <Box
              sx={{
                ...defaultStyle,
                flexDirection: "column",
                alignItems: "baseline",
                pt: 0,
                pb: 0,
              }}
            >
              <Typography variant="sidenav" component={"div"} id="qrCTA">
                {t("paymentNoticeChoice.qr.title")}
              </Typography>
              <Typography
                variant="body2"
                component={"div"}
                id="paymentNoticeCTA"
              >
                {t("paymentNoticeChoice.qr.description")}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={3}
          sx={{ display: "flex", justifyContent: "flex-end", pr: 2 }}
        >
          <ArrowForwardIosIcon
            sx={{ color: "primary.main" }}
            fontSize="small"
          />
        </Grid>
      </Grid>
      <Grid
        container
        sx={{
          ...defaultStyle,
          borderBottom: "1px solid",
          borderBottomColor: "#EFEFEF",
        }}
        onClick={() => handleClickOnForm()}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === "Enter") {
            handleClickOnForm();
          }
        }}
        tabIndex={0}
        role="link"
      >
        <Grid item xs={9}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              pl: 2,
              pr: 2,
            }}
          >
            <KeyboardIcon sx={{ color: "primary.main" }} />
            <Box
              id="insertDataBox"
              sx={{
                ...defaultStyle,
                flexDirection: "column",
                alignItems: "baseline",
                pt: 0,
                pb: 0,
              }}
            >
              <Typography variant="sidenav" component={"div"}>
                {t("paymentNoticeChoice.form.title")}
              </Typography>
              <Typography variant="body2" component={"div"}>
                {t("paymentNoticeChoice.form.description")}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={3}
          sx={{ display: "flex", justifyContent: "flex-end", pr: 2 }}
        >
          <ArrowForwardIosIcon
            id="insertDataIcon"
            sx={{ color: "primary.main" }}
            fontSize="small"
          />
        </Grid>
      </Grid>
    </>
  );
}
