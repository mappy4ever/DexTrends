import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

// Image optimization and lazy loading enhancement
export const ImageOptimizer = (): null => {
  useEffect(() => {
    // Preload critical images
    const criticalImages = [
      '/dextrendslogo.png',
      '/back-card.png'
    ];

    criticalImages.forEach((src: string) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Optimize images that come into viewport
    const imageObserver = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    }, { rootMargin: '50px' });

    // Observe all data-src images
    document.querySelectorAll('img[data-src]').forEach((img: Element) => {
      imageObserver.observe(img);
    });

    return () => imageObserver.disconnect();
  }, []);

  return null;
};

// Bundle size optimization
export const BundleOptimizer = (): null => {
  const router = useRouter();

  useEffect(() => {
    // Prefetch critical routes when idle
    const prefetchRoutes = ['/pokedex', '/tcgsets', '/pocketmode'];
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        prefetchRoutes.forEach((route: string) => {
          if (route !== router.pathname) {
            router.prefetch(route);
          }
        });
      }, { timeout: 2000 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        prefetchRoutes.forEach((route: string) => {
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
export const MemoryManager = (): null => {
  useEffect(() => {
    let memoryCheckInterval: NodeJS.Timeout;

    // Monitor memory usage if supported
    if ('memory' in performance && (performance as any).memory) {
      memoryCheckInterval = setInterval(() => {
        const memoryInfo = (performance as any).memory;
        const used = memoryInfo.usedJSHeapSize;
        const total = memoryInfo.totalJSHeapSize;
        const limit = memoryInfo.jsHeapSizeLimit;

        // If memory usage is getting high, trigger cleanup
        if (used / limit > 0.8) {
          // Clear cached data
          const keys = Object.keys(localStorage);
          keys.forEach((key: string) => {
            if (key.startsWith('cache-') && Math.random() > 0.5) {
              localStorage.removeItem(key);
            }
          });

          // Force garbage collection if available
          if ((window as any).gc) {
            (window as any).gc();
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
export const PerformanceTracker = (): null => {
  const router = useRouter();

  useEffect(() => {
    // Track Core Web Vitals
    const trackWebVitals = (): void => {
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
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        // Cumulative Layout Shift measured
      }).observe({ type: 'layout-shift', buffered: true });

      (window as any)['web-vital'] = true;
    };

    // Track route change performance
    const handleRouteChangeStart = (): void => {
      (window as any).routeChangeStart = performance.now();
    };

    const handleRouteChangeComplete = (): void => {
      if ((window as any).routeChangeStart) {
        const duration = performance.now() - (window as any).routeChangeStart;
        // Route change performance measured
        delete (window as any).routeChangeStart;
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
export const ResourceOptimizer = (): null => {
  useEffect(() => {
    // Remove unused CSS
    const removeUnusedCSS = (): void => {
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      stylesheets.forEach((sheet: Element) => {
        try {
          const linkElement = sheet as HTMLLinkElement;
          if (linkElement.sheet && linkElement.sheet.cssRules) {
            const rules = Array.from(linkElement.sheet.cssRules);
            const usedRules = rules.filter((rule: CSSRule) => {
              if ((rule as CSSStyleRule).selectorText) {
                return document.querySelector((rule as CSSStyleRule).selectorText);
              }
              return true;
            });
            
            // If less than 50% of rules are used, mark for potential removal
            if (usedRules.length / rules.length < 0.5) {
              linkElement.setAttribute('data-low-usage', 'true');
            }
          }
        } catch (e) {
          // Cross-origin or other issues
        }
      });
    };

    // Optimize fonts
    const optimizeFonts = (): void => {
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
    const cleanupStorage = (): void => {
      const now = Date.now();
      const keys = Object.keys(localStorage);
      
      keys.forEach((key: string) => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const item = JSON.parse(value) as { expiry?: number };
            if (item && item.expiry && now > item.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          // Not JSON or other issue
        }
      });
    };

    // Run optimizations after page load
    const runOptimizations = (): void => {
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
export const ServiceWorkerManager = (): null => {
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