import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SkipToContent from "../SkipToContent";

// Mock the useTranslation hook
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Return a simple translation for the test
      if (key === "mainPage.main.skipToContent") {
        return "Skip to content";
      }
      return key;
    },
  }),
}));

describe("SkipToContent Component", () => {
  beforeEach(() => {
    // Create a main content element for the tests
    const mainContent = document.createElement("div");
    // eslint-disable-next-line functional/immutable-data
    mainContent.id = "main_content";
    // eslint-disable-next-line functional/immutable-data
    mainContent.tabIndex = -1; // Make it focusable
    document.body.appendChild(mainContent);
  });

  afterEach(() => {
    // Clean up the main content element after each test
    const mainContent = document.getElementById("main_content");
    if (mainContent) {
      document.body.removeChild(mainContent);
    }
  });

  it("renders with correct initial styles (hidden)", () => {
    render(<SkipToContent />);

    const button = screen.getByRole("button", { name: "Skip to content" });

    // Check that the button exists
    expect(button).toBeInTheDocument();

    // Check that it has the correct id
    expect(button).toHaveAttribute("id", "skip-to-content");

    // Check that it's initially hidden (opacity 0)
    expect(button).toHaveStyle("opacity: 0");
    expect(button).toHaveStyle("z-index: -1");
  });

  it("becomes visible on focus", () => {
    render(<SkipToContent />);

    const button = screen.getByRole("button", { name: "Skip to content" });

    // Simulate focus event
    fireEvent.focus(button);

    // Check that it becomes visible
    expect(button).toHaveStyle("opacity: 1");
    expect(button).toHaveStyle("z-index: 1");
  });

  it("becomes hidden again on blur", () => {
    render(<SkipToContent />);

    const button = screen.getByRole("button", { name: "Skip to content" });

    // Simulate focus and then blur
    fireEvent.focus(button);
    fireEvent.blur(button);

    // Check that it becomes hidden again
    expect(button).toHaveStyle("opacity: 0");
    expect(button).toHaveStyle("z-index: -1");
  });

  it("focuses on main content when clicked", () => {
    render(<SkipToContent />);

    const button = screen.getByRole("button", { name: "Skip to content" });
    const mainContent = document.getElementById("main_content");

    // Spy on the focus method
    const focusSpy = jest.spyOn(mainContent as HTMLElement, "focus");

    // Click the button
    fireEvent.click(button);

    // Check that focus was called on the main content
    expect(focusSpy).toHaveBeenCalledTimes(1);

    // Clean up
    focusSpy.mockRestore();
  });

  it("handles case when main content element does not exist", () => {
    // Remove the main content element for this test
    const mainContent = document.getElementById("main_content");
    if (mainContent) {
      document.body.removeChild(mainContent);
    }

    render(<SkipToContent />);

    const button = screen.getByRole("button", { name: "Skip to content" });

    // This should not throw an error
    expect(() => {
      fireEvent.click(button);
    }).not.toThrow();
  });

  it("has the correct transition style", () => {
    render(<SkipToContent />);

    const button = screen.getByRole("button", { name: "Skip to content" });

    // Check the transition style
    expect(button).toHaveStyle("transition: opacity 0.2s ease-out");
  });

  it("has the correct position style on the wrapper div", () => {
    const { container } = render(<SkipToContent />);

    // Get the wrapper div (the first div in the container)
    const wrapperDiv = container.firstChild as HTMLElement;

    // Check the position style
    expect(wrapperDiv).toHaveStyle("position: relative");
  });
});
