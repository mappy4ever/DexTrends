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
  maxCopies,
  onClick,
  onLongPress
}: {
  card: ExtendedPocketCard;
  count: number;
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

  const isAtMax = count >= maxCopies;
  const imageUrl = card.image || card.thumbnail || '/placeholder-card.png';

  return (
    <button
      type="button"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => longPressTimer.current && clearTimeout(longPressTimer.current)}
      className={cn(
        'relative group rounded-lg overflow-hidden',
        'aspect-[2.5/3.5] w-full',
        'bg-stone-100 dark:bg-stone-800',
        'transition-all duration-200 ease-out',
        'hover:scale-[1.02] hover:shadow-lg',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
        'active:scale-[0.98]',
        isAtMax && 'opacity-60'
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

      {/* Count Badge */}
      {count > 0 && (
        <div className={cn(
          'absolute top-1 right-1 z-10',
          'min-w-[24px] h-6 px-1.5',
          'flex items-center justify-center',
          'rounded-full text-xs font-bold',
          'shadow-md',
          isAtMax
            ? 'bg-amber-500 text-white'
            : 'bg-blue-500 text-white'
        )}>
          {count}
        </div>
      )}

      {/* Add indicator on hover */}
      <div className={cn(
        'absolute inset-0 z-10',
        'flex items-center justify-center',
        'bg-black/40 opacity-0 group-hover:opacity-100',
        'transition-opacity duration-200',
        isAtMax && 'hidden'
      )}>
        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>

      {/* Card name overlay (mobile) */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0',
        'bg-gradient-to-t from-black/80 to-transparent',
        'p-2 pt-6',
        'md:opacity-0 md:group-hover:opacity-100',
        'transition-opacity duration-200'
      )}>
        <p className="text-white text-xs font-medium truncate">
          {card.name}
        </p>
      </div>
    </button>
  );
});

export function CardBrowser({
  cards,
  onCardClick,
  onCardLongPress,
  getCardCount,
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

      {/* Card Grid */}
      <div className={cn(
        'grid gap-2 sm:gap-3',
        'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6'
      )}>
        {cards.map((card) => (
          <CardItem
            key={card.id}
            card={card}
            count={getCardCount(card.id)}
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

      {/* Load More Button (fallback) */}
      {hasMore && !loading && (
        <button
          type="button"
          onClick={onLoadMore}
          className={cn(
            'mx-auto mt-4 px-6 py-2.5',
            'bg-blue-500 hover:bg-blue-600 text-white',
            'rounded-full font-medium text-sm',
            'transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2'
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
