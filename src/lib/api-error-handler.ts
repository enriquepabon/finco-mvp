/**
 * API Error Handler Utility
 *
 * Provides utilities for handling and reporting errors in API routes.
 * Automatically reports errors to Sentry with request context.
 *
 * Features:
 * - Automatic error reporting to Sentry
 * - Structured error responses
 * - Request context capture
 * - Error classification (client vs server errors)
 * - Safe error message sanitization
 *
 * @module lib/api-error-handler
 */

import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API Error Response structure
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp: string;
  requestId?: string;
}

/**
 * Error types for classification
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  EXTERNAL_API = 'EXTERNAL_API_ERROR',
  DATABASE = 'DATABASE_ERROR',
  INTERNAL = 'INTERNAL_SERVER_ERROR',
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly errorType: ErrorType;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorType: ErrorType = ErrorType.INTERNAL,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wraps an API handler with error tracking and handling
 *
 * @param handler - The API route handler function
 * @returns Wrapped handler with error tracking
 *
 * @example
 * export const GET = withErrorHandling(async (request) => {
 *   const data = await fetchData();
 *   return NextResponse.json(data);
 * });
 */
export function withErrorHandling(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return handleApiError(error, request);
    }
  };
}

/**
 * Handles API errors and returns appropriate response
 *
 * @param error - The error to handle
 * @param request - The Next.js request object
 * @returns NextResponse with error details
 */
export function handleApiError(error: unknown, request: NextRequest): NextResponse {
  const timestamp = new Date().toISOString();
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();

  // Default error response
  let statusCode = 500;
  let errorMessage = 'An unexpected error occurred';
  let errorType = ErrorType.INTERNAL;

  // Parse error details
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    errorMessage = error.message;
    errorType = error.errorType;
  } else if (error instanceof Error) {
    errorMessage = error.message;

    // Classify common errors
    if (errorMessage.includes('not found')) {
      statusCode = 404;
      errorType = ErrorType.NOT_FOUND;
    } else if (errorMessage.includes('unauthorized')) {
      statusCode = 401;
      errorType = ErrorType.AUTHENTICATION;
    } else if (errorMessage.includes('forbidden')) {
      statusCode = 403;
      errorType = ErrorType.AUTHORIZATION;
    } else if (errorMessage.includes('validation')) {
      statusCode = 400;
      errorType = ErrorType.VALIDATION;
    }
  }

  // Report to Sentry (exclude client errors)
  if (statusCode >= 500) {
    Sentry.captureException(error, {
      tags: {
        errorType,
        endpoint: request.url,
        method: request.method,
      },
      extra: {
        requestId,
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
      },
    });
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      error,
      errorType,
      statusCode,
      url: request.url,
      method: request.method,
      requestId,
    });
  }

  // Build error response
  const errorResponse: ApiErrorResponse = {
    error: errorType,
    message: sanitizeErrorMessage(errorMessage, statusCode),
    status: statusCode,
    timestamp,
    requestId,
  };

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Sanitizes error messages to avoid leaking sensitive information
 *
 * @param message - Original error message
 * @param statusCode - HTTP status code
 * @returns Sanitized error message
 */
function sanitizeErrorMessage(message: string, statusCode: number): string {
  // Don't leak internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    return 'An internal server error occurred. Please try again later.';
  }

  // Remove sensitive patterns
  let sanitized = message
    .replace(/password[=:]\s*\S+/gi, 'password=***')
    .replace(/token[=:]\s*\S+/gi, 'token=***')
    .replace(/api[_-]?key[=:]\s*\S+/gi, 'api_key=***');

  return sanitized;
}

/**
 * Creates common API errors
 */
export const ApiErrors = {
  notFound: (resource: string) =>
    new ApiError(`${resource} not found`, 404, ErrorType.NOT_FOUND),

  unauthorized: (message: string = 'Authentication required') =>
    new ApiError(message, 401, ErrorType.AUTHENTICATION),

  forbidden: (message: string = 'Access denied') =>
    new ApiError(message, 403, ErrorType.AUTHORIZATION),

  validation: (message: string) =>
    new ApiError(message, 400, ErrorType.VALIDATION),

  rateLimit: (message: string = 'Too many requests') =>
    new ApiError(message, 429, ErrorType.RATE_LIMIT),

  externalApi: (service: string, message?: string) =>
    new ApiError(
      message || `External service ${service} error`,
      502,
      ErrorType.EXTERNAL_API
    ),

  database: (message: string = 'Database error') =>
    new ApiError(message, 500, ErrorType.DATABASE),

  internal: (message: string = 'Internal server error') =>
    new ApiError(message, 500, ErrorType.INTERNAL),
};
