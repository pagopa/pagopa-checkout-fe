import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";
import { 
  cancelPaymentKO, 
  cancelPaymentOK, 
  checkErrorOnCardDataFormSubmit, 
  clickLoginButton, 
  fillAndSubmitCardDataForm, 
  fillPaymentNotificationForm, 
  getUserButton, 
  payNotice, 
  selectLanguage, 
  tryLoginWithAuthCallbackError, 
  choosePaymentMethod, 
  verifyPaymentMethods, 
  verifyWalletVisible, 
  verifyWalletNotVisible, 
  verifyWalletsSectionVisible, 
  verifyWalletsSectionNotVisible, 
  fillPaymentFlowWithoutLogin, 
  fillPaymentFlowWithLogin, 
  payWithWallet, 
  cancelWalletPayment,
  editWalletSelectAnotherAndPay
} from "./utils/helpers";
import { URL, OKPaymentInfo, KORPTIDs } from "./utils/testConstants";

jest.setTimeout(60000);
jest.retryTimes(3);
page.setDefaultNavigationTimeout(30000);
page.setDefaultTimeout(30000);

beforeAll(async () => {
  await page.goto(URL.CHECKOUT_URL, { waitUntil: "networkidle0" });
  await page.setViewport({ width: 1200, height: 907 });
});

beforeEach(async () => {
  await page.evaluate(() => sessionStorage.clear());
  await page.deleteCookie({name:'mockFlow'});
  await page.goto(URL.CHECKOUT_URL, { waitUntil: "networkidle0" });
});

