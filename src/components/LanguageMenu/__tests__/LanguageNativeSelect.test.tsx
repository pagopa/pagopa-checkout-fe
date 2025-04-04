import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LanguageNativeSelect from '../LanguageNativeSelect';

// Mock the translations module
jest.mock('../../../translations/i18n', () => ({
  fallbackLang: 'en',
}));

// Mock the supported languages with proper TypeScript typing
jest.mock('../../../translations/lang', () => {
  // Create the base object with language definitions
  const supportedLang: Record<string, { label: string }> = {
    en: { label: 'English' },
    it: { label: 'Italiano' },
    fr: { label: 'Français' },
  };
  
  // Add the getSortedLang function
  const moduleExports = {
    ...supportedLang,
    default: supportedLang,
    getSortedLang: () => [
      { lang: 'en', label: 'English' },
      { lang: 'it', label: 'Italiano' },
      { lang: 'fr', label: 'Français' },
    ],
  };
  
  return moduleExports;
});

// Create a mock for changeLanguage that we can track
const changeLanguageMock = jest.fn().mockResolvedValue(undefined);
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock the i18n hook with the specified format
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en',
      changeLanguage: changeLanguageMock,
    },
    t: (key: string) => {
      const translations: Record<string, string> = {
        'ariaLabels.languageMenu': 'Language Menu',
      };
      return translations[key] || key;
    }
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

describe('LanguageNativeSelect Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.setItem.mockClear();
  });

  it('renders correctly with default language', () => {
    render(<LanguageNativeSelect />);
    
    // Check if the select element is rendered
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectElement).toBeTruthy();
    
    // For MUI NativeSelect, we need to check the selected option instead of the value attribute
    // The first option (English) should be selected by default
    const options = Array.from(selectElement.options);
    expect(options[0].selected).toBe(true);
    expect(options[0].value).toBe('en');
    
    // Check if the hidden accessibility label is present
    expect(screen.getByText('Language Menu')).toBeTruthy();
  });

  it('renders all language options', () => {
    render(<LanguageNativeSelect />);
    
    // Get the select element
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    
    // Check if all options are rendered
    const options = Array.from(selectElement.options);
    expect(options.length).toBe(3);
    
    // Check option values and labels
    expect(options[0].value).toBe('en');
    expect(options[0].textContent).toBe('English');
    
    expect(options[1].value).toBe('it');
    expect(options[1].textContent).toBe('Italiano');
    
    expect(options[2].value).toBe('fr');
    expect(options[2].textContent).toBe('Français');
  });

  it('changes language when a different option is selected', () => {
    render(<LanguageNativeSelect />);
    
    // Get the select element
    const selectElement = screen.getByRole('combobox');
    
    // Change the selection to Italian
    fireEvent.change(selectElement, { target: { value: 'it' } });
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('i18nextLng', 'it');
    
    // Verify changeLanguage was called with 'it'
    expect(changeLanguageMock).toHaveBeenCalledWith('it');
  });

  it('uses fallback language when current language is not supported', () => {
    // Override the mock implementation for this test only
    const originalUseTranslation = jest.requireMock('react-i18next').useTranslation;
    jest.requireMock('react-i18next').useTranslation = () => ({
      ...originalUseTranslation(),
      i18n: {
        ...originalUseTranslation().i18n,
        language: 'xx', // Unsupported language
      }
    });
    
    render(<LanguageNativeSelect />);
    
    // Get the select element
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    
    // Check if the fallback language is selected
    const options = Array.from(selectElement.options);
    expect(options[0].selected).toBe(true);
    expect(options[0].value).toBe('en');
    
    // Reset the mock to its original state
    jest.requireMock('react-i18next').useTranslation = originalUseTranslation;
  });

  it('handles aria-label for accessibility', () => {
    render(<LanguageNativeSelect />);
    
    // Get the select element
    const selectElement = screen.getByRole('combobox');
    
    // Check if the select has an id
    expect(selectElement.id).toBe('languageMenu');
    
    // Check if the hidden accessibility label is present
    const accessibilityLabel = screen.getByText('Language Menu');
    expect(accessibilityLabel).toBeTruthy();
  });

  it('updates state and calls handlers when language changes', () => {
    render(<LanguageNativeSelect />);
    
    // Get the select element
    const selectElement = screen.getByRole('combobox');
    
    // Change the selection to Italian
    fireEvent.change(selectElement, { target: { value: 'it' } });
    
    waitFor(() => {
        // Verify the change handler was called correctly
        expect(changeLanguageMock).toHaveBeenCalledWith('it');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('i18nextLng', 'it');
    });
    
    // Change to French
    fireEvent.change(selectElement, { target: { value: 'fr' } });
    
    // Verify the change handler was called again with the new value
    waitFor(() => {
        expect(changeLanguageMock).toHaveBeenCalledWith('fr');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('i18nextLng', 'fr');
    });
  });

  it('handles localStorage interaction correctly', () => {
    render(<LanguageNativeSelect />);
    
    // Get the select element
    const selectElement = screen.getByRole('combobox');
    
    // Change the selection to French
    fireEvent.change(selectElement, { target: { value: 'fr' } });
    
    // Verify localStorage was updated with the correct key and value
    expect(localStorageMock.setItem).toHaveBeenCalledWith('i18nextLng', 'fr');
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
  });
});