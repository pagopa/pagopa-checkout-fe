import { ApmBase, init as initApm } from "@elastic/apm-rum";

// const apmServerUrl = getConfigOrThrow().APM_SERVER_URL;
const apmServerUrl = "http://localhost"; // TODO: set the right APM url here

export const initializeApm = (): ApmBase =>
  initApm({
    active: true,
    serviceName: "pagoPA Checkout f.e.",
    serverUrl: apmServerUrl,
    serviceVersion: process.env.CHECKOUT_VERSION ?? "N/A",
  });
