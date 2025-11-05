/**
 * Sentry Server-Side Configuration
 *
 * Initializes Sentry error tracking for the server-side of the application.
 * Captures API errors, server-side rendering errors, and background jobs.
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const RELEASE = process.env.NEXT_PUBLIC_APP_VERSION || 'development';

/**
 * Initialize Sentry on the server side
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

    // Tracing - Server-side transaction sampling
    // Lower rate for high-traffic production servers
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.05 : 1.0,

    // Integrations
    integrations: [
      // Node.js specific integrations
      Sentry.prismaIntegration(), // If using Prisma
      Sentry.httpIntegration({
        tracing: true,
      }),
    ],

    // Ignore specific errors
    ignoreErrors: [
      // Expected errors
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      // Rate limiting
      'Too Many Requests',
    ],

    // Before sending events, you can modify or drop them
    beforeSend(event, hint) {
      // Don't send events in development unless explicitly enabled
      if (ENVIRONMENT === 'development' && !process.env.SENTRY_DEBUG) {
        return null;
      }

      // Filter out sensitive data
      if (event.request?.headers) {
        delete event.request.headers.cookie;
        delete event.request.headers.authorization;
      }

      if (event.request?.data) {
        // Remove sensitive fields from request body
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'api_key'];
        sensitiveFields.forEach(field => {
          if (event.request?.data && typeof event.request.data === 'object') {
            delete (event.request.data as Record<string, unknown>)[field];
          }
        });
      }

      return event;
    },

    // Debug mode (verbose logging)
    debug: false,
  });
}
