import { Box, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";

export default function CheckoutLoader() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      {...(isMobileDevice
        ? {
            display: "flex",
            justifyContent: "center",
            width: "100%",
            my: 20,
          }
        : {
            position: "fixed",
            top: "50%",
            left: "50%",
          })}
      aria-live="assertive"
      aria-label={t("ariaLabels.loading")}
    >
      <CircularProgress />
    </Box>
  );
}
