import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LanguageMenu from "../LanguageMenu";

jest.mock("../../../translations/i18n", () => ({
  fallbackLang: "en",
}));

jest.mock("../../../translations/lang", () => {
  // Base object with language definitions
  const supportedLang: Record<string, { label: string }> = {
    en: { label: "English" },
    it: { label: "Italiano" },
    fr: { label: "Français" },
  };

  // Add the getSortedLang function
  return {
    ...supportedLang,
    default: supportedLang,
    getSortedLang: () => [
      { lang: "en", label: "English" },
      { lang: "it", label: "Italiano" },
      { lang: "fr", label: "Français" },
    ],
  };
});

// Create a mock for changeLanguage that we can track
const changeLanguageMock = jest.fn().mockResolvedValue(undefined);

// Mock the i18n hook with the specified format
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    i18n: {
      language: "en",
      changeLanguage: changeLanguageMock,
    },
    t: (key: string) => {
      const translations: Record<string, string> = {
        "ariaLabels.languageMenu": "Language Menu",
      };
      return translations[key] || key;
    },
  }),
  Trans: ({
    i18nKey,
  }: {
    i18nKey?: string;
    values?: Record<string, any>;
    components?: Array<any>;
    children?: React.ReactNode;
  }) => <span data-testid="mocked-trans">{i18nKey || "no-key"}</span>,
}));

describe("LanguageMenu Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default language", () => {
    render(<LanguageMenu />);

    // Check if the current language is displayed
    expect(screen.getByText("EN")).toBeTruthy();

    // Check if the dropdown icon is rendered
    expect(screen.getByTestId("KeyboardArrowDownIcon")).toBeTruthy();
  });

  it("opens menu when button is clicked", async () => {
    render(<LanguageMenu />);

    // Get the button and click it
    const button = screen.getByLabelText("Language Menu");
    fireEvent.click(button);

    // Wait for the menu to open
    await waitFor(() => {
      // Check if the menu is open and languages are displayed
      const menuItems = screen.getAllByRole("menuitem");
      expect(menuItems.length).toBe(3); // Three language options

      // Check that all languages are present
      const menuTexts = menuItems.map((item) => item.textContent);
      expect(menuTexts).toContain("English");
      expect(menuTexts).toContain("Italiano");
      expect(menuTexts).toContain("Français");
    });
  });

  it("changes language when a language option is selected", async () => {
    render(<LanguageMenu />);

    // Open the menu
    const button = screen.getByLabelText("Language Menu");
    fireEvent.click(button);

    // Wait for menu to open and find the Italian option
    await waitFor(() => {
      const menuItems = screen.getAllByRole("menuitem");
      expect(menuItems.length).toBe(3);

      // Find the Italian option
      const italianOption = menuItems.find(
        (item) => item.textContent === "Italiano"
      );
      expect(italianOption).toBeTruthy();

      // Click the Italian option
      fireEvent.click(italianOption!);
    });

    // Verify changeLanguage was called with 'it'
    expect(changeLanguageMock).toHaveBeenCalledWith("it");
  });

  it("closes menu when clicking outside", async () => {
    render(<LanguageMenu />);

    // Open the menu
    const button = screen.getByLabelText("Language Menu");
    fireEvent.click(button);

    // Wait for menu to open
    await waitFor(() => {
      expect(screen.getAllByRole("menuitem").length).toBe(3);
    });

    // Simulate clicking outside by triggering onClose
    // Find the backdrop and click it
    const backdrop = document.querySelector(".MuiBackdrop-root");
    expect(backdrop).toBeTruthy();
    fireEvent.click(backdrop!);

    // Check if menu is closed
    await waitFor(() => {
      expect(screen.queryByRole("menuitem")).toBeFalsy();
    });
  });

  it("uses fallback language when current language is not supported", () => {
    // Override the mock implementation for this test only
    const originalUseTranslation =
      jest.requireMock("react-i18next").useTranslation;
    // eslint-disable-next-line functional/immutable-data
    jest.requireMock("react-i18next").useTranslation = () => ({
      ...originalUseTranslation(),
      i18n: {
        ...originalUseTranslation().i18n,
        language: "xx", // Unsupported language
      },
    });

    render(<LanguageMenu />);

    // Should display the fallback language
    expect(screen.getByText("EN")).toBeTruthy();

    // Reset the mock to its original state
    // eslint-disable-next-line functional/immutable-data
    jest.requireMock("react-i18next").useTranslation = originalUseTranslation;
  });
});
