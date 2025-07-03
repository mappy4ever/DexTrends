/**
 * Advanced optimized image component with progressive loading,
 * multiple format support, and performance monitoring
 */

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import Image from 'next/image';
import performanceMonitor from '../../utils/performanceMonitor';
import logger from '../../utils/logger';

// WebP detection utility
const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// Generate blur data URL for placeholder
const generateBlurDataURL = (width, height) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(0.5, '#e5e7eb');
  gradient.addColorStop(1, '#d1d5db');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

// Image format optimization
const getOptimizedSrc = (src, format = 'auto') => {
  if (!src || typeof src !== 'string') return src;
  
  // If it's already optimized or not a Pokemon TCG image, return as-is
  if (!src.includes('images.pokemontcg.io')) return src;
  
  // For Pokemon TCG images, we can add format parameters
  if (format === 'webp' && supportsWebP()) {
    return src.includes('?') ? `${src}&format=webp` : `${src}?format=webp`;
  }
  
  return src;
};

// Progressive image loader with multiple quality levels
const useProgressiveImage = (src, lowQualitySrc) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) return;

    setIsLoading(true);
    setHasError(false);
    
    const img = new window.Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { currentSrc, isLoading, hasError };
};

// Intersection observer hook for lazy loading
const useIntersectionObserver = (callback, threshold = 0.1) => {
  const ref = useRef();
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting;
        setIsIntersecting(intersecting);
        if (intersecting && callback) {
          callback();
        }
      },
      { threshold, rootMargin: '50px' }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback, threshold]);

  return [ref, isIntersecting];
};

// Main optimized image component
const OptimizedImage = memo(({
  src,
  alt = '',
  width,
  height,
  className = '',
  quality = 85,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  enableProgressiveLoading = true,
  enableLazyLoading = true,
  fallbackSrc = '/back-card.png',
  format = 'auto',
  enableMonitoring = true,
  ...props
}) => {
  const [loadError, setLoadError] = useState(false);
  const [loadStartTime, setLoadStartTime] = useState(null);
  const imageRef = useRef();
  
  // Generate optimized sources
  const optimizedSrc = getOptimizedSrc(src, format);
  const lowQualitySrc = enableProgressiveLoading 
    ? getOptimizedSrc(src, 'auto')?.replace(/quality=\d+/, 'quality=20') 
    : null;

  // Progressive loading
  const { currentSrc, isLoading: progressiveLoading } = useProgressiveImage(
    enableProgressiveLoading ? optimizedSrc : null,
    lowQualitySrc
  );

  // Lazy loading
  const handleIntersection = useCallback(() => {
    if (enableMonitoring) {
      setLoadStartTime(Date.now());
      performanceMonitor.startTimer('image-load', src);
    }
  }, [src, enableMonitoring]);

  const [intersectionRef, isIntersecting] = useIntersectionObserver(
    enableLazyLoading ? handleIntersection : null
  );

  // Handle load success
  const handleLoad = useCallback((event) => {
    if (enableMonitoring && loadStartTime) {
      const loadTime = Date.now() - loadStartTime;
      performanceMonitor.endTimer('image-load', src, {
        loadTime,
        width,
        height,
        format,
        cached: loadTime < 50
      });

      performanceMonitor.recordMetric('image-load-success', loadTime, {
        src,
        width,
        height,
        format
      });
    }

    if (onLoad) {
      onLoad(event);
    }
  }, [enableMonitoring, loadStartTime, src, width, height, format, onLoad]);

  // Handle load error
  const handleError = useCallback((event) => {
    setLoadError(true);
    
    if (enableMonitoring) {
      performanceMonitor.recordMetric('image-load-error', 1, {
        src,
        fallbackUsed: true
      });
      
      logger.warn('Image load failed', { src, fallbackSrc });
    }

    if (onError) {
      onError(event);
    }
  }, [src, fallbackSrc, enableMonitoring, onError]);

  // Generate blur placeholder if not provided
  const defaultBlurDataURL = blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined);

  // Determine which source to use
  const finalSrc = loadError ? fallbackSrc : (
    enableProgressiveLoading ? currentSrc : optimizedSrc
  );

  // Don't render until intersecting (if lazy loading is enabled)
  if (enableLazyLoading && !isIntersecting && !priority) {
    return (
      <div
        ref={intersectionRef}
        className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`}
        style={{ width, height }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  return (
    <div ref={intersectionRef} className="relative">
      <Image
        ref={imageRef}
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${progressiveLoading ? 'opacity-70' : 'opacity-100'} transition-opacity duration-300`}
        quality={loadError ? 50 : quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {/* Progressive loading indicator */}
      {enableProgressiveLoading && progressiveLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 bg-opacity-50">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Error state */}
      {loadError && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
          Failed to load
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Preloader utility for critical images
export const preloadImage = (src, priority = false) => {
  if (typeof window === 'undefined') return Promise.resolve();
  
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    
    img.onload = () => {
      performanceMonitor.recordMetric('image-preload-success', 1, { src });
      resolve(img);
    };
    
    img.onerror = () => {
      performanceMonitor.recordMetric('image-preload-error', 1, { src });
      reject(new Error(`Failed to preload image: ${src}`));
    };
    
    // Set priority loading
    if (priority) {
      img.loading = 'eager';
    }
    
    img.src = getOptimizedSrc(src);
  });
};

// Batch preloader for multiple images
export const preloadImages = async (srcArray, maxConcurrent = 3) => {
  const chunks = [];
  for (let i = 0; i < srcArray.length; i += maxConcurrent) {
    chunks.push(srcArray.slice(i, i + maxConcurrent));
  }
  
  const results = [];
  for (const chunk of chunks) {
    const chunkResults = await Promise.allSettled(
      chunk.map(src => preloadImage(src))
    );
    results.push(...chunkResults);
  }
  
  return results;
};

// Image cache utility
class ImageCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  set(src, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(src, { ...data, timestamp: Date.now() });
  }
  
  get(src) {
    return this.cache.get(src);
  }
  
  has(src) {
    return this.cache.has(src);
  }
  
  clear() {
    this.cache.clear();
  }
  
  cleanup(maxAge = 300000) { // 5 minutes
    const now = Date.now();
    for (const [src, data] of this.cache.entries()) {
      if (now - data.timestamp > maxAge) {
        this.cache.delete(src);
      }
    }
  }
}

export const imageCache = new ImageCache();

// Performance monitoring hook for images
export const useImagePerformance = () => {
  const [metrics, setMetrics] = useState({
    totalLoaded: 0,
    totalErrors: 0,
    averageLoadTime: 0,
    cacheHitRate: 0
  });

  useEffect(() => {
    const unsubscribe = performanceMonitor.onVitalsChange((metric) => {
      if (metric.name.startsWith('image-')) {
        setMetrics(prev => ({
          ...prev,
          // Update metrics based on the received data
        }));
      }
    });

    return unsubscribe;
  }, []);

  return metrics;
};

export default OptimizedImage;