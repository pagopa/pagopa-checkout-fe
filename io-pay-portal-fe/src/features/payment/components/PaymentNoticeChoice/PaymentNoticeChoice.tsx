import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Grid, Box, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardIcon from "@mui/icons-material/Keyboard";

export function PaymentNoticeChoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleClickOnQR = React.useCallback(() => {
    navigate(`${currentPath}/qr-reader`);
  }, []);
  const handleClickOnForm = React.useCallback(() => {
    navigate(`${currentPath}/notice`);
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
              <Typography variant="sidenav" component={"div"}>
                {t("paymentNoticeChoice.qr.title")}
              </Typography>
              <Typography variant="body2" component={"div"}>
                {t("paymentNoticeChoice.qr.description")}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid
          item
          xs={3}
          sx={{ display: "flex", justifyContent: "end", pr: 2 }}
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
          sx={{ display: "flex", justifyContent: "end", pr: 2 }}
        >
          <ArrowForwardIosIcon
            sx={{ color: "primary.main" }}
            fontSize="small"
          />
        </Grid>
      </Grid>
    </>
  );
}
