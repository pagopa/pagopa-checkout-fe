import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { clearSessionItem, getSessionItem, clearStorage } from "../../utils/storage/sessionStorage";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import CancelledPage from "../CancelledPage";

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

// Mocking reCAPTCHA
jest.mock("react-google-recaptcha", () => ({
  __esModule: true,
  default: React.forwardRef((_, ref) => {
    React.useImperativeHandle(ref, () => ({
      reset: jest.fn(),
      execute: jest.fn(),
      executeAsync: jest.fn(() => "token"),
    }));
    return <div ref={ref as React.RefObject<HTMLDivElement>} data-test="recaptcha" />;
  }),
}));

// Mocking helper functions and session storage
jest.mock("../../utils/api/helper", () => ({
  checkLogout: jest.fn((callback: () => void) => callback()),
}));

// Mocking sessionStorage utility functions
jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  clearSessionItem: jest.fn(),
  clearStorage: jest.fn(), // Properly mock clearStorage
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(),
  SessionItems: {
    authToken: "authToken",
    cart: "cart",
  },
}));

// Mocking event listeners
jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
}));

describe("CancelledPage", () => {
  beforeEach(() => {
    // Mock return values for `getSessionItem`
    (getSessionItem as jest.Mock).mockReturnValue({
      returnUrls: { returnErrorUrl: "https://some-url.com" },
    });

    // Mock clearing session item
    (clearSessionItem as jest.Mock).mockImplementation(() => {});

    // Mock clearStorage to do nothing
    (clearStorage as jest.Mock).mockImplementation(() => {});
  });

  test("Cart must be initialized from session", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <CancelledPage />
      </MemoryRouter>
    );

    // Ensure that `getSessionItem` is called with "cart"
    expect(getSessionItem).toHaveBeenCalledWith("cart");
  });
});
