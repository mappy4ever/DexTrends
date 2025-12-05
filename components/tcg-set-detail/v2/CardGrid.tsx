import React, { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import type { TCGCard } from '@/types/api/cards';

const CARD_FALLBACK = '/back-card.png';

interface CardGridProps {
  cards: TCGCard[];
  onCardClick: (card: TCGCard) => void;
  getPrice: (card: TCGCard) => number;
  showPrices?: boolean;
}

// Card image component with fallback handling
const CardImage: React.FC<{ card: TCGCard }> = ({ card }) => {
  const [imgSrc, setImgSrc] = useState(card.images?.small || card.images?.large || CARD_FALLBACK);

  const handleError = useCallback(() => {
    if (imgSrc !== CARD_FALLBACK) {
      setImgSrc(CARD_FALLBACK);
    }
  }, [imgSrc]);

  return (
    <img
      src={imgSrc}
      alt={card.name}
      className="w-full aspect-[245/342] object-cover"
      loading="lazy"
      draggable={false}
      onError={handleError}
    />
  );
};

/**
 * CardGrid - Dense, mobile-first card grid
 * Inspired by Pokemon Zone's clean, focused layout
 * 3 cols mobile → 4 → 5 → 6 → 8 cols on larger screens
 */
export const CardGrid: React.FC<CardGridProps> = ({
  cards,
  onCardClick,
  getPrice,
  showPrices = true
}) => {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-stone-900 dark:text-white">No cards found</h3>
        <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className={cn(
      'grid gap-2 sm:gap-3',
      'grid-cols-3',                    // 3 on mobile
      'xs:grid-cols-4',                 // 4 on 420px+
      'sm:grid-cols-5',                 // 5 on 640px+
      'md:grid-cols-6',                 // 6 on 768px+
      'lg:grid-cols-7',                 // 7 on 1024px+
      'xl:grid-cols-8',                 // 8 on 1280px+
      '2xl:grid-cols-10',               // 10 on 1536px+
      'p-2 sm:p-3'
    )}>
      {cards.map((card) => {
        const price = getPrice(card);

        return (
          <button
            key={card.id}
            onClick={() => onCardClick(card)}
            className={cn(
              'relative group',
              'rounded-lg overflow-hidden',
              'bg-stone-100 dark:bg-stone-800',
              'transition-all duration-150',
              'hover:z-10 hover:scale-[1.03] hover:shadow-xl',
              'active:scale-[0.98]',
              'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-1',
              'touch-manipulation'
            )}
          >
            {/* Card image with fallback */}
            <CardImage card={card} />

            {/* Always-visible info bar at bottom with card name and price */}
            <div className={cn(
              'absolute inset-x-0 bottom-0',
              'bg-black/75 backdrop-blur-sm',
              'px-1.5 py-1',
              'flex flex-col gap-0.5'
            )}>
              <p className="text-white text-[10px] sm:text-xs font-semibold line-clamp-1 leading-tight">
                {card.name}
              </p>
              {showPrices && price > 0 && (
                <p className="text-green-400 text-[10px] sm:text-xs font-bold leading-tight">
                  ${price.toFixed(2)}
                </p>
              )}
            </div>

            {/* Card number badge - top left */}
            <div className={cn(
              'absolute top-1 left-1',
              'px-1 py-0.5 rounded',
              'bg-black/60 backdrop-blur-sm',
              'text-white text-[9px] font-medium'
            )}>
              #{card.number}
            </div>

            {/* High value badge - top right for expensive cards */}
            {showPrices && price >= 50 && (
              <div className={cn(
                'absolute top-1 right-1',
                'px-1.5 py-0.5 rounded',
                'bg-amber-500/90 backdrop-blur-sm',
                'text-white text-[10px] font-bold',
                'shadow-sm'
              )}>
                ${price >= 100 ? Math.floor(price) : price.toFixed(0)}+
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CardGrid;
