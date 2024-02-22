
describe("Unauthorized npg final status mapping tests", () => {

  /**
     * Test input and configuration
  */

  const CHECKOUT_OUTCOME_URL = "http://localhost:1234/esito";
  const UNAUTHORIZED_WITH_NPG_AUTH_STATUS_AUTHORIZED = {mockFLow : "UNAUTHORIZED_WITH_NPG_AUTH_STATUS_AUTHORIZED" , value: "302016723740200074"};

  const testsNpgMap = new Map([
    [
      UNAUTHORIZED_WITH_NPG_AUTH_STATUS_AUTHORIZED,
      { title: "Should fails - final status UNATHORIZED with NPG gateway authorization status AUTHORIZED", esito: "Spiacenti, si è verificato un errore imprevisto." }
    ]
  ]);


  /**
   * Increase default test timeout (80000ms)
   * to support entire payment flow
    */
  jest.setTimeout(120000);
  jest.retryTimes(1);
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(120000);

  beforeAll(async () => {
    await page.goto(CHECKOUT_OUTCOME_URL);
    await page.setViewport({ width: 1200, height: 907 });
  })

  beforeEach(async () => {
    await page.evaluate(() => {
      let sessionData =  '{"authToken":"token","clientId":"CHECKOUT","payments":[{"amount":12000,"isAllCCP":false,"paymentToken":"paymentToken1","reason":"reason1","rptId":"77777777777302001751670642100","transferList":[{"digitalStamp":true,"paFiscalCode":"66666666666","transferAmount":100,"transferCategory":"transferCategory1"},{"digitalStamp":false,"paFiscalCode":"77777777777","transferAmount":900,"transferCategory":"transferCategory2"}]}],"status":"ACTIVATED","transactionId":"f4f1b6a82b7d473583b506fcd5edf308"}';
      sessionStorage.setItem('transaction', sessionData);
      localStorage.setItem('transaction', sessionData);
    });

    await page.goto(CHECKOUT_OUTCOME_URL);
   
  });

  Array.from(testsNpgMap.keys()).forEach(keyRptId => {
    it(testsNpgMap.get(keyRptId)?.title || "", async () => {
      await page.setCookie({name: "mockFlow", value:  keyRptId.mockFLow});
      const resultTitleSelector = "#responsePageMessageTitle";
      const message = await page.waitForSelector(resultTitleSelector);
      const responseMessage = await message.evaluate((el) => el.textContent);
      expect(responseMessage).toContain(testsNpgMap.get(keyRptId)?.esito);
    })
  });

});