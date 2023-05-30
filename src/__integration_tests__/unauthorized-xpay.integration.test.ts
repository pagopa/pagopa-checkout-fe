import { payNotice, acceptCookiePolicy, verifyPaymentAndGetError, activatePaymentAndGetError, authorizePaymentAndGetError, checkPspDisclaimerBeforeAuthorizePayment, checkErrorOnCardDataFormSubmit, cancelPaymentOK, cancelPaymentAction, cancelPaymentKO } from "./utils/helpers";

describe("Unauthorized final status mapping tests", () => {

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


  const UNATHORIZED_XPAY = "302016723740100072";
  const UNATHORIZED_XPAY_INVALID_CARD_22 = "302016723740102272";
const UNATHORIZED_XPAY_EXPIRED_CARD_14 = "302016723740101472";
const UNATHORIZED_XPAY_ECARD_BRAND_NOT_PERMITTED_15 = "302016723740101572";

const UNATHORIZED_XPAY_DUPLICATE_TRANSACTION_9 = "302016723740100972";
const UNATHORIZED_XPAY_FORBIDDEN_OPERATION_99 = "302016723740109972";
const UNATHORIZED_XPAY_UNAVAILABLE_METHOD_98 = "302016723740109872";
const UNATHORIZED_XPAY_KO_RETRIABLE_96 = "302016723740109672";
const UNATHORIZED_XPAY_INTERNAL_ERROR_100 = "302016723740110072";
const UNATHORIZED_XPAY_INVALID_STATUS_16 = "302016723740101672";

const UNATHORIZED_XPAY_CANCELED_3DS_AUTH_20 = "302016723740102072";

  /**
   * Increase default test timeout (80000ms)
   * to support entire payment flow
    */
  jest.setTimeout(120000);
  jest.retryTimes(3);
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(120000);

  beforeAll(async () => {
    await page.goto(CHECKOUT_URL);
    await page.setViewport({ width: 1200, height: 907 });
    await acceptCookiePolicy();
  })

  beforeEach(async () => {
    await page.goto(CHECKOUT_URL);
  });
  
it("Should fails - final status UNATHORIZED with XPAY error code INVALID_CARD 22", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY_INVALID_CARD_22,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("C’è un problema con la tua carta");
});

it("Should fails - final status UNATHORIZED with XPAY error code EXPIRED_CARD 14", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY_EXPIRED_CARD_14,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("C’è un problema con la tua carta");
});

it("Should fails - final status UNATHORIZED with XPAY error code ECARD_BRAND_NOT_PERMITTED 15", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY_ECARD_BRAND_NOT_PERMITTED_15,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("C’è un problema con la tua carta");
});

it("Should fails - final status UNATHORIZED with XPAY error code DUPLICATE_TRANSACTION 9", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY_DUPLICATE_TRANSACTION_9,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with XPAY error code FORBIDDEN_OPERATION 99", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY_FORBIDDEN_OPERATION_99,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with XPAY error code INTERNAL_ERROR 100", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY_INTERNAL_ERROR_100,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with XPAY error code KO_RETRIABLE 96", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY_KO_RETRIABLE_96,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with XPAY error code UNAVAILABLE_METHOD 98", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY_UNAVAILABLE_METHOD_98,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with XPAY error code INVALID_STATUS 16", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY_INVALID_STATUS_16,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with XPAY error code CANCELED_3DS_AUTH 20", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY_CANCELED_3DS_AUTH_20,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("L’operazione è stata annullata");
});

it("Should fails - final status UNATHORIZED with XPAY no error code provided", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_XPAY,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

});
