import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, act, screen, waitFor } from "@testing-library/react";
import { Cart, PaymentNotice } from "features/payment/models/paymentModel";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import SessionExpiredPage from "../../routes/SessionExpiredPage";
import { CartRequestReturnUrls } from "../../../generated/definitions/payment-ecommerce/CartRequest";
import { getSessionItem } from "../../utils/storage/sessionStorage";
import "jest-location-mock";

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

jest.mock("../../utils/api/helper", () => ({
  checkLogout: jest.fn(),
}));

// Create a Jest spy for navigation
const navigate = jest.fn();

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  clearStorage: jest.fn(),
  SessionItems: {
    cart: "cart",
  },
}));

describe("SessionExpiredPage", () => {
  beforeEach(() => {
    // jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
  });

  test("session expired", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <SessionExpiredPage />
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(screen.getByText("errorButton.close"));
    });

    // expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    await waitFor(async () => {
      expect(location.href).toBe("http://localhost/");
    });
  });

  test("session expired with cart", async () => {
    navigate.mockReset();
    const returnUrls: CartRequestReturnUrls = {
      returnOkUrl: "http://okUrl",
      returnCancelUrl: "http://cancelUrl",
      returnErrorUrl: "http://errorUrl",
    };

    const cart: Cart = {
      emailNotice: "test@test.it",
      idCart: "idCart",
      paymentNotices: [] as Array<PaymentNotice>,
      returnUrls,
    };

    (getSessionItem as jest.Mock).mockImplementation(() => cart);

    renderWithReduxProvider(
      <MemoryRouter>
        <SessionExpiredPage />
      </MemoryRouter>
    );

    act(() => {
      const close = screen.getByText("paymentResponsePage.buttons.continue");
      fireEvent.click(close);
    });
    await waitFor(async () => {
      expect(location.href).toBe(
        cart.returnUrls.returnErrorUrl.toLowerCase() + "/"
      );
    });
  });
});
