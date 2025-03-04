import React from "react";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import PageContainer from "../components/PageContent/PageContainer";
import ko from "../assets/images/response-umbrella.svg";
import {
  getAndClearSessionItem,
  getReCaptchaKey,
  getSessionItem,
  SessionItems,
} from "../utils/storage/sessionStorage";
import { proceedToLogin } from "./../utils/api/helper";
import { CheckoutRoutes } from "./models/routeModel";

export default function AuthCallback() {
  const navigate = useNavigate();
  const ref = React.useRef<ReCAPTCHA>(null);
  const [loading, setLoading] = React.useState(false);

  const { t } = useTranslation();

  const onError = () => {
    setLoading(false);
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
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      )}
      {!loading && (
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
