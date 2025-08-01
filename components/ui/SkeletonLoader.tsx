import React, { memo } from 'react';
import { motion } from 'framer-motion';

type SkeletonVariant = 'rectangular' | 'circular' | 'text';
type SkeletonAnimation = 'pulse' | 'wave' | 'none';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  style?: React.CSSProperties;
  id?: string;
  'data-testid'?: string;
}

/**
 * Base skeleton loader component with animation
 */
export const Skeleton = memo<SkeletonProps>(({ 
  className = "", 
  height = "1rem", 
  width = "100%",
  variant = "rectangular",
  animation = "pulse",
  style,
  id,
  'data-testid': dataTestId
}) => {
  const baseClasses = "bg-gray-200 dark:bg-gray-700";
  
  const variantClasses: Record<SkeletonVariant, string> = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded"
  };
  
  const animationClasses: Record<SkeletonAnimation, string> = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: ""
  };

  return (
    <motion.div
      className={`
        ${baseClasses}
        ${variantClasses[variant] || variantClasses.rectangular}
        ${animationClasses[animation] || animationClasses.pulse}
        ${className}
      `}
      style={{ height, width, ...style }}
      animate={animation === 'pulse' ? {
        opacity: [0.5, 1, 0.5],
      } : undefined}
      transition={animation === 'pulse' ? {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      } : undefined}
      id={id}
      data-testid={dataTestId}
    />
  );
});

interface CardSkeletonProps {
  className?: string;
  showPrice?: boolean;
  showSet?: boolean;
  showTypes?: boolean;
  showHP?: boolean;
  showRarity?: boolean;
  showArtist?: boolean;
}

/**
 * Card skeleton loader that matches UnifiedCard layout
 */
export const CardSkeleton = memo<CardSkeletonProps>(({ 
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

interface CardGridSkeletonProps extends CardSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4 | 5 | 6 | 8;
  className?: string;
}

/**
 * Card grid skeleton that shows multiple card skeletons
 */
export const CardGridSkeleton = memo<CardGridSkeletonProps>(({ 
  count = 12,
  columns = 6,
  className = "",
  ...cardProps 
}) => {
  const cards = Array.from({ length: count }, (_, i) => i);
  
  const gridClasses: Record<number, string> = {
    2: "grid-cols-2",
    3: "grid-cols-3", 
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
    8: "grid-cols-8"
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24
      }
    }
  };
  
  return (
    <motion.div 
      className={`grid ${gridClasses[columns] || 'grid-cols-6'} gap-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map(i => (
        <motion.div
          key={i}
          variants={itemVariants}
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut" as const
          }}
        >
          <CardSkeleton {...cardProps} />
        </motion.div>
      ))}
    </motion.div>
  );
});

interface SearchSkeletonProps {
  className?: string;
}

/**
 * Search skeleton for search interface
 */
export const SearchSkeleton = memo<SearchSkeletonProps>(({ className = "" }) => {
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

interface ListItemSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  showSecondaryText?: boolean;
}

/**
 * List item skeleton
 */
export const ListItemSkeleton = memo<ListItemSkeletonProps>(({ 
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

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Table skeleton
 */
export const TableSkeleton = memo<TableSkeletonProps>(({ 
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

interface PageSkeletonProps {
  className?: string;
}

/**
 * Page skeleton for full page loading
 */
export const PageSkeleton = memo<PageSkeletonProps>(({ className = "" }) => {
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

interface ChartSkeletonProps {
  height?: string;
  className?: string;
  showLegend?: boolean;
}

/**
 * Chart skeleton
 */
export const ChartSkeleton = memo<ChartSkeletonProps>(({ 
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

interface SmartSkeletonProps {
  type: 
    | 'card' 
    | 'card-grid' 
    | 'pokemon-list' 
    | 'card-detail' 
    | 'search-results' 
    | 'stats-card' 
    | 'chart' 
    | 'table'
    | 'list'
    | 'page';
  count?: number;
  className?: string;
  showPrice?: boolean;
  showTypes?: boolean;
  showHP?: boolean;
  rows?: number;
  columns?: number;
  height?: string;
}

/**
 * Smart skeleton component that automatically selects the appropriate skeleton type
 * Based on the QOL Components design for unified skeleton loading
 */
export const SmartSkeleton = memo<SmartSkeletonProps>(({ 
  type,
  count = 12,
  className = "",
  showPrice = false,
  showTypes = true,
  showHP = false,
  rows = 5,
  columns = 4,
  height = "20rem"
}) => {
  switch (type) {
    case 'card':
      return <CardSkeleton className={className} showPrice={showPrice} showTypes={showTypes} showHP={showHP} />;
    
    case 'card-grid':
    case 'pokemon-list':
      return <CardGridSkeleton count={count} className={className} showPrice={showPrice} showTypes={showTypes} showHP={showHP} />;
    
    case 'card-detail':
      return <CardSkeleton className={className} showPrice={true} showTypes={true} showHP={true} showRarity={true} showArtist={true} />;
    
    case 'search-results':
      return <SearchSkeleton className={className} />;
    
    case 'stats-card':
      return <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3 ${className}`}>
        <Skeleton height="1.5rem" width="70%" />
        <Skeleton height="3rem" />
        <div className="flex justify-between">
          <Skeleton height="1rem" width="30%" />
          <Skeleton height="1rem" width="40%" />
        </div>
      </div>;
    
    case 'chart':
      return <ChartSkeleton height={height} className={className} />;
    
    case 'table':
      return <TableSkeleton rows={rows} columns={columns} className={className} />;
    
    case 'list':
      return <div className={className}>
        {Array.from({ length: count }, (_, i) => (
          <ListItemSkeleton key={i} showSecondaryText={true} />
        ))}
      </div>;
    
    case 'page':
      return <PageSkeleton className={className} />;
    
    default:
      return <Skeleton className={className} />;
  }
});

SmartSkeleton.displayName = 'SmartSkeleton';

export default Skeleton;