import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import CancelledPage from "../CancelledPage";
import {
  clearStorage,
  getSessionItem,
} from "../../utils/storage/sessionStorage";
import "jest-location-mock";
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
  });

  test("Should clear storage when landing on cancelled page. Button redirects to home page when cart is not in session storage", async () => {
    (getSessionItem as jest.Mock).mockImplementation(() => undefined);

    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <CancelledPage />
      </MemoryRouter>
    );
    expect(clearStorage).toHaveBeenCalled();
    // expect(removeEventListener).toHaveBeenCalled();
    // Query the button by its id
    const redirectButton = container.querySelector("#redirect-button");

    expect(redirectButton).toBeInTheDocument();
    fireEvent.click(redirectButton!);
    await waitFor(async () => {
      expect(location.href).toBe("http://localhost/");
    });
  });

  test("Should clear storage when landing on cancelled page. Button redirects to custom url when cart is in session storage", async () => {
    (getSessionItem as jest.Mock).mockImplementation((item) => {
      switch (item) {
        case "cart":
          return cart;
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
    expect(redirectButton?.textContent).toBe(
      "paymentResponsePage.buttons.continue"
    );
    fireEvent.click(redirectButton!);
    await waitFor(async () => {
      expect(location.href).toBe(
        cart.returnUrls.returnCancelUrl.toLowerCase() + "/"
      );
    });
  });
});
