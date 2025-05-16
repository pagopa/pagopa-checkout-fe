/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import heartIcon from "../assets/images/heart.svg";
import PageContainer from "../components/PageContent/PageContainer";

export default function DonationPageDismissed() {
  const { t } = useTranslation();
  const siteUrl =
    "https://pagopa.gov.it/it/notizie/2022-12-23-conclusa-iniziativa-donazioni-ucraina.html";

  sessionStorage.clear();

  useEffect(() => {
    const pageTitle = t("donationPage.dismissTitle");
    (document.title as any) = pageTitle + " - pagoPA";
  }, []);

  return (
    <PageContainer title="">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ mt: 6 }}
      >
        <img
          src={heartIcon}
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
            {t("donationPage.dismissTitle")}
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
            {t("donationPage.dismissDescription")}
          </Typography>
          <Box paddingX={3} width="100%">
            <Button
              type="button"
              variant="outlined"
              size="small"
              fullWidth={true}
              onClick={() => window.location.replace(siteUrl)}
            >
              {t("donationPage.dismissCTA")}
            </Button>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
