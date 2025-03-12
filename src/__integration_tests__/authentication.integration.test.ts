import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";
import { cancelPaymentKO, cancelPaymentOK, checkErrorOnCardDataFormSubmit, clickLoginButton, fillAndSubmitCardDataForm, fillPaymentNotificationForm, getUserButton, payNotice, selectLanguage , tryLoginWithAuthCallbackError } from "./utils/helpers";
import { CANCEL_PAYMENT_KO, CANCEL_PAYMENT_OK, CHECKOUT_URL_AFTER_AUTHORIZATION, EMAIL, FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA, PSP_FAIL, VALID_CARD_DATA, VALID_NOTICE_CODE } from "./paymentflow.integration.test";
/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const BASE_CALLBACK_URL = "http://localhost:1234/auth-callback";
const BASE_CALLBACK_URL_REGEX = "http:\\/\\/localhost:\\d+\\/auth-callback\\?code=([a-zA-Z0-9]+)&state=([a-zA-Z0-9]+)";
const CALLBACK_URL = `${BASE_CALLBACK_URL}?code=gMPV0CSInuTY0pjd&state=pu6nlBmHs1EpmfWq`;
const CALLBACK_URL_NO_CODE = `${BASE_CALLBACK_URL}?state=pu6nlBmHs1EpmfWq`;
const CALLBACK_URL_NO_STATE = `${BASE_CALLBACK_URL}?code=gMPV0CSInuTY0pjd&`;
const PAGE_LOGIN_COMEBACK_URL = `http://localhost:1234/inserisci-dati-avviso`;
const VALID_FISCAL_CODE = "77777777777";
/* POST AUTH TOKEN FAIL ends with 78 */
const POST_AUTH_TOKEN_FAILS = "302000100000009478";
const FAIL_GET_USERS_401 = "302000100000009479";
const FAIL_GET_USERS_500 = "302000100000009480";
const FAIL_LOGIN_400 = "302016723749670086";
const FAIL_LOGIN_500 = "302016723749670087";



jest.setTimeout(80000);
jest.retryTimes(3);
page.setDefaultNavigationTimeout(80000);
page.setDefaultTimeout(80000);

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

    // Wait return to main page so the login is done
    await page.waitForFunction("window.location.pathname == '/'");
    console.log("Login completed");

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

