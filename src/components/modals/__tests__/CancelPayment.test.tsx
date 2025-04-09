import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CancelPayment } from "../CancelPayment";

// Just mock InformationModal since it's your own component
jest.mock("../InformationModal", () =>
  jest.fn(({ children, open }) =>
    open ? <div data-testid="modal">{children}</div> : null
  )
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Simple mock translation function
      const translations: Record<string, string> = {
        "paymentCheckPage.modal.cancelTitle": "Cancel Payment",
        "paymentCheckPage.modal.cancelBody":
          "Are you sure you want to cancel this payment?",
        "paymentCheckPage.modal.cancelButton": "No, Go Back",
        "paymentCheckPage.modal.submitButton": "Yes, Cancel Payment",
      };
      return translations[key] || key;
    },
  }),
}));

describe("CancelPayment", () => {
  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      <CancelPayment open={true} onCancel={onCancel} onSubmit={() => {}} />
    );

    fireEvent.click(screen.getByText("No, Go Back"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onSubmit when confirm button is clicked", () => {
    const onSubmit = jest.fn();
    render(
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      <CancelPayment open={true} onCancel={() => {}} onSubmit={onSubmit} />
    );

    fireEvent.click(screen.getByText("Yes, Cancel Payment"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
