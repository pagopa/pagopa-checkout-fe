import React from "react";
import { useNavigate } from "react-router-dom";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { Box, Button, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import PageContainer from "../components/PageContent/PageContainer";
import timeout from "../assets/images/response-timeout.svg";
import {
  getAndClearSessionItem,
  SessionItems,
} from "../utils/storage/sessionStorage";
import { CheckoutRoutes } from "./models/routeModel";

export default function AuthExpiredPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  return (
    <PageContainer>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ mt: 15 }}
      >
        <img
          src={timeout}
          alt="timeout-image"
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
            {t("authExpiredPage.title")}
          </Typography>
          <Typography variant="body2" component="div" id="errorBody">
            {t("authExpiredPage.body")}
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
            id="auth-retry-button"
            onClick={returnToOriginPage}
            style={{
              height: "100%",
              minHeight: 45,
            }}
          >
            {t("authExpiredPage.buttons.login")}
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
            {t("authExpiredPage.buttons.continueWithoutLogin")}
          </Button>
        </Box>
      </Box>
    </PageContainer>
  );
}
