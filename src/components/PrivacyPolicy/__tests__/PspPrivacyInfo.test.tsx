import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DisclaimerField from "../PspPrivacyInfo";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === "paymentCheckPage.disclaimer.psp") {
        return `Proseguendo accetti i <a href='${options.terminiLink}' target='_blank' rel='noopener noreferrer'>Termini e condizioni d'uso</a> e dichiari di aver letto l'<a href='${options.privacyLink}' target='_blank' rel='noopener noreferrer'>informativa Privacy</a> di <b>${options.pspNome}</b>`;
      }
      return key;
    },
  }),
}));

describe("DisclaimerField", () => {
  const defaultProps = {
    pspNome: "PagoPA",
    terminiLink: "https://www.conventionalcommits.org/en/v1.0.0/",
    privacyLink: "https://www.conventionalcommits.org/en/v1.0.0/",
  };

  it("renders HTML message correctly", () => {
    render(<DisclaimerField {...defaultProps} />);

    const paragraph = screen.getByText((content) =>
      content.includes("Proseguendo")
    );
    expect(paragraph).toBeInTheDocument();
    // Verifica che "Termini" e "Privacy" siano nel contenuto
    expect(paragraph.innerHTML).toContain("Termini");
    expect(paragraph.innerHTML).toContain("Privacy");
    expect(paragraph.innerHTML).toContain("PagoPA");
    // Verifica che i link abbiano gli href corretti
    expect(
      paragraph.querySelector(
        "a[href='https://www.conventionalcommits.org/en/v1.0.0/']"
      )
    ).toBeInTheDocument();
    expect(
      paragraph.querySelector(
        "a[href='https://www.conventionalcommits.org/en/v1.0.0/']"
      )
    ).toBeInTheDocument();

    const terminiLink = screen.getByRole("link", {
      name: /termini e condizioni/i,
    });
    expect(terminiLink).toBeInTheDocument();
    expect(terminiLink).toHaveAttribute(
      "href",
      "https://www.conventionalcommits.org/en/v1.0.0/"
    );
    expect(terminiLink).toHaveAttribute("target", "_blank");
    expect(terminiLink).toHaveAttribute("rel", "noopener noreferrer");

    // Testa il link alla Privacy
    const privacyLink = screen.getByRole("link", {
      name: /informativa privacy/i,
    });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute(
      "href",
      "https://www.conventionalcommits.org/en/v1.0.0/"
    );
    expect(privacyLink).toHaveAttribute("target", "_blank");
    expect(privacyLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
