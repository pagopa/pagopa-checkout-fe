import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SkeletonFieldContainer from '../SkeletonFieldContainer';
import { ThemeProvider, createTheme } from '@mui/material';

// Create a theme for testing
const theme = createTheme();

describe('SkeletonFieldContainer', () => {
  it('renders without crashing', () => {
    render(
      <ThemeProvider theme={theme}>
        <SkeletonFieldContainer />
      </ThemeProvider>
    );
    
    // Check if the component renders by looking for skeleton elements
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders with the correct structure', () => {
    render(
      <ThemeProvider theme={theme}>
        <SkeletonFieldContainer />
      </ThemeProvider>
    );
    
    // Get all skeletons
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    
    // We should have at least 3 skeletons
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
    
    // Check for Typography elements
    const typographyElements = document.querySelectorAll('.MuiTypography-root');
    expect(typographyElements.length).toBeGreaterThanOrEqual(2);
  });

  it('applies custom sx props correctly', () => {
    const customSx = { 
      backgroundColor: 'rgb(240, 240, 240)',
      height: '150px'
    };
    
    render(
      <ThemeProvider theme={theme}>
        <SkeletonFieldContainer sx={customSx} />
      </ThemeProvider>
    );
    
    // Check if custom styles are applied to the main container
    // Get the first Box element which should be our container
    const container = document.querySelector('.MuiBox-root');
    
    // Check for custom height
    expect(container).toHaveStyle('height: 150px');
  });

  it('has the correct default dimensions', () => {
    render(
      <ThemeProvider theme={theme}>
        <SkeletonFieldContainer />
      </ThemeProvider>
    );
    
    // Get all skeletons
    const skeletons = document.querySelectorAll('.MuiSkeleton-root');
    
    // Check that we have the expected number of skeletons
    expect(skeletons.length).toBeGreaterThanOrEqual(3);
    
    // Check the main container height
    const container = document.querySelector('.MuiBox-root');
    
    // The default height should be 106px
    expect(container).toHaveStyle('height: 106px');
  });

  it('has responsive width based on viewport', () => {
    render(
      <ThemeProvider theme={theme}>
        <SkeletonFieldContainer />
      </ThemeProvider>
    );
    
    // Get the main container
    const container = document.querySelector('.MuiBox-root');
    
    // Check that width is set to 100%
    expect(container).toHaveStyle('width: 100%');
  });
});