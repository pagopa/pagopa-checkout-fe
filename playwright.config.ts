import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 90000, // Global timeout for all tests (90 seconds)
  use: {
    headless: true, // Run tests in headless mode
    viewport: { width: 1280, height: 720 }, // Default viewport size
    actionTimeout: 10000, // Timeout for individual actions (10 seconds)
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
      fullyParallel: true,
      retries: 3,
    },
    {
      name: "firefox",
      use: { browserName: "firefox" },
    },
    {
      name: "webKit",
      use: { browserName: "webkit" },
    },
  ],
});
