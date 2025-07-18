import itTranslation from "../translations/it/translations.json";
import { clickButtonBySelector, payNotice, selectLanguage } from "./utils/helpers";

/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const CHECKOUT_URL_AFTER_AUTHORIZATION = `http://localhost:1234/esito`;
const EMAIL = "mario.rossi@email.com";
const VALID_CARD_DATA = {
    number: "4333334000098346",
    expirationDate: "1230",
    ccv: "123",
    holderName: "Mario Rossi",
};                         
const VALID_NOTICE_CODE = "302016723749670000";
const RETRY_CODE = "302016723749670500";
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


jest.setTimeout(60000);
jest.retryTimes(3);
page.setDefaultNavigationTimeout(30000);
page.setDefaultTimeout(30000);

beforeAll(async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
});

beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
});

afterEach(async () => {
    await clickButtonBySelector("#closeButton");
});

describe("Transaction outcome success tests", () => {
    it.each([
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
        [25, "PSP ERROR",  OUTCOME_FISCAL_CODE_PSP_ERROR],
        [116, "BALANCE NOT AVAILABLE", OUTCOME_FISCAL_CODE_BALANCE_NOT_AVAILABLE],
        [117, "CVV ERROR", OUTCOME_FISCAL_CODE_CVV_ERROR],
        [121, "LIMIT EXCEEDED", OUTCOME_FISCAL_CODE_LIMIT_EXCEEDED],
        [0, "SUCCESS", OUTCOME_FISCAL_CODE_DEFAULT],
    ])
    (`Testing outcome [%s]  for fiscal code: [%s] `, async(outcomeCode, expectedOutcome, fiscalCode) => {
        console.log(`Testing outcome ${expectedOutcome} for fiscal code: ${fiscalCode} (only for it language)`);
        await selectLanguage("it");
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            fiscalCode,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        )
        expect(resultMessage).toContain(itTranslation.paymentResponsePage[outcomeCode].title.replace("{{amount}}", "120,15\xa0€"));
    });
});
