import { default as React } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Link,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { theme } from "@pagopa/mui-italia";
import { constVoid } from "fp-ts/function";

const SurveyLink = () => {
  const { t } = useTranslation();

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
            onClick={constVoid}
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
