import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, act } from "@testing-library/react";
import * as router from "react-router";
import mixpanel from "mixpanel-browser";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import PaymentQrPage from "../PaymentQrPage";
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

// Mock the config module
jest.mock("../../utils/config/config", () =>
  // Return the actual implementation but with our mock for getConfigOrThrow
  ({
    // This is the key fix - handle the case when no key is provided
    getConfigOrThrow: jest.fn((key) => {
      // Create a mapping of all config values
      const configValues = {
        CHECKOUT_ENV: "TEST",
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

jest.mock("mixpanel-browser", () => ({
  track: jest.fn(),
}));

jest.mock("../../utils/mixpanel/mixpanelEvents", () => ({
  __esModule: true,
  MixpanelEventsId: {
    CHK_QRCODE_SCAN_SCREEN: "CHK_QRCODE_SCAN_SCREEN",
    CHK_QRCODE_SCAN_SCREEN_MANUAL_ENTRY: "CHK_QRCODE_SCAN_SCREEN_MANUAL_ENTRY",
  },
}));

// Create a Jest spy for navigation
const navigate = jest.fn();
// Error with definition of worker
describe("PaymentQrPage", () => {
  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
  });

  test.skip("should show link to go to manual enter", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentQrPage />
      </MemoryRouter>
    );
    act(() => {
      const goToInserisciManualmente = screen.getByText(
        "paymentQrPage.navigate"
      );
      fireEvent.click(goToInserisciManualmente);
    });
    expect(navigate).toHaveBeenCalledWith("/inserisci-dati-avviso");
  });

  test("tracks CHK_QRCODE_SCAN_SCREEN on mount", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentQrPage />
      </MemoryRouter>
    );

    expect(mixpanel.track).toHaveBeenCalledWith("CHK_QRCODE_SCAN_SCREEN", {
      EVENT_ID: "CHK_QRCODE_SCAN_SCREEN",
    });
  });

  test("tracks event and navigates when clicking 'inserisci manualmente'", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentQrPage />
      </MemoryRouter>
    );

    const goToInserisciManualmente = screen.getByText("paymentQrPage.navigate");
    fireEvent.click(goToInserisciManualmente);

    expect(mixpanel.track).toHaveBeenCalledWith(
      "CHK_QRCODE_SCAN_SCREEN_MANUAL_ENTRY",
      {
        EVENT_ID: "CHK_QRCODE_SCAN_SCREEN_MANUAL_ENTRY",
      }
    );

    expect(navigate).toHaveBeenCalledWith("/inserisci-dati-avviso");
  });
});
