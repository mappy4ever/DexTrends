import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

// Image optimization and lazy loading enhancement
export const ImageOptimizer = () => {
  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/dextrendslogo.png',
      '/back-card.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Optimize images that come into viewport
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, { rootMargin: '50px' });

    // Observe all data-src images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    return () => imageObserver.disconnect();
  }, []);

  return null;
};

// Bundle size optimization
export const BundleOptimizer = () => {
  const router = useRouter();

  useEffect(() => {
    // Prefetch critical routes when idle
    const prefetchRoutes = ['/pokedex', '/tcgsets', '/pocketmode'];
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        prefetchRoutes.forEach(route => {
          if (route !== router.pathname) {
            router.prefetch(route);
          }
        });
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        prefetchRoutes.forEach(route => {
          if (route !== router.pathname) {
            router.prefetch(route);
          }
        });
      }, 2000);
    }
  }, [router]);

  return null;
};

// Memory management
export const MemoryManager = () => {
  useEffect(() => {
    let memoryCheckInterval;

    // Monitor memory usage if supported
    if (performance.memory) {
      memoryCheckInterval = setInterval(() => {
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.totalJSHeapSize;
        const limit = performance.memory.jsHeapSizeLimit;

        // If memory usage is getting high, trigger cleanup
        if (used / limit > 0.8) {
          // Clear cached data
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('cache-') && Math.random() > 0.5) {
              localStorage.removeItem(key);
            }
          });

          // Force garbage collection if available
          if (window.gc) {
            window.gc();
          }
        }
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (memoryCheckInterval) {
        clearInterval(memoryCheckInterval);
      }
    };
  }, []);

  return null;
};

// Performance monitoring
export const PerformanceTracker = () => {
  const router = useRouter();

  useEffect(() => {
    // Track Core Web Vitals
    const trackWebVitals = () => {
      if ('web-vital' in window) return; // Already tracked

      // First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            // First Contentful Paint measured
          }
        }
      }).observe({ type: 'paint', buffered: true });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        // Largest Contentful Paint measured
      }).observe({ type: 'largest-contentful-paint', buffered: true });

      // Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        // Cumulative Layout Shift measured
      }).observe({ type: 'layout-shift', buffered: true });

      window['web-vital'] = true;
    };

    // Track route change performance
    const handleRouteChangeStart = () => {
      window.routeChangeStart = performance.now();
    };

    const handleRouteChangeComplete = () => {
      if (window.routeChangeStart) {
        const duration = performance.now() - window.routeChangeStart;
        // Route change performance measured
        delete window.routeChangeStart;
      }
    };

    trackWebVitals();
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  return null;
};

// Resource optimization
export const ResourceOptimizer = () => {
  useEffect(() => {
    // Remove unused CSS
    const removeUnusedCSS = () => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      stylesheets.forEach(sheet => {
        try {
          if (sheet.sheet && sheet.sheet.cssRules) {
            const rules = Array.from(sheet.sheet.cssRules);
            const usedRules = rules.filter(rule => {
              if (rule.selectorText) {
                return document.querySelector(rule.selectorText);
              }
              return true;
            });
            
            // If less than 50% of rules are used, mark for potential removal
            if (usedRules.length / rules.length < 0.5) {
              sheet.setAttribute('data-low-usage', 'true');
            }
          }
        } catch (e) {
          // Cross-origin or other issues
        }
      });
    };

    // Optimize fonts
    const optimizeFonts = () => {
      // Use font-display: swap for better loading
      const style = document.createElement('style');
      style.textContent = `
        @font-face {
          font-family: 'Montserrat';
          font-display: swap;
        }
      `;
      document.head.appendChild(style);
    };

    // Clean up localStorage
    const cleanupStorage = () => {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          if (item && item.expiry && now > item.expiry) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // Not JSON or other issue
        }
      });
    };

    // Run optimizations after page load
    const runOptimizations = () => {
      removeUnusedCSS();
      optimizeFonts();
      cleanupStorage();
    };

    if (document.readyState === 'complete') {
      runOptimizations();
    } else {
      window.addEventListener('load', runOptimizations);
    }

    return () => {
      window.removeEventListener('load', runOptimizations);
    };
  }, []);

  return null;
};

// Service Worker registration for offline support
export const ServiceWorkerManager = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            // Service worker registered successfully
          })
          .catch(registrationError => {
            // Service worker registration failed
          });
      });
    }
  }, []);

  return null;
};

export default {
  ImageOptimizer,
  BundleOptimizer,
  MemoryManager,
  PerformanceTracker,
  ResourceOptimizer,
  ServiceWorkerManager
};