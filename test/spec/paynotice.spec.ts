/* eslint-disable no-console, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-floating-promises */
import { test, expect, Page } from "@playwright/test";
import itTranslation from "../../src/translations/it/translations.json";

const VALID_RPTID = "302000100000009400";
const EMAIL = "mario.rossi@email.com";

const OUTCOME_FISCAL_CODE_SUCCESS = "77777777000";
const OUTCOME_FISCAL_CODE_GENERIC_ERROR = "77777777001";
const OUTCOME_FISCAL_CODE_AUTHORIZATION_ERROR = "77777777002";
const OUTCOME_FISCAL_CODE_INVALID_DATA = "77777777003";
const OUTCOME_FISCAL_CODE_TIMEOUT = "77777777004";
const OUTCOME_FISCAL_CODE_INVALID_CARD = "77777777007";
const OUTCOME_FISCAL_CODE_CANCELLED_BY_USER = "77777777008";
const OUTCOME_FISCAL_CODE_EXCESSIVE_AMOUNT = "77777777010";
const OUTCOME_FISCAL_CODE_TAKEN_IN_CHARGE = "77777777017";
const OUTCOME_FISCAL_CODE_REFUNDED = "77777777018";
const OUTCOME_FISCAL_CODE_PSP_ERROR = "77777777025";
const OUTCOME_FISCAL_CODE_BALANCE_NOT_AVAILABLE = "77777777116";
const OUTCOME_FISCAL_CODE_CVV_ERROR = "77777777117";
const OUTCOME_FISCAL_CODE_LIMIT_EXCEEDED = "77777777121";
const OUTCOME_FISCAL_CODE_DEFAULT = "77777777777";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:1234");
});
test.describe("Payment flow", () => {
  [
    [0, "SUCCESS", OUTCOME_FISCAL_CODE_SUCCESS],
    [1, "GENERIC ERROR", OUTCOME_FISCAL_CODE_GENERIC_ERROR],
    [2, "AUTH ERROR", OUTCOME_FISCAL_CODE_AUTHORIZATION_ERROR],
    [3, "INVALID DATA", OUTCOME_FISCAL_CODE_INVALID_DATA],
    [4, "TIMEOUT", OUTCOME_FISCAL_CODE_TIMEOUT],
    [7, "INVALID CARD", OUTCOME_FISCAL_CODE_INVALID_CARD],
    [8, "CANCELLED BY USER", OUTCOME_FISCAL_CODE_CANCELLED_BY_USER],
    [10, "EXCESSIVE AMOUNT", OUTCOME_FISCAL_CODE_EXCESSIVE_AMOUNT],
    [17, "TAKE IN CHARGE", OUTCOME_FISCAL_CODE_TAKEN_IN_CHARGE],
    [18, "REFUNDED", OUTCOME_FISCAL_CODE_REFUNDED],
    [25, "PSP ERROR", OUTCOME_FISCAL_CODE_PSP_ERROR],
    [116, "BALANCE NOT AVAILABLE", OUTCOME_FISCAL_CODE_BALANCE_NOT_AVAILABLE],
    [117, "CVV ERROR", OUTCOME_FISCAL_CODE_CVV_ERROR],
    [121, "LIMIT EXCEEDED", OUTCOME_FISCAL_CODE_LIMIT_EXCEEDED],
    [0, "SUCCESS_DEFAULT", OUTCOME_FISCAL_CODE_DEFAULT],
  ].map((testCase) => {
    test("Pay notice with outcome " + testCase[1], async ({ page }) => {
      const index = testCase[0] as
        | 0
        | 1
        | 2
        | 3
        | 4
        | 5
        | 6
        | 7
        | 8
        | 10
        | 12
        | 17
        | 18
        | 25
        | 116
        | 117
        | 121;
      const fiscalCode = testCase[2] as string;
      await selectLang(page, "it");
      await goToInserisciDatiAvviso(page);
      await submitDatiAvviso(page, VALID_RPTID, fiscalCode);
      await viewPaymentSummary(page);
      await submitEmail(page, EMAIL);
      await selectMethod(page, "CP");
      await insertCardData(
        page,
        "4242424242424242",
        "1230",
        "123",
        "Mario Rossi"
      );
      await selectPsp(page, "#BNLIITRR");
      await pay(page, "Paga 120,15\xa0€");
      await checkEsito(
        page,
        itTranslation.paymentResponsePage[index].title.replace(
          "{{amount}}",
          "120,15\xa0€"
        )
      );
      page.close();
    });
  });
});

