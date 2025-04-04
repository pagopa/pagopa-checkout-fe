import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';
import { CheckoutRoutes } from '../../../routes/models/routeModel';
import { SessionItems } from '../../../utils/storage/sessionStorage';
import { evaluateFeatureFlag } from '../../../utils/api/helper';
import { getTotalFromCart } from '../../../utils/cart/cart';
import { moneyFormat } from '../../../utils/form/formatters';
import { getSessionItem, setSessionItem } from '../../../utils/storage/sessionStorage';
import { PaymentNotice } from 'features/payment/models/paymentModel';

// Mock all the imported modules
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
      t: (key: string) => {
        const translations: Record<string, string> = {
          'mainPage.header.detail.detailButton': 'View Payment Details',
        };
        return translations[key] || key;
      },
    }),
}));

jest.mock('../../../utils/storage/sessionStorage', () => ({
  SessionItems: {
    cart: 'cart',
    paymentInfo: 'paymentInfo',
    enableAuthentication: 'enableAuthentication',
  },
  getSessionItem: jest.fn(),
  setSessionItem: jest.fn(),
}));

jest.mock('../../../utils/api/helper', () => ({
  evaluateFeatureFlag: jest.fn(),
}));

jest.mock('../../../utils/cart/cart', () => ({
  getTotalFromCart: jest.fn(),
}));

jest.mock('../../../utils/form/formatters', () => ({
  moneyFormat: jest.fn((amount) => `€${amount.toFixed(2)}`),
}));

jest.mock('../../../utils/transformers/paymentTransformers', () => ({
  paymentSubjectTransform: jest.fn((text) => text ? `Transformed: ${text}` : ''),
}));

jest.mock('../../Header/DrawerDetail', () => ({
  __esModule: true,
  default: ({ drawstate, toggleDrawer, paymentNotices, amountToShow }: {
    drawstate: boolean;
    toggleDrawer: () => void;
    paymentNotices: PaymentNotice[];
    amountToShow: () => number;
  }) => (
    <div data-testid="drawer-detail">
      <span data-testid="drawer-state">{drawstate.toString()}</span>
      <span data-testid="payment-notices-count">{paymentNotices.length}</span>
      <span data-testid="amount-to-show">{amountToShow()}</span>
      <button data-testid="close-drawer" onClick={toggleDrawer}>Close</button>
    </div>
  ),
}));

jest.mock('../LoginHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="login-header">Login Header Component</div>,
}));

