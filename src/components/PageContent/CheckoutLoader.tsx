import { Box, CircularProgress } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export default function CheckoutLoader() {
  const { t } = useTranslation();
  return (
    <Box
      alignItems="center"
      bgcolor="#fff"
      display="flex"
      height="100vh"
      justifyContent="center"
      left="0"
      position="fixed"
      right="0"
      top="0"
      width="100vw"
      zIndex="999"
      aria-live="assertive"
      aria-label={t("ariaLabels.loading")}
    >
      <CircularProgress />
    </Box>
  );
}
