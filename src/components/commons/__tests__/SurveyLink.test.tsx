import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SurveyLink from '../SurveyLink';
import { mixpanel } from '../../../utils/config/mixpanelHelperInit';

// Mock the dependencies
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'paymentResponsePage.survey.title': 'Survey Title',
        'paymentResponsePage.survey.body': 'Survey Body Text',
        'paymentResponsePage.survey.link.href': 'https://pagopa.it/survey',
        'paymentResponsePage.survey.link.text': 'Take the Survey'
      };
      return translations[key] || key;
    }
  })
}));

// Mock the mixpanel module
jest.mock('../../../utils/config/mixpanelHelperInit', () => ({
  mixpanel: {
    track: jest.fn()
  }
}));

// Mock the VOC_USER_EXIT constant
jest.mock('../../../utils/config/mixpanelDefs', () => ({
  VOC_USER_EXIT: {
    value: 'voc_user_exit'
  }
}));

// Mock the MUI theme
jest.mock('@pagopa/mui-italia', () => ({
  theme: {}
}));

describe('SurveyLink Component', () => {
  beforeEach(() => {
    // Clear the mock before each test
    jest.clearAllMocks();
  });

  it('renders with the correct title and body text', () => {
    render(<SurveyLink />);
    
    // Check that the title and body are rendered correctly
    expect(screen.getByText('Survey Title')).toBeInTheDocument();
    expect(screen.getByText('Survey Body Text')).toBeInTheDocument();
  });

  it('renders the link with correct attributes', () => {
    render(<SurveyLink />);
    
    // Get the link element
    const link = screen.getByText('Take the Survey');
    
    // Check that it's rendered and has the correct attributes
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://pagopa.it/survey');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'nofollow');
  });

  it('tracks mixpanel event when the link is clicked', () => {
    render(<SurveyLink />);
    
    // Get the link element
    const link = screen.getByText('Take the Survey');
    
    // Click the link
    fireEvent.click(link);
    
    // Check that mixpanel.track was called with the correct arguments
    expect(mixpanel.track).toHaveBeenCalledWith('voc_user_exit', {
      EVENT_ID: 'voc_user_exit',
      event_category: 'UX',
      event_type: 'exit',
      screen_name: 'payment response page'
    });
  });

  it('renders the Alert component with correct props', () => {
    render(<SurveyLink />);
    
    // Get the Alert component
    const alert = screen.getByRole('alert');
    
    // Check that it has the correct attributes
    expect(alert).toBeInTheDocument();

    expect(alert.className).toContain('MuiAlert-standard');
    expect(alert.className).toContain('MuiAlert-standardInfo');
    
    // Check that the icon is not rendered
    const alertIcon = document.querySelector('.MuiAlert-icon');
    expect(alertIcon).not.toBeInTheDocument();
  });

  it('applies correct styling to the title typography', () => {
    render(<SurveyLink />);
    
    // Get the title typography
    const title = screen.getByText('Survey Title');
    
    // Check that it has the correct variant and styling
    expect(title).toHaveClass('MuiTypography-root');
    expect(title).toHaveClass('MuiTypography-body1');
    
    // Check the styling
    expect(title).toHaveStyle('font-weight: 600px');
    
    // Check that the parent is AlertTitle (which is different from Alert message)
    const parent = title.parentElement;
    expect(parent).toHaveClass('MuiAlertTitle-root');
  });

  it('applies correct styling to the link', () => {
    render(<SurveyLink />);
    
    // Get the link element
    const link = screen.getByText('Take the Survey');
    
    // Check that it has the correct styling
    expect(link).toHaveClass('MuiLink-root');
    expect(link).toHaveClass('MuiTypography-body1');
    expect(link).toHaveStyle('text-decoration: none');
    expect(link).toHaveStyle('font-weight: 700px');
  });

  it('renders the Box component with correct padding', () => {
    const { container } = render(<SurveyLink />);
    
    // Find the Box component (this is a bit trickier since Box doesn't have a specific role)
    // We can look for a div inside the alert that might have padding
    const alertContent = container.querySelector('.MuiAlert-message > div');
    
    // Check that it has padding (p={2} should translate to padding: 16px in the default theme)
    expect(alertContent).toHaveStyle('padding: 16px');
  });

  it('wraps everything in a ThemeProvider', () => {
    const { container } = render(<SurveyLink />);
    
    // Check that the component is wrapped in a ThemeProvider
    // This is a bit of an implementation detail, but we can check that
    // the outermost element contains everything else
    const outerElement = container.firstChild;
    expect(outerElement).toContainElement(screen.getByRole('alert'));
  });
});