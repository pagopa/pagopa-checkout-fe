/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const MOCK_AUTH_REDIRECT_URL = `http://localhost:8080/auth-redirect-url`;


jest.setTimeout(80000);
jest.retryTimes(3);
page.setDefaultNavigationTimeout(80000);
page.setDefaultTimeout(80000);

beforeAll(async () => {
  await page.goto(CHECKOUT_URL);
  await page.setViewport({ width: 1200, height: 907 });
});

beforeEach(async () => {
  await page.goto(CHECKOUT_URL);
});


describe("Checkout authentication tests", () => {
  it("Should correctly redirect to auth login url", async () => {

    //search login button and click it
    console.log("Search login button")
    const loginHeader = await page.waitForSelector("#login-header");
    const headerButtons = await loginHeader.$$("button");
    //Login button is the last on the header
    const loginBtn = headerButtons.at(-1);
    console.log("Login button click")
    await loginBtn.click();
    await page.waitForNavigation();

    const currentUrl = await page.evaluate(() => location.href);
    console.log("Current url: " + currentUrl);
    expect(currentUrl).toBe(MOCK_AUTH_REDIRECT_URL);
  });

  it("Should correctly redirect to auth login url", async () => {
    await page.evaluate((language) => {
      //set item into sessionStorage and localStorage for pass the route Guard
      let sessionData = '{"authToken":"token","clientId":"CHECKOUT","payments":[{"amount":12000,"isAllCCP":false,"paymentToken":"paymentToken1","reason":"reason1","rptId":"77777777777302001751670642100","transferList":[{"digitalStamp":true,"paFiscalCode":"66666666666","transferAmount":100,"transferCategory":"transferCategory1"},{"digitalStamp":false,"paFiscalCode":"77777777777","transferAmount":900,"transferCategory":"transferCategory2"}]}],"status":"ACTIVATED","transactionId":"f4f1b6a82b7d473583b506fcd5edf308"}';
      sessionStorage.setItem('transaction', sessionData);
      localStorage.setItem('transaction', sessionData);
      localStorage.setItem("i18nextLng", language);
    }, lang);
    
    await page.setCookie({ name: "mockFlow", value: keyFlowId });
    await page.goto(CHECKOUT_OUTCOME_URL);
    const resultTitleSelector = "#responsePageMessageTitle";
    const message = await page.waitForSelector(resultTitleSelector);
    const responseMessage = await message.evaluate((el) => el.textContent);
    expect(responseMessage).toContain(mockFlowWithExpectedResultMap.get(keyFlowId)?.esito);
  });



  
});
