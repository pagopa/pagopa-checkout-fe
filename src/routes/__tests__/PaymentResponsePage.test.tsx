/* eslint-disable sonarjs/no-identical-functions */
import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import * as router from "react-router";
import * as TE from "fp-ts/TaskEither";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import {
  clearStorage,
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import PaymentResponsePage from "../../routes/PaymentResponsePage";
import "jest-location-mock";
import { getViewOutcomeFromEcommerceResultCode } from "../../utils/transactions/TransactionResultUtil";
import { ecommerceTransaction } from "../../utils/transactions/transactionHelper";
import { getUrlParameter } from "../../utils/regex/urlUtilities";
import { decodeToUUID } from "../../utils/api/response";
import {
  paymentMethod,
  paymentMethodInfo,
  pspSelected,
  transaction,
  paymentInfo,
  sessionPayment,
  cart,
  transactionInfoOK,
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
  clearSessionItem: jest.fn(),
  SessionItems: {
    paymentMethod: "paymentMethod",
    paymentMethodInfo: "paymentMethodInfo",
    pspSelected: "pspSelected",
    transaction: "transaction",
    useremail: "useremail",
    paymentInfo: "paymentInfo",
    sessionPayment: "sessionPayment",
    cart: "cart",
    outcome: "outcome",
    totalAmount: "totalAmount",
    authToken: "authToken",
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

jest.mock("../../utils/transactions/transactionHelper", () => ({
  ecommerceTransaction: jest.fn(),
}));

jest.mock("../../utils/config/fetch", () => ({
  constantPollingWithPromisePredicateFetch: jest.fn(),
}));

jest.mock("../../utils/regex/urlUtilities", () => ({
  getUrlParameter: jest.fn(),
}));

jest.mock("../../utils/api/response", () => ({
  ...(jest.requireActual("../../utils/api/response") as any),
  decodeToUUID: jest.fn(),
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

// Create a Jest spy for navigation
const navigate = jest.fn();

describe("V1PaymentResponsePage no cart", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    jest.clearAllMocks();
    jest
      .spyOn(router, "useNavigate")
      .mockImplementation(() => navigate);
      (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItemNoCart);
      (getUrlParameter as jest.Mock).mockReturnValue(transactionInfoOK.transactionId);
      (decodeToUUID as jest.Mock).mockReturnValue(transactionInfoOK.transactionId);
      (ecommerceTransaction as jest.Mock).mockReturnValue(TE.right(transactionInfoOK));
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
  ] as const)(
    "for outcome %s => should show payment outcome message and come back to home on close button click",
    async (val) => {
      (getViewOutcomeFromEcommerceResultCode as jest.Mock).mockReturnValue(
        val
      );

      (getSessionItem as jest.Mock).mockImplementation((item: SessionItems) => {
        if (item === SessionItems.outcome) {
          return val;
        }
        if (item === SessionItems.totalAmount) {
          return 12345;
        }
        return mockGetSessionItemNoCart(item);
      });

      renderWithReduxProvider(
        <MemoryRouter>
          <PaymentResponsePage />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(
          screen.getByText(`paymentResponsePage.${val}.title`)
        ).toBeVisible();
      });
      expect(clearStorage).toHaveBeenCalled();
      fireEvent.click(screen.getByText("errorButton.close"));
      expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    }
  );
});

describe("V1PaymentResponsePage with cart", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    jest.clearAllMocks();
    jest
      .spyOn(router, "useNavigate")
      .mockImplementation(() => navigate);
      (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItemWithCart);
      (getUrlParameter as jest.Mock).mockReturnValue(transactionInfoOK.transactionId);
      (decodeToUUID as jest.Mock).mockReturnValue(transactionInfoOK.transactionId);
      (ecommerceTransaction as jest.Mock).mockReturnValue(TE.right(transactionInfoOK));
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
  ] as const)(
    "for outcome %s => should show payment outcome message and come back to home on close button click",
    async (val) => {
      (getViewOutcomeFromEcommerceResultCode as jest.Mock).mockReturnValue(
        val
      );

      (getSessionItem as jest.Mock).mockImplementation((item: SessionItems) => {
        if (item === SessionItems.outcome) {
          return val;
        }
        if (item === SessionItems.totalAmount) {
          return 12345;
        }
        return mockGetSessionItemWithCart(item);
      });

      renderWithReduxProvider(
        <MemoryRouter>
          <PaymentResponsePage />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(
          screen.getByText(`paymentResponsePage.${val}.title`)
        ).toBeVisible();
      });
      fireEvent.click(
        screen.getByText("paymentResponsePage.buttons.continue")
      );
      const expectedUrl =
        val === "0"
          ? cart.returnUrls.returnOkUrl
          : cart.returnUrls.returnErrorUrl;
      expect(window.location.replace).toHaveBeenCalledWith(
        expectedUrl
      );
    }
  );
});
