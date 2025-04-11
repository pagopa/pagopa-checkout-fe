import React from "react";
import "@testing-library/jest-dom";
import { fireEvent, queryByAttribute, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { getSessionItem } from "../../../utils/storage/sessionStorage";
import {
  logoutUser,
  proceedToLogin,
  retrieveUserInfo,
} from "../../../utils/api/helper";
import LoginHeader from "../LoginHeader";
import "jest-location-mock";
import { UserInfoResponse } from "../../../../generated/definitions/checkout-auth-service-v1/UserInfoResponse";
import { renderWithReduxProvider } from "../../../utils/testing/testRenderProviders";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Simple mock translation function
      const translations: Record<string, string> = {
        "mainPage.header.logout": "Esci",
        "mainPage.footer.pagoPA": "PagoPA S.p.A.",
        "ariaLabels.assistance": "Assistenza",
      };
      return translations[key] || key;
    },
  }),
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

jest.mock("../../../utils/api/helper", () => ({
  proceedToLogin: jest.fn(),
  retrieveUserInfo: jest.fn(),
  logoutUser: jest.fn(),
}));

jest.mock("../../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  clearSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(),
  SessionItems: {
    paymentInfo: "paymentInfo",
    noticeInfo: "rptId",
    useremail: "useremail",
    enableAuthentication: "enableAuthentication",
    paymentMethod: "paymentMethod",
    pspSelected: "pspSelected",
    sessionToken: "sessionToken",
    cart: "cart",
    transaction: "transaction",
    sessionPaymentMethod: "sessionPayment",
    paymentMethodInfo: "paymentMethodInfo",
    orderId: "orderId",
    correlationId: "correlationId",
    cartClientId: "cartClientId",
    loginOriginPage: "loginOriginPage",
    authToken: "authToken",
  },
}));

jest.mock("../../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
}));

const getById = queryByAttribute.bind(null, "id");

describe("LoginHeader", () => {
  it("Renders loading header", () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <LoginHeader />
      </MemoryRouter>
    );

    expect(screen.getByTitle(/Accedi/i)).toBeInTheDocument();
  });

  it("Call login api after button click", async () => {
    const redirectUrl = "http://checkout-login/";
    (proceedToLogin as jest.Mock).mockImplementation(({ onResponse }) => {
      onResponse(redirectUrl);
    });
    renderWithReduxProvider(
      <MemoryRouter>
        <LoginHeader />
      </MemoryRouter>
    );
    await waitFor(() => {
      const loginButton = screen.getByTitle(/Accedi/i);
      expect(loginButton).toBeInTheDocument();
      fireEvent.click(loginButton);
      expect(proceedToLogin).toHaveBeenCalled();
      expect(location.href).toBe(redirectUrl);
    });
  });

  it("Shows error modal if proceedToLogin fails", async () => {
    (proceedToLogin as jest.Mock).mockImplementation(({ onError }) => {
      onError("Error on get login");
    });
    const { baseElement } = renderWithReduxProvider(
      <MemoryRouter>
        <LoginHeader />
      </MemoryRouter>
    );
    await waitFor(() => {
      const loginButton = screen.getByTitle(/Accedi/i);
      expect(loginButton).toBeInTheDocument();
      fireEvent.click(loginButton);
      expect(proceedToLogin).toHaveBeenCalled();
      expect(
        getById(baseElement, "idTitleErrorModalPaymentCheckPage")
      ).toBeInTheDocument();
    });
  });

  it("Shows name-surname of logged user", async () => {
    const userInfo: UserInfoResponse = {
      familyName: "Rossi",
      name: "Mario",
    };
    (getSessionItem as jest.Mock).mockReturnValue(true);
    (retrieveUserInfo as jest.Mock).mockImplementation(({ onResponse }) => {
      onResponse(userInfo);
    });
    renderWithReduxProvider(
      <MemoryRouter>
        <LoginHeader />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(retrieveUserInfo).toHaveBeenCalled();
      expect(
        screen.getByText(`${userInfo.name} ${userInfo.familyName}`)
      ).toBeInTheDocument();
    });
  });

  it("Logout user for transaction not activated yet", async () => {
    const userInfo: UserInfoResponse = {
      familyName: "Rossi",
      name: "Mario",
    };
    (getSessionItem as jest.Mock).mockImplementation((item) => {
      switch (item) {
        case "authToken":
          return "authToken";
        case "transaction":
          return undefined; // no transaction activated, transaction in session storage is null
        default:
          return undefined;
      }
    });
    (retrieveUserInfo as jest.Mock).mockImplementation(({ onResponse }) => {
      onResponse(userInfo);
    });
    (logoutUser as jest.Mock).mockImplementation(({ onResponse }) => {
      onResponse();
    });
    const { baseElement } = renderWithReduxProvider(
      <MemoryRouter>
        <LoginHeader />
      </MemoryRouter>
    );
    await new Promise((r) => setTimeout(r, 250));
    expect(retrieveUserInfo).toHaveBeenCalled();
    const userButton = screen.getByText(
      `${userInfo.name} ${userInfo.familyName}`
    );
    expect(userButton).toBeVisible();
    fireEvent.click(userButton);
    const logoutButton = screen.getByTestId("LogoutIcon");
    expect(logoutButton).toBeVisible();
    fireEvent.click(logoutButton);
    await new Promise((r) => setTimeout(r, 250));
    expect(screen.getByText("userSession.logoutModal.title")).toBeVisible();
    expect(screen.getByText("userSession.logoutModal.body")).toBeVisible();
    const logoutConfirmButton = getById(
      baseElement,
      "logoutModalConfirmButton"
    );
    if (!logoutConfirmButton) {
      throw Error("Cannot find logout confirm button");
    }
    expect(logoutConfirmButton).toBeVisible();
    fireEvent.click(logoutConfirmButton);
    expect(logoutUser).toHaveBeenCalled();
  });
});
