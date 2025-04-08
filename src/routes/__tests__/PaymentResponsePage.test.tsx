import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { act } from "@testing-library/react";
import {
  PaymentInfo,
  PaymentMethod,
  PaymentMethodInfo,
} from "features/payment/models/paymentModel";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import {
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import {
  NewTransactionResponse,
  SendPaymentResultOutcomeEnum,
} from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { RptId } from "../../../generated/definitions/payment-ecommerce/RptId";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";
import { ClientIdEnum } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { AmountEuroCents } from "../../../generated/definitions/payment-ecommerce/AmountEuroCents";
import { Bundle } from "../../../generated/definitions/payment-ecommerce-v2/Bundle";
import { SessionPaymentMethodResponse } from "../../../generated/definitions/payment-ecommerce/SessionPaymentMethodResponse";
import PaymentResponsePage from "../../routes/PaymentResponsePage";
// Create a Jest spy for navigation
const navigate = jest.fn();

// Mock react-router-dom so that useNavigate returns our spy function.
// Note: We spread the actual module to preserve its other exports.
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => navigate,
}));

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

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
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

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock the API call with fp-ts TaskEither
jest.mock("../../utils/api/helper", () => ({
  checkLogout: jest.fn(),
}));

jest.mock("../../utils/api/response", () => ({
  callServices: jest.fn(),
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

const transaction: NewTransactionResponse = {
  transactionId: "6f7d9be5fbb94ca29bf55972321783e7",
  status: TransactionStatusEnum.NOTIFIED_OK,
  payments: [
    {
      paymentToken: "1fb8539bdbc94123849a21be8eead8dd",
      rptId: "77777777777302000100000009488" as RptId,
      reason: "TARI/TEFA 2021",
      amount: 12000 as AmountEuroCents,
      transferList: [
        {
          digitalStamp: true,
          paFiscalCode: "00000000000",
          transferAmount: 100 as AmountEuroCents,
          transferCategory: "transfCat0",
        },
      ],
      isAllCCP: false,
    },
  ],
  clientId: ClientIdEnum.CHECKOUT,
  authToken: "token",
  sendPaymentResultOutcome: SendPaymentResultOutcomeEnum.OK,
};

const paymentMethod: PaymentMethod = {
  paymentMethodId: "e7058cac-5e1a-4002-8994-5bab31e9f385",
  paymentTypeCode: "CP",
};

const paymentMethodInfo: PaymentMethodInfo = {
  title: "· · · · 4242",
  body: "12/30",
  icon: "visa",
};

const pspSelected: Bundle = {
  abi: "33111",
  bundleDescription: "Pagamenti con carte",
  bundleName: "Worldline Merchant Services Italia S.p.A.",
  idBrokerPsp: "05963231005",
  idBundle: "98d24e9a-ab8b-48e3-ae84-f0c16c64db3b",
  idChannel: "05963231005_01",
  idPsp: "BNLIITRR",
  onUs: false,
  paymentMethod: "CP",
  taxPayerFee: 95,
  touchpoint: "CHECKOUT",
  pspBusinessName: "Worldline",
};

const paymentInfo: PaymentInfo = {
  amount: 12000 as AmountEuroCents,
  paymentContextCode: "ff368bb048fa4e1daa2a297e1a9fd353",
  rptId: "77777777777302000100000009488" as RptId,
  paFiscalCode: "77777777777",
  paName: "companyName",
  description: "Pagamento di Test",
  dueDate: "2021-07-31",
};

const sessionPayment: SessionPaymentMethodResponse = {
  sessionId: "4c15c2aa-3bd9-45d2-b06e-73525983b87b",
  bin: "42424242",
  lastFourDigits: "4242",
  expiringDate: "12/30",
  brand: "VISA",
};

const mockGetSessionItem = (item: SessionItems) => {
  switch (item) {
    case "paymentMethod":
      return paymentMethod;
    case "paymentMethodInfo":
      return paymentMethodInfo;
    case "pspSelected":
      return pspSelected;
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

describe("PaymentResponsePage", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    navigate.mockClear();
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItem);
  });
  // TEST WITHOUT CART
  test("should show payment ok", () => {
    act(() => {
      renderWithReduxProvider(
        <MemoryRouter>
          <PaymentResponsePage />
        </MemoryRouter>
      );
    });
    // const message = screen.queryByText("errorButton.close");
  });
});
