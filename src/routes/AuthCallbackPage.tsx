import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import { onBrowserBackEvent, onBrowserUnload, retrieveUserInfo } from "../utils/eventListeners";
import PageContainer from "../components/PageContent/PageContainer";
import ko from "../assets/images/response-umbrella.svg";
import {
  clearSessionItem,
  getAndClearSessionItem,
  getReCaptchaKey,
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { authentication, proceedToLogin } from "./../utils/api/helper";
import { useAppDispatch } from "../redux/hooks/hooks";
import { UserInfoResponse } from "../../generated/definitions/checkout-auth-service-v1/UserInfoResponse";
import { CheckoutRoutes } from "./models/routeModel";

export default function AuthCallback() {
  const navigate = useNavigate();
  const ref = React.useRef<ReCAPTCHA>(null);  const dispatch = useAppDispatch();

  const [loading, setLoading] = React.useState(true);

  const { t } = useTranslation();

  const onError = () => {
    setLoading(false);
    window.removeEventListener("popstate", onBrowserBackEvent);
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearSessionItem(SessionItems.authToken);
    ref.current?.reset();
  };

  const onResponse = (authorizationUrl: string) => {
    try {
      const url = new URL(authorizationUrl);
      if (url.origin === window.location.origin) {
        navigate(`${url.pathname}${url.search}`, { replace: true });
        setLoading(false);
      } else {
        window.location.assign(url);
      }
    } catch {
      onError();
    }
  };

  const onLogin = async (recaptchaRef: ReCAPTCHA) => {
    setLoading(true);
    await proceedToLogin({ recaptchaRef, onError, onResponse });
  };

  const handleClickOnLogin = async () => {
    if (ref.current) {
      await onLogin(ref.current);
    }
  };

  // navigate to last page from session storage
  const returnToOriginPage = () => {
    pipe(
      getAndClearSessionItem(SessionItems.loginOriginPage),
      O.fromNullable,
      O.fold(
        () => navigate(`/${CheckoutRoutes.ROOT}`, { replace: true }),
        (path) => {
          navigate(path as string, { replace: true });
        }
      )
    );
  };

  useEffect(() => {
    try {
      window.addEventListener("beforeunload", onBrowserUnload);
      window.addEventListener("popstate", onBrowserBackEvent);

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

      return () => {
        window.removeEventListener("popstate", onBrowserBackEvent);
        window.removeEventListener("beforeunload", onBrowserUnload);
      };
    } catch {
      return navigate(`/${CheckoutRoutes.ROOT}`, { replace: true });
    }
  }, []);

  // we need the feature flag to be enabled to allow the user to actually see
  // the retry button since its basically a "login" button
  const storedFeatureFlag = getSessionItem(SessionItems.enableAuthentication);

  return (
    <PageContainer>
      <Box display="none">
        <ReCAPTCHA
          ref={ref}
          size="invisible"
          sitekey={getReCaptchaKey() as string}
        />
      </Box>
      {loading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="space-around"
          minHeight="70vh"
        >
          <CircularProgress />
        </Box>
      )}
      {!loading && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{ mt: 15 }}
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
            <Typography variant="h6" component="div" id="errorTitle">
              {t("authCallbackPage.title")}
            </Typography>
            <Typography variant="body2" component="div" id="errorBody">
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
            {storedFeatureFlag && (
              <Button
                type="button"
                variant="contained"
                onClick={handleClickOnLogin}
                style={{
                  height: "100%",
                  minHeight: 45,
                }}
              >
                {t("authCallbackPage.buttons.retry")}
              </Button>
            )}
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
