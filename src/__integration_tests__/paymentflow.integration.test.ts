import {
  payNotice,
  verifyPaymentAndGetError,
  activatePaymentAndGetError,
  authorizePaymentAndGetError,
  checkPspDisclaimerBeforeAuthorizePayment,
  checkErrorOnCardDataFormSubmit,
  cancelPaymentOK,
  cancelPaymentAction,
  cancelPaymentKO,
  selectLanguage,
  fillAndSubmitCardDataForm,
  fillAndSubmitSatispayPayment,
  checkPspListNames,
  checkPspListFees,
} from "./utils/helpers";
import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";

/**
 * Test input and configuration
 */

const CHECKOUT_URL = `http://localhost:1234`;
const CHECKOUT_URL_AFTER_AUTHORIZATION = `http://localhost:1234/esito`;
const CHECKOUT_URL_PAYMENT_SUMMARY = `http://localhost:1234/riepilogo-pagamento`;
const CHECKOUT_URL_PSP_LIST = `http://localhost:1234/lista-psp`;
const VALID_FISCAL_CODE = "77777777777";
const EMAIL = "mario.rossi@email.com";
const VALID_CARD_DATA = {
  number: "4333334000098346",
  expirationDate: "1230",
  ccv: "123",
  holderName: "Mario Rossi",
};

/* VALID_NOTICE_CODE */
const VALID_NOTICE_CODE = "302016723749670000";
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
/* FAIL_ACTIVATE_502_PPT_PSP_SCONOSCIUTO end with 13 */
const FAIL_ACTIVATE_502_PPT_PSP_SCONOSCIUTO = "302016723749670013";
/* FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA end with 77 */
const FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA = "302016723749670077";
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
/* PSP_FAIL end with 76 */
const PSP_NOT_FOUND_FAIL = "302016723749670076";
/**
 * Increase default test timeout (120000ms)
 * to support entire payment flow
 */
jest.setTimeout(30000);
jest.retryTimes(3);
page.setDefaultNavigationTimeout(30000);
page.setDefaultTimeout(30000);

beforeAll(async () => {
  await page.goto(CHECKOUT_URL);
  await page.setViewport({ width: 1200, height: 907 });
});

beforeEach(async () => {
  await page.goto(CHECKOUT_URL);
});

describe("Checkout payment tests", () => {
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])("Should correctly execute a payment for language [%s]", async (lang, translation) => {
    /*
     * 1. Payment with valid notice code
    */
    selectLanguage(lang);
    const resultMessage = await payNotice(
      VALID_NOTICE_CODE,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      CHECKOUT_URL_AFTER_AUTHORIZATION
    );

    expect(resultMessage).toContain(translation.paymentResponsePage[0].title.replace("{{amount}}", "120,15\xa0€"));
  });
});

describe("Checkout payment verify failure tests", () => {
  it("Should fail a payment VERIFY and get FAIL_VERIFY_404_PPT_STAZIONE_INT_PA_SCONOSCIUTA", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get PPT_STAZIONE_INT_PA_SCONOSCIUTA
     * No need for testing other languages
     */
    const resultMessage = await verifyPaymentAndGetError(
      FAIL_VERIFY_404_PPT_STAZIONE_INT_PA_SCONOSCIUTA,
      VALID_FISCAL_CODE
    );

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_SCONOSCIUTA");
  });

  it("Should fail a payment VERIFY and get FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT
     * No need for testing other languages
     */
    const resultMessage = await verifyPaymentAndGetError(
      FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT,
      VALID_FISCAL_CODE
    );

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_TIMEOUT");
  });

  it("Should fail a payment VERIFY and get FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO", async () => {
    /*
     * 2. Payment with notice code that fails on verify and get FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO
     * No need for testing other languages
     */
    const resultMessage = await verifyPaymentAndGetError(
      FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO,
      VALID_FISCAL_CODE
    );

    expect(resultMessage).toContain("PPT_PSP_SCONOSCIUTO");
  });
});

