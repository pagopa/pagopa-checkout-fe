import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import * as router from "react-router";
import { NavigateFunction } from "react-router";
import { PaymentNoticeChoice } from "../PaymentNoticeChoice";
import { CheckoutRoutes } from "../../../../../routes/models/routeModel";
import { mixpanel } from "../../../../../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelDataEntryType,
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
} from "../../../../../utils/mixpanel/mixpanelEvents";
import {
  SessionItems,
  setSessionItem,
} from "../../../../../utils/storage/sessionStorage";

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../../../../utils/mixpanel/mixpanelHelperInit", () => ({
  mixpanel: { track: jest.fn() },
}));

jest.mock("../../../../../utils/config/config", () =>
  // Return the actual implementation but with our mock for getConfigOrThrow
  ({
    // This is the key fix - handle the case when no key is provided
    getConfigOrThrow: jest.fn((key) => {
      // Create a mapping of all config values
      const configValues = {
        CHECKOUT_API_TIMEOUT: 1000,
        // Add other config values as needed
      } as any;

      // If no key provided, return all config values (this is the important part)
      if (key === undefined) {
        return configValues;
      }

      // Otherwise return the specific config value
      return configValues[key] || "";
    }),
    isTestEnv: jest.fn(() => false),
    isDevEnv: jest.fn(() => false),
    isProdEnv: jest.fn(() => true),
  })
);

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

jest.mock("../../../../../utils/storage/sessionStorage", () => ({
  SessionItems: {
    cart: "cart",
    paymentInfo: "paymentInfo",
    enableAuthentication: "enableAuthentication",
  },
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
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
        EVENT_CATEGORY: MixpanelEventCategory.UX,
        EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
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
      MixpanelEventsId.CHK_PAYMENT_NOTICE_QRCODE_SCAN,
      {
        EVENT_ID: MixpanelEventsId.CHK_PAYMENT_NOTICE_QRCODE_SCAN,
        EVENT_CATEGORY: MixpanelEventCategory.UX,
        EVENT_TYPE: MixpanelEventType.ACTION,
        data_entry: MixpanelDataEntryType.QR_CODE,
      }
    );

    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.noticeCodeDataEntry,
      MixpanelDataEntryType.QR_CODE
    );
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
      MixpanelEventsId.CHK_PAYMENT_NOTICE_DATA_ENTRY_MANUAL,
      {
        EVENT_ID: MixpanelEventsId.CHK_PAYMENT_NOTICE_DATA_ENTRY_MANUAL,
        EVENT_CATEGORY: MixpanelEventCategory.UX,
        EVENT_TYPE: MixpanelEventType.ACTION,
        data_entry: MixpanelDataEntryType.MANUAL,
      }
    );

    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.noticeCodeDataEntry,
      MixpanelDataEntryType.MANUAL
    );
  });
});
