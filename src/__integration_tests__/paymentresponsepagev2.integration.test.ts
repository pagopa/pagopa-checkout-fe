import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";

/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const CHECKOUT_ESITO_V2_BASE_URL = "http://localhost:1234/v2/esito"
/**
 * Increase default test timeout (80000ms)
 * to support entire payment flow
 */
jest.setTimeout(30000);
jest.retryTimes(0);
page.setDefaultNavigationTimeout(15000);
page.setDefaultTimeout(15000);

beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({width: 1200, height: 907});
    await page.evaluate(() => {
        sessionStorage.removeItem("i18nextLng");
    });
});

const navigateToFinalPage = async (lang, outcome) => {
    await page.goto(CHECKOUT_URL);

    await page.evaluate((language) => {
        sessionStorage.setItem("transaction", JSON.stringify({
            authToken: "token",
            transactionId: "test"
        }));
        sessionStorage.setItem("useremail", "test@test.it");
        localStorage.setItem("i18nextLng", language);
    }, lang);

    const url = `${CHECKOUT_ESITO_V2_BASE_URL}?t=1747230371951#transactionId=test&outcome=${outcome}${outcome === 0 ? '&totalAmount=12000&fees=15' : ''}`;
    await page.goto(url);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return await page.waitForSelector("#responsePageMessageTitle");
};


describe("Check outcome for response page V2", () => {
    Array.from([0, 1, 2, 3, 4, 7, 8, 17, 18, 25, 116, 117, 121]).forEach(outcome => {
        it.each([
            ["it", itTranslation],
            ["en", enTranslation],
            ["fr", frTranslation],
            ["de", deTranslation],
            ["sl", slTranslation]
        ])(`Show outcome ${outcome} for language [%s]`, async (lang, translation) => {
            var message = await navigateToFinalPage(lang, outcome);
            const responseMessage = await message.evaluate((el) => el.textContent);
            const messageToCheck = translation.paymentResponsePage[outcome].title;
            if (outcome === 0) {
                expect(responseMessage).toContain(messageToCheck.replace("{{amount}}", "120,15\xa0€"));
            } else {
                expect(responseMessage).toContain(messageToCheck);
            }
        });
    })
});