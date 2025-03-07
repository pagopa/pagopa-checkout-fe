import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";
import { clickLoginButton, fillPaymentNotificationForm, selectLanguage } from "./utils/helpers";
/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const BASE_CALLBACK_URL = "http://localhost:1234/auth-callback";
const BASE_CALLBACK_URL_PAYMENT_DATA = "http://localhost:1234/dati-pagamento";
const CALLBACK_URL = `${BASE_CALLBACK_URL}?code=gMPV0CSInuTY0pjd&state=pu6nlBmHs1EpmfWq`;
const CALLBACK_URL_NO_CODE = `${BASE_CALLBACK_URL}?state=pu6nlBmHs1EpmfWq`;
const CALLBACK_URL_NO_STATE = `${BASE_CALLBACK_URL}?code=gMPV0CSInuTY0pjd&`;
const PAGE_LOGIN_COMEBACK_URL = `http://localhost:1234/inserisci-dati-avviso`;
const VALID_FISCAL_CODE = "77777777777";
/* POST AUTH TOKEN FAIL ends with 78 */
const POST_AUTH_TOKEN_FAILS = "302000100000009478"
const POST_AUTH_TOKEN_FAILS_503 = "302000100000009479"
const POST_AUTH_TOKEN_FAILS_504 = "302000100000009480"
const POST_AUTH_TOKEN_FAILS_429 = "302000100000009481"

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

  it("Should correclty invoke the login flow when clicking login or retry", async () => {

    // keep track
    let successfullLogins = 0;

    // Listen for frame navigation (URL change)
    // when the login is completed we will be redirected to BASE_CALLBACK_URL
    page.on('framenavigated', async (frame) => {
      const url = frame.url();
      if(url.startsWith(BASE_CALLBACK_URL)){
        successfullLogins++;
      }
    });

    //search login button and click it
    console.log("Search login button")
    const loginHeader = await page.waitForSelector("#login-header");
    const headerButtons = await loginHeader.$$("button");
    //Login button is the last on the header
    const loginBtn = headerButtons.at(-1);
    console.log("Login button click");

    await loginBtn.click();

    // now navigate to callback url (and force error with bad parameters)
    // so that the retry button will be visible
    await page.goto(CALLBACK_URL_NO_CODE);

    // click the retry button
    const retryButton = await page.waitForSelector("#auth-retry-button");

    // repeat login
    await retryButton.click();
    console.log("Retry button click");

    // wait for the retry button to appear again so the login is done
    await page.waitForSelector("#auth-retry-button");

    // one from login button
    // one from navigating to the auth-callback page to retry
    // one from retry button
    expect(successfullLogins).toBe(3);
  });

  it("Should correctly come back to login origin url", async () => {
    await page.evaluate(() => {
      //set item into sessionStorage and localStorage for pass the route Guard
      sessionStorage.setItem('loginOriginPage', '/inserisci-dati-avviso');
    });
    await page.goto(CALLBACK_URL);
    const currentUrl = await page.evaluate(() => location.href);
    console.log("Current url: " + currentUrl);
    expect(currentUrl).toBe(PAGE_LOGIN_COMEBACK_URL);
  });

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])("Should show error page when no code param is present in auth callback url for language [%s]", async (lang, translation) => {
    await page.evaluate((language) => {
      //set item into sessionStorage and localStorage for pass the route Guard
      sessionStorage.setItem('loginOriginPage', '/inserisci-email');
      localStorage.setItem("i18nextLng", language);
    });
    await page.goto(CALLBACK_URL_NO_CODE);
    const currentUrl = await page.evaluate(() => location.href);
    console.log("Current url: " + currentUrl);

    const titleErrorElem = await page.waitForSelector("#errorTitle");
    const titleErrorBody = await page.waitForSelector("#errorBody");
    const title = await titleErrorElem.evaluate((el) => el.textContent);
    const body = await titleErrorBody.evaluate((el) => el.textContent);

    expect(currentUrl).not.toBe(PAGE_LOGIN_COMEBACK_URL);
    expect(title).toContain(translation.authCallbackPage.title);
    expect(body).toContain(translation.authCallbackPage.body);
  });

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])("Should show error page when no state param is present in auth callback url for language [%s]", async (lang, translation) => {
    await page.evaluate((language) => {
      //set item into sessionStorage and localStorage for pass the route Guard
      sessionStorage.setItem('loginOriginPage', '/inserisci-email');
      localStorage.setItem("i18nextLng", language);
    });
    await page.goto(CALLBACK_URL_NO_STATE);
    const currentUrl = await page.evaluate(() => location.href);
    console.log("Current url: " + currentUrl);

    const titleErrorElem = await page.waitForSelector("#errorTitle");
    const titleErrorBody = await page.waitForSelector("#errorBody");
    const title = await titleErrorElem.evaluate((el) => el.textContent);
    const body = await titleErrorBody.evaluate((el) => el.textContent);

    expect(currentUrl).not.toBe(PAGE_LOGIN_COMEBACK_URL);
    expect(title).toContain(translation.authCallbackPage.title);
    expect(body).toContain(translation.authCallbackPage.body);
  });

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])("Should show error receiving 5xx from post auth token for language [%s]", async (lang, translation) => {

    await fillPaymentNotificationForm(POST_AUTH_TOKEN_FAILS, VALID_FISCAL_CODE);

    await clickLoginButton();

    const titleErrorElem = await page.waitForSelector("#errorTitle");
    const titleErrorBody = await page.waitForSelector("#errorBody");
    const title = await titleErrorElem.evaluate((el) => el.textContent);
    const body = await titleErrorBody.evaluate((el) => el.textContent);

    const currentUrl = await page.evaluate(() => location.href);
    expect(currentUrl.startsWith(BASE_CALLBACK_URL)).toBe(true);

    console.log("Search login button")

    const BASE_CALLBACK_URL_REGEX = "http:\\/\\/localhost:\\d+\\/auth-callback\\?code=([a-zA-Z0-9]+)&state=([a-zA-Z0-9]+)";
    const regex = new RegExp(BASE_CALLBACK_URL_REGEX);
    expect(regex.test(currentUrl)).toBe(true);


    expect(title).toContain(translation.authCallbackPage.title);
    expect(body).toContain(translation.authCallbackPage.body);
  });

  it("should retry once if server responds 503 and succeed on second attempt", async () => {
    let tokenCalls = 0;
    let first503Response = false;

    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("/auth/token")) {
        tokenCalls++;
        if (response.status() === 503) {
          first503Response = true;
        }
      }
    });

    await fillPaymentNotificationForm(POST_AUTH_TOKEN_FAILS_503, VALID_FISCAL_CODE);
    await clickLoginButton();

    await page.waitForNavigation();
    await page.waitForNavigation();
    const currentUrl = await page.evaluate(() => location.href);


    expect(first503Response).toBe(true);
    expect(tokenCalls).toBe(2);
    expect(currentUrl).toBe(BASE_CALLBACK_URL_PAYMENT_DATA);
  });

  it("should retry once if server responds 504 and succeed on second attempt", async () => {
    let tokenCalls = 0;
    let first504Response = false;

    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("/auth/token")) {
        tokenCalls++;
        if (response.status() === 504) {
          first504Response = true;
        }
      }
    });

    await fillPaymentNotificationForm(POST_AUTH_TOKEN_FAILS_504, VALID_FISCAL_CODE);
    await clickLoginButton();

    await page.waitForNavigation();
    await page.waitForNavigation();

    const currentUrl = await page.evaluate(() => location.href);


    expect(first504Response).toBe(true);
    expect(tokenCalls).toBe(2);
    expect(currentUrl).toBe(BASE_CALLBACK_URL_PAYMENT_DATA);
  });

  it("should retry once if server responds 429 and succeed on second attempt", async () => {
    let tokenCalls = 0;
    let first429Response = false;

    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("/auth/token")) {
        tokenCalls++;
        if (response.status() === 429) {
          first429Response = true;
        }
      }
    });

    await fillPaymentNotificationForm(POST_AUTH_TOKEN_FAILS_429, VALID_FISCAL_CODE);
    await clickLoginButton();

    await page.waitForNavigation();
    await page.waitForNavigation();

    const currentUrl = await page.evaluate(() => location.href);


    expect(first429Response).toBe(true);
    expect(tokenCalls).toBe(2);
    expect(currentUrl).toBe(BASE_CALLBACK_URL_PAYMENT_DATA);
  });

  it("should NOT retry if server responds 500 (since 500 is not in retryCondition)", async () => {
    let tokenCalls = 0;
    let first500Response = false;

    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("/auth/token")) {
        tokenCalls++;
        if (response.status() === 500) {
          first500Response = true;
        }
      }
    });

    await fillPaymentNotificationForm(POST_AUTH_TOKEN_FAILS, VALID_FISCAL_CODE);
    await clickLoginButton();

    const titleErrorElem = await page.waitForSelector("#errorTitle");
    const titleErrorBody = await page.waitForSelector("#errorBody");
    const title = await titleErrorElem.evaluate((el) => el.textContent);
    const body = await titleErrorBody.evaluate((el) => el.textContent);

    expect(first500Response).toBe(true);
    expect(tokenCalls).toBe(1);
  });



});
