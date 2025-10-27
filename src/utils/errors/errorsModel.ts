import { FaultCategory } from "../../../generated/definitions/payment-ecommerce/FaultCategory";
import { mixpanel } from "../mixpanel/mixpanelHelperInit";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
} from "../mixpanel/mixpanelEvents";
import {
  getDataEntryTypeFromSessionStorage,
  getPaymentInfoFromSessionStorage,
} from "../mixpanel/mixpanelTracker";
import { ErrorsType } from "./checkErrorsModel";

const HELPDESK_URL: string =
  "https://assistenza.pagopa.gov.it/hc/it/search?utf8=%E2%9C%93&query=";

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

export const ErrorResponses: Partial<Record<ErrorsType, ErrorModal>> = {
  [ErrorsType.INVALID_QRCODE]: {
    title: "INVALID_QRCODE.title",
    body: "INVALID_QRCODE.body",
    detail: false,
    buttons: [
      {
        title: "errorButton.help",
        action: () => {
          sendMixpanelPaymentErrorHelpEvent("INVALID_QRCODE");
          window.open(`${HELPDESK_URL}INVALID_QRCODE`, "_blank")?.focus();
        },
      },
      {
        title: "errorButton.close",
      },
    ],
  },
};

export const PaymentCategoryResponses = (
  errorCodeDetail?: string
): Record<FaultCategory, ErrorModal> => ({
  DOMAIN_UNKNOWN: {
    title: "DOMAIN_UNKNOWN.title",
    detail: true,
    buttons: [
      {
        title: "errorButton.help",
        action: () => {
          sendMixpanelPaymentErrorHelpEvent(errorCodeDetail);
          window
            .open(
              `${HELPDESK_URL}${errorCodeDetail ?? "DOMAIN_UNKNOWN"}`,
              "_blank"
            )
            ?.focus();
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
          sendMixpanelPaymentErrorHelpEvent(errorCodeDetail);
          window
            .open(
              `${HELPDESK_URL}${errorCodeDetail ?? "PAYMENT_UNAVAILABLE"}`,
              "_blank"
            )
            ?.focus();
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
          sendMixpanelPaymentErrorHelpEvent(errorCodeDetail);
          window
            .open(
              `${HELPDESK_URL}${errorCodeDetail ?? "PAYMENT_DATA_ERROR"}`,
              "_blank"
            )
            ?.focus();
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
          sendMixpanelPaymentErrorHelpEvent(errorCodeDetail);
          window
            .open(
              `${HELPDESK_URL}${errorCodeDetail ?? "GENERIC_ERROR"}`,
              "_blank"
            )
            ?.focus();
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
});

const sendMixpanelPaymentErrorHelpEvent = (
  errorCodeDetail: string | undefined
) => {
  const paymentInfo = getPaymentInfoFromSessionStorage();
  mixpanel.track(MixpanelEventsId.CHK_PAYMENT_ERROR_HELP, {
    EVENT_ID: MixpanelEventsId.CHK_PAYMENT_ERROR_HELP,
    EVENT_CATEGORY: MixpanelEventCategory.UX,
    error: errorCodeDetail,
    organization_name: paymentInfo?.paName,
    organization_fiscal_code: paymentInfo?.paFiscalCode,
    data_entry: getDataEntryTypeFromSessionStorage(),
    expiration_date: paymentInfo?.dueDate,
  });
};
