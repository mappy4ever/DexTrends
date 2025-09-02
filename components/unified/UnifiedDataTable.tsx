import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useWindowVirtualScroll } from '@/hooks/useVirtualScroll';
import hapticFeedback from '@/utils/hapticFeedback';
import logger from '@/utils/logger';
import { useViewport } from '@/hooks/useViewport';

/**
 * UnifiedDataTable - Production-ready responsive data table
 * 
 * Features:
 * - Automatic responsive layout (cards on mobile, table on desktop)
 * - Virtual scrolling for performance
 * - Sorting, filtering, and search
 * - Expandable rows for details
 * - Touch-optimized interactions
 * - No duplicate code or conditional rendering
 */

export interface Column<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  sortable?: boolean;
  renderCell?: (item: T) => React.ReactNode;
  mobileLabel?: string; // Shorter label for mobile
  priority?: 'primary' | 'secondary' | 'detail'; // Display priority
  align?: 'left' | 'center' | 'right';
}

export interface UnifiedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getItemKey: (item: T) => string | number;
  onItemClick?: (item: T) => void;
  loading?: boolean;
  
  // Search and filter
  searchable?: boolean;
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  
  // Sorting
  defaultSort?: keyof T | string;
  defaultSortDirection?: 'asc' | 'desc';
  
  // Expansion
  expandable?: boolean;
  renderExpanded?: (item: T) => React.ReactNode;
  
  // Virtualization
  virtualize?: boolean;
  itemHeight?: number;
  overscan?: number;
  
  // Styling
  className?: string;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
  
  // Mobile customization
  renderMobileCard?: (item: T, columns: Column<T>[]) => React.ReactNode;
  mobileCardHeight?: number;
}

