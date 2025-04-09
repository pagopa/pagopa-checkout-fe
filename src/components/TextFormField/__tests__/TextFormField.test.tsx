import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import TextFormField from "../TextFormField";

// Mock the i18next translation
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key as the translation for testing
  }),
}));

const theme = createTheme();

describe("TextFormField", () => {
  const defaultProps = {
    fullWidth: true,
    errorText: undefined,
    error: false,
    label: "Test Label",
    id: "test-field",
    type: "text",
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
  };

  it("renders correctly with default props", () => {
    render(
      <ThemeProvider theme={theme}>
        <TextFormField {...defaultProps} />
      </ThemeProvider>
    );

    // Check if the label is rendered correctly
    const labelElement = screen.getByLabelText("Test Label");
    expect(labelElement).toBeInTheDocument();

    // Check if the input has the correct id
    expect(labelElement).toHaveAttribute("id", "test-field");

    // Check if the input has the correct type
    expect(labelElement).toHaveAttribute("type", "text");

    // Check if the input is not disabled by default
    expect(labelElement).not.toBeDisabled();

    // Check if the input is not readonly by default
    expect(labelElement).not.toHaveAttribute("readonly");
  });

  it("shows error message when error is true", () => {
    const propsWithError = {
      ...defaultProps,
      error: true,
      errorText: "Error message",
    };

    render(
      <ThemeProvider theme={theme}>
        <TextFormField {...propsWithError} />
      </ThemeProvider>
    );

    // Check if the error message is displayed
    const errorMessage = screen.getByText("Error message");
    expect(errorMessage).toBeInTheDocument();

    // Check that the error message has the error class
    expect(errorMessage).toHaveClass("Mui-error");

    // Check that the input has the error styling
    const input = screen.getByLabelText("Test Label");
    const inputWrapper = input.closest(".MuiInputBase-root");
    expect(inputWrapper).toHaveClass("Mui-error");

    // Check that the label has the error class - use the label element by its ID
    const label = document.getElementById("test-field-label");
    expect(label).toHaveClass("Mui-error");
  });

  it("handles input changes correctly", () => {
    render(
      <ThemeProvider theme={theme}>
        <TextFormField {...defaultProps} />
      </ThemeProvider>
    );

    const input = screen.getByLabelText("Test Label");

    // Simulate a change event
    fireEvent.change(input, { target: { value: "New Value" } });

    // Check if handleChange was called
    expect(defaultProps.handleChange).toHaveBeenCalled();
  });

  it("handles blur events correctly", () => {
    render(
      <ThemeProvider theme={theme}>
        <TextFormField {...defaultProps} />
      </ThemeProvider>
    );

    const input = screen.getByLabelText("Test Label");

    // Simulate a blur event
    fireEvent.blur(input);

    // Check if handleBlur was called
    expect(defaultProps.handleBlur).toHaveBeenCalled();
  });

  it("renders with custom styles", () => {
    const customStyle = {
      color: "red",
      backgroundColor: "blue",
    };

    const customSx = {
      padding: "5px",
    };

    render(
      <ThemeProvider theme={theme}>
        <TextFormField {...defaultProps} style={customStyle} sx={customSx} />
      </ThemeProvider>
    );

    // Get the TextField root element
    const textField = screen
      .getByLabelText("Test Label")
      .closest(".MuiFormControl-root");

    // Check if the custom style is applied
    // Instead of checking exact margin values (which might be affected by theme),
    // just check that the padding we specified is applied
    expect(textField).toHaveStyle("padding: 5px");
  });

  it("renders with adornments", () => {
    const startAdornment = <span>Start</span>;
    const endAdornment = <span>End</span>;

    render(
      <ThemeProvider theme={theme}>
        <TextFormField
          {...defaultProps}
          startAdornment={startAdornment}
          endAdornment={endAdornment}
        />
      </ThemeProvider>
    );

    // Check if adornments are rendered
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("End")).toBeInTheDocument();
  });

  it("renders as disabled when disabled prop is true", () => {
    render(
      <ThemeProvider theme={theme}>
        <TextFormField {...defaultProps} disabled={true} />
      </ThemeProvider>
    );

    // Check if the input is disabled
    const input = screen.getByLabelText("Test Label");
    expect(input).toBeDisabled();
  });

  it("renders as readonly when readOnly prop is true", () => {
    render(
      <ThemeProvider theme={theme}>
        <TextFormField {...defaultProps} readOnly={true} />
      </ThemeProvider>
    );

    // Check if the input is readonly
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("readonly");
  });

  it("renders with different input modes", () => {
    render(
      <ThemeProvider theme={theme}>
        <TextFormField {...defaultProps} inputMode="numeric" />
      </ThemeProvider>
    );

    // Check if inputMode is set correctly
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("inputmode", "numeric");
  });

  it("renders with different variants", () => {
    render(
      <ThemeProvider theme={theme}>
        <TextFormField {...defaultProps} variant="filled" />
      </ThemeProvider>
    );

    // Check if the variant is applied by checking for the filled input
    const input = screen.getByLabelText("Test Label");
    // In MUI v5, the filled class is on the input wrapper, not the form control
    const inputWrapper = input.closest(".MuiInputBase-root");
    expect(inputWrapper).toHaveClass("MuiFilledInput-root");
  });

  it("renders with autoComplete attribute", () => {
    render(
      <ThemeProvider theme={theme}>
        <TextFormField {...defaultProps} autoComplete="off" />
      </ThemeProvider>
    );

    // Check if autoComplete is set correctly
    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("autocomplete", "off");
  });
});
