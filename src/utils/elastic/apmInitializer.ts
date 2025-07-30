import { ApmBase, init as initApm } from "@elastic/apm-rum";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceVersion = require("../../../package.json").version;
export const initializeApm = (): ApmBase =>
  initApm({
    active: true,
    serviceName: "Checkout-fe",
    serverUrl:
      "https://pagopa-s-weu-ec.apm.westeurope.azure.elastic-cloud.com:443",
    environment: "DEV",
    serviceVersion,
    distributedTracingOrigins: ['https://dev.checkout.pagopa.it']
  });
