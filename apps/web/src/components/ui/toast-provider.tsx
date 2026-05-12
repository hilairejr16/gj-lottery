'use client';

import { Toaster } from 'react-hot-toast';

/**
 * Client-only wrapper so react-hot-toast is never imported
 * in a server-component context (module-level browser APIs).
 */
export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#152035',
          color: '#ffffff',
          border: '1px solid #1E3A5F',
        },
        success: { iconTheme: { primary: '#16A34A', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
      }}
    />
  );
}
