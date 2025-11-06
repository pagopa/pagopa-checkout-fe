import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 90000, // Global timeout for all tests (90 seconds)
  testMatch: ["test/spec/**/*.spec.ts"],
  retries: 3,
  workers: 1,
  fullyParallel: false,
  reporter: [
    ["dot"],
    [
      "junit",
      {
        outputFile: `test-results/${
          process.env.PLAYWRIGHT_PROJECT_NAME || "results"
        }.xml`,
      },
    ], // reporter globale
  ],
  use: {
    headless: true, // Run tests in headless mode
    viewport: { width: 1280, height: 907 }, // Default viewport size
    actionTimeout: 10000,
    navigationTimeout: 30000,
    screenshot: "off",
    video: "off",
    trace: "off",
  },
  projects: [
    {
      name: "payment-flow-chromium",
      testMatch: ["test/spec/paymentflow.integration.spec.ts"],
      use: { browserName: "chromium" },
      outputDir: "test-results/payment-flow",
      fullyParallel: false,
    },
    {
      name: "payment-flow-firefox",
      testMatch: ["test/spec/paymentflow.integration.spec.ts"],
      use: { browserName: "firefox" },
      outputDir: "test-results/payment-flow",
      fullyParallel: false,
    },
    {
      name: "payment-flow-webkit",
      testMatch: ["test/spec/paymentflow.integration.spec.ts"],
      use: { browserName: "webkit" },
      outputDir: "test-results/payment-flow",
      fullyParallel: false,
    },
    {
      name: "outcomes-chromium",
      testMatch: ["test/spec/outcomes.integration.spec.ts"],
      use: { browserName: "chromium" },
      outputDir: "test-results/outcomes",
      fullyParallel: false,
    },
    {
      name: "outcomes-firefox",
      testMatch: ["test/spec/outcomes.integration.spec.ts"],
      use: { browserName: "firefox" },
      outputDir: "test-results/outcomes",
      fullyParallel: false,
    },
    {
      name: "outcomes-webkit",
      testMatch: ["test/spec/outcomes.integration.spec.ts"],
      use: { browserName: "webkit" },
      outputDir: "test-results/outcomes",
      fullyParallel: false,
    },
  ],
});
