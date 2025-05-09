import React from "react";
import { useTranslation } from "react-i18next";

interface PspPrivacyInfoProps {
  termsLink: string;
  privacyLink: string;
  pspName?: string;
}

const PspPrivacyInfo = (props: PspPrivacyInfoProps) => {
  const { t } = useTranslation();
  const { termsLink, privacyLink, pspName } = props;

  const message = t("paymentCheckPage.disclaimer.psp", {
    termsLink,
    privacyLink,
    pspName,
  });
  return <p dangerouslySetInnerHTML={{ __html: message }} />;
};

export default PspPrivacyInfo;
