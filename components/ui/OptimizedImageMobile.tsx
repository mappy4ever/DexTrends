import React, { useState, useRef, useEffect, useCallback, CSSProperties, ImgHTMLAttributes, ComponentType, forwardRef, RefAttributes } from 'react';
import adaptiveLoading from '../../utils/adaptiveLoading';
import batteryOptimization from '../../utils/batteryOptimization';
import logger from '../../utils/logger';

type PlaceholderType = 'blur' | 'skeleton' | 'color' | 'none';
type Priority = 'high' | 'normal' | 'low';
type Quality = 'auto' | number;
type Format = 'auto' | 'webp' | 'jpeg' | 'png';
type LazyLoading = 'auto' | boolean;

interface OptimizedImageMobileProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'placeholder' | 'onLoad' | 'onError'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: PlaceholderType;
  priority?: Priority;
  sizes?: string;
  quality?: Quality;
  format?: Format;
  lazy?: LazyLoading;
  onLoad?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (event: React.SyntheticEvent<HTMLImageElement>) => void;
  fallback?: string;
}

interface LoadingStrategy {
  strategy: string;
  image: {
    format: string;
    quality: number;
    maxWidth: number;
    lazy: boolean;
  };
}

const OptimizedImageMobile: React.FC<OptimizedImageMobileProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'blur',
  priority = 'normal',
  sizes = '100vw',
  quality = 'auto',
  format = 'auto',
  lazy = 'auto',
  onLoad,
  onError,
  fallback,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(priority === 'high');
  const [optimizedSrc, setOptimizedSrc] = useState('');
  const [loadingStrategy, setLoadingStrategy] = useState<LoadingStrategy | null>(null);

  // Generate optimized image URL
  const generateOptimizedUrl = useCallback((originalSrc: string): string => {
    if (!originalSrc) return '';

    const config = adaptiveLoading.getLoadingConfig();
    const imageConfig = config.image;
    const batteryConfig = batteryOptimization.optimizeImageLoading();

    // Determine format
    let finalFormat = format;
    if (format === 'auto') {
      finalFormat = imageConfig.format as Format;
    }

    // Determine quality
    let finalQuality: number;
    if (quality === 'auto') {
      finalQuality = Math.min(imageConfig.quality, batteryConfig.quality * 100);
    } else {
      finalQuality = quality as number;
    }

    // Determine dimensions
    const maxWidth = Math.min(width || imageConfig.maxWidth, imageConfig.maxWidth);
    const devicePixelRatio = window.devicePixelRatio || 1;
    const actualWidth = maxWidth * (config.strategy === 'full' ? devicePixelRatio : 1);

    // Build optimized URL
    try {
      const url = new URL(originalSrc, window.location.origin);
      
      // Add optimization parameters
      if (url.hostname.includes('pokemontcg.io') || url.hostname.includes('images.')) {
        url.searchParams.set('w', actualWidth.toString());
        url.searchParams.set('q', finalQuality.toString());
        url.searchParams.set('f', finalFormat);
        
        // Add additional optimizations for slow connections
        if (config.strategy === 'minimal') {
          url.searchParams.set('blur', '1');
          url.searchParams.set('progressive', '1');
        }
      }

      return url.toString();
    } catch (error) {
      logger.warn('Failed to optimize image URL:', { error });
      return originalSrc;
    }
  }, [width, format, quality]);

  // Update optimized source when src changes or strategy changes
  useEffect(() => {
    const updateStrategy = () => {
      const config = adaptiveLoading.getLoadingConfig();
      setLoadingStrategy(config);
      
      if (src) {
        const optimized = generateOptimizedUrl(src);
        setOptimizedSrc(optimized);
      }
    };

    updateStrategy();

    // Listen for strategy changes
    const handleStrategyChange = () => updateStrategy();
    const handleBatteryChange = () => updateStrategy();

    window.addEventListener('adaptiveLoadingStrategyChange', handleStrategyChange);
    window.addEventListener('batteryOptimizationChange', handleBatteryChange);

    return () => {
      window.removeEventListener('adaptiveLoadingStrategyChange', handleStrategyChange);
      window.removeEventListener('batteryOptimizationChange', handleBatteryChange);
    };
  }, [src, generateOptimizedUrl]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const shouldLazyLoad = lazy === 'auto' ? 
      loadingStrategy?.image?.lazy !== false : 
      lazy === true;

    if (!shouldLazyLoad || priority === 'high' || isVisible) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority, isVisible, loadingStrategy]);

  // Handle image load
  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(false);
    
    // Fade out placeholder
    if (placeholderRef.current) {
      placeholderRef.current.style.opacity = '0';
      setTimeout(() => {
        if (placeholderRef.current) {
          placeholderRef.current.style.display = 'none';
        }
      }, 200);
    }

    onLoad?.(event);
    
    logger.debug('Image loaded:', { src: optimizedSrc });
  }, [optimizedSrc, onLoad]);

  // Handle image error
  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    setHasError(true);
    setIsLoading(false);

    // Try fallback if available
    if (fallback && optimizedSrc !== fallback) {
      setOptimizedSrc(fallback);
      setHasError(false);
      setIsLoading(true);
      return;
    }

    onError?.(event);
    
    logger.warn('Image failed to load:', { src: optimizedSrc });
  }, [optimizedSrc, fallback, onError]);

  // Generate placeholder content
  const renderPlaceholder = () => {
    if (placeholder === 'none') return null;

    const placeholderStyle: CSSProperties = {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 200ms ease-out',
      zIndex: 1
    };

    switch (placeholder) {
      case 'blur':
        return (
          <div
            ref={placeholderRef}
            style={{
              ...placeholderStyle,
              background: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              filter: 'blur(1px)'
            }}
          />
        );

      case 'skeleton':
        return (
          <div
            ref={placeholderRef}
            style={{
              ...placeholderStyle,
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'skeleton-loading 1.5s infinite'
            }}
          />
        );

      case 'color':
        return (
          <div
            ref={placeholderRef}
            style={{
              ...placeholderStyle,
              backgroundColor: '#f5f5f5'
            }}
          />
        );

      default:
        return (
          <div
            ref={placeholderRef}
            style={{
              ...placeholderStyle,
              backgroundColor: '#f5f5f5'
            }}
          >
            <span style={{ color: '#999', fontSize: '12px' }}>Loading...</span>
          </div>
        );
    }
  };

  // Generate error content
  const renderError = () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#999',
        fontSize: '12px',
        textAlign: 'center',
        padding: '8px'
      }}
    >
      <span style={{ fontSize: '20px', marginBottom: '4px' }}>🖼️</span>
      <span>Image unavailable</span>
    </div>
  );

  // Container style
  const containerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: width || '100%',
    height: height || 'auto',
    overflow: 'hidden'
  };

  // Image style
  const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 200ms ease-out',
    opacity: isLoading ? 0 : 1
  };

  return (
    <div className={`optimized-image ${className}`} style={containerStyle}>
      {isVisible && !hasError && (
        <img
          ref={imgRef}
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority === 'high' ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}

      {isLoading && !hasError && renderPlaceholder()}
      {hasError && renderError()}

      {/* Add critical CSS */}
      <style jsx>{`
        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        .optimized-image {
          /* Improve font rendering during loading */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .optimized-image * {
            animation: none !important;
            transition: none !important;
          }
        }

        /* High contrast support */
        @media (prefers-contrast: high) {
          .optimized-image {
            border: 1px solid currentColor;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .optimized-image [style*="background"] {
            filter: invert(1);
          }
        }
      `}</style>
    </div>
  );
};

