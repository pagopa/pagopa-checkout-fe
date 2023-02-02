import { payNotice, acceptCookiePolicy, verifyPaymentAndGetError } from "./utils/helpers";

describe("Checkout payment activation tests", () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = "http://localhost:1234/";
  const CHECKOUT_URL_AFTER_AUTHORIZATION = "http://localhost:1234/esito";
  const VALID_FISCAL_CODE = "77777777777";
  const INVALID_FISCAL_CODE = "77777777776"
  const EMAIL = "mario.rossi@email.com";
  const VALID_CARD_DATA = {
    number: "4333334000098346",
    expirationDate: "1230",
    ccv: "123",
    holderName: "Mario Rossi",
  };
  const VALID_NOTICE_CODE = Math.floor(
    Math.random() * (311111999999999999 - 311111000000000000 + 1) +
      311111000000000000
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
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
    await acceptCookiePolicy();
  })

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
  });
  
  it("Should correctly execute a payment", async () => {
    /*
     * 1. Payment with valid notice code
    */
    const resultMessage = await payNotice(
      VALID_NOTICE_CODE,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      CHECKOUT_URL_AFTER_AUTHORIZATION
    );
    

    expect(resultMessage).toContain("Grazie, hai pagato");
  });
  
  it("Should fail a payment verify and get PA_IRRAGGIUNGIBILE", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PA_IRRAGGIUNGIBILE
     */
    const resultMessage = await verifyPaymentAndGetError(PA_IRRAGGIUNGIBILE_NOTICE_CODE, VALID_FISCAL_CODE);
                                                                                                             
    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_SCONOSCIUTA");
  });

  it("Should fail a payment verify and get PPT_DOMINIO_SCONOSCIUTO", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PPT_DOMINIO_SCONOSCIUTO
     */
    const resultMessage = await verifyPaymentAndGetError(PA_IRRAGGIUNGIBILE_NOTICE_CODE, INVALID_FISCAL_CODE);
                                                                                                             
    expect(resultMessage).toContain("PPT_DOMINIO_SCONOSCIUTO");
  });
});
