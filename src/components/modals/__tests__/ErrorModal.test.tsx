import "@testing-library/jest-dom";
import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import ErrorModal from "../ErrorModal";

import { FaultCategoryEnum } from "../../../../generated/definitions/payment-ecommerce/FaultCategory";
import { ErrorsType } from "../../../utils/errors/checkErrorsModel";
import { PaymentCategoryResponses } from "../../../utils/errors/errorsModel";
import { mixpanel } from "../../../utils/mixpanel/mixpanelHelperInit";
import {
  getDataEntryTypeFromSessionStorage,
  getPaymentInfoFromSessionStorage,
} from "../../../utils/mixpanel/mixpanelTracker";
import {
  MixpanelDataEntryType,
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelPaymentPhase,
} from "../../../utils/mixpanel/mixpanelEvents";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "GENERIC_ERROR.title": "An error occurred",
        "GENERIC_ERROR.body": "Something went wrong",
        "PAYMENT_UNAVAILABLE.title": "Payment Unavailable",
        "PAYMENT_UNAVAILABLE.body":
          "The payment service is currently unavailable",
        "PAYMENT_EXPIRED.title": "Payment Expired",
        "PAYMENT_EXPIRED.body": "Your payment session has expired",
        "PAYMENT_DUPLICATED.title": "Duplicate Payment",
        "PAYMENT_DUPLICATED.body": "This payment has already been processed",
        "PAYMENT_DATA_ERROR.title": "Payment Data Error",
        "PAYMENT_DATA_ERROR.body": "There was an error with your payment data",
        "PAYMENT_UNKNOWN.title": "Unknown Payment Error",
        "PAYMENT_UNKNOWN.body": "An unknown payment error occurred",
        "PAYMENT_CANCELED.title": "Payment Canceled",
        "PAYMENT_CANCELED.body": "The payment was canceled",
        "PAYMENT_ONGOING.title": "Payment In Progress",
        "PAYMENT_ONGOING.body": "Your payment is being processed",
        "DOMAIN_UNKNOWN.title": "Unknown Domain",
        "DOMAIN_UNKNOWN.body": "The domain is unknown",
        "TIMEOUT.title": "Timeout Error",
        "TIMEOUT.body": "The operation timed out",
        "STATUS_ERROR.title": "Status Error",
        "STATUS_ERROR.body": "There was an error checking the payment status",
        "INVALID_QRCODE.title": "Invalid QR Code",
        "INVALID_QRCODE.body": "The QR Code is invalid",
        "clipboard.copy": "Copy",
        "clipboard.copied": "Copied",
        "button.retry": "Retry",
        "button.close": "Close",
        "button.help": "Help",
      };

      return translations[key] || key;
    },
  }),
}));

jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");

  return {
    ...actual,
    useTheme: () => ({
      palette: {
        background: { default: "#ffffff" },
        info: { main: "#0288d1" },
      },
    }),
  };
});

jest.mock("../../../utils/errors/errorsModel", () => {
  const { ErrorsType } = jest.requireActual(
    "../../../utils/errors/checkErrorsModel"
  );

  return {
    PaymentCategoryResponses: jest.fn(),
    ErrorResponses: {
      [ErrorsType.INVALID_QRCODE]: {
        title: "INVALID_QRCODE.title",
        body: "INVALID_QRCODE.body",
        buttons: [{ title: "button.close" }, { title: "button.help" }],
      },
    },
    ErrorModalBtn: {},
  };
});

interface ErrorModalBtn {
  text?: string;
  title?: string;
  action?: () => void;
}

