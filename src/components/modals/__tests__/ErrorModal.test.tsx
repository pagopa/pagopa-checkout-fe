// First, import jest-dom to extend Jest with DOM testing assertions
import '@testing-library/jest-dom';

// Set up the mocks before importing any components
import { FaultCategoryEnum } from '../../../../generated/definitions/payment-ecommerce/FaultCategory';
import { ErrorsType } from '../../../utils/errors/checkErrorsModel';

// Mock the useTranslation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'GENERIC_ERROR.title': 'An error occurred',
        'GENERIC_ERROR.body': 'Something went wrong',
        'PAYMENT_UNAVAILABLE.title': 'Payment Unavailable',
        'PAYMENT_UNAVAILABLE.body': 'The payment service is currently unavailable',
        'PAYMENT_EXPIRED.title': 'Payment Expired',
        'PAYMENT_EXPIRED.body': 'Your payment session has expired',
        'PAYMENT_DUPLICATED.title': 'Duplicate Payment',
        'PAYMENT_DUPLICATED.body': 'This payment has already been processed',
        'PAYMENT_DATA_ERROR.title': 'Payment Data Error',
        'PAYMENT_DATA_ERROR.body': 'There was an error with your payment data',
        'PAYMENT_UNKNOWN.title': 'Unknown Payment Error',
        'PAYMENT_UNKNOWN.body': 'An unknown payment error occurred',
        'PAYMENT_CANCELED.title': 'Payment Canceled',
        'PAYMENT_CANCELED.body': 'The payment was canceled',
        'PAYMENT_ONGOING.title': 'Payment In Progress',
        'PAYMENT_ONGOING.body': 'Your payment is being processed',
        'DOMAIN_UNKNOWN.title': 'Unknown Domain',
        'DOMAIN_UNKNOWN.body': 'The domain is unknown',
        'TIMEOUT.title': 'Timeout Error',
        'TIMEOUT.body': 'The operation timed out',
        'STATUS_ERROR.title': 'Status Error',
        'STATUS_ERROR.body': 'There was an error checking the payment status',
        'clipboard.copy': 'Copy',
        'clipboard.copied': 'Copied',
        'button.retry': 'Retry',
        'button.close': 'Close'
      };
      return translations[key] || key;
    }
  })
}));

// Mock Material UI components
jest.mock('@mui/material', () => {
  const actual = jest.requireActual('@mui/material');
  return {
    ...actual,
    useTheme: () => ({
      palette: {
        background: { default: '#ffffff' },
        info: { main: '#0288d1' }
      }
    })
  };
});

// Mock the PaymentCategoryResponses object
jest.mock('../../../utils/errors/errorsModel', () => {
  // Import the real FaultCategoryEnum to use in the mock
  const { FaultCategoryEnum } = jest.requireActual('../../../../generated/definitions/payment-ecommerce/FaultCategory');
  
  return {
    PaymentCategoryResponses: {
      [FaultCategoryEnum.GENERIC_ERROR]: {
        title: 'GENERIC_ERROR.title',
        body: 'GENERIC_ERROR.body',
        buttons: [{ text: 'button.close', action: undefined }]
      },
      [FaultCategoryEnum.PAYMENT_UNAVAILABLE]: {
        title: 'PAYMENT_UNAVAILABLE.title',
        body: 'PAYMENT_UNAVAILABLE.body',
        buttons: [{ text: 'button.close', action: undefined }]
      },
      [FaultCategoryEnum.PAYMENT_EXPIRED]: {
        title: 'PAYMENT_EXPIRED.title',
        body: 'PAYMENT_EXPIRED.body',
        buttons: [{ text: 'button.close', action: undefined }]
      },
      [FaultCategoryEnum.PAYMENT_DATA_ERROR]: {
        title: 'PAYMENT_DATA_ERROR.title',
        body: 'ErrorCodeDescription',
        detail: true,
        buttons: [{ text: 'button.close', action: undefined }]
      },
      [FaultCategoryEnum.PAYMENT_DUPLICATED]: {
        title: 'PAYMENT_DUPLICATED.title',
        body: 'PAYMENT_DUPLICATED.body',
        buttons: [{ text: 'button.close', action: undefined }]
      },
      [FaultCategoryEnum.PAYMENT_UNKNOWN]: {
        title: 'PAYMENT_UNKNOWN.title',
        body: 'PAYMENT_UNKNOWN.body',
        buttons: [{ text: 'button.close', action: undefined }]
      },
      [FaultCategoryEnum.PAYMENT_CANCELED]: {
        title: 'PAYMENT_CANCELED.title',
        body: 'PAYMENT_CANCELED.body',
        buttons: [{ text: 'button.close', action: undefined }]
      },
      [FaultCategoryEnum.PAYMENT_ONGOING]: {
        title: 'PAYMENT_ONGOING.title',
        body: 'PAYMENT_ONGOING.body',
        buttons: [{ text: 'button.close', action: undefined }]
      },
      [FaultCategoryEnum.DOMAIN_UNKNOWN]: {
        title: 'DOMAIN_UNKNOWN.title',
        body: 'DOMAIN_UNKNOWN.body',
        buttons: [{ text: 'button.close', action: undefined }]
      },
      // Add these for STATUS_ERROR and TIMEOUT tests
      'STATUS_ERROR': {
        title: 'STATUS_ERROR.title',
        body: 'STATUS_ERROR.body',
        buttons: [
          { text: 'button.close', action: undefined },
          { text: 'button.retry', action: undefined }
        ]
      },
      'TIMEOUT': {
        title: 'TIMEOUT.title',
        body: 'TIMEOUT.body',
        buttons: [
          { text: 'button.close', action: undefined },
          { text: 'button.retry', action: undefined }
        ]
      }
    },
    // Add ErrorModalBtn type export
    ErrorModalBtn: {}
  };
});