// Responsive breakpoints
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export function UnifiedDataTable<T extends Record<string, any>>({
  data,
  columns,
  getItemKey,
  onItemClick,
  loading = false,
  searchable = false,
  searchKeys = [],
  searchPlaceholder = 'Search...',
  defaultSort,
  defaultSortDirection = 'asc',
  expandable = false,
  renderExpanded,
  virtualize = true,
  itemHeight = 80,
  overscan = 3,
  className = '',
  striped = true,
  hover = true,
  compact = false,
  renderMobileCard,
  mobileCardHeight = 120
}: UnifiedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof T | string | null>(defaultSort || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { cardTap } = hapticFeedback;
  const viewport = useViewport();
  
  const isMobile = viewport.isMobile;
  const isTablet = viewport.isTablet;
  
  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      // Search in specified keys or all string values
      if (searchKeys.length > 0) {
        return searchKeys.some(key => {
          const value = item[key];
          return value && String(value).toLowerCase().includes(term);
        });
      }
      
      // Search in all string values
      return Object.values(item).some(value => 
        value && typeof value === 'string' && value.toLowerCase().includes(term)
      );
    });
  }, [data, searchTerm, searchable, searchKeys]);
  
  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    
    return sorted;
  }, [filteredData, sortKey, sortDirection]);
  
  // Handle sort
  const handleSort = useCallback((key: keyof T | string) => {
    if (!columns.find(col => col.key === key)?.sortable) return;
    
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }, [sortKey, columns]);
  
  // Handle row expansion
  const toggleExpanded = useCallback((itemKey: string | number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(itemKey)) {
        next.delete(itemKey);
      } else {
        next.add(itemKey);
      }
      return next;
    });
    if (isMobile) cardTap();
  }, [isMobile, cardTap]);
  
  // Handle row click
  const handleRowClick = useCallback((item: T) => {
    if (isMobile) cardTap();
    onItemClick?.(item);
  }, [onItemClick, isMobile, cardTap]);
  
  // Virtual scrolling for performance
  const { visibleItems, totalHeight } = useWindowVirtualScroll(
    virtualize ? sortedData : [],
    isMobile ? mobileCardHeight : itemHeight,
    overscan,
    0
  );
  
  // Default mobile card renderer
  const defaultMobileCard = useCallback((item: T) => {
    const itemKey = getItemKey(item);
    const isExpanded = expandedRows.has(itemKey);
    
    // Get primary and secondary columns
    const primaryCols = columns.filter(col => col.priority === 'primary' || !col.priority);
    const secondaryCols = columns.filter(col => col.priority === 'secondary');
    const detailCols = columns.filter(col => col.priority === 'detail');
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden',
          'transform transition-all duration-200',
          hover && 'hover:shadow-lg hover:scale-[1.02]',
          'cursor-pointer'
        )}
        onClick={() => onItemClick ? handleRowClick(item) : expandable && toggleExpanded(itemKey)}
      >
        {/* Card Header - Primary Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              {primaryCols.slice(0, 2).map(col => (
                <div key={String(col.key)} className="mb-1">
                  {col.renderCell ? (
                    col.renderCell(item)
                  ) : (
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {String(item[col.key] || '-')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Expand indicator */}
            {expandable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(itemKey);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg 
                  className={cn(
                    'w-5 h-5 transition-transform',
                    isExpanded && 'rotate-180'
                  )} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Secondary Info */}
          <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
            {secondaryCols.map(col => (
              <div key={String(col.key)} className="flex items-center gap-1">
                <span className="font-medium">{col.mobileLabel || col.label}:</span>
                {col.renderCell ? (
                  col.renderCell(item)
                ) : (
                  <span>{String(item[col.key] || '-')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-gray-200 dark:border-gray-700"
            >
              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                {renderExpanded ? (
                  renderExpanded(item)
                ) : (
                  <div className="space-y-2 text-sm">
                    {detailCols.map(col => (
                      <div key={String(col.key)} className="flex justify-between">
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {col.label}:
                        </span>
                        {col.renderCell ? (
                          col.renderCell(item)
                        ) : (
                          <span className="text-gray-900 dark:text-white">
                            {String(item[col.key] || '-')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }, [
    columns, expandedRows, expandable, hover, onItemClick, 
    handleRowClick, toggleExpanded, renderExpanded, getItemKey
  ]);
  
  // Render desktop table row
  const renderTableRow = useCallback((item: T, index: number) => {
    const itemKey = getItemKey(item);
    const isExpanded = expandedRows.has(itemKey);
    
    return (
      <React.Fragment key={itemKey}>
        <tr
          className={cn(
            'transition-colors',
            striped && index % 2 === 0 && 'bg-gray-50 dark:bg-gray-900',
            hover && 'hover:bg-gray-100 dark:hover:bg-gray-800',
            onItemClick && 'cursor-pointer',
            compact ? 'h-10' : 'h-14'
          )}
          onClick={() => onItemClick && handleRowClick(item)}
        >
          {expandable && (
            <td className="px-4 py-2 w-12">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(itemKey);
                }}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <svg 
                  className={cn(
                    'w-4 h-4 transition-transform',
                    isExpanded && 'rotate-90'
                  )} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </td>
          )}
          
          {columns.map(col => (
            <td
              key={String(col.key)}
              className={cn(
                'px-4 py-2',
                col.align === 'center' && 'text-center',
                col.align === 'right' && 'text-right'
              )}
              style={{ width: col.width }}
            >
              {col.renderCell ? (
                col.renderCell(item)
              ) : (
                <span className="text-gray-900 dark:text-white">
                  {String(item[col.key] || '-')}
                </span>
              )}
            </td>
          ))}
        </tr>
        
        {/* Expanded row */}
        {isExpanded && renderExpanded && (
          <tr>
            <td colSpan={columns.length + (expandable ? 1 : 0)} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gray-50 dark:bg-gray-900 border-y border-gray-200 dark:border-gray-700"
              >
                <div className="p-4">
                  {renderExpanded(item)}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  }, [
    columns, expandedRows, expandable, striped, hover, compact,
    onItemClick, handleRowClick, toggleExpanded, renderExpanded, getItemKey
  ]);
  
  // Loading skeleton
  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20 animate-pulse" />
        ))}
      </div>
    );
  }
  
  return (
    <div className={cn('w-full', className)} ref={containerRef} data-testid="unified-data-table">
      {/* Search Bar */}
      {searchable && (
        <div className="mb-4">
          <div className="relative max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-4 py-2 pl-10 text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
              style={{ fontSize: '16px' }}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}
      
      {/* Results count */}
      {searchTerm && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Found {sortedData.length} results
        </div>
      )}
      
      {/* Mobile: Card View */}
      {isMobile ? (
        <div className="space-y-3">
          {virtualize && visibleItems.length > 0 ? (
            <div style={{ height: totalHeight, position: 'relative' }}>
              {visibleItems.map(({ item, offsetTop }) => (
                <div
                  key={getItemKey(item)}
                  style={{
                    position: 'absolute',
                    top: offsetTop,
                    left: 0,
                    right: 0
                  }}
                >
                  {renderMobileCard ? renderMobileCard(item, columns) : defaultMobileCard(item)}
                </div>
              ))}
            </div>
          ) : (
            sortedData.map(item => (
              <div key={getItemKey(item)}>
                {renderMobileCard ? renderMobileCard(item, columns) : defaultMobileCard(item)}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Desktop: Table View */
        <div className="overflow-x-auto rounded-lg shadow-md max-h-[calc(100vh-200px)] overflow-y-auto">
          <table className="w-full bg-white dark:bg-gray-800">
            <thead className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
              <tr>
                {expandable && <th className="w-12" />}
                {columns.map(col => (
                  <th
                    key={String(col.key)}
                    className={cn(
                      'px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300',
                      col.sortable && 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                    style={{ width: col.width }}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} 
                          />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td 
                    colSpan={columns.length + (expandable ? 1 : 0)} 
                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                  >
                    No data found
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => renderTableRow(item, index))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UnifiedDataTable;