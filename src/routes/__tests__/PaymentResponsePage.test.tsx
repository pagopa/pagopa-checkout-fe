/* eslint-disable sonarjs/no-identical-functions */
import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import * as router from "react-router";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import {
  clearStorage,
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import PaymentResponsePage from "../../routes/PaymentResponsePage";
import "jest-location-mock";
import { checkLogout } from "../../utils/api/helper";
import { ViewOutcomeEnum } from "../../utils/transactions/TransactionResultUtil";
import { callServices } from "../../utils/api/response";

import {
  paymentMethod,
  paymentMethodInfo,
  pspSelected,
  transaction,
  paymentInfo,
  sessionPayment,
  cart,
} from "./_model";

/* ------------------------------------------------------------------ */
/*                               MOCKS                                */
/* ------------------------------------------------------------------ */

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

jest.mock("../../utils/api/helper", () => ({
  checkLogout: jest.fn(),
}));

// <-- NEW: mock the only API the component now calls
jest.mock("../../utils/api/response", () => ({
  callServices: jest.fn(),
}));

jest.mock("../../utils/config/config", () => ({
  getConfigOrThrow: jest.fn(() => ({
    CHECKOUT_ENV: "TEST",
  })),
  isTestEnv: jest.fn(() => false),
  isDevEnv: jest.fn(() => false),
  isProdEnv: jest.fn(() => true),
}));

/* ------------------------------------------------------------------ */
/*                        SESSION-STORAGE STUBS                        */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*                           TEST SUITES                               */
/* ------------------------------------------------------------------ */

const navigate = jest.fn();

describe("PaymentResponsePage — no cart", () => {
  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockReset();
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItemNoCart);
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
  ])("renders outcome %s and returns home", async (val) => {
    /* ---------- prepare the API mock ----------------------------- */
    const transactionOutcomeInfo = {
      outcome: Number(val),
      isFinalStatus: true,
      totalAmount: 1000,
      fees: 100,
    };
    (callServices as jest.Mock).mockImplementation(async (cb: any) => {
      cb(transactionOutcomeInfo);
      return Promise.resolve();
    });

    /* ---------- render ------------------------------------------- */
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentResponsePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(`paymentResponsePage.${val}.title`)
      ).toBeVisible();
      expect(checkLogout).toHaveBeenCalled();
      expect(clearStorage).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText("errorButton.close"));
    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });
});

describe("PaymentResponsePage — with cart", () => {
  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockReset();
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
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
  ])("renders outcome %s and redirects correctly", async (val) => {
    const transactionOutcomeInfo = {
      outcome: Number(val),
      isFinalStatus: true,
      totalAmount: 1000,
      fees: 100,
    };
    (callServices as jest.Mock).mockImplementation(async (cb: any) => {
      cb(transactionOutcomeInfo);
      return Promise.resolve();
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
      expect(checkLogout).toHaveBeenCalled();
      expect(clearStorage).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByText("paymentResponsePage.buttons.continue"));
    expect(window.location.replace).toHaveBeenCalledWith(
      val === ViewOutcomeEnum.SUCCESS
        ? cart.returnUrls.returnOkUrl
        : cart.returnUrls.returnErrorUrl
    );
  });
});
