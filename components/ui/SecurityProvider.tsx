import React, { createContext, useContext, useEffect, useState } from 'react';
import logger from '../../utils/logger';

// Types
interface Threat {
  type: 'XSS' | 'MIXED_CONTENT' | 'INSECURE_COOKIES' | 'CLICKJACKING' | 'SENSITIVE_DATA_EXPOSURE';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: Date;
}

interface SecurityStatus {
  isSecure: boolean;
  threats: Threat[];
  lastCheck: Date | null;
  csrfToken: string | null;
}

interface SecurityIncident {
  type: string;
  description: string;
  severity: string;
  timestamp: Date;
  details?: any;
}

interface SecureStorage {
  setItem: (key: string, value: any) => void;
  getItem: (key: string) => any;
  removeItem: (key: string) => void;
}

interface SecurityContextValue {
  securityStatus: SecurityStatus;
  runSecurityCheck: () => Promise<Threat[]>;
  sanitizeInput: (input: any) => any;
  validateCSRFToken: (token: string) => boolean;
  secureStorage: SecureStorage;
  reportSecurityIncident: (incident: SecurityIncident) => void;
}

interface SecurityProviderProps {
  children: React.ReactNode;
}

const SecurityContext = createContext<SecurityContextValue | undefined>(undefined);

