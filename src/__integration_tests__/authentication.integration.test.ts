import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";
import { selectLanguage } from "./utils/helpers";
/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const CALLBACK_URL = `http://localhost:1234/auth-callback?code=J0NYD7UqPejqXpl6Fdv8&state=1BWuOGF4L3CTroTEvUVF`;
const CALLBACK_URL_NO_CODE = `http://localhost:1234/auth-callback?state=1BWuOGF4L3CTroTEvUVF`;
const CALLBACK_URL_NO_STATE = `http://localhost:1234/auth-callback?code=J0NYD7UqPejqXpl6Fdv8&`;
const PAGE_LOGIN_COMEBACK_URL = `http://localhost:1234/inserisci-dati-avviso`;


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
  /* Test to be implemented on e2eTest since mock come back directly in checkout domain
  
  it("Should correctly redirect to auth login url", async () => {

    //search login button and click it
    console.log("Search login button")
    const loginHeader = await page.waitForSelector("#login-header");
    const headerButtons = await loginHeader.$$("button");
    //Login button is the last on the header
    const loginBtn = headerButtons.at(-1);
    console.log("Login button click")
    await loginBtn.click();

    const currentUrl = await page.evaluate(() => location.href);
    console.log("Current url: " + currentUrl);
    expect(currentUrl).toBe(CALLBACK_URL);
  });*/

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
  
});
