import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { act, fireEvent, screen } from "@testing-library/react";
import * as router from "react-router";
import {
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import PaymentChoicePage from "../../routes/PaymentChoicePage";
import { getPaymentInstruments } from "../../utils/api/helper";
import { createSuccessGetPaymentMethods, paymentInfo } from "./_model";
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

// Mock the API call with fp-ts TaskEither
jest.mock("../../utils/api/helper", () => ({
  getPaymentInstruments: jest.fn(),
}));

// Mock storage utilities (and return an empty object if needed)
jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(),
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

const mockGetSessionItem = (item: SessionItems) => {
  switch (item) {
    case "paymentInfo":
      return paymentInfo;
    default:
      return undefined;
  }
};

describe("PaymentChoicePage", () => {
  beforeEach(() => {
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItem);
    (getPaymentInstruments as jest.Mock).mockImplementation(
      () => createSuccessGetPaymentMethods
    );
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
  });

  test.skip("test back", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );
    act(() => {
      // Query the input fields by their id
      const back = screen.getByText("paymentChoicePage.button");
      expect(back).toBeEnabled();
      fireEvent.click(back);
    });
    expect(navigate).toHaveBeenCalledWith(-1);
  });
});
