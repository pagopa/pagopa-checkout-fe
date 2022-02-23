import * as t from "io-ts";
import { init, track } from "mixpanel-browser";
import { getConfigOrThrow } from "./pmConfig";
export const PAYMENT_CHECK_INIT = t.literal("PAYMENT_CHECK_INIT");
export type PAYMENT_CHECK_INIT = t.TypeOf<typeof PAYMENT_CHECK_INIT>;
export const PAYMENT_CHECK_NET_ERR = t.literal("PAYMENT_CHECK_NET_ERR");
export type PAYMENT_CHECK_NET_ERR = t.TypeOf<typeof PAYMENT_CHECK_NET_ERR>;
export const PAYMENT_CHECK_SVR_ERR = t.literal("PAYMENT_CHECK_SVR_ERR");
export type PAYMENT_CHECK_SVR_ERR = t.TypeOf<typeof PAYMENT_CHECK_SVR_ERR>;
export const PAYMENT_CHECK_RESP_ERR = t.literal("PAYMENT_CHECK_RESP_ERR");
export type PAYMENT_CHECK_RESP_ERR = t.TypeOf<typeof PAYMENT_CHECK_RESP_ERR>;
export const PAYMENT_CHECK_SUCCESS = t.literal("PAYMENT_CHECK_SUCCESS");
export type PAYMENT_CHECK_SUCCESS = t.TypeOf<typeof PAYMENT_CHECK_SUCCESS>;
export const PAYMENT_RESOURCES_INIT = t.literal("PAYMENT_RESOURCES_INIT");
export type PAYMENT_RESOURCES_INIT = t.TypeOf<typeof PAYMENT_RESOURCES_INIT>;
export const PAYMENT_RESOURCES_NET_ERR = t.literal("PAYMENT_RESOURCES_NET_ERR");
export type PAYMENT_RESOURCES_NET_ERR = t.TypeOf<
  typeof PAYMENT_RESOURCES_NET_ERR
>;
export const PAYMENT_RESOURCES_SVR_ERR = t.literal("PAYMENT_RESOURCES_SVR_ERR");
export type PAYMENT_RESOURCES_SVR_ERR = t.TypeOf<
  typeof PAYMENT_RESOURCES_SVR_ERR
>;
export const PAYMENT_RESOURCES_RESP_ERR = t.literal(
  "PAYMENT_RESOURCES_RESP_ERR"
);
export type PAYMENT_RESOURCES_RESP_ERR = t.TypeOf<
  typeof PAYMENT_RESOURCES_RESP_ERR
>;
export const PAYMENT_RESOURCES_SUCCESS = t.literal("PAYMENT_RESOURCES_SUCCESS");
export type PAYMENT_RESOURCES_SUCCESS = t.TypeOf<
  typeof PAYMENT_RESOURCES_SUCCESS
>;
export const PAYMENT_START_SESSION_INIT = t.literal(
  "PAYMENT_START_SESSION_INIT"
);
export type PAYMENT_START_SESSION_INIT = t.TypeOf<
  typeof PAYMENT_START_SESSION_INIT
>;
export const PAYMENT_START_SESSION_NET_ERR = t.literal(
  "PAYMENT_START_SESSION_NET_ERR"
);
export type PAYMENT_START_SESSION_NET_ERR = t.TypeOf<
  typeof PAYMENT_START_SESSION_NET_ERR
>;
export const PAYMENT_START_SESSION_SVR_ERR = t.literal(
  "PAYMENT_START_SESSION_SVR_ERR"
);
export type PAYMENT_START_SESSION_SVR_ERR = t.TypeOf<
  typeof PAYMENT_START_SESSION_SVR_ERR
>;
export const PAYMENT_START_SESSION_RESP_ERR = t.literal(
  "PAYMENT_START_SESSION_RESP_ERR"
);
export type PAYMENT_START_SESSION_RESP_ERR = t.TypeOf<
  typeof PAYMENT_START_SESSION_RESP_ERR
>;
export const PAYMENT_START_SESSION_SUCCESS = t.literal(
  "PAYMENT_START_SESSION_SUCCESS"
);
export type PAYMENT_START_SESSION_SUCCESS = t.TypeOf<
  typeof PAYMENT_START_SESSION_SUCCESS
>;
export const PAYMENT_APPROVE_TERMS_INIT = t.literal(
  "PAYMENT_APPROVE_TERMS_INIT"
);
export type PAYMENT_APPROVE_TERMS_INIT = t.TypeOf<
  typeof PAYMENT_APPROVE_TERMS_INIT
