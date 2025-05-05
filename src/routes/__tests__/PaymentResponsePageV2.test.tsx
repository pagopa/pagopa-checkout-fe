import React from "react";
import "@testing-library/jest-dom";

jest.mock("../../utils/config/config", () => ({
  getConfigOrThrow: jest.fn(() => ({
    CHECKOUT_SURVEY_SHOW: false,
  })),
}));

import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import {
  clearStorage,
  clearSessionItem,
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import PaymentResponsePageV2 from "../../routes/PaymentResponsePageV2";
import "jest-location-mock";
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
  },
}));

jest.mock("../../utils/api/helper", () => ({
  checkLogout: jest.fn(),
}));

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

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
  removeEventListener: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
});

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
  ] as const)(
    "should show payment outcome message and come back to home on close button click",
    async (val) => {
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
          <PaymentResponsePageV2 />
        </MemoryRouter>
      );

      // should show the translated title
      expect(
        screen.getByText(`paymentResponsePage.${val}.title`)
      ).toBeVisible();

      // hooks should have called checkLogout + cleared all storage
      expect(checkLogout).toHaveBeenCalled();
      await waitFor(() => expect(clearStorage).toHaveBeenCalled());

      // clicking "close" should navigate home
      fireEvent.click(screen.getByText("errorButton.close"));
      expect(navigate).toHaveBeenCalledWith("/", { replace: true });

      // ensure we wiped those session keys
      expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.outcome);
      expect(clearSessionItem).toHaveBeenCalledWith(SessionItems.totalAmount);
    }
  );
});

describe("V2PaymentResponsePage with cart", () => {
  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockReset();
    (getSessionItem as jest.Mock).mockImplementation(
      mockGetSessionItemWithCart
    );
  });

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
    "should show payment outcome message and come back to home on continue button click for outcome %s",
    async (val) => {
      // stub outcome and amount in sessionStorage
      (getSessionItem as jest.Mock).mockImplementation((item: SessionItems) => {
        if (item === SessionItems.outcome) {
          return val;
        }
        if (item === SessionItems.totalAmount) {
          return 54321;
        }
        return mockGetSessionItemWithCart(item);
      });

      renderWithReduxProvider(
        <MemoryRouter>
          <PaymentResponsePageV2 />
        </MemoryRouter>
      );

      // page renders the correct title
      expect(
        screen.getByText(`paymentResponsePage.${val}.title`)
      ).toBeVisible();

      // storage and logout logic
      expect(checkLogout).toHaveBeenCalled();
      await waitFor(() => expect(clearStorage).toHaveBeenCalled());

      // click “continue” / “close”
      fireEvent.click(screen.getByText("paymentResponsePage.buttons.continue"));

      // compute exactly what the page would
      const expectedUrl =
        val === "0"
          ? cart.returnUrls.returnOkUrl
          : cart.returnUrls.returnErrorUrl;

      expect(window.location.replace).toHaveBeenCalledWith(expectedUrl);
    }
  );
});
