import React from 'react';

// Type definitions
interface SkeletonBaseProps {
  className?: string;
  animate?: boolean;
  variant?: 'rectangular' | 'circular' | 'text' | 'card';
  style?: React.CSSProperties;
}

interface CardSkeletonProps {
  showPrice?: boolean;
}

interface CardGridSkeletonProps {
  count?: number;
  showPrice?: boolean;
}

interface PokemonListGridSkeletonProps {
  count?: number;
}

interface SearchResultsSkeletonProps {
  type?: 'cards' | 'pokemon';
}

interface ChartSkeletonProps {
  height?: number;
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

interface PageSkeletonProps {
  children: React.ReactNode;
  showNav?: boolean;
}

interface SmartSkeletonProps extends SkeletonBaseProps {
  type?: 
    | 'card' 
    | 'card-grid' 
    | 'pokemon-list' 
    | 'card-detail' 
    | 'search-results' 
    | 'stats-card' 
    | 'chart' 
    | 'table' 
    | 'comment';
  count?: number;
  showPrice?: boolean;
  height?: number;
  rows?: number;
  columns?: number;
}

// Base skeleton component with animation
const SkeletonBase: React.FC<SkeletonBaseProps> = ({ 
  className = '', 
  animate = true, 
  variant = 'rectangular',
  style
}) => {
  const baseClasses = animate 
    ? 'animate-pulse bg-gray-200 dark:bg-gray-700' 
    : 'bg-gray-200 dark:bg-gray-700';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
    card: 'rounded-lg'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={style} />
  );
};

// Card skeleton for Pokemon/TCG cards
export const CardSkeleton: React.FC<CardSkeletonProps> = ({ showPrice = true }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    <div className="aspect-[3/4] relative">
      <SkeletonBase className="w-full h-full" variant="rectangular" />
    </div>
    <div className="p-4 space-y-3">
      <SkeletonBase className="h-5 w-3/4" variant="text" />
      <SkeletonBase className="h-4 w-1/2" variant="text" />
      {showPrice && (
        <div className="flex justify-between items-center">
          <SkeletonBase className="h-4 w-16" variant="text" />
          <SkeletonBase className="h-6 w-20" variant="text" />
        </div>
      )}
    </div>
  </div>
);

// Grid of card skeletons
export const CardGridSkeleton: React.FC<CardGridSkeletonProps> = ({ count = 12, showPrice = true }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
    {Array.from({ length: count }, (_, i) => (
      <CardSkeleton key={i} showPrice={showPrice} />
    ))}
  </div>
);

// Pokemon list item skeleton
export const PokemonListSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
    <SkeletonBase className="w-16 h-16" variant="circular" />
    <div className="flex-1 space-y-2">
      <SkeletonBase className="h-5 w-32" variant="text" />
      <SkeletonBase className="h-4 w-24" variant="text" />
      <div className="flex space-x-2">
        <SkeletonBase className="h-6 w-12" variant="rectangular" />
        <SkeletonBase className="h-6 w-12" variant="rectangular" />
      </div>
    </div>
    <SkeletonBase className="w-8 h-8" variant="circular" />
  </div>
);

// List of Pokemon skeletons
export const PokemonListGridSkeleton: React.FC<PokemonListGridSkeletonProps> = ({ count = 8 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }, (_, i) => (
      <PokemonListSkeleton key={i} />
    ))}
  </div>
);

// Card detail skeleton
export const CardDetailSkeleton: React.FC = () => (
  <div className="container mx-auto px-4 py-8 max-w-7xl">
    <div className="mb-4">
      <SkeletonBase className="h-6 w-16" variant="text" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Card image section */}
      <div className="lg:col-span-1">
        <div className="p-4 rounded-xl shadow-lg bg-white dark:bg-gray-800">
          <div className="aspect-[3/4] mb-4">
            <SkeletonBase className="w-full h-full" variant="card" />
          </div>
          <SkeletonBase className="h-10 w-full" variant="rectangular" />
        </div>
      </div>

      {/* Card details section */}
      <div className="lg:col-span-2">
        <div className="p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800">
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
            <SkeletonBase className="h-8 w-64 mb-2" variant="text" />
            <div className="flex items-center space-x-3">
              <SkeletonBase className="h-6 w-6" variant="circular" />
              <SkeletonBase className="h-4 w-32" variant="text" />
              <SkeletonBase className="h-4 w-12" variant="text" />
              <SkeletonBase className="h-6 w-16" variant="rectangular" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <SkeletonBase className="h-6 w-24 mb-4" variant="text" />
              <div className="space-y-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="flex justify-between">
                    <SkeletonBase className="h-4 w-20" variant="text" />
                    <SkeletonBase className="h-4 w-16" variant="text" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SkeletonBase className="h-6 w-28 mb-4" variant="text" />
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="p-2 rounded">
                      <SkeletonBase className="h-3 w-8 mb-1" variant="text" />
                      <SkeletonBase className="h-5 w-12" variant="text" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Search results skeleton
