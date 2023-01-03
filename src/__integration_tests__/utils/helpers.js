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

export const verifyPaymentAndGetError = async (
  noticeCode,
  fiscalCode,
  errorMessageXPath
) => {
  const payNoticeBtnXPath =
    "/html/body/div[1]/div/div[2]/div/div[2]/div[6]/div[1]/button";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const payNoticeBtn = await page.waitForXPath(payNoticeBtnXPath, {
    visible: true,
  });
  await payNoticeBtn.click();
  const errorMessageElem = await page.waitForXPath(errorMessageXPath);

  return await errorMessageElem.evaluate((el) => el.textContent);
};

export const verifyPayment = async (noticeCode, fiscalCode) => {
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
};

export const acceptCookiePolicy = async () => {
  const acceptPolicyBtn = "#onetrust-accept-btn-handler";
  const darkFilterXPath = "/html/body/div[2]/div[1]";

  await page.waitForSelector(acceptPolicyBtn);
  await page.click(acceptPolicyBtn);

  // Avoid click on form button when dark filter is still enabled
  await page.waitForXPath(darkFilterXPath, { hidden: true });
};

export const payNotice = async (noticeCode, fiscalCode, email, cardData) => {
  const payNoticeBtnSelector = "#paymentSummaryButtonPay";
  const resultMessageXPath = "/html/body/div[1]/div/div[2]/div/div/div/div/h6";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector, {
    visible: true,
  });
  await payNoticeBtn.click();
  await fillEmailForm(email);
  await choosePaymentMethod("card");
  await fillCardDataForm(cardData);
  const message = await page.waitForXPath(resultMessageXPath);
  return await message.evaluate((el) => el.textContent);
};

export const activatePaymentAndGetError = async (noticeCode, fiscalCode) => {
  const payNoticeBtnXPath =
    "/html/body/div[1]/div/div[2]/div/div[6]/div[2]/button";
  const resultMessageXPath = "/html/body/div[1]/div/div[2]/div/div/div/h6";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);

  const payNoticeBtn = await page.waitForXPath(payNoticeBtnXPath, {
    visible: true,
  });
  await payNoticeBtn.click();

  const message = await page.waitForXPath(resultMessageXPath);
  return await message.evaluate((el) => el.textContent);
};

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
  const cardOptionXPath = "/html/body/div[1]/div/div[2]/div/div[2]/div/div[1]";

  switch (method) {
    case "card": {
      const cardOptionBtn = await page.waitForXPath(cardOptionXPath);
      await cardOptionBtn.click();
      break;
    }
  }
};

export const testPaymentMethodRoute = async () => {
  const url = await page.url();
  const result = await page.evaluate((url) => url.split("/").pop() !== "", url);

  return result;
};

export const fillCardDataForm = async (cardData) => {
  const cardNumberInput = "#number";
  const expirationDateInput = "#expirationDate";
  const ccvInput = "#cvv";
  const holderNameInput = "#name";
  const continueBtnXPath = "button[type=submit]";
  const payBtnSelector = "#paymentCheckPageButtonPay";
  
  await page.waitForSelector(cardNumberInput);
  await page.click(cardNumberInput);
  await page.keyboard.type(cardData.number);

  await page.waitForSelector(expirationDateInput);
  await page.click(expirationDateInput);
  await page.keyboard.type(cardData.expirationDate);

  await page.waitForSelector(ccvInput);
  await page.click(ccvInput);
  await page.keyboard.type(cardData.ccv);

  await page.waitForSelector(holderNameInput);
  await page.click(holderNameInput);
  await page.keyboard.type(cardData.holderName);

  const continueBtn = await page.waitForSelector(continueBtnXPath);
  await continueBtn.click();

  const payBtn = await page.waitForSelector(payBtnSelector);
  await payBtn.click();
};
