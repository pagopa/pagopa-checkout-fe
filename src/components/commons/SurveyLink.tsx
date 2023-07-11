import { default as React } from "react";
import { Typography, Alert, AlertTitle, Link } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "@mui/material";
import { theme } from "@pagopa/mui-italia";
import { mixpanel } from "../../utils/config/mixpanelHelperInit";

const SurveyLink = () => {
  const { t } = useTranslation();

  const onClick = () => {
    mixpanel.track("hereNewMixpanelActionId", {
      EVENT_ID: "hereNewMixpanelActionId",
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <Alert
        icon={false}
        severity="info"
        variant="standard"
        sx={{
          borderLeftColor: theme.palette.info.main + " !important",
          borderLeft: "4px solid",
          padding: "16px",
        }}
      >
        <AlertTitle>
          <Typography variant="body1" sx={{ fontWeight: 600 }} mb={1}>
            {t("paymentResponsePage.survey.title")}
          </Typography>
        </AlertTitle>
        <Typography variant="body1" mb={2}>
          {t("paymentResponsePage.survey.body")}
        </Typography>
        <Link
          variant="body1"
          target="_blank"
          href={t("paymentResponsePage.survey.link.href")}
          onClick={onClick}
          sx={{ textDecoration: "none", fontWeight: 700 }}
        >
          {t("paymentResponsePage.survey.link.text")}
        </Link>
      </Alert>
    </ThemeProvider>
  );
};

export default SurveyLink;
