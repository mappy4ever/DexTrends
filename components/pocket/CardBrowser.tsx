/**
 * CardBrowser - Virtual scrolling card grid for deck builder
 *
 * Features:
 * - Responsive grid (3-6 columns)
 * - Infinite scroll with load more
 * - Card count badges for cards in deck
 * - Click to add, long press for details
 */

import React, { memo, useCallback, useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import type { ExtendedPocketCard } from '@/hooks/useDeckBuilder';

interface CardBrowserProps {
  cards: ExtendedPocketCard[];
  onCardClick: (card: ExtendedPocketCard) => void;
  onCardLongPress?: (card: ExtendedPocketCard) => void;
  getCardCount: (cardId: string) => number;
  getBaseNameCount: (card: ExtendedPocketCard) => number;
  maxCopies: number;
  hasMore: boolean;
  onLoadMore: () => void;
  loading?: boolean;
  totalCount: number;
  className?: string;
}

// Memoized card component to prevent unnecessary re-renders
const CardItem = memo(function CardItem({
  card,
  count,
  baseNameCount,
  maxCopies,
  onClick,
  onLongPress
}: {
  card: ExtendedPocketCard;
  count: number;
  baseNameCount: number;
  maxCopies: number;
  onClick: () => void;
  onLongPress?: () => void;
}) {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const isLongPress = useRef(false);

  const handleTouchStart = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress?.();
    }, 500);
  }, [onLongPress]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    if (!isLongPress.current) {
      onClick();
    }
  }, [onClick]);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  }, [onClick]);

  // Use baseNameCount to check if at max - this respects the name-based limit rule
  const isAtMax = baseNameCount >= maxCopies;
  const imageUrl = card.image || card.thumbnail || '/placeholder-card.png';

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => longPressTimer.current && clearTimeout(longPressTimer.current)}
      className={cn(
        'relative group rounded-md overflow-hidden',
        'aspect-[2.5/3.5] w-full min-w-[60px]', // Minimum width for touch
        'bg-stone-100 dark:bg-stone-800',
        'transition-all duration-150 ease-out',
        'hover:brightness-110 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-inset',
        'active:scale-[0.97] active:brightness-95',
        'touch-manipulation', // Optimize for touch
        isAtMax && 'opacity-50 saturate-50'
      )}
      aria-label={`Add ${card.name} to deck${count > 0 ? ` (${count}/${maxCopies} in deck)` : ''}`}
    >
      {/* Card Image */}
      <Image
        src={imageUrl}
        alt={card.name}
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
        className="object-cover"
        loading="lazy"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAQMDBAMBAAAAAAAAAAAAAQIDBAAFEQYSITFBUWFx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAYEQEAAwEAAAAAAAAAAAAAAAABAAIRMf/aAAwDAQACEQMRAD8A0HUurpVs1FcLPCt8RyPBkOMJkSHVJU4lKgNyQnJ54/ar2nb9MvbTrsm3w4biHC2Q0+pxJI7yCBg9UqwTI7R//9k="
      />

      {/* Count Badge - Compact for dense grid */}
      {count > 0 && (
        <div className={cn(
          'absolute top-0.5 right-0.5 z-10',
          'min-w-[18px] h-[18px] px-1',
          'flex items-center justify-center',
          'rounded-full text-[10px] font-bold',
          'shadow-sm',
          isAtMax
            ? 'bg-amber-500 text-white'
            : 'bg-blue-500 text-white'
        )}>
          {count}
        </div>
      )}

      {/* Simple hover indicator - just a subtle overlay */}
      {!isAtMax && (
        <div className={cn(
          'absolute inset-0 z-10',
          'bg-green-500/20 opacity-0 group-hover:opacity-100',
          'transition-opacity duration-100',
          'pointer-events-none'
        )} />
      )}
    </button>
  );
});

export function CardBrowser({
  cards,
  onCardClick,
  onCardLongPress,
  getCardCount,
  getBaseNameCount,
  maxCopies,
  hasMore,
  onLoadMore,
  loading = false,
  totalCount,
  className
}: CardBrowserProps) {
  // Intersection observer for infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsIntersecting(entries[0]?.isIntersecting ?? false);
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Trigger load more when sentinel is visible
  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  if (cards.length === 0 && !loading) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        'text-stone-500 dark:text-stone-400',
        className
      )}>
        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium">No cards found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Results count */}
      <div className="flex items-center justify-between px-1 py-2 text-sm text-stone-500 dark:text-stone-400">
        <span>
          Showing {cards.length} of {totalCount} cards
        </span>
      </div>

      {/* Card Grid - Responsive layout optimized for touch on mobile */}
      <div className={cn(
        'grid gap-2 sm:gap-2.5',
        // 3 columns on small mobile, 4 on larger phones, scaling up for tablets/desktop
        'grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8'
      )}>
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            count={getCardCount(card.id)}
            baseNameCount={getBaseNameCount(card)}
            maxCopies={maxCopies}
            onClick={() => onCardClick(card)}
            onLongPress={onCardLongPress ? () => onCardLongPress(card) : undefined}
          />
        ))}
      </div>

      {/* Load More Sentinel */}
      <div ref={loadMoreRef} className="h-4" />

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Load More Button (fallback) - With proper touch target */}
      {hasMore && !loading && (
        <button
          type="button"
          onClick={onLoadMore}
          className={cn(
            'mx-auto mt-4 px-8 py-3 min-h-[48px]',
            'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white',
            'rounded-full font-medium text-sm',
            'transition-all duration-200 active:scale-[0.98]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            'touch-manipulation'
          )}
        >
          Load More
        </button>
      )}

      {/* End of results */}
      {!hasMore && cards.length > 0 && (
        <p className="text-center text-sm text-stone-400 dark:text-stone-500 py-4">
          All {totalCount} cards loaded
        </p>
      )}
    </div>
  );
}
