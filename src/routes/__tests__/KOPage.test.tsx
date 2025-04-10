import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, act, screen, waitFor } from "@testing-library/react";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import KOPage from "../../routes/KOPage";
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

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  clearStorage: jest.fn(),
  SessionItems: {
    cart: "cart",
  },
}));

// Create a Jest spy for navigation
const navigate = jest.fn();

describe("KOPage", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    jest.spyOn(router, "useNavigate").mockReset();
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
  });
  test("ko page", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <KOPage />
      </MemoryRouter>
    );

    act(() => {
      fireEvent.click(screen.getByText("koPage.button"));
    });

    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
  });

  test("ko page with cart", async () => {
    (getSessionItem as jest.Mock).mockImplementation(() => cart);

    renderWithReduxProvider(
      <MemoryRouter>
        <KOPage />
      </MemoryRouter>
    );

    act(() => {
      const close = screen.getByText("paymentResponsePage.buttons.continue");
      fireEvent.click(close);
    });
    await waitFor(async () => {
      expect(window.location.replace).toHaveBeenCalledWith(
        cart.returnUrls.returnErrorUrl
      );
    });
  });
});
