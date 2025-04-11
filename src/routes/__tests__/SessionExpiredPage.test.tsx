import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, act, screen } from "@testing-library/react";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import SessionExpiredPage from "../../routes/SessionExpiredPage";
import { getSessionItem } from "../../utils/storage/sessionStorage";
import "jest-location-mock";
import { cart } from "./_model";

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
    jest.spyOn(router, "useNavigate").mockReset();
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
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

    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });

  test("session expired with cart", async () => {
    navigate.mockReset();

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

    expect(window.location.replace).toHaveBeenCalledWith(
      cart.returnUrls.returnErrorUrl
    );
  });
});