describe.only("Logout tests", () => {

  it("Should invoke logout with success", async () => {

    let logout204 = false;
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("auth/logout")) {
        if (response.status() === 204) {
          logout204 = true;
        }
      }
    });

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");

    const userButton = await getUserButton();
    await userButton.click();
    const logoutButton = await page.waitForSelector('body > div.MuiPopover-root.MuiMenu-root.MuiModal-root.css-1sucic7 > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper.MuiMenu-paper.MuiMenu-paper.css-vi4pnh > ul > li');
    await logoutButton.click();
    await new Promise((r) => setTimeout(r, 500));
    expect(logout204).toBe(true);
  });

  it("Should invoke logout with 4xx error and only one temptative", async () => {
    let logout400 = false;
    let logutCount=0;
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("auth/logout")) {
        logutCount++;
        if (response.status() === 400) {
          logout400 = true;
        }
      }
    });

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");

    await fillPaymentNotificationForm(FAIL_LOGIN_400, VALID_FISCAL_CODE);
    await page.waitForNavigation();
    const userButton = await getUserButton();
    await userButton.click();
    const logoutButton = await page.waitForSelector('body > div.MuiPopover-root.MuiMenu-root.MuiModal-root.css-1sucic7 > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper.MuiMenu-paper.MuiMenu-paper.css-vi4pnh > ul > li');
    await logoutButton.click();
    console.log("Search login button");
    await new Promise((r) => setTimeout(r, 500));
    const loginHeader = await page.waitForSelector("#login-header");
    const headerButtons = await loginHeader.$$("button");
    //Login button is the last on the header
    const loginBtn = headerButtons.at(-1);
    const title = await loginBtn.evaluate((el) => el.textContent);
    expect(logout400).toBe(true);
    expect(logutCount).toBe(1);
    expect(title).toBe("Accedi");
  });

  it("Should invoke logout with 5xx error by three temptatives", async () => {
    let logout500 = false;
    let logutCount=0;
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("auth/logout")) {
        logutCount++;
        if (response.status() === 500) {
          logout500 = true;
        }
      }
    });

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");

    await fillPaymentNotificationForm(FAIL_LOGIN_500, VALID_FISCAL_CODE);
    await page.waitForNavigation();
    const userButton = await getUserButton();
    await userButton.click();
    const logoutButton = await page.waitForSelector('body > div.MuiPopover-root.MuiMenu-root.MuiModal-root.css-1sucic7 > div.MuiPaper-root.MuiPaper-elevation.MuiPaper-rounded.MuiPaper-elevation8.MuiPopover-paper.MuiMenu-paper.MuiMenu-paper.css-vi4pnh > ul > li');
    await logoutButton.click();
    await new Promise((r) => setTimeout(r, 3100));
    console.log("Search login button")
    const loginHeader = await page.waitForSelector("#login-header");
    const headerButtons = await loginHeader.$$("button");
    //Login button is the last on the header
    const loginBtn = headerButtons.at(-1);
    const title = await loginBtn.evaluate((el) => el.textContent);
    expect(logout500).toBe(true);
    expect(logutCount).toBe(3);
    expect(title).toBe("Accedi");
  });

  it("Should invoke logout with success when payment response page is shown", async () => {

    let logout204 = false;
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("auth/logout")) {
        if (response.status() === 204) {
          logout204 = true;
        }
      }
    });

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");

    const resultMessage = await payNotice(
      VALID_NOTICE_CODE,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      CHECKOUT_URL_AFTER_AUTHORIZATION
    );

    expect(resultMessage).toContain(itTranslation.paymentResponsePage[0].title.replace("{{amount}}", "120,15\xa0€"));
    expect(logout204).toBe(true);
  });

  it("Should invoke logout with success when cancel payment is invoked", async () => {

    let logout204 = false;
    let deleteTransaction202 = false;
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("/transactions")) {
        if (response.status() === 202) {
          deleteTransaction202 = true && !logout204;
        }
      }
      if (url.includes("auth/logout")) {
        if (response.status() === 204) {
          logout204 = true && deleteTransaction202;
        }
      }
    });

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");

    const resultMessage = await cancelPaymentOK(
      CANCEL_PAYMENT_OK,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );
    expect(resultMessage).toContain(itTranslation.cancelledPage.body);
    expect(deleteTransaction202).toBe(true);
    expect(logout204).toBe(true);
  });

  it("Should invoke logout with success when cancel payment is invoked but it fails", async () => {

    let logout204 = false;
    let deleteTransactionError = false;
    page.on("response", (response) => {
      const url = response.url();
      if (url.includes("/transactions")) {
        if (response.status() >= 400) {
          deleteTransactionError = true && !logout204;
        }
      }
      if (url.includes("auth/logout")) {
        if (response.status() === 204) {
          logout204 = true && deleteTransactionError;
        }
      }
    });

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");

    const resultMessage = await cancelPaymentKO(
            CANCEL_PAYMENT_KO,
            VALID_FISCAL_CODE,
            EMAIL
          );
    expect(resultMessage).toContain(itTranslation.GENERIC_ERROR.title);
    const closeErrorButton = await page.waitForSelector("#closeError");
    await closeErrorButton.click();
    expect(deleteTransactionError).toBe(true);
    expect(logout204).toBe(true);
  });

  it("Should invoke logout with success when fail a card payment ACTIVATION and get PPT_WISP_SESSIONE_SCONOSCIUTA", async () => {
    /*
     * Card payment with notice code that fails on activation and get PPT_WISP_SESSIONE_SCONOSCIUTA 
     * and redirect to expired session page
     */
    let logout204 = false;
    page.on("response", (response) => {
    const url = response.url();
    if (url.includes("auth/logout")) {
      if (response.status() === 204) {
        logout204 = true;
      }
    }
    });

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");
    await fillAndSubmitCardDataForm(FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA, VALID_FISCAL_CODE, EMAIL, VALID_CARD_DATA);
    await page.waitForNavigation();
    expect(page.url()).toContain("/sessione-scaduta");
    await new Promise((r) => setTimeout(r, 500));
    expect(logout204).toBe(true);
  });


  it("Should invoke logout with success when error page is shown", async () => {
    /*
     * Card payment with notice code that fails on activation and get PPT_WISP_SESSIONE_SCONOSCIUTA 
     * and redirect to expired session page
     */
    let logout204 = false;
    page.on("response", (response) => {
    const url = response.url();
    if (url.includes("auth/logout")) {
      if (response.status() === 204) {
        logout204 = true;
      }
    }
    });

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForNavigation();
    //Wait return to main page
    await page.waitForNavigation();
    console.log("Login completed");
    
    await checkErrorOnCardDataFormSubmit(
      PSP_FAIL,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );
    const closeErrorModalButton = "#closeError";
    await page.waitForSelector(closeErrorModalButton);
    await page.click(closeErrorModalButton);

    await new Promise((r) => setTimeout(r, 500));
    expect(logout204).toBe(true);
  });
  
});
