/**
 * Sentry Edge Runtime Configuration
 *
 * Initializes Sentry error tracking for Edge Runtime functions.
 * Used by Next.js middleware and edge API routes.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const RELEASE = process.env.NEXT_PUBLIC_APP_VERSION || 'development';

/**
 * Initialize Sentry for Edge Runtime
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

    // Tracing - Edge runtime transaction sampling
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Before sending events, you can modify or drop them
    beforeSend(event) {
      // Don't send events in development unless explicitly enabled
      if (ENVIRONMENT === 'development' && !process.env.SENTRY_DEBUG) {
        return null;
      }

      // Filter out sensitive data
      if (event.request?.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
      }

      return event;
    },

    // Debug mode
    debug: false,
  });
}
