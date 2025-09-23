import {
  verifyPaymentAndGetError,
  activatePaymentAndGetError,
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
  fillAndSearchFormPaymentMethod,
  verifyPaymentMethodsLength,
  verifyPaymentMethodsContains,
  noPaymentMethodsMessage,
  filterPaymentMethodByName,
  goToPaymentMethodsPage,
  activateApmPaymentAndGetError,
  authorizeApmPaymentAndGetError
} from "./utils/helpers";
import itTranslation from "../translations/it/translations.json";
import deTranslation from "../translations/de/translations.json";
import enTranslation from "../translations/en/translations.json";
import frTranslation from "../translations/fr/translations.json";
import slTranslation from "../translations/sl/translations.json";
import { URL, KORPTIDs, OKPaymentInfo  } from "./utils/testConstants";
/**
 * Increase default test timeout (120000ms)
 * to support entire payment flow
 */

const RETRY_CODE = "302016723749670500";
const OUTCOME_FISCAL_CODE_SUCCESS = "77777777000";
jest.setTimeout(80000);
jest.retryTimes(0);
page.setDefaultNavigationTimeout(40000);
page.setDefaultTimeout(40000);

beforeAll(async () => {
  await page.goto(URL.CHECKOUT_URL, { waitUntil: "networkidle0" });
  await page.setViewport({ width: 1200, height: 907 });
});

beforeEach(async () => {
  await page.goto(URL.CHECKOUT_URL, { waitUntil: "networkidle0" });
});

afterEach(async () => {
  await page.evaluate(() => {
    window.onbeforeunload = null;
  });
});


