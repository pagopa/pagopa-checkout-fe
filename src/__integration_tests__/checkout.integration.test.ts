import { payNotice, acceptCookiePolicy, verifyPaymentAndGetError } from "./utils/helpers.js";


describe("Checkout payment activation tests", () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = "http://localhost:1234/";
  const VALID_FISCAL_CODE = "77777777777";
  const EMAIL = "mario.rossi@email.com";
  const VALID_CARD_DATA = {
    number: "4333334000098346",
    expirationDate: "1230",
    ccv: "123",
    holderName: "Mario Rossi",
  };
  const VALID_NOTICE_CODE = Math.floor(
    Math.random() * (302001999999999999 - 302001000000000000 + 1) +
      302001000000000000
  ).toString();
  
  const PA_IRRAGGIUNGIBILE_NOTICE_CODE = "302016723749670009";
  const PAA_PAGAMENTO_IN_CORSO_NOTICE_CODE = "302016723749670010";
  const PPT_SINTASSI_XSD_NOTICE_CODE = "302016723749670011";
  const PPT_SYSTEM_ERROR_NOTICE_CODE = "302016723749670012";

  /**
   * Increase default test timeout (60000ms)
   * to support entire payment flow
    */
  jest.setTimeout(60000);
  jest.retryTimes(3);
  page.setDefaultNavigationTimeout(60000);
  page.setDefaultTimeout(60000)

  beforeAll( async () => {
    console.log("beforeAll")
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
  })

  beforeEach(async () => {
    console.log("beforeEach")
    await page.goto(CHECKOUT_URL);
    await acceptCookiePolicy();
  });
  
  it("Should correctly execute a payment", async () => {
    /*
     * 1. Payment with valid notice code
    */
    const resultMessage = await payNotice(
      VALID_NOTICE_CODE,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );

    expect(resultMessage).toContain("Grazie, hai pagato");
  });
  
});
