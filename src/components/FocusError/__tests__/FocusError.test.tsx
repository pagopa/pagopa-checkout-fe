import "@testing-library/jest-dom";
import { render, waitFor, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Formik, Field } from "formik";
import React from "react";
import FocusError from "../FocusError";

describe("FocusError", () => {
  const renderForm = ({ handleSubmit }: any) => (
    <form onSubmit={handleSubmit}>
      <FocusError />
      <Field name="field1" data-testid="field1" />
      <Field name="field2" data-testid="field2" />
      <button type="submit">Submit</button>
    </form>
  );

  it("should focus the first field with an error on submit", async () => {
    const validate = () => ({ field1: "Error on field 1" });

    render(
      <Formik
        initialValues={{ field1: "", field2: "" }}
        validate={validate}
        onSubmit={jest.fn()}
      >
        {renderForm}
      </Formik>
    );

    const field1 = screen.getByTestId("field1");
    const submitButton = screen.getByText("Submit");

    expect(document.activeElement).not.toBe(field1);

    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(document.activeElement).toBe(field1);
    });
  });

  it("should not change focus if there are no errors on submit", async () => {
    const validate = () => ({});

    render(
      <Formik
        initialValues={{ field1: "", field2: "" }}
        validate={validate}
        onSubmit={jest.fn()}
      >
        {renderForm}
      </Formik>
    );

    const field1 = screen.getByTestId("field1");
    const submitButton = screen.getByText("Submit");

    expect(document.activeElement).not.toBe(field1);

    await userEvent.click(submitButton);

    // Wait a short time to ensure no focus change happens
    await new Promise((r) => setTimeout(r, 100));

    expect(document.activeElement).not.toBe(field1);
  });
});
