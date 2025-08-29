import React from 'react';
import { cn } from '@/utils/cn';
import DexTrendsLogo from './DexTrendsLogo';

interface DexTrendsLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export const DexTrendsLoading: React.FC<DexTrendsLoadingProps> = ({
  message = 'Loading...',
  size = 'md',
  fullScreen = false,
  className
}) => {
  const sizeConfig = {
    sm: {
      logoSize: 'xs' as const,
      spinnerSize: 'w-8 h-8',
      textSize: 'text-sm'
    },
    md: {
      logoSize: 'sm' as const,
      spinnerSize: 'w-12 h-12',
      textSize: 'text-base'
    },
    lg: {
      logoSize: 'md' as const,
      spinnerSize: 'w-16 h-16',
      textSize: 'text-lg'
    }
  };

  const config = sizeConfig[size];

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center',
      fullScreen && 'min-h-screen',
      !fullScreen && 'py-12',
      className
    )}>
      {/* Logo with pulsing animation */}
      <div className="relative mb-6">
        <div className="absolute inset-0 blur-2xl opacity-30">
          <div className="h-full w-full bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 rounded-full animate-pulse" />
        </div>
        <div className="relative animate-pulse">
          <DexTrendsLogo 
            variant="vertical" 
            size={config.logoSize}
            className="opacity-90"
          />
        </div>
      </div>

      {/* Spinning loader */}
      <div className={cn(
        config.spinnerSize,
        'border-4 border-gray-200 dark:border-gray-700 border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin mb-4'
      )} />

      {/* Loading message */}
      <p className={cn(
        config.textSize,
        'text-gray-600 dark:text-gray-400 font-medium animate-pulse'
      )}>
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loader with logo placeholder
export const DexTrendsSkeleton: React.FC<{
  className?: string;
  rows?: number;
}> = ({ className, rows = 3 }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Logo placeholder */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      </div>
      
      {/* Content skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
        </div>
      ))}
    </div>
  );
};

// Inline loading indicator with small logo
export const DexTrendsSpinner: React.FC<{
  className?: string;
}> = ({ className }) => {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <DexTrendsLogo variant="horizontal" size="xs" className="opacity-50" />
      <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );
};

export default DexTrendsLoading;