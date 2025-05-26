/* eslint-disable no-console, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-floating-promises */
import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("https://www.saucedemo.com/");
});
test.describe("Demo Test", () => {
  test("Verify Login Error Message", async ({ page }) => {
    await page.waitForSelector("#user-name", { state: "visible" });
    await page.locator('[data-test="username"]').type("example1@example.com");
    await page.locator('[data-test="password"]').type("examplepassword");
    await page.locator('[data-test="login-button"]').click();
    const errorMessage = await page
      .locator('[data-test="error"]')
      .textContent();
    // eslint-disable-next-line no-console
    console.log("Login Error Message: " + errorMessage);
    expect(errorMessage).toBe(
      "Epic sadface: Username and password do not match any user in this service"
    );
    page.close();
  });
});
