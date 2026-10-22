import {
  choosePaymentMethod,
  fillEmailForm,
  fillPaymentNotificationForm,
  selectLanguage,
} from "./utils/helpers";
import { OKPaymentInfo } from "./utils/testConstants";

describe("Check NPG SDK SRI hash handling", () => {

  jest.setTimeout(10000);
  page.setDefaultNavigationTimeout(10000);
  page.setDefaultTimeout(10000);

  beforeAll(async () => {
    await page.setViewport({ width: 1200, height: 907 });
  })

  //negative test only here: positive tests are already done in integration tests with card payments that already checks for iframe being loaded correctly
  it(`Check that NPG SDK is not loaded for invalid SRI hash`, async() => {
    console.log("Check that NPG SDK is not loaded for invalid SRI hash")
    const CHECKOUT_HOME_PAGE = "http://localhost:1234";

    // disable cache and navigate to a blank page to ensure a fresh start so that all resources are loaded anew 
    await page.setCacheEnabled(false);
    await page.goto("about:blank");

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (request.url().includes('/npg/sdk/')) {
        request.continue({ headers: { ...request.headers(), Cookie: 'tamperSriHash=true' } });
      } else {
        request.continue();
      }
    });
    // the browser reports the SRI mismatch as a console error and blocks the script
    const consoleErrors = [""];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    console.log("start checkout")
    await page.goto(CHECKOUT_HOME_PAGE, { waitUntil: "networkidle0" });
    
    await selectLanguage("it");

    // stop before the card form: its iframes never render when the SDK is blocked
    await fillPaymentNotificationForm(
      OKPaymentInfo.VALID_NOTICE_CODE,
      OKPaymentInfo.VALID_FISCAL_CODE
    );
    const payNoticeBtn = await page.waitForSelector("#paymentSummaryButtonPay", {
      visible: true,
    });
    await payNoticeBtn.click();
    await fillEmailForm(OKPaymentInfo.EMAIL);
    await choosePaymentMethod("CP");
    // the app redirects to the error page when the SDK cannot be loaded
    await page.waitForSelector("#koPageBody");
    expect(page.url()).toContain("/errore");
    
    console.log("Console errors :", consoleErrors);
    // the SDK script has been blocked: no SRI-related error means the test is not exercising the tampered hash
    //check for custom error log on SDK load error
    expect(consoleErrors.some((e) => /NPG SDK failed to load or failed SRI validation; SDK not loaded/i.test(e))).toBe(true);

    // the SDK has not been executed, so no card field iframe is rendered
    expect(await page.$('#frame_CARD_NUMBER')).toBeNull();
  }, 30000)
});