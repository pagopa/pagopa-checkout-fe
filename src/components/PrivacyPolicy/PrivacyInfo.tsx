import React from "react";
import { Box, Link, Typography } from "@mui/material";
import { Trans } from "react-i18next";

const PrivacyLink = (props: {
  href: string;
  children?: string;
  rel?: string;
}) => {
  const { href, children, rel = "noreferrer" } = props;
  return (
    <Link
      href={href}
      target="_blank"
      rel={rel}
      style={{ fontWeight: 600, textDecoration: "none" }}
    >
      {children}
    </Link>
  );
};

export default function PrivacyInfo(props: { showDonationPrivacy?: boolean }) {
  return (
    <>
      <Box mt={4}>
        <Typography variant="caption" component={"div"}>
          <Trans
            i18nKey="privacyInfo.privacyDesc"
            components={{
              privacy: <PrivacyLink href="/informativa-privacy" />,
              terms: <PrivacyLink href="/termini-di-servizio" />,
            }}
          />
          {props.showDonationPrivacy ? (
            <Trans
              i18nKey="privacyInfo.privacyDonation"
              components={{
                terms: (
                  <Link
                    href="https://www.pagopa.gov.it/it/privacy-policy-donazioni-ucraina/"
                    rel="noopener noreferrer"
                    sx={{ fontWeight: 600, textDecoration: "none" }}
                  />
                ),
              }}
            />
          ) : (
            ". "
          )}
          <Trans
            i18nKey="privacyInfo.googleDesc"
            components={{
              privacy: (
                <PrivacyLink
                  rel="noopener noreferrer"
                  href="https://policies.google.com/privacy"
                />
              ),
              terms: (
                <PrivacyLink
                  rel="noopener noreferrer"
                  href="https://policies.google.com/terms"
                />
              ),
            }}
          />
        </Typography>
      </Box>
    </>
  );
}
