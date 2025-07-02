import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { act, fireEvent, screen } from "@testing-library/react";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import fetchMock from "jest-fetch-mock";
import * as helper from "../../utils/api/helper";
import PaymentEmailPage from "../PaymentEmailPage";
import { mixpanel } from "../../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelDataEntryType,
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
  MixpanelFlow,
} from "../../utils/mixpanel/mixpanelEvents";
import { paymentInfo } from "./_model";

jest.mock("../../utils/config/config", () =>
  ({
    getConfigOrThrow: jest.fn((key) => {
      const configValues = {
        CHECKOUT_API_TIMEOUT: 1000,
      } as any;
      if (key === undefined) {
        return configValues;
      }
      return configValues[key] || "";
    }),
    isTestEnv: jest.fn(() => false),
    isDevEnv: jest.fn(() => false),
    isProdEnv: jest.fn(() => true),
  })
);

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

// Create a Jest spy for navigation
const navigate = jest.fn();

// Mock react-router-dom so that useNavigate returns our spy function.
// Note: We spread the actual module to preserve its other exports.

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  SessionItems: {
    paymentInfo: "paymentInfo",
    useremail: "useremail",
    cart: "cart",
  },
}));

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
  removeEventListener: jest.fn(),
}));

jest.mock("../../utils/mixpanel/mixpanelHelperInit", () => ({
  mixpanel: {
    track: jest.fn(),
  },
}));

jest.mock("../../utils/mixpanel/mixpanelTracker", () => ({
  getDataEntryTypeFromSessionStorage: jest.fn(() => "manual"),
  getFlowFromSessionStorage: jest.fn(() => "cart"),
  getPaymentInfoFromSessionStorage: jest.fn(() => paymentInfo),
}));

jest
  .spyOn(helper, "evaluateFeatureFlag")
  .mockImplementation(
    (
      _flag: any,
      _onError: any,
      onSuccess: (arg0: { enabled: boolean }) => void
    ) => {
      onSuccess({ enabled: true });
      return Promise.resolve();
    }
  );

describe("PaymentEmailPage", () => {
  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
        fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ data: "mocked data" }));
  });
  test("test fill email", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentEmailPage />
      </MemoryRouter>
    );
    // Query the input fields by their id
    const email = container.querySelector("#email");
    const confirmEmail = container.querySelector("#confirmEmail");
    await act(async () => {
      // Populate the form fields
      fireEvent.change(email!, {
        target: { value: "gianluca.ciuffa@pagopa.it" },
      });
      fireEvent.change(confirmEmail!, {
        target: { value: "gianluca.ciuffa@pagopa.it" },
      });

      const submit = screen.getByText("paymentEmailPage.formButtons.submit");
      fireEvent.click(submit);
    });
    // const addressDiff = screen.getByText("paymentEmailPage.formErrors.notEqual");
    // expect(addressDiff).toBeVisible();
    expect(navigate).toHaveBeenCalledWith("/scegli-metodo");
  });

  test("test different email", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <PaymentEmailPage />
      </MemoryRouter>
    );
    // Query the input fields by their id
    const email = container.querySelector("#email");
    const confirmEmail = container.querySelector("#confirmEmail");
    // Populate the form fields
    await act(async () => {
      fireEvent.change(email!, {
        target: { value: "gtest1@pagopa.it" },
      });
      fireEvent.change(confirmEmail!, {
        target: { value: "test2@pagopa.it" },
      });
      const event = new KeyboardEvent("keydown", { keyCode: 13 });
      confirmEmail!.dispatchEvent(event);
    });

    const addressDiff = screen.getByText(
      "paymentEmailPage.formErrors.notEqual"
    );
    const submit = screen.getByText("paymentEmailPage.formButtons.submit");
    expect(addressDiff).toBeVisible();
    expect(submit).toBeDisabled();
  });

  test("test back", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentEmailPage />
      </MemoryRouter>
    );
    await act(async () => {
      fireEvent.click(screen.getByText("paymentEmailPage.formButtons.back"));
    });
    expect(navigate).toHaveBeenCalledWith(-1);
  });

  test("should track mixpanel screen view on mount", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentEmailPage />
      </MemoryRouter>
    );

    expect(mixpanel.track).toHaveBeenCalledWith(
      MixpanelEventsId.CHK_PAYMENT_EMAIL_ADDRESS,
      {
        EVENT_ID: MixpanelEventsId.CHK_PAYMENT_EMAIL_ADDRESS,
        EVENT_CATEGORY: MixpanelEventCategory.UX,
        EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
        data_entry: MixpanelDataEntryType.MANUAL,
        flow: MixpanelFlow.CART,
        organization_name: "companyName",
        organization_fiscal_code: "77777777777",
        amount: 12000,
        expiration_date: "2021-07-31",
      }
    );
  });
});
