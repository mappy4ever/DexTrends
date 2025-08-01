import React, { useState, useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import { useIntersectionObserver } from './PerformanceMonitor';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  lazy?: boolean;
  fallbackSrc?: string;
}

const OptimizedImage = memo(({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = "blur",
  onLoad,
  onError,
  lazy = true,
  fallbackSrc = '/dextrendslogo.png',
}: OptimizedImageProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLDivElement>(null);
  
  // Use intersection observer for lazy loading only when lazy is true
  const isInView = useIntersectionObserver(imgRef as React.RefObject<HTMLElement>, {
    threshold: 0.1,
    rootMargin: '50px',
  });

  // When lazy is false, always load immediately regardless of intersection
  // This prevents blank cards during scrolling in virtualized grids
  const shouldLoad = !lazy || priority || isInView;

  const handleLoad = useCallback(() => {
    setLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    setLoading(false);
    
    // Try fallback image if current source failed
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setError(false);
    }
    
    onError?.(e);
  }, [onError, currentSrc, fallbackSrc]);

  // Generate blur data URL for placeholder
  const blurDataURL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k=";

  // For non-lazy images, skip loading states to prevent flashing
  const skipLoadingState = !lazy || priority;

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {loading && !error && !skipLoadingState && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
      
      {error && (
        <div 
          className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 rounded"
          style={{ width, height }}
        >
          <span className="text-2xl">📷</span>
        </div>
      )}
      
      {shouldLoad && (
        <Image
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          className={`${className} ${loading && !skipLoadingState ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          placeholder={placeholder === "blur" ? "blur" : "empty"}
          blurDataURL={placeholder === "blur" ? blurDataURL : undefined}
          loading={priority ? 'eager' : 'lazy'}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;