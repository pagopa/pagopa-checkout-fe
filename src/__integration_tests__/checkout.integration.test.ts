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
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
    await acceptCookiePolicy();
  })

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
  });
  
  it.only("Should correctly execute a payment", async () => {
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

  it("Should fail a payment verify and get PA_IRRAGGIUNGIBILE", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PA_IRRAGGIUNGIBILE
     */
    const resultMessage = await verifyPaymentAndGetError(PA_IRRAGGIUNGIBILE_NOTICE_CODE, VALID_FISCAL_CODE, "/html/body/div[4]/div[3]/div/div/div[2]/div[2]/div");

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_IRRAGGIUNGIBILE");
  });


  it("Should fail a payment verify and get PAA_PAGAMENTO_IN_CORSO", async () => {
    /*
     * 3. Payment with notice code that fails on verify and get PAA_PAGAMENTO_IN_CORSO
     */
    const resultMessage = await verifyPaymentAndGetError(PAA_PAGAMENTO_IN_CORSO_NOTICE_CODE, VALID_FISCAL_CODE, "/html/body/div[4]/div[3]/div/h2/div");

    expect(resultMessage).toContain("Il pagamento è già in corso, riprova tra qualche minuto__int");
  });

  it("Should fail a payment verify and get PPT_SINTASSI_XSD", async () => {
    /*
     * 4. Payment with notice code that fails on verify and get PPT_SINTASSI_XSD
     */
    const resultMessage = await verifyPaymentAndGetError(PPT_SINTASSI_XSD_NOTICE_CODE, VALID_FISCAL_CODE, "/html/body/div[4]/div[3]/div/div/div[2]/div[2]/div");

    expect(resultMessage).toContain("PPT_SINTASSI_XSD");
  });

  it("Should fail a payment verify and get PPT_SYSTEM_ERROR", async () => {
    /*
     * 5. Payment with notice code that fails on verify and get PPT_SYSTEM_ERROR
     */
    const resultMessage = await verifyPaymentAndGetError(PPT_SYSTEM_ERROR_NOTICE_CODE, VALID_FISCAL_CODE, "/html/body/div[4]/div[3]/div/div/div[2]/div[2]/div");

    expect(resultMessage).toContain("PPT_SYSTEM_ERROR");
  });
});