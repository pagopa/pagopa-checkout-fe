import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DrawerCart from '../DrawerCart';
import { PaymentNotice } from '../../../features/payment/models/paymentModel';
import * as sessionStorage from '../../../utils/storage/sessionStorage';
import { CheckoutRoutes } from '../../../routes/models/routeModel';
import { moneyFormat } from '../../../utils/form/formatters';
import { truncateText } from '../../../utils/transformers/text';

jest.mock('../../../utils/config/config', () => ({
    CHECKOUT_API_TIMEOUT: 30000,
  }));
  
  jest.mock('../../../utils/storage/sessionStorage', () => ({
    getSessionItem: jest.fn(),
    SessionItems: {
      cartClientId: 'cartClientId',
    }
  }));

// Mock dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Simple mock translation function
      const translations: Record<string, string> = {
        'cartDetail.amount': 'Amount',
        'cartDetail.description': 'Description',
        'cartDetail.companyName': 'Company Name',
        'cartDetail.noticeNumber': 'Notice Number',
        'cartDetail.iuv': 'IUV',
        'cartDetail.fiscalCode': 'Fiscal Code'
      };
      return translations[key] || key;
    }
  })
}));

jest.mock('@mui/material', () => {
  const original = jest.requireActual('@mui/material');
  return {
    ...original,
    useTheme: () => ({
      palette: {
        background: {
          default: '#ffffff'
        },
        primary: {
          main: '#1976d2'
        }
      }
    })
  };
});

jest.mock('../../../utils/form/formatters', () => ({
  moneyFormat: jest.fn((amount) => `€${amount.toFixed(2)}`)
}));

jest.mock('../../../utils/transformers/text', () => ({
  truncateText: jest.fn((text, length) => 
    text.length > length ? `${text.substring(0, length)}...` : text
  )
}));

// Mock location object
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/checkout/payment'
  },
  writable: true
});

// Mock sessionStorage
jest.spyOn(sessionStorage, 'getSessionItem').mockImplementation((key) => {
  if (key === sessionStorage.SessionItems.cartClientId) {
    return 'CHECKOUT';
  }
  return undefined;
});

