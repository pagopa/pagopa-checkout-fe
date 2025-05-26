/* eslint-disable no-console, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-floating-promises */
import { test, expect } from "@playwright/test";

const VALID_RPTID = "302000100000009400";
const VALID_FISCAL_CODE = "77777777777";
const EMAIL = "mario.rossi@email.com";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:1234");
});
test.describe("Firts Test", () => {
  test("Pay notice", async ({ page }) => {
    await page.waitForSelector("#languageMenu", { state: "visible" });
    await page.locator("#languageMenu").click();
    await page.locator("#languageMenu").selectOption("it");
    await page.waitForSelector("#insertDataBox", { state: "visible" });
    await page.locator("#insertDataBox").click();
    await page.waitForURL("http://localhost:1234/inserisci-dati-avviso");
    await page.waitForSelector("#billCode", { state: "visible" });
    await page.waitForSelector("#cf", { state: "visible" });
    await page.locator("#billCode").type(VALID_RPTID);
    await page.locator("#cf").type(VALID_FISCAL_CODE);
    await page.waitForSelector("#paymentNoticeButtonContinue", {
      state: "visible",
    });
    await page.locator("#paymentNoticeButtonContinue").click();
    await page.waitForURL("http://localhost:1234/dati-pagamento");
    await page.waitForSelector("#paymentSummaryButtonPay", {
      state: "visible",
    });
    await page.locator("#paymentSummaryButtonPay").click();
    await page.waitForSelector("#email", { state: "visible" });
    await page.waitForSelector("#confirmEmail", { state: "visible" });
    await page.locator("#email").type(EMAIL);
    await page.locator("#confirmEmail").type(EMAIL);
    await page.waitForSelector("#paymentEmailPageButtonContinue", {
      state: "visible",
    });
    await page.locator("#paymentEmailPageButtonContinue").click();
    await page.waitForURL("http://localhost:1234/scegli-metodo");
    await page.locator('[data-qaid="CP"]').click();
    await page.waitForURL("http://localhost:1234/inserisci-carta");
    await page.waitForSelector("#frame_CARD_NUMBER", { state: "visible" });
    await page.waitForSelector("#frame_EXPIRATION_DATE", { state: "visible" });
    await page.waitForSelector("#frame_SECURITY_CODE", { state: "visible" });
    await page.waitForSelector("#frame_CARDHOLDER_NAME", { state: "visible" });
    await page.locator("#frame_CARD_NUMBER").type("4242424242424242");
    await page.locator("#frame_EXPIRATION_DATE").type("1230");
    await page.locator("#frame_SECURITY_CODE").type("123");
    await page.locator("#frame_CARDHOLDER_NAME").type("Mario Rossi");
    await page.waitForSelector("#submit", { state: "visible" });
    await page.locator("#submit").isEnabled();
    await page.locator("#submit").click();
    await page.waitForURL("http://localhost:1234/lista-psp");
    await page.waitForSelector("#BNLIITRR", { state: "visible" });
    await page.locator("#BNLIITRR").isEnabled();
    await page.locator("#BNLIITRR").click();
    await page.waitForSelector("#paymentPspListPageButtonContinue", {
      state: "visible",
    });
    await page.locator("#paymentPspListPageButtonContinue").click();
    await page.waitForSelector("#paymentCheckPageButtonPay", {
      state: "visible",
    });
    console.log(await page.locator("#paymentCheckPageButtonPay").textContent());
    expect(await page.locator("#paymentCheckPageButtonPay").textContent()).toBe(
      "Paga 120,15\xa0€"
    );
    await page.locator("#paymentCheckPageButtonPay").click();
    await page.waitForURL("http://localhost:1234/esito");
    expect(await page.locator("#responsePageMessageTitle").textContent()).toBe(
      "Hai pagato 120,15\xa0€"
    );
    page.close();
  });
});
