import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { authentication } from "../utils/api/helper";
import PageContainer from "../components/PageContent/PageContainer";
import ko from "../assets/images/response-umbrella.svg";
import { onBrowserBackEvent, onBrowserUnload } from "../utils/eventListeners";
import {
  getAndClearSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { CheckoutRoutes } from "./models/routeModel";

export default function AuthCallback() {
  const navigate = useNavigate();

  const [loading, setLoading] = React.useState(true);
  const [errorOnPostAuth, setErrorOnPostAuth] = React.useState(false);

  const { t } = useTranslation();

  const onError = () => {
    setLoading(false);
    window.removeEventListener("popstate", onBrowserBackEvent);
    window.removeEventListener("beforeunload", onBrowserUnload);
    setErrorOnPostAuth(true);
  };

  // navigate to last page from session storage
  const returnToOriginPage = () => {
    pipe(
      getAndClearSessionItem(SessionItems.loginOriginPage) as string,
      O.fromNullable,
      O.fold(
        () => navigate(`/${CheckoutRoutes.ROOT}`, { replace: true }),
        (path) => {
          navigate(path, { replace: true });
        }
      )
    );
  };

  const doPostAuth = () => {
    window.addEventListener("beforeunload", onBrowserUnload);
    window.addEventListener("popstate", onBrowserBackEvent);

    setLoading(true);
    setErrorOnPostAuth(false);

    // retrieve auth-code from url
      const searchParams = new URLSearchParams(window.location.search);
      const authCode = searchParams.get("code");
      const state = searchParams.get("state");

      void (async (authCode, state) => {
        void authentication({
          authCode,
          state,
          onResponse: (authToken: string) => {
            setSessionItem(SessionItems.authToken, authToken);
            returnToOriginPage();
          },
          onError,
        });
      })(authCode, state);
  };

  useEffect(() => {
    try {
      // converted to function so we can repeat this call
      // in case the user clicks "try again" button
      doPostAuth();

      return () => {
        window.removeEventListener("popstate", onBrowserBackEvent);
        window.removeEventListener("beforeunload", onBrowserUnload);
      };
    } catch {
      return navigate(`/${CheckoutRoutes.ROOT}`, { replace: true });
    }
  }, []);

  return (
    <PageContainer>
      {loading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-around"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      )}
      {!loading && errorOnPostAuth && (
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
              {t("authCallbackPage.title")}
            </Typography>
            <Typography variant="body2" component="div">
              {t("authCallbackPage.body")}
            </Typography>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            gap={2}
            sx={{ mt: 2 }}
            alignItems={"center"}
          >
            <Button
              type="button"
              variant="contained"
              onClick={doPostAuth}
              style={{
                height: "100%",
                minHeight: 45,
              }}
            >
              {t("authCallbackPage.buttons.retry")}
            </Button>
            <Button
              type="button"
              variant="text"
              onClick={returnToOriginPage}
              style={{
                height: "100%",
                minHeight: 45,
              }}
            >
              {t("authCallbackPage.buttons.continueWithoutLogin")}
            </Button>
          </Box>
        </Box>
      )}
    </PageContainer>
  );
}