export const useSecurity = (): SecurityContextValue => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityProvider');
  }
  return context;
};

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    isSecure: false,
    threats: [],
    lastCheck: null,
    csrfToken: null
  });

  useEffect(() => {
    initializeSecurity();
    
    // Check security every 5 minutes
    const interval = setInterval(runSecurityCheck, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const initializeSecurity = async () => {
    try {
      // Generate CSRF token
      const csrfToken = generateCSRFToken();
      
      // Initial security check
      const threats = await runSecurityCheck();
      
      setSecurityStatus({
        isSecure: threats.length === 0,
        threats,
        lastCheck: new Date(),
        csrfToken
      });

      // Set up Content Security Policy
      setupCSP();
      
      // Set up XSS protection
      setupXSSProtection();
      
      // Monitor for suspicious activity
      monitorSuspiciousActivity();
      
      logger.info('Security provider initialized', { threatsFound: threats.length });
    } catch (error) {
      logger.error('Failed to initialize security', { error });
    }
  };

  const generateCSRFToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const runSecurityCheck = async (): Promise<Threat[]> => {
    const threats: Threat[] = [];

    try {
      // Check for XSS vulnerabilities
      if (checkForXSS()) {
        threats.push({
          type: 'XSS',
          severity: 'high',
          description: 'Potential XSS vulnerability detected',
          timestamp: new Date()
        });
      }

      // Check for mixed content
      if (checkForMixedContent()) {
        threats.push({
          type: 'MIXED_CONTENT',
          severity: 'medium',
          description: 'Mixed content detected (HTTP resources on HTTPS page)',
          timestamp: new Date()
        });
      }

      // Check for insecure cookies
      if (checkForInsecureCookies()) {
        threats.push({
          type: 'INSECURE_COOKIES',
          severity: 'medium',
          description: 'Insecure cookies detected',
          timestamp: new Date()
        });
      }

      // Check for clickjacking vulnerability
      if (checkForClickjacking()) {
        threats.push({
          type: 'CLICKJACKING',
          severity: 'medium',
          description: 'Page is vulnerable to clickjacking attacks',
          timestamp: new Date()
        });
      }

      // Check localStorage for sensitive data
      const sensitiveDataCheck = checkForSensitiveData();
      if (sensitiveDataCheck.found) {
        threats.push({
          type: 'SENSITIVE_DATA_EXPOSURE',
          severity: 'high',
          description: `Sensitive data found in localStorage: ${sensitiveDataCheck.keys.join(', ')}`,
          timestamp: new Date()
        });
      }

      // Update security status
      setSecurityStatus(prev => ({
        ...prev,
        isSecure: threats.length === 0,
        threats,
        lastCheck: new Date()
      }));

      if (threats.length > 0) {
        logger.warn('Security threats detected', { threats });
      }

      return threats;
    } catch (error) {
      logger.error('Security check failed', { error });
      return threats;
    }
  };

  const checkForXSS = (): boolean => {
    // Check for common XSS patterns in URL and DOM
    const url = window.location.href;
    const xssPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+=/i,
      /<iframe/i,
      /eval\(/i,
      /document\.write/i
    ];

    // Check URL for XSS patterns
    if (xssPatterns.some(pattern => pattern.test(url))) {
      return true;
    }

    // Check for unsafe innerHTML usage
    const scriptTags = document.querySelectorAll('script');
    for (const script of scriptTags) {
      if (script.innerHTML && xssPatterns.some(pattern => pattern.test(script.innerHTML))) {
        return true;
      }
    }

    return false;
  };

  const checkForMixedContent = (): boolean => {
    if (window.location.protocol === 'https:') {
      const httpResources = document.querySelectorAll('img[src^="http:"], script[src^="http:"], link[href^="http:"]');
      return httpResources.length > 0;
    }
    return false;
  };

  const checkForInsecureCookies = (): boolean => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (value && !cookie.includes('Secure') && window.location.protocol === 'https:') {
        return true;
      }
    }
    return false;
  };

  const checkForClickjacking = (): boolean => {
    // Check if page can be embedded in iframe
    try {
      return window.top !== window.self;
    } catch (e) {
      // If we can't access window.top, we're probably in an iframe
      return true;
    }
  };

  const checkForSensitiveData = (): { found: boolean; keys: string[] } => {
    const sensitiveKeys: string[] = [];
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /api[_-]?key/i,
      /secret/i,
      /credit[_-]?card/i,
      /ssn/i,
      /social[_-]?security/i
    ];

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && sensitivePatterns.some(pattern => pattern.test(key))) {
          sensitiveKeys.push(key);
        }
      }
    } catch (error) {
      // localStorage not available
    }

    return {
      found: sensitiveKeys.length > 0,
      keys: sensitiveKeys
    };
  };

  const setupCSP = () => {
    // Set up Content Security Policy via meta tag if not already set
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Content-Security-Policy');
      meta.setAttribute('content', 
        "default-src 'self'; " +
        "img-src 'self' data: https:; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "font-src 'self' data:; " +
        "connect-src 'self' https: wss:; " +
        "frame-ancestors 'none';"
      );
      document.head.appendChild(meta);
    }
  };

  const setupXSSProtection = () => {
    // Enable XSS protection
    const meta = document.createElement('meta');
    meta.setAttribute('http-equiv', 'X-XSS-Protection');
    meta.setAttribute('content', '1; mode=block');
    document.head.appendChild(meta);

    // Prevent MIME type sniffing
    const noSniffMeta = document.createElement('meta');
    noSniffMeta.setAttribute('http-equiv', 'X-Content-Type-Options');
    noSniffMeta.setAttribute('content', 'nosniff');
    document.head.appendChild(noSniffMeta);
  };

  const monitorSuspiciousActivity = () => {
    let consecutiveFailures = 0;

    // Monitor failed API requests
    const originalFetch = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          consecutiveFailures++;
          if (consecutiveFailures > 5) {
            logger.warn('Multiple consecutive API failures detected', { 
              failures: consecutiveFailures,
              url: args[0] 
            });
          }
        } else {
          consecutiveFailures = 0;
        }
        return response;
      } catch (error) {
        consecutiveFailures++;
        throw error;
      }
    };

    // Monitor suspicious DOM modifications
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              
              // Check for suspicious script injections
              if (element.tagName === 'SCRIPT') {
                const scriptElement = element as HTMLScriptElement;
                if (scriptElement.src && !scriptElement.src.startsWith(window.location.origin)) {
                  logger.warn('Suspicious script injection detected', { 
                    src: scriptElement.src,
                    content: scriptElement.innerHTML.substring(0, 100)
                  });
                }
              }
              
              // Check for suspicious iframe injections
              if (element.tagName === 'IFRAME') {
                const iframeElement = element as HTMLIFrameElement;
                if (iframeElement.src && !iframeElement.src.startsWith(window.location.origin)) {
                  logger.warn('Suspicious iframe injection detected', { 
                    src: iframeElement.src 
                  });
                }
              }
            }
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  };

  const sanitizeInput = (input: any): any => {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const validateCSRFToken = (token: string): boolean => {
    return token === securityStatus.csrfToken;
  };

  const secureStorage: SecureStorage = {
    setItem: (key: string, value: any) => {
      try {
        const sanitizedKey = sanitizeInput(key);
        const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
        localStorage.setItem(sanitizedKey, JSON.stringify(sanitizedValue));
      } catch (error) {
        logger.error('Secure storage set failed', { error, key });
      }
    },
    
    getItem: (key: string) => {
      try {
        const sanitizedKey = sanitizeInput(key);
        const value = localStorage.getItem(sanitizedKey);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        logger.error('Secure storage get failed', { error, key });
        return null;
      }
    },
    
    removeItem: (key: string) => {
      try {
        const sanitizedKey = sanitizeInput(key);
        localStorage.removeItem(sanitizedKey);
      } catch (error) {
        logger.error('Secure storage remove failed', { error, key });
      }
    }
  };

  const reportSecurityIncident = (incident: SecurityIncident) => {
    logger.error('Security incident reported', incident);
    
    // In production, you might want to send this to a security monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to security monitoring service
      // fetch('/api/security/incidents', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(incident)
      // });
    }
  };

  const value: SecurityContextValue = {
    securityStatus,
    runSecurityCheck,
    sanitizeInput,
    validateCSRFToken,
    secureStorage,
    reportSecurityIncident
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export default SecurityProvider;