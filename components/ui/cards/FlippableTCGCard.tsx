import React from 'react';
import FlippableCard from './FlippableCard';
import { TCGCard } from '../../../types/api/cards';

interface FlippableTCGCardProps {
  card: TCGCard;
  className?: string;
  width?: string | number;
  height?: string | number;
}

// Flippable card specifically designed for Pokemon TCG cards
export const FlippableTCGCard: React.FC<FlippableTCGCardProps> = ({ 
  card, 
  className, 
  width = 250, 
  height = 350 
}) => {
  const frontContent = (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
      <img
        src={card.images?.large || card.images?.small || '/back-card.png'}
        alt={card.name}
        className="w-full h-full object-cover"
      />
    </div>
  );

  const backContent = (
    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg p-4 flex flex-col justify-center items-center text-white">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">{card.name}</h3>
        {card.set && (
          <p className="text-sm opacity-90 mb-4">{card.set.name}</p>
        )}
        {card.rarity && (
          <div className="mb-4">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {card.rarity}
            </span>
          </div>
        )}
        {card.tcgplayer?.prices && (
          <div className="space-y-2">
            <p className="text-sm opacity-90">Market Price</p>
            <p className="text-2xl font-bold">
              ${(() => {
                const prices = Object.values(card.tcgplayer.prices);
                const priceWithMarket = prices.find((price: unknown): price is { market: number } => 
                  Boolean(price && typeof price === 'object' && price !== null && 'market' in price)
                );
                return priceWithMarket?.market || 'N/A';
              })()}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <FlippableCard
      frontContent={frontContent}
      backContent={backContent}
      className={className}
      width={width}
      height={height}
      flipOnClick={true}
      flipOnHover={false}
    />
  );
};

export default FlippableTCGCard;