describe("Checkout authentication tests", () => {
  it("Should correclty invoke the login flow when clicking login or retry", async () => {

    // keep track
    let successfullLogins = 0;

    // Listen for frame navigation (URL change)
    // when the login is completed we will be redirected to BASE_CALLBACK_URL
    page.on('framenavigated', async (frame) => {
      const url = frame.url();
      if(url.startsWith(URL.BASE_CALLBACK_URL)){
        successfullLogins++;
      }
    });

    // start flow from a url different from home
    await page.goto(URL.PAGE_LOGIN_COMEBACK_URL, { waitUntil: "networkidle0" });

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
    await page.goto(URL.CALLBACK_URL_NO_CODE, { waitUntil: "networkidle0" });

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
    expect(urlAfterSuccessfullLogin).toBe(URL.PAGE_LOGIN_COMEBACK_URL);
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
    await page.goto(URL.CALLBACK_URL_NO_CODE, { waitUntil: "networkidle0" });
    const currentUrl = await page.evaluate(() => location.href);
    console.log("Current url: " + currentUrl);

    const titleErrorElem = await page.waitForSelector("#errorTitle");
    const titleErrorBody = await page.waitForSelector("#errorBody");
    const title = await titleErrorElem.evaluate((el) => el.textContent);
    const body = await titleErrorBody.evaluate((el) => el.textContent);

    expect(currentUrl).not.toBe(URL.PAGE_LOGIN_COMEBACK_URL);
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
    await page.goto(URL.CALLBACK_URL_NO_STATE, { waitUntil: "networkidle0" });
    const currentUrl = await page.evaluate(() => location.href);
    console.log("Current url: " + currentUrl);

    const titleErrorElem = await page.waitForSelector("#errorTitle");
    const titleErrorBody = await page.waitForSelector("#errorBody");
    const title = await titleErrorElem.evaluate((el) => el.textContent);
    const body = await titleErrorBody.evaluate((el) => el.textContent);

    expect(currentUrl).not.toBe(URL.PAGE_LOGIN_COMEBACK_URL);
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
    await fillPaymentNotificationForm(KORPTIDs.POST_AUTH_TOKEN_FAILS, OKPaymentInfo.VALID_FISCAL_CODE);

    await clickLoginButton();

    const titleErrorElem = await page.waitForSelector("#errorTitle");
    const titleErrorBody = await page.waitForSelector("#errorBody");
    const title = await titleErrorElem.evaluate((el) => el.textContent);
    const body = await titleErrorBody.evaluate((el) => el.textContent);

    const currentUrl = await page.evaluate(() => location.href);
    expect(currentUrl.startsWith(URL.BASE_CALLBACK_URL)).toBe(true);

    console.log("Search login button")

    const regex = new RegExp(URL.BASE_CALLBACK_URL_REGEX);
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

    await fillPaymentNotificationForm(KORPTIDs.POST_AUTH_TOKEN_FAILS_503, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();
    await clickLoginButton();

    await page.waitForNavigation();
    await page.waitForNavigation();
    const currentUrl = await page.evaluate(() => location.href);


    expect(first503Response).toBe(true);
    expect(tokenCalls).toBe(2);
    expect(currentUrl).toBe(URL.BASE_CALLBACK_URL_PAYMENT_DATA);
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

    await fillPaymentNotificationForm(KORPTIDs.POST_AUTH_TOKEN_FAILS_504, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();
    await clickLoginButton();

    await page.waitForNavigation();
    await page.waitForNavigation();

    const currentUrl = await page.evaluate(() => location.href);

    expect(first504Response).toBe(true);
    expect(tokenCalls).toBe(2);
    expect(currentUrl).toBe(URL.BASE_CALLBACK_URL_PAYMENT_DATA);
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

    await fillPaymentNotificationForm(KORPTIDs.POST_AUTH_TOKEN_FAILS_429, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();
    await clickLoginButton();

    await page.waitForNavigation();
    await page.waitForNavigation();

    const currentUrl = await page.evaluate(() => location.href);


    expect(first429Response).toBe(true);
    expect(tokenCalls).toBe(2);
    expect(currentUrl).toBe(URL.BASE_CALLBACK_URL_PAYMENT_DATA);
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

    await fillPaymentNotificationForm(KORPTIDs.POST_AUTH_TOKEN_FAILS, OKPaymentInfo.VALID_FISCAL_CODE);
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
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");

    //set flow error case
    await fillPaymentNotificationForm(KORPTIDs.FAIL_GET_USERS_401, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();
    console.log("MockFlow setted with noticeCode: ", KORPTIDs.FAIL_GET_USERS_401);

    //reload page in order to read authToken into sessionStorage
    await page.reload();

    //Wait return to error page
    await page.waitForSelector("#koPageBody");
    expect(page.url()).toContain("/errore");
  });

  it("Should redirect to error page receiving 500 from get user info on page refresh", async () => {
    //Do login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");

    //set flow error case
    await fillPaymentNotificationForm(KORPTIDs.FAIL_GET_USERS_500, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();
    console.log("MockFlow setted with noticeCode: ", KORPTIDs.FAIL_GET_USERS_500);

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
    await page.waitForSelector('button[aria-label="party-menu-button"]');
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

    const authCallbackError = await tryLoginWithAuthCallbackError(KORPTIDs.FAIL_GET_USERS_401, OKPaymentInfo.VALID_FISCAL_CODE);

    const regex = new RegExp(URL.BASE_CALLBACK_URL_REGEX);
    expect(regex.test(authCallbackError.currentUrl)).toBe(true);
    expect(authCallbackError.title).toContain(translation.authCallbackPage.title);
    expect(authCallbackError.body).toContain(translation.authCallbackPage.body);
  });

  it("Should correctly retrieve payment methods with logged user", async () => {
    await page.evaluate(() => {
      //set item into sessionStorage for pass the route Guard
      sessionStorage.setItem('useremail', 'email');
      sessionStorage.setItem('authToken', 'auth-token-value');
      // Set up payment context required for payment methods API
      sessionStorage.setItem('paymentInfo', JSON.stringify({
        amount: 12015,
        rptId: '12345678901012345678901234567'
      }));
    });
    //go to payment methods page
    await page.goto(URL.PAYMENT_METHODS_PAGE, { waitUntil: "networkidle0" });

    const isPaymentMethodsPresents = await verifyPaymentMethods();
    expect(isPaymentMethodsPresents).toBeTruthy();
  });

  it.each([
    [false, "legacy v1/v3 API"],
    [true, "new v2/v4 API"]
  ])("Should redirect to auth-expired page receiving 401 from get payment-methods with enablePaymentMethodsHandler=%s (%s)", async (enableFlag, description) => {
    await page.evaluate((flag) => {
      //set item into sessionStorage for pass the route Guard
      sessionStorage.setItem('useremail', 'email');
      sessionStorage.setItem('authToken', 'auth-token-value');
      sessionStorage.setItem('enablePaymentMethodsHandler', flag.toString());
    }, enableFlag);

    //set flow error case
    await fillPaymentNotificationForm(KORPTIDs.FAIL_UNAUTHORIZED_401, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();

    //go to payment methods page
    await page.goto(URL.PAYMENT_METHODS_PAGE, { waitUntil: "networkidle0" });
    await page.waitForSelector("#errorTitle");
    expect(page.url()).toContain("/autenticazione-scaduta");
  });

  it("Should correctly call post sessions with logged user", async () => {
    await page.evaluate(() => {
      //set item into sessionStorage for pass the route Guard
      sessionStorage.setItem('useremail', 'email');
      sessionStorage.setItem('authToken', 'auth-token-value');
      // Set up payment context required for payment methods API
      sessionStorage.setItem('paymentInfo', JSON.stringify({
        amount: 12015,
        rptId: '12345678901012345678901234567'
      }));
    });

    //set flow success case
    await fillPaymentNotificationForm(OKPaymentInfo.VALID_RPTID, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();

    //go to payment methods page and select card payment
    await page.goto(URL.PAYMENT_METHODS_PAGE, { waitUntil: "networkidle0" });
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
      // Set up payment context required for payment methods API
      sessionStorage.setItem('paymentInfo', JSON.stringify({
        amount: 12015,
        rptId: '12345678901012345678901234567'
      }));
    });

    //set flow error case
    await fillPaymentNotificationForm(KORPTIDs.FAIL_UNAUTHORIZED_401, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();

    //go to payment methods page and select card payment
    await page.goto(URL.INSERT_CARD_PAGE, { waitUntil: "networkidle0" });
    await page.waitForSelector("#errorTitle");
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

    const authCallbackError = await tryLoginWithAuthCallbackError(KORPTIDs.FAIL_GET_USERS_500, OKPaymentInfo.VALID_FISCAL_CODE);

    const regex = new RegExp(URL.BASE_CALLBACK_URL_REGEX);
    expect(regex.test(authCallbackError.currentUrl)).toBe(true);
    expect(authCallbackError.title).toContain(translation.authCallbackPage.title);
    expect(authCallbackError.body).toContain(translation.authCallbackPage.body);
  });

  it("Should invoke auth-service api with x-rpt-ids header", async () => {
    let expectedCount = 4; // login - authToken - getUser - logout
    let apiContainsXRptIdCount = 0;
    
    page.on("request", async (request) => {
      const url = request.url();
      if (url.includes("auth-service/v1")) {
        const headers = await request.headers();
        if(headers['x-rpt-ids'] != null)
          apiContainsXRptIdCount ++
      }
    });

    //Insert valid rptId
    await fillPaymentNotificationForm(OKPaymentInfo.VALID_RPTID, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForSelector('button[aria-label="party-menu-button"]');
    
    console.log("Login completed");

    //Logout
    const userButton = await getUserButton();
    await userButton.click();
    const logoutIconButton = await page.waitForSelector('[data-testid="LogoutIcon"]');
    const logoutButton = await logoutIconButton.getProperty('parentNode');
    console.log("wait for logout button");
    await logoutButton.click();
    const confirmButton = await page.waitForSelector("#logoutModalConfirmButton");
    await confirmButton.click();
    await page.waitForSelector('button[title="Accedi"]');
    console.log("Logout completed");
        
    expect(apiContainsXRptIdCount).toBe(expectedCount);
  });

  it("Should invoke auth-service api without x-rpt-ids if not present", async () => {
    let expectedCount = 4; // login - authToken - getUser - logout
    let apiNotContainsXRptIdCount = 0;
    
    page.on("request", async (request) => {
      const url = request.url();
      if (url.includes("auth-service/v1")) {
        const headers = await request.headers();
        if(headers['x-rpt-ids'] == '') {
          apiNotContainsXRptIdCount ++
        }
      }
    });

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForSelector('button[aria-label="party-menu-button"]');
    
    console.log("Login completed");

    //Logout
    const userButton = await getUserButton();
    await userButton.click();
    const logoutIconButton = await page.waitForSelector('[data-testid="LogoutIcon"]');
    const logoutButton = await logoutIconButton.getProperty('parentNode');
    console.log("wait for logout button");
    await logoutButton.click();
    const confirmButton = await page.waitForSelector("#logoutModalConfirmButton");
    await confirmButton.click();
    await new Promise((r) => setTimeout(r, 500));
    console.log("Logout completed");
        
    expect(apiNotContainsXRptIdCount).toBe(expectedCount);
  });

  it("Should invoke checkout v3/v4 api with x-rpt-ids header", async () => {
    let expectedCount = 3; // payment-methods - sessions - transaction
    let apiContainsXRptIdCount = 0;
    
    page.on("request", async (request) => {
      const url = request.url();
      if (url.includes("checkout/v3") || url.includes("checkout/v4")) {
        const headers = await request.headers();
        if(headers['x-rpt-ids'] != null)
          apiContainsXRptIdCount ++
      }
    });

    // Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");

    // Complete authenticated payment
    await payNotice(
          OKPaymentInfo.VALID_NOTICE_CODE,
          OKPaymentInfo.VALID_FISCAL_CODE,
          OKPaymentInfo.EMAIL,
          OKPaymentInfo.VALID_CARD_DATA,
          URL.CHECKOUT_URL_AFTER_AUTHORIZATION
    );

    expect(apiContainsXRptIdCount).toBe(expectedCount);
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
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");
    const userButton = await getUserButton();
    await userButton.click();
    const logoutButton = await page.waitForSelector('#logout-button-icon');
    console.log("wait for logout button");
    await logoutButton.click();
    const confirmButton = await page.waitForSelector("#logoutModalConfirmButton");
    await confirmButton.click();
    await new Promise((r) => setTimeout(r, 500));
    expect(logout204).toBe(true);
  });

  it("Should invoke logout with 4xx error and only try one attempt", async () => {
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
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");

    await fillPaymentNotificationForm(KORPTIDs.FAIL_LOGIN_400, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();
    const userButton = await getUserButton();
    await userButton.click();
    const logoutButtonIcon = await page.waitForSelector("#logout-button-icon");
    const logoutButton = await logoutButtonIcon.getProperty('parentNode');
    await logoutButton.click();
    const confirmButton = await page.waitForSelector("#logoutModalConfirmButton");
    await confirmButton.click();
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
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");

    await fillPaymentNotificationForm(KORPTIDs.FAIL_LOGIN_500, OKPaymentInfo.VALID_FISCAL_CODE);
    await page.waitForNavigation();
    const userButton = await getUserButton();
    await userButton.click();
    console.log("wait for logout button");
    const logoutButtonIcon = await page.waitForSelector("#logout-button-icon");
    const logoutButton = await logoutButtonIcon.getProperty('parentNode');
    await logoutButton.click();
    const confirmButton = await page.waitForSelector("#logoutModalConfirmButton");
    await confirmButton.click();
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
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");

    const resultMessage = await payNotice(
      OKPaymentInfo.VALID_NOTICE_CODE,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA,
      URL.CHECKOUT_URL_AFTER_AUTHORIZATION
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
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");

    const resultMessage = await cancelPaymentOK(
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA
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
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");

    const resultMessage = await cancelPaymentKO(
            KORPTIDs.CANCEL_PAYMENT_KO,
            OKPaymentInfo.VALID_FISCAL_CODE,
            OKPaymentInfo.EMAIL
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
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");
    await fillAndSubmitCardDataForm(KORPTIDs.FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA, OKPaymentInfo.VALID_FISCAL_CODE, OKPaymentInfo.EMAIL, OKPaymentInfo.VALID_CARD_DATA);
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
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");
    
    await checkErrorOnCardDataFormSubmit(
      KORPTIDs.PSP_FAIL,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA
    );
    const closeErrorModalButton = "#closeError";
    await page.waitForSelector(closeErrorModalButton);
    await page.click(closeErrorModalButton);

    await new Promise((r) => setTimeout(r, 500));
    expect(logout204).toBe(true);
  });
  
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])
  ("Should remain on the same page in case of logout for no active transaction [%s]", async (lang, translation) => {
    await selectLanguage(lang);
    //Insert valid rptId and remain on payment form page
    await fillPaymentNotificationForm(OKPaymentInfo.VALID_RPTID, OKPaymentInfo.VALID_FISCAL_CODE, false);

    //Login
    await clickLoginButton();

    //Wait auth-callback page
    await page.waitForSelector('button[aria-label="party-menu-button"]');

    console.log("Login completed");

    //Logout
    const userButton = await getUserButton();
    await userButton.click();
    const logoutIconButton = await page.waitForSelector('[data-testid="LogoutIcon"]');
    const logoutButton = await logoutIconButton.getProperty('parentNode');
    await logoutButton.click();
    console.log("logout button clicked");
    await new Promise(r => setTimeout(r, 1000));
    const logoutUserModalTitleElement = await page.waitForSelector("#logoutModalTitle");
    const logoutModalTitle = await logoutUserModalTitleElement.evaluate((el) => el.textContent);
    expect(logoutModalTitle).toBe(translation.userSession.logoutModal.title);
    const confirmButton = await page.waitForSelector("#logoutModalConfirmButton");
    await confirmButton.click();

  });
});

describe("Wallet feature tests", () => {
  it("Should display wallet list for authenticated user with wallet feature enabled", async () => {
    console.log("\n=== TEST: Should display wallet list for authenticated user with wallet feature enabled ===");
    await selectLanguage("it");
    // enable feature flag
    await page.evaluate(() => {
      sessionStorage.setItem('enableWallet', 'true');
      console.log("Wallet feature flag enabled")
    });

    // login
    await fillPaymentFlowWithLogin(OKPaymentInfo.VALID_RPTID, OKPaymentInfo.VALID_FISCAL_CODE, OKPaymentInfo.EMAIL);

    // check wallets section is visibile
    const walletsSectionVisible = await verifyWalletsSectionVisible();
    expect(walletsSectionVisible).toBe(true);
    console.log("Wallet section visible")

    // check individual wallets from list are visible
    const wallet0Visible = await verifyWalletVisible(0);
    expect(wallet0Visible).toBe(true);
    console.log("First wallet visible")

    const wallet1Visible = await verifyWalletVisible(1);
    expect(wallet1Visible).toBe(true);
    console.log("Second wallet visible")
  });

  it("Should NOT display wallets when wallet feature flag is disabled", async () => {
    console.log("\n=== TEST: Should NOT display wallets when wallet feature flag is disabled ===");
    // disable feature flag
    await page.evaluate(() => {
      sessionStorage.setItem('enableWallet', 'false');
      console.log("Wallet feature flag disabled")
    });

    // login
    await fillPaymentFlowWithLogin(OKPaymentInfo.VALID_RPTID, OKPaymentInfo.VALID_FISCAL_CODE, OKPaymentInfo.EMAIL);

    // check wallets section is NOT visibile
    const walletsSectionNotVisible = await verifyWalletsSectionNotVisible();
    expect(walletsSectionNotVisible).toBe(true);
    console.log("Wallet section not visible")

    // check no wallet elements are visible
    const noWallets = await verifyWalletNotVisible();
    expect(noWallets).toBe(true);
    console.log("Individual wallets not visible")
  });

  it("Should NOT display wallets when user is not authenticated", async () => {
    console.log("\n=== TEST: Should NOT display wallets when user is not authenticated ===");
    // enable wallet feature flag
    await page.evaluate(() => {
      sessionStorage.setItem('enableWallet', 'true');
      console.log("Wallet feature flag enabled")
    });

    // do not login
    await fillPaymentFlowWithoutLogin(OKPaymentInfo.VALID_RPTID, OKPaymentInfo.VALID_FISCAL_CODE, OKPaymentInfo.EMAIL);
    console.log("User not authenticated")

    // check wallets section is NOT visibile
    const walletsSectionNotVisible = await verifyWalletsSectionNotVisible();
    expect(walletsSectionNotVisible).toBe(true);
    console.log("Wallet section not visible")

    // check no wallet elements are visible
    const noWallets = await verifyWalletNotVisible();
    expect(noWallets).toBe(true);
    console.log("Individual wallets not visible")
  });

  /**
   * This test covers:
   * - enabling wallet feature flag
   * - completing payment using a saved wallet
   * - verifying that the auth request contains wallet details
   * - verifying that the calculate fees API is called
   * - verifying the outcomes response after payment completion
   */
  it("Should successfully complete payment using a saved wallet", async () => {
    console.log("\n=== TEST: Should successfully complete payment using a saved wallet ===");
    await selectLanguage("it");
    let outcomesResponse = null;
    let authRequestCalled = false;
    let hasWalletDetail = false;
    let calculateFeesCalled = false;

    // listen for auth request with wallet details
    page.on("request", async (request) => {
      const url = request.url();

      // check POST auth request contains wallet detailType
      if (url.includes("/ecommerce/checkout/v1/transactions/") && url.includes("/auth-requests") && request.method() === "POST") {
        authRequestCalled = true;
        try {
          const postData = request.postData();
          if (postData) {
            const parsedData = JSON.parse(postData);
            if (parsedData.details && parsedData.details.detailType === "wallet" && parsedData.details.walletId) {
              hasWalletDetail = true;
            }
          }
        } catch (e) {
          console.log("Error parsing auth request:", e);
        }
      }

      // check calculate fees was called
      if (url.includes("/ecommerce/checkout/v2/payment-methods/") && url.includes("/fees")) {
        calculateFeesCalled = true;
      }
    });

    // listen for outcomes
    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/ecommerce/checkout/v1/transactions/") && url.includes("/outcomes") && response.request().method() === "GET") {
        try {
          outcomesResponse = await response.json();
        } catch (e) {
          console.log("Error parsing outcomes response:", e);
        }
      }
    });

    await page.evaluate(() => {
      sessionStorage.setItem('enableWallet', 'true');
      console.log("Wallet feature flag enabled")
    });

    const resultMessage = await payWithWallet(
      OKPaymentInfo.VALID_NOTICE_CODE,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      0,
      URL.CHECKOUT_URL_AFTER_AUTHORIZATION
    );

    expect(resultMessage).toContain(itTranslation.paymentResponsePage[0].title.replace("{{amount}}", "120,15\xa0€"));

    // check outcomes response
    expect(outcomesResponse).not.toBeNull();
    // @ts-expect-error - outcomesResponse is properly typed at runtime
    expect(outcomesResponse.outcome).toBe(0);

    // check auth request was made with wallet details
    expect(authRequestCalled).toBe(true);
    expect(hasWalletDetail).toBe(true);

    // check calculate fees was called
    expect(calculateFeesCalled).toBe(true);

    console.log("Wallet payment completed successfully with all API validations");
  });

  /**
   * This test covers:
   * - completing wallet payments for multiple languages
   * - verifying the outcomes response after payment completion
   * Note: API call verifications are covered in the previous test
   */
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])(
    "Should successfully complete wallet payment for language [%s]",
    async (lang, translation) => {
      console.log(`\n=== TEST: Should successfully complete wallet payment for language [${lang}] ===`);
      let outcomesResponse = null;

      page.on("response", async (response) => {
        const url = response.url();
        if (url.includes("/ecommerce/checkout/v1/transactions/") && url.includes("/outcomes") && response.request().method() === "GET") {
          try {
            outcomesResponse = await response.json();
          } catch (e) {
            console.log("Error parsing outcomes response:", e);
          }
        }
      });

      await selectLanguage(lang);
      await page.evaluate(() => {
        sessionStorage.setItem('enableWallet', 'true');
      });

      const resultMessage = await payWithWallet(
        OKPaymentInfo.VALID_NOTICE_CODE,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        0,
        URL.CHECKOUT_URL_AFTER_AUTHORIZATION
      );

      expect(resultMessage).toContain(translation.paymentResponsePage[0].title.replace("{{amount}}", "120,15\xa0€"));

      // check outcomes response
      expect(outcomesResponse).not.toBeNull();
      // @ts-expect-error - outcomesResponse is properly typed at runtime 
      expect(outcomesResponse.outcome).toBe(0);
      console.log(`Wallet payment completed successfully for language: ${lang}`);
    }
  );

  /**
   * This test covers:
   * - selecting the second wallet from the list and completing payment
   * - verifying the outcomes response after payment completion
   * Note: API call verifications are covered in a previous test
   */
  it("Should successfully select second wallet and complete payment", async () => {
    console.log("\n=== TEST: Should successfully select second wallet and complete payment ===");
    await selectLanguage("it");
    let outcomesResponse = null;

    page.on("response", async (response) => {
      const url = response.url();
      if (url.includes("/ecommerce/checkout/v1/transactions/") && url.includes("/outcomes") && response.request().method() === "GET") {
        try {
          outcomesResponse = await response.json();
        } catch (e) {
          console.log("Error parsing outcomes response:", e);
        }
      }
    });

    await page.evaluate(() => {
      sessionStorage.setItem('enableWallet', 'true');
      console.log("Wallet feature flag enabled")
    });

    const resultMessage = await payWithWallet(
      OKPaymentInfo.VALID_NOTICE_CODE,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      1,
      URL.CHECKOUT_URL_AFTER_AUTHORIZATION
    );

    expect(resultMessage).toContain(itTranslation.paymentResponsePage[0].title.replace("{{amount}}", "120,15\xa0€"));

    // check outcomes response
    expect(outcomesResponse).not.toBeNull();
    // @ts-expect-error - outcomesResponse is properly typed at runtime 
    expect(outcomesResponse.outcome).toBe(0);
    console.log("Second wallet payment completed successfully");
  });

  /**
   * This test covers:
   * - cancelling wallet payments for multiple languages
   */
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])(
    "Should successfully cancel wallet payment for language [%s]",
    async (lang, translation) => {
      console.log(`\n=== TEST: Should successfully cancel wallet payment for language [${lang}] ===`);
      await selectLanguage(lang);
      await page.evaluate(() => {
        sessionStorage.setItem('enableWallet', 'true');
      });

      const resultMessage = await cancelWalletPayment(
        KORPTIDs.CANCEL_PAYMENT_OK,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        0
      );

      expect(resultMessage).toContain(translation.cancelledPage.body);
      console.log(`Wallet payment cancelled successfully for language: ${lang}`);
    }
  );

  /**
   * This test covers:
   * - selecting a wallet and navigating to payment summary page
   * - clicking the "Modifica" (Edit) button to change wallet selection
   * - selecting a different wallet (second wallet)
   * - completing the payment with the newly selected wallet
   * - verifying the outcomes response after payment completion
   * - testing across all supported languages
   */
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])(
    "Should successfully edit wallet selection and complete payment for language [%s]",
    async (lang, translation) => {
      console.log(`\n=== TEST: Should successfully edit wallet selection and complete payment for language [${lang}] ===`);
      let outcomesResponse = null;

      page.on("response", async (response) => {
        const url = response.url();
        if (url.includes("/ecommerce/checkout/v1/transactions/") && url.includes("/outcomes") && response.request().method() === "GET") {
          try {
            outcomesResponse = await response.json();
          } catch (e) {
            console.log("Error parsing outcomes response:", e);
          }
        }
      });

      await selectLanguage(lang);
      await page.evaluate(() => {
        sessionStorage.setItem('enableWallet', 'true');
        console.log("Wallet feature flag enabled")
      });

      // select first wallet, click edit button, select second wallet, complete payment
      const resultMessage = await editWalletSelectAnotherAndPay(
        OKPaymentInfo.VALID_NOTICE_CODE,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        0, // initial wallet index (first wallet)
        1, // new wallet index (second wallet)
        URL.CHECKOUT_URL_AFTER_AUTHORIZATION
      );

      expect(resultMessage).toContain(translation.paymentResponsePage[0].title.replace("{{amount}}", "120,15\xa0€"));

      // check outcomes response
      expect(outcomesResponse).not.toBeNull();
      // @ts-expect-error - outcomesResponse is properly typed at runtime
      expect(outcomesResponse.outcome).toBe(0);
      console.log(`Wallet edit and payment completed successfully for language: ${lang}`);
    }
  );
});

