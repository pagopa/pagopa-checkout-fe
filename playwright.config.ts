import { defineConfig } from "@playwright/test";

export default defineConfig({
  timeout: 60000, // Global timeout for all tests (60 seconds)
  use: {
    headless: true, // Run tests in headless mode
    viewport: { width: 1280, height: 720 }, // Default viewport size
    actionTimeout: 5000, // Timeout for individual actions (5 seconds)
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
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
