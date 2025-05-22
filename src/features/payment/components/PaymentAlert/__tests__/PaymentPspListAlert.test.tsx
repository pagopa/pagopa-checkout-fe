import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import { PaymentPspListAlert } from "../PaymentPspListAlert";

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

describe("PaymentAlert", () => {
  const onCloseMock = jest.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
  });

  it("renders correctly with translation keys and triggers onClose", () => {
    render(
      <PaymentPspListAlert
        onClose={onCloseMock}
        titleKey="alert.title"
        bodyKey="alert.body"
      />
    );

    // Assert translated title and body are rendered
    expect(screen.getByText("[t]alert.title")).toBeInTheDocument();
    expect(screen.getByText("[t]alert.body")).toBeInTheDocument();

    // Assert close button is rendered
    const closeButton = screen.getByRole("button", { name: "Chiudi" });
    expect(closeButton).toBeInTheDocument();

    // Simulate button click
    fireEvent.click(closeButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});
