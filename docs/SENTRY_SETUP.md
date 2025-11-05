# Sentry Error Monitoring Setup

This document describes how Sentry error monitoring is configured in the FINCO application.

## Overview

Sentry provides real-time error tracking and performance monitoring for both client-side and server-side code. This helps identify and fix issues quickly in production.

## Configuration Files

### 1. Sentry Configuration

- **`sentry.client.config.ts`**: Client-side (browser) configuration
- **`sentry.server.config.ts`**: Server-side (Node.js) configuration
- **`sentry.edge.config.ts`**: Edge runtime configuration (middleware)
- **`instrumentation.ts`**: Next.js instrumentation hook to initialize Sentry

### 2. Error Handling Components

- **`src/components/ErrorBoundary.tsx`**: Global React error boundary
- **`src/lib/api-error-handler.ts`**: API error handling utilities

## Environment Variables

Add these to your `.env.local` file:

```bash
# Sentry DSN (Data Source Name)
# Get this from: https://sentry.io/settings/[org]/projects/[project]/keys/
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional: Enable Sentry debug mode in development
# SENTRY_DEBUG=true
# NEXT_PUBLIC_SENTRY_DEBUG=true

# Optional: Set custom release version
# NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Features

### Automatic Error Tracking

- ✅ Unhandled JavaScript errors
- ✅ Unhandled promise rejections
- ✅ React component errors (via ErrorBoundary)
- ✅ API route errors
- ✅ Server-side rendering errors
- ✅ Edge runtime errors

### Session Replay

Sentry captures user sessions when errors occur:
- Records user interactions before the error
- Masks sensitive data (text, media)
- Helps reproduce bugs

### Performance Monitoring

- Transaction tracing for API calls
- Page load performance
- Server-side rendering performance

### Privacy & Security

- Sensitive headers filtered (cookies, authorization)
- Passwords and tokens masked
- User data anonymized
- GDPR compliant configuration

## Usage Examples

### 1. React Component Error Boundary

The global `ErrorBoundary` wraps the entire application in `src/app/layout.tsx`:

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

### 2. Manual Error Reporting (Client-Side)

Use the `useErrorReporting` hook in React components:

```tsx
import { useErrorReporting } from '@/components/ErrorBoundary';

function MyComponent() {
  const reportError = useErrorReporting();

  const handleRiskyOperation = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      reportError(error as Error, {
        context: 'riskyOperation',
        userId: user.id,
      });
      // Show user-friendly error message
    }
  };
}
```

### 3. API Error Handling

Use the `withErrorHandling` wrapper for API routes:

```typescript
// src/app/api/example/route.ts
import { withErrorHandling, ApiErrors } from '@/lib/api-error-handler';
import { NextRequest, NextResponse } from 'next/server';

export const GET = withErrorHandling(async (request: NextRequest) => {
  // Your API logic here
  const data = await fetchData();

  if (!data) {
    throw ApiErrors.notFound('Data');
  }

  return NextResponse.json(data);
});
```

### 4. Custom Error Types

The API error handler provides pre-built error types:

```typescript
import { ApiErrors } from '@/lib/api-error-handler';

// 404 Not Found
throw ApiErrors.notFound('User');

// 401 Unauthorized
throw ApiErrors.unauthorized();

// 403 Forbidden
throw ApiErrors.forbidden('Insufficient permissions');

// 400 Validation Error
throw ApiErrors.validation('Invalid email format');

// 429 Rate Limit
throw ApiErrors.rateLimit();

// 502 External API Error
throw ApiErrors.externalApi('Stripe', 'Payment failed');

// 500 Database Error
throw ApiErrors.database('Connection timeout');

// 500 Internal Server Error
throw ApiErrors.internal('Unexpected error');
```

### 5. Manual Error Capture (Server-Side)

For server-side code outside API routes:

```typescript
import * as Sentry from '@sentry/nextjs';

try {
  await dangerousOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      operation: 'dangerousOperation',
    },
    extra: {
      userId: user.id,
      timestamp: new Date().toISOString(),
    },
  });
  throw error; // Re-throw or handle
}
```

## Configuration Options

### Sample Rates

Adjust these in the Sentry config files based on your traffic:

```typescript
// Client config (sentry.client.config.ts)
{
  tracesSampleRate: 0.1,        // 10% of transactions
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of error sessions
}

