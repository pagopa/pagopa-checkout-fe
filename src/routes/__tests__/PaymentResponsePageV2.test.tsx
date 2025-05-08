/* eslint-disable functional/immutable-data */
import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import { SessionItems } from "../../utils/storage/sessionStorage";
import PaymentResponsePageV2 from "../../routes/PaymentResponsePageV2";
import "jest-location-mock";
import { getFragmentParameter } from "../../utils/regex/urlUtilities";
import { checkLogout } from "../../utils/api/helper";
import { ViewOutcomeEnum } from "../../utils/transactions/TransactionResultUtil";
import { getConfigOrThrow } from "../../utils/config/config";
import * as reduxHooks from "../../redux/hooks/hooks";
import { removeLoggedUser } from "../../redux/slices/loggedUser";
import { resetThreshold } from "../../redux/slices/threshold";
import { moneyFormat } from "../../utils/form/formatters";
import {
  cart as mockCart,
  transaction as mockTransactionOutcomeInfoData,
} from "./_model";

jest.mock("../../utils/regex/urlUtilities", () => ({
  getFragmentParameter: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (options && options.amount) {
        return `${key} with amount ${options.amount}`;
      }
      if (options && options.useremail) {
        return `${key} for ${options.useremail}`;
      }
      return key;
    },
  }),
}));

const mockGetSessionItem = jest.fn();
const mockClearStorage = jest.fn();
const mockClearSessionItem = jest.fn();

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: (item: any) => mockGetSessionItem(item),
  clearStorage: () => mockClearStorage(),
  clearSessionItem: (item: any) => mockClearSessionItem(item),
  SessionItems: {
    transaction: "transaction",
    cart: "cart",
    pspSelected: "pspSelected",
    useremail: "useremail",
    authToken: "authToken",
  },
}));

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
}));

jest.mock("../../utils/api/helper", () => ({
  checkLogout: jest.fn((callback) => Promise.resolve(callback && callback())),
}));

const mockGetConfigOrThrow = getConfigOrThrow as jest.Mock;
jest.mock("../../utils/config/config", () => ({
  getConfigOrThrow: jest.fn(),
}));

jest.mock(
  "../../components/modals/FindOutMoreModal",
  () =>
    ({ open, onClose }: { open: boolean; onClose: () => void }) =>
      open ? (
        <div data-testid="find-out-more-modal" onClick={onClose}>
          FindOutMoreModal
        </div>
      ) : null
);
jest.mock("../../components/commons/SurveyLink", () => () => (
  <div data-testid="survey-link">SurveyLink</div>
));
jest.mock(
  "../../components/PageContent/PageContainer",
  () =>
    ({ children }: { children: React.ReactNode }) =>
      <div data-testid="page-container">{children}</div>
);

const mockNavigate = jest.fn();
const mockDispatch = jest.fn();

const originalLocation = window.location;
beforeAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { ...originalLocation, replace: jest.fn() },
  });
});
afterAll(() => {
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: originalLocation,
  });
});

