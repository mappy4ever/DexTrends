import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

interface FlippableCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  className?: string;
  width?: string | number;
  height?: string | number;
  flipOnHover?: boolean;
  flipOnClick?: boolean;
}

const FlippableCard: React.FC<FlippableCardProps> = ({
  frontContent,
  backContent,
  className = '',
  width = '100%',
  height = 'auto',
  flipOnHover = false,
  flipOnClick = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    if (flipOnClick) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMouseEnter = () => {
    if (flipOnHover) {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (flipOnHover) {
      setIsFlipped(false);
    }
  };

  return (
    <div
      className={cn(
        'relative preserve-3d cursor-pointer',
        className
      )}
      style={{ width, height }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        {/* Front Face */}
        <div className="absolute w-full h-full backface-hidden">
          {frontContent}
        </div>
        
        {/* Back Face */}
        <div
          className="absolute w-full h-full backface-hidden"
          style={{ transform: 'rotateY(180deg)' }}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};

export default FlippableCard;

// Example usage for Pokemon TCG cards
export const FlippableTCGCard: React.FC<{
  card: any;
  className?: string;
  width?: string | number;
  height?: string | number;
}> = ({ card, className, width = 250, height = 350 }) => {
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
                const priceWithMarket = prices.find((price: any) => price && typeof price === 'object' && 'market' in price) as any;
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