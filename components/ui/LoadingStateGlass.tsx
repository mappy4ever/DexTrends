// LoadingStateGlass - Glass-styled loading state component
// Created for backward compatibility after Phase 8 consolidation

import React from 'react';
import { SkeletonGrid, SkeletonCard, SkeletonTable } from './Skeleton';
import { cn } from '@/utils/cn';

interface LoadingStateGlassProps {
  type?: 'skeleton' | 'spinner' | 'dots' | 'cards';
  rows?: number;
  columns?: number;
  message?: string;
  className?: string;
}

export const LoadingStateGlass: React.FC<LoadingStateGlassProps> = ({
  type = 'skeleton',
  rows = 3,
  columns = 4,
  message = 'Loading...',
  className
}) => {
  // Glass morphism style for background
  const glassStyle = 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 shadow-xl';

  if (type === 'spinner') {
    return (
      <div className={cn(glassStyle, 'rounded-2xl p-8 text-center', className)}>
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4" />
        {message && <p className="text-gray-600 dark:text-gray-400">{message}</p>}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={cn(glassStyle, 'rounded-2xl p-8 text-center', className)}>
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        {message && <p className="text-gray-600 dark:text-gray-400">{message}</p>}
      </div>
    );
  }

  if (type === 'cards') {
    return (
      <div className={cn(glassStyle, 'rounded-2xl p-4 sm:p-6', className)}>
        <SkeletonGrid
          count={rows * columns}
          cols={{
            default: 1,
            sm: 2,
            md: columns > 2 ? 3 : 2,
            lg: columns
          }}
        />
      </div>
    );
  }

  // Default skeleton type - grid layout
  return (
    <div className={cn(glassStyle, 'rounded-2xl p-4 sm:p-6', className)}>
      {columns > 1 ? (
        <SkeletonGrid
          count={rows * columns}
          cols={{
            default: 1,
            sm: Math.min(2, columns),
            md: Math.min(3, columns),
            lg: columns
          }}
        />
      ) : (
        <SkeletonTable rows={rows} cols={4} />
      )}
    </div>
  );
};

export default LoadingStateGlass;