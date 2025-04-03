declare module 'react-google-recaptcha' {
    import React, { Ref } from 'react';
  
    // Define the props for the ReCAPTCHA component
    interface ReCAPTCHAProps {
      size?: 'compact' | 'normal' | 'invisible'; // Available sizes for reCAPTCHA
      sitekey: string; // The site key for Google reCAPTCHA
      onChange?: (value: string | null) => void; // Callback triggered when reCAPTCHA value changes
      theme?: 'light' | 'dark'; // Optional theme for reCAPTCHA
      type?: 'image' | 'audio'; // Optional type of reCAPTCHA
      tabindex?: number; // Optional tabindex for accessibility
      ref?: Ref<ReCAPTCHA>; // Allow the component to accept a ref
    }
  
    // Extend the ReCAPTCHA component with reset and executeAsync methods
    interface ReCAPTCHA extends React.FC<ReCAPTCHAProps> {
      reset: () => void; // Reset method to reset the widget
      executeAsync: () => Promise<string>; // executeAsync method to trigger verification
    }
  
    // Declare the ReCAPTCHA component with the added methods
    const ReCAPTCHA: ReCAPTCHA;
  
    export default ReCAPTCHA;
  }
  