/* eslint-disable sonarjs/no-identical-functions */

import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import * as router from "react-router";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../utils/storage/sessionStorage";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import PaymentChoicePage from "../../routes/PaymentChoicePage";
import {
  apiPaymentEcommerceClient,
  apiPaymentEcommerceClientV2,
  apiPaymentEcommerceClientV3,
  apiPaymentEcommerceClientWithRetryV2,
} from "../../utils/api/client";
import {
  calculateFeeResponse,
  createSuccessGetPaymentMethodsV1,
  createSuccessGetPaymentMethodsV3,
  paymentInfo,
  paymentMethod,
  rptId,
  sessionPayment,
  transaction,
} from "./_model";
// Mock translations and recaptcha
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

// Create a Jest spy for navigation
const navigate = jest.fn();

jest.mock("../../utils/api/client", () => ({
  apiPaymentEcommerceClient: {
    getAllPaymentMethods: jest.fn(),
  },
  apiPaymentEcommerceClientV2: {
    newTransaction: jest.fn(),
  },
  apiPaymentEcommerceClientWithRetryV2: {
    calculateFees: jest.fn(),
  },
  apiPaymentEcommerceClientV3: {
    getAllPaymentMethodsV3: jest.fn(),
    newTransactionV3: jest.fn(),
  },
}));

// Mock storage utilities (and return an empty object if needed)
jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(),
  getRptIdsFromSession: jest.fn(),
  SessionItems: {
    authToken: "authToken",
    loginOriginPage: "loginOriginPage",
    enableAuthentication: "enableAuthentication",
    rptId: "rptId",
    enablePspPage: "enablePspPage",
    noticeInfo: "rptId",
    paymentInfo: "paymentInfo",
    useremail: "useremail",
    paymentMethod: "paymentMethod",
    orderId: "orderId",
    correlationId: "correlationId",
    sessionPayment: "sessionPayment",
    transaction: "transaction",
  },
}));

jest.mock("react-google-recaptcha", () => ({
  __esModule: true,
  default: React.forwardRef((_, ref) => {
    React.useImperativeHandle(ref, () => ({
      reset: jest.fn(),
      execute: jest.fn(),
      executeAsync: jest.fn(() => "token"),
    }));
    return (
      <div ref={ref as React.RefObject<HTMLDivElement>} data-test="recaptcha" />
    );
  }),
}));

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
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

// Mock the config module
jest.mock("../../utils/config/config", () =>
  // Return the actual implementation but with our mock for getConfigOrThrow
  ({
    // This is the key fix - handle the case when no key is provided
    getConfigOrThrow: jest.fn((key) => {
      // Create a mapping of all config values
      const configValues = {
        CHECKOUT_API_TIMEOUT: 10000,
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

const mockGetSessionItemNoAuth = (item: SessionItems) => {
  switch (item) {
    case "paymentInfo":
      return paymentInfo;
    case "rptId":
      return rptId;
    case "useremail":
      return "mail@mail.it";
    case "paymentMethod":
      return paymentMethod;
    case "orderId":
      return "orderId";
    case "correlationId":
      return "correlationId";
    case "sessionPayment":
      return sessionPayment;
    case "transaction":
      return transaction;
    default:
      return undefined;
  }
};

const getItemLocalStorage = jest.fn();

const localStorageMock = {
  getItem: getItemLocalStorage,
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
// eslint-disable-next-line functional/immutable-data
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("PaymentChoicePage guest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // (localStorageMock.getItem as jest.Mock).mockReturnValue("true");
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItemNoAuth);
    (
      apiPaymentEcommerceClient.getAllPaymentMethods as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: createSuccessGetPaymentMethodsV1,
        },
      })
    );
    (apiPaymentEcommerceClientV2.newTransaction as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: transaction,
        },
      })
    );
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
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
  });

  test("go back to history by 1 step when back button is clicked", async () => {
    (getItemLocalStorage as jest.Mock).mockReturnValue("false");
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      fireEvent.click(screen.getByText("paymentChoicePage.button"));
      expect(navigate).toHaveBeenCalledWith(-1);
    });
  });

  test("select credit card and navigate to inserisci-dati-carta", async () => {
    (getItemLocalStorage as jest.Mock).mockReturnValue("false");
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        screen.getByText(
          createSuccessGetPaymentMethodsV1.paymentMethods![0].description
        )
      );
    });
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.paymentMethodInfo,
      {
        title: createSuccessGetPaymentMethodsV1.paymentMethods![0].description,
        asset: createSuccessGetPaymentMethodsV1.paymentMethods![0].asset,
      }
    );
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentMethod, {
      paymentMethodId: createSuccessGetPaymentMethodsV1.paymentMethods![0].id,
      paymentTypeCode:
        createSuccessGetPaymentMethodsV1.paymentMethods![0].paymentTypeCode,
    });
    expect(navigate).toHaveBeenCalledWith("/inserisci-carta");
  });

  test("select apm and navigate to riepilogo-pagamento", async () => {
    (getItemLocalStorage as jest.Mock).mockReturnValue("false");
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        screen.getByText(
          createSuccessGetPaymentMethodsV1.paymentMethods![1].description
        )
      );
    });
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.paymentMethodInfo,
      {
        title: createSuccessGetPaymentMethodsV1.paymentMethods![1].description,
        asset: createSuccessGetPaymentMethodsV1.paymentMethods![1].asset,
      }
    );
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentMethod, {
      paymentMethodId: createSuccessGetPaymentMethodsV1.paymentMethods![1].id,
      paymentTypeCode:
        createSuccessGetPaymentMethodsV1.paymentMethods![1].paymentTypeCode,
    });
    expect(navigate).toHaveBeenCalledWith("/riepilogo-pagamento");
  });

  test("select apm and navigate to scelta-psp with feature flag enabled", async () => {
    (getItemLocalStorage as jest.Mock).mockReturnValue("true");
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        screen.getByText(
          createSuccessGetPaymentMethodsV1.paymentMethods![1].description
        )
      );
    });
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.paymentMethodInfo,
      {
        title: createSuccessGetPaymentMethodsV1.paymentMethods![1].description,
        asset: createSuccessGetPaymentMethodsV1.paymentMethods![1].asset,
      }
    );
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentMethod, {
      paymentMethodId: createSuccessGetPaymentMethodsV1.paymentMethods![1].id,
      paymentTypeCode:
        createSuccessGetPaymentMethodsV1.paymentMethods![1].paymentTypeCode,
    });
    expect(navigate).toHaveBeenCalledWith("/lista-psp");
  });
});

