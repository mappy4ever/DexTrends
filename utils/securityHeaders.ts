/**
 * Security headers and middleware for API routes
 */

import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next';

interface SecurityOptions {
  enableCSP?: boolean;
  cspDirectives?: string;
  enableHSTS?: boolean;
  hstsMaxAge?: number;
  hstsIncludeSubDomains?: boolean;
  hstsPreload?: boolean;
  permissionsPolicy?: string;
  customHeaders?: Record<string, string>;
  customSecurityHeaders?: {
    includeCSP?: boolean;
    strictMode?: boolean;
  };
}

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => void | Promise<void>;

/**
 * Security middleware wrapper for API routes
 * Adds security headers to responses
 */
export const withSecurity = (
  handler: NextApiHandler | ApiHandler, 
  options: SecurityOptions = {}
): NextApiHandler => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Set basic security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    if (options.enableCSP) {
      const cspDirectives = options.cspDirectives || "default-src 'self'";
      res.setHeader('Content-Security-Policy', cspDirectives);
    }
    
    // HTTP Strict Transport Security
    if (options.enableHSTS) {
      const maxAge = options.hstsMaxAge || 31536000; // 1 year default
      let hstsValue = `max-age=${maxAge}`;
      
      if (options.hstsIncludeSubDomains) {
        hstsValue += '; includeSubDomains';
      }
      
      if (options.hstsPreload) {
        hstsValue += '; preload';
      }
      
      res.setHeader('Strict-Transport-Security', hstsValue);
    }
    
    // Permissions Policy (formerly Feature Policy)
    if (options.permissionsPolicy) {
      res.setHeader('Permissions-Policy', options.permissionsPolicy);
    }
    
    // Custom headers
    if (options.customHeaders) {
      Object.entries(options.customHeaders).forEach(([header, value]) => {
        res.setHeader(header, value);
      });
    }
    
    // Call the original handler
    return handler(req, res);
  };
};

/**
 * Default security headers for production use
 *
 * CSP Notes:
 * - 'unsafe-inline' for styles is needed for styled-jsx and Tailwind
 * - 'unsafe-eval' REMOVED for security (was XSS risk)
 * - Next.js uses inline scripts, so we use 'unsafe-inline' for scripts
 *   In future, consider nonce-based CSP for better security
 */
export const productionSecurityHeaders: SecurityOptions = {
  enableCSP: true,
  cspDirectives: [
    "default-src 'self'",
    // Script sources - removed unsafe-eval for security
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    // Style sources - unsafe-inline needed for styled-jsx/Tailwind
    "style-src 'self' 'unsafe-inline'",
    // Image sources - allow all HTTPS for card images
    "img-src 'self' data: https: blob:",
    // Font sources
    "font-src 'self' data:",
    // API connections - all external APIs used
    "connect-src 'self' https://raw.githubusercontent.com https://api.tcgdex.net https://assets.tcgdex.net https://pokeapi.co https://api.pokemontcg.io https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com wss://*.supabase.co https://*.supabase.co",
    // Worker sources for service workers
    "worker-src 'self' blob:",
    // Frame ancestors - prevent clickjacking
    "frame-ancestors 'none'",
    // Base URI restriction
    "base-uri 'self'",
    // Form submission restriction
    "form-action 'self'",
    // Upgrade HTTP to HTTPS
    "upgrade-insecure-requests"
  ].join('; '),
  enableHSTS: true,
  hstsMaxAge: 31536000,
  hstsIncludeSubDomains: true,
  hstsPreload: true, // Enable preload for HSTS
  permissionsPolicy: 'camera=(), microphone=(), geolocation=(), payment=()'
};

/**
 * Development security headers (more permissive)
 */
export const developmentSecurityHeaders: SecurityOptions = {
  enableCSP: false,
  enableHSTS: false
};

/**
 * Get security headers based on environment
 */
export const getSecurityHeaders = (): SecurityOptions => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  return isDevelopment ? developmentSecurityHeaders : productionSecurityHeaders;
};

/**
 * Security headers for static assets
 */
export const staticAssetHeaders: Record<string, string> = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'X-Content-Type-Options': 'nosniff'
};

/**
 * CORS configuration helper
 */
export const getCorsHeaders = (allowedOrigins: string[] = []): Record<string, string> => {
  const origin = process.env.ALLOWED_ORIGINS?.split(',') || allowedOrigins;
  
  return {
    'Access-Control-Allow-Origin': origin.join(', ') || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400' // 24 hours
  };
};

export default withSecurity;