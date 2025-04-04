import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DrawerDetail from '../DrawerDetail';
import { PaymentNotice } from '../../../features/payment/models/paymentModel';

jest.mock('../../../utils/config/config', () => ({
    CHECKOUT_API_TIMEOUT: 30000,
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => {
        // Simple mock translation function
        const translations: Record<string, string> = {
        'mainPage.header.detail.detailAmount': 'Total Amount',
        'mainPage.header.disclaimer': 'This is a disclaimer text',
      };
      return translations[key] || key;
    },
  }),
}));

// Sample payment notices for testing
const samplePaymentNotices: PaymentNotice[] = [
  {
    noticeNumber: '123456789',
    fiscalCode: 'ABCDEF12G34H567I',
    companyName: 'Company A',
    description: 'Notice A',
    amount: 100.50,
  },
  {
    noticeNumber: '987654321',
    fiscalCode: 'LMNOPQ12R34S567T',
    companyName: 'Company B',
    description: 'Notice B',
    amount: 75.25
  },
];

describe('DrawerDetail Component', () => {
  const defaultProps = {
    amountToShow: () => 175.75, // Sum of the sample payment notices
    drawstate: true,
    toggleDrawer: jest.fn(),
    paymentNotices: samplePaymentNotices,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(<DrawerDetail {...defaultProps} />);
    
    // Check if the amount is displayed correctly
    expect(screen.getByText('Total Amount')).toBeTruthy();
    expect(screen.getByText('1,76 €')).toBeTruthy();
    
    // Check if the disclaimer is displayed
    expect(screen.getByText('This is a disclaimer text')).toBeTruthy();
  });

  it('calls toggleDrawer when the drawer is closed', () => {
    render(<DrawerDetail {...defaultProps} />);
    
    // Find the close button and click it
    const closeButton = screen.getByLabelText('ariaLabels.close');
    fireEvent.click(closeButton);
    
    // Check if toggleDrawer was called
    expect(defaultProps.toggleDrawer).toHaveBeenCalledTimes(1);
  });

  it('displays the correct amount from amountToShow function', () => {
    const customProps = {
      ...defaultProps,
      amountToShow: () => 250.99,
    };
    
    render(<DrawerDetail {...customProps} />);
    
    // Check if the amount is displayed correctly with the proper format
    expect(screen.getByText('2,51 €')).toBeTruthy();
  });

  it('passes payment notices to DrawerCart component', async () => {
    render(<DrawerDetail {...defaultProps} />);
    
    // Find all accordion buttons
    const accordionButtons = screen.getAllByRole('button');
    
    // Find the first accordion button that contains "Notice A"
    const firstAccordionButton = accordionButtons.find(
      button => button.textContent?.includes('Notice A')
    );
    expect(firstAccordionButton).toBeTruthy();
    
    // Click to expand
    fireEvent.click(firstAccordionButton!);
    
    // Wait for the accordion to expand
    await waitFor(() => {
      // First check if the accordion is expanded
      expect(firstAccordionButton!.getAttribute('aria-expanded')).toBe('true');
      
      // Now check for the notice number and fiscal code in the expanded section
      const expandedSection = document.querySelector('.MuiCollapse-entered');
      expect(expandedSection).toBeTruthy();
      expect(expandedSection!.textContent).toContain('123456789');
      expect(expandedSection!.textContent).toContain('ABCDEF12G34H567I');
    });
  });
  
  it('renders with a single payment notice', () => {
    const singleNoticeProps = {
      ...defaultProps,
      paymentNotices: [samplePaymentNotices[0]],
      amountToShow: () => 100.50,
    };
    
    render(<DrawerDetail {...singleNoticeProps} />);
    
    // Find all accordion buttons
    const accordionButtons = screen.getAllByRole('button');
    
    // Find buttons that contain "Notice A"
    const serviceAButtons = accordionButtons.filter(
      button => button.textContent?.includes('Notice A')
    );
    
    // Check that we have exactly one button for service A
    expect(serviceAButtons.length).toBe(1);
    
    // Check that we don't have any buttons for service B
    const serviceBButtons = accordionButtons.filter(
      button => button.textContent?.includes('Notice B')
    );
    expect(serviceBButtons.length).toBe(0);
    
    // Check if the amount is correct for a single notice with the proper format
    expect(screen.getAllByText('1,01 €')).toBeTruthy();
  });
});