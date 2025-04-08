import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import {
  PaymentInfo,
  PaymentMethod,
  PaymentMethodInfo,
} from "features/payment/models/paymentModel";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import PaymentCheckPage from "../PaymentCheckPage";
import {
  calculateFees,
  cancelPayment,
  checkLogout,
  proceedToPayment,
} from "../../utils/api/helper";
import {
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import { NewTransactionResponse } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { RptId } from "../../../generated/definitions/payment-ecommerce/RptId";
import { TransactionStatusEnum } from "../../../generated/definitions/payment-ecommerce/TransactionStatus";
import { ClientIdEnum } from "../../../generated/definitions/payment-ecommerce/NewTransactionResponse";
import { AmountEuroCents } from "../../../generated/definitions/payment-ecommerce/AmountEuroCents";
import { Bundle } from "../../../generated/definitions/payment-ecommerce-v2/Bundle";
import { SessionPaymentMethodResponse } from "../../../generated/definitions/payment-ecommerce/SessionPaymentMethodResponse";

// Create a Jest spy for navigation
const navigate = jest.fn();

// Mock react-router-dom so that useNavigate returns our spy function.
// Note: We spread the actual module to preserve its other exports.
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => navigate,
}));

jest.mock("../../redux/slices/threshold.ts", () => ({
  selectThreshold: () => ({
    belowThreshold: true,
  }),
}));

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
  calculateFees: jest.fn(),
  cancelPayment: jest.fn(),
  proceedToPayment: jest.fn(),
  checkLogout: jest.fn(),
}));

jest.mock("../../utils/config/config", () => ({
  getConfigOrThrow: jest.fn(),
}));

const transaction: NewTransactionResponse = {
  transactionId: "6f7d9be5fbb94ca29bf55972321783e7",
  status: TransactionStatusEnum.ACTIVATED,
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

describe("PaymentCheckPage", () => {
  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItem);
  });

  test("test page structure", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const cardEditBUtton = container.querySelector("#cardEdit");
    const pspEditButton = container.querySelector("#pspEdit");
    const cancelPaymentButton = container.querySelector(
      "#paymentCheckPageButtonCancel"
    );
    const submitPaymentButtoon = container.querySelector(
      "#paymentCheckPageButtonPay"
    );
    // Verify buttons and click
    expect(cardEditBUtton).toBeVisible();
    expect(pspEditButton).toBeVisible();
    expect(cancelPaymentButton).toBeVisible();
    expect(submitPaymentButtoon).toBeVisible();
    // expect(cancelPaymentModal).not.toBeInTheDocument();

    expect(calculateFees).toHaveBeenCalledTimes(0);
    expect(checkLogout).toHaveBeenCalledTimes(0);
    expect(cancelPayment).toHaveBeenCalledTimes(0);
    expect(proceedToPayment).toHaveBeenCalledTimes(0);
  });

  test("test edit cardbutton should navigate to payment choice page", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const cardEditBUtton = container.querySelector("#cardEdit");

    // Verify buttons and click
    await waitFor(() => {
      expect(cardEditBUtton).toBeInTheDocument();
      expect(cardEditBUtton).toBeVisible();
      expect(cardEditBUtton).toBeEnabled();
    });
    fireEvent.click(cardEditBUtton!);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/scegli-metodo", {
        replace: true,
      });
    });
  });

  test("test edit psp should change psp selected", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const pspEditButton = container.querySelector("#pspEdit");

    // Verify buttons and click
    await waitFor(() => {
      expect(pspEditButton).toBeInTheDocument();
      expect(pspEditButton).toBeVisible();
      expect(pspEditButton).toBeEnabled();
    });
    fireEvent.click(pspEditButton!);

    await waitFor(() => {
      expect(calculateFees).toHaveBeenCalled();
    });
  });

  test("test submit payment button to call proceedToPayment", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    const submitPaymentButtoon = container.querySelector(
      "#paymentCheckPageButtonPay"
    );

    // Verify buttons and click
    expect(submitPaymentButtoon).toBeInTheDocument();
    expect(submitPaymentButtoon).toBeVisible();
    expect(submitPaymentButtoon).toBeEnabled();

    fireEvent.click(submitPaymentButtoon!);

    await waitFor(() => {
      expect(proceedToPayment).toHaveBeenCalled();
    });
  });

  test("test cancel payment button to show cancel modal and cancel payment on modal submit click", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const cancelPaymentButton = container.querySelector(
      "#paymentCheckPageButtonCancel"
    );

    // Verify buttons and click
    expect(cancelPaymentButton).toBeVisible();

    fireEvent.click(cancelPaymentButton!);

    const cancelModalButtonSubmit = screen.getByText(
      "paymentCheckPage.modal.submitButton"
    );
    expect(cancelModalButtonSubmit).toBeInTheDocument();
    fireEvent.click(cancelModalButtonSubmit);
    await waitFor(() => {
      expect(cancelPayment).toHaveBeenCalled();
    });
  });

  test("test cancel payment button to show cancel modal and hide on cancel modal click", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentCheckPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const cancelPaymentButton = container.querySelector(
      "#paymentCheckPageButtonCancel"
    );
    // Verify buttons and click
    expect(cancelPaymentButton).toBeVisible();

    fireEvent.click(cancelPaymentButton!);

    const cancelModalButtonCancel = screen.getByText(
      "paymentCheckPage.modal.cancelButton"
    );
    expect(cancelModalButtonCancel).toBeInTheDocument();

    fireEvent.click(cancelModalButtonCancel);
    expect(cancelModalButtonCancel).not.toBeVisible();
  });
});
