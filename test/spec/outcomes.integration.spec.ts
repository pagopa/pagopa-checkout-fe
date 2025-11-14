import { test, expect } from "@playwright/test";
import itTranslation from "../../src/translations/it/translations.json";

import { URL, KONoticeCodes, OKPaymentInfo } from "./testConstants.js";
import { clickButtonBySelector, payNotice, selectLanguage } from "./helpers.js";

test.beforeEach(async ({ page }) => {
  await page.goto(URL.CHECKOUT_URL);
  await page.setViewportSize({ width: 1200, height: 907 });
});

test.afterEach(async ({ page }) => {
  await clickButtonBySelector(page, "#closeButton");
});

const testCases: Array<[number, string, string]> = [
  [0, "SUCCESS", KONoticeCodes.OUTCOME_FISCAL_CODE_SUCCESS],
  [1, "GENERIC ERROR", KONoticeCodes.OUTCOME_FISCAL_CODE_GENERIC_ERROR],
  [2, "AUTH ERROR", KONoticeCodes.OUTCOME_FISCAL_CODE_AUTHORIZATION_ERROR],
  [3, "INVALID DATA", KONoticeCodes.OUTCOME_FISCAL_CODE_INVALID_DATA],
  [4, "TIMEOUT", KONoticeCodes.OUTCOME_FISCAL_CODE_TIMEOUT],
  [7, "INVALID CARD", KONoticeCodes.OUTCOME_FISCAL_CODE_INVALID_CARD],
  [8, "CANCELLED BY USER", KONoticeCodes.OUTCOME_FISCAL_CODE_CANCELLED_BY_USER],
  [10, "EXCESSIVE AMOUNT", KONoticeCodes.OUTCOME_FISCAL_CODE_EXCESSIVE_AMOUNT],
  [17, "TAKE IN CHARGE", KONoticeCodes.OUTCOME_FISCAL_CODE_TAKEN_IN_CHARGE],
  [18, "REFUNDED", KONoticeCodes.OUTCOME_FISCAL_CODE_REFUNDED],
  [25, "PSP ERROR", KONoticeCodes.OUTCOME_FISCAL_CODE_PSP_ERROR],
  [
    116,
    "BALANCE NOT AVAILABLE",
    KONoticeCodes.OUTCOME_FISCAL_CODE_BALANCE_NOT_AVAILABLE,
  ],
  [117, "CVV ERROR", KONoticeCodes.OUTCOME_FISCAL_CODE_CVV_ERROR],
  [121, "LIMIT EXCEEDED", KONoticeCodes.OUTCOME_FISCAL_CODE_LIMIT_EXCEEDED],
  [0, "SUCCESS", KONoticeCodes.OUTCOME_FISCAL_CODE_DEFAULT],
];

test.describe("Transaction outcome success tests", () => {
  testCases.forEach(([outcomeCode, expectedOutcome, fiscalCode]) => {
    test(`Outcome [${outcomeCode}] - ${expectedOutcome} - ${fiscalCode}`, async ({
      page,
    }) => {
      // eslint-disable-next-line no-console
      console.log(
        `Testing outcome ${expectedOutcome} for fiscal code: ${fiscalCode} (only for it language)`
      );

      await selectLanguage(page, "it");

      const resultMessage = await payNotice(
        page,
        OKPaymentInfo.VALID_NOTICE_CODE,
        fiscalCode,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA,
        URL.CHECKOUT_URL_AFTER_AUTHORIZATION
      );

      const expectedText =
        (itTranslation as any).paymentResponsePage[outcomeCode].title
          .replace("{{amount}}", "120,15 €")
          ?.replace(/\u00A0/g, " ")
          .trim() ?? "";

      const resultMessageNormalized =
        resultMessage?.replace(/\u00A0/g, " ").trim() ?? "";
      expect(resultMessageNormalized).toContain(expectedText);
    });
  });
});
