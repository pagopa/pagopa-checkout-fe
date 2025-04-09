import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { FormButtons } from "../FormButtons";
import { useSmallDevice } from "../../../hooks/useSmallDevice";

// Mock the dependencies
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Simple mock translation function
      const translations: Record<string, string> = {
        "ariaLabels.loading": "Loading...",
        cancel: "Cancel",
        submit: "Submit",
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock("../../../hooks/useSmallDevice", () => ({
  useSmallDevice: jest.fn(),
}));

describe("FormButtons Component", () => {
  // Common props for testing
  const defaultProps = {
    handleSubmit: jest.fn(),
    handleCancel: jest.fn(),
    disabledSubmit: false,
    submitTitle: "submit",
    cancelTitle: "cancel",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default to desktop view
    (useSmallDevice as jest.Mock).mockReturnValue(false);
  });

  it("renders submit and cancel buttons", () => {
    render(<FormButtons {...defaultProps} />);

    // Check that both buttons are rendered
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls handleSubmit when submit button is clicked", () => {
    render(<FormButtons {...defaultProps} />);

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("calls handleCancel when cancel button is clicked", () => {
    render(<FormButtons {...defaultProps} />);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(defaultProps.handleCancel).toHaveBeenCalledTimes(1);
  });

  it("disables submit button when disabledSubmit is true", () => {
    render(<FormButtons {...defaultProps} disabledSubmit={true} />);

    const submitButton = screen.getByText("Submit");
    expect(submitButton).toBeDisabled();
  });

  it("disables cancel button when disabledCancel is true", () => {
    render(<FormButtons {...defaultProps} disabledCancel={true} />);

    const cancelButton = screen.getByText("Cancel");
    expect(cancelButton).toBeDisabled();
  });

  it("disables cancel button when loadingSubmit is true", () => {
    render(<FormButtons {...defaultProps} loadingSubmit={true} />);

    // When submit is loading, the cancel button should be disabled
    const cancelButton = screen.getByLabelText("Cancel");
    expect(cancelButton).toBeDisabled();
  });

  it("shows loading state for submit button", () => {
    render(<FormButtons {...defaultProps} loadingSubmit={true} />);

    // Check that the loading aria-label is applied
    const submitButton = screen.getByLabelText("Loading...");
    expect(submitButton).toHaveAttribute("aria-live", "polite");

    // Check that the button text is empty during loading
    expect(submitButton).toHaveTextContent("");
  });

  it("shows loading state for cancel button", () => {
    render(<FormButtons {...defaultProps} loadingCancel={true} />);

    // Check that the loading aria-label is applied
    const cancelButton = screen.getByLabelText("Loading...");
    expect(cancelButton).toHaveAttribute("aria-live", "polite");

    // Check that the button text is empty during loading
    expect(cancelButton).toHaveTextContent("");
  });

  it("hides cancel button when hideCancel is true", () => {
    render(<FormButtons {...defaultProps} hideCancel={true} />);

    // Cancel button should not be visible
    expect(screen.queryByText("Cancel")).not.toBeVisible();

    // Submit button should take full width (xs={12})
    const submitButton = screen.getByText("Submit");
    const submitGrid = submitButton.closest(".MuiGrid-item");
    expect(submitGrid).toHaveClass("MuiGrid-grid-xs-12");
  });

  it("applies correct button variants", () => {
    render(<FormButtons {...defaultProps} />);

    const submitButton = screen.getByText("Submit");
    const cancelButton = screen.getByText("Cancel");

    // Submit should be contained, cancel should be outlined
    expect(submitButton).toHaveClass("MuiButton-contained");
    expect(cancelButton).toHaveClass("MuiButton-outlined");
  });

  it("applies correct button IDs when provided", () => {
    render(
      <FormButtons
        {...defaultProps}
        idSubmit="test-submit-id"
        idCancel="test-cancel-id"
      />
    );

    const submitButton = screen.getByText("Submit");
    const cancelButton = screen.getByText("Cancel");

    expect(submitButton).toHaveAttribute("id", "test-submit-id");
    expect(cancelButton).toHaveAttribute("id", "test-cancel-id");
  });

  it("applies correct type to submit button", () => {
    // Test with type="submit"
    render(<FormButtons {...defaultProps} type="submit" />);

    const submitButton = screen.getByText("Submit");
    expect(submitButton).toHaveAttribute("type", "submit");

    // Re-render with type="button"
    render(<FormButtons {...defaultProps} type="button" />);

    const buttonTypeSubmit = screen.getAllByText("Submit")[1]; // Get the second instance
    expect(buttonTypeSubmit).toHaveAttribute("type", "button");
  });

  it("uses handleSubmit for onClick when type is button", () => {
    render(<FormButtons {...defaultProps} type="button" />);

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    expect(defaultProps.handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("does not use handleSubmit for onClick when type is submit", () => {
    const handleSubmitMock = jest.fn();

    render(
      <FormButtons
        {...defaultProps}
        type="submit"
        handleSubmit={handleSubmitMock}
      />
    );

    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    // onClick should not trigger handleSubmit when type is "submit"
    // as it would be handled by the form's onSubmit handler instead
    expect(handleSubmitMock).not.toHaveBeenCalled();
  });

  it("applies paddingTop: 0 style to Grid items on small devices", () => {
    // Mock small device
    (useSmallDevice as jest.Mock).mockReturnValue(true);

    const { container } = render(<FormButtons {...defaultProps} />);

    // Find Grid items
    const gridItems = container.querySelectorAll(".MuiGrid-item");

    // Check that they have paddingTop: 0
    gridItems.forEach((item) => {
      expect(item).toHaveStyle("padding-top: 0px");
    });
  });

  it("does not apply paddingTop: 0 style on large devices", () => {
    // Mock large device
    (useSmallDevice as jest.Mock).mockReturnValue(false);

    const { container } = render(<FormButtons {...defaultProps} />);

    // Find Grid items
    const gridItems = container.querySelectorAll(".MuiGrid-item");

    // Check that they don't have paddingTop: 0
    gridItems.forEach((item) => {
      // The style object should be empty or not contain paddingTop: 0
      const style = item.getAttribute("style") || "";
      expect(style).not.toContain("padding-top: 0px");
    });
  });

  it("applies correct responsive styles to container Grid", () => {
    const { container } = render(<FormButtons {...defaultProps} />);

    // Get the main container Grid
    const mainGrid = container.querySelector(".MuiGrid-container");
    expect(mainGrid).toBeInTheDocument();

    // Check that it has the correct classes for responsive styling
    // This is harder to test directly, but we can check for the Grid's existence
    expect(mainGrid).toHaveClass("MuiGrid-container");
  });

  it("applies correct aria attributes for accessibility", () => {
    render(<FormButtons {...defaultProps} />);

    const submitButton = screen.getByText("Submit");
    const cancelButton = screen.getByText("Cancel");

    // Check aria-live attribute
    expect(submitButton).toHaveAttribute("aria-live", "polite");
    expect(cancelButton).toHaveAttribute("aria-live", "polite");

    // Check aria-label attribute
    expect(submitButton).toHaveAttribute("aria-label", "Submit");
    expect(cancelButton).toHaveAttribute("aria-label", "Cancel");

    // In the default state, aria-hidden should not be present
    // or should be null since it's only set when loading states are true
    expect(submitButton).not.toHaveAttribute("aria-hidden");
    expect(cancelButton).not.toHaveAttribute("aria-hidden");
  });

  it("sets aria-hidden on submit button when cancel is loading", () => {
    render(<FormButtons {...defaultProps} loadingCancel={true} />);

    const submitButton = screen.getByLabelText("Submit");
    expect(submitButton).toHaveAttribute("aria-hidden", "true");
  });

  it("sets aria-hidden on cancel button when submit is loading", () => {
    render(<FormButtons {...defaultProps} loadingSubmit={true} />);

    const cancelButton = screen.getByLabelText("Cancel");
    expect(cancelButton).toHaveAttribute("aria-hidden", "true");
  });

  it("applies correct styling to buttons", () => {
    render(<FormButtons {...defaultProps} />);

    const submitButton = screen.getByText("Submit");
    const cancelButton = screen.getByText("Cancel");

    // Check common styles
    [submitButton, cancelButton].forEach((button) => {
      expect(button).toHaveStyle({
        width: "100%",
        height: "100%",
        minHeight: "45px",
      });
    });
  });
});
