import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorButtons } from '../ErrorButtons';
import { ErrorModalBtn } from '../../../utils/errors/errorsModel';
import { useSmallDevice } from '../../../hooks/useSmallDevice';

// Mock the dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key // Return the key as the translation for simplicity
  })
}));

jest.mock('../../../hooks/useSmallDevice', () => ({
  useSmallDevice: jest.fn()
}));

describe('ErrorButtons Component', () => {
  // Mock data for testing
  const mockHandleClose = jest.fn();
  const mockButtonAction = jest.fn();
  
  const mockButtonsDetail: Array<ErrorModalBtn> = [
    { title: 'button.cancel' },
    { title: 'button.confirm', action: mockButtonAction }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all buttons from buttonsDetail prop', () => {
    // Mock useSmallDevice to return false (desktop view)
    (useSmallDevice as jest.Mock).mockReturnValue(false);
    
    render(
      <ErrorButtons 
        handleClose={mockHandleClose} 
        buttonsDetail={mockButtonsDetail} 
      />
    );
    
    // Check that both buttons are rendered with correct text
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('button.cancel');
    expect(buttons[1]).toHaveTextContent('button.confirm');
  });

  it('calls handleClose when a button without action is clicked', () => {
    (useSmallDevice as jest.Mock).mockReturnValue(false);
    
    render(
      <ErrorButtons 
        handleClose={mockHandleClose} 
        buttonsDetail={mockButtonsDetail} 
      />
    );
    
    // Click the first button (which doesn't have an action)
    const cancelButton = screen.getByText('button.cancel');
    fireEvent.click(cancelButton);
    
    // Check that handleClose was called
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
    expect(mockButtonAction).not.toHaveBeenCalled();
  });

  it('calls the button action when a button with action is clicked', () => {
    (useSmallDevice as jest.Mock).mockReturnValue(false);
    
    render(
      <ErrorButtons 
        handleClose={mockHandleClose} 
        buttonsDetail={mockButtonsDetail} 
      />
    );
    
    // Click the second button (which has an action)
    const confirmButton = screen.getByText('button.confirm');
    fireEvent.click(confirmButton);
    
    // Check that the button action was called
    expect(mockButtonAction).toHaveBeenCalledTimes(1);
    expect(mockHandleClose).not.toHaveBeenCalled();
  });

  it('applies text variant to first button and contained variant to others', () => {
    (useSmallDevice as jest.Mock).mockReturnValue(false);
    
    render(
      <ErrorButtons 
        handleClose={mockHandleClose} 
        buttonsDetail={mockButtonsDetail} 
      />
    );
    
    const buttons = screen.getAllByRole('button');
    
    // First button should have text variant
    expect(buttons[0]).toHaveClass('MuiButton-text');
    expect(buttons[0]).not.toHaveClass('MuiButton-contained');
    
    // Second button should have contained variant
    expect(buttons[1]).toHaveClass('MuiButton-contained');
    expect(buttons[1]).not.toHaveClass('MuiButton-text');
  });

  it('applies specific styles to buttons', () => {
    (useSmallDevice as jest.Mock).mockReturnValue(false);
    
    render(
      <ErrorButtons 
        handleClose={mockHandleClose} 
        buttonsDetail={mockButtonsDetail} 
      />
    );
    
    const buttons = screen.getAllByRole('button');
    
    // Check that buttons have the expected styles
    buttons.forEach(button => {
      expect(button).toHaveStyle({
        width: '100%',
        height: '100%',
        minHeight: '45px'
      });
    });
  });

  it('applies paddingTop: 0 style to Grid items on small devices', () => {
    // Mock useSmallDevice to return true (mobile view)
    (useSmallDevice as jest.Mock).mockReturnValue(true);
    
    const { container } = render(
      <ErrorButtons 
        handleClose={mockHandleClose} 
        buttonsDetail={mockButtonsDetail} 
      />
    );
    
    // Find all Grid items (direct children of the container Grid)
    const gridItems = container.querySelectorAll('.MuiGrid-container > .MuiGrid-item');
    
    // Check that they have paddingTop: 0
    gridItems.forEach(item => {
      expect(item).toHaveStyle('padding-top: 0px');
    });
  });

  it('does not apply paddingTop: 0 style to Grid items on large devices', () => {
    // Mock useSmallDevice to return false (desktop view)
    (useSmallDevice as jest.Mock).mockReturnValue(false);
    
    const { container } = render(
      <ErrorButtons 
        handleClose={mockHandleClose} 
        buttonsDetail={mockButtonsDetail} 
      />
    );
    
    // Find all Grid items
    const gridItems = container.querySelectorAll('.MuiGrid-container > .MuiGrid-item');
    
    // Check that they don't have paddingTop: 0
    gridItems.forEach(item => {
      // The style object should be empty
      expect(item.getAttribute('style')).toBeFalsy();
    });
  });

  it('renders with correct Grid responsive props', () => {
    (useSmallDevice as jest.Mock).mockReturnValue(false);
    
    const { container } = render(
      <ErrorButtons 
        handleClose={mockHandleClose} 
        buttonsDetail={mockButtonsDetail} 
      />
    );
    
    // Get the main container Grid
    const containerGrid = container.querySelector('.MuiGrid-container');
    
    // Check that it exists
    expect(containerGrid).toBeInTheDocument();
    
    // Check for Grid items with correct xs and sm props
    // This is harder to test directly, but we can check for the existence of Grid items
    const gridItems = container.querySelectorAll('.MuiGrid-item');
    expect(gridItems).toHaveLength(2);
    
    // Check that each Grid item has the correct classes for xs=12 and sm=5
    gridItems.forEach(item => {
      expect(item).toHaveClass('MuiGrid-grid-xs-12');
      expect(item).toHaveClass('MuiGrid-grid-sm-5');
    });
  });

  it('handles empty buttonsDetail array', () => {
    (useSmallDevice as jest.Mock).mockReturnValue(false);
    
    render(
      <ErrorButtons 
        handleClose={mockHandleClose} 
        buttonsDetail={[]} 
      />
    );
    
    // Check that no buttons are rendered
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
    
    // But the container should still be rendered
    const container = screen.getByText('', { selector: '.MuiGrid-container' });
    expect(container).toBeInTheDocument();
  });

  it('assigns correct id to buttons', () => {
    (useSmallDevice as jest.Mock).mockReturnValue(false);
    
    render(
      <ErrorButtons 
        handleClose={mockHandleClose} 
        buttonsDetail={mockButtonsDetail} 
      />
    );
    
    // Check that all buttons have the id "closeError"
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('id', 'closeError');
    });
  });
});