describe("Checkout payment verify failure tests", () => {
  it("Should fail a payment VERIFY and get FAIL_VERIFY_404_PPT_STAZIONE_INT_PA_SCONOSCIUTA", async () => {
    const resultMessage = await verifyPaymentAndGetError(
      KORPTIDs.FAIL_VERIFY_404_PPT_STAZIONE_INT_PA_SCONOSCIUTA,
      OKPaymentInfo.VALID_FISCAL_CODE
    );

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_SCONOSCIUTA");
  });

  it("Should fail a payment VERIFY and get FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT", async () => {
    const resultMessage = await verifyPaymentAndGetError(
      KORPTIDs.FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT,
      OKPaymentInfo.VALID_FISCAL_CODE
    );

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_TIMEOUT");
  });

  it("Should fail a payment VERIFY and get FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO", async () => {
    const resultMessage = await verifyPaymentAndGetError(
      KORPTIDs.FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO,
      OKPaymentInfo.VALID_FISCAL_CODE
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
      selectLanguage(lang);
      const ErrorTitleID = "#iframeCardFormErrorTitleId";
      const resultMessage = await activatePaymentAndGetError(
        KORPTIDs.FAIL_ACTIVATE_PPT_PAGAMENTO_IN_CORSO,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA,
        ErrorTitleID
      );

      expect(resultMessage).toContain(translation.PAYMENT_ONGOING.title);
    }
  );
});

describe("Checkout payment activation failure tests", () => {
  it("Should fail a payment ACTIVATION and get PPT_STAZIONE_INT_PA_TIMEOUT", async () => {
    const errorID = "#iframeCardFormErrorId";
    const resultMessage = await activatePaymentAndGetError(
      KORPTIDs.FAIL_ACTIVATE_PPT_STAZIONE_INT_PA_TIMEOUT,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA,
      errorID
    );

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_TIMEOUT");
  });

  it("Should fail a payment ACTIVATION and get PPT_PSP_SCONOSCIUTO", async () => {
    const errorID = "#iframeCardFormErrorId";
    const resultMessage = await activateApmPaymentAndGetError(
      KORPTIDs.FAIL_ACTIVATE_502_PPT_PSP_SCONOSCIUTO,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
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
    selectLanguage(lang);
    await fillAndSubmitSatispayPayment(KORPTIDs.FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA, OKPaymentInfo.VALID_FISCAL_CODE, OKPaymentInfo.EMAIL);
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
    selectLanguage(lang);
    await fillAndSubmitSatispayPayment(KORPTIDs.FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA, OKPaymentInfo.VALID_FISCAL_CODE, OKPaymentInfo.EMAIL);
    const titleElem = await page.waitForSelector("#sessionExpiredMessageTitle")
    const bodyElem = await page.waitForSelector("#sessionExpiredMessageBody")
    const title = await titleElem.evaluate((el) => el.textContent)
    const body = await bodyElem.evaluate((el) => el.textContent)

    expect(page.url()).toContain("/sessione-scaduta");
    expect(title).toContain(translation.paymentResponsePage[4].title);
    expect(body).toContain(translation.paymentResponsePage[4].body);
  });
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
      selectLanguage(lang);
      const errorMessageTitleSelector = "#idTitleErrorModalPaymentCheckPage";
      const resultMessage = await authorizeApmPaymentAndGetError(
        KORPTIDs.FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        "SATY",
        errorMessageTitleSelector
      );
      const closeErrorButton = await page.waitForSelector("#closeError");
      await closeErrorButton.click();
      await new Promise((r) => setTimeout(r, 1000));
      const paymentCheckPageButtonCancel = await page.waitForSelector("#paymentCheckPageButtonCancel");
      await paymentCheckPageButtonCancel.click();
      const cancPayment = await page.waitForSelector("#confirm", {visible: true});
      await cancPayment.click();
      await page.waitForSelector("#redirect-button");
      expect(resultMessage).toContain(translation.GENERIC_ERROR.title);
      //await cancelPaymentAction();
    }
  );
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
      selectLanguage(lang);
      const resultMessage = await checkPspDisclaimerBeforeAuthorizePayment(
        KORPTIDs.PSP_ABOVETHRESHOLD,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA
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
      selectLanguage(lang);
      const resultMessage = await checkPspDisclaimerBeforeAuthorizePayment(
        KORPTIDs.PSP_BELOWTHRESHOLD,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA
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
      selectLanguage(lang);
      const resultMessage = await checkErrorOnCardDataFormSubmit(
        KORPTIDs.PSP_FAIL,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA
      );
      expect(resultMessage).toContain(translation.GENERIC_ERROR.title);
      const closeErrorModalButton = "#closeError";
      await page.waitForSelector(closeErrorModalButton);
      await page.click(closeErrorModalButton);

      const errorMessageElem = await page.waitForSelector("#koPageTitle");
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
      selectLanguage(lang);

      await fillAndSubmitCardDataForm(
        KORPTIDs.PSP_NOT_FOUND_FAIL,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA
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
      selectLanguage(lang);

      await fillAndSubmitSatispayPayment(
        KORPTIDs.PSP_NOT_FOUND_FAIL,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL
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
      selectLanguage(lang);
      const resultMessage = await cancelPaymentOK(
        KORPTIDs.CANCEL_PAYMENT_OK,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA
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
      selectLanguage(lang);
      const resultMessage = await cancelPaymentKO(
        KORPTIDs.CANCEL_PAYMENT_KO,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL
      );
      expect(resultMessage).toContain(translation.GENERIC_ERROR.title);
      const closeErrorButton = await page.waitForSelector("#closeError");
      await closeErrorButton.click();
    }
  );
});

describe("Filter payment method", () => {
    it.each([
        [true, "v2/v4 APIs"],
        [false, "v1/v3 APIs"]
    ])("Filter payment method with enablePaymentMethodsHandler=%s (%s)", async (enableFlag, description) => {
        // print feature flag value
        console.log(`Testing with enablePaymentMethodsHandler=${enableFlag} - ${description}`);

        // set feature flag before first page load
        await page.evaluateOnNewDocument((flag) => {
            localStorage.setItem('enablePaymentMethodsHandler', flag.toString());
        }, enableFlag);

        // reload page to ensure feature flag is applied
        await page.goto(URL.CHECKOUT_URL, { waitUntil: "networkidle0" });

        selectLanguage("it");
        await fillAndSearchFormPaymentMethod(
          KORPTIDs.CANCEL_PAYMENT_OK,
            OKPaymentInfo.VALID_FISCAL_CODE,
            OKPaymentInfo.EMAIL,
            "cart"
        );
        const isOnlyOnePaymentMethods = await verifyPaymentMethodsLength(1);
        const isOnlyCardPaymentMethods = await verifyPaymentMethodsContains("CP");
        expect(isOnlyOnePaymentMethods).toBeTruthy()
        expect(isOnlyCardPaymentMethods).toBeTruthy()

        const paymentMethodFilterBoxReset = await page.waitForSelector("#clearFilterPaymentMethod");
        await paymentMethodFilterBoxReset?.click();

        const isMoreThanOnePaymentMethods = await verifyPaymentMethodsLength(7);
        const isCardPaymentMethodsPresent = await verifyPaymentMethodsContains("CP");
        const isSatispayPaymentMethodsPresent = await verifyPaymentMethodsContains("SATY");

        expect(isMoreThanOnePaymentMethods).toBeTruthy();
        expect(isCardPaymentMethodsPresent).toBeTruthy();
        expect(isSatispayPaymentMethodsPresent).toBeTruthy();

        await filterPaymentMethodByName("carta");

        const paymentMethodsFilteredOutMessage = await noPaymentMethodsMessage();
        expect(paymentMethodsFilteredOutMessage).toContain(itTranslation.paymentChoicePage.noPaymentMethodsAvailable);
      });
});

describe("PSP list tests", () => {
  it("Should sort psp by fees", async () => {
    const resultMessage = await checkPspListFees(
      KORPTIDs.PSP_BELOWTHRESHOLD,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA
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
      KORPTIDs.PSP_BELOWTHRESHOLD,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA
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
        await fillAndSubmitCardDataForm(OKPaymentInfo.VALID_NOTICE_CODE, OKPaymentInfo.VALID_FISCAL_CODE, OKPaymentInfo.EMAIL, OKPaymentInfo.VALID_CARD_DATA);
        expect(await page.url()).toContain(URL.CHECKOUT_URL_PAYMENT_SUMMARY);
        await cancelPaymentAction();
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
            OKPaymentInfo.VALID_NOTICE_CODE,
            OKPaymentInfo.VALID_FISCAL_CODE,
            OKPaymentInfo.EMAIL,
            OKPaymentInfo.VALID_CARD_DATA
        );

        expect(await page.url()).toContain(URL.CHECKOUT_URL_PAYMENT_SUMMARY);
    });

});


describe.only("Payment Methods list tests - Fee rendering", () => {
  const mockPaymentMethods = {
    paymentMethods: [
      {
        description: "Carte",
        id: "3ebea7a1-2e77-4a1b-ac1b-3aca0d67f813",
        methodManagement: "ONBOARDABLE",
        name: "Carte",
        paymentTypeCode: "CP",
        feeRange: { min: 10, max: 10 }, //  single case
        status: "ENABLED",
      },
      {
        description: "Paga con Postepay",
        id: "1c12349f-8133-42f3-ad96-7e6527d27a41",
        methodManagement: "REDIRECT",
        name: "Paga con Poste Pay",
        paymentTypeCode: "RBPP",
        feeRange: { min: 5, max: 10 }, //  range case
        status: "ENABLED",
      },
      {
      description: "MyBank",
      id: "2c61e6ed-f874-4b30-97ef-bdf89d488ee4",
      methodManagement: "NOT_ONBOARDABLE",
      name: "MYBANK",
      paymentTypeCode: "MYBK",
      status: "ENABLED",
    }
    ]
  };

  const numberFormatter =
  new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  

  beforeAll(async () => {
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.url().includes("/ecommerce/checkout/v2/payment-methods")) {
        request.respond({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockPaymentMethods),
        });
      } else {
        request.continue();
      }
    });
  });

  it.each([
    ["it", itTranslation],
    ["en", enTranslation],
    ["fr", frTranslation],
    ["de", deTranslation],
    ["sl", slTranslation],
  ])("should correctly render feeRange for language %s", async (lang, translation) => {
    selectLanguage(lang);

    await goToPaymentMethodsPage(
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL
    );

    await page.waitForSelector('[data-testid="feeRange"]');
    const feeElems = await page.$$('[data-testid="feeRange"]');

    // single case
    const expectedSingleText = translation.paymentChoicePage.feeSingle.replace(
      "{{value}}",
      numberFormatter.format(Number.parseInt(mockPaymentMethods.paymentMethods[0].feeRange?.min.toString()??"") / Math.pow(10, 2)));
    const singleText = await feeElems[0].evaluate(el => el.textContent);
    expect(singleText).toBe(expectedSingleText);

    // range case
    const expectedRangeText = translation.paymentChoicePage.feeRange
      .replace("{{min}}", numberFormatter.format(Number.parseInt(mockPaymentMethods.paymentMethods[1].feeRange?.min.toString()??"") / Math.pow(10, 2)))
      .replace("{{max}}", numberFormatter.format(Number.parseInt(mockPaymentMethods.paymentMethods[1].feeRange?.max.toString()??"") / Math.pow(10, 2)));
      console.log("expectedRangeText: ",expectedRangeText);
    const rangeText = await feeElems[1].evaluate(el => el.textContent);
    expect(rangeText).toBe(expectedRangeText);
    //missing feeRange
    expect(feeElems.length).toBe(2);
  });
});


