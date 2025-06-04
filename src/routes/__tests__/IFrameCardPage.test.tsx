import React from "react";
import { MemoryRouter } from "react-router-dom";
import { act, fireEvent, screen } from "@testing-library/react";
import IFrameCardPage from "../../routes/IframeCardPage";
import {
  getReCaptchaKey,
  getSessionItem,
  SessionItems,
} from "../../utils/storage/sessionStorage";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import { npgSessionsFields, retrieveCardData } from "../../utils/api/helper";
import { CreateSessionResponse } from "../../../generated/definitions/payment-ecommerce-v3/CreateSessionResponse";
import { mixpanel } from "../../utils/mixpanel/mixpanelHelperInit";
import {
  MixpanelEventCategory,
  MixpanelEventsId,
  MixpanelEventType,
  MixpanelFlow,
  MixpanelPaymentPhase,
} from "../../utils/mixpanel/mixpanelEvents";
import { paymentInfo, sessionPayment, transaction } from "./_model";

// Create a Jest spy for navigation
const navigate = jest.fn();

// Mock react-router-dom so that useNavigate returns our spy function.
// Note: We spread the actual module to preserve its other exports.
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => navigate,
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
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(),
  SessionItems: {
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

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock the API call with fp-ts TaskEither
jest.mock("../../utils/api/helper", () => ({
  retrieveCardData: jest.fn(),
  npgSessionsFields: jest.fn(),
}));

const mockGetSessionItem = (item: SessionItems) => {
  switch (item) {
    case "transaction":
      return transaction;
    default:
      return undefined;
  }
};

const createSessionResponse: CreateSessionResponse = {
  orderId: "E1744128769418vl8H",
  correlationId: "d515ddfb-b931-4f26-8fde-7122a7a3524f",
  paymentMethodData: {
    paymentMethod: "CARDS",
    form: [
      {
        type: "TEXT",
        class: "CARD_FIELD",
        id: "CARD_NUMBER",
        src: "https://stg-ta.nexigroup.com/phoenix-0.0/v3/?id=CARD_NUMBER&lang=ITA&correlationid=d515ddfb-b931-4f26-8fde-7122a7a3524f&sessionid=d7e2372f-ced3-4d06-8165-fae5cba5e2ff&placeholder=Y",
      },
      {
        type: "TEXT",
        class: "CARD_FIELD",
        id: "EXPIRATION_DATE",
        src: "https://stg-ta.nexigroup.com/phoenix-0.0/v3/?id=EXPIRATION_DATE&lang=ITA&correlationid=d515ddfb-b931-4f26-8fde-7122a7a3524f&sessionid=d7e2372f-ced3-4d06-8165-fae5cba5e2ff&placeholder=Y",
      },
      {
        type: "TEXT",
        class: "CARD_FIELD",
        id: "SECURITY_CODE",
        src: "https://stg-ta.nexigroup.com/phoenix-0.0/v3/?id=SECURITY_CODE&lang=ITA&correlationid=d515ddfb-b931-4f26-8fde-7122a7a3524f&sessionid=d7e2372f-ced3-4d06-8165-fae5cba5e2ff&placeholder=Y",
      },
      {
        type: "TEXT",
        class: "CARD_FIELD",
        id: "CARDHOLDER_NAME",
        src: "https://stg-ta.nexigroup.com/phoenix-0.0/v3/?id=CARDHOLDER_NAME&lang=ITA&correlationid=d515ddfb-b931-4f26-8fde-7122a7a3524f&sessionid=d7e2372f-ced3-4d06-8165-fae5cba5e2ff&placeholder=Y",
      },
    ],
  },
};

describe("IFrameCardPage", () => {
  beforeEach(() => {
    (getSessionItem as jest.Mock).mockImplementation(mockGetSessionItem);
    (getReCaptchaKey as jest.Mock).mockImplementation(() => "recaptchaSiteKey");
    (retrieveCardData as jest.Mock).mockImplementation(() => sessionPayment);
    (npgSessionsFields as jest.Mock).mockImplementation(
      () => createSessionResponse
    );
  });

  test("test back button", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <IFrameCardPage />
      </MemoryRouter>
    );
    await act(async () => {
      const back = screen.getByText("paymentNoticePage.formButtons.cancel");
      fireEvent.click(back);
    });

    expect(navigate).toHaveBeenCalledWith(-1);
  });

  // Cannot retrieve field from npg
  test.skip("test submit button", async () => {
    const { container } = renderWithReduxProvider(
      <MemoryRouter>
        <IFrameCardPage />
      </MemoryRouter>
    );

    act(() => {
      // Query the input fields by their id
      const inputCard = container.querySelector("#CARD_NUMBER");
      const inputExpDate = container.querySelector("#EXPIRATION_DATE");
      const inputCVV = container.querySelector("#SECURITY_CODE");
      const inputHolder = container.querySelector("#CARDHOLDER_NAME");

      if (!inputCard || !inputExpDate || !inputCVV || !inputHolder) {
        throw new Error("Input elements not found");
      }

      // Populate the form fields
      fireEvent.change(inputCard, {
        target: { value: "4242424242424242" },
      });
      fireEvent.change(inputExpDate, {
        target: { value: "1230" },
      });
      fireEvent.change(inputCVV, {
        target: { value: "123" },
      });
      fireEvent.change(inputHolder, {
        target: { value: "MM RR" },
      });
      const submit = screen.getByText("paymentNoticePage.formButtons.submit");
      fireEvent.click(submit);
    });

    expect(navigate).toHaveBeenCalledWith(-1);
  });

  test("should track mixpanel screen view on mount", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <IFrameCardPage />
      </MemoryRouter>
    );

    expect(mixpanel.track).toHaveBeenCalledWith(
      MixpanelEventsId.CHK_PAYMENT_METHOD_DATA_INSERT,
      {
        EVENT_ID: MixpanelEventsId.CHK_PAYMENT_METHOD_DATA_INSERT,
        EVENT_CATEGORY: MixpanelEventCategory.UX,
        EVENT_TYPE: MixpanelEventType.SCREEN_VIEW,
        flow: MixpanelFlow.CART,
        payment_phase: MixpanelPaymentPhase.ATTIVA,
        organization_name: "companyName",
        organization_fiscal_code: "77777777777",
        amount: 12000,
        expiration_date: "2021-07-31",
      }
    );
  });
});
