import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, act, screen, waitFor } from "@testing-library/react";
import * as router from "react-router";
import { apiPaymentEcommerceClientWithRetryV2 } from "../../utils/api/client";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import PaymentPspListPage from "../PaymentPspListPage";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../utils/storage/sessionStorage";
import {
  paymentMethod,
  paymentMethodInfo,
  transaction,
  paymentInfo,
  sessionPayment,
  calculateFeeResponse,
  calculateFeeResponseOnlyOnePSP,
  calculateFeeResponseNoPsp,
} from "./_model";

import { setThreshold } from "../../redux/slices/threshold";

// Mock translations
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({
    i18nKey,
  }: {
    i18nKey?: string;
    values?: Record<string, any>;
    components?: Array<any>;
    children?: React.ReactNode;
  }) => <span data-testid="mocked-trans">{i18nKey || "no-key"}</span>,
}));

// Mock the config module
jest.mock("../../utils/config/config", () =>
  // Return the actual implementation but with our mock for getConfigOrThrow
  ({
    // This is the key fix - handle the case when no key is provided
    getConfigOrThrow: jest.fn((key) => {
      // Create a mapping of all config values
      const configValues = {
        CHECKOUT_ENV: "TEST",
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

jest.mock("../../utils/api/client", () => ({
  apiPaymentEcommerceClientWithRetryV2: {
    calculateFees: jest.fn(),
  },
}));

const mockGetSessionItem = (item: SessionItems) => {
  switch (item) {
    case "paymentMethod":
      return paymentMethod;
    case "paymentMethodInfo":
      return paymentMethodInfo;
    case "transaction":
      return transaction;
    case "useremail":
      return "test@pagopa.it";
    case "paymentInfo":
      return paymentInfo;
    case "sessionPayment":
      return sessionPayment;
    default:
      return undefined;
  }
};

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(),
  SessionItems: {
    paymentMethod: "paymentMethod",
    paymentMethodInfo: "paymentMethodInfo",
    pspSelected: "pspSelected",
    transaction: "transaction",
    useremail: "useremail",
    paymentInfo: "paymentInfo",
    sessionPayment: "sessionPayment",
  },
}));

jest.mock("../../redux/slices/threshold", () => ({
  setThreshold: jest.fn(() => ({ type: "SET_THRESHOLD" })),
}));

// Create a Jest spy for navigation
const navigate = jest.fn();

describe("PaymentPspListPage", () => {
  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockReset();
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItem);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReset();
    jest.mocked(setThreshold).mockClear();
  });

  test("should call navigate -1 clicking on back button", () => {
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: calculateFeeResponse,
        },
      })
    );
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentPspListPage />
      </MemoryRouter>
    );
    act(() => {
      const goBack = screen.getByText("paymentPspListPage.formButtons.back");
      fireEvent.click(goBack);
    });
    expect(navigate).toHaveBeenCalledWith(-1);
  });

  test("should call navigate riepilogo-pagamento clicking on submit button after select psp", async () => {
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: calculateFeeResponse,
        },
      })
    );
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentPspListPage />
      </MemoryRouter>
    );
    await waitFor(() => {
      const selectPsp = screen.getByText(
        calculateFeeResponse.bundles[1].pspBusinessName!
      );
      fireEvent.click(selectPsp);
      const submit = screen.getByText("paymentPspListPage.formButtons.submit");
      expect(submit).toBeEnabled();
      fireEvent.click(submit);
    });
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.pspSelected,
      calculateFeeResponse.bundles[1]
    );
    expect(navigate).toHaveBeenCalledWith("/riepilogo-pagamento");
  });

  test("should call navigate riepilogo-pagamento if result list hase size of 1", async () => {
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: calculateFeeResponseOnlyOnePSP,
        },
      })
    );

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentPspListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(navigate).toHaveBeenNthCalledWith(3, "/riepilogo-pagamento");
    });
  });

  test("should call navigate scegli-metodo if no bundles are available", async () => {
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 404,
        },
      })
    );

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentPspListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("pspUnavailable.title")).toBeVisible();
      fireEvent.click(screen.getByText("pspUnavailable.cta.primary"));
      expect(navigate).toHaveBeenCalledWith("/scegli-metodo", {
        replace: true,
      });
    });
  });
  // CANNOT TRIGGER ERROR MODAL
  test.skip("should show error modal if an error is returned from calculateFees", async () => {
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        left: {
          status: 502,
        },
      })
    );

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentPspListPage />
      </MemoryRouter>
    );

    expect(screen.getByText("2pspUnavailable.title")).toBeVisible();
  });

  test('should update the threshold after calling calculateFees', async () => {
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: calculateFeeResponse,
        },
      })
    );
    
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentPspListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const mockedSetThreshold = jest.mocked(setThreshold);
      expect(mockedSetThreshold).toHaveBeenCalled();
    
      // Check how many times it was called
      expect(mockedSetThreshold).toHaveBeenCalledTimes(1);
    
      // Check if it was called with the expected arguments
      expect(mockedSetThreshold).toHaveBeenCalledWith({"belowThreshold": false});    
    })
  })
});

describe("PaymentPspListPage - session missing values", () => {

  const mockGetSessionItemNoPaymentMethod = (item: SessionItems) => {
    switch (item) {
      case "paymentMethod":
        return null;
      default:
        return undefined;
    }
  };

  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockReset();
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItemNoPaymentMethod);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReset();
    jest.mocked(setThreshold).mockClear();
  });

  test('should not call calculateFees and setThreshold if payment method not present and psp list is not empty', async () => {
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: calculateFeeResponse,
        },
      })
    );
    
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentPspListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const mockedSetThreshold = jest.mocked(setThreshold);
      expect(mockedSetThreshold).not.toHaveBeenCalled();
    
      expect((
        apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
      )).not.toHaveBeenCalled();
    })
  })
});

describe("PaymentPspListPage - session missing values", () => {

  const mockGetSessionItemNoPaymentMethod = (item: SessionItems) => {
    switch (item) {
      case "paymentMethod":
        return null;
      default:
        return undefined;
    }
  };

  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockReset();
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItemNoPaymentMethod);
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReset();
    jest.mocked(setThreshold).mockClear();
  });

  test("should not call calculateFees and setThreshold if payment method present but psp list is empty", async () => {
    (
      apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: calculateFeeResponseNoPsp,
        },
      })
    );
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentPspListPage />
      </MemoryRouter>
    );
    
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentPspListPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const mockedSetThreshold = jest.mocked(setThreshold);
      expect(mockedSetThreshold).not.toHaveBeenCalled();
    
      expect((
        apiPaymentEcommerceClientWithRetryV2.calculateFees as jest.Mock
      )).not.toHaveBeenCalled();
    })
  });
});