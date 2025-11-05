/**
 * Environment Variables Validation
 *
 * This module validates all required environment variables at startup
 * using Zod schema validation. It ensures type safety and early error detection.
 */

import { z } from 'zod';

/**
 * Environment variables schema
 * All required variables must be present, optional ones have defaults
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Supabase Configuration (Required)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({
    message: 'NEXT_PUBLIC_SUPABASE_URL must be a valid URL'
  }).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, {
    message: 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'
  }).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, {
    message: 'SUPABASE_SERVICE_ROLE_KEY is required'
  }).optional(),

  // Google Gemini AI (Required)
  GOOGLE_GEMINI_API_KEY: z.string().min(1, {
    message: 'GOOGLE_GEMINI_API_KEY is required'
  }).optional(),

  // App Configuration (Optional with defaults)
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),

  // Upstash Redis (Optional - for caching)
  UPSTASH_REDIS_URL: z.string().url().optional(),
  UPSTASH_REDIS_TOKEN: z.string().optional(),

  // Sentry (Optional - for error monitoring)
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
});

/**
 * Validated and typed environment variables
 *
 * Uses safeParse to avoid throwing errors during build/initialization
 * Falls back to process.env if validation fails
 */
const parseResult = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
  UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,
  SENTRY_DSN: process.env.SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
});

// Export validated env or fallback to process.env with defaults
export const env = parseResult.success ? parseResult.data : {
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  UPSTASH_REDIS_URL: process.env.UPSTASH_REDIS_URL,
  UPSTASH_REDIS_TOKEN: process.env.UPSTASH_REDIS_TOKEN,
  SENTRY_DSN: process.env.SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
};

/**
 * Type of validated environment variables
 * Use this for TypeScript autocomplete
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Helper to check if a feature is enabled based on env vars
 */
export const features = {
  caching: !!(env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN),
  monitoring: !!(env.SENTRY_DSN || env.NEXT_PUBLIC_SENTRY_DSN),
} as const;

// Log validation errors in development
if (!parseResult.success && process.env.NODE_ENV === 'development') {
  console.warn('⚠️ Environment validation warnings:', parseResult.error.format());
}
