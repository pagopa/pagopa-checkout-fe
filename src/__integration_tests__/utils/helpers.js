export const payNotice = async (
  noticeCode,
  fiscalCode,
  email,
  cardData,
  checkoutUrlAfterAuth
) => {
  const payBtnSelector = "#paymentCheckPageButtonPay";
  const resultTitleSelector = "#responsePageMessageTitle";
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData);
  const payBtn = await page.waitForSelector(payBtnSelector);
  await payBtn.click();
  await page.waitForNavigation();
  await page.goto(checkoutUrlAfterAuth, { waitUntil: "networkidle0" });
  const message = await page.waitForSelector(resultTitleSelector);
  return await message.evaluate((el) => el.textContent);
};

export const noPaymentMethodsMessage = async () => {
  const message = await page.waitForSelector("#noPaymentMethodsMessage");
  return await message.evaluate((el) => el.textContent);
};

export const clickButtonBySelector = async (selector) => {
  const selectorButton = selector.startsWith("#") ? selector : "#" + selector;
  const button = await page.waitForSelector(selectorButton);
  await button.click();
}

export const verifyPaymentAndGetError = async (noticeCode, fiscalCode) => {
  const errorMessageSelector = "#verifyPaymentErrorId";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const errorMessageElem = await page.waitForSelector(errorMessageSelector);
  return await errorMessageElem.evaluate((el) => el.textContent);
};

export const activatePaymentAndGetError = async (
  noticeCode,
  fiscalCode,
  email,
  cardData,
  selectorId,
  useApm
) => {
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData);
  const errorMessageElem = await page.waitForSelector(selectorId);
  return await errorMessageElem.evaluate((el) => el.textContent);
};

export const activateApmPaymentAndGetError = async (
  noticeCode,
  fiscalCode,
  email,
  selectorId
) => {
  await chooseApmMethod(noticeCode, fiscalCode, email, "SATY");
  const errorMessageElem = await page.waitForSelector(selectorId);
  return await errorMessageElem.evaluate((el) => el.textContent);
};

export const authorizeApmPaymentAndGetError = async (
  noticeCode,
  fiscalCode,
  email,
  paymentTypeCode,
  errorMessageTitleSelector
) => {
  const payBtnSelector = "#paymentCheckPageButtonPay";
  await chooseApmMethod(noticeCode, fiscalCode, email, paymentTypeCode);
  const payBtn = await page.waitForSelector(payBtnSelector);
  await payBtn.click();
  const errorMessageElem = await page.waitForSelector(
    errorMessageTitleSelector
  );
  return await errorMessageElem.evaluate((el) => el.textContent);
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
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const pspDisclaimerSelectorById = "#pspDisclaimer";
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData);
  const disclaimerElement = await page.waitForSelector(
    pspDisclaimerSelectorById
  );
  return await disclaimerElement.evaluate((el) => el.textContent);
};

export const checkErrorOnCardDataFormSubmit = async (
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const errorMessageTitleSelector = "#iframeCardFormErrorTitleId";
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData);
  const errorMessageElem = await page.waitForSelector(
    errorMessageTitleSelector
  );
  return await errorMessageElem.evaluate((el) => el.textContent);
};

export const selectKeyboardForm = async () => {
  const selectFormSelector = "[data-testid='KeyboardIcon']";
  const selectFormBtn = await page.waitForSelector(selectFormSelector);
  await selectFormBtn.click();
};

export const clickLoginButton = async () => {
  //search login button and click it
  console.log("Search login button")
  const loginHeader = await page.waitForSelector("#login-header");
  const headerButtons = await loginHeader.$$("button");
  //Login button is the last on the header
  const loginBtn = headerButtons.at(-1);
  console.log("Login button click")
  await loginBtn.click();
}

export const getUserButton = async () => {
  //search user button
  console.log("Search user button")
  const loginHeader = await page.waitForSelector("#login-header");
  const headerButtons = await loginHeader.$$("button");
  // return button with name 
  let userButton;
  for(let btn of headerButtons) {
    const text = await btn.evaluate((el) => el.textContent);
    if(text === "MarioTest RossiTest") {
      userButton = btn;
    }
  }
  return userButton;
}

export const tryLoginWithAuthCallbackError = async (noticeCode, fiscalCode) => {
  //flow test error
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  console.log("MockFlow set with noticeCode: " + noticeCode);

  //Login
  await clickLoginButton();

  //Wait for error messages
  const titleErrorElem = await page.waitForSelector("#errorTitle");
  const titleErrorBody = await page.waitForSelector("#errorBody");
  const title = await titleErrorElem.evaluate((el) => el.textContent);
  const body = await titleErrorBody.evaluate((el) => el.textContent);

  //Error on auth-callback page
  const currentUrl = page.url();
  
  return {
    title,
    body,
    currentUrl,
  }
}

export const fillPaymentNotificationForm = async (noticeCode, fiscalCode, submit=true) => {
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
  if(submit){
    await page.waitForSelector(verifyBtn);
    await page.click(verifyBtn);
  }
};

