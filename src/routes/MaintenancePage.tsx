import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import React from "react";
import PageContainer from "../components/PageContent/PageContainer";
import inProgressIcon from "../assets/images/in-progress.svg";

export default function MaintenancePage() {
  const { t } = useTranslation();
  const siteUrl = "https://status.platform.pagopa.it/";

  sessionStorage.clear();

  useEffect(() => {
    const pageTitle = t("donationPage.title");
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
          src={inProgressIcon}
          alt="Icona cuore"
          style={{ width: "80px", height: "auto" }}
          aria-hidden="true"
        />
        <Box
          sx={{
            marginY: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            maxWidth: {
              sm: "25vw",
            },
          }}
        >
          <Typography variant="h6" component="div">
            {t("maintenancePage.title")}
          </Typography>
          <Typography
            variant="body2"
            component="div"
            sx={{
              marginY: 3,
              textAlign: "center",
              paddingX: 1,
            }}
          >
            {t("maintenancePage.subtitle")}
          </Typography>
          <Box paddingX={3} width="60%">
            <Button
              type="button"
              variant="contained"
              size="small"
              fullWidth={true}
              onClick={() => window.location.replace(siteUrl)}
            >
              {t("maintenancePage.detailsButton")}
            </Button>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
