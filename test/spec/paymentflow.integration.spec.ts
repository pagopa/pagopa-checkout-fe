import { test, expect } from "@playwright/test";
import itTranslation from "../../src/translations/it/translations.json";
import enTranslation from "../../src/translations/en/translations.json";
import deTranslation from "../../src/translations/de/translations.json";
import frTranslation from "../../src/translations/fr/translations.json";
import slTranslation from "../../src/translations/sl/translations.json";

import { URL, KORPTIDs, OKPaymentInfo } from "./testConstants";
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
  activateApmPaymentAndGetError,
  authorizeApmPaymentAndGetError,
  filterByType,
  filterByTwoType,
} from "./helpers.js";

const languages = [
  { code: "it", translation: itTranslation },
  { code: "en", translation: enTranslation },
  { code: "fr", translation: frTranslation },
  { code: "de", translation: deTranslation },
  { code: "sl", translation: slTranslation },
];

test.describe.configure({ retries: 1 });

test.beforeEach(async ({ page }) => {
  await page.goto(URL.CHECKOUT_URL, { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1200, height: 907 });
  await page.unroute("**");
});

test.afterEach(async ({ page }) => {
  await page.evaluate(() => {
    // eslint-disable-next-line functional/immutable-data
    window.onbeforeunload = null;
  });
});

test.describe("Checkout payment verify failure tests", () => {
  test("Should fail a payment VERIFY and get FAIL_VERIFY_404_PPT_STAZIONE_INT_PA_SCONOSCIUTA", async ({
    page,
  }) => {
    const resultMessage = await verifyPaymentAndGetError(
      page,
      KORPTIDs.FAIL_VERIFY_404_PPT_STAZIONE_INT_PA_SCONOSCIUTA,
      OKPaymentInfo.VALID_FISCAL_CODE
    );
    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_SCONOSCIUTA");
  });

  test("Should fail a payment VERIFY and get FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT", async ({
    page,
  }) => {
    const resultMessage = await verifyPaymentAndGetError(
      page,
      KORPTIDs.FAIL_VERIFY_503_PPT_STAZIONE_INT_PA_TIMEOUT,
      OKPaymentInfo.VALID_FISCAL_CODE
    );

    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_TIMEOUT");
  });

  test("Should fail a payment VERIFY and get FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO", async ({
    page,
  }) => {
    const resultMessage = await verifyPaymentAndGetError(
      page,
      KORPTIDs.FAIL_VERIFY_502_PPT_PSP_SCONOSCIUTO,
      OKPaymentInfo.VALID_FISCAL_CODE
    );

    expect(resultMessage).toContain("PPT_PSP_SCONOSCIUTO");
  });
});

test.describe("Checkout payment ongoing failure tests", () => {
  for (const { code: lang, translation } of languages) {
    test(`Should fail a payment ACTIVATION and get PPT_PAGAMENTO_IN_CORSO for language [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);

      const ErrorTitleID = "#iframeCardFormErrorTitleId";
      const resultMessage = await activatePaymentAndGetError(
        page,
        KORPTIDs.FAIL_ACTIVATE_PPT_PAGAMENTO_IN_CORSO,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA,
        ErrorTitleID
      );
      expect(resultMessage).toContain(translation.PAYMENT_ONGOING.title);
    });
  }
});

test.describe("Checkout payment activation failure tests", () => {
  test("Should fail a payment ACTIVATION and get PPT_STAZIONE_INT_PA_TIMEOUT", async ({
    page,
  }) => {
    const errorID = "#iframeCardFormErrorId";
    const resultMessage = await activatePaymentAndGetError(
      page,
      KORPTIDs.FAIL_ACTIVATE_PPT_STAZIONE_INT_PA_TIMEOUT,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA,
      errorID
    );
    expect(resultMessage).toContain("PPT_STAZIONE_INT_PA_TIMEOUT");
  });

  test("Should fail a payment ACTIVATION and get PPT_PSP_SCONOSCIUTO", async ({
    page,
  }) => {
    const errorID = "#iframeCardFormErrorId";
    const resultMessage = await activateApmPaymentAndGetError(
      page,
      KORPTIDs.FAIL_ACTIVATE_502_PPT_PSP_SCONOSCIUTO,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      errorID
    );
    expect(resultMessage).toContain("PPT_PSP_SCONOSCIUTO");
  });

  languages.forEach(({ code: lang, translation }) => {
    test(`Should fail a Satispay payment ACTIVATION and get PPT_WISP_SESSIONE_SCONOSCIUTA [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);
      await fillAndSubmitSatispayPayment(
        page,
        KORPTIDs.FAIL_ACTIVATE_502_PPT_WISP_SESSIONE_SCONOSCIUTA,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL
      );

      const titleElem = page.locator("#sessionExpiredMessageTitle");
      const bodyElem = page.locator("#sessionExpiredMessageBody");

      await expect(titleElem).toBeVisible();
      await expect(bodyElem).toBeVisible();

      const title = await titleElem.textContent();
      const body = await bodyElem.textContent();

      expect(page.url()).toContain("/sessione-scaduta");
      expect(title).toContain(
        (translation as any).paymentResponsePage[4].title
      );
      expect(body).toContain((translation as any).paymentResponsePage[4].body);
    });
  });
});