>;
export const PAYMENT_APPROVE_TERMS_NET_ERR = t.literal(
  "PAYMENT_APPROVE_TERMS_NET_ERR"
);
export type PAYMENT_APPROVE_TERMS_NET_ERR = t.TypeOf<
  typeof PAYMENT_APPROVE_TERMS_NET_ERR
>;
export const PAYMENT_APPROVE_TERMS_SVR_ERR = t.literal(
  "PAYMENT_APPROVE_TERMS_SVR_ERR"
);
export type PAYMENT_APPROVE_TERMS_SVR_ERR = t.TypeOf<
  typeof PAYMENT_APPROVE_TERMS_SVR_ERR
>;
export const PAYMENT_APPROVE_TERMS_RESP_ERR = t.literal(
  "PAYMENT_APPROVE_TERMS_RESP_ERR"
);
export type PAYMENT_APPROVE_TERMS_RESP_ERR = t.TypeOf<
  typeof PAYMENT_APPROVE_TERMS_RESP_ERR
>;
export const PAYMENT_APPROVE_TERMS_SUCCESS = t.literal(
  "PAYMENT_APPROVE_TERMS_SUCCESS"
);
export type PAYMENT_APPROVE_TERMS_SUCCESS = t.TypeOf<
  typeof PAYMENT_APPROVE_TERMS_SUCCESS
>;
export const PAYMENT_WALLET_INIT = t.literal("PAYMENT_WALLET_INIT");
export type PAYMENT_WALLET_INIT = t.TypeOf<typeof PAYMENT_WALLET_INIT>;
export const PAYMENT_WALLET_NET_ERR = t.literal("PAYMENT_WALLET_NET_ERR");
export type PAYMENT_WALLET_NET_ERR = t.TypeOf<typeof PAYMENT_WALLET_NET_ERR>;
export const PAYMENT_WALLET_SVR_ERR = t.literal("PAYMENT_WALLET_SVR_ERR");
export type PAYMENT_WALLET_SVR_ERR = t.TypeOf<typeof PAYMENT_WALLET_SVR_ERR>;
export const PAYMENT_WALLET_RESP_ERR = t.literal("PAYMENT_WALLET_RESP_ERR");
export type PAYMENT_WALLET_RESP_ERR = t.TypeOf<typeof PAYMENT_WALLET_RESP_ERR>;
export const PAYMENT_WALLET_SUCCESS = t.literal("PAYMENT_WALLET_SUCCESS");
export type PAYMENT_WALLET_SUCCESS = t.TypeOf<typeof PAYMENT_WALLET_SUCCESS>;
export const PAYMENT_PAY3DS2_INIT = t.literal("PAYMENT_PAY3DS2_INIT");
export type PAYMENT_PAY3DS2_INIT = t.TypeOf<typeof PAYMENT_PAY3DS2_INIT>;
export const PAYMENT_PAY3DS2_NET_ERR = t.literal("PAYMENT_PAY3DS2_NET_ERR");
export type PAYMENT_PAY3DS2_NET_ERR = t.TypeOf<typeof PAYMENT_PAY3DS2_NET_ERR>;
export const PAYMENT_PAY3DS2_SVR_ERR = t.literal("PAYMENT_PAY3DS2_SVR_ERR");
export type PAYMENT_PAY3DS2_SVR_ERR = t.TypeOf<typeof PAYMENT_PAY3DS2_SVR_ERR>;
export const PAYMENT_PAY3DS2_RESP_ERR = t.literal("PAYMENT_PAY3DS2_RESP_ERR");
export type PAYMENT_PAY3DS2_RESP_ERR = t.TypeOf<
  typeof PAYMENT_PAY3DS2_RESP_ERR
>;
export const PAYMENT_PAY3DS2_SUCCESS = t.literal("PAYMENT_PAY3DS2_SUCCESS");
export type PAYMENT_PAY3DS2_SUCCESS = t.TypeOf<typeof PAYMENT_PAY3DS2_SUCCESS>;

