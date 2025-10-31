import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 90000, // Global timeout for all tests (90 seconds)
  testMatch: ["test/spec/**/*.spec.ts"],
  retries: 1,
  workers: process.env.CI ? 4 : undefined,
  reporter: [["html", { outputFolder: "test-results", open: "never" }]],
  use: {
    headless: true, // Run tests in headless mode
    viewport: { width: 1280, height: 720 }, // Default viewport size
    actionTimeout: 10000, // Timeout for individual actions (10 seconds)
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
      },
    },
    {
      name: "firefox",
      use: {
        browserName: "firefox",
      },
    },
    {
      name: "webkit",
      use: {
        browserName: "webkit",
      },
    },
  ],
});
