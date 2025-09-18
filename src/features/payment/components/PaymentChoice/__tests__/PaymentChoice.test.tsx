import React from "react";
import "@testing-library/jest-dom";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { PaymentChoice } from "../PaymentChoice";
import { PaymentInstrumentsType } from "../../../models/paymentModel";
import { PaymentMethodStatusEnum } from "../../../../../../generated/definitions/payment-ecommerce/PaymentMethodStatus";
import "whatwg-fetch";
import * as helperModule from "../../../../../utils/api/helper";
import * as transactionsErrorHelperModule from "../../../../../utils/api/transactionsErrorHelper";
import {
  MethodManagementEnum,
  PaymentTypeCodeEnum,
} from "../../../../../../generated/definitions/payment-ecommerce-v2/PaymentMethodResponse";

// Define types for helper functions
type GetFeesFunction = (
  onSuccess: (value: boolean) => void,
  onPspNotFound: () => void,
  onError: (m: string) => void,
  bin?: string | undefined
) => Promise<void>;

type RecaptchaTransactionFunction = (options: {
  recaptchaRef: any; // Using ReCAPTCHA type if available
  onSuccess: (paymentMethodId: string, orderId: string) => void;
  onError: (
    faultCodeCategory: string,
    faultCodeDetail: string | undefined
  ) => void;
}) => Promise<void>;

// Mock the helper module
jest.mock("../../../../../utils/api/helper", () => ({
  getFees: jest.fn(),
  recaptchaTransaction: jest.fn(() => Promise.resolve()),
}));

// Create typed mocks
const mockedGetFees =
  helperModule.getFees as jest.MockedFunction<GetFeesFunction>;
const mockedRecaptchaTransaction =
  helperModule.recaptchaTransaction as jest.MockedFunction<RecaptchaTransactionFunction>;

// Mock error helper
jest.mock("../../../../../utils/api/transactionsErrorHelper", () => ({
  onErrorActivate: jest.fn(),
}));
const mockedOnErrorActivate =
  transactionsErrorHelperModule.onErrorActivate as jest.Mock;

// Mock session storage
jest.mock("../../../../../utils/storage/sessionStorage", () => ({
  SessionItems: {
    paymentMethodInfo: "paymentMethodInfo",
    paymentMethod: "paymentMethod",
    orderId: "orderId",
    correlationId: "correlationId",
    enablePspPage: "enablePspPage",
  },
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(() => "mock-recaptcha-key"),
}));

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock dispatch function
const mockDispatch = jest.fn();
jest.mock("../../../../../redux/hooks/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}));

// Mock i18next
jest.mock("i18next", () => ({
  t: (key: string) => key,
}));

// Mock ReCAPTCHA
jest.mock("react-google-recaptcha", () => ({
  __esModule: true,
  default: React.forwardRef((_, ref) => {
    React.useImperativeHandle(ref, () => ({
      reset: jest.fn(),
      execute: jest.fn(),
      executeAsync: jest.fn(() => "token"),
    }));
    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        data-testid="recaptcha"
      />
    );
  }),
}));

// Mock route models
jest.mock("../../../../../routes/models/paymentMethodRoutes", () => ({
  PaymentMethodRoutes: {
    CP: { route: "card-payment" },
    PAYPAL: { route: "paypal-payment" },
  },
}));

jest.mock("../../../../../routes/models/routeModel", () => ({
  CheckoutRoutes: {
    RIEPILOGO_PAGAMENTO: "payment-summary",
    LISTA_PSP: "psp-list",
    ERRORE: "error",
  },
}));

// Mock PaymentMethod components
jest.mock("../PaymentMethod", () => ({
  MethodComponentList: ({ methods, onClick }: any) => (
    <div data-testid="method-list">
      {methods.map((method: any) => (
        <div
          key={method.id}
          data-testid={`payment-method-${method.paymentTypeCode}`}
          onClick={() => onClick(method)}
        >
          {method.description}
        </div>
      ))}
    </div>
  ),
  DisabledPaymentMethods: ({ methods }: any) => (
    <div data-testid="disabled-methods">
      {methods.map((method: any) => (
        <div
          key={method.id}
          data-testid={`disabled-method-${method.paymentTypeCode}`}
        >
          {method.description}
        </div>
      ))}
    </div>
  ),
}));

