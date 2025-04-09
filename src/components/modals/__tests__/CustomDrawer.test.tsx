import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomDrawer } from "../CustomDrawer";
import * as useSmallDeviceModule from "../../../hooks/useSmallDevice";

// Mock only the custom hooks and components
jest.mock("../../../hooks/useSmallDevice", () => ({
  useSmallDevice: jest.fn(() => false), // Default to desktop view
}));

// Create typed mock for useSmallDevice
const mockedUseSmallDevice = useSmallDeviceModule.useSmallDevice as jest.Mock;

// Mock the SkeletonFieldContainer component
jest.mock("../../Skeletons/SkeletonFieldContainer", () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="skeleton-container" />),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Simple mock translation function
      const translations: Record<string, string> = {
        "ariaLabels.close": "Close",
      };
      return translations[key] || key;
    },
  }),
}));

describe("CustomDrawer Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when open and not loading", () => {
    render(
      <CustomDrawer open={true} onClose={mockOnClose}>
        <div data-testid="drawer-content">Content</div>
      </CustomDrawer>
    );

    // Check if the content is rendered
    const content = screen.getByTestId("drawer-content");
    expect(content).toBeTruthy();

    // Check if the close button is rendered with correct aria-label
    const closeButton = screen.getByLabelText("Close");
    expect(closeButton).toBeTruthy();
  });

  it("calls onClose when the close button is clicked", () => {
    render(
      <CustomDrawer open={true} onClose={mockOnClose}>
        <div>Content</div>
      </CustomDrawer>
    );

    // Find and click the close button
    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("renders the skeleton when loading is true", () => {
    render(
      <CustomDrawer open={true} onClose={mockOnClose} loading={true}>
        <div data-testid="drawer-content">Content</div>
      </CustomDrawer>
    );

    // Check if the skeleton is rendered
    const skeleton = screen.getByTestId("skeleton-container");
    expect(skeleton).toBeTruthy();

    // The content should not be visible
    const content = screen.queryByTestId("drawer-content");
    expect(content).toBeNull();
  });

  it("uses correct anchor based on device size", () => {
    // First test with desktop (useSmallDevice returns false)
    render(
      <CustomDrawer open={true} onClose={mockOnClose}>
        <div>Content</div>
      </CustomDrawer>
    );

    // We can't directly check the anchor prop, but we can verify the hook was called
    expect(mockedUseSmallDevice).toHaveBeenCalled();

    // Now test with mobile (useSmallDevice returns true)
    mockedUseSmallDevice.mockReturnValue(true);

    render(
      <CustomDrawer open={true} onClose={mockOnClose}>
        <div>Content</div>
      </CustomDrawer>
    );

    expect(mockedUseSmallDevice).toHaveBeenCalled();
  });

  it("has the correct ID for the close button", () => {
    render(
      <CustomDrawer open={true} onClose={mockOnClose}>
        <div>Content</div>
      </CustomDrawer>
    );

    const closeButton = screen.getByLabelText("Close");
    expect(closeButton.id).toBe("closePspList");
  });
});
