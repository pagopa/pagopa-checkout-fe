import { FaultCategory } from "../../../generated/definitions/payment-ecommerce/FaultCategory";

const HELPDESK_URL: string = "https://www.pagopa.gov.it/it/helpdesk/";

export type ErrorModalBtn = {
  title: string;
  action?: () => void;
};

type ErrorModal = {
  title: string;
  body?: string;
  detail?: boolean;
  code?: string;
  closeLabel?: string;
  buttons?: Array<ErrorModalBtn>;
};

export const PaymentCategoryResponses: Record<FaultCategory, ErrorModal> = {
  DOMAIN_UNKNOWN: {
    title: "DOMAIN_UNKNOWN.title",
    detail: true,
    buttons: [
      {
        title: "errorButton.help",
        action: () => {
          window.open(HELPDESK_URL, "_blank")?.focus();
        },
      },
      {
        title: "errorButton.close",
      },
    ],
  },
  PAYMENT_UNAVAILABLE: {
    title: "PAYMENT_UNAVAILABLE.title",
    detail: true,
    buttons: [
      {
        title: "errorButton.help",
        action: () => {
          window.open(HELPDESK_URL, "_blank")?.focus();
        },
      },
      {
        title: "errorButton.close",
      },
    ],
  },
  PAYMENT_DATA_ERROR: {
    title: "PAYMENT_DATA_ERROR.title",
    detail: true,
    buttons: [
      {
        title: "errorButton.help",
        action: () => {
          window.open(HELPDESK_URL, "_blank")?.focus();
        },
      },
      {
        title: "errorButton.close",
      },
    ],
  },
  GENERIC_ERROR: {
    title: "GENERIC_ERROR.title",
    detail: false,
    body: "GENERIC_ERROR.body",
    buttons: [
      {
        title: "errorButton.close",
      },
      {
        title: "errorButton.help",
        action: () => {
          window.open(HELPDESK_URL, "_blank")?.focus();
        },
      },
    ],
  },
  PAYMENT_DUPLICATED: {
    title: "PAYMENT_DUPLICATED.title",
    detail: false,
    body: "PAYMENT_DUPLICATED.body",
    buttons: [
      {
        title: "errorButton.close",
      },
    ],
  },
  PAYMENT_ONGOING: {
    title: "PAYMENT_ONGOING.title",
    detail: false,
    body: "PAYMENT_ONGOING.body",
    buttons: [
      {
        title: "errorButton.close",
      },
    ],
  },
  PAYMENT_EXPIRED: {
    title: "PAYMENT_EXPIRED.title",
    detail: false,
    body: "PAYMENT_EXPIRED.body",
    buttons: [
      {
        title: "errorButton.close",
      },
    ],
  },
  PAYMENT_UNKNOWN: {
    title: "PAYMENT_UNKNOWN.title",
    detail: false,
    body: "PAYMENT_UNKNOWN.body",
    buttons: [
      {
        title: "errorButton.close",
      },
    ],
  },
  PAYMENT_CANCELED: {
    title: "PAYMENT_CANCELED.title",
    detail: false,
    body: "PAYMENT_CANCELED.body",
    buttons: [
      {
        title: "errorButton.close",
      },
    ],
  },
};
