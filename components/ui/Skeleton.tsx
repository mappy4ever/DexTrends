import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/cn';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'shimmer' | 'none';
  children?: React.ReactNode;
  loading?: boolean;
  delay?: number;
  // Backward compatibility props for LoadingStateGlass
  type?: 'spinner' | 'skeleton' | 'card' | 'grid' | 'card-grid';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  rows?: number;
  columns?: number;
  count?: number;
  showPrice?: boolean;
  showTypes?: boolean;
  showHP?: boolean;
}

/**
 * Unified Skeleton Component
 * Consolidates all skeleton variants from:
 * - Skeleton.tsx (this file)
 * - LoadingSkeletons.tsx
 * - SkeletonLoadingSystem.tsx
 * - DexTrendsLoading.tsx
 * - AdvancedLoadingStates.tsx
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  children,
  loading = true,
  delay = 0
}) => {
  const [showSkeleton, setShowSkeleton] = useState(delay === 0 ? loading : false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (delay > 0 && loading) {
      timer = setTimeout(() => {
        setShowSkeleton(true);
      }, delay);
    } else {
      setShowSkeleton(loading);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, delay]);

  const variantStyles = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    shimmer: 'animate-shimmer',
    none: ''
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  // If children provided, use as template for sizing
  if (children) {
    return (
      <div className="relative">
        <div className="invisible">{children}</div>
        <div
          className={cn(
            'absolute inset-0',
            'bg-gray-200 dark:bg-gray-700',
            variantStyles[variant],
            animationStyles[animation],
            className
          )}
          style={style}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        variantStyles[variant],
        animationStyles[animation],
        variant === 'text' && !height && 'h-4',
        className
      )}
      style={style}
    />
  );
};

/**
 * SkeletonText - Multi-line text skeleton
 */
export const SkeletonText: React.FC<{
  lines?: number;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ lines = 3, spacing = 'md', className }) => {
  const spacingStyles = {
    sm: 'space-y-1',
    md: 'space-y-2',
    lg: 'space-y-3'
  };

  return (
    <div className={cn(spacingStyles[spacing], className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
};

/**
 * SkeletonCard - Card-shaped skeleton
 */
export const SkeletonCard: React.FC<{
  className?: string;
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  // Backward compatibility props (aliases for common patterns)
  showPrice?: boolean;
  showSet?: boolean;
  showTypes?: boolean;
}> = ({
  className,
  showImage = true,
  showTitle = true,
  showDescription = true,
  showActions = false,
  // Allow aliases
  showPrice,
  showSet,
  showTypes
}) => {
  // Map aliases to the standard props
  const effectiveShowDescription = showDescription || showSet;
  const effectiveShowActions = showActions || showPrice;
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-xl p-4 sm:p-6',
        'space-y-4',
        className
      )}
    >
      {showImage && (
        <Skeleton
          variant="rounded"
          className="w-full h-32 sm:h-40 md:h-48"
        />
      )}
      {showTitle && (
        <Skeleton variant="text" className="h-6 sm:h-7 w-3/4" />
      )}
      {effectiveShowDescription && (
        <SkeletonText lines={2} />
      )}
      {effectiveShowActions && (
        <div className="flex gap-2 sm:gap-3 pt-2">
          <Skeleton variant="rounded" className="h-9 sm:h-10 w-20" />
          <Skeleton variant="rounded" className="h-9 sm:h-10 w-20" />
        </div>
      )}
    </div>
  );
};

/**
 * SkeletonAvatar - Avatar skeleton
 */
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24'
  };

  return (
    <Skeleton
      variant="circular"
      className={cn(sizeStyles[size], className)}
    />
  );
};

/**
 * SkeletonButton - Button skeleton
 */
export const SkeletonButton: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className }) => {
  const sizeStyles = {
    sm: 'h-8 w-16 sm:h-9 sm:w-20',
    md: 'h-10 w-24 sm:h-11 sm:w-28',
    lg: 'h-12 w-32 sm:h-14 sm:w-36'
  };

  return (
    <Skeleton
      variant="rounded"
      className={cn(sizeStyles[size], className)}
    />
  );
};

/**
 * SkeletonGrid - Grid of skeleton cards
 */
