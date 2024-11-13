import { Box, Button, Typography } from "@mui/material";
import { default as React, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PageContainer from "../components/PageContent/PageContainer";
import { responseOutcome } from "../features/payment/models/responseOutcome";
import { useAppDispatch } from "../redux/hooks/hooks";
import { onBrowserUnload } from "../utils/eventListeners";
import {
  clearStorage,
  getSessionItem,
  SessionItems,
} from "../utils/storage/sessionStorage";
import { Cart } from "../features/payment/models/paymentModel";
import { resetThreshold } from "../redux/slices/threshold";

export default function SessionExpiredPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const outcomeMessage = responseOutcome[4];
  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;
  const redirectUrl = cart?.returnUrls.returnErrorUrl || "/";

  useEffect(() => {
    dispatch(resetThreshold());
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearStorage();
  }, []);


  return (
    <PageContainer>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          py: 5,
        }}
      >
        <Box
          sx={{
            py: 5,
            display: "flex",
            justifyContent: "center",
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={outcomeMessage.icon}
            alt="cancelled"
            style={{ width: "80px", height: "80px" }}
          />
          <Typography
            variant="h6"
            py={3}
            textAlign="center"
            id="sessionExpiredMessageTitle"
          >
            {t(outcomeMessage.title)}
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            id="sessionExpiredMessageBody"
          >
            {t(outcomeMessage.body || "")}
          </Typography>
          <Box px={8} sx={{ width: "100%", height: "100%" }}>
            <Button
              variant="outlined"
              onClick={() => {
                window.location.replace(redirectUrl);
              }}
              sx={{
                width: "100%",
                minHeight: 45,
                my: 4,
              }}
            >
              {cart != null
                ? t("paymentResponsePage.buttons.continue")
                : t("errorButton.close")}
            </Button>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
