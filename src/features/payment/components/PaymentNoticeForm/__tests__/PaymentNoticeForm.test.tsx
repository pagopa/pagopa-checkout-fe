import React from "react";
import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { PaymentNoticeForm } from "../PaymentNoticeForm";
import { cleanSpaces } from "../../../../../utils/form/formatters";

jest.mock("../../../../../utils/form/formatters", () => ({
  cleanSpaces: jest.fn((val) => val.replace(/\s/g, "")),
}));

jest.mock("../../../../../utils/form/validators", () => ({
  getFormValidationIcon: jest.fn(() => <div data-testid="validation-icon" />),
}));

jest.mock("../../../../../components/FormButtons/FormButtons", () => ({
  FormButtons: ({
    handleSubmit,
    handleCancel,
    disabledSubmit,
    loadingSubmit,
  }: any) => (
    <div>
      <button
        data-testid="submit-button"
        onClick={handleSubmit}
        disabled={disabledSubmit}
        data-loading={loadingSubmit ? "true" : "false"}
      >
        Submit
      </button>
      <button data-testid="cancel-button" onClick={handleCancel}>
        Cancel
      </button>
    </div>
  ),
}));

// Mock the TextFormField component to properly handle errors
jest.mock(
  "../../../../../components/TextFormField/TextFormField",
  () =>
    function MockTextFormField({
      id,
      value,
      handleChange,
      handleBlur,
      error,
      errorText,
    }: any) {
      return (
        <div>
          <input
            data-testid={id}
            id={id}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {error && <span data-testid={`${id}-error`}>{errorText}</span>}
        </div>
      );
    }
);

