import { Box } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import { PaymentNoticeChoice } from "../features/payment/components/PaymentNoticeChoice/PaymentNoticeChoice";
import { resetCheckData } from "../redux/slices/checkData";

export default function IndexPage() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(resetCheckData());
  }, []);
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
