import { ApmBase, init as initApm } from "@elastic/apm-rum";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceVersion = require("../../../package.json").version;
export const initializeApm = (): ApmBase => {
  const apm = initApm({
    active: true,
    serviceName: "Checkout-fe",
    serverUrl:
      "https://0fbb6b488afc4677a39b9655f2caa1c2.apm.westeurope.azure.elastic-cloud.com:443",
    environment: "DEV",
    serviceVersion,
  });
  // eslint-disable-next-line no-console
  console.log(`APM enabled -> : ${apm.isEnabled()}`);
  // eslint-disable-next-line no-console
  console.log(`APM active -> : ${apm.isActive()}`);
  return apm;
};
