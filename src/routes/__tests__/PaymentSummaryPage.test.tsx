import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { act, fireEvent, screen } from "@testing-library/react";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import PaymentSummaryPage from "../PaymentSummaryPage";
import {
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import { mixpanel } from "../../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelDataEntryType,
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
} from "../../utils/mixpanel/mixpanelEvents";
import { paymentInfo, rptId } from "./_model";

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
  setSessionItem: jest.fn(),
  SessionItems: {
    noticeInfo: "rptId",
    paymentInfo: "paymentInfo",
  },
}));

jest.mock("../../utils/mixpanel/mixpanelHelperInit", () => ({
  mixpanel: { track: jest.fn() },
}));

jest.mock("../../utils/mixpanel/mixpanelTracker", () => ({
  getPaymentInfoFromSessionStorage: jest.fn(() => paymentInfo),
  getDataEntryTypeFromSessionStorage: jest.fn(() => "manual"),
}));

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

describe("PaymentSummaryPage", () => {
  beforeEach(() => {
    // Clear previous calls to our spy navigate function before each test
    // navigate.mockClear();
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItem);
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
  });
  // CANNOT TEST NAVIGATE HERE
  test("click back goes to inserisci dati avviso page", () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentSummaryPage />
      </MemoryRouter>
    );
    act(() => {
      // Query the input fields by their id
      const back = container.querySelector("#paymentSummaryButtonBack");
      const submit = container.querySelector("#paymentSummaryButtonPay");
      expect(back).toBeInTheDocument();
      expect(back).toBeEnabled();
      expect(submit).toBeInTheDocument();
      expect(submit).toBeEnabled();
      fireEvent.click(back!);
    });
    expect(navigate).toHaveBeenCalledWith(-1);
  });
  test("click back goes to inserisci dati avviso page", () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentSummaryPage />
      </MemoryRouter>
    );
    act(() => {
      // Query the input fields by their id
      const back = container.querySelector("#paymentSummaryButtonBack");
      const submit = container.querySelector("#paymentSummaryButtonPay");
      expect(back).toBeInTheDocument();
      expect(back).toBeEnabled();
      expect(submit).toBeInTheDocument();
      expect(submit).toBeEnabled();
      fireEvent.click(submit!);
    });
    expect(navigate).toHaveBeenCalledWith("/inserisci-email");
  });

  test.skip("click info button show modal", () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentSummaryPage />
      </MemoryRouter>
    );
    act(() => {
      // Query the input fields by their id
      const info = container.querySelector("#infoButton");
      expect(info).toBeInTheDocument();
      expect(info).toBeEnabled();
      fireEvent.click(info!);
      const dialogTitle = screen.findByText("paymentSummaryPage.dialog.title");
      expect(dialogTitle).toBeVisible();
    });
  });

  test("tracks page view on mount", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentSummaryPage />
      </MemoryRouter>
    );

    expect(mixpanel.track).toHaveBeenCalledWith(
      MixpanelEventsId.CHK_PAYMENT_SUMMARY_INFO_SCREEN,
      expect.objectContaining({
        EVENT_ID: MixpanelEventsId.CHK_PAYMENT_SUMMARY_INFO_SCREEN,
        EVENT_CATEGORY: MixpanelEventCategory.UX,
        EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
        data_entry: MixpanelDataEntryType.MANUAL,
        organization_name: "companyName",
        organization_fiscal_code: "77777777777",
        amount: 12000,
        expiration_date: "2021-07-31",
      })
    );
  });

  test("click on submit button triggers mixpanel track and navigation", () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentSummaryPage />
      </MemoryRouter>
    );

    const submit = container.querySelector("#paymentSummaryButtonPay");
    expect(submit).toBeInTheDocument();

    fireEvent.click(submit!);

    expect(mixpanel.track).toHaveBeenCalledWith(
      MixpanelEventsId.CHK_PAYMENT_START_FLOW,
      expect.objectContaining({
        EVENT_ID: MixpanelEventsId.CHK_PAYMENT_START_FLOW,
        EVENT_CATEGORY: MixpanelEventCategory.UX,
        EVENT_TYPE: MixpanelEventType.ACTION,
        data_entry: MixpanelDataEntryType.MANUAL,
        organization_name: "companyName",
        organization_fiscal_code: "77777777777",
        amount: 12000,
        expiration_date: "2021-07-31",
      })
    );
    expect(navigate).toHaveBeenCalledWith("/inserisci-email");
  });
});
