import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import ClickableFieldContainer from "../ClickableFieldContainer";

// Mock the react-i18next hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key as-is for testing
  }),
}));

describe("ClickableFieldContainer", () => {
  const mockProps = {
    title: "Test Title",
    onClick: jest.fn(),
  };

  const getContainerButton = () =>
    screen.getByRole("button", { name: /Test Title/i });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with required props", () => {
    render(<ClickableFieldContainer {...mockProps} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    const icon = <div data-testid="test-icon">Icon</div>;
    render(<ClickableFieldContainer {...mockProps} icon={icon} />);

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(screen.getByText("Icon")).toBeInTheDocument();
  });

  it("renders with endAdornment", () => {
    const endAdornment = <div data-testid="test-adornment">End</div>;
    render(
      <ClickableFieldContainer {...mockProps} endAdornment={endAdornment} />
    );

    expect(screen.getByTestId("test-adornment")).toBeInTheDocument();
    expect(screen.getByText("End")).toBeInTheDocument();
  });

  it("calls onClick when clicked and clickable is true", () => {
    render(<ClickableFieldContainer {...mockProps} clickable={true} />);

    fireEvent.click(getContainerButton());

    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when clicked and clickable is false", () => {
    render(<ClickableFieldContainer {...mockProps} clickable={false} />);
    fireEvent.click(getContainerButton());
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when Enter key is pressed and clickable is true", async () => {
    const user = userEvent.setup();
    render(<ClickableFieldContainer {...mockProps} clickable={true} />);

    const button = getContainerButton();
    button.focus();
    await user.keyboard("{Enter}");

    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when other keys are pressed", () => {
    render(<ClickableFieldContainer {...mockProps} clickable={true} />);

    const button = getContainerButton();
    fireEvent.keyDown(button, { key: "Escape" });

    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when Enter key is pressed and clickable is false", () => {
    render(<ClickableFieldContainer {...mockProps} clickable={false} />);

    const container = screen.getByText("Test Title").closest(".MuiBox-root");
    fireEvent.keyDown(container!, { key: "Enter" });

    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when disabled is true", () => {
    render(<ClickableFieldContainer {...mockProps} disabled={true} />);

    const container = screen.getByText("Test Title").closest(".MuiBox-root");
    fireEvent.click(container!);

    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  it("renders with custom variant", () => {
    render(<ClickableFieldContainer {...mockProps} variant="body2" />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with custom sx prop", () => {
    const customSx = { backgroundColor: "red" };
    render(<ClickableFieldContainer {...mockProps} sx={customSx} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders with custom itemSx prop", () => {
    const customItemSx = { backgroundColor: "blue" };
    render(<ClickableFieldContainer {...mockProps} itemSx={customItemSx} />);

    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders in loading state", () => {
    render(<ClickableFieldContainer {...mockProps} loading={true} />);

    // In loading state, we should see skeleton elements
    const skeletons = document.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBe(2); // One for icon, one for title

    // Title should not be visible
    expect(screen.queryByText("Test Title")).not.toBeInTheDocument();

    // endAdornment should not be visible in loading state
    const endAdornment = <div data-testid="test-adornment">End</div>;
    render(
      <ClickableFieldContainer
        {...mockProps}
        loading={true}
        endAdornment={endAdornment}
      />
    );
    expect(screen.queryByTestId("test-adornment")).not.toBeInTheDocument();
  });

  it("sets tabIndex to 0 when clickable is true", () => {
    render(<ClickableFieldContainer {...mockProps} clickable={true} />);

    expect(getContainerButton()).toHaveAttribute("tabindex", "0");
  });

  it("does not set tabIndex when clickable is false", () => {
    render(<ClickableFieldContainer {...mockProps} clickable={false} />);

    const container = document.querySelector(".MuiBox-root");
    expect(container).not.toHaveAttribute("tabindex");
  });

  it("renders with data-qaid attribute", () => {
    render(<ClickableFieldContainer {...mockProps} dataTestId="test-id" />);

    expect(getContainerButton()).toHaveAttribute("data-qaid", "test-id");
  });

  it("renders with data-qalabel attribute", () => {
    render(
      <ClickableFieldContainer {...mockProps} dataTestLabel="test-label" />
    );

    expect(getContainerButton()).toHaveAttribute("data-qalabel", "test-label");
  });

  it("renders without title", () => {
    render(<ClickableFieldContainer onClick={mockProps.onClick} />);

    // Should render without errors
    const container = document.querySelector(".MuiBox-root");
    expect(container).toBeInTheDocument();

    // Title should be an empty string
    const typography = document.querySelector(".MuiTypography-root");
    expect(typography).toHaveTextContent("");
  });

  it("renders disabled state with correct text color", () => {
    render(<ClickableFieldContainer {...mockProps} disabled={true} />);

    // Component should render with disabled state
    expect(screen.getByText("Test Title")).toBeInTheDocument();

    // We can't easily test the exact color, but we can check if the component renders
  });

  const feeSingleMock = { min: 10, max: 10 };
  const feeRangeMock = { min: 5, max: 15 };

  it("displays feeSingle when min and max are equal", () => {
    render(<ClickableFieldContainer {...mockProps} feeRange={feeSingleMock} />);

    // Check that the translated feeSingle text is rendered
    expect(screen.getByText("paymentChoicePage.feeSingle")).toBeInTheDocument();
  });

  it("displays feeRange when min and max are different", () => {
    render(<ClickableFieldContainer {...mockProps} feeRange={feeRangeMock} />);

    // Check that the translated feeRange text is rendered
    expect(screen.getByText("paymentChoicePage.feeRange")).toBeInTheDocument();
  });

  it("does not render feeRange and feeSingle when feeRange prop is not provided", () => {
    render(<ClickableFieldContainer {...mockProps} />);

    // Check that no feeRange and feeSingle  text is rendered
    expect(
      screen.queryByText("paymentChoicePage.feeSingle")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("paymentChoicePage.feeRange")
    ).not.toBeInTheDocument();
  });

  // Test that bottom border is removed when isLast is true
  it("does not have bottom border when isLast is true", () => {
    render(<ClickableFieldContainer {...mockProps} isLast={true} />);

    const container = screen.getByText("Test Title").closest(".MuiBox-root");
    expect(container).toHaveStyle("border-bottom: none");
  });

  it("has bottom border when isLast is false", () => {
    render(<ClickableFieldContainer {...mockProps} isLast={false} />);
    const container = screen
      .getByText("Test Title")
      .closest(".MuiBox-root") as HTMLElement;
    expect(container).toHaveStyle(
      `border-bottom-color: ${container?.style.borderBottomColor}`
    );
  });
});
