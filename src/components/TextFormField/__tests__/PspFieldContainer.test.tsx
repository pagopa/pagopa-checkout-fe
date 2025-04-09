import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PspFieldContainer from "../PspFieldContainer";

describe("PspFieldContainer", () => {
  const mockProps = {
    image: "test-image.png",
    body: "Test Body",
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with required props", () => {
    render(<PspFieldContainer {...mockProps} />);

    // Check if image is rendered with correct attributes
    const image = screen.getByRole("img", { hidden: true });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "test-image.png");
    expect(image).toHaveAttribute("alt", "Logo Test Body");

    // Check if body text is rendered
    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders with number body", () => {
    render(<PspFieldContainer {...mockProps} body={123} />);
    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    render(<PspFieldContainer {...mockProps} />);

    const container = screen
      .getByText("Test Body")
      .closest('div[tabindex="0"]');
    fireEvent.click(container!);

    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick when Enter key is pressed", () => {
    render(<PspFieldContainer {...mockProps} />);

    const container = screen
      .getByText("Test Body")
      .closest('div[tabindex="0"]');
    fireEvent.keyDown(container!, { key: "Enter" });

    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when other keys are pressed", () => {
    render(<PspFieldContainer {...mockProps} />);

    const container = screen
      .getByText("Test Body")
      .closest('div[tabindex="0"]');
    fireEvent.keyDown(container!, { key: "Space" });

    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  it("renders with row flexDirection", () => {
    render(<PspFieldContainer {...mockProps} flexDirection="row" />);

    // We can't easily test CSS properties directly, but we can check if the component renders
    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders with custom bodyVariant", () => {
    render(<PspFieldContainer {...mockProps} bodyVariant="body2" />);

    // Check if the component renders with the custom variant
    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders with custom sx prop", () => {
    const customSx = { backgroundColor: "red" };
    render(<PspFieldContainer {...mockProps} sx={customSx} />);

    expect(screen.getByText("Test Body")).toBeInTheDocument();
  });

  it("renders with endAdornment", () => {
    const endAdornment = <div data-testid="end-adornment">End</div>;
    render(<PspFieldContainer {...mockProps} endAdornment={endAdornment} />);

    expect(screen.getByTestId("end-adornment")).toBeInTheDocument();
    expect(screen.getByText("End")).toBeInTheDocument();
  });

  it("renders with undefined image", () => {
    render(<PspFieldContainer {...mockProps} image={undefined} />);

    const image = screen.getByRole("img", { hidden: true });
    expect(image).toBeInTheDocument();
  });

  it("renders with undefined body", () => {
    render(<PspFieldContainer {...mockProps} body={undefined} />);

    const typographyElement = screen.queryByText("Test Body");
    expect(typographyElement).toBeNull();
  });
});
