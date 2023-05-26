import { payNotice, acceptCookiePolicy, verifyPaymentAndGetError, activatePaymentAndGetError, authorizePaymentAndGetError, checkPspDisclaimerBeforeAuthorizePayment, checkErrorOnCardDataFormSubmit, cancelPaymentOK, cancelPaymentAction, cancelPaymentKO } from "./utils/helpers";

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
    const ErrorTitleID = '#inputCardPageErrorTitleId'
    const resultMessage = await activatePaymentAndGetError(
      FAIL_ACTIVATE_PPT_PAGAMENTO_IN_CORSO,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      ErrorTitleID
    );

    expect(resultMessage).toContain("Il pagamento è già in corso");
  });

  it("Should fail a payment ACTIVATION and get PPT_STAZIONE_INT_PA_TIMEOUT", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get PPT_STAZIONE_INT_PA_TIMEOUT
     */
    const errorID = '#inputCardPageErrorId'
    const resultMessage = await activatePaymentAndGetError(
      FAIL_ACTIVATE_PPT_STAZIONE_INT_PA_TIMEOUT,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      errorID
    );

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_TIMEOUT");
  });

  it("Should fail a payment ACTIVATION and get PPT_DOMINIO_SCONOSCIUTO", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get PPT_DOMINIO_SCONOSCIUTO
     */
    const errorID = '#inputCardPageErrorId'
    const resultMessage = await activatePaymentAndGetError(
      FAIL_ACTIVATE_PPT_DOMINIO_SCONOSCIUTO,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      errorID
    );

    expect(resultMessage).toContain("PPT_DOMINIO_SCONOSCIUTO");
  });

  xit("Should fail a payment AUTHORIZATION REQUEST and get FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND", async () => {
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

    expect(resultMessage).toContain("Perché gestisce la tua carta");

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

    expect(resultMessage).toContain("Suggerito perché il più economico");

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
    expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
  });

  it("SShould correctly execute CANCEL PAYMENT by user", async () => {
    /*
     * Cancel payment OK
    */
    const resultMessage = await cancelPaymentOK(
      CANCEL_PAYMENT_OK,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );
    expect(resultMessage).toContain("L'operazione è stata annullata");
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
    expect(resultMessage).toContain("Spiacenti, si è verificato un errore imprevisto");
  });


/* FINAL STATE MAPPING 30201672374<1 cipher for send payment result outcome><1 cipher for gateway><3 ciphers for gateway result><2 ciphers for status>*/
                                                              
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

const UNATHORIZED = "302016723740000072";

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

});
