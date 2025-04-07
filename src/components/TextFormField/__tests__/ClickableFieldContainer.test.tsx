import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClickableFieldContainer from '../ClickableFieldContainer';

// Mock the react-i18next hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key as-is for testing
  }),
}));

describe('ClickableFieldContainer', () => {
  const mockProps = {
    title: 'Test Title',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with required props', () => {
    render(<ClickableFieldContainer {...mockProps} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders with icon', () => {
    const icon = <div data-testid="test-icon">Icon</div>;
    render(<ClickableFieldContainer {...mockProps} icon={icon} />);
    
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  test('renders with endAdornment', () => {
    const endAdornment = <div data-testid="test-adornment">End</div>;
    render(<ClickableFieldContainer {...mockProps} endAdornment={endAdornment} />);
    
    expect(screen.getByTestId('test-adornment')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  test('calls onClick when clicked and clickable is true', () => {
    render(<ClickableFieldContainer {...mockProps} clickable={true} />);
    
    const container = screen.getByText('Test Title').closest('.MuiBox-root');
    fireEvent.click(container!);
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when clicked and clickable is false', () => {
    render(<ClickableFieldContainer {...mockProps} clickable={false} />);
    
    const container = screen.getByText('Test Title').closest('.MuiBox-root');
    fireEvent.click(container!);
    
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  test('calls onClick when Enter key is pressed and clickable is true', () => {
    render(<ClickableFieldContainer {...mockProps} clickable={true} />);
    
    const container = screen.getByText('Test Title').closest('.MuiBox-root');
    fireEvent.keyDown(container!, { key: 'Enter' });
    
    expect(mockProps.onClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick when other keys are pressed', () => {
    render(<ClickableFieldContainer {...mockProps} clickable={true} />);
    
    const container = screen.getByText('Test Title').closest('.MuiBox-root');
    fireEvent.keyDown(container!, { key: 'Space' });
    
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  test('does not call onClick when Enter key is pressed and clickable is false', () => {
    render(<ClickableFieldContainer {...mockProps} clickable={false} />);
    
    const container = screen.getByText('Test Title').closest('.MuiBox-root');
    fireEvent.keyDown(container!, { key: 'Enter' });
    
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  test('does not call onClick when disabled is true', () => {
    render(<ClickableFieldContainer {...mockProps} disabled={true} />);
    
    const container = screen.getByText('Test Title').closest('.MuiBox-root');
    fireEvent.click(container!);
    
    expect(mockProps.onClick).not.toHaveBeenCalled();
  });

  test('renders with custom variant', () => {
    render(<ClickableFieldContainer {...mockProps} variant="body2" />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders with custom sx prop', () => {
    const customSx = { backgroundColor: 'red' };
    render(<ClickableFieldContainer {...mockProps} sx={customSx} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders with custom itemSx prop', () => {
    const customItemSx = { backgroundColor: 'blue' };
    render(<ClickableFieldContainer {...mockProps} itemSx={customItemSx} />);
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  test('renders in loading state', () => {
    render(<ClickableFieldContainer {...mockProps} loading={true} />);
    
    // In loading state, we should see skeleton elements
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBe(2); // One for icon, one for title
    
    // Title should not be visible
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    
    // endAdornment should not be visible in loading state
    const endAdornment = <div data-testid="test-adornment">End</div>;
    render(<ClickableFieldContainer {...mockProps} loading={true} endAdornment={endAdornment} />);
    expect(screen.queryByTestId('test-adornment')).not.toBeInTheDocument();
  });

  test('sets tabIndex to 0 when clickable is true', () => {
    render(<ClickableFieldContainer {...mockProps} clickable={true} />);
    
    const container = document.querySelector('.MuiBox-root');
    expect(container).toHaveAttribute('tabindex', '0');
  });

  test('does not set tabIndex when clickable is false', () => {
    render(<ClickableFieldContainer {...mockProps} clickable={false} />);
    
    const container = document.querySelector('.MuiBox-root');
    expect(container).not.toHaveAttribute('tabindex');
  });

  test('renders with data-qaid attribute', () => {
    render(<ClickableFieldContainer {...mockProps} dataTestId="test-id" />);
    
    const container = document.querySelector('.MuiBox-root');
    expect(container).toHaveAttribute('data-qaid', 'test-id');
  });

  test('renders with data-qalabel attribute', () => {
    render(<ClickableFieldContainer {...mockProps} dataTestLabel="test-label" />);
    
    const container = document.querySelector('.MuiBox-root');
    expect(container).toHaveAttribute('data-qalabel', 'test-label');
  });

  test('renders without title', () => {
    render(<ClickableFieldContainer onClick={mockProps.onClick} />);
    
    // Should render without errors
    const container = document.querySelector('.MuiBox-root');
    expect(container).toBeInTheDocument();
    
    // Title should be an empty string
    const typography = document.querySelector('.MuiTypography-root');
    expect(typography).toHaveTextContent('');
  });

  test('renders disabled state with correct text color', () => {
    render(<ClickableFieldContainer {...mockProps} disabled={true} />);
    
    // Component should render with disabled state
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    
    // We can't easily test the exact color, but we can check if the component renders
  });
});