// Server config (sentry.server.config.ts)
{
  tracesSampleRate: 0.05, // 5% of server transactions
}
```

### Environment-Based Behavior

- **Development**: Errors logged to console only (not sent to Sentry by default)
- **Production**: All errors sent to Sentry with full context

Enable Sentry in development by setting:
```bash
SENTRY_DEBUG=true
NEXT_PUBLIC_SENTRY_DEBUG=true
```

## Testing Sentry Integration

### 1. Test Error Boundary

Create a button that throws an error:

```tsx
function TestButton() {
  const throwError = () => {
    throw new Error('Test error from React component');
  };

  return <button onClick={throwError}>Test Error</button>;
}
```

### 2. Test API Error

Call an API endpoint that throws an error:

```bash
curl http://localhost:3000/api/test-error
```

### 3. Verify in Sentry Dashboard

1. Go to https://sentry.io
2. Select your project
3. Navigate to "Issues" to see captured errors
4. Check "Performance" for transaction traces
5. View "Replays" to see user sessions

## Sentry Dashboard Features

### Issues

- Error grouping by stack trace
- Frequency and impact metrics
- User-affected counts
- Environment tags (development, staging, production)
- Release tracking

### Performance

- Slow API endpoints
- Database query performance
- Page load times
- Server-side rendering performance

### Releases

Track deploys and associate errors with specific versions:

```bash
# Set in CI/CD pipeline
export NEXT_PUBLIC_APP_VERSION="1.2.3"
```

## Best Practices

### 1. Error Classification

Use appropriate error types to help triage issues:

```typescript
// User error (400-level) - Don't alert on-call
throw ApiErrors.validation('Invalid input');

// Server error (500-level) - Alert on-call
throw ApiErrors.internal('Database connection failed');
```

### 2. Add Context

Include relevant context with errors:

```typescript
Sentry.captureException(error, {
  tags: {
    userId: user.id,
    feature: 'budget-creation',
  },
  extra: {
    budgetAmount: amount,
    category: category,
  },
});
```

### 3. Ignore Noise

Filter out expected errors in the Sentry configs:

```typescript
ignoreErrors: [
  'User cancelled',
  'NetworkError',
  'ResizeObserver loop limit exceeded',
],
```

### 4. Privacy First

Never send sensitive data to Sentry:

```typescript
// ❌ Bad
Sentry.captureException(error, {
  extra: {
    password: user.password,        // Never!
    creditCard: user.creditCard,    // Never!
  },
});

// ✅ Good
Sentry.captureException(error, {
  extra: {
    userId: user.id,
    action: 'payment',
  },
});
```

## Troubleshooting

### Errors Not Appearing in Sentry

1. Check environment variables are set correctly
2. Verify SENTRY_DSN is valid
3. Check `beforeSend` filters in config files
4. Enable debug mode: `debug: true` in Sentry config
5. Check browser console for Sentry errors

### Too Many Errors

1. Reduce sample rates in production
2. Add more filters to `ignoreErrors`
3. Set up custom alert rules in Sentry dashboard

### Source Maps Not Working

Source maps are automatically generated by Next.js in production builds. If stack traces show minified code:

1. Ensure production build: `npm run build`
2. Check Sentry has access to upload source maps
3. Verify release version matches

## Cost Management

Sentry pricing is based on events and replays:

1. **Free Tier**: 5,000 errors + 50 replays per month
2. **Adjust sample rates** to control costs in high-traffic apps
3. **Filter client errors** (browser extensions, network issues)
4. **Set up quota alerts** in Sentry dashboard

## Support

- **Sentry Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **FINCO Team**: Contact @dev-team for questions
- **Issue Tracker**: https://github.com/[your-org]/finco-mvp/issues

## Changelog

- **2025-11-05**: Initial Sentry integration (Sprint 5)
  - Client, server, and edge configurations
  - Global error boundary
  - API error handler utilities
  - Session replay enabled
