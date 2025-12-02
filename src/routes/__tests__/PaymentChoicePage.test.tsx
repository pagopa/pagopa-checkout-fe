/* eslint-disable sonarjs/no-identical-functions */

import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import * as router from "react-router";
import * as E from "fp-ts/Either";
import { useAppSelector } from "../../redux/hooks/hooks";

// Mock @mui/material styled system
jest.mock("@mui/material/styles", () => ({
  ...jest.requireActual("@mui/material/styles"),
  styled: jest.fn(() => (component: any) => component),
  useTheme: jest.fn(() => ({})),
  ThemeProvider: ({ children }: any) => children,
}));

jest.mock("../../redux/hooks/hooks", () => {
  const actual = jest.requireActual("../../redux/hooks/hooks");

  return {
    ...actual,
    useAppSelector: jest.fn((selector: any) => {
      if (selector.name === "getLoggedUser") {
        return { userInfo: { id: "1", name: "Mario" } };
      }
      return selector();
    }),
  };
});

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
  apiWalletEcommerceClient,
} from "../../utils/api/client";
import { mixpanel } from "../../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
  MixpanelFlow,
} from "../../utils/mixpanel/mixpanelEvents";
import { getWalletInstruments } from "../../utils/api/helper";
import {
  calculateFeeResponse,
  createSuccessGetPaymentMethodsV1,
  createSuccessGetPaymentMethodsV3,
  createSuccessGetWallets,
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

// Mock the paymentMethodsHelper
jest.mock("../../utils/paymentMethods/paymentMethodsHelper", () => ({
  getMethodDescriptionForCurrentLanguage: jest.fn((method) => {
    // return "Carte" for the test credit card method to match test expectations
    if (
      (typeof method.description === "string" &&
        method.description === "Carte") ||
      (typeof method.description === "object" &&
        (method.description.it === "Carte" ||
          method.description.IT === "Carte"))
    ) {
      return "Carte";
    }
    // return "Paga con Postepay" for the test apm method to match test expectations
    if (
      (typeof method.description === "string" &&
        method.description === "Paga con Postepay") ||
      (typeof method.description === "object" &&
        (method.description.it === "Paga con Postepay" ||
          method.description.IT === "Paga con Postepay"))
    ) {
      return "Paga con Postepay";
    }
    if (typeof method.description === "string") {
      return method.description;
    }
    if (typeof method.description === "object" && method.description?.it) {
      return method.description.it;
    }
    return "Unknown";
  }),
  getMethodNameForCurrentLanguage: jest.fn((method) => {
    if (typeof method.name === "string") {
      return method.name;
    }
    if (typeof method.name === "object" && method.name?.it) {
      return method.name.it;
    }
    return "Unknown";
  }),
}));

// Create a Jest spy for navigation
const navigate = jest.fn();

jest.mock("../../utils/api/client", () => ({
  apiWalletEcommerceClient: {
    getCheckoutPaymentWalletsByIdUser: jest.fn(),
  },
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
  apiCheckoutFeatureFlags: {
    evaluateFeatureFlags: jest.fn(() =>
      Promise.resolve(
        E.right({
          value: {
            isPaymentMethodsHandlerEnabled: false,
          },
        })
      )
    ),
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

jest.mock("../../utils/mixpanel/mixpanelHelperInit", () => ({
  mixpanel: {
    track: jest.fn(),
  },
}));

jest.mock("../../utils/mixpanel/mixpanelTracker", () => ({
  getFlowFromSessionStorage: jest.fn(() => "cart"),
  getPaymentInfoFromSessionStorage: jest.fn(() => paymentInfo),
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

// Mock PaymentChoice components
jest.mock(
  "../../features/payment/components/PaymentChoice/PaymentMethod",
  () => {
    const MethodComponentList = ({ methods, onClick }: any) => (
      <div data-testid="method-component-list">
        {methods.map((method: any) => (
          <button
            key={method.id}
            onClick={() => onClick(method)}
            data-testid={`payment-method-${method.id}`}
          >
            {typeof method.description === "string"
              ? method.description
              : typeof method.description === "object" &&
                (method.description.it || method.description.IT)
              ? method.description.it || method.description.IT
              : "Unknown"}
          </button>
        ))}
      </div>
    );
    const DisabledPaymentMethods = ({ methods }: any) => (
      <div data-testid="disabled-payment-methods">
        {methods.map((method: any) => (
          <div key={method.id} data-testid={`disabled-method-${method.id}`}>
            {typeof method.description === "string"
              ? method.description
              : typeof method.description === "object" &&
                (method.description.it || method.description.IT)
              ? method.description.it || method.description.IT
              : "Unknown"}
          </div>
        ))}
      </div>
    );
    // export both default and named exports to match the real module's structure
    // also export PaymentMethod as default and named to match usage in PaymentChoice
    return {
      __esModule: true,
      default: MethodComponentList,
      MethodComponentList,
      DisabledPaymentMethods,
      PaymentMethod: MethodComponentList,
    };
  }
);

// Mock CheckoutLoader
jest.mock("../../components/PageContent/CheckoutLoader", () => ({
  __esModule: true,
  default: () => <div data-testid="checkout-loader">Loading...</div>,
}));

// Mock modals
jest.mock("../../components/modals/ErrorModal", () => ({
  __esModule: true,
  default: ({ open, children, ...props }: any) =>
    open ? (
      <div data-testid="error-modal" {...props}>
        {children}
      </div>
    ) : null,
}));

jest.mock("../../components/modals/InformationModal", () => ({
  __esModule: true,
  default: ({ open, children, ...props }: any) =>
    open ? (
      <div data-testid="information-modal" {...props}>
        {children}
      </div>
    ) : null,
}));

jest.mock(
  "../../features/payment/components/PaymentChoice/PaymentChoiceFilterDrawer",
  () => ({
    __esModule: true,
    PaymentChoiceFilterDrawer: ({ open, children, ...props }: any) =>
      open ? (
        <div data-testid="payment-choice-drawer" {...props}>
          {children}
        </div>
      ) : null,
  })
);

// Mock theme context provider
jest.mock("../../components/themeContextProvider/themeContextProvider", () => ({
  ThemeContextProvider: ({ children }: any) => children,
  useThemeContext: () => ({ isDark: false, toggleTheme: jest.fn() }),
}));

// Mock PageContainer
jest.mock("../../components/PageContent/PageContainer", () => ({
  __esModule: true,
  default: ({ children, title, description, link }: any) => (
    <div aria-live="polite">
      <div data-testid="title">{title}</div>
      <div data-testid="description">
        {description}
        {link}
      </div>
      {children}
    </div>
  ),
}));

// Mock CancelPayment
jest.mock("../../components/modals/CancelPayment", () => ({
  CancelPayment: ({ open, children, ...props }: any) =>
    open ? (
      <div data-testid="cancel-payment-modal" {...props}>
        {children}
      </div>
    ) : null,
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

// Mock Material UI components that might be used in PaymentChoice
jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  Chip: ({ children, onDelete, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  Typography: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  InputAdornment: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  IconButton: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Stack: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  styled: jest.fn(() => (component: any) => component),
}));
jest.mock("@pagopa/mui-italia", () => ({
  __esModule: true,
  ThemeProvider: ({ children }: any) => children,
  theme: {},
  Illustration: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  ButtonNaked: () => <span>Button</span>,
}));

// Mock Material UI icons
jest.mock("@mui/icons-material", () => ({
  CancelSharp: () => <span>Cancel</span>,
  Search: () => <span>Search</span>,
  FilterList: () => <span>FilterList</span>,
  InfoOutlined: () => <span>InfoOutlined</span>,
}));

// Mock TextFormField component
jest.mock("../../components/TextFormField/TextFormField", () => ({
  __esModule: true,
  default: ({ handleChange, value, id, endAdornment, ...props }: any) => (
    <div>
      <input
        id={id}
        value={value}
        onChange={handleChange}
        data-testid="text-form-field"
        {...props}
      />
      {endAdornment && <div data-testid="end-adornment">{endAdornment}</div>}
    </div>
  ),
}));

// Mock ClickableFieldContainer
jest.mock("../../components/TextFormField/ClickableFieldContainer", () => ({
  __esModule: true,
  default: ({ children, loading, ...props }: any) => {
    if (loading) {
      return <div data-testid="loading-skeleton" />;
    }
    return <div {...props}>{children}</div>;
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
      apiWalletEcommerceClient.getCheckoutPaymentWalletsByIdUser as jest.Mock
    ).mockResolvedValue(
      Promise.resolve({
        right: {
          status: 200,
          value: { wallets: createSuccessGetWallets },
        },
      })
    );

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

  test("filter for string 'cart' and check only carte is present", async () => {
    (getItemLocalStorage as jest.Mock).mockReturnValue("false");
    const result = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Query the input fields by their id
      fireEvent.change(
        result.container.querySelector("#paymentMethodsFilter")!,
        { target: { value: "cart" } }
      );
    });

    expect(
      screen.getByText(
        createSuccessGetPaymentMethodsV1.paymentMethods![0].description
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        createSuccessGetPaymentMethodsV1.paymentMethods![1].description
      )
    ).not.toBeInTheDocument();
  });

  test("filter for string 'cart' and check only carte is present the remove filter and check all payment methods are present", async () => {
    (getItemLocalStorage as jest.Mock).mockReturnValue("false");
    const result = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    await waitFor(() => {
      // Query the input fields by their id
      fireEvent.change(
        result.container.querySelector("#paymentMethodsFilter")!,
        { target: { value: "cart" } }
      );
    });

    expect(
      screen.getByText(
        createSuccessGetPaymentMethodsV1.paymentMethods![0].description
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        createSuccessGetPaymentMethodsV1.paymentMethods![1].description
      )
    ).not.toBeInTheDocument();

    await waitFor(() => {
      // Query the input fields by their id
      fireEvent.click(
        result.container.querySelector("#clearFilterPaymentMethod")!
      );
    });

    expect(
      screen.getByText(
        createSuccessGetPaymentMethodsV1.paymentMethods![0].description
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByText(
        createSuccessGetPaymentMethodsV1.paymentMethods![1].description
      )
    ).toBeInTheDocument();
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
      apiWalletEcommerceClient.getCheckoutPaymentWalletsByIdUser as jest.Mock
    ).mockResolvedValue(
      Promise.resolve({
        right: {
          status: 200,
          value: { wallets: createSuccessGetWallets },
        },
      })
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

  test("should track mixpanel screen view on mount", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mixpanel.track).toHaveBeenCalledWith(
        MixpanelEventsId.CHK_PAYMENT_METHOD_SELECTION,
        {
          EVENT_ID: MixpanelEventsId.CHK_PAYMENT_METHOD_SELECTION,
          EVENT_CATEGORY: MixpanelEventCategory.UX,
          EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
          flow: MixpanelFlow.CART,
          organization_name: "companyName",
          organization_fiscal_code: "77777777777",
          amount: 12000,
          expiration_date: "2021-07-31",
        }
      );
    });
  });

  test("PaymentChoicePage displays the list of wallets", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const visaDiv = screen.getByTitle("VISA •••• 1234");
      expect(visaDiv).toBeInTheDocument();
      const emailDiv = screen.getByTitle("test***@***test.it");
      expect(emailDiv).toBeInTheDocument();
    });

    screen.debug();
  });

  test("Select wallet and navigate to riepilogo-pagamento", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const visaDiv = screen.getByTitle("VISA •••• 1234");
      expect(visaDiv).toBeInTheDocument();
    });

    await waitFor(() => {
      fireEvent.click(screen.getByTitle("VISA •••• 1234"));
    });

    expect(navigate).toHaveBeenCalledWith("/lista-psp");
  });

  test("PaymentChoicePage not displays the list of wallets", async () => {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) => {
      if (selector.name === "getLoggedUser") {
        return { userInfo: null }; // 👈 invece di null
      }
      return selector();
    });
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      const visaDiv = screen.queryByTitle("VISA •••• 1234");
      expect(visaDiv).not.toBeInTheDocument();
      const emailDiv = screen.queryByTitle("test***@***test.it");
      expect(emailDiv).not.toBeInTheDocument();
    });

    screen.debug();
  });

  it("should call onResponse with wallets when API returns 200", async () => {
    const onResponse = jest.fn();
    const onError = jest.fn();

    (
      apiWalletEcommerceClient.getCheckoutPaymentWalletsByIdUser as jest.Mock
    ).mockResolvedValue({
      right: {
        status: 200,
        value: { wallets: createSuccessGetWallets },
      },
    });

    await getWalletInstruments(onError, onResponse);

    expect(onResponse).toHaveBeenCalledWith(createSuccessGetWallets);
    expect(onError).not.toHaveBeenCalled();
  });
});
