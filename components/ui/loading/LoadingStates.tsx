import React from 'react';

// Professional Loading Spinner Component
export function LoadingSpinner({ size = 'md', color = 'pokemon-red', className = '' }) {
  const sizeClass = {
    sm: 'loading-spinner-sm',
    md: 'loading-spinner',
    lg: 'loading-spinner-lg'
  }[size] || 'loading-spinner';

  const colorStyles: Record<string, any> = {
    'pokemon-red': { borderColor: 'var(--light-grey)', borderTopColor: 'var(--pokemon-red)' },
    'pokemon-blue': { borderColor: 'var(--light-grey)', borderTopColor: 'var(--pokemon-blue)' },
    'white': { borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }
  };

  return (
    <div 
      className={`${sizeClass} ${className}`}
      style={colorStyles[color] || colorStyles['pokemon-red']}
    />
  );
}

// Loading Dots Component
export function LoadingDots({ className = '' }) {
  return (
    <div className={`loading-dots ${className}`}>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

// Progress Bar Component
export function LoadingProgress({ progress, indeterminate = false, className = '' }: { progress?: number; indeterminate?: boolean; className?: string }) {
  if (indeterminate) {
    return (
      <div className={`loading-progress ${className}`}>
        <div className="loading-progress-indeterminate h-full"></div>
      </div>
    );
  }

  return (
    <div className={`loading-progress ${className}`}>
      <div 
        className="loading-progress-bar" 
        style={{ width: `${Math.min(100, Math.max(0, progress || 0))}%` }}
      ></div>
    </div>
  );
}

// Card Skeleton Loader
export function CardSkeleton({ className = '' }) {
  return (
    <div className={`bg-white border border-border-color rounded-lg p-4 ${className}`}>
      <div className="text-center space-y-3">
        <div className="loading-skeleton-circle w-20 h-20 mx-auto"></div>
        <div className="loading-skeleton-text w-12 mx-auto"></div>
        <div className="loading-skeleton-text w-24 mx-auto"></div>
        <div className="flex justify-center gap-1">
          <div className="loading-skeleton w-12 h-6 rounded-full"></div>
          <div className="loading-skeleton w-12 h-6 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

// Full Page Loading Component
export function PageLoader({ 
  title = "Loading...", 
  description = "Please wait while we gather the data.",
  progress,
  showProgress = false 
}: {
  title?: string;
  description?: string;
  progress?: number;
  showProgress?: boolean;
}) {
  return (
    <div className="container max-w-6xl mx-auto py-12 text-center min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto p-6 bg-white border border-border-color rounded-lg shadow-sm">
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pokemon-red flex items-center justify-center">
              <LoadingSpinner size="lg" color="white" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-dark-text">
              {title}
            </h3>
            <p className="text-text-grey">
              {description}
            </p>
          </div>
          
          {showProgress && typeof progress === 'number' && (
            <>
              <LoadingProgress progress={progress} />
              <div className="text-center">
                <span className="inline-block bg-light-grey text-dark-text text-xs px-2 py-1 rounded">
                  {Math.round(progress)}% Complete
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline Loading Component
export function InlineLoader({ text = "Loading...", size = 'sm' }) {
  return (
    <div className="flex items-center gap-2 text-text-grey">
      <LoadingSpinner size={size} />
      <span>{text}</span>
    </div>
  );
}

// Grid Loading Skeletons
export function GridSkeleton({ count = 12, className = '' }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export default {
  LoadingSpinner,
  LoadingDots,
  LoadingProgress,
  CardSkeleton,
  PageLoader,
  InlineLoader,
  GridSkeleton
};