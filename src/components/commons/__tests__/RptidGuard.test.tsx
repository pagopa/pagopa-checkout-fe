import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useParams } from "react-router-dom";
import RptidGuard from "../RptidGuard";

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  Navigate: () => <div data-testid="navigate">Redirected to home</div>,
}));

describe("RptidGuard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when rptid is a valid 29-digit number", () => {
    // Mock useParams to return a valid rptid
    (useParams as jest.Mock).mockReturnValue({
      rptid: "12345678901234567890123456789",
    });

    render(
      <RptidGuard>
        <div>Protected Content</div>
      </RptidGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
  });

  it('navigates to "/" when rptid is not a 29-digit number', () => {
    // Mock useParams to return an invalid rptid
    (useParams as jest.Mock).mockReturnValue({ rptid: "123456" });

    render(
      <RptidGuard>
        <div>Protected Content</div>
      </RptidGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
  });

  it('navigates to "/" when rptid contains non-numeric characters', () => {
    // Mock useParams to return an rptid with non-numeric characters
    (useParams as jest.Mock).mockReturnValue({
      rptid: "12345678901234567890123456abc",
    });

    render(
      <RptidGuard>
        <div>Protected Content</div>
      </RptidGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
  });

  it('navigates to "/" when rptid is undefined', () => {
    // Mock useParams to return undefined rptid
    (useParams as jest.Mock).mockReturnValue({});

    render(
      <RptidGuard>
        <div>Protected Content</div>
      </RptidGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
  });

  it('navigates to "/" when rptid is more than 29 digits', () => {
    // Mock useParams to return an rptid with more than 29 digits
    (useParams as jest.Mock).mockReturnValue({
      rptid: "123456789012345678901234567890",
    });

    render(
      <RptidGuard>
        <div>Protected Content</div>
      </RptidGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
  });

  it("validates rptid correctly with surrounding text", () => {
    // The regex in RptidGuard uses \b word boundaries, so we should test this behavior
    (useParams as jest.Mock).mockReturnValue({
      rptid: "prefix12345678901234567890123456789suffix",
    });

    render(
      <RptidGuard>
        <div>Protected Content</div>
      </RptidGuard>
    );

    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    expect(screen.getByTestId("navigate")).toBeInTheDocument();
  });
});
