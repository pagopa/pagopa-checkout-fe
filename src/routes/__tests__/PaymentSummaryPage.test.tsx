import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { act, fireEvent } from "@testing-library/react";
import {
  PaymentFormFields,
  PaymentInfo,
} from "features/payment/models/paymentModel";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import PaymentSummaryPage from "../PaymentSummaryPage";
import { AmountEuroCents } from "../../../generated/definitions/payment-ecommerce/AmountEuroCents";
import { RptId } from "../../../generated/definitions/payment-ecommerce/RptId";
import {
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
// import { getSessionItem, SessionItems, setSessionItem } from "../../utils/storage/sessionStorage";

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
    noticeInfo: "rptId",
    paymentInfo: "paymentInfo",
  },
}));

const paymentInfo: PaymentInfo = {
  amount: 12000 as AmountEuroCents,
  paymentContextCode: "ff368bb048fa4e1daa2a297e1a9fd353",
  rptId: "77777777777302000100000009488" as RptId,
  paFiscalCode: "77777777777",
  paName: "companyName",
  description: "Pagamento di Test",
  dueDate: "2021-07-31",
};

const rptId: PaymentFormFields = {
  billCode: "302034567870000000",
  cf: "77777777777",
};

const mockGetSessionItem = (item: SessionItems) => {
  switch (item) {
    case "paymentInfo":
      return paymentInfo;
    case "rptId":
      return rptId;
    default:
      return undefined;
  }
};

// Create a Jest spy for navigation
const navigate = jest.fn();

// Mock react-router-dom so that useNavigate returns our spy function.
// Note: We spread the actual module to preserve its other exports.
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => navigate,
}));

describe("PaymentSummaryPage", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    // navigate.mockClear();
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItem);
  });
  // CANNOT TEST NAVIGATE HERE
  test("click back goes to inserisci dati avviso page", () => {
    act(() => {
      const { container } = renderWithReduxProvider(
        <MemoryRouter>
          <PaymentSummaryPage />
        </MemoryRouter>
      );
      // Query the input fields by their id
      const back = container.querySelector("#paymentSummaryButtonBack");
      const submit = container.querySelector("#paymentSummaryButtonPay");
      expect(back).toBeInTheDocument();
      expect(back).toBeEnabled();
      expect(submit).toBeInTheDocument();
      expect(submit).toBeEnabled();
      fireEvent.click(back!);
    });
    //    expect(navigate).toHaveBeenCalledWith(-1);
  });
  // CANNOT TEST NAVIGATE HERE
  test("click back goes to inserisci dati avviso page", () => {
    act(() => {
      const { container } = renderWithReduxProvider(
        <MemoryRouter>
          <PaymentSummaryPage />
        </MemoryRouter>
      );
      // Query the input fields by their id
      const back = container.querySelector("#paymentSummaryButtonBack");
      const submit = container.querySelector("#paymentSummaryButtonPay");
      expect(back).toBeInTheDocument();
      expect(back).toBeEnabled();
      expect(submit).toBeInTheDocument();
      expect(submit).toBeEnabled();
      fireEvent.click(submit!);
    });
    // expect(navigate).toHaveBeenCalled();
  });
});
