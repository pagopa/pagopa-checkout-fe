import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { waitFor } from "@testing-library/react";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import GdiCheckPage from "../GdiCheckPage";
import { getConfigOrThrow } from "../../utils/config/config";
// import { getSessionItem, SessionItems, setSessionItem } from "../../utils/storage/sessionStorage";

// Mock translations
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

// Create a Jest spy for navigation
const navigate = jest.fn();

// Mock react-router-dom so that useNavigate returns our spy function.
// Note: We spread the actual module to preserve its other exports.
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => navigate,
}));

// Mock the config module
jest.mock("../../utils/config/config", () => ({
  getConfigOrThrow: jest.fn(),
}));

jest.mock("../../utils/config/config", () =>
  // Return the actual implementation but with our mock for getConfigOrThrow
  ({
    // This is the key fix - handle the case when no key is provided
    getConfigOrThrow: jest.fn((key) => {
      // Create a mapping of all config values
      const configValues = {
        CHECKOUT_GDI_CHECK_TIMEOUT: 1000,
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

describe("GdiCheckPage", () => {
  test("should navigate to esito", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <GdiCheckPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("esito", { replace: true });
    });
  });

  test("should navigate to errore when timeout is wrong params", async () => {
    (getConfigOrThrow as jest.Mock).mockImplementation((key) => {
      // Create a mapping of all config values
      const configValues = {
        CHECKOUT_GDI_CHECK_TIMEOUT: "1000",
        // Add other config values as needed
      } as any;

      // If no key provided, return all config values (this is the important part)
      if (key === undefined) {
        return configValues;
      }

      // Otherwise return the specific config value
      return configValues[key] || "";
    });
    renderWithReduxProvider(
      <MemoryRouter>
        <GdiCheckPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("errore", { replace: true });
    });
  });
});
