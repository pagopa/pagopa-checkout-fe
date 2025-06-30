import { useCallback } from "react";
import {
  evaluateFeatureFlag,
  evaluateFeatureFlagsAll,
} from "../utils/api/helper";
import featureFlags from "../utils/featureFlags";
import { SessionItems } from "../utils/storage/sessionStorage";

type StorageType = "session" | "local";

type FeatureFlagConfig = {
  flagName: keyof typeof featureFlags;
  sessionKey: SessionItems;
  onSuccess?: (enabled: boolean) => void;
  onError?: () => void;
  store?: StorageType;
  skipIfStored?: boolean;
};

export const useFeatureFlags = () => {
  const checkFeatureFlag = useCallback(
    async ({
      flagName,
      sessionKey,
      onSuccess,
      onError,
      store = "session",
      skipIfStored = true,
    }: FeatureFlagConfig) => {
      const storage = store === "local" ? localStorage : sessionStorage;
      const stored = storage.getItem(sessionKey);

      if (skipIfStored && stored !== null) {
        return;
      }

      await evaluateFeatureFlag(
        featureFlags[flagName],
        (e: string) => {
          // eslint-disable-next-line no-console
          console.error(`Error while getting feature flag ${sessionKey}`, e);
          storage.setItem(sessionKey, "false");
          onError?.();
        },
        (data: { enabled: boolean }) => {
          storage.setItem(sessionKey, data.enabled.toString());
          onSuccess?.(data.enabled);
        }
      );
    },
    []
  );

  return { checkFeatureFlag };
};

export const useFeatureFlagsAll = () => {
  const checkFeatureFlagAll = useCallback(async () => {
    try {
      return await evaluateFeatureFlagsAll();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error fetching feature flags", e);
      return {};
    }
  }, []);
  return { checkFeatureFlagAll };
};