export const PAYMENT_PSPLIST_INIT = t.literal("PAYMENT_PSPLIST_INIT");
export type PAYMENT_PSPLIST_INIT = t.TypeOf<typeof PAYMENT_PSPLIST_INIT>;
export const PAYMENT_PSPLIST_NET_ERR = t.literal("PAYMENT_PSPLIST_NET_ERR");
export type PAYMENT_PSPLIST_NET_ERR = t.TypeOf<typeof PAYMENT_PSPLIST_NET_ERR>;
export const PAYMENT_PSPLIST_SVR_ERR = t.literal("PAYMENT_PSPLIST_SVR_ERR");
export type PAYMENT_PSPLIST_SVR_ERR = t.TypeOf<typeof PAYMENT_PAY3DS2_SVR_ERR>;
export const PAYMENT_PSPLIST_RESP_ERR = t.literal("PAYMENT_PSPLIST_RESP_ERR");
export type PAYMENT_PSPLIST_RESP_ERR = t.TypeOf<
  typeof PAYMENT_PSPLIST_RESP_ERR
>;
export const PAYMENT_PSPLIST_SUCCESS = t.literal("PAYMENT_PSPLIST_SUCCESS");
export type PAYMENT_PSPLIST_SUCCESS = t.TypeOf<typeof PAYMENT_PSPLIST_SUCCESS>;

export const PAYMENT_UPD_WALLET_INIT = t.literal("PAYMENT_UPD_WALLET_INIT");
export type PAYMENT_UPD_WALLET_INIT = t.TypeOf<typeof PAYMENT_UPD_WALLET_INIT>;
export const PAYMENT_UPD_WALLET_NET_ERR = t.literal(
  "PAYMENT_UPD_WALLET_NET_ERR"
);
export type PAYMENT_UPD_WALLET_NET_ERR = t.TypeOf<
  typeof PAYMENT_UPD_WALLET_NET_ERR
>;
export const PAYMENT_UPD_WALLET_SVR_ERR = t.literal(
  "PAYMENT_UPD_WALLET_SVR_ERR"
);
export type PAYMENT_UPD_WALLET_SVR_ERR = t.TypeOf<
  typeof PAYMENT_UPD_WALLET_SVR_ERR
>;
export const PAYMENT_UPD_WALLET_RESP_ERR = t.literal(
  "PAYMENT_UPD_WALLET_RESP_ERR"
);
export type PAYMENT_UPD_WALLET_RESP_ERR = t.TypeOf<
  typeof PAYMENT_UPD_WALLET_RESP_ERR
>;
export const PAYMENT_UPD_WALLET_SUCCESS = t.literal(
  "PAYMENT_UPD_WALLET_SUCCESS"
);
export type PAYMENT_UPD_WALLET_SUCCESS = t.TypeOf<
  typeof PAYMENT_UPD_WALLET_SUCCESS
>;

export const THREEDSMETHODURL_STEP1_REQ = t.literal(
  "THREEDSMETHODURL_STEP1_REQ"
);
export type THREEDSMETHODURL_STEP1_REQ = t.TypeOf<
  typeof THREEDSMETHODURL_STEP1_REQ
>;
export const THREEDSMETHODURL_STEP1_RESP_ERR = t.literal(
  "THREEDSMETHODURL_STEP1_RESP_ERR"
);
export type THREEDSMETHODURL_STEP1_RESP_ERR = t.TypeOf<
  typeof THREEDSMETHODURL_STEP1_RESP_ERR
>;
export const THREEDSMETHODURL_STEP1_SUCCESS = t.literal(
  "THREEDSMETHODURL_STEP1_SUCCESS"
);
export type THREEDSMETHODURL_STEP1_SUCCESS = t.TypeOf<
  typeof THREEDSMETHODURL_STEP1_SUCCESS
>;
export const TRANSACTION_RESUME3DS2_INIT = t.literal(
  "TRANSACTION_RESUME3DS2_INIT"
);
export type TRANSACTION_RESUME3DS2_INIT = t.TypeOf<
  typeof TRANSACTION_RESUME3DS2_INIT
>;
export const TRANSACTION_RESUME3DS2_NET_ERR = t.literal(
  "TRANSACTION_RESUME3DS2_NET_ERR"
);
export type TRANSACTION_RESUME3DS2_NET_ERR = t.TypeOf<
  typeof TRANSACTION_RESUME3DS2_NET_ERR
>;
export const TRANSACTION_RESUME3DS2_SVR_ERR = t.literal(
  "TRANSACTION_RESUME3DS2_SVR_ERR"
);
export type TRANSACTION_RESUME3DS2_SVR_ERR = t.TypeOf<
  typeof TRANSACTION_RESUME3DS2_SVR_ERR