describe('DrawerCart Component', () => {
  // Sample payment notices for testing
  const samplePaymentNotices: Array<PaymentNotice> = [
    {
      amount: 100.5,
      description: 'Notice A',
      companyName: 'Company A',
      noticeNumber: '123456789',
      fiscalCode: 'ABCDEF12G34H567I',
    },
    {
      amount: 200.75,
      description: 'Notice B',
      companyName: 'Company B',
      noticeNumber: '987654321',
      fiscalCode: 'LMNOPQ12R34S567T',
      creditorReferenceId: 'IUV12345'
    }
  ];

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment notices correctly', () => {
    render(<DrawerCart paymentNotices={samplePaymentNotices} />);
    
    const accordionSummaries = screen.getAllByRole('button');
    
    // Find the accordion summaries that contain our payment notices
    const paymentAccordions = accordionSummaries.filter(element => 
      element.textContent?.includes('Notice A') || 
      element.textContent?.includes('Notice B')
    );
    
    expect(paymentAccordions).toHaveLength(2);
    
    // Check first payment notice
    const firstAccordion = paymentAccordions[0];
    expect(firstAccordion).toHaveTextContent('Notice A');
    expect(firstAccordion).toHaveTextContent('Company A');
    
    // Check second payment notice
    const secondAccordion = paymentAccordions[1];
    expect(secondAccordion).toHaveTextContent('Notice B');
    expect(secondAccordion).toHaveTextContent('Company B');
    
    // For the amounts, we need to be more specific since they appear twice
    const amountElements = screen.getAllByText(/€\d+\.\d+/);
    
    // Check that we have the correct amounts (they appear in both the summary and details)
    const amount1Elements = amountElements.filter(el => el.textContent === '€100.50');
    const amount2Elements = amountElements.filter(el => el.textContent === '€200.75');
    
    expect(amount1Elements.length).toBeGreaterThan(0);
    expect(amount2Elements.length).toBeGreaterThan(0);
  });

  it('expands first item when only one payment notice is provided', () => {
    render(<DrawerCart paymentNotices={[samplePaymentNotices[0]]} />);
    
    // The accordion details should be visible
    expect(screen.getByText('Amount')).toBeVisible();
    expect(screen.getByText('Description')).toBeVisible();
    expect(screen.getByText('Company Name')).toBeVisible();
  });

  it('does not expand any item by default when multiple notices are provided', () => {
    render(<DrawerCart paymentNotices={samplePaymentNotices} />);
    
    // The accordion details should not be visible initially
    const amountLabels = screen.getAllByText('Amount');
    // Only the first one in the expanded accordion should be visible
    expect(amountLabels[0]).not.toBeVisible();
  });

  it('expands an accordion when clicked', () => {
    render(<DrawerCart paymentNotices={samplePaymentNotices} />);
    
    // Find all accordion buttons
    const accordionButtons = screen.getAllByRole('button');
    
    // Find the first accordion button (the one for Notice A)
    const firstAccordionButton = accordionButtons[0];
    
    // Verify it contains the expected text
    expect(firstAccordionButton.textContent).toContain('Notice A');
    
    // Initially, the accordion should be collapsed
    expect(firstAccordionButton.getAttribute('aria-expanded')).toBe('false');
    
    // Click to expand
    fireEvent.click(firstAccordionButton);
    
    // Now the accordion should be expanded
    expect(firstAccordionButton.getAttribute('aria-expanded')).toBe('true');
    
    // After clicking, the Amount text should be visible
    // Using waitFor to allow for any animations/transitions
    return waitFor(() => {
      const amountElements = screen.getAllByText('Amount');
      // At least one "Amount" element should be visible
      const visibleAmountElement = amountElements.find(el => {
        // Check if this element is in an expanded accordion section
        const collapseParent = el.closest('.MuiCollapse-root');
        return collapseParent && !collapseParent.classList.contains('MuiCollapse-hidden');
      });
      
      expect(visibleAmountElement).toBeTruthy();
    });
  });

  it('collapses an expanded accordion when clicked again', async () => {
    render(<DrawerCart paymentNotices={[samplePaymentNotices[0]]} />);
    
    // Find the accordion button
    const accordionButton = screen.getByRole('button');
    
    // If the accordion isn't expanded by default, expand it first
    if (accordionButton.getAttribute('aria-expanded') === 'false') {
      fireEvent.click(accordionButton);
      
      // Wait for it to expand
      await waitFor(() => {
        expect(accordionButton.getAttribute('aria-expanded')).toBe('true');
      });
    }
    
    // Verify that the Amount text is visible in the expanded accordion
    await waitFor(() => {
      const amountElement = screen.getByText('Amount');
      const collapseParent = amountElement.closest('.MuiCollapse-root');
      expect(collapseParent).not.toHaveClass('MuiCollapse-hidden');
    });
    
    // Now click the accordion button again to collapse it
    fireEvent.click(accordionButton);
    
    // Wait for the accordion to collapse
    await waitFor(() => {
      expect(accordionButton.getAttribute('aria-expanded')).toBe('false');
      
      // The Amount element should now be in a hidden collapse section
      const amountElement = screen.getByText('Amount');
      const collapseParent = amountElement.closest('.MuiCollapse-root');
      expect(collapseParent).toHaveClass('MuiCollapse-hidden');
    });
  });

  it('shows notice number and fiscal code when not in WISP_REDIRECT mode', async () => {
    render(<DrawerCart paymentNotices={samplePaymentNotices} />);
    
    // Find all accordion buttons
    const accordionButtons = screen.getAllByRole('button');
    
    // Find the first accordion button (which should contain "Notice A")
    const firstAccordionButton = accordionButtons[0];
    expect(firstAccordionButton.textContent).toContain('Notice A');
    
    // Click to expand
    fireEvent.click(firstAccordionButton);
    
    // Wait for the accordion to expand
    await waitFor(() => {
      expect(firstAccordionButton.getAttribute('aria-expanded')).toBe('true');
    });
    
    // Now check for the notice number and fiscal code
    await waitFor(() => {
      // Notice number and fiscal code should be visible
      const noticeNumberLabel = screen.getByText('Notice Number');
      const noticeNumberValue = screen.getByText('123456789');
      const fiscalCodeLabel = screen.getAllByText('Fiscal Code')[0];
      const fiscalCodeValue = screen.getByText('ABCDEF12G34H567I');
      
      // Verify they're in an expanded section
      [noticeNumberLabel, noticeNumberValue, fiscalCodeLabel, fiscalCodeValue].forEach(element => {
        const collapseParent = element.closest('.MuiCollapse-root');
        expect(collapseParent).not.toHaveClass('MuiCollapse-hidden');
      });
    });
  });

  it('shows IUV instead of notice number when creditorReferenceId is present', () => {
    render(<DrawerCart paymentNotices={samplePaymentNotices} />);
    
    // Find all accordion buttons
    const accordionButtons = screen.getAllByRole('button');
    
    const secondAccordionButton = accordionButtons[1];
    expect(secondAccordionButton.textContent).toContain('Notice B');
    fireEvent.click(secondAccordionButton!);
    
    // IUV should be visible instead of notice number
    expect(screen.getByText('IUV')).toBeVisible();
    expect(screen.getByText('IUV12345')).toBeVisible();
  });

  it('hides notice number and fiscal code in WISP_REDIRECT mode on specific routes', async () => {
    // Mock WISP_REDIRECT client ID
    jest.spyOn(sessionStorage, 'getSessionItem').mockImplementation(() => 'WISP_REDIRECT');
    
    // Set location to one of the ignored routes
    Object.defineProperty(window, 'location', {
      value: {
        pathname: `/checkout/${CheckoutRoutes.INSERISCI_EMAIL}`
      },
      writable: true
    });
    
    render(<DrawerCart paymentNotices={samplePaymentNotices} />);
    
    // Find all accordion buttons
    const accordionButtons = screen.getAllByRole('button');
    
    // Find the first accordion button (the one for Notice A)
    const firstAccordionButton = accordionButtons[0];
    
    // Verify it contains the expected text
    expect(firstAccordionButton.textContent).toContain('Notice A');
    fireEvent.click(firstAccordionButton!);
    
    await waitFor(() => {
        // Notice number and fiscal code should not be visible
        expect(screen.queryByText('Notice Number')).not.toBeInTheDocument();
        expect(screen.queryByText('123456789')).not.toBeInTheDocument();
        expect(screen.queryByText('Fiscal Code')).not.toBeInTheDocument();
        expect(screen.queryByText('ABCDEF12G34H567I')).not.toBeInTheDocument();
    })
  });

  it('shows notice number and fiscal code in WISP_REDIRECT mode on non-ignored routes', () => {
    // Mock WISP_REDIRECT client ID
    jest.spyOn(sessionStorage, 'getSessionItem').mockImplementation(() => 'WISP_REDIRECT');
    
    // Set location to a non-ignored route
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/checkout/some-other-route'
      },
      writable: true
    });
    
    render(<DrawerCart paymentNotices={samplePaymentNotices} />);
    
    // Find all accordion buttons
    const accordionButtons = screen.getAllByRole('button');
    
    // Find the first accordion button (the one for Notice A)
    const firstAccordionButton = accordionButtons[0];
    
    // Verify it contains the expected text
    expect(firstAccordionButton.textContent).toContain('Notice A');
    fireEvent.click(firstAccordionButton!);
    
    // Notice number and fiscal code should be visible
    expect(screen.getByText('Notice Number')).toBeVisible();
    expect(screen.getByText('123456789')).toBeVisible();
    expect(screen.getAllByText('Fiscal Code')[0]).toBeVisible();
    expect(screen.getByText('ABCDEF12G34H567I')).toBeVisible();
  });

  it('truncates long descriptions and company names in accordion summary', () => {
    const longTextNotice: PaymentNotice = {
      amount: 100.5,
      description: 'This is a very long description that should be truncated in the summary view',
      companyName: 'This is a very long company name that should also be truncated in the summary',
      noticeNumber: '123456789',
      fiscalCode: 'ABCDEF12G34H567I',
    };
    
    render(<DrawerCart paymentNotices={[longTextNotice]} />);
    
    // Check that truncateText was called with the right parameters
    expect(truncateText).toHaveBeenCalledWith(longTextNotice.description, 30);
    expect(truncateText).toHaveBeenCalledWith(longTextNotice.companyName, 30);
  });

  it('shows full text in accordion details', () => {
    const longTextNotice: PaymentNotice = {
      amount: 100.5,
      description: 'This is a very long description that should not be truncated in the details view',
      companyName: 'This is a very long company name that should not be truncated in the details view',
      noticeNumber: '123456789',
      fiscalCode: 'ABCDEF12G34H567I',
    };
    
    render(<DrawerCart paymentNotices={[longTextNotice]} />);
    
    // In the details view, the full text should be shown
    expect(screen.getByText(longTextNotice.description as string)).toBeInTheDocument();
    expect(screen.getByText(longTextNotice.companyName as string)).toBeInTheDocument();
  });

  it('formats money values correctly', () => {
    render(<DrawerCart paymentNotices={samplePaymentNotices} />);
    
    // Check that moneyFormat was called with the right parameters
    expect(moneyFormat).toHaveBeenCalledWith(samplePaymentNotices[0].amount);
    expect(moneyFormat).toHaveBeenCalledWith(samplePaymentNotices[1].amount);
  });

  it('renders nothing when paymentNotices array is empty', () => {
    const { container } = render(<DrawerCart paymentNotices={[]} />);
    
    // The component should render an empty fragment
    expect(container.firstChild).toBeNull();
  });

  it('applies correct styling to accordions', () => {
    const { container } = render(<DrawerCart paymentNotices={samplePaymentNotices} />);
    
    // Check that accordions have the correct styling
    const accordions = container.querySelectorAll('.MuiAccordion-root');
    expect(accordions).toHaveLength(2);
    
    // First accordion should have borderTop but not borderBottom
    expect(accordions[0]).toHaveStyle('border-top: 1px solid');
    expect(accordions[0]).not.toHaveStyle('border-bottom: 1px solid');
    
    // Second accordion should have both borderTop and borderBottom
    expect(accordions[1]).toHaveStyle('border-top: 1px solid');
    expect(accordions[1]).toHaveStyle('border-bottom: 1px solid');
  });

  it('has correct accessibility attributes', () => {
    render(<DrawerCart paymentNotices={samplePaymentNotices} />);

    // Find all accordion buttons
    const accordionButtons = screen.getAllByRole('button');
    
    // Find the first accordion button (the one for Notice A)
    const firstAccordionButton = accordionButtons[0];
    // Find the first accordion button (the one for Notice B)
    const secondAccordionButton = accordionButtons[1];
    
    // Verify they contain the expected text
    expect(firstAccordionButton.textContent).toContain('Notice A');
    expect(secondAccordionButton.textContent).toContain('Notice B');
    
    // Check that accordion summaries have correct aria attributes
    expect(firstAccordionButton).toHaveAttribute('aria-controls', 'paynotice-0');
    expect(firstAccordionButton).toHaveAttribute('id', 'paynotice-0');
    
    expect(secondAccordionButton).toHaveAttribute('aria-controls', 'paynotice-1');
    expect(secondAccordionButton).toHaveAttribute('id', 'paynotice-1');
  });
});