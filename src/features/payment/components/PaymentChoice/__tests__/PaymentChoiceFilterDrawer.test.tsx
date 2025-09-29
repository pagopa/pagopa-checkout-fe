/* eslint-disable sonarjs/no-identical-functions */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { PaymentChoiceFilterDrawer } from "../PaymentChoiceFilterDrawer";
import { PaymentMethodFilterType } from "../../../../../utils/PaymentMethodFilterUtil";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "paymentChoicePage.drawer.title": "Titolo",
        "paymentChoicePage.drawer.byType": "Per tipo",
        "paymentChoicePage.drawer.card": "Carta",
        "paymentChoicePage.drawer.balance": "Conto",
        "paymentChoicePage.drawer.appApm": "App",
        "paymentChoicePage.drawer.byFunc": "Funzionalità",
        "paymentChoicePage.drawer.payByPlan": "A rate",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock components with more detailed implementation to capture rendered content
jest.mock("../../../../../components/modals/CustomDrawer", () => ({
  CustomDrawer: ({ children, open, onClose }: any) => (
    <div data-testid="custom-drawer" data-open={open} onClick={onClose}>
      {children}
    </div>
  ),
}));

describe("PaymentChoiceFilterDrawer Component", () => {
  // Test to specifically check the Typography and Box components
  it("renders header and typography elements correctly", () => {
    render(
      <PaymentChoiceFilterDrawer
        open={true}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        paymentMethodFilterModel={{
          paymentType: undefined,
          buyNowPayLater: false,
        }}
      />
    );

    // Check for the title Typography
    expect(screen.getByText("Titolo")).toBeInTheDocument();

    // Check for the body Typography
    expect(screen.getByText("PER TIPO")).toBeInTheDocument();

    // Check for the header labels within the Box
    expect(screen.getByText("Conto")).toBeInTheDocument();
    expect(screen.getByText("Carta")).toBeInTheDocument();
    expect(screen.getByText("App")).toBeInTheDocument();
    expect(screen.getByText("Funzionalità".toUpperCase())).toBeInTheDocument();
    expect(screen.getByText("A rate")).toBeInTheDocument();
  });

  it("calls onSelect when type card is clicked", () => {
    const mockOnSelect = jest.fn();

    const { container } = render(
      <PaymentChoiceFilterDrawer
        open={true}
        onClose={jest.fn()}
        onSelect={mockOnSelect}
        paymentMethodFilterModel={{
          paymentType: undefined,
          buyNowPayLater: false,
        }}
      />
    );

    const typeCard = container.querySelector("#paymentChoiceDrawer-card");
    fireEvent.click(typeCard!);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it("calls onSelect when type conto is clicked", () => {
    const mockOnSelect = jest.fn();

    const { container } = render(
      <PaymentChoiceFilterDrawer
        open={true}
        onClose={jest.fn()}
        onSelect={mockOnSelect}
        paymentMethodFilterModel={{
          paymentType: undefined,
          buyNowPayLater: false,
        }}
      />
    );

    const typeBalance = container.querySelector("#paymentChoiceDrawer-balance");
    fireEvent.click(typeBalance!);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it("calls onSelect when type app is clicked", () => {
    const mockOnSelect = jest.fn();

    const { container } = render(
      <PaymentChoiceFilterDrawer
        open={true}
        onClose={jest.fn()}
        onSelect={mockOnSelect}
        paymentMethodFilterModel={{
          paymentType: undefined,
          buyNowPayLater: false,
        }}
      />
    );

    const typeAppApm = container.querySelector("#paymentChoiceDrawer-appApm");
    fireEvent.click(typeAppApm!);

    expect(mockOnSelect).toHaveBeenCalled();
  });

  it("calls onClose when drawer is closed", () => {
    const mockOnClose = jest.fn();

    render(
      <PaymentChoiceFilterDrawer
        open={true}
        onClose={mockOnClose}
        onSelect={jest.fn()}
        paymentMethodFilterModel={{
          paymentType: undefined,
          buyNowPayLater: false,
        }}
      />
    );

    const drawer = screen.getByTestId("custom-drawer");
    fireEvent.click(drawer);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when show result is clicked", () => {
    const mockOnClose = jest.fn();
    const mockOnSelect = jest.fn();

    const { container } = render(
      <PaymentChoiceFilterDrawer
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        paymentMethodFilterModel={{
          paymentType: undefined,
          buyNowPayLater: false,
        }}
      />
    );

    const applyAllResult = container.querySelector(
      "#paymentChoiceDrawer-applyFilter"
    );
    fireEvent.click(applyAllResult!);

    expect(mockOnSelect).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("check cancel button is disabled when model is default", () => {
    const mockOnClose = jest.fn();
    const mockOnSelect = jest.fn();
    const paymentMethodFilter = {
      paymentType: undefined,
      buyNowPayLater: false,
    };

    const { container } = render(
      <PaymentChoiceFilterDrawer
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        paymentMethodFilterModel={paymentMethodFilter}
      />
    );

    const cancelAllResult = container.querySelector(
      "#paymentChoiceDrawer-cancelFilter"
    );
    expect(cancelAllResult).toBeDisabled();
  });

  it("check cancel button is disabled when model is default", () => {
    const mockOnClose = jest.fn();
    const mockOnSelect = jest.fn();
    const paymentMethodFilter = {
      paymentType: undefined,
      buyNowPayLater: false,
    };

    const { container } = render(
      <PaymentChoiceFilterDrawer
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        paymentMethodFilterModel={paymentMethodFilter}
      />
    );

    const cancelAllResult = container.querySelector(
      "#paymentChoiceDrawer-cancelFilter"
    );
    expect(cancelAllResult).toBeDisabled();
  });

  it("check cancel button is enabled when model is not default for buyNowPayLaterFlag", () => {
    const mockOnClose = jest.fn();
    const mockOnSelect = jest.fn();
    const paymentMethodFilter = {
      paymentType: undefined,
      buyNowPayLater: true,
    };

    const { container } = render(
      <PaymentChoiceFilterDrawer
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        paymentMethodFilterModel={paymentMethodFilter}
      />
    );

    const cancelAllResult = container.querySelector(
      "#paymentChoiceDrawer-cancelFilter"
    );
    expect(cancelAllResult).toBeEnabled();

    fireEvent.click(cancelAllResult!);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("check cancel button is enabled when model is not default for paymentType", () => {
    const mockOnClose = jest.fn();
    const mockOnSelect = jest.fn();
    const paymentMethodFilter = {
      paymentType: PaymentMethodFilterType.CARD,
      buyNowPayLater: true,
    };

    const { container } = render(
      <PaymentChoiceFilterDrawer
        open={true}
        onClose={mockOnClose}
        onSelect={mockOnSelect}
        paymentMethodFilterModel={paymentMethodFilter}
      />
    );

    const cancelAllResult = container.querySelector(
      "#paymentChoiceDrawer-cancelFilter"
    );
    expect(cancelAllResult).toBeEnabled();

    fireEvent.click(cancelAllResult!);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
