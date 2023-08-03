import { default as React } from "react";
import { Typography, Alert, AlertTitle, Link, Box } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "@mui/material";
import { theme } from "@pagopa/mui-italia";
import { VOC_USER_EXIT } from "../../utils/config/mixpanelDefs";
import { mixpanel } from "../../utils/config/mixpanelHelperInit";

const SurveyLink = () => {
  const { t } = useTranslation();

  const onClick = () => {
    mixpanel.track(VOC_USER_EXIT.value, {
      EVENT_ID: VOC_USER_EXIT.value,
      event_category: "UX",
      event_type: "exit",
      screen_name: "payment response page",
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Alert icon={false} severity="info" variant="standard">
        <Box p={2}>
          <AlertTitle>
            <Typography variant="body1" sx={{ fontWeight: 600 }} mb={1}>
              {t("paymentResponsePage.survey.title")}
            </Typography>
          </AlertTitle>
          <Typography variant="body1" mb={2}>
            {t("paymentResponsePage.survey.body")}
          </Typography>
          <Link
            onClick={onClick}
            variant="body1"
            target="_blank"
            rel="nofollow"
            href={t("paymentResponsePage.survey.link.href")}
            sx={{ textDecoration: "none", fontWeight: 700 }}
          >
            {t("paymentResponsePage.survey.link.text")}
          </Link>
        </Box>
      </Alert>
    </ThemeProvider>
  );
};

export default SurveyLink;
