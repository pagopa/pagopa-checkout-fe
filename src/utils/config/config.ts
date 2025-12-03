/**
 * Config module
 *
 * Single point of access for the application configuration. Handles validation on required environment variables.
 * The configuration is evaluate eagerly at the first access to the module. The module exposes convenient methods to access such value.
 */

import * as t from "io-ts";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";

export type IConfig = t.TypeOf<typeof IConfig>;
export const IConfig = t.interface({
  CHECKOUT_PM_HOST: NonEmptyString,
  CHECKOUT_PM_API_BASEPATH: NonEmptyString,
  CHECKOUT_API_ECOMMERCE_BASEPATH: NonEmptyString,
  CHECKOUT_API_ECOMMERCE_BASEPATH_V2: NonEmptyString,
  CHECKOUT_API_ECOMMERCE_BASEPATH_V3: NonEmptyString,
  CHECKOUT_API_ECOMMERCE_BASEPATH_V4: NonEmptyString,
  CHECKOUT_API_FEATURE_FLAGS_BASEPATH: NonEmptyString,
  CHECKOUT_API_TIMEOUT: t.number,
  CHECKOUT_ENV: NonEmptyString,
  CHECKOUT_PAGOPA_APIM_HOST: NonEmptyString,
  CHECKOUT_PAGOPA_ASSETS_CDN: NonEmptyString,
  CHECKOUT_PAGOPA_LOGOS_CDN: NonEmptyString,
  CHECKOUT_API_PAYMENT_ACTIVATIONS_BASEPATH: NonEmptyString,
  CHECKOUT_API_PAYMENT_TRANSACTIONS_BASEPATH: NonEmptyString,
  CHECKOUT_POLLING_ACTIVATION_INTERVAL: t.number,
  CHECKOUT_POLLING_ACTIVATION_ATTEMPTS: t.number,
  CHECKOUT_RECAPTCHA_SITE_KEY: NonEmptyString,
  CHECKOUT_DONATIONS_URL: NonEmptyString,
  CHECKOUT_SURVEY_SHOW: t.boolean,
  CHECKOUT_NPG_SDK_URL: NonEmptyString,
  CHECKOUT_API_RETRY_NUMBERS: t.number,
  CHECKOUT_API_RETRY_DELAY: t.number,
  CHECKOUT_GDI_CHECK_TIMEOUT: t.number,
  CHECKOUT_API_AUTH_SERVICE_BASEPATH_V1: NonEmptyString,
  CHECKOUT_API_RETRY_NUMBERS_LINEAR: t.number,
  CHECKOUT_API_WALLET_BASEPATH_V4: NonEmptyString,
});

// eslint-disable-next-line no-underscore-dangle
const rawEnv =
  // eslint-disable-next-line no-underscore-dangle
  typeof window !== "undefined" && (window as any)._env_
    ? // eslint-disable-next-line no-underscore-dangle
      (window as any)._env_
    : {};

// No need to re-evaluate this object for each call
const errorOrConfig: t.Validation<IConfig> = IConfig.decode({
  // eslint-disable-next-line no-underscore-dangle
  ...(window as any)._env_,
  /* CHECKOUT_API_TIMEOUT: parseInt(
    // eslint-disable-next-line no-underscore-dangle
    (window as any)._env_.CHECKOUT_API_TIMEOUT,
    10
  ), */
  CHECKOUT_API_TIMEOUT: parseInt(rawEnv.CHECKOUT_API_TIMEOUT || "10000", 10),
  /* CHECKOUT_POLLING_ACTIVATION_INTERVAL: parseInt(
    // eslint-disable-next-line no-underscore-dangle
    (window as any)._env_.CHECKOUT_POLLING_ACTIVATION_INTERVAL,
    10
  ), */

  CHECKOUT_POLLING_ACTIVATION_INTERVAL: parseInt(
    rawEnv.CHECKOUT_POLLING_ACTIVATION_INTERVAL || "10000",
    10
  ),
  CHECKOUT_POLLING_ACTIVATION_ATTEMPTS: parseInt(
    rawEnv.CHECKOUT_POLLING_ACTIVATION_ATTEMPTS || "5",
    10
  ),

  /* CHECKOUT_POLLING_ACTIVATION_ATTEMPTS: parseInt(
    // eslint-disable-next-line no-underscore-dangle
    (window as any)._env_.CHECKOUT_POLLING_ACTIVATION_ATTEMPTS,
    10
  ), */
  /* CHECKOUT_SURVEY_SHOW: !!parseInt(
    // eslint-disable-next-line no-underscore-dangle
    (window as any)._env_.CHECKOUT_SURVEY_SHOW,
    2
  ), */
  // CHECKOUT_SURVEY_SHOW: parseInt(rawEnv.CHECKOUT_SURVEY_SHOW || "0", 10),
  CHECKOUT_SURVEY_SHOW:
    rawEnv.CHECKOUT_SURVEY_SHOW === "true" ||
    rawEnv.CHECKOUT_SURVEY_SHOW === "1",

  // eslint-disable-next-line no-underscore-dangle
  CHECKOUT_API_RETRY_NUMBERS: (window as any)._env_.CHECKOUT_API_RETRY_NUMBERS
    ? parseInt(
        // eslint-disable-next-line no-underscore-dangle
        (window as any)._env_.CHECKOUT_API_RETRY_NUMBERS,
        10
      )
    : 10,
  // eslint-disable-next-line no-underscore-dangle
  CHECKOUT_API_RETRY_DELAY: (window as any)._env_.CHECKOUT_API_RETRY_DELAY
    ? parseInt(
        // eslint-disable-next-line no-underscore-dangle
        (window as any)._env_.CHECKOUT_API_RETRY_DELAY,
        10
      )
    : 3000,
  CHECKOUT_GDI_CHECK_TIMEOUT: parseInt(
    // eslint-disable-next-line no-underscore-dangle
    (window as any)._env_.CHECKOUT_GDI_CHECK_TIMEOUT,
    10
  ),

  // eslint-disable-next-line no-underscore-dangle
  CHECKOUT_API_RETRY_NUMBERS_LINEAR: (window as any)._env_
    .CHECKOUT_API_RETRY_NUMBERS_LINEAR
    ? parseInt(
        // eslint-disable-next-line no-underscore-dangle
        (window as any)._env_.CHECKOUT_API_RETRY_NUMBERS_LINEAR,
        10
      )
    : 5,
});

/**
 * Read the application configuration and check for invalid values.
 * Configuration is eagerly evalued when the application starts.
 *
 * @returns either the configuration values or a list of validation errors
 */
export function getConfig(): t.Validation<IConfig> {
  return errorOrConfig;
}

/**
 * Read the application configuration and check for invalid values.
 * If the application is not valid, raises an exception.
 *
 * @returns the configuration values
 * @throws validation errors found while parsing the application configuration
 */
export function getConfigOrThrow(): IConfig {
  return pipe(
    errorOrConfig,
    E.getOrElseW((errors) => {
      throw new Error(`Invalid configuration: ${readableReport(errors)}`);
    })
  );
}
