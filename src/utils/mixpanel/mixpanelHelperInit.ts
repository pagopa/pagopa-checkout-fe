import mixpanelLib, { Mixpanel } from "mixpanel-browser";
import { getConfigOrThrow } from "../config/config";

const ENV = getConfigOrThrow().CHECKOUT_ENV;

export const mixpanel = {
  track(event_name: string, properties?: any): void {
    mixpanelInit();

    if (ENV === "DEV") {
      // eslint-disable-next-line no-console
      console.log(event_name, properties);
    } else {
      try {
        if (ENV === "UAT") {
          mixpanelLib.track(event_name, {
            ...properties,
            ...{ environment: "UAT" },
          });
        } else {
          mixpanelLib.track(event_name, properties);
        }
      } catch (_) {
        // eslint-disable-next-line no-console
        console.log(event_name, properties);
      }
    }
  },
};

const mixpanelInit = () => {
  const mp_app = localStorage.getItem("mp_app");
  // eslint-disable-next-line functional/no-let
  let distinctId = localStorage.getItem("mp_distinct_id");
  const rptId = sessionStorage.getItem("rptId");
  // eslint-disable-next-line functional/no-let
  let state = localStorage.getItem("mp_state");
  // eslint-disable-next-line functional/no-let
  let deviceId: string | null = null;

  const TOKEN = "c3db8f517102d7a7ebd670c9da3e05c4";
  const BASE_OPTIONS = {
    api_host: "https://api-eu.mixpanel.com",
    persistence: "localStorage" as const,
    persistence_name: "app",
    debug: true,
    ip: false,
    property_blacklist: ["$current_url", "$initial_referrer", "$referrer"],
  };

  const initWithLoaded = () =>
    mixpanelLib.init(TOKEN, {
      ...BASE_OPTIONS,
      loaded(mp: Mixpanel) {
        const mp_distinct_id = mp.get_distinct_id();
        localStorage.setItem("mp_distinct_id", mp_distinct_id);
        localStorage.setItem("mp_state", "0");
      },
    });

  const initSimple = () => mixpanelLib.init(TOKEN, BASE_OPTIONS);

  if (mp_app && state === "1" && !rptId) {
    localStorage.removeItem("mp_state");
    localStorage.removeItem("mp_distinct_id");
    state = null;
    distinctId = null;
    deviceId = mixpanelLib.get_property?.("$device_id") ?? null;
  }

  if (!mp_app && !distinctId && !rptId) {
    initWithLoaded();
  }

  if (mp_app && distinctId && !rptId && state === "0") {
    initSimple();
  }

  if (mp_app && distinctId && rptId && state === "0") {
    localStorage.setItem("mp_state", "1");
  }

  if (mp_app && !distinctId && !rptId) {
    mixpanelLib.reset();
    if (deviceId) {
      mixpanelLib.register({ $device_id: deviceId });
    }
    const mp_distinct_id = mixpanelLib.get_distinct_id();
    localStorage.setItem("mp_distinct_id", mp_distinct_id);
    localStorage.setItem("mp_state", "0");
  }
};
