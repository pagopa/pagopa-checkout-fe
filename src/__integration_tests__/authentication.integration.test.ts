import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";
import { choosePaymentMethod, clickLoginButton, fillPaymentNotificationForm, getUserButton, selectLanguage , tryLoginWithAuthCallbackError, verifyPaymentMethods } from "./utils/helpers";
/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const BASE_CALLBACK_URL = "http://localhost:1234/auth-callback";
const BASE_CALLBACK_URL_REGEX = "http:\\/\\/localhost:\\d+\\/auth-callback\\?code=([a-zA-Z0-9]+)&state=([a-zA-Z0-9]+)";
const CALLBACK_URL_NO_CODE = `${BASE_CALLBACK_URL}?state=pu6nlBmHs1EpmfWq`;
const CALLBACK_URL_NO_STATE = `${BASE_CALLBACK_URL}?code=gMPV0CSInuTY0pjd&`;
const PAGE_LOGIN_COMEBACK_URL = `http://localhost:1234/inserisci-dati-avviso`;
const PAYMENT_METHODS_PAGE = 'http://localhost:1234/scegli-metodo';
const INSERT_CARD_PAGE = 'http://localhost:1234/inserisci-carta';
const VALID_FISCAL_CODE = "77777777777";
/* POST AUTH TOKEN FAIL ends with 78 */
const VALID_RPTID = "302000100000009400"; 
const POST_AUTH_TOKEN_FAILS = "302000100000009478"; 
const FAIL_GET_USERS_401 = "302000100000009482";
const FAIL_GET_USERS_500 = "302000100000009483";
const FAIL_UNAUTHORIZED_401 = "302000100000009484";

jest.setTimeout(30000);
jest.retryTimes(3);
page.setDefaultNavigationTimeout(10000);
page.setDefaultTimeout(10000);

beforeAll(async () => {
  await page.goto(CHECKOUT_URL);
  await page.setViewport({ width: 1200, height: 907 });
});

