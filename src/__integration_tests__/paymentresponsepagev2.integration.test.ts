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
  jest.setTimeout(60000);
  jest.retryTimes(0);
  page.setDefaultNavigationTimeout(30000);
  page.setDefaultTimeout(30000);

  beforeEach(async () => {
     await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
     await page.evaluate(() => {
      sessionStorage.removeItem("i18nextLng");
    });
  });

  const navigateToFinalPage = async (lang, outcome) => {  
    await page.evaluate((language) => {
      //set item into sessionStorage and localStorage for pass the route Guard
      let sessionData = `{"authToken":"token","clientId":"CHECKOUT","payments":[{"amount":12000,"isAllCCP":false,"paymentToken":"paymentToken1","reason":"reason1","rptId":"77777777777302001751670642100","transferList":[{"digitalStamp":true,"paFiscalCode":"66666666666","transferAmount":100,"transferCategory":"transferCategory1"},{"digitalStamp":false,"paFiscalCode":"77777777777","transferAmount":900,"transferCategory":"transferCategory2"}]}],"status":"ACTIVATED","transactionId":"test"}`;
      sessionStorage.setItem("transaction", sessionData);
      sessionStorage.setItem("useremail", "test@test.it");
      localStorage.setItem("i18nextLng", language);
    }, lang);

    await page.waitForFunction("sessionStorage.getItem('transaction') != null");
    await page.waitForFunction("sessionStorage.getItem('useremail') != null");
    if(outcome === 0) {
      await page.goto(`${CHECKOUT_ESITO_V2_BASE_URL}?t=1747230371951#transactionId=test&outcome=${outcome}&totalAmount=12000&fees=15`);
    } else {
      await page.goto(`${CHECKOUT_ESITO_V2_BASE_URL}?t=1747230371951#transactionId=test&outcome=${outcome}`);
    }
      const resultTitleSelector = "#responsePageMessageTitle";
    return await page.waitForSelector(resultTitleSelector);
  }

  describe("Check outcome for response page V2", () => {
  Array.from([0,1,2,3,4,7,8,17,18,25,116,117,121]).forEach(outcome => {
      it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])(`Show outcome ${outcome} for language [%s]`,async (lang, translation) => {
      var message = await navigateToFinalPage(lang, outcome);
      const responseMessage = await message.evaluate((el) => el.textContent);
      const messageToCheck = translation.paymentResponsePage[outcome].title;
      if(outcome === 0) {
        expect(responseMessage).toContain(messageToCheck.replace("{{amount}}", "120,15\xa0€"));
      } else {
        expect(responseMessage).toContain(messageToCheck);
      }
});
  })
});






