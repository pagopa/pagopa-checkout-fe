import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import PaymentCheckPage from "../PaymentCheckPage";
import {
  calculateFees,
  cancelPayment,
  checkLogout,
  proceedToPayment,
} from "../../utils/api/helper";
import {
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import {
  paymentInfo,
  paymentMethod,
  paymentMethodInfo,
  pspSelected,
  sessionPayment,
  transaction,
} from "./_model";

// Create a Jest spy for navigation
const navigate = jest.fn();

// Mock react-router-dom so that useNavigate returns our spy function.
// Note: We spread the actual module to preserve its other exports.
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => navigate,
}));

jest.mock("../../redux/slices/threshold.ts", () => ({
  selectThreshold: () => ({
    belowThreshold: true,
  }),
}));

// Mock translations and recaptcha
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({
    i18nKey,
  }: {
    i18nKey?: string;
    values?: Record<string, any>;
    components?: Array<any>;
    children?: React.ReactNode;
  }) => <span data-testid="mocked-trans">{i18nKey || "no-key"}</span>,
}));

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  SessionItems: {
    paymentMethod: "paymentMethod",
    paymentMethodInfo: "paymentMethodInfo",
    pspSelected: "pspSelected",
    transaction: "transaction",
    useremail: "useremail",
    paymentInfo: "paymentInfo",
    sessionPayment: "sessionPayment",
  },
}));

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock the API call with fp-ts TaskEither
jest.mock("../../utils/api/helper", () => ({
  calculateFees: jest.fn(),
  cancelPayment: jest.fn(),
  proceedToPayment: jest.fn(),
  checkLogout: jest.fn(),
}));

jest.mock("../../utils/config/config", () => ({
  getConfigOrThrow: jest.fn(),
}));

const mockGetSessionItem = (item: SessionItems) => {
  switch (item) {
    case "paymentMethod":
      return paymentMethod;
    case "paymentMethodInfo":
      return paymentMethodInfo;
    case "pspSelected":
      return pspSelected;
    case "transaction":
      return transaction;
    case "useremail":
      return "test@pagopa.it";
    case "paymentInfo":
      return paymentInfo;
    case "sessionPayment":
      return sessionPayment;
    default:
      return undefined;
  }
};

describe("PaymentCheckPage", () => {
  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItem);
  });

  test("test page structure", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const cardEditBUtton = container.querySelector("#cardEdit");
    const pspEditButton = container.querySelector("#pspEdit");
    const cancelPaymentButton = container.querySelector(
      "#paymentCheckPageButtonCancel"
    );
    const submitPaymentButtoon = container.querySelector(
      "#paymentCheckPageButtonPay"
    );
    // Verify buttons and click
    expect(cardEditBUtton).toBeVisible();
    expect(pspEditButton).toBeVisible();
    expect(cancelPaymentButton).toBeVisible();
    expect(submitPaymentButtoon).toBeVisible();
    // expect(cancelPaymentModal).not.toBeInTheDocument();

    expect(calculateFees).toHaveBeenCalledTimes(0);
    expect(checkLogout).toHaveBeenCalledTimes(0);
    expect(cancelPayment).toHaveBeenCalledTimes(0);
    expect(proceedToPayment).toHaveBeenCalledTimes(0);
  });

  test("test edit cardbutton should navigate to payment choice page", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const cardEditBUtton = container.querySelector("#cardEdit");

    // Verify buttons and click
    await waitFor(() => {
      expect(cardEditBUtton).toBeInTheDocument();
      expect(cardEditBUtton).toBeVisible();
      expect(cardEditBUtton).toBeEnabled();
    });
    fireEvent.click(cardEditBUtton!);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/scegli-metodo", {
        replace: true,
      });
    });
  });

  test("test edit psp should change psp selected", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const pspEditButton = container.querySelector("#pspEdit");

    // Verify buttons and click
    await waitFor(() => {
      expect(pspEditButton).toBeInTheDocument();
      expect(pspEditButton).toBeVisible();
      expect(pspEditButton).toBeEnabled();
    });
    fireEvent.click(pspEditButton!);

    await waitFor(() => {
      expect(calculateFees).toHaveBeenCalled();
    });
  });

  test("test submit payment button to call proceedToPayment", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    const submitPaymentButtoon = container.querySelector(
      "#paymentCheckPageButtonPay"
    );

    // Verify buttons and click
    expect(submitPaymentButtoon).toBeInTheDocument();
    expect(submitPaymentButtoon).toBeVisible();
    expect(submitPaymentButtoon).toBeEnabled();

    fireEvent.click(submitPaymentButtoon!);

    await waitFor(() => {
      expect(proceedToPayment).toHaveBeenCalled();
    });
  });

  test("test cancel payment button to show cancel modal and cancel payment on modal submit click", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const cancelPaymentButton = container.querySelector(
      "#paymentCheckPageButtonCancel"
    );

    // Verify buttons and click
    expect(cancelPaymentButton).toBeVisible();

    fireEvent.click(cancelPaymentButton!);

    const cancelModalButtonSubmit = screen.getByText(
      "paymentCheckPage.modal.submitButton"
    );
    expect(cancelModalButtonSubmit).toBeInTheDocument();
    fireEvent.click(cancelModalButtonSubmit);
    await waitFor(() => {
      expect(cancelPayment).toHaveBeenCalled();
    });
  });

  test("test cancel payment button to show cancel modal and hide on cancel modal click", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const cancelPaymentButton = container.querySelector(
      "#paymentCheckPageButtonCancel"
    );
    // Verify buttons and click
    expect(cancelPaymentButton).toBeVisible();

    fireEvent.click(cancelPaymentButton!);

    const cancelModalButtonCancel = screen.getByText(
      "paymentCheckPage.modal.cancelButton"
    );
    expect(cancelModalButtonCancel).toBeInTheDocument();

    fireEvent.click(cancelModalButtonCancel);
    expect(cancelModalButtonCancel).not.toBeVisible();
  });
});
