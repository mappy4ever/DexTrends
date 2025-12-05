import React, { useMemo, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import type { PocketCard } from '@/types/api/pocket-cards';

const CARD_FALLBACK = '/back-card.png';

// Rarity ranking for sorting
const rarityRank: Record<string, number> = {
  '👑': 10,
  '♕': 10,
  '★★★': 9,
  '★★': 8,
  '☆☆': 8,
  '★': 7,
  '☆': 7,
  '◊◊◊◊': 6,
  '◊◊◊': 5,
  '◊◊': 4,
  '◊': 3
};

interface FeaturedCardsCarouselProps {
  cards: PocketCard[];
  onCardClick: (card: PocketCard) => void;
  maxCards?: number;
}

// Card image component with fallback handling
const FeaturedCardImage: React.FC<{ card: PocketCard }> = ({ card }) => {
  const [imgSrc, setImgSrc] = useState(card.image || CARD_FALLBACK);
  const [isError, setIsError] = useState(false);

  const handleError = useCallback(() => {
    if (imgSrc !== CARD_FALLBACK) {
      setImgSrc(CARD_FALLBACK);
      setIsError(true);
    }
  }, [imgSrc]);

  return (
    <div className="w-full aspect-[245/342] bg-stone-200 dark:bg-stone-700">
      <img
        src={imgSrc}
        alt={card.name}
        className={cn(
          "w-full h-full",
          isError ? "object-contain p-2" : "object-cover"
        )}
        loading="lazy"
        draggable={false}
        onError={handleError}
      />
    </div>
  );
};

// Get rarity display
const getRarityDisplay = (rarity?: string) => {
  if (!rarity) return null;
  return rarity
    .replace(/☆/g, '★')
    .replace(/◊/g, '♦');
};

/**
 * FeaturedCardsCarousel - Premium horizontal showcase of rare cards
 * Shows highest rarity cards from the set
 */
export const FeaturedCardsCarousel: React.FC<FeaturedCardsCarouselProps> = ({
  cards,
  onCardClick,
  maxCards = 10
}) => {
  const topCards = useMemo(() => {
    return cards
      .map(card => ({ card, rank: rarityRank[card.rarity] || 0 }))
      .filter(({ rank }) => rank >= 5) // Only show rare+ cards
      .sort((a, b) => b.rank - a.rank)
      .slice(0, maxCards);
  }, [cards, maxCards]);

  if (topCards.length === 0) return null;

  return (
    <section className="w-full">
      {/* Section header */}
      <div className="px-4 sm:px-6 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white">
              Featured Cards
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Rarest cards in this set
            </p>
          </div>
          {/* Scroll hint for mobile */}
          <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500 sm:hidden">
            <span>Scroll</span>
            <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Carousel - horizontally scrollable on all screen sizes */}
      <div className="relative">
        <div
          className={cn(
            'flex gap-3 overflow-x-auto overflow-y-hidden',
            'px-4 sm:px-6 pb-4',
            'snap-x snap-mandatory',
            'scrollbar-hide',
            '-webkit-overflow-scrolling-touch',
            'touch-pan-x'
          )}
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth'
          }}
        >
          {topCards.map(({ card, rank }, index) => (
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

                {/* Card image with fallback */}
                <FeaturedCardImage card={card} />

                {/* Magnifier overlay on hover */}
                <div className={cn(
                  'absolute inset-0 flex items-center justify-center',
                  'bg-black/0 group-hover:bg-black/15',
                  'transition-all duration-200',
                  'pointer-events-none'
                )}>
                  <div className={cn(
                    'w-9 h-9 rounded-full',
                    'bg-white/90 dark:bg-stone-800/90',
                    'flex items-center justify-center',
                    'opacity-0 group-hover:opacity-100',
                    'scale-75 group-hover:scale-100',
                    'transition-all duration-200',
                    'shadow-lg'
                  )}>
                    <svg className="w-4 h-4 text-stone-600 dark:text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>

                {/* Rarity overlay - always visible */}
                <div className={cn(
                  'absolute bottom-0 left-0 right-0',
                  'bg-gradient-to-t from-black/80 via-black/50 to-transparent',
                  'px-2 pt-6 pb-2'
                )}>
                  <p className="text-amber-400 font-bold text-sm">
                    {getRarityDisplay(card.rarity)}
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

export default FeaturedCardsCarousel;
