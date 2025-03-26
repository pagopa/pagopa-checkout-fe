import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";
import { cancelPaymentKO, cancelPaymentOK, checkErrorOnCardDataFormSubmit, clickLoginButton, fillAndSubmitCardDataForm, fillPaymentNotificationForm, getUserButton, payNotice, selectLanguage , tryLoginWithAuthCallbackError, choosePaymentMethod, verifyPaymentMethods } from "./utils/helpers";
/**
 * Test input and configuration
 */
const CHECKOUT_URL = `http://localhost:1234`;
const BASE_CALLBACK_URL = "http://localhost:1234/auth-callback";
const BASE_CALLBACK_URL_PAYMENT_DATA = "http://localhost:1234/dati-pagamento";
const BASE_CALLBACK_URL_REGEX = "http:\\/\\/localhost:\\d+\\/auth-callback\\?code=([a-zA-Z0-9]+)&state=([a-zA-Z0-9]+)";
const CALLBACK_URL_NO_CODE = `${BASE_CALLBACK_URL}?state=pu6nlBmHs1EpmfWq`;
const CALLBACK_URL_NO_STATE = `${BASE_CALLBACK_URL}?code=gMPV0CSInuTY0pjd&`;
const PAGE_LOGIN_COMEBACK_URL = `http://localhost:1234/inserisci-dati-avviso`;
const PAYMENT_METHODS_PAGE = 'http://localhost:1234/scegli-metodo';
const INSERT_CARD_PAGE = 'http://localhost:1234/inserisci-carta';
/* POST AUTH TOKEN FAIL ends with 78 */
const VALID_RPTID = "302000100000009400"; 
const POST_AUTH_TOKEN_FAILS = "302000100000009478"
const POST_AUTH_TOKEN_FAILS_503 = "302000100000009479"
const POST_AUTH_TOKEN_FAILS_504 = "302000100000009480"
const POST_AUTH_TOKEN_FAILS_429 = "302000100000009481"
const FAIL_GET_USERS_401 = "302000100000009482";
const FAIL_GET_USERS_500 = "302000100000009483";
const FAIL_UNAUTHORIZED_401 = "302000100000009484";
const FAIL_LOGIN_400 = "302016723749670086";
const FAIL_LOGIN_500 = "302016723749670087";
const PSP_FAIL = "302016723749670057";
/* CANCEL_PAYMENT SUCCESS end with 58 */
const CANCEL_PAYMENT_OK = "302016723749670058";
/* CANCEL_PAYMENT_FAIL end with 59 */
const CANCEL_PAYMENT_KO = "302016723749670059";
const VALID_FISCAL_CODE = "77777777777";
const EMAIL = "mario.rossi@email.com";
const VALID_CARD_DATA = {
  number: "4333334000098346",
  expirationDate: "1230",
  ccv: "123",
  holderName: "Mario Rossi",
};
/* FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA end with 77 */
const FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA = "302016723749670077";
const CHECKOUT_URL_AFTER_AUTHORIZATION = `http://localhost:1234/esito`;
/* VALID_NOTICE_CODE */
const VALID_NOTICE_CODE = "302016723749670000";


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
    await page.waitForNavigation();
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
    await page.waitForNavigation();
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
    await page.waitForNavigation();
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
    await page.waitForNavigation();
    await clickLoginButton();

    const titleErrorElem = await page.waitForSelector("#errorTitle");
    const titleErrorBody = await page.waitForSelector("#errorBody");
    const title = await titleErrorElem.evaluate((el) => el.textContent);
    const body = await titleErrorBody.evaluate((el) => el.textContent);

    expect(first500Response).toBe(true);
    expect(tokenCalls).toBe(1);
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

  it("Should correctly retrieve payment methods with logged user", async () => {
    await page.evaluate(() => {
      //set item into sessionStorage for pass the route Guard
      sessionStorage.setItem('useremail', 'email');
      sessionStorage.setItem('authToken', 'auth-token-value');
    });
    //go to payment methods page
    await page.goto(PAYMENT_METHODS_PAGE);

    const isPaymentMethodsPresents = await verifyPaymentMethods();
    expect(isPaymentMethodsPresents).toBeTruthy();
  });

  it("Should redirect to auth-expired page receiving 401 from get payment-methods", async () => {
    await page.evaluate(() => {
      //set item into sessionStorage for pass the route Guard
      sessionStorage.setItem('useremail', 'email');
      sessionStorage.setItem('authToken', 'auth-token-value');
    });
    
    //set flow error case
    await fillPaymentNotificationForm(FAIL_UNAUTHORIZED_401, VALID_FISCAL_CODE);
    await page.waitForNavigation();

    //go to payment methods page
    await page.goto(PAYMENT_METHODS_PAGE);
    expect(page.url()).toContain("/autenticazione-scaduta");
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

  it("Should redirect to auth-expired page receiving 401 from post sessions", async () => {
    await page.evaluate(() => {
      //set item into sessionStorage for pass the route Guard
      sessionStorage.setItem('useremail', 'email');
      sessionStorage.setItem('authToken', 'auth-token-value');
      sessionStorage.setItem('paymentMethod', '{"paymentMethodId":"method-id","paymentTypeCode":"CP"}');
    });
    
    //set flow error case
    await fillPaymentNotificationForm(FAIL_UNAUTHORIZED_401, VALID_FISCAL_CODE);
    await page.waitForNavigation();

    //go to payment methods page and select card payment
    await page.goto(INSERT_CARD_PAGE);
    expect(page.url()).toContain("/autenticazione-scaduta");
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

describe("Logout tests", () => {

  it("Should invoke logout with success", async () => {
    await selectLanguage("it");
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
    const logoutButton = await page.waitForXPath('/html/body/div[3]/div[3]/ul/li');
    console.log("wait for logout button");
    await logoutButton.click();
    await new Promise((r) => setTimeout(r, 500));
    expect(logout204).toBe(true);
  });

  it("Should invoke logout with 4xx error and only one temptative", async () => {
    await selectLanguage("it");
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
    const logoutButton = await page.waitForXPath('/html/body/div[5]/div[3]/ul/li');
    console.log("wait for logout button");
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
    await selectLanguage("it");
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
    const logoutButton = await page.waitForXPath('/html/body/div[5]/div[3]/ul/li');
    console.log("wait for logout button");
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
    await selectLanguage("it");
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
    await selectLanguage("it");
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
    await selectLanguage("it");
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
    await selectLanguage("it");
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
    expect(page.url()).toContain("/sessione-scaduta");
    await new Promise((r) => setTimeout(r, 500));
    expect(logout204).toBe(true);
  });


  it("Should invoke logout with success when error page is shown", async () => {
    /*
     * Card payment with notice code that fails on activation and get PPT_WISP_SESSIONE_SCONOSCIUTA 
     * and redirect to expired session page
     */
    await selectLanguage("it");
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
