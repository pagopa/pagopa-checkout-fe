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
    console.log("Mixpanel mock mode");
    init("dummy-token", {
      api_host: "http://localhost:3000/mock-mixpanel",
      persistence: "localStorage",
      debug: true,
      ip: false,
    });
  } else {
    try {
      // initialize mixpanel retrieving info from local storage such as device id and distinct id
      init("c3db8f517102d7a7ebd670c9da3e05c4", {
        api_host: "https://api-eu.mixpanel.com",
        persistence: "localStorage",
        persistence_name: "app",
        debug: false,
        ip: false,
        property_blacklist: ["$current_url", "$initial_referrer", "$referrer"],
      });

      // retrieve device id from local storage initialized mixpanel entity
      const mp_deviceId = mp.get_property?.("$device_id");

      if (!getSessionItem(SessionItems.mixpanelInitialized)) {
        // reset mixpanel instance, generating new device_id and distinct id
        // mp.reset();
        setSessionItem(SessionItems.mixpanelInitialized, true);
      }

      if (mp_deviceId !== mp.get_property?.("$device_id")) {
        // set device id to the one retrieved from local storage
        mp.register({ $device_id: mp_deviceId });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Mixapenl init failed: ", err);
    }
  }
};

export const mixpanel = {
  track(event_name: string, properties?: any): void {
    if (!isMixpanelReady()) {
      mixpanelInit();
    }

    if (ENV === "DEV") {
      const deviceId = mp.get_property?.("$device_id");
      // eslint-disable-next-line no-console
      console.log(event_name, properties);
      // eslint-disable-next-line no-console
      console.log("Mixpanel device_id:", deviceId);
    }
    try {
      if (!isMixpanelReady()) {
        // eslint-disable-next-line no-console
        console.warn(
          "Mixpanel not available, event skipped:",
          event_name,
          properties
        );
        return;
      }
      track(event_name, {
        ...properties,
        ...(ENV === "UAT" && { environment: "UAT" }),
      });
    } catch (_) {
      // eslint-disable-next-line no-console
      console.log(event_name, properties);
    }
  },
};

const isMixpanelReady = (): boolean =>
  pipe(
    E.tryCatch(() => get_distinct_id(), E.toError),
    E.map((id): boolean => {
      const hasDistinctId = typeof id === "string" && id.length > 0;
      const mixpanelInitialized =
        getSessionItem(SessionItems.mixpanelInitialized) === "true";
      return hasDistinctId && mixpanelInitialized;
    }),
    E.getOrElseW(() => false)
  );
