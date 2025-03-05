import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import LoginHeader from "../LoginHeader";
import { getSessionItem } from "../../../utils/storage/sessionStorage";

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
  beforeEach(() => {
    (getSessionItem as jest.Mock).mockReturnValue(true);
  });

  test("Renders loading header", () => {
    render(
      <MemoryRouter>
        <LoginHeader />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/Accedi/i)).toBeInTheDocument();
  });
});
