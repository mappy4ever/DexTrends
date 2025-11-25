// DetailPageSkeleton - Skeleton loading state for detail pages
// Created for backward compatibility after Phase 8 consolidation

import React from 'react';
import { SkeletonCard, SkeletonText, Skeleton } from './Skeleton';
import { cn } from '@/utils/cn';

interface DetailPageSkeletonProps {
  variant?: 'tcgset' | 'pokemon' | 'default';
  showHeader?: boolean;
  showImage?: boolean;
  showStats?: boolean;
  showTabs?: boolean;
  showRelated?: boolean;
  className?: string;
}

export const DetailPageSkeleton: React.FC<DetailPageSkeletonProps> = ({
  variant = 'default',
  showHeader = true,
  showImage = true,
  showStats = true,
  showTabs = true,
  showRelated = false,
  className
}) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {/* Header skeleton */}
      {showHeader && (
        <div className="p-4 sm:p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Skeleton variant="text" className="h-8 sm:h-10 w-3/4 mb-3" />
              <div className="flex items-center gap-3">
                <Skeleton variant="rounded" className="h-6 w-20" />
                <Skeleton variant="rounded" className="h-6 w-20" />
                <Skeleton variant="text" className="h-4 w-32" />
              </div>
            </div>
            {showImage && (
              <Skeleton variant="rounded" className="w-24 h-24 sm:w-32 sm:h-32" />
            )}
          </div>
        </div>
      )}

      {/* Stats section for TCG sets */}
      {variant === 'tcgset' && showStats && (
        <div className="p-4 sm:p-6 md:p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <Skeleton variant="text" className="h-4 w-16 mx-auto mb-2" />
                <Skeleton variant="text" className="h-6 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs skeleton */}
      {showTabs && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-6 p-4 sm:p-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="text" className="h-5 w-20" />
            ))}
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="p-4 sm:p-6 md:p-8">
        <SkeletonText lines={3} className="mb-6" />
        
        {/* Grid of cards for tcgset */}
        {variant === 'tcgset' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <SkeletonCard key={i} showActions={false} />
            ))}
          </div>
        )}

        {/* Pokemon detail skeleton */}
        {variant === 'pokemon' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <SkeletonText lines={5} />
          </div>
        )}

        {/* Default skeleton */}
        {variant === 'default' && (
          <SkeletonText lines={5} />
        )}
      </div>

      {/* Related items */}
      {showRelated && (
        <div className="p-4 sm:p-6 md:p-8 border-t border-gray-200 dark:border-gray-700">
          <Skeleton variant="text" className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} showDescription={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailPageSkeleton;