export const payNotice = async (noticeCode, fiscalCode, email, cardData, checkoutUrlAfterAuth) => {
  const payBtnSelector = "#paymentCheckPageButtonPay";
  const resultTitleSelector = "#responsePageMessageTitle";
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData)
  const payBtn = await page.waitForSelector(payBtnSelector);
  await payBtn.click();
  await page.waitForNavigation();
  await page.goto(checkoutUrlAfterAuth)
  const message = await page.waitForSelector(resultTitleSelector);
  return await message.evaluate((el) => el.textContent);
};

export const verifyPaymentAndGetError = async (noticeCode, fiscalCode) => {
  const errorMessageXPath = '/html/body/div[3]/div[3]/div/div/div[2]/div[2]/div';
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const errorMessageElem = await page.waitForXPath(errorMessageXPath);
  return await errorMessageElem.evaluate(el => el.textContent);
};

export const activatePaymentAndGetError = async (noticeCode, fiscalCode, email, cardData, selectorId) => {
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData)
  const errorMessageElem = await page.waitForSelector(selectorId);
  return await errorMessageElem.evaluate((el) => el.textContent);
};

export const authorizePaymentAndGetError = async (noticeCode, fiscalCode, email, cardData, errorMessageTitleSelector) => {
  const payBtnSelector = "#paymentCheckPageButtonPay";
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData)
  const payBtn = await page.waitForSelector(payBtnSelector);
  await payBtn.click();
  const errorMessageElem = await page.waitForSelector(errorMessageTitleSelector);
  return await errorMessageElem.evaluate((el) => el.textContent);
};

export const checkPspDisclaimerBeforeAuthorizePayment = async (noticeCode, fiscalCode, email, cardData) => {
  const pspDisclaimerSelectorById = "#pspDisclaimer";
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData)
  const disclaimerElement = await page.waitForSelector(pspDisclaimerSelectorById);
  return await disclaimerElement.evaluate((el) => el.textContent);
};

export const checkErrorOnCardDataFormSubmit = async (noticeCode, fiscalCode, email, cardData) => {
  const errorMessageTitleSelector = '#iframeCardFormErrorTitleId';
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData);
  const errorMessageElem = await page.waitForSelector(errorMessageTitleSelector);
  return await errorMessageElem.evaluate((el) => el.textContent);
};

export const selectKeyboardForm = async () => {
  const selectFormXPath =
    "/html/body/div[1]/div/div[2]/div/div[2]/div[2]/div[1]";
  const selectFormBtn = await page.waitForXPath(selectFormXPath);
  await selectFormBtn.click();
};

export const fillPaymentNotificationForm = async (noticeCode, fiscalCode) => {
  const noticeCodeTextInput = "#billCode";
  const fiscalCodeTextInput = "#cf";
  const verifyBtn = "#paymentNoticeButtonContinue";

  await selectKeyboardForm();
  await page.waitForSelector(noticeCodeTextInput);
  await page.click(noticeCodeTextInput);
  await page.keyboard.type(noticeCode);
  await page.waitForSelector(fiscalCodeTextInput);
  await page.click(fiscalCodeTextInput);
  await page.keyboard.type(fiscalCode);
  await page.waitForSelector(verifyBtn);
  await page.click(verifyBtn);
};

export const acceptCookiePolicy = async () => {
  const acceptPolicyBtn = "#onetrust-accept-btn-handler";
  const darkFilterXPath = "/html/body/div[2]/div[1]";

  await page.waitForSelector(acceptPolicyBtn);
  await page.click(acceptPolicyBtn);

  // Avoid click on form button when dark filter is still enabled
  await page.waitForXPath(darkFilterXPath, { hidden: true });
};

export const fillAndSubmitCardDataForm = async (noticeCode, fiscalCode, email, cardData) => {
  const payNoticeBtnSelector = "#paymentSummaryButtonPay";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector, {
    visible: true,
  });
  await payNoticeBtn.click();
  await fillEmailForm(email);
  await choosePaymentMethod("CP");
  await fillCardDataForm(cardData);
}

export const fillEmailForm = async (email) => {
  const emailInput = "#email";
  const confirmEmailInput = "#confirmEmail";
  const continueBtnSelector = "#paymentEmailPageButtonContinue";

  await page.waitForSelector(emailInput);
  await page.click(emailInput);
  await page.keyboard.type(email);

  await page.waitForSelector(confirmEmailInput);
  await page.click(confirmEmailInput);
  await page.keyboard.type(email);

  const continueBtn = await page.waitForSelector(continueBtnSelector);
  await continueBtn.click();
};

export const choosePaymentMethod = async (method) => {
  const cardOptionXPath = `[data-qaid=${method}]`;

  const cardOptionBtn = await page.waitForSelector(cardOptionXPath);
  await cardOptionBtn.click();
};

export const verifyPaymentMethods = async () => {
  await page.waitForSelector("[data-qalabel=payment-method]");
  const methods = await page.$$eval(
    "[data-qalabel=payment-method]",
    (elHandles) => elHandles.map((el) => el.getAttribute("data-qaid"))
  );
  for (const method of methods) {
    const cardOptionXPath = `[data-qaid=${method}]`;

    const cardOptionBtn = await page.waitForSelector(cardOptionXPath);
    await cardOptionBtn.click();
  }
  return true;
};

export const fillCardDataForm = async (cardData) => {
  const cardNumberInput = '#frame_CARD_NUMBER';
  const expirationDateInput = '#frame_EXPIRATION_DATE';
  const ccvInput = '#frame_SECURITY_CODE';
  const holderNameInput = '#frame_CARDHOLDER_NAME';
  const continueBtnXPath = "button[type=submit]";
  const disabledContinueBtnXPath = 'button[type=submit][disabled=""]';
  let iteration = 0;
  let completed = false;
  while (!completed) {
    iteration++;
    console.log(`Compiling fields...${iteration}`);
    await page.waitForSelector(cardNumberInput, { visible: true });
    await page.click(cardNumberInput, { clickCount: 3 });
    await page.keyboard.type(cardData.number);
    console.log("card number performed");
    await page.waitForSelector(expirationDateInput, { visible: true });
    await page.click(expirationDateInput, { clickCount: 3 });
    await page.keyboard.type(cardData.expirationDate);
    console.log("expiration performed");
    await page.waitForSelector(ccvInput, { visible: true });
    await page.click(ccvInput, { clickCount: 3 });
    await page.keyboard.type(cardData.ccv);
    console.log("cvv performed");
    await page.waitForSelector(holderNameInput, { visible: true });
    await page.click(holderNameInput, { clickCount: 3 });
    await page.keyboard.type(cardData.holderName);
    console.log("holder performed");
    completed = !(!! await page.$(disabledContinueBtnXPath));
    await page.waitForTimeout(1_000);
  }
  const continueBtn = await page.waitForSelector(continueBtnXPath, { visible: true });
  await continueBtn.click();
};

export const cancelPaymentAction = async () => {
  const paymentCheckPageButtonCancel = await page.waitForSelector("#paymentCheckPageButtonCancel");
  await paymentCheckPageButtonCancel.click();
  const cancPayment = await page.waitForSelector("#confirm");
  await cancPayment.click();
  await page.waitForNavigation();
}

export const cancelPaymentOK = async (noticeCode, fiscalCode, email, cardData) => {
  const resultMessageXPath = "/html/body/div[1]/div/div[2]/div/div/div/div[1]/div";
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData)
  const paymentCheckPageButtonCancel = await page.waitForSelector("#paymentCheckPageButtonCancel");
  await paymentCheckPageButtonCancel.click();
  const cancPayment = await page.waitForSelector("#confirm");
  await cancPayment.click();
  await page.waitForNavigation();
  const message = await page.waitForXPath(resultMessageXPath);
  return await message.evaluate((el) => el.textContent);
};

export const cancelPaymentKO = async (noticeCode, fiscalCode, email, cardData) => {
  const resultMessageXPath = "/html/body/div[7]/div[3]/div/h2/div";
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData)
  const paymentCheckPageButtonCancel = await page.waitForSelector("#paymentCheckPageButtonCancel");
  await paymentCheckPageButtonCancel.click();
  const cancPayment = await page.waitForSelector("#confirm");
  await cancPayment.click();
  const message = await page.waitForSelector("#idTitleErrorModalPaymentCheckPage");
  return await message.evaluate((el) => el.textContent);
};

export const closeErrorModal = async () => {
  const closeErrorBtn = await page.waitForXPath("/html/body/div[6]/div[3]/div/div/div[2]/div[1]/button");
  await closeErrorBtn.click();
}
