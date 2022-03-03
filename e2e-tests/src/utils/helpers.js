export const selectKeyboardForm = async () => {
  const selectFormBtn = '#keyboardFormBtn';

  await page.waitForSelector(selectFormBtn);
  await page.click(selectFormBtn);
};

export const fillPaymentNotificationForm = async (noticeCode, fiscalCode) => {
  const noticeCodeTextInput = '#billCode';
  const fiscalCodeTextInput = '#cf';
  const verifyBtnXPath = '/html/body/div/div/div[2]/div/div[2]/form/div[2]/div[2]/button';

  await selectKeyboardForm();
  await page.waitForSelector(noticeCodeTextInput);
  await page.click(noticeCodeTextInput);
  await page.keyboard.type(noticeCode);

  await page.waitForSelector(fiscalCodeTextInput);
  await page.click(fiscalCodeTextInput);
  await page.keyboard.type(fiscalCode);

  const verifyBtnElem = await page.waitForXPath(verifyBtnXPath);
  await verifyBtnElem.click();
};

export const verifyPaymentAndGetError = async (noticeCode, fiscalCode) => {
  const errorMessageXPath = '/html/body/div[2]/div[3]/div/div/div/div[1]';

  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const errorMessageElem = await page.waitForXPath(errorMessageXPath);

  return await errorMessageElem.evaluate(el => el.textContent);
};

export const verifyPayment = async (noticeCode, fiscalCode) => {
  await fillPaymentNotificationForm(noticeCode, fiscalCode);

  page.on('response', response => {
    const status = response.status();
    expect(status).toBe(304);

    expect(response.url).toContain('/payment/summary');
  });
};
