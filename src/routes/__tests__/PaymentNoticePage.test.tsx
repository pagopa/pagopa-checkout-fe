import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, waitFor, screen, act } from "@testing-library/react";
import * as TE from "fp-ts/TaskEither";
import mixpanel from "mixpanel-browser";
import {
  getSessionItem,
  SessionItems,
  setSessionItem,
} from "../../utils/storage/sessionStorage";
import { getEcommercePaymentInfoTask } from "../../utils/api/helper";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import PaymentNotice from "../PaymentNoticePage";
import { CHK_PAYMENT_NOTICE_MANUAL_ENTRY } from "../../utils/config/mixpanelDefs";
import { paymentInfo, rptId } from "./_model";

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

jest.mock("../../../utils/config/mixpanelDefs", () => ({
  track: jest.fn(),
}));

// Create a Jest spy for navigation
const navigate = jest.fn();

// Mock react-router-dom so that useNavigate returns our spy function.
// Note: We spread the actual module to preserve its other exports.
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => navigate,
}));

// Mock the API call with fp-ts TaskEither
jest.mock("../../utils/api/helper", () => ({
  getEcommercePaymentInfoTask: jest.fn(),
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

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
}));

describe("PaymentNotice", () => {
  beforeEach(() => {
    // Return an object for initial session values (making sure it’s not a boolean)
    (getSessionItem as jest.Mock).mockReturnValue({});
    // Clear previous calls to our spy navigate function before each test
    navigate.mockClear();
  });

  test("When session is expired should redirect to auth expired page (401)", async () => {
    // When getEcommercePaymentInfoTask is invoked, return a failed TaskEither.
    (getEcommercePaymentInfoTask as jest.Mock).mockReturnValue(
      TE.left({
        faultCodeCategory: "SESSION_EXPIRED",
        faultCodeDetail: "Unauthorized",
      })
    );

    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentNotice />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const inputBillCode = container.querySelector("#billCode");
    const inputCf = container.querySelector("#cf");

    if (!inputBillCode || !inputCf) {
      throw new Error("Input elements not found");
    }

    // Populate the form fields
    fireEvent.change(inputBillCode, {
      target: { value: "302016723749670000" },
    });
    fireEvent.change(inputCf, {
      target: { value: "77777777777" },
    });

    // Trigger the form submission. This could be changed to match your button querying method.
    fireEvent.click(screen.getByText(/submit/i));

    // Wait for the API call to resolve and the navigation to occur.
    await waitFor(() => {
      expect(getEcommercePaymentInfoTask).toHaveBeenCalledWith(
        "77777777777302016723749670000",
        "token"
      );
      expect(navigate).toHaveBeenCalledWith("/autenticazione-scaduta");
    });
  });

  test("When verify fails should show error modal", async () => {
    // When getEcommercePaymentInfoTask is invoked, return a failed TaskEither.
    (getEcommercePaymentInfoTask as jest.Mock).mockReturnValue(
      TE.left({
        faultCodeCategory: "PAYMENT_UNAVAILABLE",
        faultCodeDetail: "Fault code detail",
      })
    );

    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentNotice />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const inputBillCode = container.querySelector("#billCode");
    const inputCf = container.querySelector("#cf");

    if (!inputBillCode || !inputCf) {
      throw new Error("Input elements not found");
    }

    act(() => {
      // Populate the form fields
      fireEvent.change(inputBillCode, {
        target: { value: "302016723749670001" },
      });
      fireEvent.change(inputCf, {
        target: { value: "77777777777" },
      });

      // Trigger the form submission. This could be changed to match your button querying method.
      fireEvent.click(screen.getByText(/submit/i));
    });
    // Wait for the API call to resolve and the navigation to occur.
    await waitFor(() => {
      expect(getEcommercePaymentInfoTask).toHaveBeenCalled();
      expect(screen.getByText("PAYMENT_UNAVAILABLE.title")).toBeVisible();
    });
  });

  test("Should call navigate with -1 when click back button", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentNotice />
      </MemoryRouter>
    );

    // Trigger the form submission. This could be changed to match your button querying method.
    fireEvent.click(screen.getByText("paymentNoticePage.formButtons.cancel"));

    // Wait for the API call to resolve and the navigation to occur.
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(-1);
    });
  });

  test("When verify is ok navigate to dati-pagamento", async () => {
    const billCode = rptId.billCode;
    const fiscalCode = rptId.cf;
    // When getEcommercePaymentInfoTask is invoked, return a ok TaskEither.
    (getEcommercePaymentInfoTask as jest.Mock).mockReturnValue(
      TE.of(paymentInfo)
    );

    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentNotice />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const inputBillCode = container.querySelector("#billCode");
    const inputCf = container.querySelector("#cf");

    if (!inputBillCode || !inputCf) {
      throw new Error("Input elements not found");
    }

    // Populate the form fields
    fireEvent.change(inputBillCode, {
      target: { value: billCode },
    });
    fireEvent.change(inputCf, {
      target: { value: fiscalCode },
    });

    // Trigger the form submission. This could be changed to match your button querying method.
    fireEvent.click(screen.getByText(/submit/i));

    // Wait for the API call to resolve and the navigation to occur.
    await waitFor(() => {
      expect(getEcommercePaymentInfoTask).toHaveBeenCalledWith(
        rptId.cf + rptId.billCode,
        "token"
      );
      expect(setSessionItem).toHaveBeenCalledWith(
        SessionItems.paymentInfo,
        paymentInfo
      );
      expect(setSessionItem).toHaveBeenCalledWith(
        SessionItems.noticeInfo,
        rptId
      );
      expect(navigate).toHaveBeenCalledWith("/dati-pagamento", {});
    });
  });

  test("should track CHK_PAYMENT_NOTICE_MANUAL_ENTRY on mount", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentNotice />
      </MemoryRouter>
    );

    expect(mixpanel.track).toHaveBeenCalledWith(
      CHK_PAYMENT_NOTICE_MANUAL_ENTRY.value,
      {
        EVENT_ID: CHK_PAYMENT_NOTICE_MANUAL_ENTRY.value,
      }
    );
  });
});
