import { payNotice, acceptCookiePolicy, verifyPaymentAndGetError, activatePaymentAndGetError, authorizePaymentAndGetError } from "./utils/helpers";

describe("Checkout payment activation tests", () => {
  /**
   * Test input and configuration
   */
  const CHECKOUT_URL = "http://localhost:1234/";
  const CHECKOUT_URL_AFTER_AUTHORIZATION = "http://localhost:1234/esito";
  const VALID_FISCAL_CODE = "77777777777";
  const EMAIL = "mario.rossi@email.com";
  const VALID_CARD_DATA = {
    number: "4333334000098346",
    expirationDate: "1230",
    ccv: "123",
    holderName: "Mario Rossi",
  };

  /* VALID_NOTICE_CODE */
  const VALID_NOTICE_CODE = "302016723749670000"
  /* FAIL_VERIFY_PPT_STAZIONE_INT_PA_SCONOSCIUTA end with 03 */
  const FAIL_VERIFY_PPT_STAZIONE_INT_PA_SCONOSCIUTA = "302016723749670003";
  /* FAIL_VERIFY_PPT_DOMINIO_SCONOSCIUTO end with 04 */
  const FAIL_VERIFY_PPT_DOMINIO_SCONOSCIUTO = "302016723749670004";
  /* FAIL_ACTIVATE_PPT_PAGAMENTO_IN_CORSO end with 12 */
  const FAIL_ACTIVATE_PPT_PAGAMENTO_IN_CORSO = "302016723749670012";
  /* FAIL_ACTIVATE_PPT_STAZIONE_INT_PA_TIMEOUT end with 15 */
  const FAIL_ACTIVATE_PPT_STAZIONE_INT_PA_TIMEOUT = "302016723749670015";
  /* FAIL_ACTIVATE_PPT_DOMINIO_SCONOSCIUTO end with 11 */
  const FAIL_ACTIVATE_PPT_DOMINIO_SCONOSCIUTO = "302016723749670011";
  /* FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND end with 41 */
  const FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND = "302016723749670041";
  

  /**
   * Increase default test timeout (80000ms)
   * to support entire payment flow
    */
  jest.setTimeout(80000);
  jest.retryTimes(3);
  page.setDefaultNavigationTimeout(80000);
  page.setDefaultTimeout(80000)

  beforeAll(async () => {
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

  it("Should fail a payment VERIFY and get PPT_STAZIONE_INT_PA_SCONOSCIUTA", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PA_IRRAGGIUNGIBILE
     */
    const resultMessage = await verifyPaymentAndGetError(FAIL_VERIFY_PPT_STAZIONE_INT_PA_SCONOSCIUTA, VALID_FISCAL_CODE);

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_SCONOSCIUTA");
  });

  it("Should fail a payment VERIFY and get PPT_DOMINIO_SCONOSCIUTO", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PPT_DOMINIO_SCONOSCIUTO
     */
    const resultMessage = await verifyPaymentAndGetError(FAIL_VERIFY_PPT_DOMINIO_SCONOSCIUTO, VALID_FISCAL_CODE);

    expect(resultMessage).toContain("PPT_DOMINIO_SCONOSCIUTO");
  });

  it("Should fail a payment ACTIVATION and get PPT_PAGAMENTO_IN_CORSO", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get PPT_PAGAMENTO_IN_CORSO
     */
    const errorMessageXPath = '/html/body/div[7]/div[3]/div/h2/div'
    const resultMessage = await activatePaymentAndGetError(
      FAIL_ACTIVATE_PPT_PAGAMENTO_IN_CORSO,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      errorMessageXPath
    );

    expect(resultMessage).toContain("Il pagamento è già in corso");
  });

  it("Should fail a payment ACTIVATION and get PPT_STAZIONE_INT_PA_TIMEOUT", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get PPT_STAZIONE_INT_PA_TIMEOUT
     */
    const errorMessageXPath = 'html/body/div[9]/div[3]/div/div/div[2]/div[2]/div'
    const resultMessage = await activatePaymentAndGetError(
      FAIL_ACTIVATE_PPT_STAZIONE_INT_PA_TIMEOUT,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      errorMessageXPath
    );

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_TIMEOUT");
  });

  it("Should fail a payment ACTIVATION and get PPT_DOMINIO_SCONOSCIUTO", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get PPT_DOMINIO_SCONOSCIUTO
     */
    const errorMessageXPath = 'html/body/div[9]/div[3]/div/div/div[2]/div[2]/div'
    const resultMessage = await activatePaymentAndGetError(
      FAIL_ACTIVATE_PPT_DOMINIO_SCONOSCIUTO,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      errorMessageXPath
    );

    expect(resultMessage).toContain("PPT_DOMINIO_SCONOSCIUTO");
  });

  it("Should fail a payment AUTHORIZATION REQUEST and get FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND
     */                        
    const errorMessageXPath = '/html/body/div[6]/div[3]/div' 
    const resultMessage = await authorizePaymentAndGetError(
      FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      errorMessageXPath
    );

    expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
  });
});
