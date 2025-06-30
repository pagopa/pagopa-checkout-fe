jest.mock("../../utils/config/config", () => ({
  __esModule: true,
  getConfigOrThrow: jest.fn(() => ({
    CHECKOUT_ENV: "DEV",
    CHECKOUT_API_TIMEOUT: 5000,
    CHECKOUT_PAGOPA_APIM_HOST: "https://mock-host",
    CHECKOUT_API_ECOMMERCE_BASEPATH: "/v1",
    CHECKOUT_API_ECOMMERCE_BASEPATH_V2: "/v2",
    CHECKOUT_API_ECOMMERCE_BASEPATH_V3: "/v3",
    CHECKOUT_API_FEATURE_FLAGS_BASEPATH: "/feature-flags",
    CHECKOUT_API_AUTH_SERVICE_BASEPATH_V1: "/auth-service",
  })),
}));

jest.mock("i18next", () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockReturnThis(),
  t: (key: string) => key,
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
      language: "it",
    },
    initReactI18next: {
      type: "3rdParty",
      init: jest.fn(),
    },
  }),
}));

const MockGuard = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);

import React from "react";
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import fetchMock from "jest-fetch-mock";
import { act } from "react";
import { renderWithReduxAndThemeProvider } from "../../utils/testing/testRenderProviders";
import * as helper from "../../utils/api/helper";
import { App } from "../../App";

// Mock MUI Italia theme
jest.mock("@pagopa/mui-italia", () => ({
  theme: {
    palette: {
      background: { paper: "#fff", default: "#fff" },
      action: { active: "#000000" },
      common: { white: "#ffffff" },
    },
    components: {
      MuiAlert: { styleOverrides: { outlined: {} } },
    },
  },
  darkTheme: {
    palette: {
      background: { paper: "#121212", default: "#121212" },
      action: { active: "#ffffff" },
      common: { white: "#ffffff" },
      text: { primary: "#ffffff", secondary: "#5C6F82" },
    },
    components: {
      MuiAlert: { styleOverrides: { outlined: {} } },
    },
  },
}));

// Mock route components
jest.mock("../../routes/IndexPage", () => () => <div>IndexPage</div>);
jest.mock("../../routes/AuthCallbackPage", () => () => (
  <div>AuthCallbackPage</div>
));
jest.mock("../../routes/AuthExpiredPage", () => () => (
  <div>AuthExpiredPage</div>
));
jest.mock("../../routes/DonationPageDismissed", () => () => (
  <div>DonationPageDismissed</div>
));
jest.mock("../../routes/PaymentQrPage", () => () => <div>PaymentQrPage</div>);
jest.mock("../../routes/PaymentNoticePage", () => () => (
  <div>PaymentNoticePage</div>
));
jest.mock("../../routes/PaymentSummaryPage", () => () => (
  <div>PaymentSummaryPage</div>
));
jest.mock("../../routes/PaymentEmailPage", () => () => (
  <div>PaymentEmailPage</div>
));
jest.mock("../../routes/IframeCardPage", () => () => <div>IframeCardPage</div>);
jest.mock("../../routes/PaymentChoicePage", () => () => (
  <div>PaymentChoicePage</div>
));
jest.mock("../../routes/PaymentPspListPage", () => () => (
  <div>PaymentPspListPage</div>
));
jest.mock("../../routes/PaymentCheckPage", () => () => (
  <div>PaymentCheckPage</div>
));
jest.mock("../../routes/PaymentResponsePage", () => () => (
  <div>PaymentResponsePage</div>
));
jest.mock("../../routes/PaymentResponsePageV2", () => () => (
  <div>PaymentResponsePageV2</div>
));
jest.mock("../../routes/CancelledPage", () => () => <div>CancelledPage</div>);
jest.mock("../../routes/KOPage", () => () => <div>KOPage</div>);
jest.mock("../../routes/SessionExpiredPage", () => () => (
  <div>SessionExpiredPage</div>
));
jest.mock("../../routes/PaymentCartPage", () => () => (
  <div>PaymentCartPage</div>
));
jest.mock("../../routes/GdiCheckPage", () => () => <div>GdiCheckPage</div>);
jest.mock("../../routes/PaymentOutlet", () => ({ children }: any) => (
  <div>{children}</div>
));
jest.mock("../../components/commons/LoginHeader", () => ({
  __esModule: true,
  default: () => <div>Mocked LoginHeader</div>,
}));

// Mock guards
jest.mock("../../components/commons/Guard", () => ({
  __esModule: true,
  default: MockGuard,
}));
jest.mock("../../components/commons/NoticeGuard", () => ({
  __esModule: true,
  default: MockGuard,
}));
jest.mock("../../components/commons/RptidGuard", () => ({
  __esModule: true,
  default: MockGuard,
}));

// Mock helpers
jest
  .spyOn(helper, "evaluateFeatureFlag")
  .mockImplementation((flag, _onError, onSuccess) => {
    if (flag === "enableMaintenance") {
      onSuccess({ enabled: false });
    } else if (flag === "enablePspPage") {
      onSuccess({ enabled: true });
    } else {
      onSuccess({ enabled: true });
    }
    return Promise.resolve();
  });

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    // eslint-disable-next-line functional/immutable-data
    document.title = "";
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ data: "mocked data" }));
    sessionStorage.setItem("enableMaintenance", "false");
  });

  it("renders IndexPage and calls feature flag/mixpanel", async () => {
    await act(async () => {
      renderWithReduxAndThemeProvider(<App />);
    });

    await waitFor(() => {
      expect(screen.getByText(/skipToContent/i)).toBeInTheDocument();
    });

    screen.debug();

    await userEvent.click(screen.getByText("mainPage.main.skipToContent"));

    await waitFor(() => {
      expect(localStorage.getItem("enablePspPage")).toBe("true");
      expect(document.title).toBe("app.title");
    });

    expect((window as any).recaptchaOptions).toEqual({ useRecaptchaNet: true });
  });
});
