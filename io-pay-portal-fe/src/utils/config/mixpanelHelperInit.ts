import * as t from "io-ts";
import { init, track, Mixpanel } from "mixpanel-browser";
import { getConfig } from "./config";
export const PAYMENT_VERIFY_INIT = t.literal("PAYMENT_VERIFY_INIT");
export type PAYMENT_VERIFY_INIT = t.TypeOf<typeof PAYMENT_VERIFY_INIT>;
export const PAYMENT_VERIFY_NET_ERR = t.literal("PAYMENT_VERIFY_NET_ERR");
export type PAYMENT_VERIFY_NET_ERR = t.TypeOf<typeof PAYMENT_VERIFY_NET_ERR>;
export const PAYMENT_VERIFY_SVR_ERR = t.literal("PAYMENT_VERIFY_SVR_ERR");
export type PAYMENT_VERIFY_SVR_ERR = t.TypeOf<typeof PAYMENT_VERIFY_SVR_ERR>;
export const PAYMENT_VERIFY_RESP_ERR = t.literal("PAYMENT_VERIFY_RESP_ERR");
export type PAYMENT_VERIFY_RESP_ERR = t.TypeOf<typeof PAYMENT_VERIFY_RESP_ERR>;
export const PAYMENT_VERIFY_SUCCESS = t.literal("PAYMENT_VERIFY_SUCCESS");
export type PAYMENT_VERIFY_SUCCESS = t.TypeOf<typeof PAYMENT_VERIFY_SUCCESS>;

export const PAYMENT_ACTIVATE_INIT = t.literal("PAYMENT_ACTIVATE_INIT");
export type PAYMENT_ACTIVATE_INIT = t.TypeOf<typeof PAYMENT_ACTIVATE_INIT>;
export const PAYMENT_ACTIVATE_NET_ERR = t.literal("PAYMENT_ACTIVATE_NET_ERR");
export type PAYMENT_ACTIVATE_NET_ERR = t.TypeOf<
  typeof PAYMENT_ACTIVATE_NET_ERR
>;
export const PAYMENT_ACTIVATE_SVR_ERR = t.literal("PAYMENT_ACTIVATE_SVR_ERR");
export type PAYMENT_ACTIVATE_SVR_ERR = t.TypeOf<
  typeof PAYMENT_ACTIVATE_SVR_ERR
>;
export const PAYMENT_ACTIVATE_RESP_ERR = t.literal("PAYMENT_ACTIVATE_RESP_ERR");
export type PAYMENT_ACTIVATE_RESP_ERR = t.TypeOf<
  typeof PAYMENT_ACTIVATE_RESP_ERR
>;
export const PAYMENT_ACTIVATE_SUCCESS = t.literal("PAYMENT_ACTIVATE_SUCCESS");
export type PAYMENT_ACTIVATE_SUCCESS = t.TypeOf<
  typeof PAYMENT_ACTIVATE_SUCCESS
>;

export const PAYMENT_ACTIVATION_STATUS_INIT = t.literal(
  "PAYMENT_ACTIVATION_STATUS_INIT"
);
export type PAYMENT_ACTIVATION_STATUS_INIT = t.TypeOf<
  typeof PAYMENT_ACTIVATION_STATUS_INIT
>;
export const PAYMENT_ACTIVATION_STATUS_NET_ERR = t.literal(
  "PAYMENT_ACTIVATION_STATUS_NET_ERR"
);
export type PAYMENT_ACTIVATION_STATUS_NET_ERR = t.TypeOf<
  typeof PAYMENT_ACTIVATION_STATUS_NET_ERR
>;
export const PAYMENT_ACTIVATION_STATUS_SVR_ERR = t.literal(
  "PAYMENT_ACTIVATION_STATUS_SVR_ERR"
);
export type PAYMENT_ACTIVATION_STATUS_SVR_ERR = t.TypeOf<
  typeof PAYMENT_ACTIVATION_STATUS_SVR_ERR
>;
export const PAYMENT_ACTIVATION_STATUS_RESP_ERR = t.literal(
  "PAYMENT_ACTIVATION_STATUS_RESP_ERR"
);
export type PAYMENT_ACTIVATION_STATUS_RESP_ERR = t.TypeOf<
  typeof PAYMENT_ACTIVATION_STATUS_RESP_ERR
>;
export const PAYMENT_ACTIVATION_STATUS_SUCCESS = t.literal(
  "PAYMENT_ACTIVATION_STATUS_SUCCESS"
);
export type PAYMENT_ACTIVATION_STATUS_SUCCESS = t.TypeOf<
  typeof PAYMENT_ACTIVATION_STATUS_SUCCESS
>;

const ENV = getConfig("IO_PAY_PORTAL_ENV");

export const mixpanelInit = function (): void {
  if (ENV === "develop") {
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
        mixpanel.reset();
      },
    });
  }
};

export const mixpanel = {
  track(event_name: string, properties?: any): void {
    if (ENV === "develop") {
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
