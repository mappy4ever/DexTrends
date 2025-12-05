import React, { useState, useCallback } from 'react';
import { cn } from '@/utils/cn';
import type { PocketCard } from '@/types/api/pocket-cards';

const CARD_FALLBACK = '/back-card.png';

interface PocketCardGridProps {
  cards: PocketCard[];
  onCardClick: (card: PocketCard) => void;
}

// Get rarity display
const getRarityDisplay = (rarity?: string): string => {
  if (!rarity) return '';
  return rarity
    .replace(/☆/g, '★')
    .replace(/◊/g, '♦');
};

// Card image component with fallback handling
const CardImage: React.FC<{ card: PocketCard }> = ({ card }) => {
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

/**
 * PocketCardGrid - Dense, mobile-first card grid for Pocket cards
 * Matches TCG CardGrid style
 */
export const PocketCardGrid: React.FC<PocketCardGridProps> = ({
  cards,
  onCardClick
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
        // Parse card number from ID (e.g., "a1-001" -> "001")
        const cardNumber = card.id?.split('-')[1] || card.number || '???';

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

            {/* Magnifier overlay on hover */}
            <div className={cn(
              'absolute inset-0 flex items-center justify-center',
              'bg-black/0 group-hover:bg-black/20',
              'transition-all duration-200',
              'pointer-events-none'
            )}>
              <div className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 rounded-full',
                'bg-white/90 dark:bg-stone-800/90',
                'flex items-center justify-center',
                'opacity-0 group-hover:opacity-100',
                'scale-75 group-hover:scale-100',
                'transition-all duration-200',
                'shadow-lg'
              )}>
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-stone-600 dark:text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>

            {/* Always-visible info bar at bottom with card name and rarity */}
            <div className={cn(
              'absolute inset-x-0 bottom-0',
              'bg-black/75 backdrop-blur-sm',
              'px-1.5 py-1',
              'flex flex-col gap-0.5'
            )}>
              <span className="text-white text-[10px] sm:text-xs font-semibold line-clamp-1 leading-tight">
                {card.name}
              </span>
              {card.rarity && (
                <p className="text-amber-400 text-[10px] sm:text-xs font-bold leading-tight">
                  {getRarityDisplay(card.rarity)}
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
              #{cardNumber}
            </div>

            {/* ex badge - top right for ex cards */}
            {(card as any).ex === 'Yes' && (
              <div className={cn(
                'absolute top-1 right-1',
                'px-1.5 py-0.5 rounded',
                'bg-amber-500/90 backdrop-blur-sm',
                'text-white text-[10px] font-bold',
                'shadow-sm'
              )}>
                ex
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default PocketCardGrid;
