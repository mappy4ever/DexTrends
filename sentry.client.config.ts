// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Environment
    environment: process.env.NODE_ENV,

    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Session Replay - only in production
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,

    // Filtering
    beforeSend(event) {
      // Filter out extension errors
      if (event.exception?.values?.[0]?.stacktrace?.frames?.some(
        frame => frame.filename?.includes('chrome-extension')
      )) {
        return null;
      }
      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Network errors that are expected
      'Failed to fetch',
      'NetworkError',
      'Load failed',
      // Browser extension errors
      'chrome-extension',
      'moz-extension',
      // User actions
      'ResizeObserver loop limit exceeded',
      // Next.js hydration (usually not actionable)
      'Hydration failed',
    ],

    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
  });
}
