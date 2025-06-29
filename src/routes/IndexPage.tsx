import React from "react";
import { ScheduledMaintenanceBanner } from "../components/commons/ScheduledMaintenanceBanner";
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

  const showScheduledMaintenanceBanner = false; // This can be set based on some condition in another PR

  return (
    <>
      {showScheduledMaintenanceBanner && <ScheduledMaintenanceBanner />}
      <PageContainer
        title="indexPage.title"
        description="indexPage.description"
        childrenSx={{ mt: 6 }}
      >
        <PaymentNoticeChoice />
        <PrivacyInfo />
      </PageContainer>
    </>
  );
}
