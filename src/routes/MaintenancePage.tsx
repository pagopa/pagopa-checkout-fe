import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Box, Button, Typography } from "@mui/material";
import React from "react";
import PageContainer from "../components/PageContent/PageContainer";
import inProgressIcon from "../assets/images/in-progress.svg";
import { mixpanel } from "../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
} from "../utils/mixpanel/mixpanelEvents";

export default function MaintenancePage() {
  const { t } = useTranslation();
  const siteUrl = "https://status.platform.pagopa.it/";

  sessionStorage.clear();

  useEffect(() => {
    const pageTitle = t("maintenancePage.title");
    (document.title as any) = pageTitle + " - pagoPA";

    mixpanel.track(MixpanelEventsId.SCHEDULED_MAINTENANCE, {
      EVENT_ID: MixpanelEventsId.SCHEDULED_MAINTENANCE,
      EVENT_CATEGORY: MixpanelEventCategory.KO,
      page: window.location.pathname,
    });
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
          alt="Work in progress"
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
          <Typography variant="h6" component="h1" id="id_maintenance">
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
              id="id_button_redirect"
              type="button"
              variant="contained"
              size="small"
              fullWidth={true}
              onClick={() => {
                mixpanel.track(
                  MixpanelEventsId.SCHEDULED_MAINTENANCE_MORE_INFO,
                  {
                    EVENT_ID: MixpanelEventsId.SCHEDULED_MAINTENANCE_MORE_INFO,
                    EVENT_CATEGORY: MixpanelEventCategory.UX,
                    page: window.location.pathname,
                  }
                );
                window.location.replace(siteUrl);
              }}
            >
              {t("maintenancePage.detailsButton")}
            </Button>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}
