declare module 'react-qr-reader' {
    import React, { Ref } from 'react';
  
    // Define props for the QrReader component
    interface QrReaderProps {
      delay: number;
      onError: (error: string) => void;
      onScan: (data: string) => void;
      style?: React.CSSProperties;
      legacyMode?: boolean;
      ref?: Ref<any>;  // Allow the component to accept a ref
    }
  
    // Declare QrReader as a React component that accepts QrReaderProps
    const QrReader: React.FC<QrReaderProps>;
  
    export default QrReader;
  }
  