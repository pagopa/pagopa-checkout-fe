import React from "react";
import "@testing-library/jest-dom";
import { fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import CancelledPage from "../CancelledPage";
import { clearStorage, getSessionItem } from "../../utils/storage/sessionStorage";
import { Cart, PaymentNotice } from "features/payment/models/paymentModel";
import { CartRequestReturnUrls } from "../../../generated/definitions/payment-ecommerce/CartRequest";

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
  clearStorage: jest.fn(),
  SessionItems: {
    cart: "cart"
  },
}));

jest.mock("../../utils/api/helper", () => ({
    checkLogout: jest.fn(),
}));

jest.mock("../../utils/eventListeners", () => ({
  removeEventListener: jest.fn(),
}));

describe("CancelledPage", () => {

    beforeEach(() => {
      // Return an object for initial session values (making sure it’s not a boolean)
      (getSessionItem as jest.Mock).mockClear();
      // Clear previous calls to our spy navigate function before each test
      navigate.mockClear();
    });

    test("Should clear storage when landing on cancelled page. Button redirects to home page when cart is not in session storage", async() => {
      (getSessionItem as jest.Mock).mockImplementation(() => {
        console.log("no cart in session storage");
        return undefined;
      });  
      
      const { container } = renderWithReduxProvider(
        <MemoryRouter>
            <CancelledPage />
        </MemoryRouter>
        );
        expect(clearStorage).toHaveBeenCalled();
        //expect(removeEventListener).toHaveBeenCalled();
        // Query the button by its id
        const redirectButton = container.querySelector("#redirect-button");

        expect(redirectButton).toBeInTheDocument();
        fireEvent.click(redirectButton!!);
        expect(navigate).toHaveBeenCalledWith("/", {"replace": true});

    });

    test("Should clear storage when landing on cancelled page. Button redirects to custom url when cart is in session storage", async() => {
      
      const returnUrls : CartRequestReturnUrls = {
        returnOkUrl: "http://okUrl",
        returnCancelUrl: "http://cancelUrl",
        returnErrorUrl: "http://koUrl"
      };

      const cart: Cart = {
        emailNotice: "test@test.it",
        idCart: "idCart",
        paymentNotices: [] as Array<PaymentNotice>,
        returnUrls: returnUrls
      };

      (getSessionItem as jest.Mock).mockImplementation((item) => {
            switch (item) {
              case "cart":
                return JSON.parse(JSON.stringify(cart));
              default:
                return undefined;
            }
          });
      
      const { container } = renderWithReduxProvider(
      <MemoryRouter>
          <CancelledPage />
      </MemoryRouter>
      );
      expect(clearStorage).toHaveBeenCalled();
      // Query the button by its id
      const redirectButton = container.querySelector("#redirect-button");

      expect(redirectButton).toBeInTheDocument();
      expect(redirectButton?.textContent).toBe("paymentResponsePage.buttons.continue");
      fireEvent.click(redirectButton!!);
      expect(navigate).not.toHaveBeenCalled();
      /*await waitFor(() => {
        expect(location.href).toBe(returnUrls.returnCancelUrl);
      });*/
  });

});