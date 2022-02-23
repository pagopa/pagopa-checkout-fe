/**
 * Config module
 *
 * Single point of access for the application configuration. Handles validation on required environment variables.
 * The configuration is evaluate eagerly at the first access to the module. The module exposes convenient methods to access such value.
 */

import * as t from "io-ts";
import { NonEmptyString } from "italia-ts-commons/lib/strings";
import { readableReport } from "italia-ts-commons/lib/reporters";

export type IConfig = t.TypeOf<typeof IConfig>;
export const IConfig = t.interface({
  IO_PAY_PAYMENT_MANAGER_HOST: NonEmptyString,
  IO_PAY_FUNCTIONS_HOST: NonEmptyString,
  IO_PAY_API_TIMEOUT: t.number,
  IO_PAY_ENV: NonEmptyString,
});

// No need to re-evaluate this object for each call
const errorOrConfig: t.Validation<IConfig> = IConfig.decode({
  // eslint-disable-next-line no-underscore-dangle
  ...(window as any)._env_,
  // eslint-disable-next-line no-underscore-dangle
  IO_PAY_API_TIMEOUT: parseInt((window as any)._env_.IO_PAY_API_TIMEOUT, 10),
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
  return errorOrConfig.getOrElseL((errors) => {
    throw new Error(`Invalid configuration: ${readableReport(errors)}`);
  });
}
