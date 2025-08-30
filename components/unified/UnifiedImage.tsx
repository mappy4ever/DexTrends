import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import logger from '@/utils/logger';

/**
 * Unified Optimized Image Component
 * 
 * Features:
 * - Next.js Image optimization
 * - Lazy loading with blur placeholder
 * - Responsive sizing
 * - Error handling with fallback
 * - Progressive enhancement
 * - Intersection observer
 */

interface UnifiedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  fallbackSrc?: string;
  className?: string;
  containerClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  loading?: 'lazy' | 'eager';
  unoptimized?: boolean;
}

export function UnifiedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  fallbackSrc = '/images/placeholder.png',
  className,
  containerClassName,
  onLoad,
  onError,
  sizes,
  objectFit = 'cover',
  loading = 'lazy',
  unoptimized = false
}: UnifiedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Generate blur placeholder if not provided
  const getBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    // Generate a simple blur placeholder
    return generateBlurPlaceholder(objectFit === 'contain' ? 'transparent' : 'gray');
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
    logger.debug('Image loaded', { src, alt });
  };

  // Handle image error
  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      logger.warn('Image failed to load, using fallback', { src, fallbackSrc });
    } else {
      setHasError(true);
      logger.error('Image and fallback failed to load', { src, fallbackSrc });
    }
    onError?.();
  };

  // Responsive sizes based on viewport
  const getSizes = () => {
    if (sizes) return sizes;
    if (fill) return '100vw';
    
    // Default responsive sizes
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  };

  // Error state
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          'bg-gray-100 dark:bg-gray-800',
          'rounded-lg',
          containerClassName
        )}
        style={{ width, height }}
      >
        <svg
          className="w-12 h-12 text-gray-400"
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

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        fill && 'w-full h-full',
        containerClassName
      )}
      style={!fill ? { width, height } : undefined}
    >
      {/* Loading skeleton */}
      {isLoading && placeholder === 'empty' && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}

      {/* Main Image */}
      <Image
        src={imgSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholder === 'blur' ? getBlurDataURL() : undefined}
        onLoad={handleLoad}
        onError={handleError}
        sizes={getSizes()}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        style={{ objectFit }}
        loading={loading}
        unoptimized={unoptimized}
      />
    </div>
  );
}

/**
 * Pokemon-specific optimized image
 */
export function PokemonImage({
  pokemonId,
  name,
  shiny = false,
  animated = false,
  size = 'medium',
  className,
  ...props
}: {
  pokemonId: number | string;
  name: string;
  shiny?: boolean;
  animated?: boolean;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
} & Partial<UnifiedImageProps>) {
  const sizes = {
    small: { width: 96, height: 96 },
    medium: { width: 192, height: 192 },
    large: { width: 384, height: 384 },
    xlarge: { width: 512, height: 512 }
  };

  const { width, height } = sizes[size];

  // Construct sprite URL
  const getSpriteUrl = () => {
    const baseUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
    const variant = shiny ? 'shiny' : 'other/official-artwork';
    const extension = animated ? '.gif' : '.png';
    
    if (animated) {
      return `${baseUrl}/versions/generation-v/black-white/animated/${pokemonId}${extension}`;
    }
    
    return `${baseUrl}/${variant}/${pokemonId}${extension}`;
  };

  return (
    <UnifiedImage
      src={getSpriteUrl()}
      alt={name}
      width={width}
      height={height}
      fallbackSrc="/images/pokeball-placeholder.png"
      className={className}
      {...props}
    />
  );
}

/**
 * TCG Card optimized image
 */
export function CardImage({
  cardId,
  cardName,
  size = 'medium',
  cardQuality = 'high',
  className,
  ...props
}: {
  cardId: string;
  cardName: string;
  size?: 'small' | 'medium' | 'large';
  cardQuality?: 'low' | 'high';
  className?: string;
} & Omit<Partial<UnifiedImageProps>, 'quality'>) {
  const sizes = {
    small: { width: 245, height: 342 },
    medium: { width: 367, height: 512 },
    large: { width: 734, height: 1024 }
  };

  const { width, height } = sizes[size];

  // Construct card image URL
  const getCardUrl = () => {
    const baseUrl = 'https://images.pokemontcg.io';
    const qualitySuffix = cardQuality === 'high' ? '_hires' : '';
    return `${baseUrl}/${cardId}${qualitySuffix}.png`;
  };

  return (
    <UnifiedImage
      src={getCardUrl()}
      alt={cardName}
      width={width}
      height={height}
      fallbackSrc="/images/card-back.png"
      className={className}
      objectFit="contain"
      {...props}
    />
  );
}

/**
 * Gallery with optimized images
 */
export function ImageGallery({
  images,
  columns = 3,
  gap = 4,
  className
}: {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${columns}`,
        `gap-${gap}`,
        className
      )}
    >
      {images.map((image, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <UnifiedImage
            src={image.src}
            alt={image.alt}
            width={image.width || 400}
            height={image.height || 300}
            className="rounded-lg"
          />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Progressive image loading with multiple qualities
 */
export function ProgressiveImage({
  lowQualitySrc,
  highQualitySrc,
  alt,
  className,
  ...props
}: {
  lowQualitySrc: string;
  highQualitySrc: string;
  alt: string;
  className?: string;
} & Partial<UnifiedImageProps>) {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc);
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.src = highQualitySrc;
    img.onload = () => {
      setCurrentSrc(highQualitySrc);
      setIsHighQualityLoaded(true);
    };
  }, [highQualitySrc]);

  return (
    <div className="relative">
      <UnifiedImage
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-filter duration-500',
          !isHighQualityLoaded && 'blur-sm',
          className
        )}
        {...props}
      />
      
      {!isHighQualityLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * Generate base64 blur placeholder
 */
function generateBlurPlaceholder(color: 'gray' | 'transparent' = 'gray'): string {
  const svg = color === 'transparent'
    ? '<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="transparent"/></svg>'
    : '<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" fill="#e5e7eb"/></svg>';
  
  const base64 = typeof window !== 'undefined' 
    ? btoa(svg)
    : Buffer.from(svg).toString('base64');
  
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Lazy load image on intersection
 */
export function LazyImage({
  threshold = 0.1,
  rootMargin = '50px',
  ...props
}: UnifiedImageProps & {
  threshold?: number;
  rootMargin?: string;
}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  if (!isInView) {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-200 dark:bg-gray-700 animate-pulse',
          props.containerClassName
        )}
        style={{ width: props.width, height: props.height }}
      />
    );
  }

  return <UnifiedImage {...props} />;
}