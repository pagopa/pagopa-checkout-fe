import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import * as router from "react-router";
import { NavigateFunction } from "react-router";
import mixpanel from "mixpanel-browser";
import { PaymentNoticeChoice } from "../PaymentNoticeChoice";
import { CheckoutRoutes } from "../../../../../routes/models/routeModel";

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("mixpanel-browser", () => ({
  track: jest.fn(),
}));

jest.mock("../../../../../utils/mixpanel/mixpanelEvents", () => ({
  __esModule: true,
  MixpanelEventsId: {
    CHK_PAYMENT_NOTICE_DATA_ENTRY: { value: "CHK_PAYMENT_NOTICE_DATA_ENTRY" },
    CHK_PAYMENT_NOTICE_DATA_ENTRY_MANUAL: {
      value: "CHK_PAYMENT_NOTICE_DATA_ENTRY_MANUAL",
    },
    CHK_PAYMENT_NOTICE_QRCODE_SCAN: {
      value: "CHK_PAYMENT_NOTICE_QRCODE_SCAN",
    },
  },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "paymentNoticeChoice.qr.title": "Scan QR Code",
        "paymentNoticeChoice.qr.description":
          "Scan the QR code on your payment notice",
        "paymentNoticeChoice.form.title": "Enter Details Manually",
        "paymentNoticeChoice.form.description":
          "Enter the payment notice details manually",
      };
      return translations[key] || key;
    },
  }),
}));

describe("PaymentNoticeChoice Component", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(router, "useNavigate")
      .mockImplementation(() => mockNavigate as NavigateFunction);
  });

  it("renders both payment options correctly", () => {
    render(<PaymentNoticeChoice />);

    // Check QR option
    expect(screen.getByText("Scan QR Code")).toBeInTheDocument();
    expect(
      screen.getByText("Scan the QR code on your payment notice")
    ).toBeInTheDocument();

    // Check manual entry option
    expect(screen.getByText("Enter Details Manually")).toBeInTheDocument();
    expect(
      screen.getByText("Enter the payment notice details manually")
    ).toBeInTheDocument();
  });

  it("navigates to QR code page when QR option is clicked", () => {
    render(<PaymentNoticeChoice />);

    const qrOption = screen.getByText("Scan QR Code").closest('[role="link"]');
    if (qrOption) {
      fireEvent.click(qrOption);
    }

    expect(mockNavigate).toHaveBeenCalledWith(
      `/${CheckoutRoutes.LEGGI_CODICE_QR}`
    );
  });

  it("navigates to form page when manual entry option is clicked", () => {
    render(<PaymentNoticeChoice />);

    const formOption = screen
      .getByText("Enter Details Manually")
      .closest('[role="link"]');
    if (formOption) {
      fireEvent.click(formOption);
    }

    expect(mockNavigate).toHaveBeenCalledWith(
      `/${CheckoutRoutes.INSERISCI_DATI_AVVISO}`
    );
  });

  it("navigates to QR code page when pressing Enter on QR option", () => {
    render(<PaymentNoticeChoice />);

    const qrOption = screen.getByText("Scan QR Code").closest('[role="link"]');
    if (qrOption) {
      fireEvent.keyDown(qrOption, { key: "Enter" });
    }

    expect(mockNavigate).toHaveBeenCalledWith(
      `/${CheckoutRoutes.LEGGI_CODICE_QR}`
    );
  });

  it("navigates to form page when pressing Enter on manual entry option", () => {
    render(<PaymentNoticeChoice />);

    const formOption = screen
      .getByText("Enter Details Manually")
      .closest('[role="link"]');
    if (formOption) {
      fireEvent.keyDown(formOption, { key: "Enter" });
    }

    expect(mockNavigate).toHaveBeenCalledWith(
      `/${CheckoutRoutes.INSERISCI_DATI_AVVISO}`
    );
  });

  it("does not navigate when pressing a key other than Enter", () => {
    render(<PaymentNoticeChoice />);

    const qrOption = screen.getByText("Scan QR Code").closest('[role="link"]');
    if (qrOption) {
      fireEvent.keyDown(qrOption, { key: "Space" });
    }

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("has correct accessibility attributes", () => {
    render(<PaymentNoticeChoice />);

    const options = screen.getAllByRole("link");
    expect(options).toHaveLength(2);

    for (const option of options) {
      expect(option).toHaveAttribute("tabIndex", "0");
    }
  });

  it("tracks the mixpanel event on mount", () => {
    render(<PaymentNoticeChoice />);
    expect(mixpanel.track).toHaveBeenCalledWith(
      "CHK_PAYMENT_NOTICE_DATA_ENTRY",
      {
        EVENT_ID: "CHK_PAYMENT_NOTICE_DATA_ENTRY",
      }
    );
  });

  it("tracks QR code scan event and sets sessionStorage when QR option is clicked", () => {
    render(<PaymentNoticeChoice />);

    const qrOption = screen.getByText("Scan QR Code").closest('[role="link"]');
    if (qrOption) {
      fireEvent.click(qrOption);
    }

    expect(mixpanel.track).toHaveBeenCalledWith(
      "CHK_PAYMENT_NOTICE_QRCODE_SCAN",
      {
        EVENT_ID: "CHK_PAYMENT_NOTICE_QRCODE_SCAN",
        data_entry: "qr_code",
      }
    );

    expect(sessionStorage.getItem("notice_code_data_entry")).toBe("qr_code");
  });

  it("tracks manual data entry event and sets sessionStorage when manual option is clicked", () => {
    render(<PaymentNoticeChoice />);

    const formOption = screen
      .getByText("Enter Details Manually")
      .closest('[role="link"]');
    if (formOption) {
      fireEvent.click(formOption);
    }

    expect(mixpanel.track).toHaveBeenCalledWith(
      "CHK_PAYMENT_NOTICE_DATA_ENTRY_MANUAL",
      {
        EVENT_ID: "CHK_PAYMENT_NOTICE_DATA_ENTRY_MANUAL",
        data_entry: "manual",
      }
    );

    expect(sessionStorage.getItem("notice_code_data_entry")).toBe("manual");
  });
});
