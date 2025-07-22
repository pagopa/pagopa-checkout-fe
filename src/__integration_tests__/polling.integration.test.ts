import {
  payNotice,
  selectLanguage,
} from "./utils/helpers";

/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const CHECKOUT_URL_AFTER_AUTHORIZATION = `http://localhost:1234/esito`;
const VALID_FISCAL_CODE = "77777777000";
const EMAIL = "mario.rossi@email.com";
const VALID_CARD_DATA = {
  number: "4333334000098346",
  expirationDate: "1230",
  ccv: "123",
  holderName: "Mario Rossi",
};
const RETRY_CODE = "302016723749670500";
jest.setTimeout(80000);
jest.retryTimes(3);
page.setDefaultNavigationTimeout(40000);
page.setDefaultTimeout(40000);

beforeAll(async () => {
  await page.goto(CHECKOUT_URL, { waitUntil: "networkidle0" });
  await page.setViewport({ width: 1200, height: 907 });
});

beforeEach(async () => {
  await page.goto(CHECKOUT_URL, { waitUntil: "networkidle0" });
});

afterEach(async () => {
  await page.evaluate(() => {
    window.onbeforeunload = null;
  });
});


describe("Transaction outcome polling logic after payment authorization", () => {
  it("Testing executes 5 polling retries as expected", async () => {
       console.log("Testing outcome polling");
 
       let outcomeCallCount = 0;  
 
       page.on("request", (request) => {
         const url = request.url();
         if (
           url.includes("/ecommerce/checkout/v1/transactions") &&
           url.includes("/outcomes")
         ) {
           outcomeCallCount++;
           console.log("Call outcome #", outcomeCallCount);
           
         }
       });
 
       await selectLanguage("it");
 
       await payNotice(
         RETRY_CODE,
         VALID_FISCAL_CODE,
         EMAIL,
         VALID_CARD_DATA,
         CHECKOUT_URL_AFTER_AUTHORIZATION
       );
       expect(outcomeCallCount).toEqual(5);
     });
});
