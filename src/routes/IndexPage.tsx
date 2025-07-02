import React from "react";
import { ScheduledMaintenanceBanner } from "../components/commons/ScheduledMaintenanceBanner";
import { onBrowserUnload } from "../utils/eventListeners";
import { resetThreshold } from "../redux/slices/threshold";
import PageContainer from "../components/PageContent/PageContainer";
import PrivacyInfo from "../components/PrivacyPolicy/PrivacyInfo";
import { PaymentNoticeChoice } from "../features/payment/components/PaymentNoticeChoice/PaymentNoticeChoice";
import { useAppDispatch } from "../redux/hooks/hooks";
import {
  clearStorageAndMaintainAuthData,
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { evaluateFeatureFlag } from "../utils/api/helpers/checkoutFeatureFlagsHelper";
import featureFlags from "../utils/featureFlags";

export default function IndexPage() {
  window.removeEventListener("beforeunload", onBrowserUnload);
  const dispatch = useAppDispatch();

  const [
    isScheduledMaintenanceBannerEnabled,
    setIsScheduledMaintenanceBannerEnabled,
  ] = React.useState<boolean | null>(null);

  const checkIsScheduledMaintenanceBanner = async () => {
    const isScheduledMaintenanceBannerEnabledFromSessionStorage =
      getSessionItem(SessionItems.isScheduledMaintenanceBannerEnabled);

    if (
      isScheduledMaintenanceBannerEnabledFromSessionStorage === null ||
      isScheduledMaintenanceBannerEnabledFromSessionStorage === undefined
    ) {
      await evaluateFeatureFlag(
        featureFlags.enableScheduledMaintenanceBanner,
        (e: string) => {
          // eslint-disable-next-line no-console
          console.error(
            `Error while getting feature flag ${SessionItems.isScheduledMaintenanceBannerEnabled}`,
            e
          );
        },
        (data: { enabled: boolean }) => {
          setSessionItem(
            SessionItems.isScheduledMaintenanceBannerEnabled,
            data.enabled.toString()
          );
          setIsScheduledMaintenanceBannerEnabled(data.enabled);
        }
      );
    } else {
      setIsScheduledMaintenanceBannerEnabled(
        isScheduledMaintenanceBannerEnabledFromSessionStorage === "true"
      );
    }
  };

  React.useEffect(() => {
    dispatch(resetThreshold());
    clearStorageAndMaintainAuthData();
    void checkIsScheduledMaintenanceBanner();
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
