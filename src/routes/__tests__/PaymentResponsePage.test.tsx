// src/routes/__tests__/PaymentResponsePage.test.tsx
import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import PaymentResponsePage from "../PaymentResponsePage";
import { getSessionItem, clearSessionItem, clearStorage } from "../../utils/storage/sessionStorage";


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

// Mock API helper – note PaymentResponsePage imports checkLogout from this module.
jest.mock("../../utils/api/helper", () => ({
  checkLogout: jest.fn((callback: () => void) => callback()),
}));

// PaymentResponsePage imports callServices from "../utils/api/response"
jest.mock("../../utils/api/response", () => ({
  callServices: jest.fn((callback: (result: any) => void) => callback({})),
}));

// Mock sessionStorage utility functions.
jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  clearSessionItem: jest.fn(),
  clearStorage: jest.fn(),
  setSessionItem: jest.fn(),
  SessionItems: {
    authToken: "authToken",
    cart: "cart",
    transaction: "transaction",
    pspSelected: "pspSelected",
    useremail: "useremail",
  },
}));

// Mock event listeners.
jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
}));

// Mock configuration – PaymentResponsePage uses getConfigOrThrow.
jest.mock("../../utils/config/config", () => ({
  getConfigOrThrow: () => ({
    CHECKOUT_SURVEY_SHOW: false, // set to false to keep SurveyLink hidden
  }),
}));

// --- Test Suite ---
describe("PaymentResponsePage", () => {
  beforeEach(() => {
    // For the "cart" session item, return an object with a proper returnUrls property.
    (getSessionItem as jest.Mock).mockImplementation((key: string) => {
      switch (key) {
        case "cart":
          return {
            returnUrls: {
              returnOkUrl: "https://some-ok-url.com",
              returnErrorUrl: "https://some-error-url.com",
            },
          };
        // Optionally, return undefined for other keys.
        default:
          return undefined;
      }
    });

    (clearSessionItem as jest.Mock).mockImplementation(() => {});
    (clearStorage as jest.Mock).mockImplementation(() => {});    
  });

  test("Cart must be initialized from session", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentResponsePage />
      </MemoryRouter>
    );

    // Check that getSessionItem is called with "cart"
    expect(getSessionItem).toHaveBeenCalledWith("cart");
  });
});
