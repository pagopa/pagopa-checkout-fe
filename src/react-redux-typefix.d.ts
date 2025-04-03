// src/types/react-redux.d.ts

declare module 'react-redux-typefix' {
    import * as React from 'react';
  
    // Custom typing for `Provider` component
    export interface ProviderProps {
      store: any;
      children: React.ReactNode;
    }
  
    export class Provider extends React.Component<ProviderProps> {}
}
  