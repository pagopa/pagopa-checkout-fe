import React from "react";
import { Link, Typography } from "@mui/material";
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
      style={{ fontWeight: 600 }}
    >
      {children}
    </Link>
  );
};

interface PspPrivacyInfoProps {
  termsLink: string;
  privacyLink: string;
  pspName: string;
}

const PspPrivacyInfo = (props: PspPrivacyInfoProps) => {
  const { termsLink, privacyLink, pspName } = props;

  return (
    <Typography variant="caption" component={"div"}>
      <Trans
        i18nKey="paymentCheckPage.disclaimer.psp"
        values={{ pspName }}
        components={{
          privacy: <PrivacyLink href={privacyLink} />,
          terms: <PrivacyLink href={termsLink} />,
          psp: <span />,
        }}
      />
    </Typography>
  );
};

export default PspPrivacyInfo;
