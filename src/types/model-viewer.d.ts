import type * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        'camera-controls'?: boolean;
        'auto-rotate'?: boolean;
        'auto-rotate-delay'?: string;
        'rotation-per-second'?: string;
        'camera-orbit'?: string;
        'field-of-view'?: string;
        'shadow-intensity'?: string;
        exposure?: string;
      };
    }
  }
}

export {};