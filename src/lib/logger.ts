/**
 * Structured Logging System for FINCO
 *
 * Features:
 * - Multiple log levels (debug, info, warn, error)
 * - Timestamps with millisecond precision
 * - Context enrichment (userId, operation, etc.)
 * - Environment-aware (debug only in development)
 * - Sentry integration ready
 * - Color-coded console output
 *
 * @example
 * ```ts
 * import { logger } from '@/lib/logger';
 *
 * logger.debug('User response parsed', { userId: '123', parsed: data });
 * logger.info('Profile updated successfully', { userId: '123' });
 * logger.warn('Rate limit approaching', { remaining: 2, limit: 10 });
 * logger.error('Failed to save profile', error, { userId: '123' });
 * ```
 */

import { env } from './env';

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Log level configuration based on environment
const LOG_LEVEL_CONFIG: Record<string, LogLevel> = {
  development: LogLevel.DEBUG,
  test: LogLevel.WARN,
  production: LogLevel.INFO,
};

// ANSI color codes for console output
const COLORS = {
  DEBUG: '\x1b[36m',   // Cyan
  INFO: '\x1b[32m',    // Green
  WARN: '\x1b[33m',    // Yellow
  ERROR: '\x1b[31m',   // Red
  RESET: '\x1b[0m',    // Reset
  GRAY: '\x1b[90m',    // Gray for timestamps
  BOLD: '\x1b[1m',     // Bold
};

// Emojis for better visual identification
const EMOJIS = {
  DEBUG: '🔍',
  INFO: '✅',
  WARN: '⚠️',
  ERROR: '❌',
};

interface LogContext {
  userId?: string;
  operation?: string;
  [key: string]: unknown;
}

interface LogEntry {
  level: keyof typeof LogLevel;
  message: string;
  timestamp: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private minLevel: LogLevel;

  constructor() {
    const environment = env.NODE_ENV || 'development';
    this.minLevel = LOG_LEVEL_CONFIG[environment] ?? LogLevel.INFO;
  }

  /**
   * Log debug information (development only)
   * Use for detailed debugging, parsing results, cache hits/misses
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log informational messages
   * Use for successful operations, important state changes
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning messages
   * Use for recoverable errors, deprecated features, rate limits
   */
  warn(message: string, context?: LogContext): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error messages
   * Use for exceptions, failed operations, unrecoverable errors
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext = error instanceof Error
      ? {
          ...context,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
      : context;

    this.log(LogLevel.ERROR, message, errorContext, error instanceof Error ? error : undefined);

    // Send to Sentry in production (if configured)
    if (env.NODE_ENV === 'production' && error instanceof Error) {
      this.sendToSentry(error, message, context);
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): void {
    // Check if log level is enabled
    if (level < this.minLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level] as keyof typeof LogLevel;

    const logEntry: LogEntry = {
      level: levelName,
      message,
      timestamp,
      context,
      error,
    };

    // Format and output to console
    this.formatAndOutput(logEntry);

    // In production, we could send to external logging service
    if (env.NODE_ENV === 'production' && level >= LogLevel.WARN) {
      // TODO: Send to external logging service (e.g., Datadog, LogRocket)
      // this.sendToExternalService(logEntry);
    }
  }

  /**
   * Format log entry for console output with colors
   */
  private formatAndOutput(entry: LogEntry): void {
    const { level, message, timestamp, context, error } = entry;

    const color = COLORS[level];
    const emoji = EMOJIS[level];
    const reset = COLORS.RESET;
    const gray = COLORS.GRAY;
    const bold = COLORS.BOLD;

    // Timestamp formatting
    const time = new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    });

    // Build log line
    const logParts = [
      `${gray}${time}${reset}`,
      `${color}${bold}${emoji} ${level}${reset}`,
      `${color}${message}${reset}`,
    ];

    // Add context if present
    if (context && Object.keys(context).length > 0) {
      const contextStr = this.formatContext(context);
      logParts.push(`${gray}${contextStr}${reset}`);
    }

    // Output main log line
    console.log(logParts.join(' '));

    // Output error stack trace if present
    if (error && error.stack) {
      console.log(`${gray}${error.stack}${reset}`);
    }
  }

  /**
   * Format context object for readable output
   */
  private formatContext(context: LogContext): string {
    const formatted = Object.entries(context)
      .map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          return `${key}=${JSON.stringify(value)}`;
        }
        return `${key}=${value}`;
      })
      .join(', ');

    return `[${formatted}]`;
  }

  /**
   * Send error to Sentry (production only)
   * This is prepared for future Sentry integration
   */
  private sendToSentry(error: Error, message: string, context?: LogContext): void {
    // TODO: Implement Sentry integration in Sprint 5
    // For now, this is a placeholder

    // Future implementation:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     level: 'error',
    //     tags: {
    //       environment: env.NODE_ENV,
    //     },
    //     extra: {
    //       message,
    //       context,
    //     },
    //   });
    // }
  }

  /**
   * Create a child logger with persistent context
   * Useful for adding userId or operation context to all logs
   */
  child(persistentContext: LogContext): Logger {
    const childLogger = new Logger();

    // Override methods to include persistent context
    const originalDebug = childLogger.debug.bind(childLogger);
    const originalInfo = childLogger.info.bind(childLogger);
    const originalWarn = childLogger.warn.bind(childLogger);
    const originalError = childLogger.error.bind(childLogger);

    childLogger.debug = (message: string, context?: LogContext) => {
      originalDebug(message, { ...persistentContext, ...context });
    };

    childLogger.info = (message: string, context?: LogContext) => {
      originalInfo(message, { ...persistentContext, ...context });
    };

    childLogger.warn = (message: string, context?: LogContext) => {
      originalWarn(message, { ...persistentContext, ...context });
    };

    childLogger.error = (message: string, error?: Error | unknown, context?: LogContext) => {
      originalError(message, error, { ...persistentContext, ...context });
    };

    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for external use
export type { LogContext, LogEntry };
