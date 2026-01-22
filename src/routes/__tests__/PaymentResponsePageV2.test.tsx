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
import { checkLogout } from "../../utils/api/helper";
import { ViewOutcomeEnum } from "../../utils/transactions/TransactionResultUtil";
import { getConfigOrThrow } from "../../utils/config/config";
import * as reduxHooks from "../../redux/hooks/hooks";
import { removeLoggedUser } from "../../redux/slices/loggedUser";
import { resetThreshold } from "../../redux/slices/threshold";
import { NewTransactionResponse } from "../../../generated/definitions/payment-ecommerce-v3/NewTransactionResponse";
import { mixpanel } from "../../utils/mixpanel/mixpanelHelperInit";
import {
  eventViewOutcomeMap,
  MixpanelDataEntryType,
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
  MixpanelFlow,
  MixpanelPaymentPhase,
} from "../../utils/mixpanel/mixpanelEvents";
import {
  cart as mockCart,
  paymentInfo,
  transaction as mockTransactionOutcomeInfoData,
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

const mockGetUriFragments = jest.fn();

jest.mock("../../utils/regex/urlUtilities", () => ({
  getUriFragments: () => mockGetUriFragments(),
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

jest.mock("../../utils/mixpanel/mixpanelHelperInit", () => ({
  mixpanel: {
    track: jest.fn(),
  },
}));

jest.mock("../../utils/mixpanel/mixpanelTracker", () => ({
  getFlowFromSessionStorage: jest.fn(() => "cart"),
  getPaymentInfoFromSessionStorage: jest.fn(() => paymentInfo),
  getPaymentMethodSelectedFromSessionStorage: jest.fn(() => "CP"),
  getDataEntryTypeFromSessionStorage: jest.fn(() => "manual"),
}));

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
          return { transactionId: "testId" } as NewTransactionResponse;
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
      "should call checkLogout, clearStorage, dispatch resetThreshold, and remove event listener on mount",
      async (outcomeValue) => {
        const mockRemoveEventListener = jest.spyOn(
          window,
          "removeEventListener"
        );
        mockGetSessionItem.mockImplementation((item: SessionItems) => {
          if (item === SessionItems.transaction) {
            return {
              ...mockTransactionOutcomeInfoData,
            };
          }
          if (item === SessionItems.useremail) {
            return "user@test.com";
          }
          return undefined;
        });
        mockGetUriFragments.mockReturnValue({
          outcome: outcomeValue,
          totalAmount: outcomeValue === "0" ? 12000 : undefined,
          fees: outcomeValue === "0" ? 15 : undefined,
          transactionId: mockTransactionOutcomeInfoData.transactionId,
        });
        renderComponent();

        await waitFor(() => {
          expect(checkLogout).toHaveBeenCalledTimes(1);
        });
        expect(mockDispatch).toHaveBeenCalledWith(removeLoggedUser());
        expect(mockClearSessionItem).toHaveBeenCalledWith(
          SessionItems.authToken
        );
        expect(mockClearStorage).toHaveBeenCalledTimes(1);

        expect(mockDispatch).toHaveBeenCalledWith(resetThreshold());
        expect(mockRemoveEventListener).toHaveBeenCalledWith(
          "beforeunload",
          expect.any(Function)
        );
        mockRemoveEventListener.mockRestore();
      }
    );
  });

  describe("Outcome Determination and Display", () => {
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
      "should set document.title based on outcome and amount",
      (outcomeValue) => {
        /* eslint-disable sonarjs/no-identical-functions */
        mockGetSessionItem.mockImplementation((item: SessionItems) => {
          if (item === SessionItems.transaction) {
            return {
              ...mockTransactionOutcomeInfoData,
            };
          }
          if (item === SessionItems.useremail) {
            return "user@test.com";
          }
          return undefined;
        });
        mockGetUriFragments.mockReturnValue({
          outcome: outcomeValue,
          totalAmount: outcomeValue === "0" ? 12000 : undefined,
          fees: outcomeValue === "0" ? 15 : undefined,
          transactionId: mockTransactionOutcomeInfoData.transactionId,
        });

        renderComponent();
        expect(document.title).toBe(
          `paymentResponsePage.${outcomeValue}.title - pagoPA`
        );
      }
    );
  });

  describe("Show Generic Error", () => {
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
    ])("when transactionId doesn't match", (outcomeValue) => {
      /* eslint-disable sonarjs/no-identical-functions */
      mockGetSessionItem.mockImplementation((item: SessionItems) => {
        if (item === SessionItems.transaction) {
          return {
            ...mockTransactionOutcomeInfoData,
          };
        }
        if (item === SessionItems.useremail) {
          return "user@test.com";
        }
        return undefined;
      });
      mockGetUriFragments.mockReturnValue({
        outcome: outcomeValue,
        totalAmount: outcomeValue === "0" ? 12000 : undefined,
        fees: outcomeValue === "0" ? 15 : undefined,
        transactionId: "id",
      });

      renderComponent();
      expect(document.title).toBe(`paymentResponsePage.1.title - pagoPA`);
    });
  });

  /* eslint-disable sonarjs/cognitive-complexity */
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
          return { transactionId: "testId" } as NewTransactionResponse;
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
        mockGetUriFragments.mockReturnValue({
          outcome: outcomeVal,
          totalAmount: outcomeVal === "0" ? "12000" : undefined,
          fees: outcomeVal === "0" ? "15" : undefined,
          transactionId: "testId",
        });

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
  /* eslint-disable sonarjs/cognitive-complexity */
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
          return { transactionId: "testId" } as NewTransactionResponse;
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
        mockGetUriFragments.mockReturnValue({
          outcome: outcomeVal,
          totalAmount: outcomeVal === "0" ? "12000" : undefined,
          fees: outcomeVal === "0" ? "15" : undefined,
          transactionId: "testId",
        });
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

  describe("Mixpanel Tracking", () => {
    test("should track mixpanel CHK_PAYMENT_UX_SUCCESS on mount", async () => {
      mockGetUriFragments.mockReturnValue({
        outcome: ViewOutcomeEnum.SUCCESS.toString(),
        totalAmount: "12000",
        fees: "15",
        transactionId: "testId",
      });

      mockGetSessionItem.mockImplementation((item: SessionItems) => {
        switch (item) {
          case SessionItems.transaction:
            return { transactionId: "testId" };
          case SessionItems.useremail:
            return "test@example.com";
          case SessionItems.cart:
            return undefined;
          default:
            return undefined;
        }
      });

      renderComponent();

      await waitFor(() => {
        expect(mixpanel.track).toHaveBeenCalledWith(
          MixpanelEventsId.CHK_PAYMENT_UX_SUCCESS,
          expect.objectContaining({
            EVENT_ID: MixpanelEventsId.CHK_PAYMENT_UX_SUCCESS,
            EVENT_CATEGORY: MixpanelEventCategory.UX,
            EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
            organization_name: "companyName",
            organization_fiscal_code: "77777777777",
            amount: 12000,
            expiration_date: "2021-07-31",
            payment_method_selected: "CP",
            data_entry: MixpanelDataEntryType.MANUAL,
            flow: MixpanelFlow.CART,
            payment_phase: MixpanelPaymentPhase.PAGAMENTO,
          })
        );
      });
    });

    test.each([
      ViewOutcomeEnum.AUTH_ERROR,
      ViewOutcomeEnum.INVALID_DATA,
      ViewOutcomeEnum.TIMEOUT,
      ViewOutcomeEnum.CIRCUIT_ERROR,
      ViewOutcomeEnum.MISSING_FIELDS,
      ViewOutcomeEnum.INVALID_CARD,
      ViewOutcomeEnum.CANCELED_BY_USER,
      ViewOutcomeEnum.EXCESSIVE_AMOUNT,
      ViewOutcomeEnum.REFUNDED,
      ViewOutcomeEnum.PSP_ERROR,
      ViewOutcomeEnum.BALANCE_LIMIT,
      ViewOutcomeEnum.LIMIT_EXCEEDED,
      ViewOutcomeEnum.INVALID_METHOD,
      ViewOutcomeEnum.TAKING_CHARGE,
    ])("should track mixpanel %s KO outcome on mount", async (outcomeValue) => {
      mockGetUriFragments.mockReturnValue({
        outcome: outcomeValue.toString(),
        totalAmount: "12000",
        fees: "15",
        transactionId: "testId",
      });

      mockGetSessionItem.mockImplementation((item: SessionItems) => {
        switch (item) {
          case SessionItems.transaction:
            return { transactionId: "testId" };
          case SessionItems.useremail:
            return "test@example.com";
          case SessionItems.cart:
            return undefined;
          default:
            return undefined;
        }
      });

      renderComponent();

      await waitFor(() => {
        const calls = (mixpanel.track as jest.Mock).mock.calls;
        expect(
          calls.some(
            ([eventId, props]) =>
              eventId === eventViewOutcomeMap[outcomeValue] &&
              props.EVENT_ID === eventViewOutcomeMap[outcomeValue] &&
              props.EVENT_CATEGORY === MixpanelEventCategory.KO &&
              props.payment_phase === MixpanelPaymentPhase.PAGAMENTO &&
              props.organization_name === "companyName" &&
              props.organization_fiscal_code === "77777777777" &&
              props.amount === 12000 &&
              props.expiration_date === "2021-07-31" &&
              props.data_entry === MixpanelDataEntryType.MANUAL
          )
        ).toBe(true);
      });
    });
  });
});