// Higher-order component for batch loading
export const withBatchLoading = (Component: ComponentType<OptimizedImageMobileProps>) => {
  const BatchLoadingComponent = forwardRef<HTMLDivElement, OptimizedImageMobileProps>((props, ref) => {
    const [batchLoaded, setBatchLoaded] = useState(false);
    
    useEffect(() => {
      // Implement batch loading logic
      const timer = setTimeout(() => {
        setBatchLoaded(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }, []);

    if (!batchLoaded && props.priority !== 'high') {
      return <div ref={ref} style={{ width: props.width, height: props.height }} />;
    }

    return <Component {...props} />;
  });

  BatchLoadingComponent.displayName = `withBatchLoading(${Component.displayName || Component.name || 'Component'})`;

  return BatchLoadingComponent;
};

interface PreloadOptions {
  crossOrigin?: string;
}

// Preload utility
export const preloadImage = (src: string, options: PreloadOptions = {}): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin;
    }
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

interface BatchPreloadOptions extends PreloadOptions {
  batchSize?: number;
  delay?: number;
}

// Batch preload utility
export const preloadImages = async (urls: string[], options: BatchPreloadOptions = {}): Promise<PromiseSettledResult<HTMLImageElement>[]> => {
  const { batchSize = 3, delay = 100 } = options;
  const results: PromiseSettledResult<HTMLImageElement>[] = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchPromises = batch.map(url => preloadImage(url, options));
    
    try {
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < urls.length && delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      logger.error('Batch preload failed:', { error });
    }
  }
  
  return results;
};

export default OptimizedImageMobile;