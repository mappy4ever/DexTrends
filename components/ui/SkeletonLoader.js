import React, { memo } from 'react';

/**
 * Base skeleton loader component with animation
 */
export const Skeleton = memo(({ 
  className = "", 
  height = "1rem", 
  width = "100%",
  variant = "rectangular",
  animation = "pulse",
  ...props 
}) => {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";
  
  const variantClasses = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded"
  };
  
  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: ""
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant] || variantClasses.rectangular}
        ${animationClasses[animation] || animationClasses.pulse}
        ${className}
      `}
      style={{ height, width }}
      {...props}
    />
  );
});

/**
 * Card skeleton loader that matches UnifiedCard layout
 */
export const CardSkeleton = memo(({ 
  className = "",
  showPrice = false,
  showSet = true,
  showTypes = true,
  showHP = false,
  showRarity = false,
  showArtist = false
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm ${className}`}>
      {/* Card Image Skeleton */}
      <Skeleton height="280px" className="w-full" />
      
      {/* Card Info */}
      <div className="p-3 space-y-2">
        {/* Card Name */}
        <Skeleton height="1.25rem" width="80%" className="mx-auto" />
        
        {/* Set and Number Info */}
        <div className="text-center space-y-1">
          {showSet && <Skeleton height="0.75rem" width="60%" className="mx-auto" />}
          <Skeleton height="0.75rem" width="40%" className="mx-auto" />
        </div>
        
        {/* Types */}
        {showTypes && (
          <div className="flex justify-center gap-1">
            <Skeleton height="1.5rem" width="3rem" className="rounded-full" />
            <Skeleton height="1.5rem" width="3rem" className="rounded-full" />
          </div>
        )}
        
        {/* Additional Info Row */}
        <div className="flex items-center justify-center gap-2">
          {showHP && <Skeleton height="1.5rem" width="3rem" className="rounded-full" />}
          {showRarity && <Skeleton height="1.5rem" width="2rem" className="rounded-full" />}
          {showPrice && <Skeleton height="1.5rem" width="4rem" className="rounded-full" />}
        </div>
        
        {/* Artist */}
        {showArtist && <Skeleton height="0.75rem" width="70%" className="mx-auto" />}
      </div>
    </div>
  );
});

/**
 * Card grid skeleton that shows multiple card skeletons
 */
export const CardGridSkeleton = memo(({ 
  count = 12,
  columns = 6,
  className = "",
  ...cardProps 
}) => {
  const cards = Array.from({ length: count }, (_, i) => i);
  
  const gridClasses = {
    2: "grid-cols-2",
    3: "grid-cols-3", 
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    8: "grid-cols-8"
  };
  
  return (
    <div className={`grid ${gridClasses[columns] || 'grid-cols-6'} gap-4 ${className}`}>
      {cards.map(i => (
        <CardSkeleton key={i} {...cardProps} />
      ))}
    </div>
  );
});

/**
 * Search skeleton for search interface
 */
export const SearchSkeleton = memo(({ className = "" }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <Skeleton height="3rem" className="rounded-lg" />
      <div className="grid grid-cols-4 gap-2">
        <Skeleton height="2rem" className="rounded-full" />
        <Skeleton height="2rem" className="rounded-full" />
        <Skeleton height="2rem" className="rounded-full" />
        <Skeleton height="2rem" className="rounded-full" />
      </div>
    </div>
  );
});

/**
 * List item skeleton
 */
export const ListItemSkeleton = memo(({ 
  className = "",
  showAvatar = false,
  showSecondaryText = true
}) => {
  return (
    <div className={`flex items-center space-x-3 p-3 ${className}`}>
      {showAvatar && (
        <Skeleton 
          variant="circular"
          height="2.5rem"
          width="2.5rem"
        />
      )}
      <div className="flex-1 space-y-1">
        <Skeleton height="1rem" width="70%" />
        {showSecondaryText && (
          <Skeleton height="0.75rem" width="50%" />
        )}
      </div>
    </div>
  );
});

/**
 * Table skeleton
 */
export const TableSkeleton = memo(({ 
  rows = 5,
  columns = 4,
  className = ""
}) => {
  const tableRows = Array.from({ length: rows }, (_, i) => i);
  const tableCols = Array.from({ length: columns }, (_, i) => i);
  
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {tableCols.map(i => (
          <Skeleton key={`header-${i}`} height="1.5rem" width="80%" />
        ))}
      </div>
      
      {/* Rows */}
      {tableRows.map(rowIndex => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {tableCols.map(colIndex => (
            <Skeleton key={`${rowIndex}-${colIndex}`} height="1rem" width="90%" />
          ))}
        </div>
      ))}
    </div>
  );
});

/**
 * Page skeleton for full page loading
 */
export const PageSkeleton = memo(({ className = "" }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-3">
        <Skeleton height="2.5rem" width="40%" />
        <Skeleton height="1rem" width="60%" />
      </div>
      
      {/* Navigation */}
      <div className="flex space-x-4">
        <Skeleton height="2.5rem" width="6rem" className="rounded-full" />
        <Skeleton height="2.5rem" width="6rem" className="rounded-full" />
        <Skeleton height="2.5rem" width="6rem" className="rounded-full" />
      </div>
      
      {/* Content */}
      <CardGridSkeleton count={12} />
    </div>
  );
});

/**
 * Chart skeleton
 */
export const ChartSkeleton = memo(({ 
  height = "20rem",
  className = "",
  showLegend = true
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {showLegend && (
        <div className="flex space-x-4">
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" height="0.75rem" width="0.75rem" />
            <Skeleton height="0.75rem" width="3rem" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton variant="circular" height="0.75rem" width="0.75rem" />
            <Skeleton height="0.75rem" width="3rem" />
          </div>
        </div>
      )}
      <Skeleton height={height} className="rounded-lg" />
    </div>
  );
});

Skeleton.displayName = 'Skeleton';
CardSkeleton.displayName = 'CardSkeleton';
CardGridSkeleton.displayName = 'CardGridSkeleton';
SearchSkeleton.displayName = 'SearchSkeleton';
ListItemSkeleton.displayName = 'ListItemSkeleton';
TableSkeleton.displayName = 'TableSkeleton';
PageSkeleton.displayName = 'PageSkeleton';
ChartSkeleton.displayName = 'ChartSkeleton';

export default Skeleton;