beforeEach(async () => {
  await page.evaluate(() => sessionStorage.clear());
  await page.deleteCookie({name:'mockFlow'});
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

    // start flow from a url different from home
    await page.goto(PAGE_LOGIN_COMEBACK_URL);

    //search login button and click it
    console.log("Search login button")
    const loginHeader = await page.waitForSelector("#login-header");
    const headerButtons = await loginHeader.$$("button");
    //Login button is the last on the header
    const loginBtn = headerButtons.at(-1);
    console.log("Login button click");

    await loginBtn.click();
    const urlAfterSuccessfullLogin = await page.evaluate(() => location.href);

    // now navigate to callback url (and force error with bad parameters)
    // so that the retry button will be visible
    await page.goto(CALLBACK_URL_NO_CODE);

    // click the retry button
    const retryButton = await page.waitForSelector("#auth-retry-button");

    // repeat login
    await retryButton.click();
    console.log("Retry button click");

    // Wait return to main page so the login is done
    await page.waitForFunction("window.location.pathname == '/'");
    console.log("Login completed");

    // one from login button
    // one from navigating to the auth-callback page to retry
    // one from retry button
    expect(successfullLogins).toBe(3);

    // verify successfull login brings back to correct page
    expect(urlAfterSuccessfullLogin).toBe(PAGE_LOGIN_COMEBACK_URL);
  });

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])("Should show error page when no code param is present in auth callback url for language [%s]", async (lang, translation) => {
    await selectLanguage(lang);
    await page.evaluate(() => {
      //set item into sessionStorage and localStorage for pass the route Guard
      sessionStorage.setItem('loginOriginPage', '/inserisci-email');
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
    await selectLanguage(lang);
    await page.evaluate(() => {
      //set item into sessionStorage and localStorage for pass the route Guard
      sessionStorage.setItem('loginOriginPage', '/inserisci-email');
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
    await selectLanguage(lang);
    await fillPaymentNotificationForm(POST_AUTH_TOKEN_FAILS, VALID_FISCAL_CODE);

    await clickLoginButton();
    
    const titleErrorElem = await page.waitForSelector("#errorTitle");
    const titleErrorBody = await page.waitForSelector("#errorBody");
    const title = await titleErrorElem.evaluate((el) => el.textContent);
    const body = await titleErrorBody.evaluate((el) => el.textContent);

    const currentUrl = await page.evaluate(() => location.href);
    expect(currentUrl.startsWith(BASE_CALLBACK_URL)).toBe(true);

    console.log("Search login button")

    const regex = new RegExp(BASE_CALLBACK_URL_REGEX);
    expect(regex.test(currentUrl)).toBe(true);
    
    expect(title).toContain(translation.authCallbackPage.title);
    expect(body).toContain(translation.authCallbackPage.body);
  });

  it("Should correctly retrieve user info if authToken is present", async () => {
    await page.evaluate(() => {
      //set item into sessionStorage and localStorage for pass the route Guard
      sessionStorage.setItem('authToken', 'auth-token-value');
    });
    //reload page in order to read authToken into sessionStorage
    await page.reload();
    
    //Check if user button is present into login header
    const userButton = await getUserButton();
    expect(userButton).toBeDefined();
  });

  it("Should redirect to error page receiving 401 from get user info on page refresh", async () => {
    //Do login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");

    //set flow error case
    await fillPaymentNotificationForm(FAIL_GET_USERS_401, VALID_FISCAL_CODE);
    await page.waitForNavigation();
    console.log("MockFlow setted with noticeCode: ", FAIL_GET_USERS_401);

    //reload page in order to read authToken into sessionStorage
    await page.reload();

    //Wait return to error page
    expect(page.url()).toContain("/errore");
  });

  it("Should redirect to error page receiving 500 from get user info on page refresh", async () => {
    //Do login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");

    //set flow error case
    await fillPaymentNotificationForm(FAIL_GET_USERS_500, VALID_FISCAL_CODE);
    await page.waitForNavigation();
    console.log("MockFlow setted with noticeCode: ", FAIL_GET_USERS_500);

    //reload page in order to read authToken into sessionStorage
    await page.reload();
    //wait for redirect to error page after retry
    await page.waitForNavigation();

    //Wait return to error page
    expect(page.url()).toContain("/errore");
  }); 

  it("Should correctly retrieve user info after login is completed on auth-callback page", async () => {
    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");

    //Check if user button is present into login header
    const userButton = await getUserButton();
    expect(userButton).toBeDefined();
  });

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])("Should show error receiving 401 from get user info on auth-callback page for language [%s]", async (lang, translation) => {
    await selectLanguage(lang);

    const authCallbackError = await tryLoginWithAuthCallbackError(FAIL_GET_USERS_401, VALID_FISCAL_CODE);

    const regex = new RegExp(BASE_CALLBACK_URL_REGEX);
    expect(regex.test(authCallbackError.currentUrl)).toBe(true);
    expect(authCallbackError.title).toContain(translation.authCallbackPage.title);
    expect(authCallbackError.body).toContain(translation.authCallbackPage.body);
  });

  it("Should correctly call post sessions with logged user", async () => {
    await page.evaluate(() => {
      //set item into sessionStorage for pass the route Guard
      sessionStorage.setItem('useremail', 'email');
      sessionStorage.setItem('authToken', 'auth-token-value');
    });

    //set flow success case
    await fillPaymentNotificationForm(VALID_RPTID, VALID_FISCAL_CODE);
    await page.waitForNavigation();

    //go to payment methods page and select card payment
    await page.goto(PAYMENT_METHODS_PAGE);
    await choosePaymentMethod("CP");

    //wait until in the session storage are presents correlationId and orderId§
    await page.waitForFunction("sessionStorage.getItem('correlationId') != null");
    await page.waitForFunction("sessionStorage.getItem('orderId') != null");
    //post session finished

    //check current url is correct
    expect(page.url()).toContain("/inserisci-carta");
  });

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])("Should show error receiving 500 from get user info on auth-callback page for language [%s]", async (lang, translation) => {
    await selectLanguage(lang);

    const authCallbackError = await tryLoginWithAuthCallbackError(FAIL_GET_USERS_500, VALID_FISCAL_CODE);

    const regex = new RegExp(BASE_CALLBACK_URL_REGEX);
    expect(regex.test(authCallbackError.currentUrl)).toBe(true);
    expect(authCallbackError.title).toContain(translation.authCallbackPage.title);
    expect(authCallbackError.body).toContain(translation.authCallbackPage.body);
  });
});