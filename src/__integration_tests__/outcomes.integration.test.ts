import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";
import { payNotice, selectLanguage } from "./utils/helpers";

/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const CHECKOUT_URL_AFTER_AUTHORIZATION = `http://localhost:1234/esito`;
const CHECKOUT_URL_PAYMENT_SUMMARY = `http://localhost:1234/riepilogo-pagamento`;
const CHECKOUT_URL_PSP_LIST = `http://localhost:1234/lista-psp`;
// const VALID_FISCAL_CODE = "77777777777";
const EMAIL = "mario.rossi@email.com";
const VALID_CARD_DATA = {
  number: "4333334000098346",
  expirationDate: "1230",
  ccv: "123",
  holderName: "Mario Rossi",
};
const VALID_NOTICE_CODE = "302016723749670000";
const OUTCOME_FISCAL_CODE_SUCCESS              = "77777777000";
const OUTCOME_FISCAL_CODE_GENERIC_ERROR        = "77777777001";
const OUTCOME_FISCAL_CODE_AUTHORIZATION_ERROR  = "77777777002";
const OUTCOME_FISCAL_CODE_INVALID_DATA         = "77777777003";
const OUTCOME_FISCAL_CODE_TIMEOUT              = "77777777004";
const OUTCOME_FISCAL_CODE_INVALID_CARD         = "77777777007";
const OUTCOME_FISCAL_CODE_CANCELLED_BY_USER    = "77777777008";
const OUTCOME_FISCAL_CODE_EXCESSIVE_AMOUNT     = "77777777010";
const OUTCOME_FISCAL_CODE_TAKEN_IN_CHARGE      = "77777777017";
const OUTCOME_FISCAL_CODE_REFUNDED             = "77777777018";
const OUTCOME_FISCAL_CODE_PSP_ERROR            = "77777777025";
const OUTCOME_FISCAL_CODE_BACKEND_ERROR        = "77777777099";
const OUTCOME_FISCAL_CODE_BALANCE_NOT_AVAILABLE= "77777777116";
const OUTCOME_FISCAL_CODE_CVV_ERROR            = "77777777117";
const OUTCOME_FISCAL_CODE_LIMIT_EXCEEDED       = "77777777121";

jest.setTimeout(30000);
jest.retryTimes(3);
page.setDefaultNavigationTimeout(10000);
page.setDefaultTimeout(10000);

beforeAll(async () => {
  await page.goto(CHECKOUT_URL);
  await page.setViewport({ width: 1200, height: 907 });
});

beforeEach(async () => {
  await page.goto(CHECKOUT_URL);
  // Listen for dialog events and automatically accept them after a delay
  page.on('dialog', async dialog => {
    if (dialog.type() === 'beforeunload') {
      try {
        // Wait for few seconds before accepting the dialog
        await new Promise(resolve => setTimeout(resolve, 2000));
        await dialog.accept();
      } catch (error) {
        console.log('Dialog is already accepted.');
      }
    }
  });
});

describe("Transaction outcome success tests", () => {
    it.each([
        ["it", itTranslation],
        ["en", enTranslation],
        ["fr", frTranslation],
        ["de", deTranslation],
        ["sl", slTranslation]
    ])("should show success outcome in %s", async (lang, translation) => {
        selectLanguage(lang);
        const resultMessage = await payNotice(
            VALID_NOTICE_CODE,
            OUTCOME_FISCAL_CODE_SUCCESS,
            EMAIL,
            VALID_CARD_DATA,
            CHECKOUT_URL_AFTER_AUTHORIZATION
        )

        expect(resultMessage).toContain(translation.paymentResponsePage[0].title.replace("{{amount}}", "120,15\xa0€"));
    })
});