test.describe("Auth request failure tests", () => {
  languages.forEach(({ code: lang, translation }) => {
    test(`Should fail a payment AUTHORIZATION REQUEST and get FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND for language [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);

      const errorMessageTitleSelector = "#idTitleErrorModalPaymentCheckPage";

      const resultMessage = await authorizeApmPaymentAndGetError(
        page,
        KORPTIDs.FAIL_AUTH_REQUEST_TRANSACTION_ID_NOT_FOUND,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        "SATY",
        errorMessageTitleSelector
      );

      const closeErrorButton = page.locator("#closeError").first();
      await closeErrorButton.click();

      await page.waitForTimeout(8000);

      const paymentCheckPageButtonCancel = page.locator(
        "#paymentCheckPageButtonCancel"
      );
      await paymentCheckPageButtonCancel.click();

      const confirmCancel = page.locator("#confirm");
      await confirmCancel.click();

      await expect(page.locator("#redirect-button")).toBeVisible();

      expect(resultMessage).toContain((translation as any).GENERIC_ERROR.title);
    });
  });
});

test.describe("PSP disclaimer tests", () => {
  languages.forEach(({ code: lang, translation }) => {
    test(`Should show up threshold disclaimer (why manage creditcard) for language [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);

      const resultMessage = await checkPspDisclaimerBeforeAuthorizePayment(
        page,
        KORPTIDs.PSP_ABOVETHRESHOLD,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA
      );

      expect(resultMessage).toContain(
        (translation as any).paymentCheckPage.disclaimer.yourCard
      );

      await cancelPaymentAction(page);
    });
  });

  languages.forEach(({ code: lang, translation }) => {
    test(`Should show below threshold disclaimer (why is cheaper) for language [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);

      const resultMessage = await checkPspDisclaimerBeforeAuthorizePayment(
        page,
        KORPTIDs.PSP_BELOWTHRESHOLD,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA
      );

      expect(resultMessage).toContain(
        (translation as any).paymentCheckPage.disclaimer.cheaper
      );

      await cancelPaymentAction(page);
    });
  });
});

test.describe("Checkout fails to calculate fee", () => {
  languages.forEach(({ code: lang, translation }) => {
    test(`Should fail to calculate fee for language [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);

      const resultMessage = await checkErrorOnCardDataFormSubmit(
        page,
        KORPTIDs.PSP_FAIL,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA
      );
      expect(resultMessage).toContain((translation as any).GENERIC_ERROR.title);

      const closeErrorButton = page.locator("#closeError").first();
      await closeErrorButton.click();

      const errorTitleLocator = page.locator("#koPageTitle");
      await expect(errorTitleLocator).toBeVisible();
      const errorMessage = await errorTitleLocator.textContent();
      expect(errorMessage).toContain((translation as any).koPage.title);
    });
  });

  languages.forEach(({ code: lang, translation }) => {
    test(`Should fail to calculate fee with 404 for CARDS and language [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);

      await fillAndSubmitCardDataForm(
        page,
        KORPTIDs.PSP_NOT_FOUND_FAIL,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA
      );

      const titleLocator = page.locator("#pspNotFoundTitleId");
      await expect(titleLocator).toBeVisible();
      const title = await titleLocator.textContent();
      expect(title).toContain((translation as any).pspUnavailable.title);

      const ctaLocator = page.locator("#pspNotFoundCtaId");
      await expect(ctaLocator).toBeVisible();
      const ctaText = await ctaLocator.textContent();
      expect(ctaText).toContain(
        (translation as any).pspUnavailable.cta.primary
      );

      const bodyLocator = page.locator("#pspNotFoundBodyId");
      await expect(bodyLocator).toBeVisible();
      const bodyText = await bodyLocator.textContent();
      expect(bodyText).toContain((translation as any).pspUnavailable.body);

      await ctaLocator.click();
      await expect(page).toHaveURL(/scegli-metodo/);
    });
  });

  languages.forEach(({ code: lang, translation }) => {
    test(`Should fail to calculate fee with 404 for SATISPAY and language [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);

      await fillAndSubmitSatispayPayment(
        page,
        KORPTIDs.PSP_NOT_FOUND_FAIL,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL
      );

      const titleLocator = page.locator("#pspNotFoundTitleId");
      await expect(titleLocator).toBeVisible();
      const titleText = await titleLocator.textContent();
      expect(titleText).toContain((translation as any).pspUnavailable.title);

      const ctaLocator = page.locator("#pspNotFoundCtaId");
      await expect(ctaLocator).toBeVisible();
      const ctaText = await ctaLocator.textContent();
      expect(ctaText).toContain(
        (translation as any).pspUnavailable.cta.primary
      );

      const bodyLocator = page.locator("#pspNotFoundBodyId");
      await expect(bodyLocator).toBeVisible();
      const bodyText = await bodyLocator.textContent();
      expect(bodyText).toContain((translation as any).pspUnavailable.body);

      await ctaLocator.click();
      await expect(page).toHaveURL(/scegli-metodo/);
    });
  });
});

