/**
 * Next.js Instrumentation File
 *
 * Runs once when the Next.js server starts, allowing for global setup
 * of monitoring tools, APM, and other instrumentation.
 *
 * This file is automatically loaded by Next.js 13+ when present.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

/**
 * Register server-side instrumentation
 *
 * This function runs when the Node.js server starts (server-side rendering)
 * Perfect for initializing Sentry, OpenTelemetry, or other monitoring tools
 */
export async function register() {
  // Only run on the server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import and initialize Sentry for server-side
    await import('./sentry.server.config');
  }

  // Only run on edge runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    // Import and initialize Sentry for edge runtime
    await import('./sentry.edge.config');
  }
}

/**
 * On request error handler (optional)
 *
 * Called when an uncaught error occurs during request handling
 * Can be used for additional error logging or cleanup
 */
export async function onRequestError(
  error: Error,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  }
) {
  // Log request details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Request Error:', {
      error: error.message,
      path: request.path,
      method: request.method,
    });
  }

  // Additional error handling can be added here
  // (Sentry will already capture this via the server config)
}
