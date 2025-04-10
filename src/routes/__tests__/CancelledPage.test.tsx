import React from "react";
import "@testing-library/jest-dom";
import { act, fireEvent, waitFor, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import CancelledPage from "../CancelledPage";
import {
  clearStorage,
  getSessionItem,
} from "../../utils/storage/sessionStorage";
import "jest-location-mock";
import { checkLogout } from "../../utils/api/helper";
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

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  clearStorage: jest.fn(),
  SessionItems: {
    cart: "cart",
    authToken: "authToken",
  },
}));

jest.mock("../../utils/api/helper", () => ({
  checkLogout: jest.fn(),
}));

jest.mock("../../utils/eventListeners", () => ({
  removeEventListener: jest.fn(),
}));

// Create a Jest spy for navigation
const navigate = jest.fn();

describe("CancelledPage", () => {
  beforeEach(() => {
    // Return an object for initial session values (making sure it’s not a boolean)
    jest.resetAllMocks();
    jest.spyOn(router, "useNavigate").mockReset();
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
    (getSessionItem as jest.Mock).mockClear();
    (checkLogout as jest.Mock).mockClear();
  });

  test("Should clear storage when landing on cancelled page. Button redirects to home page when cart is not in session storage", async () => {
    (getSessionItem as jest.Mock).mockImplementation(() => undefined);
    (checkLogout as jest.Mock).mockImplementation(() => undefined);

    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <CancelledPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(clearStorage).toHaveBeenCalled();
    });
    // expect(removeEventListener).toHaveBeenCalled();
    // Query the button by its id
    act(() => {
      const redirectButton = container.querySelector("#redirect-button");

      expect(redirectButton).toBeInTheDocument();
      fireEvent.click(redirectButton!);
    });
    await waitFor(async () => {
      // expect(location.href).toBe("http://localhost/");
      expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  test("Should clear storage when landing on cancelled page. Button redirects to custom url when cart is in session storage", async () => {
    (checkLogout as jest.Mock).mockImplementation(() => undefined);
    (getSessionItem as jest.Mock).mockImplementation((item) => {
      switch (item) {
        case "cart":
          return cart;
        default:
          return undefined;
      }
    });

    renderWithReduxProvider(
      <MemoryRouter>
        <CancelledPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(clearStorage).toHaveBeenCalled();
    });
    act(() => {
      // Query the button by its id
      fireEvent.click(screen.getByText("paymentResponsePage.buttons.continue"));
    });
    expect(window.location.replace).toHaveBeenCalledWith(
      cart.returnUrls.returnCancelUrl
    );
  });
});
