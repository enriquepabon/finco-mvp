/**
 * Health Check API Endpoint
 *
 * Provides a simple health check for Docker, Kubernetes, and monitoring systems.
 * Returns 200 OK if the application is running and healthy.
 *
 * @module api/health
 */

import { NextResponse } from 'next/server';

/**
 * GET /api/health
 *
 * Health check endpoint for container orchestration and monitoring.
 *
 * @returns {Promise<NextResponse>} JSON with status and timestamp
 *
 * @example Response (200):
 * {
 *   "status": "ok",
 *   "timestamp": "2025-11-05T10:30:00.000Z",
 *   "uptime": 12345.67,
 *   "environment": "production"
 * }
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    },
    { status: 200 }
  );
}