export const SearchResultsSkeleton: React.FC<SearchResultsSkeletonProps> = ({ type = 'cards' }) => (
  <div>
    <div className="mb-6">
      <SkeletonBase className="h-8 w-48 mb-2" variant="text" />
      <SkeletonBase className="h-4 w-32" variant="text" />
    </div>
    
    {type === 'cards' ? (
      <CardGridSkeleton count={8} />
    ) : (
      <PokemonListGridSkeleton count={6} />
    )}
  </div>
);

// Navigation skeleton
export const NavigationSkeleton: React.FC = () => (
  <nav className="bg-white dark:bg-gray-800 shadow-sm">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <SkeletonBase className="h-8 w-32" variant="text" />
        <div className="flex items-center space-x-6">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonBase key={i} className="h-4 w-16" variant="text" />
          ))}
        </div>
        <SkeletonBase className="h-8 w-8" variant="circular" />
      </div>
    </div>
  </nav>
);

// Stats card skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div className="flex items-center justify-between mb-4">
      <SkeletonBase className="h-6 w-24" variant="text" />
      <SkeletonBase className="h-8 w-8" variant="circular" />
    </div>
    <SkeletonBase className="h-8 w-16 mb-2" variant="text" />
    <SkeletonBase className="h-4 w-32" variant="text" />
  </div>
);

// Chart skeleton
export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ height = 300 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <div className="mb-4">
      <SkeletonBase className="h-6 w-32" variant="text" />
    </div>
    <div className="relative" style={{ height: `${height}px` }}>
      <SkeletonBase className="w-full h-full" variant="rectangular" />
      {/* Simulate chart elements */}
      <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
        {Array.from({ length: 7 }, (_, i) => (
          <SkeletonBase 
            key={i} 
            className="w-8 bg-gray-300 dark:bg-gray-600" 
            style={{ height: `${Math.random() * 60 + 20}%` }}
            variant="rectangular"
          />
        ))}
      </div>
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }, (_, i) => (
          <SkeletonBase key={i} className="h-4 w-20" variant="text" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, colIndex) => (
              <SkeletonBase 
                key={colIndex} 
                className="h-4 w-16" 
                variant="text" 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Comment skeleton
export const CommentSkeleton: React.FC = () => (
  <div className="flex space-x-3 p-4">
    <SkeletonBase className="w-10 h-10" variant="circular" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center space-x-2">
        <SkeletonBase className="h-4 w-20" variant="text" />
        <SkeletonBase className="h-3 w-12" variant="text" />
      </div>
      <SkeletonBase className="h-4 w-full" variant="text" />
      <SkeletonBase className="h-4 w-3/4" variant="text" />
      <div className="flex space-x-4">
        <SkeletonBase className="h-3 w-12" variant="text" />
        <SkeletonBase className="h-3 w-12" variant="text" />
      </div>
    </div>
  </div>
);

// Page skeleton wrapper
export const PageSkeleton: React.FC<PageSkeletonProps> = ({ children, showNav = true }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    {showNav && <NavigationSkeleton />}
    <main className="container mx-auto px-4 py-8">
      {children}
    </main>
  </div>
);

// Smart skeleton that chooses appropriate skeleton based on content type
export const SmartSkeleton: React.FC<SmartSkeletonProps> = ({ 
  type, 
  count = 1, 
  showPrice = true, 
  height = 300,
  rows = 5,
  columns = 4,
  className,
  animate,
  variant
}) => {
  switch (type) {
    case 'card':
      return <CardSkeleton showPrice={showPrice} />;
    case 'card-grid':
      return <CardGridSkeleton count={count} showPrice={showPrice} />;
    case 'pokemon-list':
      return <PokemonListGridSkeleton count={count} />;
    case 'card-detail':
      return <CardDetailSkeleton />;
    case 'search-results':
      return <SearchResultsSkeleton />;
    case 'stats-card':
      return <StatsCardSkeleton />;
    case 'chart':
      return <ChartSkeleton height={height} />;
    case 'table':
      return <TableSkeleton rows={rows} columns={columns} />;
    case 'comment':
      return <CommentSkeleton />;
    default:
      return <SkeletonBase className={className} animate={animate} variant={variant} />;
  }
};

export default SmartSkeleton;