import React from "react";
import { render, screen } from "@testing-library/react";
import PspPrivacyInfo from "../PspPrivacyInfo";
import "@testing-library/jest-dom";


jest.mock("react-i18next", () => ({
  Trans: ({ components, values }: any) => (
    <span>
      Proseguendo Accetti i {React.cloneElement(components.terms, {}, "termini")} e dichiari di aver letto la {React.cloneElement(components.privacy, {}, "privacy")} di <b>{values.pspName}</b>
    </span>
  ),
}));

describe("PspPrivacyInfo", () => {
  it("renders PSP info with correct links and PSP name", () => {
    render(
      <PspPrivacyInfo
        termsLink="https://example.com/terms"
        privacyLink="https://example.com/privacy"
        pspName="MyPSP"
      />
    );

    // Check links termini and privacy
    const termsLink = screen.getByRole("link", { name: /termini/i });
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute("href", "https://example.com/terms");

    const privacyLink = screen.getByRole("link", { name: /privacy/i });
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "https://example.com/privacy");

    // Check pspName 
    expect(screen.getByText("MyPSP")).toBeInTheDocument();

    expect(termsLink).toHaveAttribute("target", "_blank");
    expect(termsLink).toHaveAttribute("rel", "noreferrer");

    expect(privacyLink).toHaveAttribute("target", "_blank");
    expect(privacyLink).toHaveAttribute("rel", "noreferrer");
  });
});
