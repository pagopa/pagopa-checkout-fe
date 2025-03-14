import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { resetThreshold } from "../redux/slices/threshold";
import cancelled from "../assets/images/response-unrecognized.svg";
import PageContainer from "../components/PageContent/PageContainer";
import { Cart } from "../features/payment/models/paymentModel";
import { useAppDispatch } from "../redux/hooks/hooks";
import { onBrowserUnload } from "../utils/eventListeners";
import {
  clearSessionItem,
  clearStorage,
  getSessionItem,
  SessionItems,
} from "../utils/storage/sessionStorage";
import { checkLogout } from "../utils/api/helper";
import { removeLoggedUser } from "../redux/slices/loggedUser";

export default function CancelledPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;
  const redirectUrl = cart?.returnUrls.returnCancelUrl || "/";

  React.useEffect(() => {
    checkLogout(() => {
      dispatch(removeLoggedUser());
      clearSessionItem(SessionItems.authToken);
    });
    dispatch(resetThreshold());
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearStorage();

    const pageTitle = t("cancelledPage.body");
    (document.title as any) = pageTitle + " - pagoPA";
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
          src={cancelled}
          alt="cancelled"
          style={{ width: "80px", height: "80px" }}
        />
        <Box mt={3} mb={3}>
          <Typography variant="h6" component="div">
            {t("cancelledPage.body")}
          </Typography>
        </Box>
        <Box pr={8} pl={8} sx={{ width: "100%", height: "100%" }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => {
              window.location.replace(redirectUrl);
            }}
            style={{
              width: "100%",
              height: "100%",
              minHeight: 45,
            }}
          >
            {cart != null
              ? t("paymentResponsePage.buttons.continue")
              : t("cancelledPage.button")}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
