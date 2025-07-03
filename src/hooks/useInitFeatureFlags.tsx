// hooks/useInitFeatureFlags.ts
import { useEffect, useState } from "react";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../utils/storage/sessionStorage";
import { useFeatureFlagsAll } from "../hooks/useFeatureFlags";
import featureFlags from "../utils/featureFlags";

export function useInitFeatureFlags() {
  const [loadingFlags, setLoadingFlags] = useState(true);
  const [isMaintenanceEnabled, setIsMaintenanceEnabled] = useState(
    getSessionItem(SessionItems.enableMaintenance) === "true"
  );
  const { checkFeatureFlagAll } = useFeatureFlagsAll();

  useEffect(() => {
    const init = async () => {
      try {
        const allFlags = await checkFeatureFlagAll();
        if (featureFlags[SessionItems.enablePspPage] in allFlags) {
          localStorage.setItem(
            SessionItems.enablePspPage,
            allFlags.isPspPickerPageEnabled.toString()
          );
        }
        if (featureFlags[SessionItems.enableAuthentication] in allFlags) {
          setSessionItem(
            SessionItems.enableAuthentication,
            allFlags.isAuthenticationEnabled.toString()
          );
        }
        if (featureFlags[SessionItems.enableMaintenance] in allFlags) {
          setSessionItem(
            SessionItems.enableMaintenance,
            allFlags.isMaintenancePageEnabled.toString()
          );
          setIsMaintenanceEnabled(allFlags.isMaintenancePageEnabled);
        }
        if (
          featureFlags[SessionItems.enableScheduledMaintenanceBannerEnabled] in
          allFlags
        ) {
          setSessionItem(
            SessionItems.enableScheduledMaintenanceBannerEnabled,
            allFlags.enableScheduledMaintenanceBannerEnabled.toString()
          );
        }
      } finally {
        setLoadingFlags(false);
      }
    };

    void init();
  }, []);

  return { loadingFlags, isMaintenanceEnabled };
}
