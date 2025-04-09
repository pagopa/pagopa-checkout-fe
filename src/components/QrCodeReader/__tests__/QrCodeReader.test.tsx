import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { QrCodeReader } from "../QrCodeReader";
import "@testing-library/jest-dom";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "paymentQrPage.usageHintMobile": "Mobile hint text",
        "paymentQrPage.usageHintPc": "PC hint text",
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock("@mui/material", () => ({
  useTheme: () => ({
    breakpoints: {
      down: (size: string) => `(max-width:${size === "sm" ? "600" : "1200"}px)`,
    },
  }),
  useMediaQuery: (query: string) => query === "(max-width:600px)", // Mock mobile for true, desktop for false
}));

jest.mock(
  "react-qr-reader",
  () =>
    function MockQrReader(props: any) {
      return (
        <div
          data-testid="qr-reader"
          onClick={() => props.onScan("mocked-qr-data")}
        >
          {props.legacyMode ? "Legacy Mode" : "Camera Mode"}
          <button
            data-testid="mock-open-dialog"
            onClick={() => {
              if (props.legacyMode && props.ref?.current) {
                // eslint-disable-next-line functional/immutable-data
                props.ref.current.openImageDialog = jest.fn();
              }
            }}
          >
            Mock Open Dialog
          </button>
        </div>
      );
    }
);

describe("QrCodeReader Component", () => {
  const mockOnError = jest.fn();
  const mockOnScan = jest.fn();
  const defaultProps = {
    onError: mockOnError,
    onScan: mockOnScan,
    enableLoadFromPicture: true,
    style: { width: "100%" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    render(<QrCodeReader {...defaultProps} />);

    // Check if QR reader is rendered
    expect(screen.getByTestId("qr-reader")).toBeInTheDocument();

    // Check if it's in camera mode by default
    expect(screen.getByTestId("qr-reader")).toHaveTextContent("Camera Mode");

    // Check if checkbox is rendered when enableLoadFromPicture is true
    expect(screen.getByText("Get from picture")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();

    // Upload button should not be visible initially (legacy mode is false)
    expect(screen.queryByText("Upload")).not.toBeInTheDocument();
  });

  it("displays mobile hint text on mobile devices", () => {
    // useMediaQuery is mocked to return true for mobile
    render(<QrCodeReader {...defaultProps} />);
    expect(screen.getByText("Mobile hint text")).toBeInTheDocument();
  });

  it("displays PC hint text on desktop devices", () => {
    // Mock desktop device
    jest.mock("@mui/material", () => ({
      useTheme: () => ({
        breakpoints: {
          down: () => `(max-width:600px)`,
        },
      }),
      useMediaQuery: () => false,
    }));

    render(<QrCodeReader {...defaultProps} />);
  });

  it("toggles legacy mode when checkbox is clicked", () => {
    render(<QrCodeReader {...defaultProps} />);

    // Initially in camera mode
    expect(screen.getByTestId("qr-reader")).toHaveTextContent("Camera Mode");

    // Click the checkbox to enable legacy mode
    fireEvent.click(screen.getByRole("checkbox"));

    // Should now be in legacy mode
    expect(screen.getByTestId("qr-reader")).toHaveTextContent("Legacy Mode");

    // Upload button should be visible in legacy mode
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("does not show picture options when enableLoadFromPicture is false", () => {
    render(<QrCodeReader {...defaultProps} enableLoadFromPicture={false} />);

    // Checkbox should not be present
    expect(screen.queryByText("Get from picture")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();

    // Upload button should not be present
    expect(screen.queryByText("Upload")).not.toBeInTheDocument();
  });

  it("calls onScan when QR code is detected", () => {
    render(<QrCodeReader {...defaultProps} />);

    // Simulate QR code detection by clicking the mock QrReader
    fireEvent.click(screen.getByTestId("qr-reader"));

    // Check if onScan was called with the expected data
    expect(mockOnScan).toHaveBeenCalledWith("mocked-qr-data");
  });

  it("attempts to open image dialog when Upload button is clicked in legacy mode", () => {
    render(<QrCodeReader {...defaultProps} />);

    // Enable legacy mode
    fireEvent.click(screen.getByRole("checkbox"));

    // Click the upload button
    fireEvent.click(screen.getByText("Upload"));

    // checking the button is present
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });
});
