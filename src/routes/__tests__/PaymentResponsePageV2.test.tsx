// src/routes/__tests__/PaymentResponsePageV2.test.tsx
import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import PaymentResponsePageV2 from "../PaymentResponsePageV2";
import {
  getSessionItem,
  clearSessionItem,
  clearStorage,
} from "../../utils/storage/sessionStorage";

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

// Mock API helper – note PaymentResponsePageV2 imports checkLogout from this module.
jest.mock("../../utils/api/helper", () => ({
  checkLogout: jest.fn((callback: () => void) => callback()),
}));

// PaymentResponsePageV2 imports callServices from "../utils/api/response"
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

// Mock configuration – PaymentResponsePageV2 uses getConfigOrThrow.
jest.mock("../../utils/config/config", () => ({
  getConfigOrThrow: () => ({
    CHECKOUT_SURVEY_SHOW: false, // set to false to keep SurveyLink hidden
  }),
}));

// --- Test Suite ---
describe("PaymentResponsePageV2", () => {
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

    (clearSessionItem as jest.Mock).mockReturnValue(true);
    (clearStorage as jest.Mock).mockReturnValue(true);
  });

  test("Cart must be initialized from session", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentResponsePageV2 />
      </MemoryRouter>
    );

    // Check that getSessionItem is called with "cart"
    expect(getSessionItem).toHaveBeenCalledWith("cart");
  });
});
