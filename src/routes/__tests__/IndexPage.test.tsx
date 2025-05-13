import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen } from "@testing-library/react";
import * as router from "react-router";
import { renderWithReduxProvider } from "../../utils/testing/testRenderProviders";
import IndexPage from "../IndexPage";
// mock for navigate
const navigate = jest.fn();

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

// Mock storage utilities (and return an empty object if needed)
jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  clearStorageAndMaintainAuthData: jest.fn(),
  SessionItems: {
    authToken: "authToken",
  },
}));

jest.mock("../../utils/eventListeners", () => ({
  onBrowserUnload: jest.fn(),
}));

describe("IndexPage", () => {
  beforeEach(() => {
    jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
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
});
