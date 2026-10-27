import React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ScheduledMaintenanceBanner } from "../ScheduledMaintenanceBanner";

// Mock MUI
jest.mock("@mui/material", () => {
  const actual = jest.requireActual("@mui/material");
  return {
    ...actual,
    Alert: actual.Alert,
    AlertTitle: actual.AlertTitle,
    Button: actual.Button,
  };
});

// Mock useTranslation from react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => `[t]${key}`,
  }),
}));

describe("ScheduledMaintenanceBanner", () => {
  it("renders correctly with translation keys", () => {
    render(<ScheduledMaintenanceBanner />);

    // Assert translated title and body are rendered
    expect(
      screen.getByText("[t]ScheduledMaintenanceBanner.titleKey")
    ).toBeInTheDocument();
    expect(
      screen.getByText("[t]ScheduledMaintenanceBanner.bodyKey")
    ).toBeInTheDocument();
    expect(
      screen.getByText("[t]ScheduledMaintenanceBanner.linkTextKey")
    ).toBeInTheDocument();
  });
});
