import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ThemeProvider, createTheme } from "@mui/material";
import { MethodComponentList, DisabledPaymentMethods } from "../PaymentMethod"; // Remove MethodComponent from import
import { PaymentMethodStatusEnum } from "../../../../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import { PaymentMethodManagementTypeEnum } from "../../../../../../generated/definitions/payment-ecommerce/PaymentMethodManagementType";
import { PaymentCodeTypeEnum } from "../../../models/paymentModel";

// Mock dependencies
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock(
  "../../../../../components/TextFormField/ClickableFieldContainer",
  () =>
    function MockClickableFieldContainer(props: any) {
      return (
        <div
          data-testid={props.dataTestId || "clickable-field"}
          data-testlabel={props.dataTestLabel}
          onClick={props.onClick}
          className={`clickable-field ${props.disabled ? "disabled" : ""} ${
            props.clickable ? "clickable" : ""
          }`}
        >
          <div className="title">{props.title}</div>
          <div className="icon">{props.icon}</div>
          <div className="end-adornment">{props.endAdornment}</div>
        </div>
      );
    }
);

jest.mock("../PaymentMethodImage", () => ({
  ImageComponent: () => (
    <div data-testid="payment-method-image">Image Mock</div>
  ),
}));

// Mock MUI components
jest.mock(
  "@mui/material/Accordion",
  () =>
    function MockAccordion(props: any) {
      return (
        <div className="accordion" data-testid="accordion">
          {props.children}
        </div>
      );
    }
);

jest.mock(
  "@mui/material/AccordionSummary",
  () =>
    function MockAccordionSummary(props: any) {
      return (
        <div
          className="accordion-summary"
          data-testid="accordion-summary"
          onClick={() =>
            props["aria-controls"] &&
            document.getElementById(props["aria-controls"])
          }
        >
          {props.children}
          {props.expandIcon}
        </div>
      );
    }
);

// Sample test data
const mockMethods = [
  {
    id: "card-id",
    name: "CARDS",
    description: "Carte di Credito e Debito",
    status: PaymentMethodStatusEnum.ENABLED,
    methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE,
    paymentTypeCode: PaymentCodeTypeEnum.CP,
    ranges: [],
  },
  {
    id: "paypal-id",
    name: "PAYPAL",
    description: "PayPal",
    status: PaymentMethodStatusEnum.ENABLED,
    methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE,
    paymentTypeCode: "PAYPAL" as PaymentCodeTypeEnum,
    ranges: [],
  },
  {
    id: "disabled-id",
    name: "DISABLED",
    description: "Disabled Method",
    status: PaymentMethodStatusEnum.DISABLED,
    methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE,
    paymentTypeCode: "DISABLED" as PaymentCodeTypeEnum,
    ranges: [],
  },
];

const theme = createTheme();

describe("MethodComponentList", () => {
  test("renders all payment methods", () => {
    render(<MethodComponentList methods={mockMethods} />);

    expect(screen.getByText("Carte di Credito e Debito")).toBeInTheDocument();
    expect(screen.getByText("PayPal")).toBeInTheDocument();
    expect(screen.getByText("Disabled Method")).toBeInTheDocument();
  });

  test("calls onClick with the correct method when clicked", () => {
    const onClickMock = jest.fn();
    render(<MethodComponentList methods={mockMethods} onClick={onClickMock} />);

    const creditCardMethod = screen.getByText("Carte di Credito e Debito");
    fireEvent.click(creditCardMethod.parentElement!);

    expect(onClickMock).toHaveBeenCalledWith(mockMethods[0]);
  });

  test("adds test attributes when testable is true", () => {
    render(<MethodComponentList methods={mockMethods} testable={true} />);

    // Check for clickable fields with the correct test IDs
    expect(screen.getByTestId("CP")).toBeInTheDocument();
    expect(screen.getByTestId("PAYPAL")).toBeInTheDocument();
    expect(screen.getByTestId("DISABLED")).toBeInTheDocument();
  });

  test("renders enabled methods as clickable", () => {
    render(<MethodComponentList methods={mockMethods} />);

    // The parent elements of the enabled methods should have the clickable class
    const creditCardElement = screen.getByText(
      "Carte di Credito e Debito"
    ).parentElement;
    const paypalElement = screen.getByText("PayPal").parentElement;

    expect(creditCardElement).toHaveClass("clickable");
    expect(paypalElement).toHaveClass("clickable");
  });

  test("renders disabled methods as non-clickable", () => {
    render(<MethodComponentList methods={mockMethods} />);

    // The parent element of the disabled method should have the disabled class
    const disabledElement = screen.getByText("Disabled Method").parentElement;

    expect(disabledElement).toHaveClass("disabled");
    expect(disabledElement).not.toHaveClass("clickable");
  });
});

describe("DisabledPaymentMethods", () => {
  const disabledMethods = mockMethods.filter(
    (method) => method.status === PaymentMethodStatusEnum.DISABLED
  );

  test("renders accordion when disabled methods are provided", () => {
    render(
      <ThemeProvider theme={theme}>
        <DisabledPaymentMethods methods={disabledMethods} />
      </ThemeProvider>
    );

    expect(screen.getByTestId("accordion")).toBeInTheDocument();
    expect(screen.getByText("paymentChoicePage.showMore")).toBeInTheDocument();
  });

  test("renders nothing when methods array is empty", () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <DisabledPaymentMethods methods={[]} />
      </ThemeProvider>
    );

    expect(container.firstChild).toBeNull();
  });

  test("displays all disabled methods", () => {
    render(
      <ThemeProvider theme={theme}>
        <DisabledPaymentMethods methods={disabledMethods} />
      </ThemeProvider>
    );

    expect(screen.getByText("Disabled Method")).toBeInTheDocument();
  });
});
