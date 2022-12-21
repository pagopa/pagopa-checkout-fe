import React from "react";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import { PaymentNoticeChoice } from "../features/payment/components/PaymentNoticeChoice/PaymentNoticeChoice";
import { useAppDispatch } from "../redux/hooks/hooks";
import { resetSecurityCode } from "../redux/slices/securityCode";

export default function IndexPage() {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(resetSecurityCode());
  }, []);
  sessionStorage.clear();

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
