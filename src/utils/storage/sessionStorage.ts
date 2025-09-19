import { JwtUser } from "@pagopa/mui-italia";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { Bundle } from "../../../generated/definitions/payment-ecommerce/Bundle";
import { NewTransactionResponse } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { SessionPaymentMethodResponse } from "../../../generated/definitions/payment-ecommerce/SessionPaymentMethodResponse";
import {
  Cart,
  PaymentFormFields,
  PaymentInfo,
  PaymentId,
  PaymentEmailFormFields,
  PaymentMethod,
  PaymentMethodInfo,
} from "../../features/payment/models/paymentModel";
import { getConfigOrThrow } from "../config/config";

export enum SessionItems {
  paymentInfo = "paymentInfo",
  activeTheme = "activeTheme",
  noticeInfo = "rptId",
  useremail = "useremail",
  enableAuthentication = "enableAuthentication",
  enablePspPage = "enablePspPage",
  paymentMethod = "paymentMethod",
  pspSelected = "pspSelected",
  sessionToken = "sessionToken",
  cart = "cart",
  transaction = "transaction",
  sessionPaymentMethod = "sessionPayment",
  paymentMethodInfo = "paymentMethodInfo",
  orderId = "orderId",
  correlationId = "correlationId",
  cartClientId = "cartClientId",
  loginOriginPage = "loginOriginPage",
  authToken = "authToken",
  noticeCodeDataEntry = "noticeCodeDataEntry",
  enableScheduledMaintenanceBanner = "enableScheduledMaintenanceBanner",
  enablePaymentMethodsHandler = "enablePaymentMethodsHandler",
  counterPolling = "counterPolling",
  mixpanelInitialized = "mixpanelInitialized",
}
const isParsable = (item: SessionItems) =>
  !(
    item === SessionItems.sessionToken ||
    item === SessionItems.useremail ||
    item === SessionItems.orderId ||
    item === SessionItems.correlationId ||
    item === SessionItems.cartClientId ||
    item === SessionItems.enableAuthentication ||
    item === SessionItems.loginOriginPage ||
    item === SessionItems.authToken ||
    item === SessionItems.noticeCodeDataEntry ||
    item === SessionItems.enableScheduledMaintenanceBanner ||
    item === SessionItems.enablePaymentMethodsHandler ||
    item === SessionItems.mixpanelInitialized
  );

export const getSessionItem = (item: SessionItems) => {
  try {
    const serializedState = sessionStorage.getItem(item);

    if (!serializedState) {
      return undefined;
    }

    return isParsable(item)
      ? (JSON.parse(serializedState) as
          | PaymentInfo
          | PaymentFormFields
          | PaymentEmailFormFields
          | PaymentId
          | NewTransactionResponse
          | Cart
          | Bundle
          | SessionPaymentMethodResponse
          | PaymentMethodInfo
          | JwtUser)
      : serializedState;
  } catch (e) {
    return undefined;
  }
};

export const getAndClearSessionItem = (item: SessionItems) =>
  pipe(
    getSessionItem(item),
    O.fromNullable,
    O.fold(
      () => undefined,
      (value) => {
        clearSessionItem(item);
        return value;
      }
    )
  );

export function setSessionItem(
  name: SessionItems,
  item:
    | string
    | PaymentInfo
    | PaymentFormFields
    | PaymentEmailFormFields
    | PaymentMethod
    | PaymentId
    | NewTransactionResponse
    | Cart
    | Bundle
    | SessionPaymentMethodResponse
    | PaymentMethodInfo
    | JwtUser
) {
  sessionStorage.setItem(
    name,
    typeof item === "string" ? item : JSON.stringify(item)
  );
}

export function clearSessionItem(name: SessionItems) {
  sessionStorage.removeItem(name);
}

export const isStateEmpty = (item: SessionItems) => !getSessionItem(item);

export const clearStorage = () => {
  sessionStorage.clear();
};

const KEYS_TO_PRESERVE = [
  SessionItems.authToken,
  SessionItems.enableAuthentication,
  SessionItems.enableScheduledMaintenanceBanner,
  SessionItems.mixpanelInitialized,
] as const;

export const clearStorageAndMaintainAuthData = () => {
  const snapshot = Object.fromEntries(
    KEYS_TO_PRESERVE.map((k) => [k, sessionStorage.getItem(k)])
  ) as Record<typeof KEYS_TO_PRESERVE[number], string | null>;

  sessionStorage.clear();

  for (const [k, v] of Object.entries(snapshot)) {
    if (v !== null) {
      sessionStorage.setItem(k, v);
    }
  }
};

export const getRptIdsFromSession = () =>
  pipe(
    // use cart if present
    getSessionItem(SessionItems.cart) as Cart,
    O.fromNullable,
    O.fold(
      // use rptId value if cart not present
      () =>
        pipe(
          getSessionItem(SessionItems.noticeInfo) as PaymentFormFields,
          O.fromNullable,
          O.map((noticeInfo) => `${noticeInfo?.cf}${noticeInfo?.billCode}`)
        ),
      (cart) =>
        pipe(
          cart.paymentNotices,
          O.fromNullable,
          O.map((paymentNotices) =>
            paymentNotices
              .map((notice) => `${notice.fiscalCode}${notice.noticeNumber}`)
              .join(",")
          )
        )
    ),
    O.getOrElse(() => "")
  );

export function getReCaptchaKey() {
  return getConfigOrThrow().CHECKOUT_RECAPTCHA_SITE_KEY;
}
