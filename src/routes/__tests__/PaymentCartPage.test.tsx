import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { setSessionItem } from "../../utils/storage/sessionStorage";
import { apiPaymentEcommerceClient } from "../../utils/api/client";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import PaymentCartPage from "../PaymentCartPage";
import { cart } from "./_model";

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

// Create a Jest spy for navigation
const navigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // use actual for all non-hook parts
  useNavigate: () => navigate,
  useParams: () => ({ cartid: "123" }),
}));

// Mock storage utilities (and return an empty object if needed)
jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(),
  SessionItems: {
    cart: "cart",
  },
}));

jest.mock("../../utils/api/client", () => ({
  apiPaymentEcommerceClient: {
    GetCarts: jest.fn(),
  },
}));

// Mock the config module
jest.mock("../../utils/config/config", () =>
  // Return the actual implementation but with our mock for getConfigOrThrow
  ({
    // This is the key fix - handle the case when no key is provided
    getConfigOrThrow: jest.fn((key) => {
      // Create a mapping of all config values
      const configValues = {
        CHECKOUT_API_TIMEOUT: 1000,
        // Add other config values as needed
      } as any;

      // If no key provided, return all config values (this is the important part)
      if (key === undefined) {
        return configValues;
      }

      // Otherwise return the specific config value
      return configValues[key] || "";
    }),
    isTestEnv: jest.fn(() => false),
    isDevEnv: jest.fn(() => false),
    isProdEnv: jest.fn(() => true),
  })
);

describe("PaymentCartPage", () => {
  test("should show cart start page", async () => {
    (apiPaymentEcommerceClient.GetCarts as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: cart,
        },
      })
    );
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCartPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(setSessionItem).toHaveBeenCalledTimes(5);
      expect(navigate).toHaveBeenCalledWith("/inserisci-email", {
        replace: true,
        state: { noConfirmEmail: true },
      });
    });
  });

  test("should show error modal", async () => {
    (apiPaymentEcommerceClient.GetCarts as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 502,
        },
      })
    );
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCartPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText("errorButton.close"));
      expect(navigate).toHaveBeenCalledWith("/errore");
    });
  });
});
