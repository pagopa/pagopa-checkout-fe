import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 90000, // Global timeout for all tests (90 seconds)
  testMatch: ["test/spec/**/*.spec.ts"],
  retries: 1,
  workers: process.env.CI ? 4 : undefined,
  reporter: [
    ["dot"],
    ["junit", { outputFile: "test-results/results.xml" }], // reporter globale
  ],
  use: {
    headless: true, // Run tests in headless mode
    viewport: { width: 1280, height: 720 }, // Default viewport size
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
    },
    {
      name: "outcomes",
      testMatch: ["test/spec/outcomes.integration.spec.ts"],
      use: { browserName: "chromium" },
    },
  ],
});
