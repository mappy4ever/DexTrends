import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

/**
 * Comprehensive Skeleton Loading System
 * Provides smooth loading states for all components and data
 */

// Skeleton Context for global loading states
const SkeletonContext = createContext();

export const useSkeleton = () => {
  const context = useContext(SkeletonContext);
  if (!context) {
    throw new Error('useSkeleton must be used within SkeletonProvider');
  }
  return context;
};

// Skeleton Provider Component
export const SkeletonProvider = ({ children }) => {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState(new Map());
  
  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      if (isLoading) {
        newMap.set(key, true);
      } else {
        newMap.delete(key);
      }
      return newMap;
    });
  }, []);
  
  const isLoading = useCallback((key) => {
    return loadingStates.has(key);
  }, [loadingStates]);
  
  const setGlobalLoadingState = useCallback((loading) => {
    setGlobalLoading(loading);
  }, []);
  
  const contextValue = {
    globalLoading,
    setLoading,
    isLoading,
    setGlobalLoadingState
  };
  
  return (
    <SkeletonContext.Provider value={contextValue}>
      {children}
    </SkeletonContext.Provider>
  );
};

// Base Skeleton Component
export const Skeleton = ({
  width = '100%',
  height = '1rem',
  variant = 'rectangular',
  animation = 'pulse',
  className = '',
  style = {},
  children,
  loading = true,
  delay = 0,
  ...props
}) => {
  const [showSkeleton, setShowSkeleton] = useState(delay === 0 ? loading : false);
  
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShowSkeleton(loading);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(loading);
    }
  }, [loading, delay]);
  
  if (!showSkeleton) {
    return children || null;
  }
  
  const getVariantClasses = () => {
    const variants = {
      rectangular: 'rounded',
      circular: 'rounded-full',
      rounded: 'rounded-lg',
      text: 'rounded-sm'
    };
    return variants[variant] || variants.rectangular;
  };
  
  const getAnimationClasses = () => {
    const animations = {
      pulse: 'animate-pulse',
      wave: 'animate-wave',
      shimmer: 'animate-shimmer',
      none: ''
    };
    return animations[animation] || animations.pulse;
  };
  
  const skeletonStyle = {
    width,
    height,
    ...style
  };
  
  return (
    <div
      className={`
        skeleton
        bg-gray-200
        dark:bg-gray-700
        ${getVariantClasses()}
        ${getAnimationClasses()}
        ${className}
      `}
      style={skeletonStyle}
      {...props}
    />
  );
};

// Card Skeleton Component
export const CardSkeleton = ({
  showImage = true,
  showTitle = true,
  showSubtitle = true,
  showContent = true,
  showActions = true,
  imageHeight = '12rem',
  lines = 3,
  className = '',
  ...props
}) => {
  return (
    <div className={`card-skeleton bg-white rounded-lg p-4 border border-gray-200 ${className}`} {...props}>
      {/* Image Skeleton */}
      {showImage && (
        <Skeleton
          height={imageHeight}
          variant="rounded"
          className="mb-4" />
      )}
      
      {/* Title Skeleton */}
      {showTitle && (
        <Skeleton
          height="1.5rem"
          width="75%"
          variant="text"
          className="mb-2" />
      )}
      
      {/* Subtitle Skeleton */}
      {showSubtitle && (
        <Skeleton
          height="1rem"
          width="50%"
          variant="text"
          className="mb-3" />
      )}
      
      {/* Content Skeleton */}
      {showContent && (
        <div className="space-y-2 mb-4">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              height="0.875rem"
              width={index === lines - 1 ? '60%' : '100%'}
              variant="text"
            />
          ))}
        </div>
      )}
      
      {/* Actions Skeleton */}
      {showActions && (
        <div className="flex gap-2">
          <Skeleton
            height="2.5rem"
            width="5rem"
            variant="rounded"
          />
          <Skeleton
            height="2.5rem"
            width="5rem"
            variant="rounded"
          />
        </div>
      )}
    </div>
  );
};