describe("Checkout payment ongoing failure tests", () => {
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation],
  ])(
    "Should fail a payment ACTIVATION and get PPT_PAGAMENTO_IN_CORSO for language [%s]",
    async (lang, translation) => {
      /*
       * 2. Payment with notice code that fails on activation and get PPT_PAGAMENTO_IN_CORSO
       */
      selectLanguage(lang);
      const ErrorTitleID = "#iframeCardFormErrorTitleId";
      const resultMessage = await activatePaymentAndGetError(
        FAIL_ACTIVATE_PPT_PAGAMENTO_IN_CORSO,
        VALID_FISCAL_CODE,
        EMAIL,
        VALID_CARD_DATA,
        ErrorTitleID
      );

      expect(resultMessage).toContain(translation.PAYMENT_ONGOING.title);
    }
  );
});

describe("Checkout payment activation failure tests", () => {
  it("Should fail a payment ACTIVATION and get PPT_STAZIONE_INT_PA_TIMEOUT", async () => {
    /*
     * 2. Payment with notice code that fails on activation and get PPT_STAZIONE_INT_PA_TIMEOUT
     */
    const errorID = "#iframeCardFormErrorId";
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
    const errorID = "#iframeCardFormErrorId";
    const resultMessage = await activatePaymentAndGetError(
      FAIL_ACTIVATE_502_PPT_PSP_SCONOSCIUTO,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA,
      errorID
    );

    expect(resultMessage).toContain("PPT_PSP_SCONOSCIUTO");
  });

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])("Should fail a satispay payment ACTIVATION and get PPT_WISP_SESSIONE_SCONOSCIUTA", async (lang, translation) => {
    /*
     * Satispay payment with notice code that fails on activation and get PPT_WISP_SESSIONE_SCONOSCIUTA
     * and redirect to expired session page
     */
    selectLanguage(lang);
    await fillAndSubmitSatispayPayment(FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA, VALID_FISCAL_CODE, EMAIL);
    const titleElem = await page.waitForSelector("#sessionExpiredMessageTitle")
    const bodyElem = await page.waitForSelector("#sessionExpiredMessageBody")
    const title = await titleElem.evaluate((el) => el.textContent)
    const body = await bodyElem.evaluate((el) => el.textContent)

    expect(page.url()).toContain("/sessione-scaduta");
    expect(title).toContain(translation.paymentResponsePage[4].title);
    expect(body).toContain(translation.paymentResponsePage[4].body);
  });

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation]
  ])("Should fail a card payment ACTIVATION and get PPT_WISP_SESSIONE_SCONOSCIUTA", async (lang, translation) => {
    /*
     * Card payment with notice code that fails on activation and get PPT_WISP_SESSIONE_SCONOSCIUTA 
     * and redirect to expired session page
     */
    selectLanguage(lang);
    await fillAndSubmitCardDataForm(FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA, VALID_FISCAL_CODE, EMAIL, VALID_CARD_DATA);
    const titleElem = await page.waitForSelector("#sessionExpiredMessageTitle")
    const bodyElem = await page.waitForSelector("#sessionExpiredMessageBody")
    const title = await titleElem.evaluate((el) => el.textContent)
    const body = await bodyElem.evaluate((el) => el.textContent)

    expect(page.url()).toContain("/sessione-scaduta");
    expect(title).toContain(translation.paymentResponsePage[4].title);
    expect(body).toContain(translation.paymentResponsePage[4].body);
  });

  describe("Auth request failure tests", () => {
    it.each([
      ["it", itTranslation],
      ["en", enTranslation],
      ["fr", frTranslation],
      ["de", deTranslation],
      ["sl", slTranslation],
    ])(
      "Should fail a payment AUTHORIZATION REQUEST and get FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND for language [%s]",
      async (lang, translation) => {
        /*
         * 2. Payment with notice code that fails on activation and get FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND
         */
        selectLanguage(lang);
        const errorMessageTitleSelector = "#idTitleErrorModalPaymentCheckPage";
        const resultMessage = await authorizePaymentAndGetError(
          FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND,
          VALID_FISCAL_CODE,
          EMAIL,
          VALID_CARD_DATA,
          errorMessageTitleSelector
        );
        const closeErrorButton = await page.waitForSelector("#closeError");
        await closeErrorButton.click();
        await new Promise((r) => setTimeout(r, 1000));
        const paymentCheckPageButtonCancel = await page.waitForSelector("#paymentCheckPageButtonCancel");
        await paymentCheckPageButtonCancel.click();
        const cancPayment = await page.waitForSelector("#confirm", {visible: true});
        await cancPayment.click();
        await page.waitForNavigation();
        expect(resultMessage).toContain(translation.GENERIC_ERROR.title);
        //await cancelPaymentAction();
      }
    );
  });
});

