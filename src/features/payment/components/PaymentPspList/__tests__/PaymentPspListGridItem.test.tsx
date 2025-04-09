import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { PaymentPSPListGridItem } from "../PaymentPspListGridItem";

jest.mock("@mui/material", () => {
  const originalModule = jest.requireActual("@mui/material");
  return {
    ...originalModule,
    useTheme: jest.fn(() => ({
      palette: {
        primary: {
          main: "#007bff",
          dark: "#0056b3",
        },
        divider: "#cccccc",
        action: {
          active: "#888888",
        },
      },
    })),
  };
});

jest.mock("@mui/icons-material/RadioButtonChecked", () => ({
  __esModule: true,
  default: function MockRadioButtonChecked(props: any) {
    return (
      <div
        data-testid="psp-radio-button-checked"
        id="psp-radio-button-checked"
        {...props}
      />
    );
  },
}));

jest.mock("@mui/icons-material/RadioButtonUnchecked", () => ({
  __esModule: true,
  default: function MockRadioButtonUnchecked(props: any) {
    return (
      <div
        data-testid="psp-radio-button-unchecked"
        id="psp-radio-button-unchecked"
        {...props}
      />
    );
  },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock("../../../../../utils/form/formatters", () => ({
  moneyFormat: (value: number) => `€ ${value.toFixed(2)}`,
}));

// Mock static assets
jest.mock(
  "../../../../../assets/images/psp-user-on-us.svg",
  () => "pspUserOnUsIcon"
);

// Sample PSP item data
const mockPspItem = {
  idPsp: "psp123",
  pspBusinessName: "Test PSP",
  onUs: true,
  taxPayerFee: 2.5,
};

const theme = createTheme();

describe("PaymentPSPListGridItem", () => {
  it("renders PSP item details correctly", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          isSelected={false}
          pspItem={mockPspItem}
          handleClick={jest.fn()}
        />
      </ThemeProvider>
    );

    expect(screen.getByText("Test PSP")).toBeInTheDocument();
    expect(
      screen.getByText("paymentPspListPage.alreadyClient")
    ).toBeInTheDocument();
    expect(screen.getByText("€ 2.50")).toBeInTheDocument(); // Formatted fee
    expect(screen.getByAltText("Icona psp on us")).toBeInTheDocument();
  });

  it("displays checked radio button when isSelected is true", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          pspItem={mockPspItem}
          handleClick={jest.fn()}
          isSelected={true}
        />
      </ThemeProvider>
    );

    expect(screen.getByTestId("psp-radio-button-checked")).toBeInTheDocument();
    expect(
      screen.queryByTestId("psp-radio-button-unchecked")
    ).not.toBeInTheDocument();
  });

  it("displays unchecked radio button when isSelected is false", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          pspItem={mockPspItem}
          handleClick={jest.fn()}
          isSelected={false}
        />
      </ThemeProvider>
    );

    expect(
      screen.getByTestId("psp-radio-button-unchecked")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("psp-radio-button-checked")
    ).not.toBeInTheDocument();
  });

  it("calls handleClick when the grid item is clicked", () => {
    const handleClickMock = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          isSelected={false}
          pspItem={mockPspItem}
          handleClick={handleClickMock}
        />
      </ThemeProvider>
    );

    // Find the grid container by ID
    const gridItem = screen.getByText("Test PSP").closest("div[id]");
    if (gridItem) {
      fireEvent.click(gridItem);
      expect(handleClickMock).toHaveBeenCalledTimes(1);
    }
  });

  it("calls handleClick when Enter key is pressed", () => {
    const handleClickMock = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          isSelected={false}
          pspItem={mockPspItem}
          handleClick={handleClickMock}
        />
      </ThemeProvider>
    );

    const gridItem = screen.getByText("Test PSP").closest("div[id]");
    if (gridItem) {
      fireEvent.keyDown(gridItem, { key: "Enter" });
      expect(handleClickMock).toHaveBeenCalledTimes(1);
    }
  });

  it("formats the taxPayerFee correctly", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          isSelected={false}
          pspItem={mockPspItem}
          handleClick={jest.fn()}
        />
      </ThemeProvider>
    );

    expect(screen.getByText("€ 2.50")).toBeInTheDocument();
  });

  it("renders onUs icon when pspItem.onUs is true", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          isSelected={false}
          pspItem={mockPspItem}
          handleClick={jest.fn()}
        />
      </ThemeProvider>
    );

    expect(screen.getByAltText("Icona psp on us")).toBeInTheDocument();
  });

  it("does not render onUs icon when pspItem.onUs is false", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          isSelected={false}
          pspItem={{ ...mockPspItem, onUs: false }}
          handleClick={jest.fn()}
        />
      </ThemeProvider>
    );

    expect(screen.queryByAltText("Icona psp on us")).toBeNull();
  });
});
