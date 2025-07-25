/**
 * Advanced image optimization utilities for card images
 */

import performanceMonitor from './performanceMonitor';
import logger from './logger';

// Type definitions
type ImageQuality = 'thumbnail' | 'small' | 'medium' | 'large' | 'full';
type ImageFormat = 'webp' | 'jpeg' | 'png' | 'avif';
type Priority = 'low' | 'high';

interface ImageQualityMap {
  thumbnail: number;
  small: number;
  medium: number;
  large: number;
  full: number;
}

interface PreloadOptions {
  priority?: Priority;
  quality?: ImageQuality;
  maxConcurrent?: number;
  timeout?: number;
}

interface SingleImageOptions {
  quality?: ImageQuality;
  timeout?: number;
}

interface OptimizeOptions {
  width?: number | null;
  height?: number | null;
  quality?: ImageQuality;
  format?: ImageFormat;
}

interface ResponsiveOptions {
  sizes?: number[];
  quality?: ImageQuality;
  format?: ImageFormat;
}

interface ResponsiveUrls {
  src: string;
  srcSet: string;
  sizes: string;
}

interface LazyLoadOptions {
  placeholder?: string;
  quality?: ImageQuality;
  onLoad?: ((img: HTMLImageElement) => void) | null;
  onError?: ((error: any) => void) | null;
}

interface CardImagesOptions {
  visibleCount?: number;
  preloadAhead?: number;
  quality?: ImageQuality;
  priority?: Priority;
}

interface CardImagePropsOptions {
  width?: number;
  height?: number;
  quality?: ImageQuality;
  priority?: boolean;
  sizes?: string;
}

interface CardImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  quality: number;
  priority: boolean;
  sizes: string;
  placeholder: 'blur' | 'empty';
  blurDataURL: string;
  onError: (e: any) => void;
}

interface CacheStats {
  cachedImages: number;
  loadingImages: number;
  observerActive: boolean;
}

interface Card {
  id?: string;
  name?: string;
  images?: {
    small?: string;
    large?: string;
  };
  image?: string;
}

class ImageOptimizer {
  private preloadCache: Map<string, HTMLImageElement>;
  private loadingPromises: Map<string, Promise<HTMLImageElement>>;
  private observer: IntersectionObserver | null;
  private readonly imageQualities: ImageQualityMap;
  private readonly isClient: boolean;

  constructor() {
    this.preloadCache = new Map();
    this.loadingPromises = new Map();
    this.observer = null;
    this.imageQualities = {
      thumbnail: 40,
      small: 60,
      medium: 75,
      large: 85,
      full: 95
    };
    this.isClient = typeof window !== 'undefined';
    
    if (this.isClient) {
      this.initializeIntersectionObserver();
    }
  }

