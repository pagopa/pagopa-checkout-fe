import React from "react";
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import LoginHeader from "../LoginHeader";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("react-google-recaptcha", () => ({
  __esModule: true,
  default: React.forwardRef((_, ref) => (
    <div ref={ref as React.RefObject<HTMLDivElement>} data-test="recaptcha" />
  )),
}));

jest.mock("../../../redux/hooks/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
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
    authToken: "authToken",
    loginOriginPage: "loginOriginPage",
  },
}));

jest.mock("../../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
}));

describe("LoginHeader", () => {
  test("Renders loading header", () => {
    render(<LoginHeader />);

    expect(screen.getByLabelText(/Accedi/i)).toBeInTheDocument();
  });
});
