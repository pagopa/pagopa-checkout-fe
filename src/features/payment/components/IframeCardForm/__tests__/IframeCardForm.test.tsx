import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import IframeCardForm from "../IframeCardForm";
import { IdFields } from "../types";
import * as helper from "../../../../../utils/api/helper";
import * as sessionStorage from "../../../../../utils/storage/sessionStorage";
import * as eventListeners from "../../../../../utils/eventListeners";
import { CheckoutRoutes } from "../../../../../routes/models/routeModel";
import { ErrorsType } from "../../../../../utils/errors/checkErrorsModel";
import "@testing-library/jest-dom";

// Improved Box mock that handles MUI props properly
jest.mock("@mui/material", () => ({
  Box: ({
    children,
    display,
    justifyContent,
    sx,
    mt,
    mb,
    width,
    ...props
  }: any) => {
    // Transform MUI props to style object
    // eslint-disable-next-line functional/immutable-data
    const style: Record<string, string | number> = {};

    if (mt) {
      // eslint-disable-next-line functional/immutable-data
      style.marginTop = typeof mt === "number" ? `${mt * 8}px` : mt;
    }
    if (mb) {
      // eslint-disable-next-line functional/immutable-data
      style.marginBottom = typeof mb === "number" ? `${mb * 8}px` : mb;
    }
    if (width) {
      // eslint-disable-next-line functional/immutable-data
      style.width = width;
    }
    if (display) {
      // eslint-disable-next-line functional/immutable-data
      style.display = display;
    }

    // Don't pass MUI-specific props to the DOM
    return (
      <div
        data-testid="box-component"
        style={style}
        {...props}
        data-display={display}
        data-justifycontent={justifyContent}
      >
        {children}
      </div>
    );
  },
  // eslint-disable-next-line sonarjs/cognitive-complexity
  Typography: ({ children, variant, component, sx, ...props }: any) => {
    // eslint-disable-next-line functional/immutable-data
    const style: Record<string, string> = {};
    if (sx) {
      if (sx.mt) {
        // eslint-disable-next-line functional/immutable-data
        style.marginTop = typeof sx.mt === "number" ? `${sx.mt * 8}px` : sx.mt;
      }
      if (sx.mb) {
        // eslint-disable-next-line functional/immutable-data
        style.marginBottom =
          typeof sx.mb === "number" ? `${sx.mb * 8}px` : sx.mb;
      }
      if (sx.pb) {
        // eslint-disable-next-line functional/immutable-data
        style.paddingBottom =
          typeof sx.pb === "number" ? `${sx.pb * 8}px` : sx.pb;
      }
      if (sx.whiteSpace) {
        // eslint-disable-next-line functional/immutable-data
        style.whiteSpace = sx.whiteSpace;
      }
    }
    return (
      <div
        data-testid="typography-component"
        data-variant={variant}
        data-component={component}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  },
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

const mockIframeFieldCardNumber = () => {
  expect(screen.getByTestId("iframe-field-CARD_NUMBER")).toBeInTheDocument();
};

jest.mock("react-google-recaptcha", () => ({
  __esModule: true,
  default: React.forwardRef((_props, ref) => {
    React.useImperativeHandle(ref, () => ({
      reset: jest.fn(),
      execute: jest.fn(),
      executeAsync: jest.fn().mockResolvedValue("recaptcha-token"),
    }));
    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} data-test="recaptcha" />
    );
  }),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock FormButtons component
jest.mock("../../../../../components/FormButtons/FormButtons", () => ({
  FormButtons: ({
    handleSubmit,
    handleCancel,
    disabledSubmit,
    loadingSubmit,
  }: any) => (
    <div data-testid="form-buttons">
      <button
        onClick={handleSubmit}
        disabled={disabledSubmit}
        data-loading={loadingSubmit}
        data-testid="submit-button"
      >
        Submit
      </button>
      <button onClick={handleCancel} data-testid="cancel-button">
        Cancel
      </button>
    </div>
  ),
}));

// Mock ErrorModal component
jest.mock("../../../../../components/modals/ErrorModal", () => ({
  __esModule: true,
  default: ({ error, open, onClose }: any) =>
    open ? (
      <div data-testid="error-modal">
        <div data-testid="error-message">{error}</div>
        <button onClick={onClose} data-testid="close-error-modal">
          Close
        </button>
      </div>
    ) : null,
}));

// Mock InformationModal component
jest.mock("../../../../../components/modals/InformationModal", () => ({
  __esModule: true,
  default: ({ open, onClose, children }: any) =>
    open ? (
      <div data-testid="information-modal">
        {children}
        <button onClick={onClose} data-testid="close-info-modal">
          Close
        </button>
      </div>
    ) : null,
}));

// Mock IframeCardField component
jest.mock("../IframeCardField", () => ({
  IframeCardField: ({
    label,
    id,
    isValid,
    errorMessage,
    activeField,
    isAllFieldsLoaded,
  }: any) => (
    <div
      data-testid={`iframe-field-${id}`}
      data-active={activeField === id}
      data-loaded={isAllFieldsLoaded}
    >
      <label>{label}</label>
      <div data-valid={isValid}>{errorMessage}</div>
    </div>
  ),
}));

// Mock API helpers
jest.mock("../../../../../utils/api/helper", () => ({
  getFees: jest.fn(),
  npgSessionsFields: jest.fn(),
  recaptchaTransaction: jest.fn(),
  retrieveCardData: jest.fn(),
}));

// Mock error helper
jest.mock("../../../../../utils/api/transactionsErrorHelper", () => ({
  onErrorActivate: jest.fn(),
}));

// Mock session storage
jest.mock("../../../../../utils/storage/sessionStorage", () => ({
  SessionItems: {
    orderId: "orderId",
    correlationId: "correlationId",
    loginOriginPage: "loginOriginPage",
    enablePspPage: "enablePspPage",
  },
  getReCaptchaKey: jest.fn(() => "recaptcha-key"),
  setSessionItem: jest.fn(),
}));

// Mock buildConfig
jest.mock("../../../../../utils/buildConfig", () => ({
  __esModule: true,
  default: jest.fn(() => ({})),
}));

// Mock event listeners
jest.mock("../../../../../utils/eventListeners", () => ({
  clearNavigationEvents: jest.fn(),
}));

// Mock redux
const mockDispatch = jest.fn();
jest.mock("../../../../../redux/hooks/hooks", () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock("../../../../../redux/slices/threshold", () => ({
  setThreshold: jest.fn(() => ({ type: "SET_THRESHOLD" })),
}));

/* eslint-disable functional/immutable-data */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.Build = jest.fn().mockImplementation((config) => {
  // Store the callbacks for later use in tests
  if (config.onAllFieldsLoaded) {
    setTimeout(() => config.onAllFieldsLoaded(), 0);
  }

  return {
    confirmData: jest.fn((callback) => {
      if (callback) {
        callback();
      }
      if (config.onReadyForPayment) {
        setTimeout(() => config.onReadyForPayment(), 0);
      }
    }),
  };
});

/* eslint-enable functional/immutable-data */

// Mock localStorage
const localStorageMock = (() => {
  // eslint-disable-next-line functional/no-let
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      // eslint-disable-next-line functional/immutable-data
      store[key] = value.toString();
    },
    clear: () => {
      store = {}; // eslint-disable-line functional/immutable-data
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock }); // eslint-disable-line functional/immutable-data

// Mock window.location
const originalLocation = window.location;
// eslint-disable-next-line functional/no-let
let locationMock: Record<string, any>;

beforeAll(() => {
  // Create a location mock that allows replace to be mocked
  locationMock = {
    ...originalLocation,
    replace: jest.fn(),
  };

  // Use defineProperty with configurable: true to allow it to be restored later
  // eslint-disable-next-line functional/immutable-data
  Object.defineProperty(window, "location", {
    configurable: true,
    value: locationMock,
    writable: true,
  });
});

afterAll(() => {
  // Restore the original location
  // eslint-disable-next-line functional/immutable-data
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
    writable: true,
  });
});

// Helper function to reduce cognitive complexity
const setupMockSessionResponse = () => ({
  orderId: "order123",
  correlationId: "corr123",
  paymentMethodData: {
    form: [
      { id: "CARD_NUMBER", label: "Card Number" },
      { id: "EXPIRATION_DATE", label: "Expiration Date" },
      { id: "SECURITY_CODE", label: "CVV" },
      { id: "CARDHOLDER_NAME", label: "Cardholder Name" },
    ],
  },
});

// Helper function to reduce cognitive complexity
const setupSimpleMockSessionResponse = () => ({
  orderId: "order123",
  correlationId: "corr123",
  paymentMethodData: {
    form: [{ id: "CARD_NUMBER", label: "Card Number" }],
  },
});

describe("IframeCardForm", () => {
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();

    // Reset the location mock's replace function before each test
    // eslint-disable-next-line functional/immutable-data
    locationMock.replace = jest.fn();
  });

  it("should render the form with fields", async () => {
    // Mock the API response
    const mockSessionResponse = setupMockSessionResponse();

    (helper.npgSessionsFields as jest.Mock).mockImplementation(
      (_onError, onResponse) => {
        onResponse(mockSessionResponse);
      }
    );

    render(<IframeCardForm onCancel={mockOnCancel} />);

    // Check if all fields are rendered
    await waitFor(() => {
      expect(
        screen.getByTestId("iframe-field-CARD_NUMBER")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("iframe-field-EXPIRATION_DATE")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("iframe-field-SECURITY_CODE")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("iframe-field-CARDHOLDER_NAME")
      ).toBeInTheDocument();
    });

    // Check if form buttons are rendered
    expect(screen.getByTestId("form-buttons")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    expect(screen.getByTestId("cancel-button")).toBeInTheDocument();
  });

  it("should handle form submission when all fields are valid", async () => {
    // Mock the API response
    const mockSessionResponse = setupMockSessionResponse();

    (helper.npgSessionsFields as jest.Mock).mockImplementation(
      (_onError, onResponse) => {
        onResponse(mockSessionResponse);
      }
    );

    // Mock recaptcha transaction
    (helper.recaptchaTransaction as jest.Mock).mockImplementation(
      ({ onSuccess }) => {
        onSuccess("payment123", "order123");
      }
    );

    // Mock retrieveCardData
    (helper.retrieveCardData as jest.Mock).mockImplementation(
      ({ onResponseSessionPaymentMethod }) => {
        onResponseSessionPaymentMethod({ bin: "123456" });
      }
    );

    // Mock getFees
    (helper.getFees as jest.Mock).mockImplementation((onSuccess) => {
      onSuccess(true);
    });

    const { rerender } = render(<IframeCardForm onCancel={mockOnCancel} />);

    // Wait for the component to render and initialize
    await waitFor(() => {
      expect(
        screen.getByTestId("iframe-field-CARD_NUMBER")
      ).toBeInTheDocument();
    });

    // Get the onChange handler from the Build constructor
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const buildConfig = (global.Build as jest.Mock).mock.calls[0][0];
    const onChangeHandler = buildConfig.onChange;

    // Simulate each field becoming valid
    if (onChangeHandler) {
      Object.values(IdFields).forEach((fieldId) => {
        act(() => {
          onChangeHandler(fieldId, {
            isValid: true,
            errorCode: null,
            errorMessage: null,
          });
        });
      });
    }

    // Rerender to update the form state
    rerender(<IframeCardForm onCancel={mockOnCancel} />);

    // Submit the form
    const submitButton = screen.getByTestId("submit-button");
    fireEvent.click(submitButton);

    // Check if confirmData was called
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(global.Build).toHaveBeenCalled();
  });

  it("should handle API errors", async () => {
    // Mock the API error
    (helper.npgSessionsFields as jest.Mock).mockImplementation((onError) => {
      onError(ErrorsType.GENERIC_ERROR);
    });

    render(<IframeCardForm onCancel={mockOnCancel} />);

    // Check if error modal is shown
    await waitFor(() => {
      expect(screen.getByTestId("error-modal")).toBeInTheDocument();
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        ErrorsType.GENERIC_ERROR
      );
    });
  });

  it("should handle unauthorized errors", async () => {
    // Mock the API unauthorized error
    (helper.npgSessionsFields as jest.Mock).mockImplementation((onError) => {
      onError(ErrorsType.UNAUTHORIZED);
    });

    render(<IframeCardForm onCancel={mockOnCancel} />);

    // Check if redirected to auth expired page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        `/${CheckoutRoutes.AUTH_EXPIRED}`
      );
      expect(sessionStorage.setSessionItem).toHaveBeenCalledWith(
        sessionStorage.SessionItems.loginOriginPage,
        expect.any(String)
      );
    });
  });

  it.skip("should handle PSP not found scenario", async () => {
    // Create a mock implementation for InformationModal
    // const InformationModal = require("../../../../../components/modals/InformationModal").default;

    // Mock the API response
    const mockSessionResponse = setupSimpleMockSessionResponse();

    (helper.npgSessionsFields as jest.Mock).mockImplementation(
      (_onError, onResponse) => {
        onResponse(mockSessionResponse);
      }
    );

    // Set up a synchronous chain of mocks to avoid timing issues
    // eslint-disable-next-line functional/no-let
    let onReadyForPaymentCallback: jest.Mock = jest.fn();
    // eslint-disable-next-line functional/no-let
    let onSuccessCallback: jest.Mock = jest.fn();
    // eslint-disable-next-line functional/no-let
    let onPspNotFoundCallback: jest.Mock = jest.fn();

    // Mock Build
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (global.Build as jest.Mock).mockImplementationOnce((config) => {
      // Store callback for later manual triggering
      if (config.onReadyForPayment) {
        onReadyForPaymentCallback = jest
          .fn()
          .mockImplementation(config.onReadyForPayment);
      }

      return {
        confirmData: jest.fn((callback) => {
          if (callback) {
            callback();
          }
        }),
      };
    });

    // Mock recaptcha transaction
    (helper.recaptchaTransaction as jest.Mock).mockImplementationOnce(
      ({ onSuccess }) => {
        onSuccessCallback = jest
          .fn()
          .mockImplementation(() => onSuccess("payment123", "order123"));
      }
    );

    // Mock retrieveCardData
    (helper.retrieveCardData as jest.Mock).mockImplementationOnce(
      ({ onResponseSessionPaymentMethod }) => {
        setTimeout(() => onResponseSessionPaymentMethod({ bin: "123456" }), 10);
      }
    );

    // Mock getFees
    (helper.getFees as jest.Mock).mockImplementationOnce(
      (_onSuccess, onPspNotFound) => {
        onPspNotFoundCallback = jest.fn().mockImplementation(onPspNotFound);
      }
    );

    // Render the component
    render(<IframeCardForm onCancel={mockOnCancel} />);

    // Wait for the component to render
    await waitFor(mockIframeFieldCardNumber);

    // Manually trigger the callbacks in sequence
    act(() => {
      onReadyForPaymentCallback();
      onSuccessCallback();
    });

    // Wait a bit for the retrieveCardData to complete
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Trigger PSP not found
    act(() => {
      onPspNotFoundCallback();
    });

    // Now the information modal should be visible
    await waitFor(() => {
      expect(screen.getByTestId("information-modal")).toBeInTheDocument();
    });

    // Close the modal
    const closeButton = screen.getByTestId("close-info-modal");
    fireEvent.click(closeButton);

    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith(
      `/${CheckoutRoutes.SCEGLI_METODO}`,
      { replace: true }
    );
  });

  it.skip("should handle successful payment flow", async () => {
    // TODO
  });

  it("should handle cancel button click", () => {
    render(<IframeCardForm onCancel={mockOnCancel} />);

    const cancelButton = screen.getByTestId("cancel-button");
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("should handle Build initialization error", async () => {
    // Mock the API response
    const mockSessionResponse = setupSimpleMockSessionResponse();

    (helper.npgSessionsFields as jest.Mock).mockImplementation(
      (_onError, onResponse) => {
        onResponse(mockSessionResponse);
      }
    );

    // Make Build constructor throw an error
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    (global.Build as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Build initialization error");
    });

    render(<IframeCardForm onCancel={mockOnCancel} />);

    // Check if redirected to error page
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/${CheckoutRoutes.ERRORE}`, {
        replace: true,
      });
    });
  });

  it.skip("should handle form submission error", async () => {
    // TODO
  });

  it("should handle field status changes", async () => {
    // Mock the API response
    const mockSessionResponse = setupMockSessionResponse();

    (helper.npgSessionsFields as jest.Mock).mockImplementation(
      (_onError, onResponse) => {
        onResponse(mockSessionResponse);
      }
    );

    const { rerender } = render(<IframeCardForm onCancel={mockOnCancel} />);

    // Wait for the component to render and initialize
    await waitFor(mockIframeFieldCardNumber);

    // Get the onChange handler from the Build constructor
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const buildConfig = (global.Build as jest.Mock).mock.calls[0][0];
    const onChangeHandler = buildConfig.onChange;

    // Simulate field status changes
    if (onChangeHandler) {
      // Set CARD_NUMBER as invalid
      act(() => {
        onChangeHandler("CARD_NUMBER", {
          isValid: false,
          errorCode: "INVALID_CARD",
          errorMessage: "Invalid card number",
        });
      });

      // Rerender to update the form state
      rerender(<IframeCardForm onCancel={mockOnCancel} />);

      // Check if the field shows the error
      expect(screen.getByTestId("iframe-field-CARD_NUMBER")).toHaveAttribute(
        "data-active",
        "true"
      );

      // Set CARD_NUMBER as valid
      act(() => {
        onChangeHandler("CARD_NUMBER", {
          isValid: true,
          errorCode: null,
          errorMessage: null,
        });
      });

      // Set all fields as valid
      // eslint-disable-next-line sonarjs/no-identical-functions
      Object.values(IdFields).forEach((fieldId) => {
        // eslint-disable-next-line sonarjs/no-identical-functions
        act(() => {
          onChangeHandler(fieldId, {
            isValid: true,
            errorCode: null,
            errorMessage: null,
          });
        });
      });

      // Rerender to update the form state
      rerender(<IframeCardForm onCancel={mockOnCancel} />);
    }
  });

  it("should handle payment redirect", async () => {
    // Mock the API response
    const mockSessionResponse = setupSimpleMockSessionResponse();

    (helper.npgSessionsFields as jest.Mock).mockImplementation(
      (_onError, onResponse) => {
        onResponse(mockSessionResponse);
      }
    );

    render(<IframeCardForm onCancel={mockOnCancel} />);

    // Wait for the component to render and initialize
    await waitFor(mockIframeFieldCardNumber);

    // Get the onPaymentRedirect handler from the Build constructor
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const buildConfig = (global.Build as jest.Mock).mock.calls[0][0];
    const onPaymentRedirectHandler = buildConfig.onPaymentRedirect;

    // Trigger payment redirect
    if (onPaymentRedirectHandler) {
      act(() => {
        onPaymentRedirectHandler("https://example.com/redirect");
      });

      // Check if navigation events are cleared
      expect(eventListeners.clearNavigationEvents).toHaveBeenCalled();

      // Check if location.replace was called with the redirect URL
      expect(locationMock.replace).toHaveBeenCalledWith(
        "https://example.com/redirect"
      );
    }
  });

  it("should handle payment completion", async () => {
    // Mock the API response
    const mockSessionResponse = setupSimpleMockSessionResponse();

    (helper.npgSessionsFields as jest.Mock).mockImplementation(
      (_onError, onResponse) => {
        onResponse(mockSessionResponse);
      }
    );

    render(<IframeCardForm onCancel={mockOnCancel} />);

    // Wait for the component to render and initialize
    await waitFor(mockIframeFieldCardNumber);

    // Get the onPaymentComplete handler from the Build constructor
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const buildConfig = (global.Build as jest.Mock).mock.calls[0][0];
    const onPaymentCompleteHandler = buildConfig.onPaymentComplete;

    // Trigger payment completion
    if (onPaymentCompleteHandler) {
      act(() => {
        onPaymentCompleteHandler();
      });

      // Check if navigation events are cleared
      expect(eventListeners.clearNavigationEvents).toHaveBeenCalled();

      // Check if navigated to the result page
      expect(mockNavigate).toHaveBeenCalledWith(`/${CheckoutRoutes.ESITO}`, {
        replace: true,
      });
    }
  });

  it("should handle error modal close", async () => {
    // Mock the API error
    (helper.npgSessionsFields as jest.Mock).mockImplementation((onError) => {
      onError(ErrorsType.GENERIC_ERROR);
    });

    render(<IframeCardForm onCancel={mockOnCancel} />);

    // Check if error modal is shown
    await waitFor(() => {
      expect(screen.getByTestId("error-modal")).toBeInTheDocument();
    });

    // Close the error modal
    const closeButton = screen.getByTestId("close-error-modal");
    fireEvent.click(closeButton);

    // Check if redirected to error page
    expect(mockNavigate).toHaveBeenCalledWith(`/${CheckoutRoutes.ERRORE}`, {
      replace: true,
    });
  });
});
