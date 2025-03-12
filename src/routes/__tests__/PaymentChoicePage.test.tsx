import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { waitFor } from "@testing-library/react";
import { getPaymentMethodsMock } from "../../utils/testUtils";
import { getSessionItem } from "../../utils/storage/sessionStorage";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import PaymentChoicePage from "../../routes/PaymentChoicePage";
import { getPaymentInstruments } from "../../utils/api/helper";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../utils/storage/sessionStorage", () => ({
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
  getReCaptchaKey: jest.fn(),
  SessionItems: {
    authToken: "authToken",
    loginOriginPage: "loginOriginPage",
    useremail: "useremail",
  },
}));

jest.mock("../../utils/api/helper", () => ({
  getPaymentInstruments: jest.fn(),
}));

describe("PaymentChoicePage", () => {
  beforeEach(() => {
    (getSessionItem as jest.Mock).mockReturnValue(true);
  });

  test("Load payment methods successfully", async () => {
    (getPaymentInstruments as jest.Mock).mockImplementation(
      ({ onResponse }) => {
        onResponse(getPaymentMethodsMock());
      }
    );
    renderWithReduxProvider(
      <MemoryRouter>
        <PaymentChoicePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getPaymentInstruments).toHaveBeenCalled();
    });
  });
});
