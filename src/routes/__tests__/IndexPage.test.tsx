import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen } from "@testing-library/react";
import * as router from "react-router";
import fetchMock from "jest-fetch-mock";
import * as E from "fp-ts/Either";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import * as helper from "../../utils/api/helper";
import IndexPage from "../IndexPage";
import { getSessionItem } from "../../utils/storage/sessionStorage";
// mock for navigate
const navigate = jest.fn();

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

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
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

jest.mock("../../utils/storage/sessionStorage", () => {
  const actual = jest.requireActual("../../utils/storage/sessionStorage");
  return {
    __esModule: true,
    ...actual,
    getSessionItem: jest.fn(),
    setSessionItem: jest.fn(),
    clearStorageAndMaintainAuthData: jest.fn(),
  };
});

jest.mock("../../utils/api/client", () => ({
  apiCheckoutFeatureFlags: {
    evaluateFeatureFlags: jest.fn(() =>
      Promise.resolve(
        E.right({
          value: {
            isScheduledMaintenanceBannerEnabled: true,
          },
        })
      )
    ),
  },
}));

describe("IndexPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
    fetchMock.resetMocks();
    fetchMock.mockResponseOnce(JSON.stringify({ data: "mocked data" }));
  });

  test("page go to inquadra qr code", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>
    );
    // Query the input fields by their id
    const goToQrLink = screen.getByText("paymentNoticeChoice.qr.title");

    fireEvent.click(goToQrLink);

    expect(navigate).toHaveBeenCalledWith("/leggi-codice-qr");
  });

  test("page go to inserisci dati avviso", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>
    );

    // Query the input fields by their id
    const goToNoticeLink = screen.getByText("paymentNoticeChoice.form.title");
    fireEvent.click(goToNoticeLink);

    expect(navigate).toHaveBeenCalledWith("/inserisci-dati-avviso");
  });

  test("should remove beforeunload listener", () => {
    const removeSpy = jest.spyOn(window, "removeEventListener");
    renderWithReduxProvider(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>
    );
    expect(removeSpy).toHaveBeenCalledWith(
      "beforeunload",
      expect.any(Function)
    );
  });

  test("should show banner if sessionStorage returns 'true'", async () => {
    (getSessionItem as jest.Mock).mockReturnValue("true");

    renderWithReduxProvider(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>
    );

    const banner = await screen.findByText(
      "ScheduledMaintenanceBanner.titleKey"
    );
    expect(banner).toBeInTheDocument();
  });

  test("should NOT show banner if sessionStorage returns 'false'", () => {
    (getSessionItem as jest.Mock).mockReturnValue("false");

    renderWithReduxProvider(
      <MemoryRouter>
        <IndexPage />
      </MemoryRouter>
    );

    expect(
      screen.queryByText("ScheduledMaintenanceBanner.titleKey")
    ).not.toBeInTheDocument();
  });
});