export const fillAndSubmitCardDataForm = async (
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const payNoticeBtnSelector = "#paymentSummaryButtonPay";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector, {
    visible: true,
  });
  await payNoticeBtn.click();
  await fillEmailForm(email);
  await choosePaymentMethod("CP");
  await fillCardDataForm(cardData);
  await tryHandlePspPickerPage();
};

export const chooseApmMethod = async (
  noticeCode,
  fiscalCode,
  email,
  paymentTypeCode
) => {
  const payNoticeBtnSelector = "#paymentSummaryButtonPay";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector, {
    visible: true,
  });
  await payNoticeBtn.click();
  await fillEmailForm(email);
  await choosePaymentMethod(paymentTypeCode);
  await tryHandlePspPickerPage();
};

export const fillAndSearchFormPaymentMethod = async (
  noticeCode,
  fiscalCode,
  email,
  paymentMethod
) => {
  const payNoticeBtnSelector = "#paymentSummaryButtonPay";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector, {
    visible: true,
  });
  await payNoticeBtn.click();
  await fillEmailForm(email);
  await filterPaymentMethodByName(paymentMethod);
};

export const filterByCard = async () => {
  const filterDrawerOpenButton = page.waitForSelector("#filterDrawerButton", {
    clickable: true,
  });
  await filterDrawerOpenButton?.click();
  const filterDrawerCard = page.waitForSelector("#paymentChoiceDrawer-card", {
    clickable: true,
  });
  await filterDrawerCard?.click();
};



export const tryHandlePspPickerPage = async ()=>{
  // wait for page to change, max wait time few seconds
  // this navigation will not happen in all test cases
  // so we don't want to waste too much time over it
  try {
    await page.waitForNavigation({ timeout: 3000 });
  } catch (error) {
    // If the navigation doesn't happen within 3000ms, just log and continue
    console.log("Navigation did not happen within 3000ms. Continuing test.");
  }

  // this step needs to be skipped during tests
  // in which we trigger an error modal in the previous page
  if(await page.url().includes("lista-psp")){
    await selectPspOnPspPickerPage();
  }
}

export const selectPspOnPspPickerPage = async () => {
  try{
    const pspPickerRadio = await page.waitForSelector("#psp-radio-button-unchecked", {
      visible: true, timeout: 500
    });
    await pspPickerRadio.click();
  
    const continueButton = await page.waitForSelector("#paymentPspListPageButtonContinue", {
      visible: true, timeout: 500
    });
    
    await continueButton.click();
  }catch(e){
    console.log("Buttons not found: this is caused by PSP page immediately navigate to the summary page (if 1 psp available)");
  }
}

export const fillAndSubmitSatispayPayment = async (
  noticeCode,
  fiscalCode,
  email
) => {
  const payNoticeBtnSelector = "#paymentSummaryButtonPay";
  await fillPaymentNotificationForm(noticeCode, fiscalCode);
  const payNoticeBtn = await page.waitForSelector(payNoticeBtnSelector, {
    visible: true,
  });
  await payNoticeBtn.click();
  await fillEmailForm(email);
  await choosePaymentMethod("SATY");
  await tryHandlePspPickerPage();
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

export const filterPaymentMethodByName = async (methodFilterName) => {
  const paymentMethodFilterBoxId = `#paymentMethodsFilter`;
  
  const paymentMethodFilterBox = await page.waitForSelector(paymentMethodFilterBoxId);
  await paymentMethodFilterBox.click();
  await page.keyboard.type(methodFilterName);
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
  return methods.length > 0;
};

export const verifyPaymentMethodsLength = async (length) => {
  await page.waitForSelector("[data-qalabel=payment-method]");
  const methods = await page.$$eval(
    "[data-qalabel=payment-method]",
    (elHandles) => elHandles.map((el) => el.getAttribute("data-qaid"))
  );
  return methods.length === length;
};

export const verifyPaymentMethodsContains = async (paymentMethodTypeCode) => {
  await page.waitForSelector("[data-qalabel=payment-method]");
  const methods = await page.$$eval(
    "[data-qalabel=payment-method]",
    (elHandles) => elHandles.map((el) => el.getAttribute("data-qaid"))
  );
  return methods.indexOf(paymentMethodTypeCode) > -1;
};

export const fillCardDataForm = async (cardData) => {
  const cardNumberInput = "#frame_CARD_NUMBER";
  const expirationDateInput = "#frame_EXPIRATION_DATE";
  const ccvInput = "#frame_SECURITY_CODE";
  const holderNameInput = "#frame_CARDHOLDER_NAME";
  const continueBtnXPath = "button[type=submit]";
  const disabledContinueBtnXPath = 'button[type=submit][disabled=""]';
  let iteration = 0;
  let completed = false;
  while (!completed && iteration <5) {
    iteration++;
    await page.waitForSelector(cardNumberInput, { visible: true });
    await page.click(cardNumberInput, { clickCount: 4 });
    await page.keyboard.type(cardData.number);
    await page.waitForSelector(expirationDateInput, { visible: true });
    await page.click(expirationDateInput, { clickCount: 4 });
    await page.keyboard.type(cardData.expirationDate);
    await page.waitForSelector(ccvInput, { visible: true });
    await page.click(ccvInput, { clickCount: 4 });
    await page.keyboard.type(cardData.ccv);
    await page.waitForSelector(holderNameInput, { visible: true });
    await page.click(holderNameInput, { clickCount: 4 });
    await page.keyboard.type(cardData.holderName);
    completed = !!!(await page.$(disabledContinueBtnXPath));
    await new Promise(resolve => setTimeout(resolve, 200)); 
  }
  const continueBtn = await page.waitForSelector(continueBtnXPath, {
    visible: true,
  });
  await continueBtn.click();
};

export const cancelPaymentAction = async () => {
  const paymentCheckPageButtonCancel = await page.waitForSelector(
    "#paymentCheckPageButtonCancel", {clickable: true}
  );
  await paymentCheckPageButtonCancel.click();
  const cancPayment = await page.waitForSelector("#confirm", {visible: true});
  await cancPayment.click();
  await page.waitForSelector("#redirect-button");
};

export const cancelPaymentOK = async (
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const resultMessageXPath =
    "#main_content > div > div > div > div.MuiBox-root.css-5vb4lz > div";
  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData);
  const paymentCheckPageButtonCancel = await page.waitForSelector(
    "#paymentCheckPageButtonCancel"
  );
  await paymentCheckPageButtonCancel.click();
  const cancPayment = await page.waitForSelector("#confirm");
  await cancPayment.click();
  await page.waitForNavigation();
  // this new timeout is needed for how react 18 handles the addition of animated content 
  // to the page. Without it, the resultMessageXPath never resolves
  await new Promise((r) => setTimeout(r, 200));
  const message = await page.waitForSelector(resultMessageXPath);
  return await message.evaluate((el) => el.textContent);
};

