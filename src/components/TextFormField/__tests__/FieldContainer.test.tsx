import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FieldContainer from "../FieldContainer";

// Mock the react-i18next hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key as-is for testing
  }),
}));

describe("FieldContainer", () => {
  const mockProps = {
    title: "Test Title",
    body: "Test Body",
  };

  it("renders with required props", () => {
    render(<FieldContainer {...mockProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders with number body", () => {
    render(<FieldContainer {...mockProps} body={123} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("renders with undefined body", () => {
    render(<FieldContainer {...mockProps} body={undefined} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    // Body should be empty when undefined
    const bodyElement = screen.getByText("Test Title").parentElement;
    expect(bodyElement).toBeInTheDocument();
  });

  it("renders with icon", () => {
    const icon = <div data-testid="test-icon">Icon</div>;
    render(<FieldContainer {...mockProps} icon={icon} />);

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByText("Icon")).toBeInTheDocument();
  });

  it("renders with endAdornment", () => {
    const endAdornment = <div data-testid="test-adornment">End</div>;
    render(<FieldContainer {...mockProps} endAdornment={endAdornment} />);

    expect(screen.getByTestId("test-adornment")).toBeInTheDocument();
    expect(screen.getByText("End")).toBeInTheDocument();
  });

  it("renders with disclaimer", () => {
    const disclaimer = <div data-testid="test-disclaimer">Disclaimer</div>;
    render(<FieldContainer {...mockProps} disclaimer={disclaimer} />);

    expect(screen.getByTestId("test-disclaimer")).toBeInTheDocument();
    expect(screen.getByText("Disclaimer")).toBeInTheDocument();
  });

  it("renders with row flexDirection", () => {
    render(<FieldContainer {...mockProps} flexDirection="row" />);

    // We can't easily test CSS properties directly, but we can check if the component renders
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders with custom titleVariant", () => {
    render(<FieldContainer {...mockProps} titleVariant="sidenav" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders with custom bodyVariant", () => {
    render(<FieldContainer {...mockProps} bodyVariant="body2" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders with custom sx prop", () => {
    const customSx = { backgroundColor: "red" };
    render(<FieldContainer {...mockProps} sx={customSx} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders with overflowWrapBody set to false", () => {
    render(<FieldContainer {...mockProps} overflowWrapBody={false} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders in loading state", () => {
    render(<FieldContainer {...mockProps} loading={true} />);

    // In loading state, we should see skeleton elements
    // MUI Skeleton components don't have 'progressbar' role by default
    // We can check for their presence by class name
    const skeletons = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBe(2); // One for title, one for body

    // Title and body text should not be visible
    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();
    expect(screen.queryByText("Test Body")).not.toBeInTheDocument();
  });

  it("renders in loading state with icon", () => {
    const icon = <div data-testid="test-icon">Icon</div>;
    render(<FieldContainer {...mockProps} loading={true} icon={icon} />);

    // In loading state with icon, we should see skeleton elements
    const skeletons = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBe(3); // One for icon, one for title, one for body

    // Icon should not be visible
    expect(screen.queryByTestId("test-icon")).not.toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<FieldContainer {...mockProps} onClick={handleClick} />);

    const container = screen.getByText("Test Title").closest(".MuiBox-root");
    fireEvent.click(container!);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("calls onKeyDown when key is pressed", () => {
    const handleKeyDown = jest.fn();
    render(<FieldContainer {...mockProps} onKeyDown={handleKeyDown} />);

    const container = screen.getByText("Test Title").closest(".MuiBox-root");
    fireEvent.keyDown(container!, { key: "Enter" });

    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it("renders with custom tabIndex", () => {
    render(<FieldContainer {...mockProps} tabIndex={1} />);

    // Get the outermost Box component
    const container = document.querySelector(".MuiBox-root");
    expect(container).toHaveAttribute("tabindex", "1");
  });

  it("renders with custom role", () => {
    render(<FieldContainer {...mockProps} role="button" />);

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders disclaimer only when not loading", () => {
    const disclaimer = <div data-testid="test-disclaimer">Disclaimer</div>;

    // First render with loading=true
    const { rerender } = render(
      <FieldContainer {...mockProps} disclaimer={disclaimer} loading={true} />
    );

    // Disclaimer should not be visible when loading
    expect(screen.queryByTestId("test-disclaimer")).not.toBeInTheDocument();

    // Re-render with loading=false
    rerender(
      <FieldContainer {...mockProps} disclaimer={disclaimer} loading={false} />
    );

    // Disclaimer should be visible when not loading
    expect(screen.getByTestId("test-disclaimer")).toBeInTheDocument();
  });
});
