/**
 * Security headers and middleware for API routes
 */

export const withSecurity = (handler, options = {}) => {
  return async (req, res) => {
    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (options.enableCSP) {
      res.setHeader('Content-Security-Policy', "default-src 'self'");
    }
    
    // Call the original handler
    return handler(req, res);
  };
};

export default withSecurity;