import { JwtUser } from "@pagopa/mui-italia";
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
  noticeInfo = "rptId",
  useremail = "useremail",
  enableAuthentication = "enableAuthentication",
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
  loggedUser = "loggedUser",
  loginOriginPage = "loginOriginPage",
  authCode = "authCode",
  authToken = "authToken"
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
    item === SessionItems.authCode ||
    item === SessionItems.authToken
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

export const clearStorageAndMaintainAuthData = () => {
  const authCode = getSessionItem(SessionItems.authCode) as string;
  const authToken = getSessionItem(SessionItems.authToken) as string;
  sessionStorage.clear();
  if(authCode != null)
    setSessionItem(SessionItems.authCode, authCode);
  if(authToken != null)
    setSessionItem(SessionItems.authToken, authToken);
};

export function getReCaptchaKey() {
  return getConfigOrThrow().CHECKOUT_RECAPTCHA_SITE_KEY;
}
