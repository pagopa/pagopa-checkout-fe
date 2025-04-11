import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { PaymentPspListSortingDrawer } from "../PaymentPspListSortingDrawer";
import { PspOrderingModel } from "../../../../../utils/SortUtil";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "paymentPspListPage.sort": "Sort",
        "paymentPspListPage.drawer.sorting.default": "Default Order",
        "paymentPspListPage.drawer.sorting.name": "Order by Name",
        "paymentPspListPage.drawer.sorting.amount": "Order by Amount",
        "paymentPspListPage.drawer.showResults": "Apply",
        "ariaLabels.close": "Close",
      };
      return translations[key] || key;
    },
  }),
}));

jest.mock("../../../../../hooks/useSmallDevice", () => ({
  useSmallDevice: () => false,
}));

jest.mock("../../../../../components/modals/CustomDrawer", () => ({
  CustomDrawer: ({ open, onClose, children }: any) => (
    <div
      data-testid="custom-drawer"
      data-open={open}
      data-onclose={onClose ? "true" : "false"}
    >
      <button data-testid="mock-close-button" onClick={onClose}>
        Close
      </button>
      {children}
    </div>
  ),
}));

const theme = createTheme();

describe("PaymentPspListSortingDrawer", () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Clean up after each test
  afterEach(() => {
    cleanup();
  });

  it("renders correctly with default props", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer {...defaultProps} />
      </ThemeProvider>
    );

    // Check title and options are rendered
    expect(screen.getByText("Sort")).toBeInTheDocument();
    expect(screen.getByText("Default Order")).toBeInTheDocument();
    expect(screen.getByText("Order by Name")).toBeInTheDocument();
    expect(screen.getByText("Order by Amount")).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();

    // Default option should be selected
    const defaultRadio = screen.getByLabelText("Default Order");
    expect(defaultRadio).toBeChecked();
  });

  it("initializes with correct sorting type based on provided model - Name", () => {
    const nameSortingModel: PspOrderingModel = {
      fieldName: "pspBusinessName",
      direction: "asc",
    };

    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer
          {...defaultProps}
          pspSortingModel={nameSortingModel}
        />
      </ThemeProvider>
    );

    // Name option should be selected
    const nameRadio = screen.getByLabelText("Order by Name");
    expect(nameRadio).toBeChecked();
  });

  it("initializes with correct sorting type based on provided model - Amount", () => {
    const amountSortingModel: PspOrderingModel = {
      fieldName: "taxPayerFee",
      direction: "asc",
    };

    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer
          {...defaultProps}
          pspSortingModel={amountSortingModel}
        />
      </ThemeProvider>
    );

    // Amount option should be selected
    const amountRadio = screen.getByLabelText("Order by Amount");
    expect(amountRadio).toBeChecked();
  });

  it("changes sorting type when radio option is selected", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer {...defaultProps} />
      </ThemeProvider>
    );

    // Initially default is selected
    const defaultRadio = screen.getByLabelText("Default Order");
    expect(defaultRadio).toBeChecked();

    // Select name option
    const nameRadio = screen.getByLabelText("Order by Name");
    fireEvent.click(nameRadio);
    expect(nameRadio).toBeChecked();
    expect(defaultRadio).not.toBeChecked();

    // Select amount option
    const amountRadio = screen.getByLabelText("Order by Amount");
    fireEvent.click(amountRadio);
    expect(amountRadio).toBeChecked();
    expect(nameRadio).not.toBeChecked();
  });

  it("calls onSelect with correct model when Apply button is clicked - Default", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer {...defaultProps} />
      </ThemeProvider>
    );

    // Default is already selected
    const applyButton = screen.getByText("Apply");
    fireEvent.click(applyButton);

    // Should call onSelect with null for default
    expect(defaultProps.onSelect).toHaveBeenCalledWith(null);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onSelect with correct model when Apply button is clicked - Name", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer {...defaultProps} />
      </ThemeProvider>
    );

    // Select name option
    const nameRadio = screen.getByLabelText("Order by Name");
    fireEvent.click(nameRadio);

    // Click apply
    const applyButton = screen.getByText("Apply");
    fireEvent.click(applyButton);

    // Should call onSelect with name sorting model
    expect(defaultProps.onSelect).toHaveBeenCalledWith({
      fieldName: "pspBusinessName",
      direction: "asc",
    });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onSelect with correct model when Apply button is clicked - Amount", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer {...defaultProps} />
      </ThemeProvider>
    );

    // Select amount option
    const amountRadio = screen.getByLabelText("Order by Amount");
    fireEvent.click(amountRadio);

    // Click apply
    const applyButton = screen.getByText("Apply");
    fireEvent.click(applyButton);

    // Should call onSelect with amount sorting model
    expect(defaultProps.onSelect).toHaveBeenCalledWith({
      fieldName: "taxPayerFee",
      direction: "asc",
    });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer {...defaultProps} />
      </ThemeProvider>
    );

    const closeButton = screen.getByTestId("mock-close-button");
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("submits form when Enter key is pressed", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer {...defaultProps} />
      </ThemeProvider>
    );

    // Select name option
    const nameRadio = screen.getByLabelText("Order by Name");
    fireEvent.click(nameRadio);

    // Press Enter on the form
    const formControl = screen.getByRole("radiogroup").closest("fieldset");
    fireEvent.keyDown(formControl!, { key: "Enter" });

    // Should call onSelect with name sorting model
    expect(defaultProps.onSelect).toHaveBeenCalledWith({
      fieldName: "pspBusinessName",
      direction: "asc",
    });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("passes open prop to CustomDrawer", () => {
    // Test with open=false
    const { unmount } = render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer {...defaultProps} open={false} />
      </ThemeProvider>
    );

    const drawer = screen.getByTestId("custom-drawer");
    expect(drawer.getAttribute("data-open")).toBe("false");

    // Unmount the component
    unmount();

    // Test with open=true
    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer {...defaultProps} open={true} />
      </ThemeProvider>
    );

    const openDrawer = screen.getByTestId("custom-drawer");
    expect(openDrawer.getAttribute("data-open")).toBe("true");
  });

  it("passes onClose to CustomDrawer", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPspListSortingDrawer {...defaultProps} />
      </ThemeProvider>
    );

    const drawer = screen.getByTestId("custom-drawer");
    expect(drawer.getAttribute("data-onclose")).toBe("true");
  });
});
