import React from "react";
import { useFeatureFlagsAll } from "../hooks/useFeatureFlags";
import { ScheduledMaintenanceBanner } from "../components/commons/ScheduledMaintenanceBanner";
import { onBrowserUnload } from "../utils/eventListeners";
import { resetThreshold } from "../redux/slices/threshold";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import { PaymentNoticeChoice } from "../features/payment/components/PaymentNoticeChoice/PaymentNoticeChoice";
import { useAppDispatch } from "../redux/hooks/hooks";
import {
  clearStorageAndMaintainAuthData,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import featureFlags from "../utils/featureFlags";
import { setMaintenanceEnabled } from "../redux/slices/maintanancePage";

export default function IndexPage() {
  window.removeEventListener("beforeunload", onBrowserUnload);
  const dispatch = useAppDispatch();

  const [
    isScheduledMaintenanceBannerEnabled,
    setIsScheduledMaintenanceBannerEnabled,
  ] = React.useState<boolean | null>(null);

  const { checkFeatureFlagAll } = useFeatureFlagsAll();

  const initFeatureFlag = async () => {
    const allFlags = await checkFeatureFlagAll();
    if (featureFlags.enableMaintenance in allFlags) {
      const enabled = allFlags.isMaintenancePageEnabled;
      dispatch(setMaintenanceEnabled({ maintenanceEnabled: enabled }));
    }
    if (
      featureFlags[SessionItems.enableScheduledMaintenanceBannerEnabled] in
      allFlags
    ) {
      const enabled = allFlags.isScheduledMaintenanceBannerEnabled;
      setSessionItem(
        SessionItems.enableScheduledMaintenanceBannerEnabled,
        enabled.toString()
      );
      setIsScheduledMaintenanceBannerEnabled(enabled);
    }
  };

  React.useEffect(() => {
    dispatch(resetThreshold());
    clearStorageAndMaintainAuthData();
    void initFeatureFlag();
  }, []);

  return (
    <>
      {isScheduledMaintenanceBannerEnabled && <ScheduledMaintenanceBanner />}
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