jest.mock('../SkipToContent', () => ({
  __esModule: true,
  default: () => <div data-testid="skip-to-content">Skip To Content Component</div>,
}));

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.enableAuthentication) return null;
      if (key === SessionItems.paymentInfo) return null;
      if (key === SessionItems.cart) return null;
      return null;
    });
    
    (getTotalFromCart as jest.Mock).mockReturnValue(0);
    (evaluateFeatureFlag as jest.Mock).mockImplementation((_flag, _onError, onSuccess) => {
      onSuccess({ enabled: false });
      return Promise.resolve();
    });
  });

  test('renders basic header without payment info', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    // Check for logo
    expect(screen.getByAltText('pagoPA')).toBeInTheDocument();
    
    // Check for SkipToContent
    expect(screen.getByTestId('skip-to-content')).toBeInTheDocument();
    
    // Payment summary button should not be visible
    expect(screen.queryByRole('button', { name: /View Payment Details/i })).not.toBeInTheDocument();
    
    // Drawer should be present but closed
    expect(screen.getByTestId('drawer-detail')).toBeInTheDocument();
    expect(screen.getByTestId('drawer-state').textContent).toBe('false');
  });

  test('renders header with payment info and summary button', () => {
    // Mock payment info
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.paymentInfo) {
        return {
          paName: 'Test Organization',
          description: 'Payment for services',
          amount: 100.5,
          rptId: '12345678901234567890',
          paFiscalCode: '12345678901',
          creditorReferenceId: 'REF123',
        };
      }
      return null;
    });

    render(
      <MemoryRouter initialEntries={['/payment-method']}>
        <Header />
      </MemoryRouter>
    );

    // Check for payment summary button
    const summaryButton = screen.getByRole('button', { name: /View Payment Details/i });
    expect(summaryButton).toBeInTheDocument();
    expect(summaryButton.textContent).toContain('€100.50');
    
    // Check moneyFormat was called with the correct amount
    expect(moneyFormat).toHaveBeenCalledWith(100.5);
  });

  test('renders header with cart info and summary button', () => {
    // Mock cart info
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.cart) {
        return {
          paymentNotices: [
            {
              noticeNumber: '123456789012',
              fiscalCode: '12345678901',
              amount: 50.25,
              companyName: 'Company A',
              description: 'Service A',
            },
            {
              noticeNumber: '987654321098',
              fiscalCode: '98765432109',
              amount: 75.75,
              companyName: 'Company B',
              description: 'Service B',
            },
          ],
        };
      }
      return null;
    });

    // Mock total calculation
    (getTotalFromCart as jest.Mock).mockReturnValue(126);

    render(
      <MemoryRouter initialEntries={['/payment-method']}>
        <Header />
      </MemoryRouter>
    );

    // Check for payment summary button
    const summaryButton = screen.getByRole('button', { name: /View Payment Details/i });
    expect(summaryButton).toBeInTheDocument();
    expect(summaryButton.textContent).toContain('€126.00');
    
    // Check getTotalFromCart was called
    expect(getTotalFromCart).toHaveBeenCalled();
  });

  test('hides summary button on ignored routes', () => {
    // Mock payment info
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.paymentInfo) {
        return {
          paName: 'Test Organization',
          description: 'Payment for services',
          amount: 100.5,
        };
      }
      return null;
    });

    render(
      <MemoryRouter initialEntries={[`/${CheckoutRoutes.DATI_PAGAMENTO}`]}>
        <Header />
      </MemoryRouter>
    );

    // Summary button should not be visible on ignored routes
    expect(screen.queryByRole('button', { name: /View Payment Details/i })).not.toBeInTheDocument();
  });

  test('hides payment header on specific routes', () => {
    render(
      <MemoryRouter initialEntries={[`/${CheckoutRoutes.AUTH_CALLBACK}`]}>
        <Header />
      </MemoryRouter>
    );

    // Logo should not be visible when header is hidden
    expect(screen.queryByAltText('pagoPA')).not.toBeInTheDocument();
  });

  test('opens drawer when summary button is clicked', () => {
    // Mock payment info
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.paymentInfo) {
        return {
          paName: 'Test Organization',
          description: 'Payment for services',
          amount: 100.5,
        };
      }
      return null;
    });

    render(
      <MemoryRouter initialEntries={['/payment-method']}>
        <Header />
      </MemoryRouter>
    );

    // Drawer should be closed initially
    expect(screen.getByTestId('drawer-state').textContent).toBe('false');
    
    // Click summary button
    fireEvent.click(screen.getByRole('button', { name: /View Payment Details/i }));
    
    // Drawer should be open
    expect(screen.getByTestId('drawer-state').textContent).toBe('true');
  });

  test('closes drawer when close button is clicked', () => {
    // Mock payment info and set drawer open
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.paymentInfo) {
        return {
          paName: 'Test Organization',
          description: 'Payment for services',
          amount: 100.5,
        };
      }
      return null;
    });

    render(
      <MemoryRouter initialEntries={['/payment-method']}>
        <Header />
      </MemoryRouter>
    );

    // Open the drawer
    fireEvent.click(screen.getByRole('button', { name: /View Payment Details/i }));
    expect(screen.getByTestId('drawer-state').textContent).toBe('true');
    
    // Close the drawer
    fireEvent.click(screen.getByTestId('close-drawer'));
    expect(screen.getByTestId('drawer-state').textContent).toBe('false');
  });

  test('shows login header when authentication is enabled', async () => {
    // Mock authentication enabled
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.enableAuthentication) return 'true';
      return null;
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    // Login header should be visible
    expect(screen.getByTestId('login-header')).toBeInTheDocument();
  });

  test('fetches authentication feature flag on mount when not in session', async () => {
    // Mock feature flag evaluation to enable authentication
    (evaluateFeatureFlag as jest.Mock).mockImplementation((_flag, _onError, onSuccess) => {
      onSuccess({ enabled: true });
      return Promise.resolve();
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    // Wait for useEffect to complete
    await waitFor(() => {
      // Check if evaluateFeatureFlag was called
      expect(evaluateFeatureFlag).toHaveBeenCalled();
      
      // Check if setSessionItem was called with the right values
      expect(setSessionItem).toHaveBeenCalledWith(SessionItems.enableAuthentication, 'true');
    });

    // Login header should be visible after feature flag evaluation
    expect(screen.getByTestId('login-header')).toBeInTheDocument();
  });

  test('handles feature flag evaluation error', async () => {
    // Mock feature flag evaluation to fail
    (evaluateFeatureFlag as jest.Mock).mockImplementation((_flag, onError) => {
      onError('Test error');
      return Promise.resolve();
    });

    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <MemoryRouter initialEntries={['/']}>
        <Header />
      </MemoryRouter>
    );

    // Wait for useEffect to complete
    await waitFor(() => {
      // Check if evaluateFeatureFlag was called
      expect(evaluateFeatureFlag).toHaveBeenCalled();
      
      // Check if console.error was called
      expect(consoleSpy).toHaveBeenCalled();
    });

    // Login header should not be visible after feature flag evaluation error
    expect(screen.queryByTestId('login-header')).not.toBeInTheDocument();

    // Restore console.error
    consoleSpy.mockRestore();
  });

  test('passes correct payment notices to drawer', () => {
    // Mock cart info
    const cartData = {
      paymentNotices: [
        {
          noticeNumber: '123456789012',
          fiscalCode: '12345678901',
          amount: 50.25,
          companyName: 'Company A',
          description: 'Service A',
        },
        {
          noticeNumber: '987654321098',
          fiscalCode: '98765432109',
          amount: 75.75,
          companyName: 'Company B',
          description: 'Service B',
        },
      ],
    };
    
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.cart) return cartData;
      return null;
    });

    render(
      <MemoryRouter initialEntries={['/payment-method']}>
        <Header />
      </MemoryRouter>
    );

    // Check if drawer has the correct number of payment notices
    expect(screen.getByTestId('payment-notices-count').textContent).toBe('2');
  });

  test('creates single payment notice from payment info when no cart', () => {
    // Mock payment info
    const paymentInfo = {
      paName: 'Test Organization',
      description: 'Payment for services',
      amount: 100.5,
      rptId: '12345678901234567890',
      paFiscalCode: '12345678901',
      creditorReferenceId: 'REF123',
    };
    
    (getSessionItem as jest.Mock).mockImplementation((key) => {
      if (key === SessionItems.paymentInfo) return paymentInfo;
      return null;
    });

    render(
      <MemoryRouter initialEntries={['/payment-method']}>
        <Header />
      </MemoryRouter>
    );

    // Check if drawer has one payment notice
    expect(screen.getByTestId('payment-notices-count').textContent).toBe('1');
  });
});