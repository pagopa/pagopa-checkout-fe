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

  
});