  /**
   * Initialize intersection observer for lazy loading
   */
  private initializeIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) {
      logger.warn('IntersectionObserver not supported, falling back to eager loading');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              this.loadImage(src, img);
              this.observer!.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: '100px 0px', // Start loading 100px before entering viewport
        threshold: 0.01
      }
    );
  }

  /**
   * Preload critical card images
   */
  async preloadImages(imageUrls: string[], options: PreloadOptions = {}): Promise<PromiseSettledResult<HTMLImageElement>[]> {
    const {
      priority = 'low',
      quality = 'medium',
      maxConcurrent = 3,
      timeout = 10000
    } = options;

    if (!this.isClient || !imageUrls.length) return [];

    const startTime = Date.now();
    const chunks = this.chunkArray(imageUrls, maxConcurrent);
    const results: PromiseSettledResult<HTMLImageElement>[] = [];

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(url => 
        this.preloadSingleImage(url, { quality, timeout })
      );
      
      const chunkResults = await Promise.allSettled(chunkPromises);
      results.push(...chunkResults);
    }

    const duration = Date.now() - startTime;
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    performanceMonitor.recordMetric('image-preload-batch', duration, {
      total: imageUrls.length,
      successful,
      failed: imageUrls.length - successful,
      quality,
      priority
    });

    logger.debug('Image preload batch completed', {
      total: imageUrls.length,
      successful,
      duration
    });

    return results;
  }

  /**
   * Preload a single image with caching
   */
  async preloadSingleImage(url: string, options: SingleImageOptions = {}): Promise<HTMLImageElement> {
    const { quality = 'medium', timeout = 10000 } = options;
    
    // Check cache first
    if (this.preloadCache.has(url)) {
      return this.preloadCache.get(url)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    const loadPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        reject(new Error(`Image preload timeout: ${url}`));
      }, timeout);

      img.onload = () => {
        clearTimeout(timeoutId);
        this.preloadCache.set(url, img);
        resolve(img);
      };

      img.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error(`Failed to preload image: ${url}`));
      };

      // Optimize URL if needed
      img.src = this.optimizeImageUrl(url, { quality });
    });

    this.loadingPromises.set(url, loadPromise);
    
    try {
      const result = await loadPromise;
      return result;
    } finally {
      this.loadingPromises.delete(url);
    }
  }

  /**
   * Optimize image URL with Next.js Image optimization
   */
  optimizeImageUrl(url: string, options: OptimizeOptions = {}): string {
    const {
      width = null,
      height = null,
      quality = 'medium',
      format = 'webp'
    } = options;

    // Skip optimization for external URLs or if already optimized
    if (!url || url.startsWith('data:') || url.includes('/_next/image')) {
      return url;
    }

    // Build optimization parameters
    const params = new URLSearchParams();
    params.set('url', url);
    params.set('q', String(this.imageQualities[quality] || 75));
    
    if (width) params.set('w', String(width));
    if (height) params.set('h', String(height));
    if (format) params.set('f', format);

    return `/_next/image?${params.toString()}`;
  }

  /**
   * Create responsive image URLs for different screen sizes
   */
  createResponsiveUrls(url: string, options: ResponsiveOptions = {}): ResponsiveUrls {
    const {
      sizes = [320, 640, 960, 1280, 1920],
      quality = 'medium',
      format = 'webp'
    } = options;

    return {
      src: this.optimizeImageUrl(url, { quality, format }),
      srcSet: sizes.map(size => 
        `${this.optimizeImageUrl(url, { width: size, quality, format })} ${size}w`
      ).join(', '),
      sizes: sizes.map((size, index) => {
        if (index === sizes.length - 1) return `${size}px`;
        return `(max-width: ${size}px) ${size}px`;
      }).join(', ')
    };
  }

  /**
   * Lazy load image with intersection observer
   */
  lazyLoad(img: HTMLImageElement, src: string, options: LazyLoadOptions = {}): void {
    if (!this.isClient || !img) return;

    const { 
      placeholder = '/back-card.png',
      quality = 'medium',
      onLoad = null,
      onError = null
    } = options;

    // Set placeholder immediately
    img.src = placeholder;
    img.dataset.src = src;

    // Add to observer if available
    if (this.observer) {
      this.observer.observe(img);
    } else {
      // Fallback: load immediately
      this.loadImage(src, img, { quality, onLoad, onError });
    }
  }

  /**
   * Load image with performance monitoring
   */
  async loadImage(src: string, img: HTMLImageElement, options: LazyLoadOptions = {}): Promise<void> {
    const { quality = 'medium', onLoad = null, onError = null } = options;
    const startTime = Date.now();

    try {
      const optimizedSrc = this.optimizeImageUrl(src, { quality });
      
      // Check if image is already cached
      if (this.preloadCache.has(optimizedSrc)) {
        img.src = optimizedSrc;
        if (onLoad) onLoad(img);
        return;
      }

      img.onload = () => {
        const duration = Date.now() - startTime;
        performanceMonitor.recordMetric('image-load-time', duration, {
          src: optimizedSrc,
          quality,
          cached: false
        });
        
        if (onLoad) onLoad(img);
      };

      img.onerror = (error) => {
        const duration = Date.now() - startTime;
        performanceMonitor.recordMetric('image-load-error', duration, {
          src: optimizedSrc,
          quality
        });
        
        logger.warn('Image load failed', { src: optimizedSrc, error });
        
        // Fallback to placeholder
        img.src = '/back-card.png';
        
        if (onError) onError(error);
      };

      img.src = optimizedSrc;
    } catch (error) {
      logger.error('Error loading image', { src, error });
      if (onError) onError(error);
    }
  }

  /**
   * Preload card images based on viewport and user behavior
   */
  preloadCardImages(cards: Card[], options: CardImagesOptions = {}): Promise<PromiseSettledResult<HTMLImageElement>[]> {
    const {
      visibleCount = 24,
      preloadAhead = 12,
      quality = 'medium',
      priority = 'low'
    } = options;

    if (!Array.isArray(cards) || cards.length === 0) return Promise.resolve([]);

    // Get images to preload (visible + ahead)
    const imagesToPreload = cards
      .slice(0, visibleCount + preloadAhead)
      .map(card => {
        if (card.images?.small) return card.images.small;
        if (card.images?.large) return card.images.large;
        if (card.image) return card.image;
        return null;
      })
      .filter((url): url is string => Boolean(url));

    return this.preloadImages(imagesToPreload, { quality, priority });
  }

  /**
   * Get optimized card image properties for Next.js Image component
   */
  getCardImageProps(card: Card, options: CardImagePropsOptions = {}): CardImageProps {
    const {
      width = 220,
      height = 308,
      quality = 'medium',
      priority = false,
      sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    } = options;

    let src = '/back-card.png';
    if (card.images?.small) src = card.images.small;
    else if (card.images?.large) src = card.images.large;
    else if (card.image) src = card.image;

    return {
      src,
      alt: card.name || 'Card image',
      width,
      height,
      quality: this.imageQualities[quality] || 75,
      priority,
      sizes,
      placeholder: 'blur',
      blurDataURL: this.generateBlurDataURL(),
      onError: (e: any) => {
        if (e.target.src !== '/back-card.png') {
          e.target.src = '/back-card.png';
        }
      }
    };
  }

  /**
   * Generate a blur placeholder data URL
   */
  private generateBlurDataURL(): string {
    return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k=";
  }

  /**
   * Clear cache and cleanup
   */
  cleanup(): void {
    this.preloadCache.clear();
    this.loadingPromises.clear();
    
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /**
   * Utility: Split array into chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    return {
      cachedImages: this.preloadCache.size,
      loadingImages: this.loadingPromises.size,
      observerActive: !!this.observer
    };
  }
}

// Create global instance
const imageOptimizer = new ImageOptimizer();

// React hook for image optimization
export const useImageOptimization = () => {
  if (typeof window === 'undefined') {
    return {
      preloadImages: () => Promise.resolve([]),
      lazyLoad: () => {},
      getCardImageProps: (card: Card) => ({ 
        src: '/back-card.png', 
        alt: card.name || 'Card',
        width: 220,
        height: 308,
        quality: 75,
        priority: false,
        sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
        placeholder: 'blur' as const,
        blurDataURL: imageOptimizer['generateBlurDataURL'](),
        onError: () => {}
      }),
      getCacheStats: () => ({ cachedImages: 0, loadingImages: 0, observerActive: false })
    };
  }

  const React = require('react') as typeof import('react');
  const { useCallback, useEffect } = React;

  const preloadImages = useCallback((urls: string[], options?: PreloadOptions) => {
    return imageOptimizer.preloadImages(urls, options);
  }, []);

  const lazyLoad = useCallback((img: HTMLImageElement, src: string, options?: LazyLoadOptions) => {
    return imageOptimizer.lazyLoad(img, src, options);
  }, []);

  const getCardImageProps = useCallback((card: Card, options?: CardImagePropsOptions) => {
    return imageOptimizer.getCardImageProps(card, options);
  }, []);

  const getCacheStats = useCallback(() => {
    return imageOptimizer.getCacheStats();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't cleanup global instance on component unmount
      // imageOptimizer.cleanup();
    };
  }, []);

  return {
    preloadImages,
    lazyLoad,
    getCardImageProps,
    getCacheStats,
    preloadCardImages: imageOptimizer.preloadCardImages.bind(imageOptimizer)
  };
};

export default imageOptimizer;