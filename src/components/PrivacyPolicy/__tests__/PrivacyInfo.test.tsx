import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import PrivacyInfo from "../PrivacyInfo";

// Mock the Trans component from react-i18next
jest.mock("react-i18next", () => ({
  Trans: ({
    i18nKey,
    components,
  }: {
    i18nKey: string;
    components?: Record<string, React.ReactNode>;
  }) => {
    // Simulate different translations based on the i18nKey
    switch (i18nKey) {
      case "privacyInfo.privacyDesc":
        return (
          <span data-testid="privacy-desc">
            Privacy description with
            <span data-testid="privacy-link">{components?.privacy}</span> and
            <span data-testid="terms-link">{components?.terms}</span> links
          </span>
        );
      case "privacyInfo.privacyDonation":
        return (
          <span data-testid="privacy-donation">
            Donation privacy with
            <span data-testid="donation-terms-link">
              {components?.terms}
            </span>{" "}
            link
          </span>
        );
      case "privacyInfo.googleDesc":
        return (
          <span data-testid="google-desc">
            Google description with
            <span data-testid="google-privacy-link">
              {components?.privacy}
            </span>{" "}
            and
            <span data-testid="google-terms-link">
              {components?.terms}
            </span>{" "}
            links
          </span>
        );
      default:
        return <span>Unknown translation key: {i18nKey}</span>;
    }
  },
}));

// Mock MUI components
jest.mock("@mui/material", () => ({
  Box: ({ children, mt }: any) => (
    <div
      data-testid="box-component"
      style={{ marginTop: mt ? `${mt * 8}px` : "0" }}
    >
      {children}
    </div>
  ),
  Typography: ({ children, variant, component }: any) => (
    <div
      data-testid="typography-component"
      data-variant={variant}
      data-component={component}
    >
      {children}
    </div>
  ),
  Link: ({ children, href, target, rel, style, sx }: any) => {
    // Safely combine style and sx props for testing
    const combinedStyle = { ...(style || {}), ...(sx || {}) };

    return (
      <a
        data-testid="link-component"
        href={href}
        target={target}
        rel={rel}
        style={combinedStyle}
      >
        {children}
      </a>
    );
  },
}));

describe("PrivacyInfo Component", () => {
  it("renders correctly with default props", () => {
    // Add this line to render the component first
    render(<PrivacyInfo />);

    // Check if Box has correct margin top
    const boxElement = screen.getByTestId("box-component");
    expect(boxElement).toBeInTheDocument();
    expect(boxElement).toHaveStyle("margin-top: 32px"); // mt={4} * 8px = 32px

    // Check if Typography has correct variant and component
    const typographyElement = screen.getByTestId("typography-component");
    expect(typographyElement).toBeInTheDocument();
    expect(typographyElement).toHaveAttribute("data-variant", "caption");
    expect(typographyElement).toHaveAttribute("data-component", "div");

    // Check if privacy description is rendered
    const privacyDesc = screen.getByTestId("privacy-desc");
    expect(privacyDesc).toBeInTheDocument();

    // Check if donation privacy is not rendered
    expect(screen.queryByTestId("privacy-donation")).not.toBeInTheDocument();

    // Check for period using a more flexible approach - check the typography content
    const typographyContent = typographyElement.textContent;
    expect(typographyContent).toContain(".");

    // Check if Google description is rendered
    const googleDesc = screen.getByTestId("google-desc");
    expect(googleDesc).toBeInTheDocument();

    // Check links in privacy description
    const privacyLink = screen
      .getByTestId("privacy-link")
      .querySelector('[data-testid="link-component"]');
    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute("href", "/informativa-privacy");
    expect(privacyLink).toHaveAttribute("target", "_blank");
    expect(privacyLink).toHaveAttribute("rel", "noreferrer");
    expect(privacyLink).toHaveStyle("font-weight: 600");
    expect(privacyLink).toHaveStyle("text-decoration: none");

    const termsLink = screen
      .getByTestId("terms-link")
      .querySelector('[data-testid="link-component"]');
    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute("href", "/termini-di-servizio");

    // Check links in Google description
    const googlePrivacyLink = screen
      .getByTestId("google-privacy-link")
      .querySelector('[data-testid="link-component"]');
    expect(googlePrivacyLink).toBeInTheDocument();
    expect(googlePrivacyLink).toHaveAttribute(
      "href",
      "https://policies.google.com/privacy"
    );
    expect(googlePrivacyLink).toHaveAttribute("rel", "noopener noreferrer");

    const googleTermsLink = screen
      .getByTestId("google-terms-link")
      .querySelector('[data-testid="link-component"]');
    expect(googleTermsLink).toBeInTheDocument();
    expect(googleTermsLink).toHaveAttribute(
      "href",
      "https://policies.google.com/terms"
    );
    expect(googleTermsLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders donation privacy when showDonationPrivacy is true", () => {
    render(<PrivacyInfo showDonationPrivacy={true} />);

    // Check if donation privacy is rendered
    const privacyDonation = screen.getByTestId("privacy-donation");
    expect(privacyDonation).toBeInTheDocument();

    // Check if typography content doesn't contain a standalone period
    const typographyElement = screen.getByTestId("typography-component");
    const typographyText = typographyElement.textContent;
    // We can check that the text doesn't have a standalone period between the sections
    const privacyDescText = screen.getByTestId("privacy-desc").textContent;
    const googleDescText = screen.getByTestId("google-desc").textContent;
    const textBetween = typographyText!
      .substring(
        privacyDescText!.length,
        typographyText!.length - googleDescText!.length
      )
      .trim();
    expect(textBetween).not.toBe(".");

    // Check donation terms link
    const donationTermsLink = screen
      .getByTestId("donation-terms-link")
      .querySelector('[data-testid="link-component"]');
    expect(donationTermsLink).toBeInTheDocument();
    expect(donationTermsLink).toHaveAttribute(
      "href",
      "https://www.pagopa.gov.it/it/privacy-policy-donazioni-ucraina/"
    );
    expect(donationTermsLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(donationTermsLink).toHaveStyle("font-weight: 600");
    expect(donationTermsLink).toHaveStyle("text-decoration: none");
  });
});
