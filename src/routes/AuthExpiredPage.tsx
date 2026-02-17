import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ErrorBlock } from "components/PageContent/ErrorBlock";
import { useAppDispatch } from "../redux/hooks/hooks";
import PageContainer from "../components/PageContent/PageContainer";
import timeout from "../assets/images/response-timeout.svg";
import {
  clearSessionItem,
  getAndClearSessionItem,
  SessionItems,
} from "../utils/storage/sessionStorage";
import { removeLoggedUser } from "../redux/slices/loggedUser";
import { CheckoutRoutes } from "./models/routeModel";

export default function AuthExpiredPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

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
    dispatch(removeLoggedUser());
    clearSessionItem(SessionItems.authToken);
  }, []);

  return (
    <PageContainer>
      <ErrorBlock
        imageSrc={timeout}
        imageAlt="timeout"
        title={t("authExpiredPage.title")}
        body={t("authExpiredPage.body")}
        testIdPrefix="auth-expired"
        actions={
          <>
            <Button
              type="button"
              variant="contained"
              id="auth-retry-button"
              onClick={returnToOriginPage}
              style={{ height: "100%", minHeight: 45 }}
            >
              {t("authExpiredPage.buttons.login")}
            </Button>
            <Button
              type="button"
              variant="text"
              id="pay-guest-button"
              onClick={returnToOriginPage}
              style={{ height: "100%", minHeight: 45 }}
            >
              {t("authExpiredPage.buttons.continueWithoutLogin")}
            </Button>
          </>
        }
      />
    </PageContainer>
  );
}
