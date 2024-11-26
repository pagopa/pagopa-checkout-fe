import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { resetThreshold } from "../redux/slices/threshold";
import ko from "../assets/images/response-umbrella.svg";
import PageContainer from "../components/PageContent/PageContainer";
import { Cart } from "../features/payment/models/paymentModel";
import { useAppDispatch } from "../redux/hooks/hooks";
import { onBrowserUnload } from "../utils/eventListeners";
import {
  clearStorage,
  getSessionItem,
  SessionItems,
} from "../utils/storage/sessionStorage";

export default function KOPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;
  const redirectUrl = cart?.returnUrls.returnErrorUrl || "/";

  React.useEffect(() => {
    dispatch(resetThreshold());
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearStorage();
  }, []);

  return (
    <PageContainer>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ mt: 6 }}
      >
        <img
          src={ko}
          alt="ko-image"
          style={{ width: "80px", height: "80px" }}
        />
        <Box
          mt={3}
          mb={3}
          gap={2}
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" component="div">
            {t("koPage.title")}
          </Typography>
          <Typography variant="body2" component="div">
            {t("koPage.body")}
          </Typography>
        </Box>
        <Box pr={8} pl={8} sx={{ width: "100%", height: "100%" }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              window.location.replace(redirectUrl || "/");
            }}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 45,
            }}
          >
            {cart != null
              ? t("paymentResponsePage.buttons.continue")
              : t("koPage.button")}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
