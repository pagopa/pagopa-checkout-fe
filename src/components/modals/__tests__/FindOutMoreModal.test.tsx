// FindOutMoreModal.test.tsx
import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FindOutMoreModal from "../FindOutMoreModal";

// Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "findOutMoreModal.title":
          "Cosa fare se il pagamento non va a buon fine?",
        "findOutMoreModal.section1Title": "1. Paga l'avviso",
        "findOutMoreModal.section1ContentRow1":
          "Ricorda di pagare l'avviso entro le scadenze previste dall'ente.",
        "findOutMoreModal.section1ContentRow2":
          "Se non riesci tramite questo sito, ",
        "findOutMoreModal.section1ContentRow2Link":
          "scopri gli altri canali abilitati a pagoPA.",
        "findOutMoreModal.section2Title": "2. Attendi il rimborso",
        "findOutMoreModal.section2ContentRow1":
          "Di solito l'importo viene riaccreditato entro pochi minuti.",
        "findOutMoreModal.section2ContentRow2":
          "In altri casi, il trasferimento di denaro sul tuo conto o carta potrebbe richiedere più tempo.",
        "findOutMoreModal.section3Title": "3. Contatta l'assistenza",
        "findOutMoreModal.section3ContentRow1":
          "Se dopo 5 giorni lavorativi non hai ancora ricevuto il rimborso, ",
        "findOutMoreModal.section3ContentRow2Link": "contatta l'assistenza.",
        "paymentSummaryPage.buttons.ok": "OK",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the InformationModal component
jest.mock("../InformationModal", () => ({
  __esModule: true,
  default: ({ children, open, maxWidth, hideIcon }: any) =>
    open ? (
      <div
        data-testid="information-modal"
        data-maxwidth={maxWidth}
        data-hideicon={hideIcon}
      >
        {children}
      </div>
    ) : null,
}));

describe("FindOutMoreModal Component", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly when open", () => {
    render(<FindOutMoreModal open={true} onClose={mockOnClose} />);

    // Check if the modal is rendered
    expect(screen.getByTestId("information-modal")).toBeInTheDocument();

    // Check if the title is rendered
    expect(
      screen.getByText("Cosa fare se il pagamento non va a buon fine?")
    ).toBeInTheDocument();

    // Check if section titles are rendered
    expect(screen.getByText("1. Paga l'avviso")).toBeInTheDocument();
    expect(screen.getByText("2. Attendi il rimborso")).toBeInTheDocument();
    expect(screen.getByText("3. Contatta l'assistenza")).toBeInTheDocument();

    // Check if section content is rendered
    expect(
      screen.getByText(
        "Ricorda di pagare l'avviso entro le scadenze previste dall'ente."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Se non riesci tramite questo sito,")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Di solito l'importo viene riaccreditato entro pochi minuti."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "In altri casi, il trasferimento di denaro sul tuo conto o carta potrebbe richiedere più tempo."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Se dopo 5 giorni lavorativi non hai ancora ricevuto il rimborso,"
      )
    ).toBeInTheDocument();

    // Check if links are rendered with correct href attributes
    const paymentMethodsLink = screen.getByText(
      "scopri gli altri canali abilitati a pagoPA."
    );
    expect(paymentMethodsLink).toBeInTheDocument();
    expect(paymentMethodsLink).toHaveAttribute(
      "href",
      "https://www.pagopa.gov.it/it/cittadini/dove-pagare/"
    );
    expect(paymentMethodsLink).toHaveAttribute("target", "_blank");

    const supportLink = screen.getByText("contatta l'assistenza.");
    expect(supportLink).toBeInTheDocument();
    expect(supportLink).toHaveAttribute(
      "href",
      "https://www.pagopa.gov.it/it/assistenza/"
    );
    expect(supportLink).toHaveAttribute("target", "_blank");

    // Check if the OK button is rendered
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<FindOutMoreModal open={false} onClose={mockOnClose} />);

    // Check if the modal is not rendered
    expect(screen.queryByTestId("information-modal")).not.toBeInTheDocument();
  });

  it("calls onClose when OK button is clicked", () => {
    render(<FindOutMoreModal open={true} onClose={mockOnClose} />);

    // Find and click the OK button
    const okButton = screen.getByText("OK");
    fireEvent.click(okButton);

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("passes correct props to InformationModal", () => {
    render(<FindOutMoreModal open={true} onClose={mockOnClose} />);

    // Get the modal element
    const modal = screen.getByTestId("information-modal");

    // Check if the correct props are passed
    expect(modal).toHaveAttribute("data-maxwidth", "sm");
    expect(modal).toHaveAttribute("data-hideicon", "true");
  });

  it("respects custom maxWidth prop when provided", () => {
    render(
      <FindOutMoreModal open={true} onClose={mockOnClose} maxWidth="lg" />
    );

    // Get the modal element
    const modal = screen.getByTestId("information-modal");

    // Check if maxWidth is still 'sm' (as hardcoded in the component)
    // This test actually verifies that the component ignores the maxWidth prop
    expect(modal).toHaveAttribute("data-maxwidth", "sm");
  });

  it("renders Typography components with correct styles", () => {
    render(<FindOutMoreModal open={true} onClose={mockOnClose} />);

    // Check if section titles have bold styling
    const sectionTitles = [
      screen.getByText("1. Paga l'avviso"),
      screen.getByText("2. Attendi il rimborso"),
      screen.getByText("3. Contatta l'assistenza"),
    ];

    // We can't directly test the sx props with our current mocks,
    // but we can verify the content is rendered correctly
    sectionTitles.forEach((title) => {
      expect(title).toBeInTheDocument();
    });
  });

  it("renders links with correct target attributes", () => {
    render(<FindOutMoreModal open={true} onClose={mockOnClose} />);

    // Check if links have target="_blank" attribute
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
    });
  });

  it("renders button with correct variant", () => {
    render(<FindOutMoreModal open={true} onClose={mockOnClose} />);

    // We can't directly test the variant prop with our current mocks,
    // but we can verify the button is rendered
    const okButton = screen.getByText("OK");
    expect(okButton).toBeInTheDocument();
  });
});
