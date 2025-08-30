import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallback?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  animate?: boolean;
}

/**
 * Production-ready Optimized Image Component
 * 
 * Features:
 * - Automatic blur placeholder generation
 * - Progressive loading with animation
 * - Error handling with fallback
 * - Responsive sizing
 * - Performance optimized
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  className,
  containerClassName,
  onLoad,
  onError,
  fallback,
  loading = 'lazy',
  sizes,
  objectFit = 'cover',
  animate = true
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate blur placeholder if not provided
  const blurPlaceholder = blurDataURL || generateBlurDataURL(src);

  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
    
    // Try fallback URL patterns
    if (src.includes('pokemon')) {
      // Try alternative Pokemon image sources
      const pokemonId = src.match(/\/(\d+)\./)?.[1];
      if (pokemonId) {
        const fallbackUrls = [
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`,
          `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
          '/images/pokemon-placeholder.png'
        ];
        
        // Try next fallback
        const currentIndex = fallbackUrls.indexOf(imageSrc);
        if (currentIndex < fallbackUrls.length - 1) {
          setImageSrc(fallbackUrls[currentIndex + 1]);
          setHasError(false);
        }
      }
    }
  };

  // Show error fallback
  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  // Default error fallback
  if (hasError && !fallback) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-lg',
          containerClassName
        )}
        style={{ width, height }}
      >
        <svg 
          className="w-1/3 h-1/3 text-gray-400 dark:text-gray-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  }

  const imageElement = (
    <Image
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      priority={priority}
      quality={quality}
      placeholder={placeholder}
      blurDataURL={placeholder === 'blur' ? blurPlaceholder : undefined}
      className={cn(
        'transition-opacity duration-300',
        !isLoaded && animate && 'opacity-0',
        isLoaded && 'opacity-100',
        className
      )}
      onLoad={handleLoad}
      onError={handleError}
      loading={loading}
      sizes={sizes || generateSizes(width)}
      style={{
        objectFit: objectFit as any
      }}
    />
  );

  if (!animate) {
    return fill ? (
      <div className={cn('relative', containerClassName)}>
        {imageElement}
      </div>
    ) : (
      imageElement
    );
  }

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      <AnimatePresence>
        {!isLoaded && placeholder === 'blur' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-10"
            style={{
              backgroundImage: `url(${blurPlaceholder})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px)',
              transform: 'scale(1.1)'
            }}
          />
        )}
      </AnimatePresence>
      
      {imageElement}
      
      {/* Loading shimmer effect */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
      )}
    </div>
  );
}

/**
 * Generate responsive sizes string
 */
function generateSizes(width?: number): string {
  if (!width) {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }
  
  if (width < 200) {
    return `${width}px`;
  }
  
  if (width < 400) {
    return `(max-width: 640px) ${width * 1.5}px, ${width}px`;
  }
  
  return `(max-width: 640px) 100vw, (max-width: 1024px) 50vw, ${width}px`;
}

/**
 * Generate a simple blur data URL
 */
function generateBlurDataURL(src: string): string {
  // Create a simple colored blur based on image type
  let color = '200,200,200'; // Default gray
  
  if (src.includes('pokemon')) {
    // Pokemon images get a red tint
    color = '248,113,113';
  } else if (src.includes('card')) {
    // Card images get a blue tint
    color = '147,197,253';
  } else if (src.includes('trainer') || src.includes('gym')) {
    // Trainer images get a purple tint
    color = '196,181,253';
  }
  
  // Generate a 1x1 pixel colored image
  const svg = `
    <svg width="1" height="1" xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="1" fill="rgb(${color})" />
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${typeof window !== 'undefined' ? btoa(svg) : Buffer.from(svg).toString('base64')}`;
}

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]) {
  if (typeof window === 'undefined') return;
  
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Image Gallery Component
 */
export function ImageGallery({
  images,
  columns = 3,
  gap = 16
}: {
  images: Array<{ src: string; alt: string; width?: number; height?: number }>;
  columns?: number;
  gap?: number;
}) {
  return (
    <div 
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`
      }}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={image.src}
          src={image.src}
          alt={image.alt}
          width={image.width || 400}
          height={image.height || 400}
          priority={index < columns} // Prioritize first row
          containerClassName="aspect-square rounded-lg overflow-hidden"
          className="w-full h-full"
        />
      ))}
    </div>
  );
}

/**
 * Avatar Component with optimized loading
 */
export function Avatar({
  src,
  alt,
  size = 40,
  fallback,
  className
}: {
  src: string;
  alt: string;
  size?: number;
  fallback?: React.ReactNode;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      containerClassName={cn('rounded-full overflow-hidden', className)}
      fallback={
        fallback || (
          <div 
            className={cn(
              'flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-400 text-white font-bold rounded-full',
              className
            )}
            style={{ width: size, height: size }}
          >
            {alt.charAt(0).toUpperCase()}
          </div>
        )
      }
      objectFit="cover"
      animate={false}
    />
  );
}

// Add shimmer animation if not already defined
if (typeof window !== 'undefined' && !document.getElementById('image-shimmer-style')) {
  const style = document.createElement('style');
  style.id = 'image-shimmer-style';
  style.textContent = `
    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }
    
    .animate-shimmer {
      animation: shimmer 1.5s infinite;
    }
  `;
  document.head.appendChild(style);
}