>;
export const TRANSACTION_RESUME3DS2_RESP_ERR = t.literal(
  "TRANSACTION_RESUME3DS2_RESP_ERR"
);
export type TRANSACTION_RESUME3DS2_RESP_ERR = t.TypeOf<
  typeof TRANSACTION_RESUME3DS2_RESP_ERR
>;
export const TRANSACTION_RESUME3DS2_SUCCESS = t.literal(
  "TRANSACTION_RESUME3DS2_SUCCESS"
);
export type TRANSACTION_RESUME3DS2_SUCCESS = t.TypeOf<
  typeof TRANSACTION_RESUME3DS2_SUCCESS
>;

export const TRANSACTION_POLLING_CHECK_INIT = t.literal(
  "TRANSACTION_POLLING_CHECK_INIT"
);
export type TRANSACTION_POLLING_CHECK_INIT = t.TypeOf<
  typeof TRANSACTION_POLLING_CHECK_INIT
>;
export const TRANSACTION_POLLING_CHECK_NET_ERR = t.literal(
  "TRANSACTION_POLLING_CHECK_NET_ERR"
);
export type TRANSACTION_POLLING_CHECK_NET_ERR = t.TypeOf<
  typeof TRANSACTION_POLLING_CHECK_NET_ERR
>;
export const TRANSACTION_POLLING_CHECK_SVR_ERR = t.literal(
  "TRANSACTION_POLLING_CHECK_SVR_ERR"
);
export type TRANSACTION_POLLING_CHECK_SVR_ERR = t.TypeOf<
  typeof TRANSACTION_POLLING_CHECK_SVR_ERR
>;
export const TRANSACTION_POLLING_CHECK_RESP_ERR = t.literal(
  "TRANSACTION_POLLING_CHECK_RESP_ERR"
);
export type TRANSACTION_POLLING_CHECK_RESP_ERR = t.TypeOf<
  typeof TRANSACTION_POLLING_CHECK_RESP_ERR
>;
export const TRANSACTION_POLLING_CHECK_SUCCESS = t.literal(
  "TRANSACTION_POLLING_CHECK_SUCCESS"
);
export type TRANSACTION_POLLING_CHECK_SUCCESS = t.TypeOf<
  typeof TRANSACTION_POLLING_CHECK_SUCCESS
>;

export const THREEDSACSCHALLENGEURL_STEP2_REQ = t.literal(
  "THREEDSACSCHALLENGEURL_STEP2_REQ"
);
export type THREEDSACSCHALLENGEURL_STEP2_REQ = t.TypeOf<
  typeof THREEDSACSCHALLENGEURL_STEP2_REQ
>;
export const THREEDSACSCHALLENGEURL_STEP2_RESP_ERR = t.literal(
  "THREEDSACSCHALLENGEURL_STEP2_RESP_ERR"
);
export type THREEDSACSCHALLENGEURL_STEP2_RESP_ERR = t.TypeOf<
  typeof THREEDSACSCHALLENGEURL_STEP2_RESP_ERR
>;
export const THREEDSACSCHALLENGEURL_STEP2_SUCCESS = t.literal(
  "THREEDSACSCHALLENGEURL_STEP2_SUCCESS"
);
export type THREEDSACSCHALLENGEURL_STEP2_SUCCESS = t.TypeOf<
  typeof THREEDSACSCHALLENGEURL_STEP2_SUCCESS
>;

export const TRANSACTION_RESUMEXPAY_INIT = t.literal(
  "TRANSACTION_RESUMEXPAY_INIT"
);
export type TRANSACTION_RESUMEXPAY_INIT = t.TypeOf<
  typeof TRANSACTION_RESUME3DS2_INIT
>;

export const TRANSACTION_RESUMEXPAY_NET_ERR = t.literal(
  "TRANSACTION_RESUMEXPAY_NET_ERR"
);
export type TRANSACTION_RESUMEXPAY_NET_ERR = t.TypeOf<
  typeof TRANSACTION_RESUME3DS2_NET_ERR
>;

export const TRANSACTION_RESUMEXPAY_SVR_ERR = t.literal(
  "TRANSACTION_RESUMEXPAY_SVR_ERR"
);
export type TRANSACTION_RESUMEXPAY_SVR_ERR = t.TypeOf<
  typeof TRANSACTION_RESUME3DS2_SVR_ERR
>;

