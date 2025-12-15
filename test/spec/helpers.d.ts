// helpers.d.ts
import { Page } from "@playwright/test";

export interface CardData {
  number: string;
  expirationDate: string;
  ccv: string;
  holderName: string;
}

export function payNotice(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  cardData: CardData,
  checkoutUrlAfterAuth: string
): Promise<string>;

export function clickButtonBySelector(
  page: Page,
  selector: string
): Promise<void>;

export function verifyPaymentAndGetError(
  page: Page,
  noticeCode: string,
  fiscalCode: string
): Promise<string | null>;

export function activatePaymentAndGetError(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  cardData: CardData,
  selectorId: string
): Promise<string | null>;

export function authorizePaymentAndGetError(
  noticeCode: string,
  fiscalCode: string,
  email: string,
  cardData: CardData,
  errorMessageTitleSelector: string
): Promise<string | null>;

export function checkPspDisclaimerBeforeAuthorizePayment(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  cardData: CardData
): Promise<string | null>;

export function checkErrorOnCardDataFormSubmit(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  cardData: CardData
): Promise<string | null>;

export function selectKeyboardForm(page: Page): Promise<void>;

export function clickLoginButton(page: Page): Promise<void>;

export function getUserButton(
  page: Page
): Promise<ReturnType<Page["locator"]> | null>;

export function tryLoginWithAuthCallbackError(
  page: Page,
  noticeCode: string,
  fiscalCode: string
): Promise<{ title: string; body: string; currentUrl: string }>;

export function fillPaymentNotificationForm(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  submit?: boolean
): Promise<void>;

export function fillAndSubmitCardDataForm(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  cardData: CardData
): Promise<void>;

export function tryHandlePspPickerPage(page: Page): Promise<void>;

export function selectPspOnPspPickerPage(page: Page): Promise<void>;

export function fillAndSubmitSatispayPayment(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string
): Promise<void>;

export function fillEmailForm(page: Page, email: string): Promise<void>;

export function choosePaymentMethod(page: Page, method: string): Promise<void>;

export function verifyPaymentMethods(page: Page): Promise<boolean>;

export function fillCardDataForm(page: Page, cardData: CardData): Promise<void>;

export function cancelPaymentAction(page: Page): Promise<void>;

export function cancelPaymentOK(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  cardData: CardData
): Promise<string | null>;

export function cancelPaymentKO(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string
): Promise<string | null>;

export function closeErrorModal(page: Page): Promise<void>;

export function selectLanguage(page: Page, language: string): Promise<void>;

export function checkPspListFees(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  cardData: CardData
): Promise<Array<number>>;

export function checkPspListNames(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  cardData: CardData
): Promise<Array<string>>;

export function activateApmPaymentAndGetError(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  selectorId: string
): Promise<string | null>;

export function chooseApmMethod(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  paymentTypeCode: string
): Promise<void>;

export function fillAndSearchFormPaymentMethod(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  paymentMethod: string
): Promise<void>;

export function filterPaymentMethodByName(
  page: Page,
  methodFilterName: string
): Promise<void>;

export function verifyPaymentMethodsLength(
  page: Page,
  length: number
): Promise<boolean>;

export function verifyPaymentMethodsContains(
  page: Page,
  paymentMethodTypeCode: string
): Promise<boolean>;

export function noPaymentMethodsMessage(page: Page): Promise<string | null>;

export function authorizeApmPaymentAndGetError(
  page: Page,
  noticeCode: string,
  fiscalCode: string,
  email: string,
  paymentTypeCode: string,
  errorMessageTitleSelector: string
): Promise<string | null>;

export function filterByType(page: Page, id: string): Promise<void>;

export function filterByTwoType(
  page: Page,
  id_1: string,
  id_2: string
): Promise<void>;

export function verifyPaymentMethodsNotContains(
  page: Page,
  paymentMethodTypeCode: string
): Promise<boolean>;
