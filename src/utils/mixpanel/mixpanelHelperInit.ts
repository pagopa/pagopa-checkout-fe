import mp, { get_distinct_id, init, track } from "mixpanel-browser";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { getConfigOrThrow } from "../config/config";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../storage/sessionStorage";

const ENV = getConfigOrThrow().CHECKOUT_ENV;

const mixpanelInit = function (): void {
  if (ENV === "DEV") {
    // eslint-disable-next-line no-console
    console.log("Mixpanel events mock on console log.");
  } else {
    init("c3db8f517102d7a7ebd670c9da3e05c4", {
      api_host: "https://api-eu.mixpanel.com",
      persistence: "localStorage",
      persistence_name: "app",
      debug: false,
      ip: false,
      property_blacklist: ["$current_url", "$initial_referrer", "$referrer"],
    });

    if (getSessionItem(SessionItems.mixpanelDeviceId) === undefined) {
      const oldDevice = mp.get_property?.("$device_id");
      mp.reset();

      if (oldDevice) {
        mp.register({ $device_id: oldDevice });
      }
      setSessionItem(SessionItems.mixpanelDeviceId, oldDevice.toString());
    }
  }
};

export const mixpanel = {
  track(event_name: string, properties?: any): void {
    if (!isMixpanelReady()) {
      mixpanelInit();
    }

    if (ENV === "DEV") {
      // eslint-disable-next-line no-console
      console.log(event_name, properties);
    } else {
      try {
        track(event_name, {
          ...properties,
          ...(ENV === "UAT" && { environment: "UAT" }),
        });
      } catch (_) {
        // eslint-disable-next-line no-console
        console.log(event_name, properties);
      }
    }
  },
};

const isMixpanelReady = (): boolean =>
  pipe(
    E.tryCatch(() => get_distinct_id(), E.toError),
    E.map((id): boolean => {
      const hasDistinctId = typeof id === "string" && id.length > 0;
      const hasDeviceId =
        getSessionItem(SessionItems.mixpanelDeviceId) !== undefined;
      return hasDistinctId && hasDeviceId;
    }),
    E.getOrElseW(() => false)
  );
