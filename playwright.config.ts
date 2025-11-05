import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 90000, // Global timeout for all tests (90 seconds)
  testMatch: ["test/spec/**/*.spec.ts"],
  retries: 3,
  workers: 3,
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
    actionTimeout: 0,
    navigationTimeout: 0,
    screenshot: "off",
    video: "off",
    trace: "off",
  },
  projects: [
    {
      name: "payment-flow",
      testMatch: ["test/spec/paymentflow.integration.spec.ts"],
      use: { browserName: "chromium" },
      outputDir: "test-results/payment-flow",
      fullyParallel: true,
    },
    {
      name: "outcomes",
      testMatch: ["test/spec/outcomes.integration.spec.ts"],
      use: { browserName: "chromium" },
      outputDir: "test-results/outcomes",
      fullyParallel: true,
    },
  ],
});
