import React from "react";
import { Alert, AlertTitle, Box, Link } from "@mui/material";
import { useTranslation } from "react-i18next";

export function ScheduledMaintenanceBanner() {
  const { t } = useTranslation();
  return (
    <Alert severity="info" variant="standard" sx={{ alignItems: "center" }}>
      <AlertTitle>{t("ScheduledMaintenanceBanner.titleKey")}</AlertTitle>
      <Box component="div">
        {t("ScheduledMaintenanceBanner.bodyKey")}
        <Box mt={1}>
          <Link
            href="https://status.platform.pagopa.it/it/maintenance/610207" // TODO: understand whether the status page link is dynamic, in order to move it to the environment configuration.
            target="_blank"
            rel="noreferrer"
            style={{ fontWeight: 600, textDecoration: "none" }}
          >
            {t("ScheduledMaintenanceBanner.linkTextKey")}
          </Link>
        </Box>
      </Box>
    </Alert>
  );
}
