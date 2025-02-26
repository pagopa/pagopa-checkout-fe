import React from "react";
import { onBrowserUnload } from "../utils/eventListeners";
import { resetThreshold } from "../redux/slices/threshold";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import { PaymentNoticeChoice } from "../features/payment/components/PaymentNoticeChoice/PaymentNoticeChoice";
import { useAppDispatch } from "../redux/hooks/hooks";
import { clearStorageAndMaintainAuthData } from "../utils/storage/sessionStorage";

export default function IndexPage() {
  window.removeEventListener("beforeunload", onBrowserUnload);
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(resetThreshold());
  }, []);
  clearStorageAndMaintainAuthData();

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
