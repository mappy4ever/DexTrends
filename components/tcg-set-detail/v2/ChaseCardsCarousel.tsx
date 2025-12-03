import React, { useMemo } from 'react';
import { cn } from '@/utils/cn';
import type { TCGCard } from '@/types/api/cards';

interface ChaseCardsCarouselProps {
  cards: TCGCard[];
  onCardClick: (card: TCGCard) => void;
  getPrice: (card: TCGCard) => number;
  maxCards?: number;
}

/**
 * ChaseCardsCarousel - Premium horizontal showcase of top value cards
 * Full card images, smooth scrolling, mobile-optimized
 */
export const ChaseCardsCarousel: React.FC<ChaseCardsCarouselProps> = ({
  cards,
  onCardClick,
  getPrice,
  maxCards = 10
}) => {
  const topCards = useMemo(() => {
    return cards
      .map(card => ({ card, price: getPrice(card) }))
      .filter(({ price }) => price > 0)
      .sort((a, b) => b.price - a.price)
      .slice(0, maxCards);
  }, [cards, getPrice, maxCards]);

  if (topCards.length === 0) return null;

  return (
    <section className="w-full">
      {/* Section header */}
      <div className="px-4 sm:px-6 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
              Chase Cards
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Most valuable in this set
            </p>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        <div
          className={cn(
            'flex gap-3 overflow-x-auto',
            'px-4 sm:px-6 pb-4',
            'snap-x snap-mandatory',
            'scrollbar-hide',
            '-webkit-overflow-scrolling-touch'
          )}
        >
          {topCards.map(({ card, price }, index) => (
            <button
              key={card.id}
              onClick={() => onCardClick(card)}
              className={cn(
                'flex-shrink-0 snap-start',
                'relative group',
                'w-[120px] sm:w-[140px]',
                'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2',
                'touch-manipulation'
              )}
            >
              {/* Card image container */}
              <div className={cn(
                'relative rounded-xl overflow-hidden',
                'bg-stone-100 dark:bg-stone-800',
                'shadow-md',
                'transition-all duration-200',
                'group-hover:shadow-xl group-hover:-translate-y-1',
                'group-active:scale-[0.98]'
              )}>
                {/* Rank badge */}
                <div className={cn(
                  'absolute top-1.5 left-1.5 z-10',
                  'w-6 h-6 rounded-full',
                  'flex items-center justify-center',
                  'text-[10px] font-bold',
                  'shadow-sm',
                  index === 0
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                    : index === 1
                    ? 'bg-gradient-to-br from-stone-200 to-stone-300 text-stone-700'
                    : index === 2
                    ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                    : 'bg-white/90 dark:bg-stone-700/90 text-stone-600 dark:text-stone-300'
                )}>
                  {index + 1}
                </div>

                {/* Card image */}
                <img
                  src={card.images.small}
                  alt={card.name}
                  className="w-full aspect-[245/342] object-cover"
                  loading="lazy"
                  draggable={false}
                />

                {/* Price overlay - always visible */}
                <div className={cn(
                  'absolute bottom-0 left-0 right-0',
                  'bg-gradient-to-t from-black/80 via-black/50 to-transparent',
                  'px-2 pt-6 pb-2'
                )}>
                  <p className="text-white font-bold text-sm">
                    ${price.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Card name below */}
              <p className="mt-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 text-center line-clamp-1 px-1">
                {card.name}
              </p>
            </button>
          ))}
        </div>

        {/* Fade edges - desktop only */}
        <div className="hidden sm:block absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white dark:from-stone-900 to-transparent pointer-events-none" />
        <div className="hidden sm:block absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-white dark:from-stone-900 to-transparent pointer-events-none" />
      </div>
    </section>
  );
};

export default ChaseCardsCarousel;
