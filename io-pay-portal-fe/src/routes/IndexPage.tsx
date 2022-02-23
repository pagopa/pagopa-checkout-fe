import { Box } from "@mui/material";
import React from "react";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import { PaymentNoticeChoice } from "../features/payment/components/PaymentNoticeChoice/PaymentNoticeChoice";

export default function IndexPage() {
  sessionStorage.clear();

  return (
    <PageContainer title="indexPage.title" description="indexPage.description">
      <Box sx={{ mt: 6 }}>
        <PaymentNoticeChoice />
      </Box>
      <PrivacyInfo />
    </PageContainer>
  );
}
