import React from "react";
import "@testing-library/jest-dom";
import { queryByAttribute } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import { MemoryRouter } from "react-router-dom";
import { renderWithReduxAndThemeProvider } from "../../../utils/testing/testRenderProviders";
import Footer from "../Footer";

jest.mock("../../../utils/config/config", () => ({
  CHECKOUT_API_RETRY_NUMBERS: 5,
}));

// Mock the translations module
jest.mock("../../../translations/lang", () => ({
  __esModule: true,
  default: { en: {}, it: {} },
  langSelectVisibleOnPages: ["test-page", "another-page"],
}));

// Mock the react-i18next module
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey?: string }) => (
    <span data-testid="mocked-trans">{i18nKey || "no-key"}</span>
  ),
}));

// Mock the LanguageNativeSelect component
jest.mock("../../LanguageMenu/LanguageNativeSelect", () => ({
  __esModule: true,
  default: () => <div data-testid="language-menu">Language Menu</div>,
}));

// Mock the logo image
jest.mock("../../../assets/images/logo-pagopa-spa.svg", () => "pagopaLogo.svg");

const getById = queryByAttribute.bind(null, "id");

describe("Footer", () => {
  it("renders all footer links correctly", () => {
    renderWithReduxAndThemeProvider(
      <MemoryRouter>
        <Footer fixedPages={[]} />
      </MemoryRouter>
    );

    expect(
      screen.getByTitle("mainPage.footer.accessibility")
    ).toBeInTheDocument();
    expect(screen.getByTitle("mainPage.footer.help")).toBeInTheDocument();
    expect(screen.getByTitle("mainPage.footer.privacy")).toBeInTheDocument();
    expect(screen.getByTitle("mainPage.footer.terms")).toBeInTheDocument();
    expect(
      screen.getByTitle("mainPage.footer.platformStatus")
    ).toBeInTheDocument();
    expect(screen.getByTitle("mainPage.footer.pagoPA")).toBeInTheDocument();

    const logo = document.querySelector('img[alt="pagoPA"]');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("alt", "pagoPA");
    expect(logo).toHaveAttribute("aria-hidden", "true");
  });

  it("applies fixed styling when current page is in fixedPages", () => {
    const { baseElement } = renderWithReduxAndThemeProvider(
      <MemoryRouter initialEntries={["/test-page"]}>
        <Footer fixedPages={["test-page"]} />
      </MemoryRouter>
    );

    const footer =
      getById(baseElement, "footer") || baseElement.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("applies non-fixed styling when current page is not in fixedPages", () => {
    const { baseElement } = renderWithReduxAndThemeProvider(
      <MemoryRouter initialEntries={["/non-fixed-page"]}>
        <Footer fixedPages={["test-page"]} />
      </MemoryRouter>
    );

    const footer =
      getById(baseElement, "footer") || baseElement.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("shows language selector when conditions are met", () => {
    renderWithReduxAndThemeProvider(
      <MemoryRouter initialEntries={["/test-page"]}>
        <Footer fixedPages={[]} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("language-menu")).toBeInTheDocument();
  });

  it("hides language selector when not on a supported page", () => {
    renderWithReduxAndThemeProvider(
      <MemoryRouter initialEntries={["/unsupported-page"]}>
        <Footer fixedPages={[]} />
      </MemoryRouter>
    );

    expect(screen.queryByTestId("language-menu")).not.toBeInTheDocument();
  });

  it("extracts the correct path from location", () => {
    renderWithReduxAndThemeProvider(
      <MemoryRouter initialEntries={["/parent/test-page"]}>
        <Footer fixedPages={[]} />
      </MemoryRouter>
    );

    expect(screen.getByTestId("language-menu")).toBeInTheDocument();
  });

  it("all links have correct href attributes", () => {
    renderWithReduxAndThemeProvider(
      <MemoryRouter>
        <Footer fixedPages={[]} />
      </MemoryRouter>
    );

    const accessibilityLink = screen.getByTitle(
      "mainPage.footer.accessibility"
    );
    expect(accessibilityLink).toHaveAttribute(
      "href",
      "https://form.agid.gov.it/view/d7e5f000-9858-11f0-932b-b1f629ca861e"
    );
    expect(accessibilityLink).toHaveAttribute("target", "_blank");
    expect(accessibilityLink).toHaveAttribute("rel", "noopener noreferrer");

    const helpLink = screen.getByTitle("mainPage.footer.help");
    expect(helpLink).toHaveAttribute(
      "href",
      "https://www.pagopa.gov.it/it/helpdesk/"
    );

    const privacyLink = screen.getByTitle("mainPage.footer.privacy");
    expect(privacyLink).toHaveAttribute(
      "href",
      "https://checkout.pagopa.it/privacypolicy/it.html#termini-e-condizioni-di-uso"
    );

    const termsLink = screen.getByTitle("mainPage.footer.terms");
    expect(termsLink).toHaveAttribute(
      "href",
      "https://checkout.pagopa.it/termini-di-servizio"
    );

    const platformStatus = screen.getByTitle("mainPage.footer.platformStatus");
    expect(platformStatus).toHaveAttribute(
      "href",
      "https://status.platform.pagopa.it/"
    );

    const pagopaLink = screen.getByTitle("mainPage.footer.pagoPA");
    expect(pagopaLink).toHaveAttribute("href", "https://www.pagopa.it/it/");
  });

  it("renders separators between links", () => {
    renderWithReduxAndThemeProvider(
      <MemoryRouter>
        <Footer fixedPages={[]} />
      </MemoryRouter>
    );

    const separators = screen.getAllByText("·");
    expect(separators.length).toBeGreaterThanOrEqual(3);

    separators.forEach((separator) => {
      expect(separator).toHaveAttribute("aria-hidden", "true");
    });
  });
});
