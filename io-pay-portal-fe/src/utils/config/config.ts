import { Millisecond } from "italia-ts-commons/lib/units";

export interface IConfig {
  IO_PAY_PORTAL_API_HOST: string;
  IO_PAY_PORTAL_API_REQUEST_TIMEOUT: Millisecond;
  IO_PAY_PORTAL_PAY_WL_POLLING_INTERVAL: Millisecond;
  IO_PAY_PORTAL_PAY_WL_POLLING_ATTEMPTS: number;
  IO_PAY_PORTAL_ENV: string;
  IO_PAY_PORTAL_SITE_KEY: string;
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
