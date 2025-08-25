import itTranslation from "../translations/it/translations.json";
import { clickButtonBySelector, payNotice, selectLanguage } from "./utils/helpers";
import { URL, KONoticeCodes, OKPaymentInfo } from "./utils/testConstants";

jest.setTimeout(60000);
jest.retryTimes(3);
page.setDefaultNavigationTimeout(30000);
page.setDefaultTimeout(30000);

beforeAll(async () => {
    await page.goto(URL.CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
});

beforeEach(async () => {
    await page.goto(URL.CHECKOUT_URL);
});

afterEach(async () => {
    await clickButtonBySelector("#closeButton");
});

describe("Transaction outcome success tests", () => {
    it.each([
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
        [25, "PSP ERROR",  KONoticeCodes.OUTCOME_FISCAL_CODE_PSP_ERROR],
        [116, "BALANCE NOT AVAILABLE", KONoticeCodes.OUTCOME_FISCAL_CODE_BALANCE_NOT_AVAILABLE],
        [117, "CVV ERROR", KONoticeCodes.OUTCOME_FISCAL_CODE_CVV_ERROR],
        [121, "LIMIT EXCEEDED", KONoticeCodes.OUTCOME_FISCAL_CODE_LIMIT_EXCEEDED],
        [0, "SUCCESS", KONoticeCodes.OUTCOME_FISCAL_CODE_DEFAULT],
    ])
    (`Testing outcome [%s]  for fiscal code: [%s] `, async(outcomeCode, expectedOutcome, fiscalCode) => {
        console.log(`Testing outcome ${expectedOutcome} for fiscal code: ${fiscalCode} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            OKPaymentInfo.VALID_NOTICE_CODE,
            fiscalCode,
            OKPaymentInfo.EMAIL,
            OKPaymentInfo.VALID_CARD_DATA,
            URL.CHECKOUT_URL_AFTER_AUTHORIZATION
        )
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[outcomeCode].title.replace("{{amount}}", "120,15\xa0€"));
    });
});