describe("PSP disclaimer tests", () => {
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation],
  ])(
    "Should show up threshold disclaimer (why manage creditcard) for language [%s]",
    async (lang, translation) => {
      /*
       * Credit card manage psp
       */
      selectLanguage(lang);
      const resultMessage = await checkPspDisclaimerBeforeAuthorizePayment(
        PSP_ABOVETHRESHOLD,
        VALID_FISCAL_CODE,
        EMAIL,
        VALID_CARD_DATA
      );

      expect(resultMessage).toContain(
        translation.paymentCheckPage.disclaimer.yourCard
      );

      await cancelPaymentAction();
    }
  );

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation],
  ])(
    "Should show below threshold disclaimer (why is cheaper) for language [%s]",
    async (lang, translation) => {
      /*
       * Cheaper psp
       */
      selectLanguage(lang);
      const resultMessage = await checkPspDisclaimerBeforeAuthorizePayment(
        PSP_BELOWTHRESHOLD,
        VALID_FISCAL_CODE,
        EMAIL,
        VALID_CARD_DATA
      );

      expect(resultMessage).toContain(
        translation.paymentCheckPage.disclaimer.cheaper
      );

      await cancelPaymentAction();
    }
  );
});

describe("Checkout fails to calculate fee", () => {
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation],
  ])(
    "Should fails calculate fee for language [%s]",
    async (lang, translation) => {
      /*
       * Calculate fee fails
       */
      selectLanguage(lang);
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
      const errorDescriptionXpath =
        '//*[@id="root"]/div/main/div/div/div/div[1]/div[1]';
      const errorMessageElem = await page.waitForXPath(errorDescriptionXpath);
      const errorMessage = await errorMessageElem.evaluate(
        (el) => el.textContent
      );
      expect(errorMessage).toContain(translation.koPage.title);
    }
  );

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation],
  ])(
    "Should fails calculate fee with 404 for CARDS and language [%s]",
    async (lang, translation) => {
      /*
       * Calculate fee fails
       */
      selectLanguage(lang);

      await fillAndSubmitCardDataForm(
        PSP_NOT_FOUND_FAIL,
        VALID_FISCAL_CODE,
        EMAIL,
        VALID_CARD_DATA
      );

      const pspNotFoundTitleId = "#pspNotFoundTitleId";
      const pspNotFoundTitleElem = await page.waitForSelector(
        pspNotFoundTitleId
      );
      const pspNotFoundTitleText = await pspNotFoundTitleElem.evaluate(
        (el) => el.textContent
      );
      expect(pspNotFoundTitleText).toContain(translation.pspUnavailable.title);

      const pspNotFoundCtaId = "#pspNotFoundCtaId";
      const pspNotFoundCtaElem = await page.waitForSelector(pspNotFoundCtaId);
      const pspNotFoundCtaText = await pspNotFoundCtaElem.evaluate(
        (el) => el.textContent
      );
      expect(pspNotFoundCtaText).toContain(
        translation.pspUnavailable.cta.primary
      );

      const errorDescriptionId = "#pspNotFoundBodyId";
      const errorDescriptionElem = await page.waitForSelector(
        errorDescriptionId
      );
      const errorDescriptionText = await errorDescriptionElem.evaluate(
        (el) => el.textContent
      );
      expect(errorDescriptionText).toContain(translation.pspUnavailable.body);

      await pspNotFoundCtaElem.click();

      const currentUrl = await page.evaluate(() => location.href);
      expect(currentUrl).toContain("/scegli-metodo");
    }
  );

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation],
  ])(
    "Should fails calculate fee with 404 for SATISPAY and language [%s]",
    async (lang, translation) => {
      /*
       * Calculate fee fails
       */
      selectLanguage(lang);

      await fillAndSubmitSatispayPayment(
        PSP_NOT_FOUND_FAIL,
        VALID_FISCAL_CODE,
        EMAIL
      );

      const pspNotFoundTitleId = "#pspNotFoundTitleId";
      const pspNotFoundTitleElem = await page.waitForSelector(
        pspNotFoundTitleId
      );
      const pspNotFoundTitleText = await pspNotFoundTitleElem.evaluate(
        (el) => el.textContent
      );
      expect(pspNotFoundTitleText).toContain(translation.pspUnavailable.title);

      const pspNotFoundCtaId = "#pspNotFoundCtaId";
      const pspNotFoundCtaElem = await page.waitForSelector(pspNotFoundCtaId);
      const pspNotFoundCtaText = await pspNotFoundCtaElem.evaluate(
        (el) => el.textContent
      );
      expect(pspNotFoundCtaText).toContain(
        translation.pspUnavailable.cta.primary
      );

      const errorDescriptionId = "#pspNotFoundBodyId";
      const errorDescriptionElem = await page.waitForSelector(
        errorDescriptionId
      );
      const errorDescriptionText = await errorDescriptionElem.evaluate(
        (el) => el.textContent
      );
      expect(errorDescriptionText).toContain(translation.pspUnavailable.body);

      await pspNotFoundCtaElem.click();

      const currentUrl = await page.evaluate(() => location.href);
      expect(currentUrl).toContain("/scegli-metodo");
    }
  );
});

