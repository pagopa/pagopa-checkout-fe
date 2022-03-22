import React from "react";
import { Box, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function PrivacyInfo() {
  const { t } = useTranslation();

  return (
    <>
      <Box mt={4}>
        <Typography variant="caption" component={"div"}>
          {t("privacyInfo.privacyDesc")}
          <a
            href={t("privacyInfo.privacyUrl")}
            target="_blank"
            rel="noreferrer"
            style={{ fontWeight: 600, textDecoration: "none" }}
          >
            {t("privacyInfo.privacy")}
          </a>
          {`${t("privacyInfo.googleDesc")} (`}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, textDecoration: "none" }}
          >
            {t("privacyInfo.privacyPolicy")}
          </a>
          {` ${t("general.and")} `}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, textDecoration: "none" }}
          >
            {t("privacyInfo.serviceTerms")}
          </a>
          {")."}
        </Typography>
      </Box>
    </>
  );
}
