/**
 * Admin Authentication Helper
 * Centralizes authentication logic for admin API endpoints
 *
 * Security Features:
 * - Only accepts Bearer tokens from Authorization header (no query params)
 * - Logs unauthorized access attempts with IP for security monitoring
 * - Provides consistent auth responses across all admin endpoints
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '@/utils/logger';

/**
 * Extract client IP from request headers
 */
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Validate admin authentication
 * Only accepts Bearer tokens from Authorization header (never query params)
 *
 * @returns true if authenticated, false otherwise (also sends 401 response)
 */
export function validateAdminAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  endpointName: string
): boolean {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.CACHE_WARM_TOKEN;

  // If no token is configured, allow access (development mode)
  if (!expectedToken) {
    logger.warn(`[${endpointName}] No CACHE_WARM_TOKEN configured - endpoint accessible without auth`);
    return true;
  }

  // Only accept Bearer tokens from Authorization header
  // Security: Never accept tokens from query params (they get logged, cached, leaked)
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn(`[${endpointName}] Missing or invalid Authorization header`, {
      ip: getClientIP(req),
      hasHeader: !!authHeader,
    });
    res.status(401).json({ error: 'Unauthorized - Bearer token required in Authorization header' });
    return false;
  }

  const providedToken = authHeader.replace('Bearer ', '');

  if (providedToken !== expectedToken) {
    logger.warn(`[${endpointName}] Invalid token provided`, {
      ip: getClientIP(req),
    });
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }

  return true;
}

/**
 * Middleware-style admin auth check
 * Returns a promise that resolves to true if authenticated
 */
export async function requireAdminAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  endpointName: string
): Promise<boolean> {
  return validateAdminAuth(req, res, endpointName);
}
