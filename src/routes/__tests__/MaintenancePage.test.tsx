import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MaintenancePage from "../MaintenancePage";
// Mock translation
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("../../utils/config/config", () =>
  // Return the actual implementation but with our mock for getConfigOrThrow
  ({
    // This is the key fix - handle the case when no key is provided
    getConfigOrThrow: jest.fn((key) => {
      // Create a mapping of all config values
      const configValues = {
        CHECKOUT_API_TIMEOUT: 1000,
        CHECKOUT_API_RETRY_NUMBERS: 5,
        // Add other config values as needed
      } as any;

      // If no key provided, return all config values (this is the important part)
      if (key === undefined) {
        return configValues;
      }

      // Otherwise return the specific config value
      return configValues[key] || "";
    }),

  })
);

// Spy mixpanel
const mixpanelTrackMock = jest.fn();

const renderPage = () =>
  render(
    <BrowserRouter>
      <MaintenancePage />
    </BrowserRouter>
  );

describe("MaintenancePage", () => {
  beforeEach(() => {
    const location = window.location;

  delete (window as any).location;

  (window as any).location = {
    ...location,
    replace: jest.fn()};
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it("renders title and subtitle", () => {
    renderPage();
    expect(screen.getByText("maintenancePage.title")).toBeInTheDocument();
    expect(screen.getByText("maintenancePage.subtitle")).toBeInTheDocument();
  });

  it("sets document title and tracks page view", () => {
    renderPage();
    expect(document.title).toContain("maintenancePage.title");
    expect(mixpanelTrackMock).toHaveBeenCalledWith(
      "SCHEDULED_MAINTENANCE",
      expect.objectContaining({
        EVENT_ID: "SCHEDULED_MAINTENANCE",
        EVENT_CATEGORY: "KO",
        page: "/maintenance",
      })
    );
  });

  it("redirects on button click and tracks event", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button"));
    expect(mixpanelTrackMock).toHaveBeenCalledWith(
      "SCHEDULED_MAINTENANCE_MORE_INFO",
      expect.objectContaining({
        EVENT_ID: "SCHEDULED_MAINTENANCE_MORE_INFO",
        EVENT_CATEGORY: "UX",
        page: "/maintenance",
      })
    );
    expect(window.location.replace).toHaveBeenCalledWith(
      "https://status.platform.pagopa.it/"
    );
  });
});
