import React from "react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, screen, act } from "@testing-library/react";
import { renderWithReduxProvider } from "../../utils/testRenderProviders";
import DonationPageDismissed from "../DonationPageDismissed";
import "jest-location-mock";

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

describe("DonationPageDismissed", () => {
  test("page go to iniziativa donazioni", async () => {
    renderWithReduxProvider(
      <MemoryRouter>
        <DonationPageDismissed />
      </MemoryRouter>
    );
    await act(async () => {
      const dimissCta = screen.getByText("donationPage.dismissCTA");
      fireEvent.click(dimissCta);
    });
    expect(location.href).toBe(
      "https://pagopa.gov.it/it/notizie/2022-12-23-conclusa-iniziativa-donazioni-ucraina.html"
    );
  });
});
