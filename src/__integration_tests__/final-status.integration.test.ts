import { payNotice, acceptCookiePolicy, verifyPaymentAndGetError, activatePaymentAndGetError, authorizePaymentAndGetError, checkPspDisclaimerBeforeAuthorizePayment, checkErrorOnCardDataFormSubmit, cancelPaymentOK, cancelPaymentAction, cancelPaymentKO } from "./utils/helpers";

describe("Final status mapping tests", () => {


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

   /* FINAL STATE MAPPING 30201672374<1 digit for send payment result outcome><1 digit for gateway><3 digits for gateway result><2 digits for status>*/
                                                              
const NOTIFICATION_REQUESTED_SEND_PAYMENT_RESULT_OK =         "302016723741000061"; //SUCCESS
const NOTIFICATION_REQUESTED_SEND_PAYMENT_RESULT_KO =         "302016723742000061"; //GENERIC_ERROR
const NOTIFICATION_REQUESTED_SEND_PAYMENT_RESULT_UNDEFINED =  "302016723740000061"; //GENERIC_ERROR
const NOTIFICATION_ERROR_SEND_PAYMENT_RESULT_OK =             "302016723741000062"; //SUCCESS
const NOTIFICATION_ERROR_SEND_PAYMENT_RESULT_KO =             "302016723742000062"; //GENERIC_ERROR
const NOTIFICATION_ERROR_SEND_PAYMENT_RESULT_UNDEFINED =      "302016723740000062"; //GENERIC_ERROR
const NOTIFIED_KO = "302016723740000063"; //GENERIC_ERROR
const REFUNDED = "302016723740000064"; //GENERIC_ERROR
const REFUND_REQUESTED = "302016723740000065"; //GENERIC_ERROR
const REFUND_ERROR = "302016723740000066"; //GENERIC_ERROR
const CLOSURE_ERROR = "302016723740000067"; //GENERIC_ERROR
const EXPIRED = "302016723741100068"; //GENERIC_ERROR
const EXPIRED_NOT_AUTHORIZED = "302016723740000069"; //TIMEOUT
const CANCELED = "302016723740000070"; //CANCELED_BY_USER
const CANCELLATION_EXPIRED = "302016723740000071"; //CANCELED_BY_USER
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

it("Should correctly execute a payment final status NOTIFICATION_REQUESTED - Send Payment Result OK", async () => {
  const resultMessage = await payNotice(
    NOTIFICATION_REQUESTED_SEND_PAYMENT_RESULT_OK,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Grazie, hai pagato");
});

it("Should fails - final status NOTIFICATION_REQUESTED - Send Payment Result KO", async () => {
  const resultMessage = await payNotice(
    NOTIFICATION_REQUESTED_SEND_PAYMENT_RESULT_KO,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status NOTIFICATION_REQUESTED - Send Payment Result Undefined", async () => {
  const resultMessage = await payNotice(
    NOTIFICATION_REQUESTED_SEND_PAYMENT_RESULT_UNDEFINED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should correctly execute a payment final status NOTIFICATION_ERROR - Send Payment Result OK", async () => {
  const resultMessage = await payNotice(
    NOTIFICATION_ERROR_SEND_PAYMENT_RESULT_OK,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Grazie, hai pagato");
});

it("Should fails - final status NOTIFICATION_ERROR - Send Payment Result KO", async () => {
  const resultMessage = await payNotice(
    NOTIFICATION_ERROR_SEND_PAYMENT_RESULT_KO,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status NOTIFICATION_ERROR - Send Payment Result Undefined", async () => {
  const resultMessage = await payNotice(
    NOTIFICATION_ERROR_SEND_PAYMENT_RESULT_UNDEFINED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status NOTIFIED_KO", async () => {
  const resultMessage = await payNotice(
    NOTIFIED_KO,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status REFUNDED", async () => {
  const resultMessage = await payNotice(
    REFUNDED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status REFUND_REQUESTED", async () => {
  const resultMessage = await payNotice(
    REFUND_REQUESTED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status REFUND_ERROR", async () => {
  const resultMessage = await payNotice(
    REFUND_ERROR,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status CLOSURE_ERROR", async () => {
  const resultMessage = await payNotice(
    CLOSURE_ERROR,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status EXPIRED", async () => {
  const resultMessage = await payNotice(
    EXPIRED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status EXPIRED_NOT_AUTHORIZED", async () => {
  const resultMessage = await payNotice(
    EXPIRED_NOT_AUTHORIZED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, la sessione è scaduta");
});

it("Should fails - final status CANCELED", async () => {
  const resultMessage = await payNotice(
    CANCELED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("L’operazione è stata annullata");
});

it("Should fails - final status CANCELED_BY_USER", async () => {
  const resultMessage = await payNotice(
    CANCELLATION_EXPIRED,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("L’operazione è stata annullata");
});

});
