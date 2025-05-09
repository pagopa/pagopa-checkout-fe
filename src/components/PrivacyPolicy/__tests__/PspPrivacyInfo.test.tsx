import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PspPrivacyInfo from "../PspPrivacyInfo";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === "paymentCheckPage.disclaimer.psp") {
        return `Proseguendo accetti i <a href='${options.termsLink}' target='_blank' rel='noopener noreferrer'>Termini e condizioni d'uso</a> e dichiari di aver letto l'<a href='${options.privacyLink}' target='_blank' rel='noopener noreferrer'>informativa Privacy</a> di <b>${options.pspNome}</b>`;
      }
      return key;
    },
  }),
}));

describe("PspPrivacyInfo", () => {
  const defaultProps = {
    pspName: "PagoPA",
    termsLink: "https://www.conventionalcommits.org/en/v1.0.0/",
    privacyLink: "https://www.conventionalcommits.org/en/v1.0.0/",
  };

  it("renders HTML message correctly", () => {
    render(<PspPrivacyInfo {...defaultProps} />);

    const paragraph = screen.getByText((content) =>
      content.includes("Proseguendo")
    );
    expect(paragraph).toBeInTheDocument();
    // Check that "Termini" and "Privacy" are included in the content
    expect(paragraph.innerHTML).toContain("Termini");
    expect(paragraph.innerHTML).toContain("Privacy");
    expect(paragraph.innerHTML).toContain("PagoPA");
    // Check that links have correct href values
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

    // Check the "Terms" link
    const termsLink = screen.getByRole("link", {
      name: /termini e condizioni/i,
    });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute(
      "href",
      "https://www.conventionalcommits.org/en/v1.0.0/"
    );
    expect(termsLink).toHaveAttribute("target", "_blank");
    expect(termsLink).toHaveAttribute("rel", "noopener noreferrer");

    // Check the "Privacy" link
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
