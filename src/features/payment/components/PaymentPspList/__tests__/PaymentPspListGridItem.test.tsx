import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { PaymentPSPListGridItem } from "../PaymentPspListGridItem";

jest.mock("@mui/material", () => {
  const originalModule = jest.requireActual("@mui/material");
  return {
    ...originalModule,
    useTheme: jest.fn(() => ({
      palette: {
        primary: { main: "#007bff", dark: "#0056b3" },
        divider: "#cccccc",
        action: { active: "#888888" },
      },
    })),
  };
});

jest.mock("@mui/icons-material/RadioButtonChecked", () => ({
  __esModule: true,
  default: function MockRadioButtonChecked(props: any) {
    return <div data-testid="psp-radio-button-checked" {...props} />;
  },
}));

jest.mock("@mui/icons-material/RadioButtonUnchecked", () => ({
  __esModule: true,
  default: function MockRadioButtonUnchecked(props: any) {
    return <div data-testid="psp-radio-button-unchecked" {...props} />;
  },
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../../../utils/form/formatters", () => ({
  moneyFormat: (value: number) => `€ ${value.toFixed(2)}`,
}));

jest.mock(
  "../../../../../assets/images/psp-user-on-us.svg",
  () => "pspUserOnUsIcon"
);

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
          radioValue={String(mockPspItem.idPsp)}
        />
      </ThemeProvider>
    );

    expect(screen.getByText("Test PSP")).toBeInTheDocument();
    expect(
      screen.getByText("paymentPspListPage.alreadyClient")
    ).toBeInTheDocument();
    expect(screen.getByText("€ 2.50")).toBeInTheDocument();
    expect(screen.getByTestId("psp-on-us-icon")).toBeInTheDocument();
  });

  it("displays checked radio button when isSelected is true", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          pspItem={mockPspItem}
          isSelected={true}
          radioValue={String(mockPspItem.idPsp)}
        />
      </ThemeProvider>
    );

    expect(screen.getByTestId("psp-radio-button-checked")).toBeInTheDocument();
  });

  it("displays unchecked radio button when isSelected is false", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          pspItem={mockPspItem}
          isSelected={false}
          radioValue={String(mockPspItem.idPsp)}
        />
      </ThemeProvider>
    );

    expect(
      screen.getByTestId("psp-radio-button-unchecked")
    ).toBeInTheDocument();
  });

  it("does not render onUs icon when pspItem.onUs is false", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          isSelected={false}
          pspItem={{ ...mockPspItem, onUs: false }}
          radioValue={String(mockPspItem.idPsp)}
        />
      </ThemeProvider>
    );

    expect(screen.queryByTestId("psp-on-us-icon")).toBeNull();
  });

  it("sets a stable input id based on radioValue", () => {
    render(
      <ThemeProvider theme={theme}>
        <PaymentPSPListGridItem
          isSelected={false}
          pspItem={mockPspItem}
          radioValue={String(mockPspItem.idPsp)}
        />
      </ThemeProvider>
    );

    expect(screen.getByLabelText("Test PSP")).toHaveAttribute(
      "id",
      `psp-radio-${String(mockPspItem.idPsp)}`
    );
  });
});
