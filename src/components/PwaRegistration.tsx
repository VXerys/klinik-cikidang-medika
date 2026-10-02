'use client';

import { useEffect } from 'react';

export default function PwaRegistration() {
  useEffect(() => {
    // A service worker in development would cache dev chunks and keep serving
    // stale code, so it is registered only in production builds.
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Install simply stays a browser tab; the app works either way.
      });
    };

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