describe("Cancel payment tests", () => {
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation],
  ])(
    "Should correctly execute CANCEL PAYMENT by user for language [%s]",
    async (lang, translation) => {
      /*
       * Cancel payment OK
       */
      selectLanguage(lang);
      const resultMessage = await cancelPaymentOK(
        CANCEL_PAYMENT_OK,
        VALID_FISCAL_CODE,
        EMAIL,
        VALID_CARD_DATA
      );
      expect(resultMessage).toContain(translation.cancelledPage.body);
    }
  );
});

describe("Cancel payment failure tests (satispay)", () => {
  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation],
  ])(
    "Should fail a CANCEL PAYMENT by user for language [%s]",
    async (lang, translation) => {
      /*
       * Cancel payment KO
       */
      selectLanguage(lang);
      const resultMessage = await cancelPaymentKO(
        CANCEL_PAYMENT_KO,
        VALID_FISCAL_CODE,
        EMAIL
      );
      expect(resultMessage).toContain(translation.GENERIC_ERROR.title);
      const closeErrorButton = await page.waitForSelector("#closeError");
      await closeErrorButton.click();
    }
  );
});



describe("PSP list tests", () => {
  it("Should sort psp by fees", async () => {
    const resultMessage = await checkPspListFees(
      PSP_BELOWTHRESHOLD,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );

    expect(Array.isArray(resultMessage)).toBe(true);
    expect(resultMessage.length > 0).toBe(true);
    for (let i = 0; i < resultMessage.length - 1; i++) {
      expect(resultMessage[i]).toBeGreaterThanOrEqual(resultMessage[i + 1]);
    }
    await new Promise((r) => setTimeout(r, 500));
    await cancelPaymentAction();
  });

  it("Should sort psp by name", async () => {
    const resultMessage = await checkPspListNames(
      PSP_BELOWTHRESHOLD,
      VALID_FISCAL_CODE,
      EMAIL,
      VALID_CARD_DATA
    );

    expect(Array.isArray(resultMessage)).toBe(true);
    expect(resultMessage.length > 0).toBe(true);
    for (let i = 0; i < resultMessage.length - 1; i++) {
      expect(resultMessage[i].localeCompare(resultMessage[i + 1])).toBeGreaterThanOrEqual(0);
    }
    await new Promise((r) => setTimeout(r, 500));
    await cancelPaymentAction();
  });
});


