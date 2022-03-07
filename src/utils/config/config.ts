import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { Millisecond } from "italia-ts-commons/lib/units";

export interface IConfig {
  CHECKOUT_PAGOPA_APIM_HOST: NonEmptyString;
  CHECKOUT_API_PAYMENT_ACTIVATIONS_BASEPATH: NonEmptyString;
  CHECKOUT_API_PAYMENT_TRANSACTIONS_BASEPATH: NonEmptyString;
  CHECKOUT_PM_HOST: NonEmptyString;
  CHECKOUT_PM_API_BASEPATH: NonEmptyString;
  CHECKOUT_API_TIMEOUT: Millisecond;
  CHECKOUT_POLLING_ACTIVATION_INTERVAL: Millisecond;
  CHECKOUT_POLLING_ACTIVATION_ATTEMPTS: number;
  CHECKOUT_ENV: NonEmptyString;
  CHECKOUT_RECAPTCHA_SITE_KEY: NonEmptyString;
}

export function getConfig(param: keyof IConfig): string | Millisecond {
  /*eslint-disable */
  if (!("_env_" in window)) {
    throw new Error("Missing configuration");
  }
  // eslint-disable-next-line: no-any
  if (!(window as any)._env_[param]) {
    throw new Error("Missing required environment variable: " + param);
  }
  // eslint-disable-next-line: no-any
  return (window as any)._env_[param];
}
