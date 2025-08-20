import React from 'react';
import Image from 'next/image';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import PriceDisplay from '../ui/PriceDisplay';
import type { TCGCard } from '@/types/api/cards';

interface FeaturedCardsGridProps {
  cards: TCGCard[];
  getPrice: (card: TCGCard) => number;
  onCardClick?: (card: TCGCard) => void;
}

export const FeaturedCardsGrid: React.FC<FeaturedCardsGridProps> = ({
  cards,
  getPrice,
  onCardClick
}) => {
  // Get top 10 most valuable cards
  const featuredCards = [...cards]
    .sort((a, b) => getPrice(b) - getPrice(a))
    .slice(0, 10);

  if (featuredCards.length === 0) return null;

  return (
    <div className={cn(
      createGlassStyle({
        blur: 'md',
        opacity: 'subtle',
        border: 'subtle',
        rounded: 'xl',
        shadow: 'md'
      }),
      'p-4'
    )}>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
        Featured Cards
      </h3>
      
      {/* 5x2 Grid */}
      <div className="grid grid-cols-5 gap-3">
        {featuredCards.map((card) => {
          const price = getPrice(card);
          return (
            <div
              key={card.id}
              className="group cursor-pointer"
              onClick={() => onCardClick?.(card)}
            >
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={card.images?.small || ''}
                  alt={card.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {/* Price overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <PriceDisplay
                    price={price}
                    size="xs"
                    variant={price >= 100 ? 'premium' : price >= 50 ? 'sale' : 'default'}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                {card.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedCardsGrid;