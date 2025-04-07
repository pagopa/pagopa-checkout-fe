import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkeletonFieldContainer from '../SkeletonFieldContainer';
import { ThemeProvider, createTheme } from '@mui/material';

// Create a theme for testing
const theme = createTheme();

describe('SkeletonFieldContainer', () => {
  it('renders without errors', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <SkeletonFieldContainer />
      </ThemeProvider>
    );
    
    // Check if the component renders by looking for skeleton elements
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders with the correct structure', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <SkeletonFieldContainer />
      </ThemeProvider>
    );
    
    // Get all skeletons
    const skeletons = container.querySelectorAll('.MuiSkeleton-root');
    
    // We should have 3 skeletons - title, description, and amount
    expect(skeletons.length).toBe(3);
    
    // Check for Typography elements
    const typographyElements = container.querySelectorAll('.MuiTypography-root');
    expect(typographyElements.length).toBe(2);
    
    // Check Box structure
    const boxElements = container.querySelectorAll('.MuiBox-root');
    expect(boxElements.length).toBe(3); // Main container, content box, and inner box
  });

  it('applies custom sx props correctly', () => {
    const customSx = { 
      backgroundColor: 'rgb(240, 240, 240)',
      height: '150px'
    };
    
    const { container } = render(
      <ThemeProvider theme={theme}>
        <SkeletonFieldContainer sx={customSx} />
      </ThemeProvider>
    );
    
    // Check if custom styles are applied to the main container
    // Get the first Box element which should be our container
    const mainContainer = container.querySelector('.MuiBox-root');
    
    // Check for custom height
    expect(mainContainer).toHaveStyle('height: 150px');
    expect(mainContainer).toHaveStyle('background-color: rgb(240, 240, 240)');
  });

  it('has the correct default dimensions', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <SkeletonFieldContainer />
      </ThemeProvider>
    );
    
    // Get the main container
    const mainContainer = container.querySelector('.MuiBox-root');
    
    // The default height should be 106px
    expect(mainContainer).toHaveStyle('height: 106px');
    
    // Title skeleton (first skeleton in the first Typography)
    const titleSkeleton = container.querySelector('.MuiTypography-sidenav .MuiSkeleton-root');
    expect(titleSkeleton).toHaveStyle('width: 125px');
    expect(titleSkeleton).toHaveStyle('height: 40px');
    
    // Description skeleton (first skeleton in the second Typography)
    const descriptionSkeleton = container.querySelector('.MuiTypography-body2 .MuiSkeleton-root');
    expect(descriptionSkeleton).toHaveStyle('width: 188px');
    expect(descriptionSkeleton).toHaveStyle('height: 24px');
    
    // Amount skeleton (last skeleton, direct child of the main container)
    const amountSkeleton = container.querySelectorAll('.MuiSkeleton-root')[2];
    expect(amountSkeleton).toHaveStyle('width: 46px');
    expect(amountSkeleton).toHaveStyle('height: 20px');
  });

  it('has responsive width based on viewport', () => {
    const { container } = render(
      <ThemeProvider theme={theme}>
        <SkeletonFieldContainer />
      </ThemeProvider>
    );
    
    // Get the main container
    const mainContainer = container.querySelector('.MuiBox-root');
    
    // Check that width is set to 100%
    expect(mainContainer).toHaveStyle('width: 100%');
    
    // Check for border bottom styling
    expect(mainContainer).toHaveStyle('border-bottom: 1px solid');
  });
});