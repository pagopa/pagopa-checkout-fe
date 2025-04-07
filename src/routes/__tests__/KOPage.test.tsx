import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { screen } from "@testing-library/dom";
import { waitFor } from "@testing-library/react";
import {
  clearSessionItem,
  getSessionItem,
  clearStorage,
} from "../../utils/storage/sessionStorage";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import KOPage from "../KOPage";

// Mocking i18n
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey?: string }) => (
    <span data-testid="mocked-trans">{i18nKey || "no-key"}</span>
  ),
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
    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} data-test="recaptcha" />
    );
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

describe("KOPage", () => {
  beforeEach(() => {
    // Mock return values for `getSessionItem`
    (getSessionItem as jest.Mock).mockReturnValue({
      returnUrls: { returnErrorUrl: "https://some-url.com" },
    });

    (clearSessionItem as jest.Mock).mockReturnValue(true);
    (clearStorage as jest.Mock).mockReturnValue(true);
  });

  test("Cart must be initialized from session", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <KOPage />
      </MemoryRouter>
    );

    // Verify that the button text changes depending on the cart value
    await waitFor(() => {
      expect(
        screen.getByText(/paymentResponsePage.buttons.continue/i)
      ).toBeInTheDocument();
    });

    // Ensure that `getSessionItem` is called with "cart"
    expect(getSessionItem).toHaveBeenCalledWith("cart");
  });
});
