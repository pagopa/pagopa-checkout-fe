import { init, track, Mixpanel, get_distinct_id } from "mixpanel-browser";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { getConfigOrThrow } from "../config/config";

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
      debug: true,
      ip: false,
      property_blacklist: ["$current_url", "$initial_referrer", "$referrer"],
      loaded(mixpanel: Mixpanel) {
        // eslint-disable-next-line no-console,@typescript-eslint/restrict-plus-operands
        console.log("pippo: " + mixpanel.get_distinct_id());

        if (sessionStorage.getItem("rptId") === null) {
          const oldDevice = mixpanel.get_property?.("$device_id");
          mixpanel.reset();

          if (oldDevice) {
            mixpanel.register({ $device_id: oldDevice });
          }
        }
      },
    });
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
        if (ENV === "UAT") {
          track(event_name, { ...properties, ...{ environment: "UAT" } });
        } else {
          track(event_name, properties);
        }
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
    E.map((id): boolean => typeof id === "string" && id.length > 0),
    E.getOrElseW(() => false)
  );
