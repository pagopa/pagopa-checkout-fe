import { Box, Button, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { logoutUser } from "../utils/api/helper";
import { removeLoggedUser } from "../redux/slices/loggedUser";
import { resetThreshold } from "../redux/slices/threshold";
import ko from "../assets/images/response-umbrella.svg";
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

export default function KOPage() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const cart = getSessionItem(SessionItems.cart) as Cart | undefined;
  const redirectUrl = cart?.returnUrls.returnErrorUrl || "/";

  const checkLogout = () => {
    pipe(
      SessionItems.authToken,
      O.fromNullable,
      O.fold(
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
        async () =>
          await logoutUser({
            onError: () => {
              dispatch(removeLoggedUser());
              clearSessionItem(SessionItems.authToken);
            },
            onResponse: () => {
              dispatch(removeLoggedUser());
              clearSessionItem(SessionItems.authToken);
            },
          })
      )
    );
  };

  React.useEffect(() => {
    checkLogout();
    dispatch(resetThreshold());
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearStorage();

    const pageTitle = t("koPage.title");
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