export const cancelPaymentKO = async (noticeCode, fiscalCode, email) => {
  await fillAndSubmitSatispayPayment(noticeCode, fiscalCode, email);
  const paymentCheckPageButtonCancel = await page.waitForSelector(
    "#paymentCheckPageButtonCancel"
  );
  await paymentCheckPageButtonCancel.click();
  const cancPayment = await page.waitForSelector("#confirm");
  await cancPayment.click();
  const message = await page.waitForSelector(
    "#idTitleErrorModalPaymentCheckPage"
  );
  return await message.evaluate((el) => el.textContent);
};


export const selectLanguage = async (language) => {
  await page.select("#languageMenu", language);
};


/*
 * utility function to emulate edit psp list and sort. This function has many timeout to allow view transitions to end before try to click CTA buttons
 */
export const checkPspListFees = async (
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const pspEditButtonSelector = "#pspEdit";
  const pspFeeSortButtonId = "#sortByFee";

  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData);

  const pspEditButton = await page.waitForSelector(pspEditButtonSelector, {clickable: true});
  await pspEditButton.click();
  await new Promise((r) => setTimeout(r, 500));
  const pspFeeSortButton = await page.waitForSelector(pspFeeSortButtonId, {clickable: true});
  await pspFeeSortButton.click();
  await new Promise((r) => setTimeout(r, 500));

  // Wait for the elements and get the list of divs
  const pspElements = await page.$$('.pspFeeValue');

  // Extract numeric content from each div and return as an array
  const numericContents = await Promise.all(
    Array.from(pspElements).map(async (element) => {
      const text = await element.evaluate((el) => el.textContent);
      // We want to skip the Dollar, Euro, or any currency placeholder
      let numbers = text.match(/[\d,]+/g); // This will match sequences of digits and commas
      let result = numbers ? numbers.join("").replace(",", ".") : ""; // Join the matched numbers if any and replace , as separator with .
      return parseFloat(result) || 0; // Convert to number, default to 0 if NaN
    })
  );
  const closePspListButton = await page.waitForSelector("#closePspList", { clickable: true});
  await closePspListButton.click();
  return numericContents;
};

/*
 * utility function to emulate edit psp list and sort. This function has many timeout to allow view transitions to end before try to click CTA buttons
 */
export const checkPspListNames = async (
  noticeCode,
  fiscalCode,
  email,
  cardData
) => {
  const pspEditButtonSelector = "#pspEdit";
  const pspFeeSortButtonId = "#sortByName";

  await fillAndSubmitCardDataForm(noticeCode, fiscalCode, email, cardData);

  const pspEditButton = await page.waitForSelector(pspEditButtonSelector, {visible: true, clickable: true});
  await pspEditButton.click();
  await new Promise((r) => setTimeout(r, 500));
  const pspFeeSortButton = await page.waitForSelector(pspFeeSortButtonId, {visible: true, clickable: true});
  await pspFeeSortButton.click();
  await new Promise((r) => setTimeout(r, 500));

  // Wait for the elements and get the list of divs
  const pspElements = await page.$$(".pspFeeName");
  // Extract numeric content from each div and return as an array
  const feeNameContents = await Promise.all(
    Array.from(pspElements).map(async (element) => {
      const text = await element.evaluate((el) => el.textContent);
        return (text) || ""; 
    })
  );
  const closePspListButton = await page.waitForSelector("#closePspList", {visible: true, clickable: true});
  await closePspListButton.click();
  return feeNameContents;
};
