import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";

jest.mock("../../components/themeContextProvider/themeContextProvider", () => ({
  __esModule: true,
  ThemeContext: {
    Provider: ({ children }: { children: any }) => children,
    Consumer: ({ children }: { children: any }) => children,
  },
  ThemeModes: {
    DARK: "dark",
    LIGHT: "light",
  },
}));

import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import PaymentOutlet from "../PaymentOutlet";

describe("PaymentOutlet", () => {
  test("Render page", async () => {
    // When getEcommercePaymentInfoTask is invoked, return a failed TaskEither.
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentOutlet />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
  });
});
