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
import { ecommerceTransaction } from "../../utils/transactions/transactionHelper";
import { getUrlParameter } from "../../utils/regex/urlUtilities";
import { decodeToUUID } from "../../utils/api/response";
import { getConfigOrThrow } from "../../utils/config/config";
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

jest.mock("../../utils/config/config", () => ({
  getConfigOrThrow: jest.fn(() => ({ CHECKOUT_ENV: "TEST" })),
  isTestEnv: jest.fn(() => false),
  isDevEnv: jest.fn(() => false),
  isProdEnv: jest.fn(() => true),
}));

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
    default:
      return undefined;
  }
};

const mockGetSessionItemWithCart = (item: SessionItems) =>
  item === "cart" ? cart : mockGetSessionItemNoCart(item);

const setSession = (outcome?: string, amount?: number, withCart = false) => {
  (getSessionItem as jest.Mock).mockImplementation((key: SessionItems) => {
    if (key === SessionItems.outcome) {
      return outcome;
    }
    if (key === SessionItems.totalAmount) {
      return amount;
    }
    return withCart
      ? mockGetSessionItemWithCart(key)
      : mockGetSessionItemNoCart(key);
  });
};

const navigate = jest.fn();

describe("PaymentResponsePage (v1)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getConfigOrThrow as jest.Mock).mockReturnValue({
      CHECKOUT_ENV: "TEST",
      CHECKOUT_SURVEY_SHOW: true,
    });
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
    (getUrlParameter as jest.Mock).mockReturnValue(
      transactionInfoOK.transactionId
    );
    (decodeToUUID as jest.Mock).mockReturnValue(
      transactionInfoOK.transactionId
    );
    (ecommerceTransaction as jest.Mock).mockReturnValue(
      TE.right(transactionInfoOK)
    );
  });

  it("SUCCESS - no cart → shows survey & closes to home", async () => {
    setSession("0", 12345, false);

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentResponsePage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(
        screen.getByText("paymentResponsePage.survey.link.text")
      ).toBeVisible()
    );

    fireEvent.click(screen.getByText("errorButton.close"));
    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    expect(clearStorage).toHaveBeenCalled();
  });

  it("No outcome in session → loader disappears and only the default close button is rendered", async () => {
    setSession(undefined, undefined, false);

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentResponsePage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("errorButton.close")).toBeVisible()
    );

    expect(
      screen.queryByText((content) =>
        content.startsWith("paymentResponsePage.")
      )
    ).toBeNull();
  });
});
