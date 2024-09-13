import { payNotice, verifyPaymentAndGetError, activatePaymentAndGetError, authorizePaymentAndGetError, checkPspDisclaimerBeforeAuthorizePayment, checkErrorOnCardDataFormSubmit, cancelPaymentOK, cancelPaymentAction, cancelPaymentKO, selectLanguage } from "./utils/helpers";
import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";

describe.each([
  ["it", itTranslation],
  ["en", enTranslation],
  ["fr", frTranslation],
  ["de", deTranslation],
  ["sl", slTranslation]
])("Checkout payment activation tests for [%s] language", (lang, translation) => {
/**
   * Test input and configuration
*/
  
const CHECKOUT_URL = `http://localhost:1234`;
const CHECKOUT_URL_AFTER_AUTHORIZATION = `http://localhost:1234/esito`;
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
/* FAIL_VERIFY_404_PPT_STAZIONE_INT_PA_SCONOSCIUTA end with 04 */
const FAIL_VERIFY_404_PPT_STAZIONE_INT_PA_SCONOSCIUTA = "302016723749670004";
/* FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT end with 08 */
const FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT = "302016723749670008";
/* FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO end with 06 */
const FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO = "302016723749670006";
/* FAIL_ACTIVATE_PPT_PAGAMENTO_IN_CORSO end with 12 */
const FAIL_ACTIVATE_PPT_PAGAMENTO_IN_CORSO = "302016723749670012";
/* FAIL_ACTIVATE_PPT_STAZIONE_INT_PA_TIMEOUT end with 15 */
const FAIL_ACTIVATE_PPT_STAZIONE_INT_PA_TIMEOUT = "302016723749670015";
/* FAIL_ACTIVATE_502_PPT_PSP_SCONOSCIUTO end with 11 */
const FAIL_ACTIVATE_502_PPT_PSP_SCONOSCIUTO = "302016723749670013";
/* FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND end with 41 */
const FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND = "302016723749670041";
/* PSP_UPTHRESHOLD end with 55 */
const PSP_ABOVETHRESHOLD = "302016723749670055";
/* PSP_BELOWTHRESHOLD end with 56 */
const PSP_BELOWTHRESHOLD = "302016723749670056";
/* PSP_FAIL end with 57 */
const PSP_FAIL = "302016723749670057";
/* CANCEL_PAYMENT SUCCESS end with 58 */
const CANCEL_PAYMENT_OK = "302016723749670058";
/* CANCEL_PAYMENT_FAIL end with 59 */
const CANCEL_PAYMENT_KO = "302016723749670059";

  /**
   * Increase default test timeout (120000ms)
   * to support entire payment flow
    */
  jest.setTimeout(120000);
  jest.retryTimes(3);
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(120000);

  beforeAll(async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
  });

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
    selectLanguage(lang);
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

    expect(resultMessage).toContain(translation.paymentResponsePage[0].title.replace("{{amount}}", "120,10\xa0€"));
  });

  it("Should fail a payment VERIFY and get FAIL_VERIFY_404_PPT_STAZIONE_INT_PA_SCONOSCIUTA", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PPT_STAZIONE_INT_PA_SCONOSCIUTA
     */
    const resultMessage = await verifyPaymentAndGetError(FAIL_VERIFY_404_PPT_STAZIONE_INT_PA_SCONOSCIUTA, VALID_FISCAL_CODE);

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_SCONOSCIUTA");
  });

  it("Should fail a payment VERIFY and get FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT
     */
    const resultMessage = await verifyPaymentAndGetError(FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT, VALID_FISCAL_CODE);

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_TIMEOUT");
  });

  it("Should fail a payment VERIFY and get FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO
     */
    const resultMessage = await verifyPaymentAndGetError(FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO, VALID_FISCAL_CODE);

    expect(resultMessage).toContain("PPT_PSP_SCONOSCIUTO");
  });

  it("Should fail a payment ACTIVATION and get PPT_PAGAMENTO_IN_CORSO", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get PPT_PAGAMENTO_IN_CORSO
     */
    const ErrorTitleID = '#iframeCardFormErrorTitleId'
    const resultMessage = await activatePaymentAndGetError(
      FAIL_ACTIVATE_PPT_PAGAMENTO_IN_CORSO,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      ErrorTitleID
    );

    expect(resultMessage).toContain(translation.PAYMENT_ONGOING.title);
  });

  it("Should fail a payment ACTIVATION and get PPT_STAZIONE_INT_PA_TIMEOUT", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get PPT_STAZIONE_INT_PA_TIMEOUT
     */
    const errorID = '#iframeCardFormErrorId'
    const resultMessage = await activatePaymentAndGetError(
      FAIL_ACTIVATE_PPT_STAZIONE_INT_PA_TIMEOUT,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      errorID
    );

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_TIMEOUT");
  });

  it("Should fail a payment ACTIVATION and get PPT_PSP_SCONOSCIUTO", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get PPT_PSP_SCONOSCIUTO
     */
    const errorID = '#iframeCardFormErrorId'
    const resultMessage = await activatePaymentAndGetError(
      FAIL_ACTIVATE_502_PPT_PSP_SCONOSCIUTO,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      errorID
    );

    expect(resultMessage).toContain("PPT_PSP_SCONOSCIUTO");
  });

  xit("Should fail a payment AUTHORIZATION REQUEST and get FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND
     */                        
    const errorMessageTitleSelector = '#idTitleErrorModalPaymentCheckPage' 
    const resultMessage = await authorizePaymentAndGetError(
      FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      errorMessageTitleSelector
    );

    expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
  });

  it("Should show up threshold disclaimer (why manage creditcard)", async () => {
    /*
     * Credit card manage psp
    */
    const resultMessage = await checkPspDisclaimerBeforeAuthorizePayment(
      PSP_ABOVETHRESHOLD,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );

    expect(resultMessage).toContain(translation.paymentCheckPage.disclaimer.yourCard);

    await cancelPaymentAction();
  });

  it("Should show below threshold disclaimer (why is cheaper)", async () => {
    /*
     * Cheaper psp
    */
    const resultMessage = await checkPspDisclaimerBeforeAuthorizePayment(
      PSP_BELOWTHRESHOLD,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );

    console.log(resultMessage);
    expect(resultMessage).toContain(translation.paymentCheckPage.disclaimer.cheaper);

    await cancelPaymentAction();
  });

  it("Should fails calculate fee", async () => {
    /*
     * Calculate fee fails
    */
    const resultMessage = await checkErrorOnCardDataFormSubmit(
      PSP_FAIL,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );
    expect(resultMessage).toContain(translation.GENERIC_ERROR.title);
    const closeErrorModalButton = "#closeError";
    await page.waitForSelector(closeErrorModalButton);
    await page.click(closeErrorModalButton);
    const errorDescriptionXpath = "//*[@id=\"root\"]/div/div[2]/div/div/div/div[1]/div[1]";
    const errorMessageElem = await page.waitForXPath(errorDescriptionXpath);
    const errorMessage = await errorMessageElem.evaluate((el) => el.textContent)
    expect(errorMessage).toContain(translation.koPage.title);

  });

  it("Should correctly execute CANCEL PAYMENT by user", async () => {
    /*
     * Cancel payment OK
    */
    const resultMessage = await cancelPaymentOK(
      CANCEL_PAYMENT_OK,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );
    expect(resultMessage).toContain(translation.cancelledPage.body);
  });

  it("Should fail a CANCEL PAYMENT by user", async () => {
    /*
     * Cancel payment KO
    */
    const resultMessage = await cancelPaymentKO(
      CANCEL_PAYMENT_KO,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );
    expect(resultMessage).toContain(translation.GENERIC_ERROR.title);
  });

});