export const TRANSACTION_RESUMEXPAY_RESP_ERR = t.literal(
  "TRANSACTION_RESUMEXPAY_RESP_ERR"
);
export type TRANSACTION_RESUMEXPAY_RESP_ERR = t.TypeOf<
  typeof TRANSACTION_RESUME3DS2_RESP_ERR
>;

export const TRANSACTION_RESUMEXPAY_SUCCESS = t.literal(
  "TRANSACTION_RESUMEXPAY_SUCCESS"
);
export type TRANSACTION_RESUMEXPAY_SUCCESS = t.TypeOf<
  typeof TRANSACTION_RESUME3DS2_SUCCESS
>;

export const THREEDS_CHECK_XPAY_RESP_ERR = t.literal(
  "THREEDS_CHECK_XPAY_RESP_ERR"
);
export type THREEDS_CHECK_XPAY_RESP_ERR = t.TypeOf<
  typeof THREEDS_CHECK_XPAY_RESP_ERR
>;

export const THREEDS_CHECK_XPAY_RESP_SUCCESS = t.literal(
  "THREEDS_CHECK_XPAY_RESP_SUCCESS"
);
export type THREEDS_CHECK_XPAY_RESP_SUCCESS = t.TypeOf<
  typeof THREEDS_CHECK_XPAY_RESP_SUCCESS
>;

export const PAYMENT_OUTCOME_CODE = t.literal("PAYMENT_OUTCOME_CODE");
export type PAYMENT_OUTCOME_CODE = t.TypeOf<typeof PAYMENT_OUTCOME_CODE>;

export const PAYMENT_ACTION_DELETE_INIT = t.literal(
  "PAYMENT_ACTION_DELETE_INIT"
);
export type PAYMENT_ACTION_DELETE_INIT = t.TypeOf<
  typeof PAYMENT_ACTION_DELETE_INIT
>;
export const PAYMENT_ACTION_DELETE_NET_ERR = t.literal(
  "PAYMENT_ACTION_DELETE_NET_ERR"
);
export type PAYMENT_ACTION_DELETE_NET_ERR = t.TypeOf<
  typeof PAYMENT_ACTION_DELETE_NET_ERR
>;
export const PAYMENT_ACTION_DELETE_SVR_ERR = t.literal(
  "PAYMENT_ACTION_DELETE_SVR_ERR"
);
export type PAYMENT_ACTION_DELETE_SVR_ERR = t.TypeOf<
  typeof PAYMENT_ACTION_DELETE_SVR_ERR
>;
export const PAYMENT_ACTION_DELETE_RESP_ERR = t.literal(
  "PAYMENT_ACTION_DELETE_RESP_ERR"
);
export type PAYMENT_ACTION_DELETE_RESP_ERR = t.TypeOf<
  typeof PAYMENT_ACTION_DELETE_RESP_ERR
>;
export const PAYMENT_ACTION_DELETE_SUCCESS = t.literal(
  "PAYMENT_ACTION_DELETE_SUCCESS"
);
export type PAYMENT_ACTION_DELETE_SUCCESS = t.TypeOf<
  typeof PAYMENT_ACTION_DELETE_SUCCESS
>;
declare const OneTrust: any;
declare const OnetrustActiveGroups: string;
const global = window as any;
const targCookiesGroup = "C0004";

const ENV = getConfigOrThrow().IO_PAY_ENV;

const mixpanelInit = function (): void {
  if (ENV === "develop") {
    // eslint-disable-next-line no-console
    console.log(
      `Mixpanel events mock on console log. See IO_PAY_ENV=${process.env.IO_PAY_ENV}`
    );
  } else {
    init("c3db8f517102d7a7ebd670c9da3e05c4", {
      api_host: "https://api-eu.mixpanel.com",
      ip: false,
      persistence: "localStorage",
      property_blacklist: ["$current_url", "$initial_referrer", "$referrer"],
    });
  }
};
// OneTrust callback
// eslint-disable-next-line functional/immutable-data
global.OptanonWrapper = function () {
  OneTrust.OnConsentChanged(function () {
    const activeGroups = OnetrustActiveGroups;
    if (activeGroups.indexOf(targCookiesGroup) > -1) {
      mixpanelInit();
    }
  });
};
// check mixpanel cookie consent in cookie
const OTCookieValue: string =
  document.cookie
    .split("; ")
    .find((row) => row.startsWith("OptanonConsent=")) || "";
const checkValue = `${targCookiesGroup}%3A1`;
if (OTCookieValue.indexOf(checkValue) > -1) {
  mixpanelInit();
}

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
