import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import MaintenancePage from "../MaintenancePage"; // adjust path as needed

// Mock translation
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

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
    jest.spyOn(window.location, "replace").mockImplementation(jest.fn());
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
