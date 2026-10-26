import React from "react";
import { Alert, AlertTitle, Box } from "@mui/material";
import { useTranslation } from "react-i18next";

export function ScheduledMaintenanceBanner() {
  const { t } = useTranslation();
  return (
    <Alert severity="info" variant="standard" sx={{ alignItems: "center" }}>
      <AlertTitle>{t("ScheduledMaintenanceBanner.titleKey")}</AlertTitle>
      <Box
        component="div"
        sx={{
          maxWidth: "450px",
          whiteSpace: "normal",
          overflowWrap: "break-word",
        }}
      >
        Il 27 ottobre potrebbero verificarsi temporanei disservizi per
        interventi di manutenzione.
      </Box>
    </Alert>
  );
}
