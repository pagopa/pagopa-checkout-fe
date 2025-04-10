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
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import PaymentChoicePage from "../../routes/PaymentChoicePage";
import {
  apiPaymentEcommerceClient,
  apiPaymentEcommerceClientV3,
} from "../../utils/api/client";
import {
  createSuccessGetPaymentMethodsV1,
  createSuccessGetPaymentMethodsV3,
  paymentInfo,
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
  apiPaymentEcommerceClientV3: {
    getAllPaymentMethodsV3: jest.fn(),
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
        CHECKOUT_API_TIMEOUT: 1000,
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
    default:
      return undefined;
  }
};

describe("PaymentChoicePage guest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItemNoAuth);
    (
      apiPaymentEcommerceClient.getAllPaymentMethods as jest.Mock
    ).mockReturnValue(
      Promise.resolve({
        right: {
          status: 200,
          value: createSuccessGetPaymentMethodsV1.paymentMethods,
        },
      })
    );
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
  });

  test("go back to history by 1 step when back button is clicked", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    void waitFor(() => {
      fireEvent.click(screen.getByText("paymentChoicePage.button"));
      expect(navigate).toHaveBeenCalledWith(-1);
    });
  });

  test("select credit card and navigate to inserisci-dati-carta", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    void waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        screen.getByText(
          createSuccessGetPaymentMethodsV1.paymentMethods![0].description
        )
      );
      expect(setSessionItem).toHaveBeenCalledWith(
        SessionItems.paymentMethodInfo,
        {
          title:
            createSuccessGetPaymentMethodsV1.paymentMethods![0].description,
          assett: createSuccessGetPaymentMethodsV1.paymentMethods![0].asset,
        }
      );
      expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentMethod, {
        paymentMethodId: createSuccessGetPaymentMethodsV1.paymentMethods![0].id,
        paymentTypeCode:
          createSuccessGetPaymentMethodsV1.paymentMethods![0].paymentTypeCode,
      });
      expect(navigate).toHaveBeenCalledWith("inserisci-carta");
    });
  });

  test("select apm and navigate to riepilogo-pagamento", () => {
    /* const localStorageMock = {
      getItem: jest.fn().mockReturnValue("true"),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    // eslint-disable-next-line functional/immutable-data
    Object.defineProperty(window, "localStorage", { value: localStorageMock }); */

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    void waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        screen.getByText(
          createSuccessGetPaymentMethodsV1.paymentMethods![1].description
        )
      );
      expect(setSessionItem).toHaveBeenCalledWith(
        SessionItems.paymentMethodInfo,
        {
          title:
            createSuccessGetPaymentMethodsV1.paymentMethods![1].description,
          assett: createSuccessGetPaymentMethodsV1.paymentMethods![1].asset,
        }
      );
      expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentMethod, {
        paymentMethodId: createSuccessGetPaymentMethodsV1.paymentMethods![1].id,
        paymentTypeCode:
          createSuccessGetPaymentMethodsV1.paymentMethods![1].paymentTypeCode,
      });
      expect(navigate).toHaveBeenCalledWith("riepilogo-pagamento");
    });
  });
});

const mockGetSessionItemAuthenticated = (item: SessionItems) => {
  switch (item) {
    case "paymentInfo":
      return paymentInfo;
    case "authToken":
      return "authToken";
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
          value: createSuccessGetPaymentMethodsV3.paymentMethods,
        },
      })
    );
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
  });

  test("go back to history by 1 step when back button is clicked (authenticated flow)", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    void waitFor(() => {
      fireEvent.click(screen.getByText("paymentChoicePage.button"));
      expect(navigate).toHaveBeenCalledWith(-1);
    });
  });

  test("select credit card and navigate to inserisci-dati-carta", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    void waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        screen.getByText(
          createSuccessGetPaymentMethodsV3.paymentMethods![0].description
        )
      );
      expect(setSessionItem).toHaveBeenCalledWith(
        SessionItems.paymentMethodInfo,
        {
          title:
            createSuccessGetPaymentMethodsV3.paymentMethods![0].description,
          assett: createSuccessGetPaymentMethodsV3.paymentMethods![0].asset,
        }
      );
      expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentMethod, {
        paymentMethodId: createSuccessGetPaymentMethodsV3.paymentMethods![0].id,
        paymentTypeCode:
          createSuccessGetPaymentMethodsV3.paymentMethods![0].paymentTypeCode,
      });
      expect(navigate).toHaveBeenCalledWith("inserisci-carta");
    });
  });

  test("select apm and navigate to riepilogo-pagamento", () => {
    /* const localStorageMock = {
      getItem: jest.fn().mockReturnValue("true"),
      setItem: jest.fn(),
      clear: jest.fn(),
      removeItem: jest.fn(),
      length: 0,
      key: jest.fn(),
    };
    // eslint-disable-next-line functional/immutable-data
    Object.defineProperty(window, "localStorage", { value: localStorageMock }); */

    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    void waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        screen.getByText(
          createSuccessGetPaymentMethodsV3.paymentMethods![1].description
        )
      );
      expect(setSessionItem).toHaveBeenCalledWith(
        SessionItems.paymentMethodInfo,
        {
          title:
            createSuccessGetPaymentMethodsV3.paymentMethods![1].description,
          assett: createSuccessGetPaymentMethodsV3.paymentMethods![1].asset,
        }
      );
      expect(setSessionItem).toHaveBeenCalledWith(SessionItems.paymentMethod, {
        paymentMethodId: createSuccessGetPaymentMethodsV3.paymentMethods![1].id,
        paymentTypeCode:
          createSuccessGetPaymentMethodsV3.paymentMethods![1].paymentTypeCode,
      });
      expect(navigate).toHaveBeenCalledWith("riepilogo-pagamento");
    });
  });
});
