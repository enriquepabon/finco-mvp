/**
 * Sentry Client-Side Configuration
 *
 * Initializes Sentry error tracking for the browser/client-side of the application.
 * Captures errors, performance metrics, and user feedback.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const RELEASE = process.env.NEXT_PUBLIC_APP_VERSION || 'development';

/**
 * Initialize Sentry on the client side
 * Only enabled if SENTRY_DSN is configured
 */
if (SENTRY_DSN) {
  Sentry.init({
    // Sentry DSN (Data Source Name)
    dsn: SENTRY_DSN,

    // Environment (development, staging, production)
    environment: ENVIRONMENT,

    // Application release version
    release: RELEASE,

    // Tracing - Adjust sample rate in production
    // 1.0 = 100% of transactions, 0.1 = 10%
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Session Replay - Captures user sessions for debugging
    // Adjust sample rates based on traffic and budget
    replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

    // Integrations
    integrations: [
      // Session replay integration
      Sentry.replayIntegration({
        maskAllText: true, // Mask all text for privacy
        blockAllMedia: true, // Block all media for privacy
      }),
      // Browser tracing integration
      Sentry.browserTracingIntegration(),
    ],

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      // Common user errors
      'User cancelled',
    ],

    // Before sending events, you can modify or drop them
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (ENVIRONMENT === 'development' && !process.env.NEXT_PUBLIC_SENTRY_DEBUG) {
        return null;
      }

      // Filter out sensitive data
      if (event.request?.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
      }

      return event;
    },

    // Debug mode (verbose logging)
    debug: false,
  });
}