// Pokemon Card Skeleton
export const PokemonCardSkeleton = ({
  variant = 'standard',
  showStats = true,
  showType = true,
  className = '',
  ...props
}) => {
  if (variant === 'grid') {
    return (
      <div className={`pokemon-card-skeleton bg-white rounded-lg p-3 border border-gray-200 ${className}`} {...props}>
        {/* Card Image */}
        <Skeleton
          height="200px"
          variant="rounded"
          className="mb-3 aspect-[3/4]" />
        
        {/* Name */}
        <Skeleton
          height="1.25rem"
          width="80%"
          variant="text"
          className="mb-2 mx-auto" />
        
        {/* Type Badges */}
        {showType && (
          <div className="flex justify-center gap-1 mb-2">
            <Skeleton
              height="1.5rem"
              width="3rem"
              variant="rounded"
            />
            <Skeleton
              height="1.5rem"
              width="3rem"
              variant="rounded"
            />
          </div>
        )}
        
        {/* Price/Stats */}
        {showStats && (
          <div className="flex justify-between items-center">
            <Skeleton
              height="1rem"
              width="3rem"
              variant="text"
            />
            <Skeleton
              height="1rem"
              width="4rem"
              variant="text"
            />
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`pokemon-card-skeleton bg-white rounded-lg p-4 border border-gray-200 ${className}`} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton
          height="1.5rem"
          width="60%"
          variant="text"
        />
        <Skeleton
          height="1.5rem"
          width="2rem"
          variant="circular"
        />
      </div>
      
      {/* Main Image */}
      <Skeleton
        height="280px"
        variant="rounded"
        className="mb-4" />
      
      {/* Stats Grid */}
      {showStats && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="text-center">
              <Skeleton
                height="0.875rem"
                width="4rem"
                variant="text"
                className="mb-1 mx-auto" />
              <Skeleton
                height="1.25rem"
                width="3rem"
                variant="text"
                className="mx-auto" />
            </div>
          ))}
        </div>
      )}
      
      {/* Description */}
      <div className="space-y-2">
        <Skeleton height="0.875rem" width="100%" variant="text" />
        <Skeleton height="0.875rem" width="85%" variant="text" />
        <Skeleton height="0.875rem" width="70%" variant="text" />
      </div>
    </div>
  );
};

