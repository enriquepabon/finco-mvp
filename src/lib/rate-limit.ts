/**
 * Rate Limiting System
 *
 * Implements rate limiting for API routes using Upstash Redis
 * to prevent abuse and ensure fair usage.
 *
 * Features:
 * - Sliding window algorithm for accurate rate limiting
 * - Per-user limits (based on user ID or IP)
 * - Configurable limits per endpoint
 * - Rate limit headers in responses
 * - Graceful fallback if Redis is not configured
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env, features } from './env';
import { logger } from './logger';

/**
 * Rate limit configuration per endpoint type
 */
export const RATE_LIMITS = {
  // AI endpoints (expensive operations)
  AI: {
    requests: 10,
    window: '10 s',
    description: '10 requests per 10 seconds',
  },
  // Standard API endpoints
  API: {
    requests: 30,
    window: '10 s',
    description: '30 requests per 10 seconds',
  },
  // Auth endpoints
  AUTH: {
    requests: 5,
    window: '60 s',
    description: '5 requests per minute',
  },
} as const;

/**
 * Rate limiter instances (lazy initialized)
 */
let rateLimiters: Record<string, Ratelimit> | null = null;

/**
 * Initialize rate limiters if caching/rate limiting is enabled
 */
function getRateLimiters(): Record<string, Ratelimit> | null {
  // Return early if rate limiting is not configured
  if (!features.caching) {
    return null;
  }

  // Lazy initialization
  if (!rateLimiters) {
    try {
      const redis = new Redis({
        url: env.UPSTASH_REDIS_URL!,
        token: env.UPSTASH_REDIS_TOKEN!,
      });

      rateLimiters = {
        AI: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(
            RATE_LIMITS.AI.requests,
            RATE_LIMITS.AI.window
          ),
          analytics: true,
          prefix: '@ratelimit/ai',
        }),
        API: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(
            RATE_LIMITS.API.requests,
            RATE_LIMITS.API.window
          ),
          analytics: true,
          prefix: '@ratelimit/api',
        }),
        AUTH: new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(
            RATE_LIMITS.AUTH.requests,
            RATE_LIMITS.AUTH.window
          ),
          analytics: true,
          prefix: '@ratelimit/auth',
        }),
      };

      logger.info('Rate limiters initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize rate limiters', error);
      return null;
    }
  }

  return rateLimiters;
}

/**
 * Rate limit result interface
 */
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  pending: Promise<unknown>;
}

/**
 * Check rate limit for a request
 *
 * @param identifier - Unique identifier (user ID or IP address)
 * @param limitType - Type of rate limit to apply ('AI', 'API', or 'AUTH')
 * @returns Rate limit result with success status and headers
 */
export async function checkRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMITS = 'API'
): Promise<RateLimitResult> {
  const limiters = getRateLimiters();

  // If rate limiting is disabled, allow all requests
  if (!limiters) {
    logger.debug('Rate limiting disabled (Redis not configured)');
    return {
      success: true,
      limit: RATE_LIMITS[limitType].requests,
      remaining: RATE_LIMITS[limitType].requests,
      reset: Date.now() + 10000,
      pending: Promise.resolve(),
    };
  }

  try {
    const limiter = limiters[limitType];
    const result = await limiter.limit(identifier);

    if (result.success) {
      logger.debug('Rate limit OK', {
        identifier,
        remaining: result.remaining,
        limit: result.limit
      });
    } else {
      logger.warn('Rate limit EXCEEDED', {
        identifier,
        resetIn: `${Math.ceil((result.reset - Date.now()) / 1000)}s`
      });
    }

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      pending: result.pending,
    };
  } catch (error) {
    logger.error('Error checking rate limit', error, { identifier, limitType });
    // On error, allow the request (fail open)
    return {
      success: true,
      limit: RATE_LIMITS[limitType].requests,
      remaining: RATE_LIMITS[limitType].requests,
      reset: Date.now() + 10000,
      pending: Promise.resolve(),
    };
  }
}

/**
 * Get identifier from request (user ID or IP)
 *
 * @param userId - Optional user ID
 * @param request - Next.js request object
 * @returns Identifier string
 */
export function getIdentifier(
  userId: string | null | undefined,
  request: Request
): string {
  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}`;
  }

  // Fallback to IP address for anonymous requests
  // Try to get real IP from headers (consider proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  const ip =
    forwarded?.split(',')[0].trim() ||
    realIp ||
    'unknown';

  return `ip:${ip}`;
}

/**
 * Create rate limit headers for response
 *
 * @param result - Rate limit result
 * @returns Headers object
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
  };
}

/**
 * Create rate limit error response
 *
 * @param result - Rate limit result
 * @returns Error response object
 */
export function createRateLimitError(result: RateLimitResult) {
  const resetDate = new Date(result.reset);
  const secondsUntilReset = Math.ceil((result.reset - Date.now()) / 1000);

  return {
    error: 'Too Many Requests',
    message: `Has excedido el límite de solicitudes. Por favor, espera ${secondsUntilReset} segundos antes de intentar nuevamente.`,
    code: 'RATE_LIMIT_EXCEEDED',
    limit: result.limit,
    remaining: 0,
    reset: resetDate.toISOString(),
    retryAfter: secondsUntilReset,
  };
}

/**
 * Reset rate limit for a specific identifier (admin use)
 *
 * @param identifier - Unique identifier to reset
 * @param limitType - Type of rate limit
 * @returns Success boolean
 */
export async function resetRateLimit(
  identifier: string,
  limitType: keyof typeof RATE_LIMITS = 'API'
): Promise<boolean> {
  const limiters = getRateLimiters();

  if (!limiters) {
    return false;
  }

  try {
    const limiter = limiters[limitType];
    await limiter.resetUsedTokens(identifier);
    logger.info('Rate limit reset', { identifier, limitType });
    return true;
  } catch (error) {
    logger.error('Error resetting rate limit', error, { identifier, limitType });
    return false;
  }
}
