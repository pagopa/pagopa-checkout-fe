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

const UNATHORIZED_VPOS = "302016723740200072";
const UNATHORIZED_VPOS_TIMEOUT_21 = "302016723740202172";
const UNATHORIZED_VPOS_REQREFNUM_INVALID_02 = "302016723740200272";
const UNATHORIZED_VPOS_INCORRECT_FORMAT_03 = "302016723740200372";
const UNATHORIZED_VPOS_INCORRECT_MAC_OR_TIMESTAMP_04 = "302016723740200472";
const UNATHORIZED_VPOS_INCORRECT_DATE_05 = "302016723740200572";
const UNATHORIZED_VPOS_TRANSACTION_ID_NOT_CONSISTENT_09 = "302016723740200972";
const UNATHORIZED_VPOS_UNSUPPORTED_CURRENCY_16 = "302016723740201672";
const UNATHORIZED_VPOS_UNSUPPORTED_EXPONENT_17 = "302016723740201772";
const UNATHORIZED_VPOS_INVALID_PAN_38 = "302016723740203872";
const UNATHORIZED_VPOS_XML_NOT_PARSABLE_41 = "302016723740204172";
const UNATHORIZED_VPOS_INSTALLMENT_NUMBER_OUT_OF_BOUNDS_51 = "302016723740205172";

const UNATHORIZED_VPOS_MISSING_CVV2_37 = "302016723740203772";
const UNATHORIZED_VPOS_XML_EMPTY_40 = "302016723740204072";
const UNATHORIZED_VPOS_TRANSACTION_ID_NOT_FOUND_07 = "302016723740200772";
const UNATHORIZED_VPOS_CIRCUIT_DISABLED_12 = "302016723740201272";
const UNATHORIZED_VPOS_INSTALLMENTS_NOT_AVAILABLE_50 = "302016723740205072";
const UNATHORIZED_VPOS_OPERATOR_NOT_FOUND_08 = "302016723740200872";
const UNATHORIZED_VPOS_ORDER_OR_REQREFNUM_NOT_FOUND_01 = "302016723740200172";
const UNATHORIZED_VPOS_DUPLICATED_ORDER_13 = "302016723740201372";
const UNATHORIZED_VPOS_UNKNOWN_ERROR_06 = "302016723740200672";
const UNATHORIZED_VPOS_APPLICATION_ERROR_98 = "302016723740209872";
const UNATHORIZED_VPOS_REDIRECTION_3DS1_20 = "302016723740202072";
const UNATHORIZED_VPOS_METHOD_REQUESTED_25 = "302016723740202572";
const UNATHORIZED_VPOS_CHALLENGE_REQUESTED_26 = "302016723740202672";
const UNATHORIZED_VPOS_INCORRECT_STATUS_11 = "302016723740201172";

const UNATHORIZED_VPOS_TRANSACTION_FAILED_99 = "302016723740209972";

const UNATHORIZED_VPOS_EXCEEDING_AMOUNT_10 = "302016723740201072";

const UNATHORIZED_VPOS_PAYMENT_INSTRUMENT_NOT_ACCEPTED_35 = "302016723740203572";

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


it("Should fails - final status UNATHORIZED with VPOS error code TIMEOUT 21", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_TIMEOUT_21,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, la sessione è scaduta");
});
it("Should fails - final status UNATHORIZED with VPOS error code INCORRECT_FORMAT 03", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_INCORRECT_FORMAT_03,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it("Should fails - final status UNATHORIZED with VPOS error code REQREFNUM_INVALID 02", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_REQREFNUM_INVALID_02,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it("Should fails - final status UNATHORIZED with VPOS error code INCORRECT_MAC_OR_TIMESTAMP 04", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_INCORRECT_MAC_OR_TIMESTAMP_04,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it("Should fails - final status UNATHORIZED with VPOS error code INCORRECT_DATE 05", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_INCORRECT_DATE_05,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it("Should fails - final status UNATHORIZED with VPOS error code TRANSACTION_ID_NOT_CONSISTENT 09", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_TRANSACTION_ID_NOT_CONSISTENT_09,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it("Should fails - final status UNATHORIZED with VPOS error code UNSUPPORTED_CURRENCY 16", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_UNSUPPORTED_CURRENCY_16,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it("Should fails - final status UNATHORIZED with VPOS error code UNSUPPORTED_EXPONENT 17", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_UNSUPPORTED_EXPONENT_17,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});
it("Should fails - final status UNATHORIZED with VPOS error code INVALID_PAN 38", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_INVALID_PAN_38,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});
it("Should fails - final status UNATHORIZED with VPOS error code XML_NOT_PARSABLE 41", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_XML_NOT_PARSABLE_41,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it("Should fails - final status UNATHORIZED with VPOS error code INSTALLMENT_NUMBER_OUT_OF_BOUNDS 51", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_INSTALLMENT_NUMBER_OUT_OF_BOUNDS_51,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("I dati della carta non risultano corretti");
});

it("Should fails - final status UNATHORIZED with VPOS error code MISSING_CVV2 37", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_MISSING_CVV2_37,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code XML_EMPTY 40", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_XML_EMPTY_40,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code TRANSACTION_ID_NOT_FOUND 07", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_TRANSACTION_ID_NOT_FOUND_07,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code CIRCUIT_DISABLED 12", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_CIRCUIT_DISABLED_12,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code INSTALLMENTS_NOT_AVAILABLE 50", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_INSTALLMENTS_NOT_AVAILABLE_50,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code OPERATOR_NOT_FOUND 08", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_OPERATOR_NOT_FOUND_08,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code ORDER_OR_REQREFNUM_NOT_FOUND 01", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_ORDER_OR_REQREFNUM_NOT_FOUND_01,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code DUPLICATED_ORDER 13", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_DUPLICATED_ORDER_13,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code UNKNOWN_ERROR 06", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_UNKNOWN_ERROR_06,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code APPLICATION_ERROR 98", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_APPLICATION_ERROR_98,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code REDIRECTION_3DS1 20", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_REDIRECTION_3DS1_20,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code METHOD_REQUESTED 25", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_METHOD_REQUESTED_25,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code CHALLENGE_REQUESTED 26", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_CHALLENGE_REQUESTED_26,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code INCORRECT_STATUS 11", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_INCORRECT_STATUS_11,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

it("Should fails - final status UNATHORIZED with VPOS error code TRANSACTION_FAILED 99", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_TRANSACTION_FAILED_99,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it("Should fails - final status UNATHORIZED with VPOS error code EXCEEDING_AMOUNT 10", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_EXCEEDING_AMOUNT_10,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Autorizzazione negata");
});

it("Should fails - final status UNATHORIZED with VPOS error code PAYMENT_INSTRUMENT_NOT_ACCEPTED 35", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS_PAYMENT_INSTRUMENT_NOT_ACCEPTED_35,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("C’è un problema con la tua carta");
});

it("Should fails - final status UNATHORIZED with VPOS no error code provided", async () => {
  const resultMessage = await payNotice(
    UNATHORIZED_VPOS,
    VALID_FISCAL_CODE,
    EMAIL,
    VALID_CARD_DATA,
    CHECKOUT_URL_AFTER_AUTHORIZATION
  );

  expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
});

});