describe("Checkout Payment - PSP Selection Flow", () => {
    it("Should fill form, select PSP, and proceed with payment (IT)", async () => {
        selectLanguage("it");

        await fillAndSubmitCardDataForm(VALID_NOTICE_CODE, VALID_FISCAL_CODE, EMAIL, VALID_CARD_DATA);

        const radioButtonsSelector = 'svg[data-testid="RadioButtonUncheckedIcon"]';
        await page.waitForSelector(radioButtonsSelector);

        const radioButtons = await page.$$(radioButtonsSelector);
        expect(radioButtons.length).toBeGreaterThan(0);
        expect(await page.url()).toContain(CHECKOUT_URL_PSP_LIST);

        await radioButtons[0].click();

        const continueBtnSelector = "#paymentPspListPageButtonContinue";
        await page.waitForSelector(continueBtnSelector, { visible: true });
        await page.click(continueBtnSelector);

        expect(await page.url()).toContain(CHECKOUT_URL_PAYMENT_SUMMARY);
    });

    it("Should mock PSP list with one PSP and proceed with selection", async () => {
        selectLanguage("it");

        await page.setRequestInterception(true);

        page.on('request', request => {
            if (request.isInterceptResolutionHandled()) return;
            const url = request.url();

            if (url.includes('/ecommerce/checkout/v2/payment-methods/') && url.includes('/fees')) {
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        asset: "https://assets.cdn.platform.pagopa.it/creditcard/generic.png",
                        belowThreshold: true,
                        brandAssets: {
                            AMEX: "https://assets.cdn.platform.pagopa.it/creditcard/amex.png",
                            DINERS: "https://assets.cdn.platform.pagopa.it/creditcard/diners.png",
                            MAESTRO: "https://assets.cdn.platform.pagopa.it/creditcard/maestro.png",
                            MASTERCARD: "https://assets.cdn.platform.pagopa.it/creditcard/mastercard.png",
                            MC: "https://assets.cdn.platform.pagopa.it/creditcard/mastercard.png",
                            VISA: "https://assets.cdn.platform.pagopa.it/creditcard/visa.png"
                        },
                        bundles: [
                            {
                                abi: "33111",
                                bundleDescription: "Pagamenti con carte",
                                bundleName: "Worldline Merchant Services Italia S.p.A.",
                                idBrokerPsp: "05963231005",
                                idBundle: "98d24e9a-ab8b-48e3-ae84-f0c16c64db3b",
                                idChannel: "05963231005_01",
                                idPsp: "BNLIITRR",
                                onUs: true,
                                paymentMethod: "CP",
                                pspBusinessName: "Worldline Merchant Services Italia S.p.A.",
                                taxPayerFee: 15,
                                touchpoint: "CHECKOUT"
                            },
                        ],
                        paymentMethodDescription: "payment method description (v2)",
                        paymentMethodName: "test",
                        paymentMethodStatus: "ENABLED"
                    }),
                });
            } else {
                request.continue();
            }
        });

        await fillAndSubmitCardDataForm(
            VALID_NOTICE_CODE,
            VALID_FISCAL_CODE,
            EMAIL,
            VALID_CARD_DATA
        );
        await page.waitForNavigation(); // for CHECKOUT_URL_PSP_LIST
        // (auto redirect for finding only one psp)
        await page.waitForNavigation(); // for CHECKOUT_URL_PAYMENT_SUMMARY

        expect(await page.url()).toContain(CHECKOUT_URL_PAYMENT_SUMMARY);
    });

});
