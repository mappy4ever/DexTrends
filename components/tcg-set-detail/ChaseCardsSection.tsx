import React, { useMemo } from 'react';
import { cn } from '@/utils/cn';
import { RarityIcon } from '../ui/RarityIcon';
import type { TCGCard } from '@/types/api/cards';

interface ChaseCardsSectionProps {
  cards: TCGCard[];
  onCardClick?: (card: TCGCard) => void;
  getPrice?: (card: TCGCard) => number;
  maxCards?: number;
}

/**
 * ChaseCardsSection - Showcase of top value "chase" cards
 * Clean horizontal scroll with snap points, no auto-scroll
 */
export const ChaseCardsSection: React.FC<ChaseCardsSectionProps> = ({
  cards,
  onCardClick,
  getPrice = () => 0,
  maxCards = 10
}) => {
  // Get top cards by price - memoized
  const topCards = useMemo(() => {
    return cards
      .map(card => ({ card, price: getPrice(card) }))
      .filter(({ price }) => price > 0)
      .sort((a, b) => b.price - a.price)
      .slice(0, maxCards);
  }, [cards, getPrice, maxCards]);

  if (topCards.length === 0) return null;

  return (
    <section className="w-full" aria-labelledby="chase-cards-heading">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="chase-cards-heading" className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white">
            Chase Cards
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
            Most valuable cards in this set
          </p>
        </div>
      </div>

      {/* Scrollable cards container */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <div
          className={cn(
            'flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth',
            'snap-x snap-mandatory',
            'px-4 sm:px-6 lg:px-8 pb-3',
            'scrollbar-hide',
            '-webkit-overflow-scrolling-touch'
          )}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {topCards.map(({ card, price }, index) => (
            <button
              key={card.id}
              onClick={() => onCardClick?.(card)}
              aria-label={`View ${card.name}, ranked #${index + 1}, priced at $${price.toFixed(2)}`}
              className={cn(
                'flex-shrink-0 snap-start',
                'w-[160px] sm:w-[180px] md:w-[200px]',
                'bg-white dark:bg-stone-800 rounded-xl',
                'border border-stone-200 dark:border-stone-700',
                'shadow-sm hover:shadow-lg',
                'transition-all duration-150',
                'hover:-translate-y-1 active:scale-[0.98]',
                'focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-2',
                'text-left overflow-hidden',
                'touch-manipulation'
              )}
            >
              {/* Card image with rank badge */}
              <div className="relative aspect-[245/200] bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-700 dark:to-stone-800 overflow-hidden">
                <img
                  src={card.images.small}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                  loading="lazy"
                  draggable={false}
                />
                {/* Rank badge */}
                <div className={cn(
                  'absolute top-2 left-2',
                  'w-7 h-7 rounded-full flex items-center justify-center',
                  'text-xs font-bold shadow-md',
                  index === 0
                    ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white'
                    : index === 1
                    ? 'bg-gradient-to-br from-stone-300 to-stone-400 text-white'
                    : index === 2
                    ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
                    : 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-600'
                )}>
                  {index + 1}
                </div>
              </div>

              {/* Card info */}
              <div className="p-3">
                <h3 className="font-semibold text-sm text-stone-900 dark:text-white line-clamp-1">
                  {card.name}
                </h3>

                <div className="flex items-center justify-between mt-1.5">
                  {/* Price */}
                  <span className="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
                    ${price.toFixed(2)}
                  </span>

                  {/* Rarity icon */}
                  {card.rarity && (
                    <div className="flex items-center">
                      <RarityIcon rarity={card.rarity} size="xs" showLabel={false} />
                    </div>
                  )}
                </div>

                {/* Card number */}
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  #{card.number}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChaseCardsSection;
