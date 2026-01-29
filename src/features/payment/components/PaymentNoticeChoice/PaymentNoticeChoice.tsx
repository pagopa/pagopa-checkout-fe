import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { CheckoutRoutes } from "../../../../routes/models/routeModel";
import {
  MixpanelDataEntryType,
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
} from "../../../../utils/mixpanel/mixpanelEvents";
import { mixpanel } from "../../../../utils/mixpanel/mixpanelHelperInit";
import {
  SessionItems,
  setSessionItem,
} from "../../../../utils/storage/sessionStorage";

export function PaymentNoticeChoice() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  React.useEffect(() => {
    mixpanel.track(MixpanelEventsId.CHK_PAYMENT_NOTICE_DATA_ENTRY, {
      EVENT_ID: MixpanelEventsId.CHK_PAYMENT_NOTICE_DATA_ENTRY,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
    });
  }, []);

  const handleClickOnQR = React.useCallback(() => {
    setSessionItem(
      SessionItems.noticeCodeDataEntry,
      MixpanelDataEntryType.QR_CODE
    );
    mixpanel.track(MixpanelEventsId.CHK_PAYMENT_NOTICE_QRCODE_SCAN, {
      EVENT_ID: MixpanelEventsId.CHK_PAYMENT_NOTICE_QRCODE_SCAN,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.ACTION,
    });
    navigate(`/${CheckoutRoutes.LEGGI_CODICE_QR}`);
  }, []);

  const handleClickOnForm = React.useCallback(() => {
    setSessionItem(
      SessionItems.noticeCodeDataEntry,
      MixpanelDataEntryType.MANUAL
    );
    mixpanel.track(MixpanelEventsId.CHK_PAYMENT_NOTICE_DATA_ENTRY_MANUAL, {
      EVENT_ID: MixpanelEventsId.CHK_PAYMENT_NOTICE_DATA_ENTRY_MANUAL,
      EVENT_CATEGORY: MixpanelEventCategory.UX,
      EVENT_TYPE: MixpanelEventType.ACTION,
    });
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
        <Grid xs={9}>
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
        <Grid xs={9}>
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
          xs={3}
          sx={{ display: "flex", justifyContent: "flex-end", pr: 2 }}
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