// List Skeleton Component
export const ListSkeleton = ({
  items = 5,
  showAvatar = true,
  showSecondaryText = true,
  showAction = true,
  avatarSize = '3rem',
  className = '',
  ...props
}) => {
  return (
    <div className={`list-skeleton ${className}`} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center p-4 border-b border-gray-200 last:border-b-0">
          {/* Avatar */}
          {showAvatar && (
            <Skeleton
              width={avatarSize}
              height={avatarSize}
              variant="circular"
              className="mr-4 flex-shrink-0" />
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <Skeleton
              height="1.25rem"
              width="60%"
              variant="text"
              className="mb-1" />
            {showSecondaryText && (
              <Skeleton
                height="1rem"
                width="40%"
                variant="text"
              />
            )}
          </div>
          
          {/* Action */}
          {showAction && (
            <Skeleton
              width="2rem"
              height="2rem"
              variant="circular"
              className="ml-4 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
};

// Table Skeleton Component
export const TableSkeleton = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
  ...props
}) => {
  return (
    <div className={`table-skeleton w-full ${className}`} {...props}>
      {/* Header */}
      {showHeader && (
        <div className="flex border-b border-gray-200 pb-2 mb-4">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="flex-1 px-2">
              <Skeleton
                height="1.25rem"
                width="80%"
                variant="text"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 px-2">
                <Skeleton
                  height="1rem"
                  width={colIndex === 0 ? '90%' : `${60 + Math.random() * 30}%`}
                  variant="text"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Graph/Chart Skeleton Component
export const ChartSkeleton = ({
  type = 'line',
  height = '300px',
  showLegend = true,
  showAxes = true,
  className = '',
  ...props
}) => {
  return (
    <div className={`chart-skeleton ${className}`} style={{ height }} {...props}>
      {/* Chart Area */}
      <div className="relative w-full h-full bg-gray-50 rounded-lg p-4">
        {/* Y-Axis */}
        {showAxes && (
          <div className="absolute left-0 top-4 bottom-8 w-8 flex flex-col justify-between">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton
                key={index}
                height="0.75rem"
                width="1.5rem"
                variant="text"
                className="ml-auto" />
            ))}
          </div>
        )}
        
        {/* Chart Content */}
        <div className="ml-8 mr-4 h-full flex items-end justify-between">
          {type === 'bar' ? (
            // Bar Chart
            (Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={index}
                width="2rem"
                height={`${20 + Math.random() * 60}%`}
                variant="rectangular"
                className="mx-1" />
            )))
          ) : (
            // Line Chart
            (<div className="w-full h-full relative">
              <svg className="w-full h-full">
                <defs>
                  <linearGradient id="skeleton-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" className="animate-pulse" stopColor="#e5e7eb" />
                    <stop offset="50%" className="animate-pulse" stopColor="#d1d5db" />
                    <stop offset="100%" className="animate-pulse" stopColor="#e5e7eb" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 80 Q 50 60 100 70 T 200 65 T 300 75 T 400 60"
                  stroke="url(#skeleton-gradient)"
                  strokeWidth="3"
                  fill="none"
                  className="animate-pulse" />
                <path
                  d="M 0 60 Q 50 40 100 50 T 200 45 T 300 55 T 400 40"
                  stroke="url(#skeleton-gradient)"
                  strokeWidth="3"
                  fill="none"
                  className="animate-pulse" />
              </svg>
            </div>)
          )}
        </div>
        
        {/* X-Axis */}
        {showAxes && (
          <div className="absolute bottom-0 left-8 right-4 h-8 flex justify-between items-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                height="0.75rem"
                width="2rem"
                variant="text"
              />
            ))}
          </div>
        )}
      </div>
      {/* Legend */}
      {showLegend && (
        <div className="flex justify-center gap-6 mt-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Skeleton
                width="1rem"
                height="1rem"
                variant="rectangular"
              />
              <Skeleton
                height="0.875rem"
                width="4rem"
                variant="text"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Form Skeleton Component
export const FormSkeleton = ({
  fields = 4,
  showSubmitButton = true,
  showTitle = true,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-skeleton ${className}`} {...props}>
      {/* Title */}
      {showTitle && (
        <Skeleton
          height="2rem"
          width="60%"
          variant="text"
          className="mb-6" />
      )}
      
      {/* Form Fields */}
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index}>
            {/* Label */}
            <Skeleton
              height="1rem"
              width="25%"
              variant="text"
              className="mb-2" />
            
            {/* Input Field */}
            <Skeleton
              height="2.5rem"
              width="100%"
              variant="rounded"
            />
          </div>
        ))}
      </div>
      
      {/* Submit Button */}
      {showSubmitButton && (
        <Skeleton
          height="2.5rem"
          width="8rem"
          variant="rounded"
          className="mt-6" />
      )}
    </div>
  );
};

// Navigation Skeleton Component
export const NavigationSkeleton = ({
  variant = 'horizontal',
  items = 5,
  showLogo = true,
  showUserArea = true,
  className = '',
  ...props
}) => {
  if (variant === 'sidebar') {
    return (
      <div className={`navigation-skeleton w-64 h-full bg-white border-r border-gray-200 p-4 ${className}`} {...props}>
        {/* Logo */}
        {showLogo && (
          <Skeleton
            height="2rem"
            width="60%"
            variant="rounded"
            className="mb-8" />
        )}
        
        {/* Navigation Items */}
        <div className="space-y-3">
          {Array.from({ length: items }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton
                width="1.5rem"
                height="1.5rem"
                variant="rectangular"
              />
              <Skeleton
                height="1rem"
                width="70%"
                variant="text"
              />
            </div>
          ))}
        </div>
        
        {/* User Area */}
        {showUserArea && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3">
              <Skeleton
                width="2.5rem"
                height="2.5rem"
                variant="circular"
              />
              <div className="flex-1">
                <Skeleton
                  height="1rem"
                  width="80%"
                  variant="text"
                  className="mb-1" />
                <Skeleton
                  height="0.75rem"
                  width="60%"
                  variant="text"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={`navigation-skeleton flex items-center justify-between p-4 bg-white border-b border-gray-200 ${className}`} {...props}>
      {/* Logo */}
      {showLogo && (
        <Skeleton
          height="2rem"
          width="8rem"
          variant="rounded"
        />
      )}
      
      {/* Navigation Items */}
      <div className="flex items-center gap-6">
        {Array.from({ length: items }).map((_, index) => (
          <Skeleton
            key={index}
            height="1rem"
            width="4rem"
            variant="text"
          />
        ))}
      </div>
      
      {/* User Area */}
      {showUserArea && (
        <div className="flex items-center gap-3">
          <Skeleton
            width="2rem"
            height="2rem"
            variant="circular"
          />
          <Skeleton
            height="1rem"
            width="5rem"
            variant="text"
          />
        </div>
      )}
    </div>
  );
};

// Custom Hook for Skeleton Loading State
export const useSkeletonState = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  
  const withSkeleton = useCallback((asyncFunction) => {
    return async (...args) => {
      setLoading(true);
      try {
        return await asyncFunction(...args);
      } finally {
        setLoading(false);
      }
    };
  }, []);
  
  return {
    loading,
    setLoading,
    withSkeleton
  };
};

// Skeleton Wrapper Component
export const SkeletonWrapper = ({
  loading,
  skeleton,
  children,
  delay = 0,
  fallback,
  className = '',
  ...props
}) => {
  const [showSkeleton, setShowSkeleton] = useState(delay === 0 ? loading : false);
  
  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShowSkeleton(loading);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      setShowSkeleton(loading);
    }
  }, [loading, delay]);
  
  if (showSkeleton) {
    return (
      <div className={`skeleton-wrapper ${className}`} {...props}>
        {skeleton || fallback || <Skeleton />}
      </div>
    );
  }
  
  return children;
};

// Add keyframes for custom animations
export const SkeletonStyles = `
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  @keyframes wave {
    0%, 100% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(100%);
    }
  }
  
  .animate-shimmer {
    background: linear-gradient(
      90deg,
      #f0f0f0 25%,
      #e0e0e0 50%,
      #f0f0f0 75%
    );
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
  
  .animate-wave {
    position: relative;
    overflow: hidden;
  }
  
  .animate-wave::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
    );
    animation: wave 2s infinite;
  }
  
  /* Dark mode skeleton styles */
  .dark .skeleton {
    background: #374151;
  }
  
  .dark .animate-shimmer {
    background: linear-gradient(
      90deg,
      #374151 25%,
      #4b5563 50%,
      #374151 75%
    );
  }
`;

export default {
  SkeletonProvider,
  Skeleton,
  CardSkeleton,
  PokemonCardSkeleton,
  ListSkeleton,
  TableSkeleton,
  ChartSkeleton,
  FormSkeleton,
  NavigationSkeleton,
  SkeletonWrapper,
  useSkeletonState,
  useSkeleton,
  SkeletonStyles
};