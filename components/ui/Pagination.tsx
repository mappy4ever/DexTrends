/**
 * Pagination Component
 *
 * A clean, accessible pagination component for navigating large datasets.
 * Follows DexTrends design system with warm amber accents.
 *
 * Features:
 * - Responsive (collapses on mobile)
 * - Keyboard accessible
 * - Configurable page range
 * - First/Last page jumps
 * - Loading state
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { HiChevronLeft, HiChevronRight, HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';

export interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Number of page buttons to show (default: 5) */
  siblingCount?: number;
  /** Show first/last page buttons (default: true) */
  showFirstLast?: boolean;
  /** Show page numbers (default: true) */
  showPageNumbers?: boolean;
  /** Disable all interactions */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPageNumbers = true,
  disabled = false,
  loading = false,
  size = 'md',
  className,
}: PaginationProps) {
  // Don't render if only 1 page
  if (totalPages <= 1) return null;

  const isDisabled = disabled || loading;

  // Calculate page numbers to display
  const getPageNumbers = (): (number | 'dots')[] => {
    const totalPageNumbers = siblingCount * 2 + 3; // siblings + current + first + last

    // If total pages is less than page numbers we want to show, return all
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, 'dots', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, 'dots', ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = range(leftSiblingIndex, rightSiblingIndex);
      return [1, 'dots', ...middleRange, 'dots', totalPages];
    }

    return range(1, totalPages);
  };

  const pages = getPageNumbers();

  // Size styles
  const sizeStyles = {
    sm: {
      button: 'h-8 min-w-[32px] text-sm px-2',
      icon: 'w-4 h-4',
      gap: 'gap-1',
    },
    md: {
      button: 'h-10 min-w-[40px] text-base px-3',
      icon: 'w-5 h-5',
      gap: 'gap-1.5',
    },
    lg: {
      button: 'h-12 min-w-[48px] text-lg px-4',
      icon: 'w-6 h-6',
      gap: 'gap-2',
    },
  };

  const styles = sizeStyles[size];

  const buttonBase = cn(
    'inline-flex items-center justify-center rounded-lg font-medium',
    'transition-all duration-150',
    'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2',
    styles.button
  );

  const buttonDefault = cn(
    buttonBase,
    'bg-white dark:bg-stone-800',
    'text-stone-700 dark:text-stone-200',
    'border border-stone-200 dark:border-stone-700',
    'hover:bg-stone-50 dark:hover:bg-stone-700',
    'active:bg-stone-100 dark:active:bg-stone-600',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-stone-800'
  );

  const buttonActive = cn(
    buttonBase,
    'bg-amber-500 dark:bg-amber-600',
    'text-white',
    'border border-amber-500 dark:border-amber-600',
    'shadow-sm',
    'cursor-default'
  );

  const buttonNav = cn(
    buttonDefault,
    'hover:border-amber-300 dark:hover:border-amber-700'
  );

  return (
    <nav
      className={cn('flex items-center', styles.gap, className)}
      aria-label="Pagination"
      role="navigation"
    >
      {/* First page button */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(1)}
          disabled={isDisabled || currentPage === 1}
          className={cn(buttonNav, 'hidden sm:flex')}
          aria-label="Go to first page"
          title="First page"
        >
          <HiChevronDoubleLeft className={styles.icon} />
        </button>
      )}

      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isDisabled || currentPage === 1}
        className={buttonNav}
        aria-label="Go to previous page"
        title="Previous page"
      >
        <HiChevronLeft className={styles.icon} />
        <span className="hidden sm:inline ml-1">Prev</span>
      </button>

      {/* Page numbers */}
      {showPageNumbers && (
        <div className={cn('hidden sm:flex items-center', styles.gap)}>
          {pages.map((page, index) => {
            if (page === 'dots') {
              return (
                <span
                  key={`dots-${index}`}
                  className={cn(
                    'px-2 text-stone-400 dark:text-stone-500',
                    styles.button,
                    'flex items-center justify-center'
                  )}
                  aria-hidden="true"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => !isActive && onPageChange(page)}
                disabled={isDisabled}
                className={isActive ? buttonActive : buttonDefault}
                aria-label={`Page ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile page indicator */}
      <div className="flex sm:hidden items-center px-3">
        <span className="text-sm text-stone-600 dark:text-stone-300">
          {currentPage} / {totalPages}
        </span>
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isDisabled || currentPage === totalPages}
        className={buttonNav}
        aria-label="Go to next page"
        title="Next page"
      >
        <span className="hidden sm:inline mr-1">Next</span>
        <HiChevronRight className={styles.icon} />
      </button>

      {/* Last page button */}
      {showFirstLast && (
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={isDisabled || currentPage === totalPages}
          className={cn(buttonNav, 'hidden sm:flex')}
          aria-label="Go to last page"
          title="Last page"
        >
          <HiChevronDoubleRight className={styles.icon} />
        </button>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="ml-2 w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      )}
    </nav>
  );
}

/**
 * Simple page info component for mobile
 */
export function PageInfo({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className,
}: {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  className?: string;
}) {
  const startItem = totalItems && itemsPerPage
    ? (currentPage - 1) * itemsPerPage + 1
    : null;
  const endItem = totalItems && itemsPerPage
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : null;

  return (
    <p className={cn('text-sm text-stone-600 dark:text-stone-300', className)}>
      {startItem && endItem && totalItems ? (
        <>
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </>
      ) : (
        <>
          Page <span className="font-medium">{currentPage}</span> of{' '}
          <span className="font-medium">{totalPages}</span>
        </>
      )}
    </p>
  );
}

export default Pagination;