describe("PaymentResponsePageV2", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(router, "useNavigate").mockImplementation(() => mockNavigate);
    jest
      .spyOn(reduxHooks, "useAppDispatch")
      .mockImplementation(() => mockDispatch);

    mockGetSessionItem.mockImplementation((item: SessionItems) => {
      switch (item) {
        case SessionItems.transaction:
          return undefined;
        case SessionItems.cart:
          return undefined;
        case SessionItems.pspSelected:
          return undefined;
        case SessionItems.useremail:
          return "test@example.com";
        default:
          return undefined;
      }
    });

    mockGetConfigOrThrow.mockImplementation((key?: string) => {
      if (!key) {
        return { CHECKOUT_SURVEY_SHOW: false };
      }
      if (key === "CHECKOUT_SURVEY_SHOW") {
        return false;
      }
      return `mock_config_${key}`;
    });

    Object.defineProperty(document, "title", {
      writable: true,
      value: "",
    });
  });

  const renderComponent = () =>
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentResponsePageV2 />
      </MemoryRouter>
    );

  describe("Initial Effects and Cleanup", () => {
    it("should call checkLogout, clearStorage, dispatch resetThreshold, and remove event listener on mount", async () => {
      const mockRemoveEventListener = jest.spyOn(window, "removeEventListener");
      renderComponent();

      await waitFor(() => {
        expect(checkLogout).toHaveBeenCalledTimes(1);
      });
      expect(mockDispatch).toHaveBeenCalledWith(removeLoggedUser());
      expect(mockClearSessionItem).toHaveBeenCalledWith(SessionItems.authToken);
      expect(mockClearStorage).toHaveBeenCalledTimes(1);

      expect(mockDispatch).toHaveBeenCalledWith(resetThreshold());
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
      mockRemoveEventListener.mockRestore();
    });
  });

  describe("Outcome Determination and Display", () => {
    it("should set document.title based on outcome and amount", () => {
      mockGetSessionItem.mockImplementation((item: SessionItems) => {
        if (item === SessionItems.transaction) {
          return {
            ...mockTransactionOutcomeInfoData,
            outcome: ViewOutcomeEnum.SUCCESS,
            totalAmount: 1234,
            fees: 50,
          };
        }
        if (item === SessionItems.useremail) {
          return "user@test.com";
        }
        return undefined;
      });
      (getFragmentParameter as jest.Mock).mockReturnValue(null);

      renderComponent();
      const expectedAmount = moneyFormat(1234 + 50);
      expect(document.title).toBe(
        `paymentResponsePage.${ViewOutcomeEnum.SUCCESS}.title with amount ${expectedAmount} - pagoPA`
      );
    });
  });

  describe("V2PaymentResponsePage no cart", () => {
    beforeEach(() => {
      mockGetSessionItem.mockImplementation((item: SessionItems) => {
        if (item === SessionItems.cart) {
          return undefined;
        }
        if (item === SessionItems.useremail) {
          return "test@example.com";
        }
        if (item === SessionItems.transaction) {
          return undefined;
        }
        if (item === SessionItems.pspSelected) {
          return undefined;
        }
        return undefined;
      });
    });
    // TEST WITHOUT CART
    test.each([
      ViewOutcomeEnum.SUCCESS.toString(),
      ViewOutcomeEnum.GENERIC_ERROR.toString(),
      ViewOutcomeEnum.AUTH_ERROR.toString(),
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
      "should show payment outcome %s message and navigate to / on close",
      async (outcomeVal) => {
        (getFragmentParameter as jest.Mock).mockReturnValue(outcomeVal);

        renderComponent();

        const expectedTitleStart = `paymentResponsePage.${outcomeVal}.title`;
        expect(
          screen.getByText((content) => content.startsWith(expectedTitleStart))
        ).toBeVisible();

        await waitFor(() => {
          expect(checkLogout).toHaveBeenCalled();
        });
        await waitFor(() => {
          expect(mockClearStorage).toHaveBeenCalled();
        });

        fireEvent.click(screen.getByText("errorButton.close"));
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
      }
    );
  });

  describe("V2PaymentResponsePage with cart", () => {
    const cartData = {
      ...mockCart,
      returnUrls: {
        returnOkUrl: "/custom-cart-ok",
        returnErrorUrl: "/custom-cart-error",
      },
    };

    beforeEach(() => {
      mockGetSessionItem.mockImplementation((item: SessionItems) => {
        if (item === SessionItems.cart) {
          return cartData;
        }
        if (item === SessionItems.useremail) {
          return "test@example.com";
        }
        if (item === SessionItems.transaction) {
          return undefined;
        }
        if (item === SessionItems.pspSelected) {
          return undefined;
        }
        return undefined;
      });
    });
    // TEST WITH CART
    test.each([
      ViewOutcomeEnum.SUCCESS.toString(),
      ViewOutcomeEnum.GENERIC_ERROR.toString(),
      ViewOutcomeEnum.AUTH_ERROR.toString(),
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
      "should show payment outcome %s message and redirect on continue",
      async (outcomeVal) => {
        (getFragmentParameter as jest.Mock).mockReturnValue(outcomeVal); // outcomeVal is already string

        renderComponent();

        const expectedTitleStart = `paymentResponsePage.${outcomeVal}.title`;
        expect(
          screen.getByText((content) => content.startsWith(expectedTitleStart))
        ).toBeVisible();

        await waitFor(() => {
          expect(checkLogout).toHaveBeenCalled();
        });
        await waitFor(() => {
          expect(mockClearStorage).toHaveBeenCalled();
        });

        fireEvent.click(
          screen.getByText("paymentResponsePage.buttons.continue")
        );
        const expectedUrl =
          outcomeVal === ViewOutcomeEnum.SUCCESS.toString() // Compare string with string
            ? cartData.returnUrls.returnOkUrl
            : cartData.returnUrls.returnErrorUrl;
        expect(window.location.replace).toHaveBeenCalledWith(expectedUrl);
      }
    );
  });
});
