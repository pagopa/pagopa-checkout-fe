import React from "react";
import "@testing-library/jest-dom";
import {
  fireEvent,
  queryByAttribute,
  render,
  waitFor,
} from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { proceedToLogin } from "../../../utils/api/helper";
import LoginHeader from "../LoginHeader";
import "jest-location-mock";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
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

jest.mock("../../../redux/hooks/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn().mockImplementation(() => ({
    userInfo: null,
  })),
}));

jest.mock("../../../utils/api/helper", () => ({
  proceedToLogin: jest.fn(),
  retrieveUserInfo: jest.fn(),
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
  test("Renders loading header", () => {
    render(
      <MemoryRouter>
        <LoginHeader />
      </MemoryRouter>
    );

    expect(screen.getByTitle(/Accedi/i)).toBeInTheDocument();
  });

  test("Call login api after button click", async () => {
    const redirectUrl = "http://checkout-login/";
    (proceedToLogin as jest.Mock).mockImplementation(({ onResponse }) => {
      onResponse(redirectUrl);
    });
    render(
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

  test("Shows error modal if proceedToLogin fails", async () => {
    (proceedToLogin as jest.Mock).mockImplementation(({ onError }) => {
      onError("Error on get login");
    });
    const { baseElement } = render(
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
});
