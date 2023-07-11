import { default as React } from "react";
import { Typography, Alert, AlertTitle, Link, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { mixpanel } from "../../utils/config/mixpanelHelperInit";

const SurveyLink = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const onClick = () => {
    mixpanel.track("hereNewMixpanelActionId", {
      EVENT_ID: "hereNewMixpanelActionId",
    });
  };

  return (
    <Alert
      severity="info"
      variant="standard"
      sx={{
        borderLeftColor: theme.palette.info.main + " !important",
        borderLeft: "4px solid",
      }}
    >
      <AlertTitle>{t("paymentResponsePage.survey.title")}</AlertTitle>
      <Typography variant="body1">
        {t("paymentResponsePage.survey.body")}
      </Typography>
      <Link
        target="_blank"
        href={t("paymentResponsePage.survey.link.href")}
        onClick={onClick}
      >
        {t("paymentResponsePage.survey.link.text")}
      </Link>
    </Alert>
  );
};

export default SurveyLink;
