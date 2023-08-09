import React from "react";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import { PaymentNoticeChoice } from "../features/payment/components/PaymentNoticeChoice/PaymentNoticeChoice";
import { clearStorage } from "../utils/storage/sessionStorage";

export default function IndexPage() {
  clearStorage();

  return (
    <PageContainer
      title="indexPage.title"
      description="indexPage.description"
      childrenSx={{ mt: 6 }}
    >
      <PaymentNoticeChoice />
      <PrivacyInfo />
    </PageContainer>
  );
}