test.describe("Cancel payment tests", () => {
  languages.forEach(({ code: lang, translation }) => {
    test(`Should correctly execute CANCEL PAYMENT by user for language [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);

      const resultMessage = await cancelPaymentOK(
        page,
        KORPTIDs.CANCEL_PAYMENT_OK,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        OKPaymentInfo.VALID_CARD_DATA
      );

      expect(resultMessage).toContain((translation as any).cancelledPage.body);
    });
  });
});

test.describe("Cancel payment failure tests (satispay)", () => {
  languages.forEach(({ code: lang, translation }) => {
    test(`Should fail a CANCEL PAYMENT by user for language [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);

      const resultMessage = await cancelPaymentKO(
        page,
        KORPTIDs.CANCEL_PAYMENT_KO,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL
      );

      expect(resultMessage).toContain((translation as any).GENERIC_ERROR.title);

      const closeErrorButton = page.locator("#closeError").first();
      await closeErrorButton.click();
    });
  });
});

test.describe("Filter payment method", () => {
  test("Filter payment method no filter button", async ({ page }) => {
    await selectLanguage(page, "it");

    await page.evaluate(() => {
      sessionStorage.setItem("enablePaymentMethodsHandler", "false");
    });

    await fillAndSearchFormPaymentMethod(
      page,
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      ""
    );

    const existsFilterButton = await page
      .locator("#filterDrawerButton")
      .count()
      .then((count) => count > 0);

    expect(existsFilterButton).toBeFalsy();
  });

  test("Filter payment method by text field", async ({ page }) => {
    await selectLanguage(page, "it");

    await fillAndSearchFormPaymentMethod(
      page,
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      "cart"
    );

    const isOnlyOnePaymentMethod = await verifyPaymentMethodsLength(page, 1);
    const isOnlyCardPaymentMethod = await verifyPaymentMethodsContains(
      page,
      "CP"
    );

    expect(isOnlyOnePaymentMethod).toBeTruthy();
    expect(isOnlyCardPaymentMethod).toBeTruthy();

    const resetFilterButton = page.locator("#clearFilterPaymentMethod");
    await resetFilterButton.click();

    const isMoreThanOnePaymentMethod = await verifyPaymentMethodsLength(
      page,
      7
    );
    const isCardPaymentMethodPresent = await verifyPaymentMethodsContains(
      page,
      "CP"
    );
    const isAppPaymentMethodPresent = await verifyPaymentMethodsContains(
      page,
      "SATY"
    );
    const isContoPaymentMethodPresent = await verifyPaymentMethodsContains(
      page,
      "RBPR"
    );

    expect(isMoreThanOnePaymentMethod).toBeTruthy();
    expect(isCardPaymentMethodPresent).toBeTruthy();
    expect(isAppPaymentMethodPresent).toBeTruthy();
    expect(isContoPaymentMethodPresent).toBeTruthy();

    await filterPaymentMethodByName(page, "carta");

    const filteredOutMessage = await noPaymentMethodsMessage(page);
    expect(filteredOutMessage).toContain(
      itTranslation.paymentChoicePage.noPaymentMethodsAvailable
    );
  });

  test("Filter payment method by filter drawer", async ({ page }) => {
    await selectLanguage(page, "it");

    await fillAndSearchFormPaymentMethod(
      page,
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      ""
    );

    await filterByType(page, "#paymentChoiceDrawer-card");

    const isBalanceFilteredOut = await verifyPaymentMethodsContains(
      page,
      "RBPB"
    );
    const isAppFilteredOut = await verifyPaymentMethodsContains(page, "SATY");
    const isCardStillVisible = await verifyPaymentMethodsContains(page, "CP");

    expect(isBalanceFilteredOut).toBeFalsy();
    expect(isAppFilteredOut).toBeFalsy();
    expect(isCardStillVisible).toBeTruthy();

    const chip = page.locator("#paymentTypeChipFilter");
    await expect(chip).toBeVisible();

    const applyBtn = page.locator("#paymentChoiceDrawer-applyFilter");
    await applyBtn.click();

    const chipDelete = page.locator("#removePaymentTypeFilter");
    await chipDelete.click();

    await page.waitForTimeout(1000);

    const isCardPresent = await verifyPaymentMethodsContains(page, "CP");
    const isAppPresent = await verifyPaymentMethodsContains(page, "SATY");
    const isContoPresent = await verifyPaymentMethodsContains(page, "RBPR");

    expect(isCardPresent).toBeTruthy();
    expect(isAppPresent).toBeTruthy();
    expect(isContoPresent).toBeTruthy();
  });

  test("Filter payment method by filter drawer - balance", async ({ page }) => {
    await selectLanguage(page, "it");

    await fillAndSearchFormPaymentMethod(
      page,
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      ""
    );

    await filterByType(page, "#paymentChoiceDrawer-balance");

    const isBalanceVisible = await verifyPaymentMethodsContains(page, "RBPB");
    const isAppVisible = await verifyPaymentMethodsContains(page, "SATY");
    const isCardVisible = await verifyPaymentMethodsContains(page, "CP");

    expect(isBalanceVisible).toBeTruthy();
    expect(isAppVisible).toBeFalsy();
    expect(isCardVisible).toBeFalsy();

    const chip = page.locator("#paymentTypeChipFilter");
    await expect(chip).toBeVisible();

    const applyBtn = page.locator("#paymentChoiceDrawer-applyFilter");
    await applyBtn.click();

    await page.waitForTimeout(1000);

    const chipDelete = page.locator("#removePaymentTypeFilter");
    await chipDelete.click();

    await page.waitForTimeout(1000);

    const isCardPresent = await verifyPaymentMethodsContains(page, "CP");
    const isAppPresent = await verifyPaymentMethodsContains(page, "SATY");
    const isContoPresent = await verifyPaymentMethodsContains(page, "RBPR");

    expect(isCardPresent).toBeTruthy();
    expect(isAppPresent).toBeTruthy();
    expect(isContoPresent).toBeTruthy();
  });

  test("Filter payment method by filter drawer - app", async ({ page }) => {
    await selectLanguage(page, "it");

    await fillAndSearchFormPaymentMethod(
      page,
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      ""
    );

    await filterByType(page, "#paymentChoiceDrawer-appApm");

    const isCardFilteredOut = await verifyPaymentMethodsContains(page, "CP");
    const isAppVisible = await verifyPaymentMethodsContains(page, "SATY");
    const isContoFilteredOut = await verifyPaymentMethodsContains(page, "RBPR");

    expect(isCardFilteredOut).toBeFalsy();
    expect(isAppVisible).toBeTruthy();
    expect(isContoFilteredOut).toBeFalsy();

    const chip = page.locator("#paymentTypeChipFilter");
    await expect(chip).toBeVisible();

    const applyBtn = page.locator("#paymentChoiceDrawer-applyFilter");
    await applyBtn.click();

    await page.waitForTimeout(1000);

    const chipDelete = page.locator("#removePaymentTypeFilter");
    await chipDelete.click();

    await page.waitForTimeout(1000);

    const isCardPresent = await verifyPaymentMethodsContains(page, "CP");
    const isAppPresent = await verifyPaymentMethodsContains(page, "SATY");
    const isContoPresent = await verifyPaymentMethodsContains(page, "RBPR");

    expect(isCardPresent).toBeTruthy();
    expect(isAppPresent).toBeTruthy();
    expect(isContoPresent).toBeTruthy();
  });

  test("Filter payment method by filter drawer - payByPlan", async ({
    page,
  }) => {
    await selectLanguage(page, "it");

    await fillAndSearchFormPaymentMethod(
      page,
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      ""
    );

    await filterByType(page, "#paymentChoiceDrawer-payByPlan");

    const isOnlyAppPaymentMethods = await verifyPaymentMethodsContains(
      page,
      "MYBK"
    );
    expect(isOnlyAppPaymentMethods).toBeTruthy();

    const chipFilterLocator = page.locator("#buyNowPayLaterChipFilter");
    await expect(chipFilterLocator).toBeVisible();

    const applyFilterButton = page.locator("#paymentChoiceDrawer-applyFilter");
    await applyFilterButton.click();

    await page.waitForTimeout(1000);

    const removeFilterButton = page.locator("#removeBuyNowPayLaterFilter");
    await removeFilterButton.click();

    await page.waitForTimeout(1000);

    const isCardPaymentMethodsPresent = await verifyPaymentMethodsContains(
      page,
      "CP"
    );
    const isAppPaymentMethodsPresent = await verifyPaymentMethodsContains(
      page,
      "SATY"
    );
    const isContoPaymentMethodsPresent = await verifyPaymentMethodsContains(
      page,
      "RBPR"
    );

    expect(isCardPaymentMethodsPresent).toBeTruthy();
    expect(isAppPaymentMethodsPresent).toBeTruthy();
    expect(isContoPaymentMethodsPresent).toBeTruthy();
  });

  test("Filter payment method by filter drawer - payByPlan - card", async ({
    page,
  }) => {
    await selectLanguage(page, "it");

    await fillAndSearchFormPaymentMethod(
      page,
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      ""
    );

    await filterByTwoType(
      page,
      "#paymentChoiceDrawer-card",
      "#paymentChoiceDrawer-payByPlan"
    );

    await expect(page.locator("#paymentTypeChipFilter")).toBeVisible();
    await expect(page.locator("#buyNowPayLaterChipFilter")).toBeVisible();

    const applyFilterButton = page.locator("#paymentChoiceDrawer-applyFilter");
    await applyFilterButton.click();

    await page.waitForTimeout(1000);

    const filteredOutMessage = await noPaymentMethodsMessage(page);
    expect(filteredOutMessage).toContain(
      itTranslation.paymentChoicePage.noPaymentMethodsAvailable
    );

    await page.locator("#removeBuyNowPayLaterFilter").click();
    await page.waitForTimeout(1000);

    const isCardPresent = await verifyPaymentMethodsContains(page, "CP");
    const isAppPresent = await verifyPaymentMethodsContains(page, "SATY");
    const isContoPresent = await verifyPaymentMethodsContains(page, "RBPR");

    expect(isCardPresent).toBeTruthy();
    expect(isAppPresent).toBeFalsy();
    expect(isContoPresent).toBeFalsy();

    const removeFilterButton = page.locator("#removePaymentTypeFilter");
    await removeFilterButton.click();

    await page.waitForTimeout(1000);

    const isCardPresentAll = await verifyPaymentMethodsContains(page, "CP");
    const isAppPresentAll = await verifyPaymentMethodsContains(page, "SATY");
    const isContoPresentAll = await verifyPaymentMethodsContains(page, "RBPR");

    expect(isCardPresentAll).toBeTruthy();
    expect(isAppPresentAll).toBeTruthy();
    expect(isContoPresentAll).toBeTruthy();
  });

  test("Filter payment method by filter drawer - payByPlan - balance", async ({
    page,
  }) => {
    await selectLanguage(page, "it");

    await fillAndSearchFormPaymentMethod(
      page,
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      ""
    );

    await filterByTwoType(
      page,
      "#paymentChoiceDrawer-balance",
      "#paymentChoiceDrawer-payByPlan"
    );

    const isOnlyMyBK = await verifyPaymentMethodsContains(page, "MYBK");
    const isOnlyOne = await verifyPaymentMethodsLength(page, 1);

    expect(isOnlyMyBK).toBeTruthy();
    expect(isOnlyOne).toBeTruthy();

    const paymentTypeChip = page.locator("#paymentTypeChipFilter");
    await expect(paymentTypeChip).toBeVisible();

    const buyNowPayLaterChip = page.locator("#buyNowPayLaterChipFilter");
    await expect(buyNowPayLaterChip).toBeVisible();

    const applyFilterButton = page.locator("#paymentChoiceDrawer-applyFilter");
    await applyFilterButton.click();
    await page.waitForTimeout(1000);

    const removeBNPLFilter = page.locator("#removeBuyNowPayLaterFilter");
    await removeBNPLFilter.click();

    await page.waitForTimeout(1000);

    const isCardPresent = await verifyPaymentMethodsContains(page, "CP");
    const isAppPresent = await verifyPaymentMethodsContains(page, "SATY");
    const isContoPresent = await verifyPaymentMethodsContains(page, "RBPR");

    expect(isCardPresent).toBeFalsy();
    expect(isAppPresent).toBeFalsy();
    expect(isContoPresent).toBeTruthy();

    await page.locator("#removePaymentTypeFilter").click();
    await page.waitForTimeout(1000);

    const isCardPresentAll = await verifyPaymentMethodsContains(page, "CP");
    const isAppPresentAll = await verifyPaymentMethodsContains(page, "SATY");
    const isContoPresentAll = await verifyPaymentMethodsContains(page, "RBPR");

    expect(isCardPresentAll).toBeTruthy();
    expect(isAppPresentAll).toBeTruthy();
    expect(isContoPresentAll).toBeTruthy();
  });

  test("Filter payment method by filter drawer - payByPlan - app", async ({
    page,
  }) => {
    await selectLanguage(page, "it");

    await fillAndSearchFormPaymentMethod(
      page,
      KORPTIDs.CANCEL_PAYMENT_OK,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      ""
    );

    await filterByTwoType(
      page,
      "#paymentChoiceDrawer-appApm",
      "#paymentChoiceDrawer-payByPlan"
    );

    const paymentTypeChip = page.locator("#paymentTypeChipFilter");
    await expect(paymentTypeChip).toBeVisible();

    const buyNowPayLaterChip = page.locator("#buyNowPayLaterChipFilter");
    await expect(buyNowPayLaterChip).toBeVisible();

    const applyFilterButton = page.locator("#paymentChoiceDrawer-applyFilter");
    await applyFilterButton.click();

    await page.waitForTimeout(1000);

    const filteredOutMessage = await noPaymentMethodsMessage(page);
    expect(filteredOutMessage).toContain(
      itTranslation.paymentChoicePage.noPaymentMethodsAvailable
    );

    const removeBNPLFilter = page.locator("#removeBuyNowPayLaterFilter");
    await removeBNPLFilter.click();

    await page.waitForTimeout(1000);

    const isCardPresent = await verifyPaymentMethodsContains(page, "CP");
    const isAppPresent = await verifyPaymentMethodsContains(page, "SATY");
    const isContoPresent = await verifyPaymentMethodsContains(page, "RBPR");

    expect(isCardPresent).toBeFalsy();
    expect(isAppPresent).toBeTruthy();
    expect(isContoPresent).toBeFalsy();

    const removePaymentTypeFilter = page.locator("#removePaymentTypeFilter");
    await removePaymentTypeFilter.click();

    await page.waitForTimeout(1000);

    const isCardPresentAll = await verifyPaymentMethodsContains(page, "CP");
    const isAppPresentAll = await verifyPaymentMethodsContains(page, "SATY");
    const isContoPresentAll = await verifyPaymentMethodsContains(page, "RBPR");

    expect(isCardPresentAll).toBeTruthy();
    expect(isAppPresentAll).toBeTruthy();
    expect(isContoPresentAll).toBeTruthy();
  });
});

