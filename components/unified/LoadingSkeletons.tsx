import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  animate?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  variant?: 'default' | 'shimmer' | 'pulse';
}

/**
 * Base Skeleton Component
 */
export function Skeleton({ 
  className, 
  animate = true,
  rounded = 'md',
  variant = 'pulse'
}: SkeletonProps) {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full'
  };

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        roundedClasses[rounded],
        animate && variant === 'pulse' && 'animate-pulse',
        animate && variant === 'shimmer' && 'skeleton-shimmer',
        className
      )}
    />
  );
}

/**
 * Card Skeleton for grid items
 */
export function CardSkeleton({ 
  showImage = true,
  lines = 3 
}: { 
  showImage?: boolean; 
  lines?: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      {showImage && (
        <Skeleton className="w-full h-48 mb-4" rounded="lg" />
      )}
      <Skeleton className="h-6 w-3/4 mb-2" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            'h-4 mb-2',
            i === lines - 1 ? 'w-1/2' : 'w-full'
          )} 
        />
      ))}
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-8 w-20" rounded="full" />
        <Skeleton className="h-8 w-20" rounded="full" />
      </div>
    </div>
  );
}

/**
 * Pokemon Card Skeleton
 */
export function PokemonCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
      
      {/* Content */}
      <div className="relative p-4">
        {/* Number */}
        <Skeleton className="h-4 w-12 mb-2" />
        
        {/* Pokemon image area */}
        <div className="flex justify-center my-4">
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>
        
        {/* Name */}
        <Skeleton className="h-6 w-3/4 mx-auto mb-3" />
        
        {/* Types */}
        <div className="flex gap-2 justify-center">
          <Skeleton className="h-6 w-16" rounded="full" />
          <Skeleton className="h-6 w-16" rounded="full" />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-gray-200 dark:border-gray-700">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Data Table Skeleton
 */
export function DataTableSkeleton({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}: { 
  rows?: number; 
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full">
        {showHeader && (
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Grid Skeleton
 */
export function GridSkeleton({ 
  items = 12,
  columns = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
    wide: 6
  }
}: { 
  items?: number;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
}) {
  return (
    <div 
      className={cn(
        'grid gap-4',
        `grid-cols-${columns.mobile || 2}`,
        `sm:grid-cols-${columns.tablet || 3}`,
        `lg:grid-cols-${columns.desktop || 4}`,
        `2xl:grid-cols-${columns.wide || 6}`
      )}
    >
      {Array.from({ length: items }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Page Header Skeleton
 */
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" rounded="full" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 w-24" rounded="lg" />
        <Skeleton className="h-10 w-24" rounded="lg" />
      </div>
    </div>
  );
}

/**
 * List Item Skeleton
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
      <Skeleton className="w-12 h-12 flex-shrink-0" rounded="full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-8 w-20" rounded="full" />
    </div>
  );
}

/**
 * Stats Card Skeleton
 */
export function StatsCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-5" rounded="full" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-20" />
    </div>
  );
}

/**
 * Form Skeleton
 */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-full" rounded="lg" />
        </div>
      ))}
      <div className="flex gap-3 mt-6">
        <Skeleton className="h-10 w-32" rounded="lg" />
        <Skeleton className="h-10 w-32" rounded="lg" />
      </div>
    </div>
  );
}

/**
 * Navigation Skeleton
 */
export function NavigationSkeleton() {
  return (
    <nav className="flex items-center gap-4 p-4">
      <Skeleton className="h-10 w-10" rounded="full" />
      <div className="flex gap-2 flex-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" rounded="lg" />
        ))}
      </div>
      <Skeleton className="h-10 w-10" rounded="full" />
    </nav>
  );
}

/**
 * Content Skeleton - Full page placeholder
 */
export function ContentSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
        <DataTableSkeleton rows={10} />
      </div>
    </div>
  );
}

// Add shimmer animation CSS
if (typeof window !== 'undefined' && !document.getElementById('skeleton-shimmer-style')) {
  const style = document.createElement('style');
  style.id = 'skeleton-shimmer-style';
  style.textContent = `
    @keyframes skeleton-shimmer {
      0% {
        background-position: -200% 0;
      }
      100% {
        background-position: 200% 0;
      }
    }
    
    .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        rgba(156, 163, 175, 0.2) 0%,
        rgba(156, 163, 175, 0.4) 50%,
        rgba(156, 163, 175, 0.2) 100%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.5s ease-in-out infinite;
    }
    
    .dark .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        rgba(75, 85, 99, 0.3) 0%,
        rgba(75, 85, 99, 0.5) 50%,
        rgba(75, 85, 99, 0.3) 100%
      );
    }
  `;
  document.head.appendChild(style);
}