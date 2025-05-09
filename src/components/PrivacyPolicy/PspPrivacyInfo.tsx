import React from "react";
import { useTranslation } from "react-i18next";

interface PspPrivacyInfoProps {
  terminiLink: string;
  privacyLink: string;
  pspNome?: string;
}

const PspPrivacyInfo = (props: PspPrivacyInfoProps) => {
  const { t } = useTranslation();
  const { terminiLink, privacyLink, pspNome } = props;

  const message = t("paymentCheckPage.disclaimer.psp", {
    terminiLink,
    privacyLink,
    pspNome,
  });
  return <p dangerouslySetInnerHTML={{ __html: message }} />;
};

export default PspPrivacyInfo;
