import React from 'react';
import { motion } from 'framer-motion';
import { useProgressiveImage } from '@/hooks/useProgressiveImage';
import { cn } from '@/utils/cn';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  imgClassName?: string;
  fallback?: string;
  blur?: boolean;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: string;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  alt,
  placeholder,
  className,
  imgClassName,
  fallback = '/back-card.png',
  blur = true,
  priority = false,
  onLoad,
  onError,
  aspectRatio = '1/1'
}) => {
  const { currentSrc, isLoading, hasError, ref } = useProgressiveImage({
    src,
    placeholder,
    blur,
    threshold: priority ? 0 : 0.1,
    rootMargin: priority ? '500px' : '50px'
  });

  React.useEffect(() => {
    if (!isLoading && !hasError) {
      onLoad?.();
    }
  }, [isLoading, hasError, onLoad]);

  React.useEffect(() => {
    if (hasError) {
      onError?.();
    }
  }, [hasError, onError]);

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-stone-100 dark:bg-stone-800",
        className
      )}
      style={{ aspectRatio }}
    >
      {/* Blur placeholder */}
      {blur && isLoading && placeholder && (
        <div 
          className="absolute inset-0 scale-110"
          style={{
            backgroundImage: `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)'
          }}
        />
      )}

      {/* Skeleton loader */}
      {isLoading && (
        <div className="absolute inset-0 animate-pulse">
          <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-700 dark:to-stone-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      )}

      {/* Main image */}
      <motion.img
        ref={ref}
        src={hasError ? fallback : currentSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover",
          isLoading && "opacity-0",
          !isLoading && "opacity-100",
          "transition-opacity duration-300",
          imgClassName
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        loading={priority ? "eager" : "lazy"}
      />

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-stone-800">
          <div className="text-center p-4">
            <svg
              className="w-12 h-12 mx-auto mb-2 text-stone-400"
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
            <p className="text-xs text-stone-500 dark:text-stone-400">Failed to load</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Optimized version for Pokemon cards
export const PokemonCardImage: React.FC<{
  src: string;
  alt: string;
  cardName?: string;
  setName?: string;
  className?: string;
  onClick?: () => void;
}> = ({ src, alt, cardName, setName, className, onClick }) => {
  // Generate LQIP (Low Quality Image Placeholder) URL
  const getLQIP = (url: string) => {
    if (url.includes('images.pokemontcg.io')) {
      // TCG images have low quality versions
      return url.replace('/high.', '/low.').replace('.png', '_small.png');
    }
    return undefined;
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group cursor-pointer",
        "transform transition-all duration-200",
        "hover:scale-105 active:scale-95",
        className
      )}
    >
      <ProgressiveImage
        src={src}
        alt={alt}
        placeholder={getLQIP(src)}
        className="rounded-xl shadow-lg group-hover:shadow-xl"
        imgClassName="rounded-xl"
        aspectRatio="2.5/3.5" // Pokemon card ratio
      />
      
      {/* Card info overlay */}
      {(cardName || setName) && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
          {cardName && (
            <p className="text-white text-sm font-semibold truncate">{cardName}</p>
          )}
          {setName && (
            <p className="text-white/70 text-xs truncate">{setName}</p>
          )}
        </div>
      )}
    </button>
  );
};