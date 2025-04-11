import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import {
  clearStorage,
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import PaymentResponsePageV2 from "../../routes/PaymentResponsePageV2";
import "jest-location-mock";
import { getFragmentParameter } from "../../utils/regex/urlUtilities";
import { checkLogout } from "../../utils/api/helper";
import {
  paymentMethod,
  paymentMethodInfo,
  pspSelected,
  transaction,
  paymentInfo,
  sessionPayment,
  cart,
} from "./_model";

jest.mock("../../utils/regex/urlUtilities", () => ({
  getFragmentParameter: jest.fn(),
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
        CHECKOUT_SURVEY_SHOW: "TEST",
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

describe("V2PaymentResponsePage no cart", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    // jest.resetAllMocks();
    jest.spyOn(router, "useNavigate").mockReset();
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
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
    async (val) => {
      (getFragmentParameter as jest.Mock).mockImplementation(() => val);
      renderWithReduxProvider(
        <MemoryRouter>
          <PaymentResponsePageV2 />
        </MemoryRouter>
      );
      expect(
        screen.getByText("paymentResponsePage." + val + ".title")
      ).toBeVisible();
      expect(checkLogout).toHaveBeenCalled();
      await waitFor(() => {
        expect(clearStorage).toHaveBeenCalled();
      });
      fireEvent.click(screen.getByText("errorButton.close"));
      expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    }
  );
});

describe("V2PaymentResponsePage with cart", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    jest.spyOn(router, "useNavigate").mockReset();
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
      (getFragmentParameter as jest.Mock).mockImplementation(() => val);
      renderWithReduxProvider(
        <MemoryRouter>
          <PaymentResponsePageV2 />
        </MemoryRouter>
      );
      expect(
        screen.getByText("paymentResponsePage." + val + ".title")
      ).toBeVisible();
      expect(checkLogout).toHaveBeenCalled();
      expect(clearStorage).toHaveBeenCalled();
      fireEvent.click(screen.getByText("paymentResponsePage.buttons.continue"));
      expect(window.location.replace).toHaveBeenCalledWith(
        val === "0"
          ? cart.returnUrls.returnOkUrl
          : cart.returnUrls.returnErrorUrl
      );
    }
  );
});
