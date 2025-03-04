import React from "react";
import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import { fireEvent, screen } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { getSessionItem } from "../../utils/storage/sessionStorage";
import AuthCallback from "../AuthCallbackPage";
import { authentication, proceedToLogin } from "../../utils/api/helper";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("react-google-recaptcha", () => ({
  __esModule: true,
  default: React.forwardRef((_, ref) => (
    <div ref={ref as React.RefObject<HTMLDivElement>} data-test="recaptcha" />
  )),
}));

jest.mock("./../../utils/api/helper", () => ({
  proceedToLogin: jest.fn(),
  authentication: jest.fn(),
}));

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  getAndClearSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(),
  SessionItems: {
    authToken: "authToken",
    loginOriginPage: "loginOriginPage",
    enableAuthentication: "enableAuthentication",
  },
}));

jest.mock("../../utils/eventListeners", () => ({
  onBrowserBackEvent: jest.fn(),
  onBrowserUnload: jest.fn(),
}));

describe("AuthCallback", () => {
  beforeEach(() => {
    (getSessionItem as jest.Mock).mockReturnValue(true);
  });

  it("renders loading state initially", () => {
    render(
      <MemoryRouter>
        <AuthCallback />{" "}
      </MemoryRouter>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("Calls authentication on mount", async () => {
    (authentication as jest.Mock).mockImplementation(({ onResponse }) => {
      onResponse("fakeAuthToken");
    });

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(authentication).toHaveBeenCalled();
    });
  });

  test("Shows error screen if authentication fails", async () => {
    (authentication as jest.Mock).mockImplementation(({ onError }) => {
      onError();
    });

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/authCallbackPage.title/i)).toBeInTheDocument();
    });
  });

  test("Retry button is visible when feature flag is enabled", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(true);
    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });
  });

  test("Clicking retry button triggers login", async () => {
    (getSessionItem as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter>
        <AuthCallback />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/retry/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/retry/i));
    expect(proceedToLogin).toHaveBeenCalled();
  });
});
