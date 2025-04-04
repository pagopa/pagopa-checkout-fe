import React from "react";
import "@testing-library/jest-dom";
import { fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import AuthExpiredPage from "../AuthExpiredPage";
import {
  getAndClearSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";

// Create a Jest spy for navigation
const navigate = jest.fn();

// Mock react-router-dom so that useNavigate returns our spy function.
// Note: We spread the actual module to preserve its other exports.
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => navigate,
}));

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
  getAndClearSessionItem: jest.fn(),
  SessionItems: {
    loginOriginPage: "loginOriginPage",
  },
}));

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
}));

const mockGetSessionItem = (item: SessionItems) => {
  switch (item) {
    case "loginOriginPage":
      return "riepilogo-pagamento";
    default:
      return undefined;
  }
};

describe("AuthExpired", () => {
  test("The page should contain login and continue as guest button and click to login go to origin page", async () => {
    // Mock getAndClearSessionItem to back url
    (getAndClearSessionItem as jest.Mock).mockImplementation(
      mockGetSessionItem
    );

    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <AuthExpiredPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const authRetryButton = container.querySelector("#auth-retry-button");
    const payGuestButton = container.querySelector("#pay-guest-button");

    // Verify buttons and click
    expect(authRetryButton).toBeInTheDocument();
    expect(payGuestButton).toBeInTheDocument();
    fireEvent.click(authRetryButton!);
    expect(navigate).toHaveBeenCalledWith("riepilogo-pagamento", {
      replace: true,
    });
  });

  test("The page should contain login and continue as guest button and click to payGuestButton go to origin page", async () => {
    // Mock getAndClearSessionItem to back url
    (getAndClearSessionItem as jest.Mock).mockImplementation(
      mockGetSessionItem
    );

    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <AuthExpiredPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const authRetryButton = container.querySelector("#auth-retry-button");
    const payGuestButton = container.querySelector("#pay-guest-button");

    // Verify buttons and click
    expect(authRetryButton).toBeInTheDocument();
    expect(payGuestButton).toBeInTheDocument();
    fireEvent.click(payGuestButton!);
    expect(navigate).toHaveBeenCalledWith("riepilogo-pagamento", {
      replace: true,
    });
  });

  test("The login origin page sessionItem is empty and click to pay as guest navigate to home page", async () => {
    // Mock getAndClearSessionItem to back url
    (getAndClearSessionItem as jest.Mock).mockImplementation(() => undefined);

    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <AuthExpiredPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const authRetryButton = container.querySelector("#auth-retry-button");
    const payGuestButton = container.querySelector("#pay-guest-button");

    // Verify buttons and click
    expect(authRetryButton).toBeInTheDocument();
    expect(payGuestButton).toBeInTheDocument();
    fireEvent.click(payGuestButton!);
    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });
});
