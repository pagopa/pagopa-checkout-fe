import { get_distinct_id, init, Mixpanel, track } from "mixpanel-browser";
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
      ip: false,
      property_blacklist: ["$current_url", "$initial_referrer", "$referrer"],
      loaded(mixpanel: Mixpanel) {
        // this is useful to obtain a new distinct_id every session
        if (getSessionItem(SessionItems.noticeInfo) === null) {
          mixpanel.reset();
        }
        const distinct_id = getSessionItem(SessionItems.distinctId) as string;
        if (distinct_id) {
          mixpanel.identify(distinct_id);
        } else {
          const currentDistinctId = get_distinct_id();
          setSessionItem(SessionItems.distinctId, currentDistinctId);
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
