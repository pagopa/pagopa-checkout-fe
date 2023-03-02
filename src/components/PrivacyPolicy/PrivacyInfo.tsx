import React from "react";
import { Box, Link, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function PrivacyInfo(props: { showDonationPrivacy?: boolean }) {
  const { t } = useTranslation();

  return (
    <>
      <Box mt={4}>
        <Typography variant="caption" component={"div"}>
          {!props.showDonationPrivacy && (
            <>
              {t("privacyInfo.privacyDesc")}
              <Link
                href={t("privacyInfo.privacyUrl")}
                target="_blank"
                rel="noreferrer"
                style={{ fontWeight: 600, textDecoration: "none" }}
              >
                {t("privacyInfo.privacyTerms")}
              </Link>
              {t("privacyInfo.privacyDescContinue")}
              <Link
                href={t("privacyInfo.privacyUrl")}
                target="_blank"
                rel="noreferrer"
                style={{ fontWeight: 600, textDecoration: "none" }}
              >
                {t("privacyInfo.privacyInfo")}
              </Link>
            </>
          )}
          {props.showDonationPrivacy && (
            <>
              {` ${t("privacyInfo.privacyDonationDesc")} `}
              <Link
                href="https://www.pagopa.gov.it/it/privacy-policy-donazioni-ucraina/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ fontWeight: 600, textDecoration: "none" }}
              >
                {t("privacyInfo.privacyDonation")}
              </Link>
            </>
          )}
          {`${t("privacyInfo.googleDesc")} (`}
          <Link
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontWeight: 600, textDecoration: "none" }}
          >
            {t("privacyInfo.privacyPolicy")}
          </Link>
          {` ${t("general.and")} `}
          <Link
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontWeight: 600, textDecoration: "none" }}
          >
            {t("privacyInfo.serviceTerms")}
          </Link>
          {")."}
        </Typography>
      </Box>
    </>
  );
}
