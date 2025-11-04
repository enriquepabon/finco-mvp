/**
 * Gemini AI Cache System
 *
 * Implements caching for Gemini AI responses using Upstash Redis
 * to reduce API calls, improve latency, and lower costs.
 *
 * Features:
 * - Automatic cache key generation based on prompt + context
 * - 1-hour TTL for cached responses
 * - Graceful fallback if Redis is not configured
 * - Type-safe implementation
 */

import { Redis } from '@upstash/redis';
import { env, features } from '../env';
import crypto from 'crypto';
import { logger } from '../logger';

/**
 * Redis client instance (lazy initialized)
 */
let redis: Redis | null = null;

/**
 * Initialize Redis client if caching is enabled
 */
function getRedisClient(): Redis | null {
  // Return early if caching is not configured
  if (!features.caching) {
    return null;
  }

  // Lazy initialization
  if (!redis) {
    try {
      redis = new Redis({
        url: env.UPSTASH_REDIS_URL!,
        token: env.UPSTASH_REDIS_TOKEN!,
      });
      logger.info('Redis client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Redis client', error);
      return null;
    }
  }

  return redis;
}

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  TTL: 3600, // 1 hour in seconds
  PREFIX: 'gemini:',
  VERSION: 'v1',
} as const;

/**
 * Generate a cache key from prompt and optional context
 *
 * Uses SHA-256 hash to create a unique, consistent key for each request
 *
 * @param prompt - The user's prompt/message
 * @param context - Optional context (e.g., user profile, chat history)
 * @returns Cache key string
 */
export function generateCacheKey(
  prompt: string,
  context?: Record<string, any>
): string {
  // Create a consistent string representation
  const dataToHash = JSON.stringify({
    prompt: prompt.trim().toLowerCase(),
    context: context || {},
  });

  // Generate SHA-256 hash
  const hash = crypto
    .createHash('sha256')
    .update(dataToHash)
    .digest('hex')
    .substring(0, 32); // Use first 32 chars for shorter keys

  // Return prefixed key
  return `${CACHE_CONFIG.PREFIX}${CACHE_CONFIG.VERSION}:${hash}`;
}

/**
 * Retrieve a cached Gemini response
 *
 * @param prompt - The user's prompt
 * @param context - Optional context
 * @returns Cached response or null if not found/error
 */
export async function getCachedResponse(
  prompt: string,
  context?: Record<string, any>
): Promise<string | null> {
  const client = getRedisClient();

  // Return null if caching is disabled
  if (!client) {
    return null;
  }

  try {
    const cacheKey = generateCacheKey(prompt, context);
    const cached = await client.get<string>(cacheKey);

    if (cached) {
      logger.debug('Cache HIT', { cacheKey: cacheKey.substring(0, 40) + '...' });
      return cached;
    }

    logger.debug('Cache MISS', { cacheKey: cacheKey.substring(0, 40) + '...' });
    return null;
  } catch (error) {
    logger.error('Error getting cached response', error);
    return null;
  }
}

/**
 * Store a Gemini response in cache
 *
 * @param prompt - The user's prompt
 * @param response - The AI response to cache
 * @param context - Optional context
 * @param ttl - Time to live in seconds (default: 1 hour)
 * @returns Success boolean
 */
export async function setCachedResponse(
  prompt: string,
  response: string,
  context?: Record<string, any>,
  ttl: number = CACHE_CONFIG.TTL
): Promise<boolean> {
  const client = getRedisClient();

  // Return false if caching is disabled
  if (!client) {
    return false;
  }

  try {
    const cacheKey = generateCacheKey(prompt, context);

    // Store with TTL
    await client.setex(cacheKey, ttl, response);

    logger.debug('Cached response', {
      cacheKey: cacheKey.substring(0, 40) + '...',
      ttl: `${ttl}s`
    });
    return true;
  } catch (error) {
    logger.error('Error caching response', error);
    return false;
  }
}

/**
 * Clear a specific cached response
 *
 * @param prompt - The user's prompt
 * @param context - Optional context
 * @returns Success boolean
 */
export async function clearCachedResponse(
  prompt: string,
  context?: Record<string, any>
): Promise<boolean> {
  const client = getRedisClient();

  if (!client) {
    return false;
  }

  try {
    const cacheKey = generateCacheKey(prompt, context);
    await client.del(cacheKey);

    logger.debug('Cleared cached response', {
      cacheKey: cacheKey.substring(0, 40) + '...'
    });
    return true;
  } catch (error) {
    logger.error('Error clearing cached response', error);
    return false;
  }
}

/**
 * Clear all Gemini cache entries
 *
 * WARNING: This is an expensive operation. Use sparingly.
 *
 * @returns Number of keys deleted
 */
export async function clearAllCache(): Promise<number> {
  const client = getRedisClient();

  if (!client) {
    return 0;
  }

  try {
    // Get all keys with our prefix
    const keys = await client.keys(`${CACHE_CONFIG.PREFIX}*`);

    if (keys.length === 0) {
      logger.debug('No cache entries to clear');
      return 0;
    }

    // Delete all keys
    await client.del(...keys);

    logger.info('Cleared all cache entries', { count: keys.length });
    return keys.length;
  } catch (error) {
    logger.error('Error clearing all cache', error);
    return 0;
  }
}

/**
 * Get cache statistics
 *
 * @returns Cache stats object
 */
export async function getCacheStats(): Promise<{
  enabled: boolean;
  totalKeys: number;
  prefix: string;
}> {
  const client = getRedisClient();

  if (!client) {
    return {
      enabled: false,
      totalKeys: 0,
      prefix: CACHE_CONFIG.PREFIX,
    };
  }

  try {
    const keys = await client.keys(`${CACHE_CONFIG.PREFIX}*`);

    return {
      enabled: true,
      totalKeys: keys.length,
      prefix: CACHE_CONFIG.PREFIX,
    };
  } catch (error) {
    logger.error('Error getting cache stats', error);
    return {
      enabled: true,
      totalKeys: 0,
      prefix: CACHE_CONFIG.PREFIX,
    };
  }
}
