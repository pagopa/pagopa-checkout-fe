import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SkipToContent from "../SkipToContent";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key === "mainPage.main.skipToContent" ? "Skip to content" : key,
  }),
}));

describe("SkipToContent Component", () => {
  it("renders as a link with the correct text and href", () => {
    render(<SkipToContent />);

    const link = screen.getByRole("link", { name: "Skip to content" });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "#main_content");
  });

  it("is focusable via keyboard", () => {
    render(<SkipToContent />);

    const link = screen.getByRole("link", { name: "Skip to content" });

    link.focus();

    expect(link).toHaveFocus();
  });

  it("does not throw when clicked even if main content is missing", () => {
    render(<SkipToContent />);

    const link = screen.getByRole("link", { name: "Skip to content" });

    expect(() => {
      link.click();
    }).not.toThrow();
  });
});
