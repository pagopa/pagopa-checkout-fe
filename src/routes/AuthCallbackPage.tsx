import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { setLoggedUser } from "../redux/slices/loggedUser";
import { authentication, retrieveUserInfo } from "../utils/api/helper";
import PageContainer from "../components/PageContent/PageContainer";
import ko from "../assets/images/response-umbrella.svg";
import { onBrowserBackEvent, onBrowserUnload } from "../utils/eventListeners";
import {
  clearSessionItem,
  getAndClearSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { useAppDispatch } from "../redux/hooks/hooks";
import { UserInfoResponse } from "../../generated/definitions/checkout-auth-service-v1/UserInfoResponse";
import { CheckoutRoutes } from "./models/routeModel";

export default function AuthCallback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = React.useState(true);
  const [errorOnPostAuth, setErrorOnPostAuth] = React.useState(false);

  const { t } = useTranslation();

  const onError = () => {
    setLoading(false);
    window.removeEventListener("popstate", onBrowserBackEvent);
    window.removeEventListener("beforeunload", onBrowserUnload);
    clearSessionItem(SessionItems.authToken);
    setErrorOnPostAuth(true);
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
          doGetUserInfo();
        },
        onError,
      });
    })(authCode, state);
  };

  const doGetUserInfo = () => {
    void retrieveUserInfo({
      onResponse: (userInfo: UserInfoResponse) => {
        dispatch(
          setLoggedUser({
            id: userInfo.userId,
            name: userInfo.firstName,
            surname: userInfo.lastName,
          })
        );
        returnToOriginPage();
      },
      onError,
    });
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
          minHeight="70vh"
        >
          <CircularProgress />
        </Box>
      )}
      {!loading && errorOnPostAuth && (
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
