import { ContrastOutlined } from '@mui/icons-material';
import { expect, Page } from '@playwright/test';
import { Console } from 'console';
export const payNotice = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  cardData,
  checkoutUrlAfterAuth
) => {
  const payBtnSelector = "#paymentCheckPageButtonPay";
  const resultTitleSelector = "#responsePageMessageTitle";
  await fillAndSubmitCardDataForm(page, noticeCode, fiscalCode, email, cardData);
  const payBtn = await  page.locator(payBtnSelector);
  await payBtn.click();
  //await page.waitForNavigation({ waitUntil: 'networkidle' });
  await page.goto(checkoutUrlAfterAuth, { waitUntil: 'networkidle' });
  const message = page.locator(resultTitleSelector);
  await expect(message).toBeVisible();
  const text = await message.textContent();

  return text?.trim() ?? '';
};

export const clickButtonBySelector = async (page, selector) => {
  const selectorButton = selector.startsWith("#") ? selector : "#" + selector;
  const button = page.locator(selectorButton);
  await button.click();
}

export const verifyPaymentAndGetError = async (page, noticeCode, fiscalCode) => {
  const errorMessageSelector = "#verifyPaymentErrorId";
  const errorMessageLocator = page.locator(errorMessageSelector);

  await fillPaymentNotificationForm(page, noticeCode, fiscalCode);
 
  await expect(errorMessageLocator).toBeVisible({ timeout: 8000 });

  return await errorMessageLocator.textContent();
};

export const activatePaymentAndGetError = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  cardData,
  selectorId
) => {
  await fillAndSubmitCardDataForm(page, noticeCode, fiscalCode, email, cardData);
  const errorMessageLocator = page.locator(selectorId);
  await expect(errorMessageLocator).toBeVisible({ timeout: 8000 });
  return await errorMessageLocator.textContent();
};

export const authorizePaymentAndGetError = async (
  noticeCode,
  fiscalCode,
  email,
  cardData,
  errorMessageTitleSelector
) => {
  const payBtnSelector = "#paymentCheckPageButtonPay";
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData);
  const payBtn = await page.waitForSelector(payBtnSelector);
  await payBtn.click();
  const errorMessageElem = await page.waitForSelector(
    errorMessageTitleSelector
  );
  return await errorMessageElem.evaluate((el) => el.textContent);
};

export const checkPspDisclaimerBeforeAuthorizePayment = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const pspDisclaimerSelectorById = "#pspDisclaimer";
  await fillAndSubmitCardDataForm(page, noticeCode, fiscalCode, email, cardData);
  
  await expect(page.locator(pspDisclaimerSelectorById)).toBeVisible({ timeout: 20000 });

  return await page.locator(pspDisclaimerSelectorById).textContent();
};

export const checkErrorOnCardDataFormSubmit = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const errorMessageTitleSelector = "#iframeCardFormErrorTitleId";
  await fillAndSubmitCardDataForm(page, noticeCode, fiscalCode, email, cardData);
  const errorMessageElem = page.locator(errorMessageTitleSelector);
  await expect(errorMessageElem).toBeVisible();

  return await errorMessageElem.textContent();
};

export const selectKeyboardForm = async (page) => {
  const selectFormXPath = "/html/body/div[1]/div/main/div/div[2]/div[2]/div[1]";
  const selectFormBtn = page.locator(`xpath=${selectFormXPath}`); 
  await expect(selectFormBtn).toBeVisible({ timeout: 8000 });
  await selectFormBtn.click();
};

export const clickLoginButton = async (page) => {
  //search login button and click it
  console.log("Search login button")
  const loginHeader = page.locator("#login-header");
  const loginBtn = loginHeader.locator("button").last();

  console.log("Login button click");
  await loginBtn.click();
}

export const getUserButton = async (page) => {
  //search user button
  console.log("Search user button");

  const buttons = page.locator("#login-header button");

  const count = await buttons.count();

  for (let i = 0; i < count; i++) {
    const text = await buttons.nth(i).textContent();
    if (text?.trim() === "MarioTest RossiTest") {
      return buttons.nth(i);
    }
  }

  console.warn("User button not found");
  return null;
}

export const tryLoginWithAuthCallbackError = async (page, noticeCode, fiscalCode) => {
  //flow test error
  await fillPaymentNotificationForm(page, noticeCode, fiscalCode);
  console.log("MockFlow set with noticeCode: " + noticeCode);

  //Login
  await clickLoginButton(page);

  //Wait for error messages
  const titleError = page.locator("#errorTitle");
  const bodyError = page.locator("#errorBody");

  await titleError.waitFor({ state: "visible" });
  await bodyError.waitFor({ state: "visible" });

  const title = (await titleError.textContent())?.trim() || "";
  const body = (await bodyError.textContent())?.trim() || "";

  // URL corrente
  const currentUrl = page.url();

  return { 
    title, 
    body, 
    currentUrl 
  };
}

export const  fillPaymentNotificationForm = async (page, noticeCode, fiscalCode, submit=true) => {
  const noticeCodeTextInput = page.locator('#billCode');
  const fiscalCodeTextInput = page.locator('#cf');
  const verifyBtn = page.locator('#paymentNoticeButtonContinue');

  await selectKeyboardForm(page);
 
  await expect(noticeCodeTextInput).toBeVisible({ timeout: 8000 });
  await noticeCodeTextInput.fill(noticeCode);

  await expect(fiscalCodeTextInput).toBeVisible({ timeout: 8000 });
  await fiscalCodeTextInput.fill(fiscalCode);

  if (submit) {
    await expect(verifyBtn).toBeVisible({ timeout: 8000 });
    await verifyBtn.click();
  }
};

export const fillAndSubmitCardDataForm = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  
  await fillPaymentNotificationForm(page, noticeCode, fiscalCode);

  
  await page.waitForTimeout(500);
  const payNoticeBtnSelector = "#paymentSummaryButtonPay";
  const payNoticeBtn = page.locator(payNoticeBtnSelector);
  await expect(payNoticeBtn).toBeVisible({ timeout: 5000 });
  await payNoticeBtn.click();

  await fillEmailForm(page, email);
  await choosePaymentMethod(page, "CP");
  await fillCardDataForm(page, cardData);
  await tryHandlePspPickerPage(page);
};

export const tryHandlePspPickerPage = async (page)=>{
  // wait for page to change, max wait time few seconds
  // this navigation will not happen in all test cases
  // so we don't want to waste too much time over it
  
 try {
    await page.waitForNavigation({ timeout: 3000, waitUntil: "load" });
  } catch {
    console.log("Navigation did not happen within 3000ms. Continuing test.");
  }


  // this step needs to be skipped during tests
  // in which we trigger an error modal in the previous page
  if ((await page.url()).includes("lista-psp")) {
    await selectPspOnPspPickerPage(page);
  }
}

export const selectPspOnPspPickerPage = async (page) => {
   try {
    const pspPickerRadio = page.locator("#psp-radio-button-unchecked").first();
    await expect(pspPickerRadio).toBeVisible({ timeout: 5000 });
    await pspPickerRadio.click();    

    // Attende fino a 5 secondi che il pulsante Continue sia visibile
    const continueButton = page.locator("#paymentPspListPageButtonContinue");
    await expect(continueButton).toBeVisible({ timeout: 5000 });
    await continueButton.click();
  } catch (e) {
    console.log(
      "Buttons not found: this is caused by PSP page immediately navigating to the summary page (if 1 PSP available)"
    );
  }
}

export const fillAndSubmitSatispayPayment = async (
  page,
  noticeCode,
  fiscalCode,
  email
) => {
  const payNoticeBtnSelector = "#paymentSummaryButtonPay";
  await fillPaymentNotificationForm(page, noticeCode, fiscalCode);
  const payNoticeBtn = page.locator(payNoticeBtnSelector);
  await expect(payNoticeBtn).toBeVisible();
  await payNoticeBtn.click();

  await fillEmailForm(page, email);
  await choosePaymentMethod(page, "SATY");
  await tryHandlePspPickerPage(page);
};

export const fillEmailForm = async (page, email) => {
  const emailInput = page.locator("#email");
  const confirmEmailInput = page.locator("#confirmEmail");
  const continueBtn = page.locator("#paymentEmailPageButtonContinue");

  await emailInput.fill(email);

  await confirmEmailInput.fill(email);

  await continueBtn.click();
};

export const choosePaymentMethod = async (page, method) => {
  const cardOptionBtn = page.locator(`[data-qaid="${method}"]`);
  await cardOptionBtn.click();
};

export const verifyPaymentMethods = async (page) => {
  const methodLocators = page.locator("[data-qalabel=payment-method]");
  const count = await methodLocators.count();
  return count > 0;
};

