import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import ReCAPTCHA from "react-google-recaptcha";
import { ErrorBlock } from "components/PageContent/ErrorBlock";
import { onBrowserUnload } from "../utils/eventListeners";
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
import { useAppDispatch } from "../redux/hooks/hooks";
import { UserInfoResponse } from "../../generated/definitions/checkout-auth-service-v1/UserInfoResponse";
import { setLoggedUser } from "../redux/slices/loggedUser";
import {
  authentication,
  proceedToLogin,
  retrieveUserInfo,
} from "./../utils/api/helper";
import { CheckoutRoutes } from "./models/routeModel";

export default function AuthCallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, _] = useSearchParams();
  const [loading, setLoading] = React.useState(true);
  const ref = React.useRef<ReCAPTCHA>(null);
  const authCode = searchParams.get("code");
  const state = searchParams.get("state");
  // we need the feature flag to be enabled to allow the user to actually see
  // the retry button since its basically a "login" button
  const storedFeatureFlag = getSessionItem(SessionItems.enableAuthentication);

  const onError = () => {
    setLoading(false);
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearSessionItem(SessionItems.authToken);
    ref.current?.reset();
  };

  const onLoginResponse = (authorizationUrl: string) => {
    try {
      const url = new URL(authorizationUrl);
      window.removeEventListener("beforeunload", onBrowserUnload);
      if (url.origin === window.location.origin) {
        navigate(`${url.pathname}${url.search}`, { replace: true });
      } else {
        window.location.assign(url);
      }
    } catch {
      onError();
    }
  };

  const onLogin = async (recaptchaRef: ReCAPTCHA) => {
    window.addEventListener("beforeunload", onBrowserUnload);
    setLoading(true);
    await proceedToLogin({
      recaptchaRef,
      onError,
      onResponse: onLoginResponse,
    });
  };

  const handleClickOnLogin = async () => {
    if (ref.current) {
      await onLogin(ref.current);
    }
  };

  // navigate to last page from session storage
  const returnToOriginPage = () => {
    window.removeEventListener("beforeunload", onBrowserUnload);
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

  const doGetUserInfo = () => {
    void retrieveUserInfo({
      onResponse: (userInfo: UserInfoResponse) => {
        dispatch(
          setLoggedUser({
            id: `${userInfo.name}${userInfo.familyName}`,
            name: userInfo.name,
            surname: userInfo.familyName,
          })
        );
        returnToOriginPage();
      },
      onError,
    });
  };

  useEffect(() => {
    try {
      window.addEventListener("beforeunload", onBrowserUnload);

      void authentication({
        authCode,
        state,
        onResponse: (authToken: string) => {
          setSessionItem(SessionItems.authToken, authToken);
          doGetUserInfo();
        },
        onError,
      });
    } catch {
      return navigate(`/${CheckoutRoutes.ROOT}`, { replace: true });
    }
  }, [authCode, state]);

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
        <ErrorBlock
          imageSrc={ko}
          imageAlt="ko"
          title={t("authCallbackPage.title")}
          body={t("authCallbackPage.body")}
          testIdPrefix="auth-callback"
          actions={
            <>
              {storedFeatureFlag && (
                <Button
                  type="button"
                  variant="contained"
                  id="auth-retry-button"
                  onClick={handleClickOnLogin}
                  style={{ height: "100%", minHeight: 45 }}
                >
                  {t("authCallbackPage.buttons.retry")}
                </Button>
              )}
              <Button
                type="button"
                variant="text"
                onClick={returnToOriginPage}
                style={{ height: "100%", minHeight: 45 }}
              >
                {t("authCallbackPage.buttons.continueWithoutLogin")}
              </Button>
            </>
          }
        />
      )}
    </PageContainer>
  );
}