const mockGetSessionItemAuthenticated = (item: SessionItems) => {
  switch (item) {
    case "authToken":
      return "authToken";
    case "paymentInfo":
      return paymentInfo;
    case "rptId":
      return rptId;
    case "useremail":
      return "mail@mail.it";
    case "paymentMethod":
      return paymentMethod;
    case "orderId":
      return "orderId";
    case "correlationId":
      return "correlationId";
    case "sessionPayment":
      return sessionPayment;
    case "transaction":
      return transaction;
    default:
      return undefined;
  }
};

describe("PaymentChoicePage authenticated", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSessionItem as jest.Mock).mockImplementation(
      mockGetSessionItemAuthenticated
    );
    (
      apiPaymentEcommerceClientV3.getAllPaymentMethodsV3 as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: createSuccessGetPaymentMethodsV3,
        },
      })
    );
    (apiPaymentEcommerceClientV3.newTransactionV3 as jest.Mock).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: transaction,
        },
      })
    );
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
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
  });

  test("go back to history by 1 step when back button is clicked (authenticated flow)", async () => {
    (getItemLocalStorage as jest.Mock).mockReturnValue("false");

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          createSuccessGetPaymentMethodsV3.paymentMethods![1].description
        )
      ).toBeVisible();

      fireEvent.click(screen.getByText("paymentChoicePage.button"));
      expect(navigate).toHaveBeenCalledWith(-1);
    });
  });

  test("select credit card and navigate to inserisci-dati-carta", async () => {
    (getItemLocalStorage as jest.Mock).mockReturnValue("false");

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        screen.getByText(
          createSuccessGetPaymentMethodsV3.paymentMethods![0].description
        )
      );
    });
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.paymentMethodInfo,
      {
        title: createSuccessGetPaymentMethodsV3.paymentMethods![0].description,
        asset: createSuccessGetPaymentMethodsV3.paymentMethods![0].asset,
      }
    );
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentMethod, {
      paymentMethodId: createSuccessGetPaymentMethodsV3.paymentMethods![0].id,
      paymentTypeCode:
        createSuccessGetPaymentMethodsV3.paymentMethods![0].paymentTypeCode,
    });
    expect(navigate).toHaveBeenCalledWith("/inserisci-carta");
  });

  test("select apm and navigate to riepilogo-pagamento", async () => {
    (getItemLocalStorage as jest.Mock).mockReturnValue("false");

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        screen.getByText(
          createSuccessGetPaymentMethodsV3.paymentMethods![1].description
        )
      );
    });
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.paymentMethodInfo,
      {
        title: createSuccessGetPaymentMethodsV3.paymentMethods![1].description,
        asset: createSuccessGetPaymentMethodsV3.paymentMethods![1].asset,
      }
    );
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentMethod, {
      paymentMethodId: createSuccessGetPaymentMethodsV3.paymentMethods![1].id,
      paymentTypeCode:
        createSuccessGetPaymentMethodsV3.paymentMethods![1].paymentTypeCode,
    });
    expect(navigate).toHaveBeenCalledWith("/riepilogo-pagamento");
  });

  test("select apm and navigate to lista-psp", async () => {
    (getItemLocalStorage as jest.Mock).mockReturnValue("true");

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        screen.getByText(
          createSuccessGetPaymentMethodsV3.paymentMethods![1].description
        )
      );
    });
    expect(setSessionItem).toHaveBeenCalledWith(
      SessionItems.paymentMethodInfo,
      {
        title: createSuccessGetPaymentMethodsV3.paymentMethods![1].description,
        asset: createSuccessGetPaymentMethodsV3.paymentMethods![1].asset,
      }
    );
    expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentMethod, {
      paymentMethodId: createSuccessGetPaymentMethodsV3.paymentMethods![1].id,
      paymentTypeCode:
        createSuccessGetPaymentMethodsV3.paymentMethods![1].paymentTypeCode,
    });
    expect(navigate).toHaveBeenCalledWith("/lista-psp");
  });
});