export const fillCardDataForm = async (page, cardData) => {
  const cardNumberFrame = page.frameLocator("#frame_CARD_NUMBER");
  const expirationFrame = page.frameLocator("#frame_EXPIRATION_DATE");
  const ccvFrame = page.frameLocator("#frame_SECURITY_CODE");
  const holderFrame = page.frameLocator("#frame_CARDHOLDER_NAME");
  const continueBtn = page.locator('button[type=submit]');
  const disabledContinueBtn = page.locator('button[type=submit][disabled]');

  let iteration = 0;
  let completed = false;

  while (!completed) {
    iteration++;

    await cardNumberFrame.locator('input[name="CARD_NUMBER"]').fill(cardData.number);
    await expirationFrame.locator('input[name="EXPIRATION_DATE"]').fill(cardData.expirationDate);
    await ccvFrame.locator('input[name="SECURITY_CODE"]').fill(cardData.ccv);
    await holderFrame.locator('input[name="CARDHOLDER_NAME"]').fill(cardData.holderName);


    completed = !(await disabledContinueBtn.isVisible());
    if (!completed) {
      await page.waitForTimeout(1000);
    }
  }

  await continueBtn.click();
};

export const cancelPaymentAction = async (page) => {
  const paymentCheckPageButtonCancel = page.locator("#paymentCheckPageButtonCancel");
  await paymentCheckPageButtonCancel.click();

  const cancPayment = page.locator("#confirm");
  await cancPayment.click();

  const redirectButton = page.locator("#redirect-button");
  await expect(redirectButton).toBeVisible({ timeout: 5000 });
};


  

export const cancelPaymentOK = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const resultMessageLocator = page.locator(
    '#main_content > div > div > div > div.MuiBox-root.css-5vb4lz > div'
  );

  await fillAndSubmitCardDataForm(page, noticeCode, fiscalCode, email, cardData);  
 
  const cancelButton = page.locator("#paymentCheckPageButtonCancel");
  await cancelButton.click();

  const confirmButton = page.locator("#confirm");
  

  await Promise.all([
    page.waitForNavigation({ waitUntil: "load" }),
    confirmButton.click(),
  ]);
  
  await expect(resultMessageLocator).toBeVisible();
  return await resultMessageLocator.textContent();
};



export const cancelPaymentKO = async (page,noticeCode, fiscalCode, email) => {
  await fillAndSubmitSatispayPayment(page, noticeCode, fiscalCode, email);

  const cancelButton = page.locator("#paymentCheckPageButtonCancel");
  await cancelButton.click();

  const confirmButton = page.locator("#confirm");
  await confirmButton.click();

  const errorMessage = page.locator("#idTitleErrorModalPaymentCheckPage");
  await expect(errorMessage).toBeVisible();
  return await errorMessage.textContent();
};

export const closeErrorModal = async (page) => {
  const closeErrorBtn = page.locator(
    '/html/body/div[6]/div[3]/div/div/div[2]/div[1]/button'
  );
  await closeErrorBtn.click();
};

export const selectLanguage = async (page, language) => {
  const languageMenu = page.locator('#languageMenu');
  await expect(languageMenu).toBeVisible({ timeout: 10000 });
  await languageMenu.selectOption(language);
};


/*
 * utility function to emulate edit psp list and sort. This function has many timeout to allow view transitions to end before try to click CTA buttons
 */
export const checkPspListFees = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const pspEditButton = page.locator("#pspEdit");
  const pspFeeSortButton = page.locator("#sortByFee");
  const closePspListButton = page.locator("#closePspList");

  await fillAndSubmitCardDataForm(page, noticeCode, fiscalCode, email, cardData);


  await pspEditButton.click();

  await page.waitForTimeout(500);


  await pspFeeSortButton.click();

  await page.waitForTimeout(500);

  const pspElements = page.locator(".pspFeeValue").first();
  await expect(pspElements).toBeVisible();
  const count = await pspElements.count();

  const numericContents = [];
  for (let i = 0; i < count; i++) {
    const text = await pspElements.nth(i).textContent();
    let numbers = text?.match(/[\d,]+/g);
    let result = numbers ? numbers.join("").replace(",", ".") : "";
    numericContents.push(parseFloat(result) || 0);
  }

  await closePspListButton.click();

  return numericContents;
};

/*
 * utility function to emulate edit psp list and sort. This function has many timeout to allow view transitions to end before try to click CTA buttons
 */
