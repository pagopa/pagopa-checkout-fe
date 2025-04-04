import React from "react";
import "@testing-library/jest-dom";
import { waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import "jest-location-mock";
import AuthExpiredPage from "../AuthExpiredPage";

// Mock translations and recaptcha
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
  clearSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(),
  SessionItems: {
    paymentInfo: "paymentInfo",
    noticeInfo: "rptId",
    useremail: "useremail",
    enableAuthentication: "enableAuthentication",
    paymentMethod: "paymentMethod",
    pspSelected: "pspSelected",
    sessionToken: "sessionToken",
    cart: "cart",
    transaction: "transaction",
    sessionPaymentMethod: "sessionPayment",
    paymentMethodInfo: "paymentMethodInfo",
    orderId: "orderId",
    correlationId: "correlationId",
    cartClientId: "cartClientId",
    loginOriginPage: "loginOriginPage",
    authToken: "authToken",
  },
}));

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
}));

describe("AuthExpired", () => {
  beforeEach(() => {});

  test.only("The page should contain login and continue as guest button", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <AuthExpiredPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const authRetryButton = container.querySelector("#auth-retry-button");
    const payGuestButton = container.querySelector("#pay-guest-button");

    // Wait for the API call to resolve and the navigation to occur.
    await waitFor(() => {
      expect(authRetryButton).toBeInTheDocument();
      expect(payGuestButton).toBeInTheDocument();
    });
  });
});
