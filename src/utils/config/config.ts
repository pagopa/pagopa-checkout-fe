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
  CHECKOUT_ECOMMERCE_HOST: NonEmptyString,
  CHECKOUT_PM_API_BASEPATH: NonEmptyString,
  CHECKOUT_API_ECOMMERCE_BASEPATH: NonEmptyString,
  CHECKOUT_API_ECOMMERCE_BASEPATH_V2: NonEmptyString,
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
});

// No need to re-evaluate this object for each call
const errorOrConfig: t.Validation<IConfig> = IConfig.decode({
  // eslint-disable-next-line no-underscore-dangle
  ...(window as any)._env_,
  CHECKOUT_API_TIMEOUT: parseInt(
    // eslint-disable-next-line no-underscore-dangle
    (window as any)._env_.CHECKOUT_API_TIMEOUT,
    10
  ),
  CHECKOUT_POLLING_ACTIVATION_INTERVAL: parseInt(
    // eslint-disable-next-line no-underscore-dangle
    (window as any)._env_.CHECKOUT_POLLING_ACTIVATION_INTERVAL,
    10
  ),
  CHECKOUT_POLLING_ACTIVATION_ATTEMPTS: parseInt(
    // eslint-disable-next-line no-underscore-dangle
    (window as any)._env_.CHECKOUT_POLLING_ACTIVATION_ATTEMPTS,
    10
  ),
  CHECKOUT_SURVEY_SHOW: !!parseInt(
    // eslint-disable-next-line no-underscore-dangle
    (window as any)._env_.CHECKOUT_SURVEY_SHOW,
    2
  ),
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