export const SkeletonGrid: React.FC<{
  count?: number;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  className?: string;
  cardProps?: React.ComponentProps<typeof SkeletonCard>;
}> = ({ 
  count = 6, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  className,
  cardProps 
}) => {
  const gridCols = cn(
    'grid gap-3 sm:gap-4 md:gap-6',
    cols.default === 1 && 'grid-cols-1',
    cols.default === 2 && 'grid-cols-2',
    cols.sm === 2 && 'sm:grid-cols-2',
    cols.sm === 3 && 'sm:grid-cols-3',
    cols.md === 3 && 'md:grid-cols-3',
    cols.md === 4 && 'md:grid-cols-4',
    cols.lg === 4 && 'lg:grid-cols-4',
    cols.lg === 5 && 'lg:grid-cols-5',
    cols.lg === 6 && 'lg:grid-cols-6'
  );

  return (
    <div className={cn(gridCols, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} {...cardProps} />
      ))}
    </div>
  );
};

/**
 * SkeletonTable - Table skeleton
 */
export const SkeletonTable: React.FC<{
  rows?: number;
  cols?: number;
  showHeader?: boolean;
  className?: string;
}> = ({ rows = 5, cols = 4, showHeader = true, className }) => {
  return (
    <div className={cn('w-full', className)}>
      {showHeader && (
        <div className="flex gap-4 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          {Array.from({ length: cols }).map((_, index) => (
            <Skeleton
              key={index}
              variant="text"
              className="h-4 sm:h-5 flex-1"
            />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700"
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              className="h-4 flex-1"
              width={colIndex === 0 ? '60%' : '100%'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

/**
 * SkeletonPokemonCard - Pokemon-specific card skeleton
 */
export const SkeletonPokemonCard: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800',
        'border border-gray-200 dark:border-gray-700',
        'rounded-xl p-3 sm:p-4',
        'space-y-3',
        className
      )}
    >
      {/* Pokemon number */}
      <Skeleton variant="text" className="h-4 w-12" />
      
      {/* Pokemon image */}
      <div className="flex justify-center">
        <Skeleton variant="circular" className="w-20 h-20 sm:w-24 sm:h-24" />
      </div>
      
      {/* Pokemon name */}
      <Skeleton variant="text" className="h-5 sm:h-6 w-3/4 mx-auto" />
      
      {/* Type badges */}
      <div className="flex gap-2 justify-center">
        <Skeleton variant="rounded" className="h-6 w-16" />
        <Skeleton variant="rounded" className="h-6 w-16" />
      </div>
    </div>
  );
};

/**
 * CardGridSkeleton - Grid skeleton for card layouts
 * Used by pages that import from SkeletonLoader
 */
export const CardGridSkeleton: React.FC<{
  count?: number;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  className?: string;
  cardProps?: {
    showPrice?: boolean;
    showSet?: boolean;
    showTypes?: boolean;
  };
  // Direct props for backward compatibility
  columns?: number;
  showPrice?: boolean;
  showSet?: boolean;
  showTypes?: boolean;
  showHP?: boolean;
}> = ({
  count = 8,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  className,
  cardProps,
  // Direct props
  columns,
  showPrice,
  showSet,
  showTypes,
  showHP
}) => {
  // Allow columns prop to override cols.default
  const effectiveCols = columns ? { ...cols, default: columns } : cols;

  const gridCols = cn(
    'grid gap-4',
    `grid-cols-${effectiveCols.default || 1}`,
    effectiveCols.sm && `sm:grid-cols-${effectiveCols.sm}`,
    effectiveCols.md && `md:grid-cols-${effectiveCols.md}`,
    effectiveCols.lg && `lg:grid-cols-${effectiveCols.lg}`,
    className
  );

  return (
    <div className={gridCols}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard
          key={i}
          showImage={true}
          showTitle={true}
          showDescription={cardProps?.showSet ?? showSet}
          showActions={cardProps?.showPrice ?? showPrice}
          className="h-full"
        />
      ))}
    </div>
  );
};

// Alias for compatibility with SkeletonLoader imports
export { CardGridSkeleton as SkeletonLoader };

export default Skeleton;