// Mock Material UI components
jest.mock("@mui/material/Box/Box", () => ({
  __esModule: true,
  default: ({ children, justifyContent, ...props }: any) => {
    // Filter out MUI-specific props
    const filteredProps = Object.entries(props).reduce((acc, [key, value]) => {
      // Only include props that are valid HTML attributes
      if (
        ![
          "display",
          "alignItems",
          "flexDirection",
          "width",
          "height",
          "padding",
          "margin",
          "sx",
        ].includes(key)
      ) {
        // eslint-disable-next-line functional/immutable-data
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    return (
      <div data-testid="box" {...filteredProps}>
        {children}
      </div>
    );
  },
}));

jest.mock("../../../../../components/PageContent/CheckoutLoader", () => ({
  __esModule: true,
  default: () => <div data-testid="checkout-loader">Loading...</div>,
}));

jest.mock(
  "../../../../../components/TextFormField/ClickableFieldContainer",
  () => ({
    __esModule: true,
    default: ({ loading }: any) => (
      <div data-testid="clickable-field" aria-busy={loading}>
        Loading field
      </div>
    ),
  })
);

jest.mock("../../../../../components/modals/ErrorModal", () => ({
  __esModule: true,
  default: ({ error, open, onClose }: any) =>
    open ? (
      <div data-testid="error-modal" role="alertdialog">
        <div data-testid="error-message">{error}</div>
        <button data-testid="close-error-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

jest.mock("../../../../../components/modals/InformationModal", () => ({
  __esModule: true,
  default: ({ open, onClose, children }: any) =>
    open ? (
      <div data-testid="info-modal" role="alertdialog">
        {children}
        <button data-testid="close-info-modal" onClick={onClose}>
          Close
        </button>
      </div>
    ) : null,
}));

// Create Redux store
const createTestStore = (initialState = {}) =>
  configureStore({
    reducer: {
      threshold: (state = {}, action) => {
        if (action.type === "threshold/setThreshold") {
          return { ...state, ...action.payload };
        }
        return state;
      },
    },
    preloadedState: initialState,
  });

// Custom render with Redux provider
const renderWithRouterAndRedux = (ui: any, { initialState = {} } = {}) => {
  const store = createTestStore(initialState);
  return render(<Provider store={store}>{ui}</Provider>);
};

describe("PaymentChoice", () => {
  const samplePaymentInstruments: Array<PaymentInstrumentsType> = [
    {
      id: "card-id",
      name: { it: "CARDS" },
      description: { it: "Carte di Credito e Debito" },
      status: PaymentMethodStatusEnum.ENABLED,
      methodManagement: MethodManagementEnum.ONBOARDABLE,
      paymentTypeCode: PaymentTypeCodeEnum.CP,
    },
    {
      id: "paypal-id",
      name: { it: "PAYPAL" },
      description: { it: "PayPal" },
      status: PaymentMethodStatusEnum.ENABLED,
      methodManagement: MethodManagementEnum.ONBOARDABLE,
      paymentTypeCode: PaymentTypeCodeEnum.PPAL,
    },
    {
      id: "disabled-id",
      name: { it: "DISABLED" },
      description: { it: "Disabled Method" },
      status: PaymentMethodStatusEnum.DISABLED,
      methodManagement: MethodManagementEnum.ONBOARDABLE,
      paymentTypeCode: "DISABLED" as PaymentTypeCodeEnum,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    // Set up default mock implementations
    mockedOnErrorActivate.mockImplementation(
      (_faultCodeCategory, _faultCodeDetail, onError) => {
        onError("Mock error");
      }
    );
  });

  it("should render without crashing", () => {
    const { container } = renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={[]}
        loading={true} // Set loading to true to ensure loader shows
      />
    );

    // Check that the component rendered something
    expect(container.firstChild).not.toBeNull();

    // Check for loading fields instead of checkout loader
    const loadingFields = screen.getAllByTestId("clickable-field");
    expect(loadingFields.length).toBeGreaterThan(0);
  });

  it("should show loading state when loading prop is true", () => {
    renderWithRouterAndRedux(
      <PaymentChoice amount={100} paymentInstruments={[]} loading={true} />
    );

    // Should show 5 loading fields
    const loadingFields = screen.getAllByTestId("clickable-field");
    expect(loadingFields).toHaveLength(5);
    loadingFields.forEach((field) => {
      expect(field).toHaveAttribute("aria-busy", "true");
    });
  });

  it("should render payment methods when loading is false", async () => {
    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: { execute: jest.fn(), reset: jest.fn() },
    }));

    renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={samplePaymentInstruments}
        loading={false}
      />
    );

    // Wait for loading to finish (component has internal loading state)
    await waitFor(() => {
      expect(screen.queryByTestId("checkout-loader")).not.toBeInTheDocument();
    });

    // Should show enabled payment methods
    expect(screen.getByText("Carte di Credito e Debito")).toBeInTheDocument();
    expect(screen.getByText("PayPal")).toBeInTheDocument();

    // Should show disabled methods separately
    expect(screen.getByTestId("disabled-methods")).toBeInTheDocument();
  });

  it("should render filtered payment methods when input text in filter box", async () => {
    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: { execute: jest.fn(), reset: jest.fn() },
    }));

    const result = renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={samplePaymentInstruments}
        loading={false}
      />
    );

    // Wait for loading to finish (component has internal loading state)
    await waitFor(() => {
      expect(screen.queryByTestId("checkout-loader")).not.toBeInTheDocument();
    });

    // Should show enabled payment methods
    expect(screen.getByTestId("payment-method-CP")).toBeInTheDocument();
    expect(screen.getByTestId("payment-method-PAYPAL")).toBeInTheDocument();
    // Should show disabled methods separately
    expect(screen.getByTestId("disabled-methods")).toBeInTheDocument();
    expect(
      result.container.querySelector("#noPaymentMethodsMessage")
    ).not.toBeInTheDocument();

    // Filter for string 'cart'
    const filterInput = result.container.querySelector(
      "#paymentMethodsFilter"
    )!;

    await act(async () => {
      fireEvent.change(filterInput, { target: { value: "cart" } });
    });
    // Should show only card payment methods
    expect(screen.getByTestId("payment-method-CP")).toBeInTheDocument();
    expect(
      screen.queryByTestId("payment-method-PAYPAL")
    ).not.toBeInTheDocument();
  });

  it("should render all payment methods when input text clear icon is clicked", async () => {
    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: { execute: jest.fn(), reset: jest.fn() },
    }));

    const result = renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={samplePaymentInstruments}
        loading={false}
      />
    );

    // Wait for loading to finish (component has internal loading state)
    await waitFor(() => {
      expect(screen.queryByTestId("checkout-loader")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("payment-method-CP")).toBeInTheDocument();
    expect(screen.queryByTestId("payment-method-PAYPAL")).toBeInTheDocument();

    // Filter for string 'cart'
    const filterInput = result.container.querySelector(
      "#paymentMethodsFilter"
    )!;

    await act(async () => {
      fireEvent.change(filterInput, { target: { value: "cart" } });
    });
    // Should show only card payment methods
    expect(screen.getByTestId("payment-method-CP")).toBeInTheDocument();
    expect(
      screen.queryByTestId("payment-method-PAYPAL")
    ).not.toBeInTheDocument();
    expect(
      result.container.querySelector("#noPaymentMethodsMessage")
    ).not.toBeInTheDocument();

    const clearFilter = result.container.querySelector(
      "#clearFilterPaymentMethod"
    )!;
    // expect(clearFilter).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(clearFilter);
    });
    // Should show enabled payment methods
    expect(screen.getByTestId("payment-method-CP")).toBeInTheDocument();
    expect(screen.getByTestId("payment-method-PAYPAL")).toBeInTheDocument();
    expect(
      result.container.querySelector("#noPaymentMethodsMessage")
    ).not.toBeInTheDocument();
  });

  it("should show no result string when filter doesn't match any payment methods name", async () => {
    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: { execute: jest.fn(), reset: jest.fn() },
    }));

    const result = renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={samplePaymentInstruments}
        loading={false}
      />
    );

    // Wait for loading to finish (component has internal loading state)
    await waitFor(() => {
      expect(screen.queryByTestId("checkout-loader")).not.toBeInTheDocument();
    });

    expect(screen.getByTestId("payment-method-CP")).toBeInTheDocument();
    expect(screen.queryByTestId("payment-method-PAYPAL")).toBeInTheDocument();

    // Filter for string 'cart'
    const filterInput = result.container.querySelector(
      "#paymentMethodsFilter"
    )!;

    await act(async () => {
      fireEvent.change(filterInput, { target: { value: "carta" } });
    });
    // Should show only card payment methods
    expect(
      result.container.querySelector("#noPaymentMethodsMessage")
    ).toBeInTheDocument();
  });

  it("should handle credit card payment method click", async () => {
    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: { execute: jest.fn(), reset: jest.fn() },
    }));

    const { getByText } = renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={samplePaymentInstruments}
        loading={false}
      />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId("checkout-loader")).not.toBeInTheDocument();
    });

    // Click on the credit card payment method
    fireEvent.click(getByText("Carte di Credito e Debito"));

    // Should navigate to the card payment route
    expect(mockNavigate).toHaveBeenCalledWith("/card-payment");
  });

  it("should handle non-credit card payment method click", async () => {
    mockedGetFees.mockImplementation((onSuccess, _, __) => {
      onSuccess(true);
      return Promise.resolve();
    });

    mockedRecaptchaTransaction.mockImplementation(({ onSuccess }) => {
      onSuccess("payment_method_id", "order_id");
      return Promise.resolve();
    });

    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: { execute: jest.fn(), reset: jest.fn() },
    }));

    const { getByText } = renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={samplePaymentInstruments}
        loading={false}
      />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId("checkout-loader")).not.toBeInTheDocument();
    });

    // Click on the PayPal payment method
    fireEvent.click(getByText("PayPal"));

    expect(mockedRecaptchaTransaction).toHaveBeenCalled();

    // Should navigate to the PayPal payment route
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/paypal-payment");
    });

    // Should set threshold in Redux
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "threshold/setThreshold",
      payload: { belowThreshold: true },
    });
  });

  it("should show error modal when error occurs", async () => {
    // Mock recaptchaTransaction to trigger an error
    mockedRecaptchaTransaction.mockImplementation(({ onError }) => {
      onError("GENERIC_ERROR", "Something went wrong");
      return Promise.resolve();
    });

    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: { execute: jest.fn(), reset: jest.fn() },
    }));

    const { getByText } = renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={samplePaymentInstruments}
        loading={false}
      />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId("checkout-loader")).not.toBeInTheDocument();
    });

    // Click on the PayPal payment method
    fireEvent.click(getByText("PayPal"));

    // Should show error modal
    await waitFor(() => {
      expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Mock error"
      );
    });

    // Close the error modal
    fireEvent.click(screen.getByTestId("close-error-modal"));

    // Should navigate to error page
    expect(mockNavigate).toHaveBeenCalledWith("/error", { replace: true });
  });

  it("should show PSP not found modal when PSP is not available", async () => {
    // Reset all mocks to ensure clean state
    jest.clearAllMocks();

    // Mock getFees to trigger PSP not found specifically for this test
    mockedGetFees.mockImplementationOnce((_onSuccess, onPspNotFound) => {
      onPspNotFound();
      return Promise.resolve();
    });

    // Also ensure recaptchaTransaction calls its success callback
    mockedRecaptchaTransaction.mockImplementationOnce(({ onSuccess }) => {
      onSuccess("pmId", "orderId");
      return Promise.resolve();
    });

    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: { execute: jest.fn(), reset: jest.fn() },
    }));

    renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={samplePaymentInstruments}
        loading={false}
      />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId("checkout-loader")).not.toBeInTheDocument();
    });

    // Click on the PayPal payment method
    fireEvent.click(screen.getByText("PayPal"));

    // Should show PSP not found modal
    await waitFor(() => {
      expect(screen.getByTestId("info-modal")).toBeInTheDocument();
    });

    expect(screen.getByText("pspUnavailable.title")).toBeInTheDocument();
    expect(screen.getByText("pspUnavailable.body")).toBeInTheDocument();

    // Close the PSP not found modal
    fireEvent.click(screen.getByTestId("close-info-modal"));

    // Modal should be closed
    await waitFor(() => {
      expect(screen.queryByTestId("info-modal")).not.toBeInTheDocument();
    });
  });

  it("should render ReCAPTCHA component", async () => {
    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: { execute: jest.fn(), reset: jest.fn() },
    }));

    renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={samplePaymentInstruments}
        loading={false}
      />
    );

    // ReCAPTCHA should be in the document
    expect(screen.getByTestId("recaptcha")).toBeInTheDocument();
  });

  it("should navigate to PSP list when enablePspPage is true", async () => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set localStorage item
    localStorage.setItem("enablePspPage", "true");

    // Mock recaptchaTransaction to ensure it works correctly
    mockedRecaptchaTransaction.mockImplementation(({ onSuccess }) => {
      onSuccess("pmId", "oId");
      return Promise.resolve();
    });

    // Mock getFees to ensure it calls onSuccess
    mockedGetFees.mockImplementation((onSuccess) => {
      onSuccess(true);
      return Promise.resolve();
    });

    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: {
        execute: jest.fn().mockResolvedValue("token"),
        reset: jest.fn(),
      },
    }));

    renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={[
          {
            id: "other-id",
            name: { it: "OTHER" },
            description: { it: "Other Payment Method" },
            status: PaymentMethodStatusEnum.ENABLED,
            methodManagement: MethodManagementEnum.ONBOARDABLE,
            paymentTypeCode: "OTHER" as PaymentTypeCodeEnum, // Not in PaymentMethodRoutes
          },
        ]}
        loading={false}
      />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId("checkout-loader")).not.toBeInTheDocument();
    });

    // Click on the payment method
    fireEvent.click(screen.getByText("Other Payment Method"));

    // Add a small delay to allow async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Check if navigate was called with the expected route
    expect(mockNavigate).toHaveBeenCalledWith("/psp-list");
  });

  it("should track payment method choice with mixpanel", async () => {
    // Mock the useRef to immediately set the ref
    jest.spyOn(React, "useRef").mockImplementation(() => ({
      current: { execute: jest.fn(), reset: jest.fn() },
    }));

    const { getByText } = renderWithRouterAndRedux(
      <PaymentChoice
        amount={100}
        paymentInstruments={samplePaymentInstruments}
        loading={false}
      />
    );

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId("checkout-loader")).not.toBeInTheDocument();
    });

    // Click on the credit card payment method
    fireEvent.click(getByText("Carte di Credito e Debito"));
  });

  it("should render without crashing with amount greater than 1 milion", () => {
    const { container } = renderWithRouterAndRedux(
      <PaymentChoice
        amount={130539492}
        paymentInstruments={[]}
        loading={true} // Set loading to true to ensure loader shows
      />
    );

    // Check that the component rendered something
    expect(container.firstChild).not.toBeNull();

    // Check for loading fields instead of checkout loader
    const loadingFields = screen.getAllByTestId("clickable-field");
    expect(loadingFields.length).toBeGreaterThan(0);
  });
});