jest.mock("../../FormButtons/ErrorButtons", () => ({
  ErrorButtons: ({
    handleClose,
    buttonsDetail,
  }: {
    handleClose: () => void;
    buttonsDetail: Array<ErrorModalBtn>;
  }) => (
    <div data-testid="error-buttons">
      {buttonsDetail.map((button, index) => {
        const label = button.text || button.title || `button-${index}`;

        return (
          <button
            key={`${label}-${index}`}
            onClick={button.action || handleClose}
            data-testid={`button-${label}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  ),
}));

jest.mock("@mui/icons-material/CopyAll", () => ({
  __esModule: true,
  default: () => <span data-testid="copy-icon">CopyIcon</span>,
}));

jest.mock("../../../utils/mixpanel/mixpanelHelperInit", () => ({
  mixpanel: {
    track: jest.fn(),
  },
}));

jest.mock("../../../utils/mixpanel/mixpanelTracker", () => ({
  getDataEntryTypeFromSessionStorage: jest.fn(),
  getPaymentInfoFromSessionStorage: jest.fn(),
}));

// eslint-disable-next-line functional/immutable-data
Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  value: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
});

const mockPaymentInfo = {
  paName: "companyName",
  paFiscalCode: "77777777777",
  amount: 12000,
  dueDate: "2021-07-31",
};

const mockedPaymentCategoryResponses =
  PaymentCategoryResponses as unknown as jest.Mock;
const mockedGetPaymentInfo =
  getPaymentInfoFromSessionStorage as unknown as jest.Mock;
const mockedGetDataEntryType =
  getDataEntryTypeFromSessionStorage as unknown as jest.Mock;
const mockedMixpanelTrack = mixpanel.track as jest.Mock;
const mockedClipboardWriteText = navigator.clipboard.writeText as jest.Mock;

const buildPaymentCategoryResponses = () => ({
  [FaultCategoryEnum.GENERIC_ERROR]: {
    title: "GENERIC_ERROR.title",
    body: "GENERIC_ERROR.body",
    buttons: [{ title: "button.close", action: undefined }],
  },
  [FaultCategoryEnum.PAYMENT_UNAVAILABLE]: {
    title: "PAYMENT_UNAVAILABLE.title",
    body: "PAYMENT_UNAVAILABLE.body",
    buttons: [{ title: "button.close", action: undefined }],
  },
  [FaultCategoryEnum.PAYMENT_EXPIRED]: {
    title: "PAYMENT_EXPIRED.title",
    body: "PAYMENT_EXPIRED.body",
    buttons: [{ title: "button.close", action: undefined }],
  },
  [FaultCategoryEnum.PAYMENT_DATA_ERROR]: {
    title: "PAYMENT_DATA_ERROR.title",
    body: "ErrorCodeDescription",
    detail: true,
    buttons: [{ title: "button.close", action: undefined }],
  },
  [FaultCategoryEnum.PAYMENT_DUPLICATED]: {
    title: "PAYMENT_DUPLICATED.title",
    body: "PAYMENT_DUPLICATED.body",
    buttons: [{ title: "button.close", action: undefined }],
  },
  [FaultCategoryEnum.PAYMENT_UNKNOWN]: {
    title: "PAYMENT_UNKNOWN.title",
    body: "PAYMENT_UNKNOWN.body",
    buttons: [{ title: "button.close", action: undefined }],
  },
  [FaultCategoryEnum.PAYMENT_CANCELED]: {
    title: "PAYMENT_CANCELED.title",
    body: "PAYMENT_CANCELED.body",
    buttons: [{ title: "button.close", action: undefined }],
  },
  [FaultCategoryEnum.PAYMENT_ONGOING]: {
    title: "PAYMENT_ONGOING.title",
    body: "PAYMENT_ONGOING.body",
    buttons: [{ title: "button.close", action: undefined }],
  },
  [FaultCategoryEnum.DOMAIN_UNKNOWN]: {
    title: "DOMAIN_UNKNOWN.title",
    body: "DOMAIN_UNKNOWN.body",
    buttons: [{ title: "button.close", action: undefined }],
  },
  [ErrorsType.STATUS_ERROR]: {
    title: "STATUS_ERROR.title",
    body: "STATUS_ERROR.body",
    buttons: [
      { title: "button.close", action: undefined },
      { title: "button.retry", action: undefined },
    ],
  },
  [ErrorsType.TIMEOUT]: {
    title: "TIMEOUT.title",
    body: "TIMEOUT.body",
    buttons: [
      { title: "button.close", action: undefined },
      { title: "button.retry", action: undefined },
    ],
  },
});

const getDialogAlert = () => {
  const dialogs = screen
    .getAllByRole("alert")
    .filter((el) => el.classList.contains("MuiDialog-root"));

  if (dialogs.length !== 1) {
    throw new Error(
      `Expected exactly 1 MuiDialog-root alert, got ${dialogs.length}`
    );
  }

  return dialogs[0];
};

describe("ErrorModal Component", () => {
  const mockOnClose = jest.fn();
  const mockOnRetry = jest.fn();

  const renderModal = (
    props: Partial<React.ComponentProps<typeof ErrorModal>> = {}
  ) =>
    render(
      <ErrorModal
        error={FaultCategoryEnum.GENERIC_ERROR}
        open={true}
        onClose={mockOnClose}
        {...props}
      />
    );

  beforeEach(() => {
    jest.clearAllMocks();

    mockedPaymentCategoryResponses.mockImplementation(
      buildPaymentCategoryResponses
    );
    mockedGetPaymentInfo.mockReturnValue(mockPaymentInfo);
    mockedGetDataEntryType.mockReturnValue(MixpanelDataEntryType.MANUAL);
  });

  it("renders a generic error with buttons", () => {
    renderModal();

    expect(screen.getByText("An error occurred")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByTestId("error-buttons")).toBeInTheDocument();
    expect(screen.getByTestId("button-button.close")).toBeInTheDocument();
  });

  it("closes the modal when the close button is clicked", () => {
    renderModal();

    fireEvent.click(screen.getByTestId("button-button.close"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders a known payment category without details", () => {
    renderModal({ error: FaultCategoryEnum.PAYMENT_UNAVAILABLE });

    expect(screen.getByText("Payment Unavailable")).toBeInTheDocument();
    expect(
      screen.getByText("The payment service is currently unavailable")
    ).toBeInTheDocument();
    expect(screen.queryByText("ErrorCodeDescription")).not.toBeInTheDocument();
  });

  it("renders ErrorResponses errors instead of fault category responses", () => {
    renderModal({ error: ErrorsType.INVALID_QRCODE });

    expect(screen.getByText("Invalid QR Code")).toBeInTheDocument();
    expect(screen.getByText("The QR Code is invalid")).toBeInTheDocument();
    expect(screen.getByTestId("button-button.close")).toBeInTheDocument();
    expect(screen.getByTestId("button-button.help")).toBeInTheDocument();
  });

  it("renders error details and forwards the detail to PaymentCategoryResponses", () => {
    renderModal({
      error: `${FaultCategoryEnum.PAYMENT_DATA_ERROR}-INVALID_CARD_NUMBER`,
      errorId: "custom-error-id",
    });

    expect(screen.getByText("Payment Data Error")).toBeInTheDocument();
    expect(screen.getByText("ErrorCodeDescription")).toBeInTheDocument();

    const dialog = getDialogAlert();
    const alertElement = within(dialog).getByRole("alert");
    const alertTitle = within(alertElement).getByText("INVALID_CARD_NUMBER");

    expect(alertTitle).toBeInTheDocument();
    expect(alertTitle).toHaveAttribute("id", "custom-error-id");
    expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
    expect(mockedPaymentCategoryResponses).toHaveBeenCalledWith(
      "INVALID_CARD_NUMBER"
    );
  });

  it("renders an empty detail area when the detailed category has no error code", () => {
    renderModal({
      error: FaultCategoryEnum.PAYMENT_DATA_ERROR,
      errorId: "empty-error-id",
    });

    const dialog = getDialogAlert();
    const alertElement = within(dialog).getByRole("alert");
    const alertTitle = alertElement.querySelector(".MuiAlertTitle-root");

    expect(screen.getByText("Payment Data Error")).toBeInTheDocument();
    expect(screen.getByText("ErrorCodeDescription")).toBeInTheDocument();
    expect(alertTitle).toHaveAttribute("id", "empty-error-id");
    expect(alertTitle).toHaveTextContent("");
  });

  it("copies the error code to the clipboard and resets the tooltip on mouse leave", async () => {
    renderModal({
      error: `${FaultCategoryEnum.PAYMENT_DATA_ERROR}-INVALID_CARD_NUMBER`,
    });

    const copyButton = screen.getByRole("button", { name: "Copy" });

    fireEvent.click(copyButton);

    expect(mockedClipboardWriteText).toHaveBeenCalledWith(
      "INVALID_CARD_NUMBER"
    );

    await waitFor(() => {
      expect(copyButton).toHaveAttribute("aria-label", "Copied");
    });

    fireEvent.mouseLeave(copyButton);

    await waitFor(() => {
      expect(copyButton).toHaveAttribute("aria-label", "Copy");
    });
  });

  it("overrides the second STATUS_ERROR button with onRetry", () => {
    renderModal({
      error: ErrorsType.STATUS_ERROR,
      onRetry: mockOnRetry,
    });

    expect(screen.getByText("Status Error")).toBeInTheDocument();
    expect(
      screen.getByText("There was an error checking the payment status")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("button-button.retry"));

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
    expect(mockedMixpanelTrack).not.toHaveBeenCalled();
  });

  it("overrides the second TIMEOUT button with onRetry", () => {
    renderModal({
      error: ErrorsType.TIMEOUT,
      onRetry: mockOnRetry,
    });

    expect(screen.getByText("Timeout Error")).toBeInTheDocument();
    expect(screen.getByText("The operation timed out")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("button-button.retry"));

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("uses onClose for STATUS_ERROR retry button when onRetry is not provided", () => {
    renderModal({
      error: ErrorsType.STATUS_ERROR,
      onRetry: undefined,
    });

    fireEvent.click(screen.getByTestId("button-button.retry"));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockOnRetry).not.toHaveBeenCalled();
  });

  it("shows the progress bar and hides buttons for POLLING_SLOW", () => {
    renderModal({ error: ErrorsType.POLLING_SLOW });

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByTestId("error-buttons")).not.toBeInTheDocument();
  });

  it("falls back to the configured generic response for unknown categories", () => {
    renderModal({ error: "UNKNOWN_CATEGORY" });

    expect(screen.getByText("An error occurred")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByTestId("button-button.close")).toBeInTheDocument();
    expect(mockedMixpanelTrack).not.toHaveBeenCalled();
  });

  it("falls back to hard-coded generic title/body and hides buttons when no generic response exists", () => {
    mockedPaymentCategoryResponses.mockReturnValueOnce({});

    renderModal({ error: "UNKNOWN_CATEGORY" });

    expect(screen.getByText("An error occurred")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.queryByTestId("error-buttons")).not.toBeInTheDocument();
  });

  it("applies custom style and accessibility ids", () => {
    renderModal({
      titleId: "custom-title-id",
      bodyId: "custom-body-id",
      style: { backgroundColor: "red" },
    });

    const titleElement = screen.getByText("An error occurred");
    const bodyElement = screen.getByText("Something went wrong");
    const dialog = getDialogAlert();
    const paper = dialog.querySelector(".MuiDialog-paper");

    expect(titleElement).toHaveAttribute("id", "custom-title-id");
    expect(bodyElement).toHaveAttribute("id", "custom-body-id");
    expect(paper).toHaveStyle({ backgroundColor: "red" });
  });

  it.each([
    [FaultCategoryEnum.PAYMENT_DUPLICATED, MixpanelEventsId.PAYMENT_DUPLICATED],
    [FaultCategoryEnum.PAYMENT_ONGOING, MixpanelEventsId.PAYMENT_ONGOING],
    [FaultCategoryEnum.PAYMENT_EXPIRED, MixpanelEventsId.PAYMENT_EXPIRED],
    [
      FaultCategoryEnum.PAYMENT_UNAVAILABLE,
      MixpanelEventsId.PAYMENT_UNAVAILABLE,
    ],
    [FaultCategoryEnum.PAYMENT_UNKNOWN, MixpanelEventsId.PAYMENT_UNKNOWN],
    [FaultCategoryEnum.DOMAIN_UNKNOWN, MixpanelEventsId.DOMAIN_UNKNOWN],
    [FaultCategoryEnum.PAYMENT_CANCELED, MixpanelEventsId.PAYMENT_CANCELED],
    [FaultCategoryEnum.GENERIC_ERROR, MixpanelEventsId.GENERIC_ERROR],
    [FaultCategoryEnum.PAYMENT_DATA_ERROR, MixpanelEventsId.PAYMENT_DATA_ERROR],
  ])("tracks mixpanel event for %s", (faultCategory, expectedMixpanelEvent) => {
    renderModal({ error: `${faultCategory}-DETAIL_CODE` });

    expect(mockedMixpanelTrack).toHaveBeenCalledTimes(1);
    expect(mockedMixpanelTrack).toHaveBeenCalledWith(
      expectedMixpanelEvent,
      expect.objectContaining({
        EVENT_ID: expectedMixpanelEvent,
        EVENT_CATEGORY: MixpanelEventCategory.KO,
        reason: "DETAIL_CODE",
        data_entry: MixpanelDataEntryType.MANUAL,
        organization_name: "companyName",
        organization_fiscal_code: "77777777777",
        amount: 12000,
        expiration_date: "2021-07-31",
        payment_phase: MixpanelPaymentPhase.VERIFICA,
      })
    );
  });

  it("tracks mixpanel event with null reason when the fault category has no detail", () => {
    renderModal({ error: FaultCategoryEnum.PAYMENT_EXPIRED });

    expect(mockedMixpanelTrack).toHaveBeenCalledWith(
      MixpanelEventsId.PAYMENT_EXPIRED,
      expect.objectContaining({
        reason: null,
      })
    );
  });
});