export const checkPspListNames = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const pspEditButton = page.locator("#pspEdit");
  const pspSortByNameButton = page.locator("#sortByName");
  const closePspListButton = page.locator("#closePspList");

  await fillAndSubmitCardDataForm(page, noticeCode, fiscalCode, email, cardData);

  await pspEditButton.click();

  await page.waitForTimeout(500);

  await pspSortByNameButton.click();
  await page.waitForTimeout(500);

  const pspElements = page.locator(".pspFeeName").first();
  await expect(pspElements).toBeVisible();
  const count = await pspElements.count();
  const feeNameContents = [];

  for (let i = 0; i < count; i++) {
    const text = await pspElements.nth(i).textContent();
    feeNameContents.push(text?.trim() || "");
  }

  await closePspListButton.click();

  return feeNameContents;
};


export const activateApmPaymentAndGetError = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  selectorId
) => {
  await chooseApmMethod(page, noticeCode, fiscalCode, email, "SATY");
  const errorMessageElem = page.locator(selectorId);
  await expect(errorMessageElem).toBeVisible({ timeout: 8000 });
  return await errorMessageElem.textContent();
};

export const chooseApmMethod = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  paymentTypeCode
) => {                                  
  
  await fillPaymentNotificationForm(page, noticeCode, fiscalCode);
  const payNoticeBtn = page.locator("#paymentSummaryButtonPay");
  await payNoticeBtn.click();
  await fillEmailForm(page, email);
  await choosePaymentMethod(page, paymentTypeCode);
  await tryHandlePspPickerPage(page);
};

export const fillAndSearchFormPaymentMethod = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  paymentMethod
) => {
 
  await fillPaymentNotificationForm(page,noticeCode, fiscalCode);
  const payNoticeBtn = page.locator("#paymentSummaryButtonPay");
  await payNoticeBtn.click();

  await fillEmailForm(page,email);
  await filterPaymentMethodByName(page,paymentMethod);
};

export const filterPaymentMethodByName = async (page,methodFilterName) => {
  const paymentMethodFilterBox = page.locator("#paymentMethodsFilter");
  await paymentMethodFilterBox.fill(methodFilterName);
};

export const verifyPaymentMethodsLength = async (page, length) => {
  const methodsLocator = page.locator("[data-qalabel=payment-method]");
  await expect(methodsLocator.first()).toBeVisible();
  const count = await methodsLocator.count();
  return count === length;
};

export const verifyPaymentMethodsContains = async (page,paymentMethodTypeCode) => {
  const methodsLocator = page.locator("[data-qalabel=payment-method]");
  await expect(methodsLocator.first()).toBeVisible();
  const count = await methodsLocator.count();
  for (let i = 0; i < count; i++) {
    const method = await methodsLocator.nth(i).getAttribute("data-qaid");
    if (method === paymentMethodTypeCode) {
      return true;
    }
  }

  return false;
};

export const noPaymentMethodsMessage = async (page) => {
  const messageLocator = page.locator("#noPaymentMethodsMessage");
  await expect(messageLocator).toBeVisible();
  return await messageLocator.textContent();
};

export const authorizeApmPaymentAndGetError = async (
  page,
  noticeCode,
  fiscalCode,
  email,
  paymentTypeCode,
  errorMessageTitleSelector
) => {
  
  await chooseApmMethod(page, noticeCode, fiscalCode, email, paymentTypeCode);
  const payBtn =  page.locator("#paymentCheckPageButtonPay");
  await payBtn.click();

  const errorMessageElem = page.locator(errorMessageTitleSelector);
  await expect(errorMessageElem).toBeVisible();

  const errorMessage = await errorMessageElem.evaluate((el) => el.textContent?.trim());
  return errorMessage ?? "";
};

export const filterByType = async (page,id) => {
  //wait 1 sec for f.e. to draws component
  await new Promise((r) => setTimeout(r, 1000));

  const filterDrawerOpenButton = page.locator("#filterDrawerButton");
  await filterDrawerOpenButton.click();

  const filterDrawerCard = page.locator(id);
  await filterDrawerCard.click();
};

export const filterByTwoType = async (page,id_1,id_2) => {
  //wait 1 sec for f.e. to draws component
  await page.waitForTimeout(1000);

  const filterDrawerOpenButton = page.locator("#filterDrawerButton");
  await filterDrawerOpenButton.click();

  const filterDrawerCard1 = page.locator(id_1);
  await filterDrawerCard1.click();

  const filterDrawerCard2 = page.locator(id_2);
  await filterDrawerCard2.click();
};

export const verifyPaymentMethodsNotContains = async (page,paymentMethodTypeCode) => {
  const methods = await page.locator("[data-qalabel=payment-method]").allAttributeValues("data-qaid");
  return !methods.includes(paymentMethodTypeCode);
};

