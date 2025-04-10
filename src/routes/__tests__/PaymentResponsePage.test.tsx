import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import {
  clearStorage,
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import PaymentResponsePage from "../../routes/PaymentResponsePage";
import "jest-location-mock";
import { checkLogout } from "../../utils/api/helper";
import { getViewOutcomeFromEcommerceResultCode } from "../../utils/transactions/TransactionResultUtil";
import {
  paymentMethod,
  paymentMethodInfo,
  pspSelected,
  transaction,
  paymentInfo,
  sessionPayment,
  cart,
} from "./_model";

jest.mock("../../utils/transactions/TransactionResultUtil", () => ({
  getViewOutcomeFromEcommerceResultCode: jest.fn(),
  ViewOutcomeEnum: {
    SUCCESS: "0",
    GENERIC_ERROR: "1",
    AUTH_ERROR: "2",
    INVALID_DATA: "3",
    TIMEOUT: "4",
    INVALID_CARD: "7",
    CANCELED_BY_USER: "8",
    EXCESSIVE_AMOUNT: "10",
    TAKING_CHARGE: "17",
    REFUNDED: "18",
    PSP_ERROR: "25",
    BALANCE_LIMIT: "116",
    CVV_ERROR: "117",
    LIMIT_EXCEEDED: "121",
  },
}));

// Mock translations
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
  clearStorage: jest.fn(),
  SessionItems: {
    paymentMethod: "paymentMethod",
    paymentMethodInfo: "paymentMethodInfo",
    pspSelected: "pspSelected",
    transaction: "transaction",
    useremail: "useremail",
    paymentInfo: "paymentInfo",
    sessionPayment: "sessionPayment",
    cart: "cart",
  },
}));

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock the API call with fp-ts TaskEither
jest.mock("../../utils/api/helper", () => ({
  checkLogout: jest.fn(),
}));

jest.mock("../../utils/api/response", () => ({
  callServices: jest.fn(),
}));

// Mock the config module
jest.mock("../../utils/config/config", () =>
  // Return the actual implementation but with our mock for getConfigOrThrow
  ({
    // This is the key fix - handle the case when no key is provided
    getConfigOrThrow: jest.fn((key) => {
      // Create a mapping of all config values
      const configValues = {
        CHECKOUT_ENV: "TEST",
        // Add other config values as needed
      } as any;

      // If no key provided, return all config values (this is the important part)
      if (key === undefined) {
        return configValues;
      }

      // Otherwise return the specific config value
      return configValues[key] || "";
    }),
    isTestEnv: jest.fn(() => false),
    isDevEnv: jest.fn(() => false),
    isProdEnv: jest.fn(() => true),
  })
);

const mockGetSessionItemNoCart = (item: SessionItems) => {
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
    case "cart":
      return undefined;
    default:
      return undefined;
  }
};

const mockGetSessionItemWithCart = (item: SessionItems) => {
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
    case "cart":
      return cart;
    default:
      return undefined;
  }
};

describe("V1PaymentResponsePage no cart", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItemNoCart);
  });
  // TEST WITHOUT CART
  test.each([
    "0",
    "1",
    "2",
    "3",
    "4",
    "7",
    "8",
    "10",
    "17",
    "18",
    "25",
    "116",
    "117",
    "121",
  ])(
    "should show payment outcome message and come back to home on close button click",
    (val) => {
      (getViewOutcomeFromEcommerceResultCode as jest.Mock).mockImplementation(
        () => val
      );
      renderWithReduxProvider(
        <MemoryRouter>
          <PaymentResponsePage />
        </MemoryRouter>
      );
      void waitFor(() => {
        expect(
          screen.getByText("paymentResponsePage." + val + ".title")
        ).toBeVisible();
        expect(checkLogout).toHaveBeenCalled();
        expect(clearStorage).toHaveBeenCalled();
        fireEvent.click(screen.getByText("errorButton.close"));
        expect(location.href).toBe("http://localhost/");
      });
    }
  );
});

describe("V1PaymentResponsePage with cart", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    (getSessionItem as jest.Mock).mockImplementation(
      mockGetSessionItemWithCart
    );
  });
  // TEST WITH CART
  test.each([
    "0",
    "1",
    "2",
    "3",
    "4",
    "7",
    "8",
    "10",
    "17",
    "18",
    "25",
    "116",
    "117",
    "121",
  ])(
    "should show payment outcome message and come back to home on close button click",
    (val) => {
      (getViewOutcomeFromEcommerceResultCode as jest.Mock).mockImplementation(
        () => val
      );
      renderWithReduxProvider(
        <MemoryRouter>
          <PaymentResponsePage />
        </MemoryRouter>
      );
      void waitFor(() => {
        expect(
          screen.getByText("paymentResponsePage." + val + ".title")
        ).toBeVisible();
        expect(checkLogout).toHaveBeenCalled();
        expect(clearStorage).toHaveBeenCalled();
        fireEvent.click(
          screen.getByText("paymentResponsePage.buttons.continue")
        );
        expect(location.href).toBe(
          val === "0"
            ? cart.returnUrls.returnOkUrl.toLowerCase() + "/"
            : cart.returnUrls.returnErrorUrl.toLowerCase() + "/"
        );
      });
    }
  );
});
