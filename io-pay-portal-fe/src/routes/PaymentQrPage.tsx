import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Paper } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContent/PageContainer";

export default function PaymentQrPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split("/")[1];

  return (
    <PageContainer
      title="paymentQrPage.title"
      description="paymentQrPage.description"
    >
      <Box
        sx={{ "& > :not(style)": { mt: 6, mb: 6, width: "100%", height: 300 } }}
      >
        <Paper square variant="outlined" sx={{ bgcolor: "darkgrey" }} />
      </Box>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ gap: 2 }}
      >
        <a
          href=""
          style={{ fontWeight: 600, textDecoration: "none" }}
          onClick={() => navigate(`/${currentPath}/notice`)}
        >
          {t("paymentQrPage.navigate")}
        </a>
        <ArrowForwardIcon sx={{ color: "primary.main" }} fontSize="small" />
      </Box>
    </PageContainer>
  );
}