test.describe("PSP list tests", () => {
  test("Should sort PSP by fees", async ({ page }) => {
    const resultMessage = await checkPspListFees(
      page,
      KORPTIDs.PSP_BELOWTHRESHOLD,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA
    );

    expect(Array.isArray(resultMessage)).toBe(true);
    expect(resultMessage.length).toBeGreaterThan(0);

    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < resultMessage.length - 1; i++) {
      expect(resultMessage[i]).toBeGreaterThanOrEqual(resultMessage[i + 1]);
    }

    await page.waitForTimeout(500);
    await cancelPaymentAction(page);
  });

  test("Should sort PSP by name", async ({ page }) => {
    const resultMessage = await checkPspListNames(
      page,
      KORPTIDs.PSP_BELOWTHRESHOLD,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA
    );

    expect(Array.isArray(resultMessage)).toBe(true);
    expect(resultMessage.length).toBeGreaterThan(0);

    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < resultMessage.length - 1; i++) {
      expect(
        resultMessage[i].localeCompare(resultMessage[i + 1])
      ).toBeGreaterThanOrEqual(0);
    }

    await page.waitForTimeout(500);
    await cancelPaymentAction(page);
  });
});

test.describe("Checkout Payment - PSP Selection Flow", () => {
  test("Should fill form, select PSP, and proceed with payment (IT)", async ({
    page,
  }) => {
    await selectLanguage(page, "it");

    await fillAndSubmitCardDataForm(
      page,
      OKPaymentInfo.VALID_NOTICE_CODE,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA
    );

    await expect(page).toHaveURL(new RegExp(URL.CHECKOUT_URL_PAYMENT_SUMMARY));
    await cancelPaymentAction(page);
  });

  test("Should mock PSP list with one PSP and proceed with selection", async ({
    page,
  }) => {
    await selectLanguage(page, "it");

    await page.route(
      "**/ecommerce/checkout/v2/payment-methods/**/fees",
      async (route) => {
        // eslint-disable-next-line no-console
        console.log("Intercepting PSP fees route");
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            asset:
              "https://assets.cdn.platform.pagopa.it/creditcard/generic.png",
            belowThreshold: true,
            brandAssets: {
              AMEX: "https://assets.cdn.platform.pagopa.it/creditcard/amex.png",
              DINERS:
                "https://assets.cdn.platform.pagopa.it/creditcard/diners.png",
              MAESTRO:
                "https://assets.cdn.platform.pagopa.it/creditcard/maestro.png",
              MASTERCARD:
                "https://assets.cdn.platform.pagopa.it/creditcard/mastercard.png",
              MC: "https://assets.cdn.platform.pagopa.it/creditcard/mastercard.png",
              VISA: "https://assets.cdn.platform.pagopa.it/creditcard/visa.png",
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
                touchpoint: "CHECKOUT",
              },
            ],
            paymentMethodDescription: "payment method description (v2)",
            paymentMethodName: "test",
            paymentMethodStatus: "ENABLED",
          }),
        });
      }
    );

    await fillAndSubmitCardDataForm(
      page,
      OKPaymentInfo.VALID_NOTICE_CODE,
      OKPaymentInfo.VALID_FISCAL_CODE,
      OKPaymentInfo.EMAIL,
      OKPaymentInfo.VALID_CARD_DATA
    );

    await expect(page).toHaveURL(new RegExp(URL.CHECKOUT_URL_PAYMENT_SUMMARY));
    await cancelPaymentAction(page);

    await page.unroute("**/ecommerce/checkout/v2/payment-methods/**/fees");
  });
});

const numberFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

test.describe("Payment Methods list tests - Fee rendering", () => {
  languages.forEach(({ code: lang, translation }) => {
    test(`should correctly render feeRange for language [${lang}]`, async ({
      page,
    }) => {
      await selectLanguage(page, lang);

      await page.evaluate(() => {
        sessionStorage.setItem("enablePaymentMethodsHandler", "true");
      });

      await fillAndSearchFormPaymentMethod(
        page,
        KORPTIDs.CANCEL_PAYMENT_OK,
        OKPaymentInfo.VALID_FISCAL_CODE,
        OKPaymentInfo.EMAIL,
        ""
      );

      const feeElems = page.locator('[data-testid="feeRange"]');
      await expect(feeElems).toHaveCount(7);

      const expectedSingleText = (
        translation as any
      ).paymentChoicePage.feeSingle.replace(
        "{{value}}",
        numberFormatter.format(10)
      );
      await expect(feeElems.nth(0)).toHaveText(expectedSingleText);

      const expectedRangeText = (translation as any).paymentChoicePage.feeRange
        .replace("{{min}}", numberFormatter.format(0))
        .replace("{{max}}", numberFormatter.format(9999.99));
      await expect(feeElems.nth(1)).toHaveText(expectedRangeText);
    });
  });
});