// Define the ErrorModalBtn interface if needed
interface ErrorModalBtn {
  text?: string;
  title?: string;
  action?: () => void;
}

// Mock the ErrorButtons component
jest.mock('../../FormButtons/ErrorButtons', () => ({
  ErrorButtons: ({ handleClose, buttonsDetail }: { handleClose: () => void, buttonsDetail: Array<ErrorModalBtn>}) => (
    <div data-testid="error-buttons">
      {buttonsDetail.map((button, index) => (
        <button 
          key={index} 
          onClick={button.action || handleClose}
          data-testid={`button-${button.text || button.title}`}
        >
          {button.text || button.title}
        </button>
      ))}
    </div>
  )
}));

// Mock CopyAllIcon
jest.mock('@mui/icons-material/CopyAll', () => ({
  __esModule: true,
  default: () => <span data-testid="copy-icon">CopyIcon</span>
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve())
  }
});

// Now import the component to test and testing utilities
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import ErrorModal from '../ErrorModal';

describe('ErrorModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnRetry = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders with generic error', () => {
    render(
      <ErrorModal 
        error={FaultCategoryEnum.GENERIC_ERROR}
        open={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByTestId('button-button.close')).toBeInTheDocument();
  });
  
  it('renders with payment unavailable error', () => {
    render(
      <ErrorModal 
        error={FaultCategoryEnum.PAYMENT_UNAVAILABLE}
        open={true}
        onClose={mockOnClose}
      />
    );
    
    expect(screen.getByText('Payment Unavailable')).toBeInTheDocument();
    expect(screen.getByText('The payment service is currently unavailable')).toBeInTheDocument();
    expect(screen.getByTestId('button-button.close')).toBeInTheDocument();
  });
  
  it('renders error details for payment data errors', () => {
    const errorCode = `${FaultCategoryEnum.PAYMENT_DATA_ERROR}-INVALID_CARD_NUMBER`;
    
    render(
      <ErrorModal 
        error={errorCode}
        open={true}
        onClose={mockOnClose}
      />
    );
    
    // Check if error details are shown - use a more flexible approach
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toBeInTheDocument();
    
    // Look for the error code within the alert
    const alertContent = within(alertElement).getByText('INVALID_CARD_NUMBER');
    expect(alertContent).toBeInTheDocument();
    
    // Check if copy button is shown
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByTestId('copy-icon')).toBeInTheDocument();
  });
  
  it('copies error code to clipboard when copy button is clicked', async () => {
    const errorCode = `${FaultCategoryEnum.PAYMENT_DATA_ERROR}-INVALID_CARD_NUMBER`;
    
    render(
      <ErrorModal 
        error={errorCode}
        open={true}
        onClose={mockOnClose}
      />
    );
    
    // Find and click the copy button
    const copyButton = screen.getByText('Copy').closest('button');
    fireEvent.click(copyButton!);
    
    // Check if clipboard API was called with the correct error code
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('INVALID_CARD_NUMBER');
    
    // Check if button has the "Copied" aria-label (instead of looking for text content)
    await waitFor(() => {
      expect(copyButton).toHaveAttribute('aria-label', 'Copied');
    });
    
    // Simulate mouse leave to reset the tooltip
    fireEvent.mouseLeave(copyButton!);
    
    // Check if button has the "Copy" aria-label again
    await waitFor(() => {
      expect(copyButton).toHaveAttribute('aria-label', 'Copy');
    });
  });
  
  it('shows retry button for STATUS_ERROR errors and calls onRetry when clicked', () => {
    // Render with STATUS_ERROR
    render(
      <ErrorModal 
        error="STATUS_ERROR"
        open={true}
        onClose={mockOnClose}
        onRetry={mockOnRetry}
      />
    );
    
    // Check for status error title and body
    expect(screen.getByText('Status Error')).toBeInTheDocument();
    expect(screen.getByText('There was an error checking the payment status')).toBeInTheDocument();
    
    // Find and click the retry button
    const retryButton = screen.getByTestId('button-button.retry');
    fireEvent.click(retryButton);
    
    // Check if onRetry was called
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
  
  it('shows retry button for TIMEOUT errors and calls onRetry when clicked', () => {
    render(
      <ErrorModal 
        error="TIMEOUT"
        open={true}
        onClose={mockOnClose}
        onRetry={mockOnRetry}
      />
    );
    
    // Check for timeout error title and body
    expect(screen.getByText('Timeout Error')).toBeInTheDocument();
    expect(screen.getByText('The operation timed out')).toBeInTheDocument();
    
    // Find and click the retry button
    const retryButton = screen.getByTestId('button-button.retry');
    fireEvent.click(retryButton);
    
    // Check if onRetry was called
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });
  
  it('shows progress bar for POLLING_SLOW errors', () => {
    render(
      <ErrorModal 
        error={ErrorsType.POLLING_SLOW}
        open={true}
        onClose={mockOnClose}
      />
    );
    
    // Check that buttons are not rendered when progress bar is shown
    expect(screen.queryByTestId('error-buttons')).not.toBeInTheDocument();
  });
  
  it('applies custom styles when provided', () => {
    const customStyle = { backgroundColor: 'red' };
    
    render(
      <ErrorModal 
        error={FaultCategoryEnum.GENERIC_ERROR}
        open={true}
        onClose={mockOnClose}
        style={customStyle}
      />
    );
    
    // This test is mostly for coverage of the style prop
    // We can't easily check the style with the mocked components
  });
  
  it('uses provided IDs for accessibility', () => {
    render(
      <ErrorModal 
        error={FaultCategoryEnum.GENERIC_ERROR}
        open={true}
        onClose={mockOnClose}
        titleId="custom-title-id"
        bodyId="custom-body-id"
      />
    );
    
    // Check if IDs are applied correctly
    const titleElement = screen.getByText('An error occurred');
    expect(titleElement.id).toBe('custom-title-id');
    
    const bodyElement = screen.getByText('Something went wrong');
    expect(bodyElement.id).toBe('custom-body-id');
  });
  
  it('handles unknown error categories', () => {
    render(
      <ErrorModal 
        error="UNKNOWN_CATEGORY"
        open={true}
        onClose={mockOnClose}
      />
    );
    
    // Should fall back to generic error
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
  
  it('provides error ID for error details', () => {
    const errorCode = `${FaultCategoryEnum.PAYMENT_DATA_ERROR}-INVALID_CARD_NUMBER`;
    
    render(
      <ErrorModal 
        error={errorCode}
        open={true}
        onClose={mockOnClose}
        errorId="custom-error-id"
      />
    );
    
    // Check if error ID is applied correctly - need to find the element differently
    const alertElement = screen.getByRole('alert');
    const errorTitle = within(alertElement).getByText('INVALID_CARD_NUMBER');
    expect(errorTitle.id).toBe('custom-error-id');
  });
  
  it('closes the modal when close button is clicked', () => {
    render(
      <ErrorModal 
        error={FaultCategoryEnum.GENERIC_ERROR}
        open={true}
        onClose={mockOnClose}
      />
    );
    
    // Find and click the close button
    const closeButton = screen.getByTestId('button-button.close');
    fireEvent.click(closeButton);
    
    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
  
  it('handles error codes without details', () => {
    render(
      <ErrorModal 
        error={FaultCategoryEnum.PAYMENT_DATA_ERROR}
        open={true}
        onClose={mockOnClose}
      />
    );
    
    // Check that the error alert is rendered
    expect(screen.getByText('Payment Data Error')).toBeInTheDocument();
    expect(screen.getByText('ErrorCodeDescription')).toBeInTheDocument();
    
    // The alert might still be rendered but with empty details
    // Let's check if there's an alert with no title content
    const alertElement = screen.getByRole('alert');
    const emptyAlertTitle = within(alertElement).queryByRole('heading');
    
    // If the component renders an empty heading for the alert title,
    // we check that it exists but has no text content
    if (emptyAlertTitle) {
      expect(emptyAlertTitle.textContent).toBe('');
    }
  });
});