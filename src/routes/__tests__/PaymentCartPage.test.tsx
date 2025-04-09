import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { Cart, PaymentNotice } from "features/payment/models/paymentModel";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { setSessionItem } from "../../utils/storage/sessionStorage";
import { apiPaymentEcommerceClient } from "../../utils/api/client";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import PaymentCartPage from "../PaymentCartPage";
import { CartRequestReturnUrls } from "../../../generated/definitions/payment-ecommerce/CartRequest";

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

// Mock the API call with fp-ts TaskEither
const returnUrls: CartRequestReturnUrls = {
  returnOkUrl: "http://okUrl",
  returnCancelUrl: "http://cancelUrl",
  returnErrorUrl: "http://errorUrl",
};

const cart: Cart = {
  emailNotice: "test@test.it",
  idCart: "idCart",
  paymentNotices: [
    {
      noticeNumber: "302034567876500000",
      fiscalCode: "77777777777",
      amount: 100,
    },
  ] as Array<PaymentNotice>,
  returnUrls,
};

describe("PaymentCartPage", () => {
  beforeEach(() => {
    // jest.spyOn(router, 'useParams').mockReturnValue({ cartid: '123' });
    // jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
  });

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
