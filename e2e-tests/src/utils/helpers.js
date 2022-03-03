export const selectForm = async (noticeCode, fiscalCode) => {
  const selectFormBtn = '#keyboardFormBtn';
  const noticeCodeTextInput = '#billCode';
  const fiscalCodeTextInput = '#cf';
  const verifyBtnXPath = '//*[@id="mui-3"]';

  await page.waitForSelector(selectFormBtn);
  await page.click(selectFormBtn);

  await page.waitForSelector(noticeCodeTextInput);
  await page.click(noticeCodeTextInput);
  await page.keyboard.type(noticeCode);

  await page.waitForSelector(fiscalCodeTextInput);
  await page.click(fiscalCodeTextInput);
  await page.keyboard.type(fiscalCode);

  const verifyBtnElem = await page.waitForXPath(verifyBtnXPath);
  await verifyBtnElem.click();
};