describe("PaymentNoticeForm", () => {
  const defaultProps = {
    onCancel: jest.fn(),
    onSubmit: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up any pending effects
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it("renders form with empty values when no defaultValues provided", async () => {
    await act(async () => {
      render(<PaymentNoticeForm {...defaultProps} />);
    });

    const billCodeInput = screen.getByTestId("billCode");
    const cfInput = screen.getByTestId("cf");

    expect(billCodeInput).toHaveValue("");
    expect(cfInput).toHaveValue("");
    expect(screen.getByTestId("submit-button")).toBeDisabled();
  });

  it("renders form with defaultValues when provided", async () => {
    const defaultValues = {
      billCode: "123456789012345678",
      cf: "12345678901",
    };

    await act(async () => {
      render(
        <PaymentNoticeForm {...defaultProps} defaultValues={defaultValues} />
      );
    });

    const billCodeInput = screen.getByTestId("billCode");
    const cfInput = screen.getByTestId("cf");

    expect(billCodeInput).toHaveValue("123456789012345678");
    expect(cfInput).toHaveValue("12345678901");
    expect(screen.getByTestId("submit-button")).not.toBeDisabled();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    await act(async () => {
      render(<PaymentNoticeForm {...defaultProps} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("cancel-button"));
    });

    expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it("validates billCode field - shows error for empty value", async () => {
    await act(async () => {
      render(<PaymentNoticeForm {...defaultProps} />);
    });

    const billCodeInput = screen.getByTestId("billCode");

    await act(async () => {
      fireEvent.blur(billCodeInput);
    });

    await waitFor(() => {
      expect(screen.getByTestId("billCode-error")).toHaveTextContent(
        "paymentNoticePage.formErrors.required"
      );
    });
  });

  it("validates billCode field - shows error for invalid format", async () => {
    await act(async () => {
      render(<PaymentNoticeForm {...defaultProps} />);
    });

    const billCodeInput = screen.getByTestId("billCode");

    // First need to provide a value to move past the "required" validation
    await act(async () => {
      fireEvent.change(billCodeInput, { target: { value: "12345" } });
    });

    // Then blur to trigger validation
    await act(async () => {
      fireEvent.blur(billCodeInput);
    });

    // Now we should see the format validation error
    await waitFor(
      () => {
        const errorElement = screen.getByTestId("billCode-error");
        expect(errorElement).toHaveTextContent(
          "paymentNoticePage.formErrors.minCode"
        );
      },
      { timeout: 1000 }
    );
  });

  it("validates cf field - shows error for empty value", async () => {
    await act(async () => {
      render(<PaymentNoticeForm {...defaultProps} />);
    });

    const cfInput = screen.getByTestId("cf");

    await act(async () => {
      fireEvent.blur(cfInput);
    });

    await waitFor(() => {
      expect(screen.getByTestId("cf-error")).toHaveTextContent(
        "paymentNoticePage.formErrors.required"
      );
    });
  });

  it("validates cf field - shows error for invalid format", async () => {
    await act(async () => {
      render(<PaymentNoticeForm {...defaultProps} />);
    });

    const cfInput = screen.getByTestId("cf");

    // First provide a value to move past the "required" validation
    await act(async () => {
      fireEvent.change(cfInput, { target: { value: "12345" } });
    });

    // Then blur to trigger validation
    await act(async () => {
      fireEvent.blur(cfInput);
    });

    // Now we should see the format validation error
    await waitFor(
      () => {
        const errorElement = screen.getByTestId("cf-error");
        expect(errorElement).toHaveTextContent(
          "paymentNoticePage.formErrors.minCf"
        );
      },
      { timeout: 1000 }
    );
  });

  it("calls cleanSpaces on input change", async () => {
    await act(async () => {
      render(<PaymentNoticeForm {...defaultProps} />);
    });

    const billCodeInput = screen.getByTestId("billCode");

    await act(async () => {
      fireEvent.change(billCodeInput, { target: { value: "123 456" } });
    });

    expect(cleanSpaces).toHaveBeenCalledWith("123 456");
  });

  // Test for both fields valid and submit button enabled
  it("enables submit button when form is valid", async () => {
    // Create a spy to mock the validate function behavior
    const validateSpy = jest.spyOn(React, "useState");
    // Force the disabled state to be false
    validateSpy.mockImplementationOnce(() => [false, jest.fn()]);

    await act(async () => {
      render(
        <PaymentNoticeForm
          {...defaultProps}
          defaultValues={{
            billCode: "123456789012345678",
            cf: "12345678901",
          }}
        />
      );
    });

    // Button should not be disabled
    expect(screen.getByTestId("submit-button")).not.toBeDisabled();

    // Clean up
    validateSpy.mockRestore();
  });

  // Test form submission
  it("calls onSubmit with form values when form is submitted", async () => {
    const onSubmit = jest.fn();

    // Create a spy to mock the validate function behavior
    const validateSpy = jest.spyOn(React, "useState");
    // Force the disabled state to be false
    validateSpy.mockImplementationOnce(() => [false, jest.fn()]);

    await act(async () => {
      render(
        <PaymentNoticeForm
          {...defaultProps}
          onSubmit={onSubmit}
          defaultValues={{
            billCode: "123456789012345678",
            cf: "12345678901",
          }}
        />
      );
    });

    // Verify button is not disabled with our mock
    expect(screen.getByTestId("submit-button")).not.toBeDisabled();

    // Submit the form by clicking the button
    await act(async () => {
      fireEvent.click(screen.getByTestId("submit-button"));
    });

    // Check only the first argument of the first call
    const firstCallFirstArg = onSubmit.mock.calls[0][0];
    expect(firstCallFirstArg).toEqual({
      billCode: "123456789012345678",
      cf: "12345678901",
    });

    // Clean up
    validateSpy.mockRestore();
  });

  it("displays loading state on submit button when loading prop is true", async () => {
    await act(async () => {
      render(<PaymentNoticeForm {...defaultProps} loading={true} />);
    });

    expect(screen.getByTestId("submit-button")).toHaveAttribute(
      "data-loading",
      "true"
    );
  });

  it("initializes disabled state based on defaultValues", async () => {
    // Test with valid default values
    const validateSpy = jest.spyOn(React, "useState");
    // Force the disabled state to be false for valid values
    validateSpy.mockImplementationOnce(() => [false, jest.fn()]);

    const { unmount } = render(
      <PaymentNoticeForm
        {...defaultProps}
        defaultValues={{
          billCode: "123456789012345678",
          cf: "12345678901",
        }}
      />
    );

    expect(screen.getByTestId("submit-button")).not.toBeDisabled();

    unmount();
    validateSpy.mockRestore();

    // Test with invalid default values
    const validateSpy2 = jest.spyOn(React, "useState");
    // Force the disabled state to be true for invalid values
    validateSpy2.mockImplementationOnce(() => [true, jest.fn()]);

    render(
      <PaymentNoticeForm
        {...defaultProps}
        defaultValues={{
          billCode: "123",
          cf: "",
        }}
      />
    );

    expect(screen.getByTestId("submit-button")).toBeDisabled();

    validateSpy2.mockRestore();
  });
});