// playwright helper methods
const selectLang = async (page: Page, language: string) => {
  await page.waitForSelector("#languageMenu", { state: "visible" });
  await page.locator("#languageMenu").click();
  await page.locator("#languageMenu").selectOption(language);
};

const goToInserisciDatiAvviso = async (page: Page) => {
  await page.waitForSelector("#insertDataBox", { state: "visible" });
  await page.locator("#insertDataBox").click();
};

const submitDatiAvviso = async (
  page: Page,
  rptId: string,
  fiscalCode: string
) => {
  await page.waitForURL("http://localhost:1234/inserisci-dati-avviso");
  await page.waitForSelector("#billCode", { state: "visible" });
  await page.waitForSelector("#cf", { state: "visible" });
  await page.locator("#billCode").type(rptId);
  await page.locator("#cf").type(fiscalCode);
  await page.waitForSelector("#paymentNoticeButtonContinue", {
    state: "visible",
  });
  await page.locator("#paymentNoticeButtonContinue").click();
};

const viewPaymentSummary = async (page: Page) => {
  await page.waitForURL("http://localhost:1234/dati-pagamento");
  await page.waitForSelector("#paymentSummaryButtonPay", {
    state: "visible",
  });
  await page.locator("#paymentSummaryButtonPay").click();
};

const submitEmail = async (page: Page, email: string) => {
  await page.waitForURL("http://localhost:1234/inserisci-email");
  await page.waitForSelector("#email", { state: "visible" });
  await page.waitForSelector("#confirmEmail", { state: "visible" });
  await page.locator("#email").type(email);
  await page.locator("#confirmEmail").type(email);
  await page.waitForSelector("#paymentEmailPageButtonContinue", {
    state: "visible",
  });
  await page.locator("#paymentEmailPageButtonContinue").click();
};

const selectMethod = async (page: Page, methodCode: string) => {
  await page.waitForURL("http://localhost:1234/scegli-metodo");
  await page.locator('[data-qaid="' + methodCode + '"]').click();
};

const insertCardData = async (
  page: Page,
  cardNumber: string,
  expDate: string,
  cvv: string,
  holderName: string
) => {
  await page.waitForURL("http://localhost:1234/inserisci-carta");
  await page.waitForSelector("#frame_CARD_NUMBER", { state: "visible" });
  await page.waitForSelector("#frame_EXPIRATION_DATE", { state: "visible" });
  await page.waitForSelector("#frame_SECURITY_CODE", { state: "visible" });
  await page.waitForSelector("#frame_CARDHOLDER_NAME", { state: "visible" });
  await page.locator("#frame_CARD_NUMBER").type(cardNumber);
  await page.locator("#frame_EXPIRATION_DATE").type(expDate);
  await page.locator("#frame_SECURITY_CODE").type(cvv);
  await page.locator("#frame_CARDHOLDER_NAME").type(holderName);
  await page.waitForSelector("#submit", { state: "visible" });
  await page.locator("#submit").isEnabled();
  await page.locator("#submit").click();
};

const selectPsp = async (page: Page, idPsp: string) => {
  await page.waitForURL("http://localhost:1234/lista-psp");
  await page.waitForSelector(idPsp, { state: "visible" });
  await page.locator(idPsp).isEnabled();
  await page.locator(idPsp).click();
  await page.waitForSelector("#paymentPspListPageButtonContinue", {
    state: "visible",
  });
  await page.locator("#paymentPspListPageButtonContinue").click();
};

const pay = async (page: Page, buttonText?: string) => {
  await page.waitForSelector("#paymentCheckPageButtonPay", {
    state: "visible",
  });
  if (buttonText) {
    expect(await page.locator("#paymentCheckPageButtonPay").textContent()).toBe(
      buttonText
    );
  }
  await page.locator("#paymentCheckPageButtonPay").click();
};

const checkEsito = async (page: Page, message: string) => {
  await page.waitForURL("http://localhost:1234/esito");
  expect(await page.locator("#responsePageMessageTitle").textContent()).toBe(
    message
  );
};
