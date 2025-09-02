import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  className = '', 
  width = 250, 
  height = 350 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(!isFlipped);

  return (
    <div 
      className={`relative ${className}`} 
      style={{ width, height, perspective: '1000px' }}
      onClick={handleFlip}
    >
      <motion.div
        className="absolute w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        {/* Front of card */}
        <div 
          className="absolute w-full h-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src={card.images?.large || card.images?.small || '/back-card.png'}
            alt={card.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Back of card */}
        <div 
          className="absolute w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-lg p-4 flex flex-col justify-center items-center text-white cursor-pointer"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <h3 className="text-xl font-bold mb-2">{card.name}</h3>
          {card.set && <p className="text-sm mb-1">Set: {card.set.name}</p>}
          {card.number && <p className="text-sm mb-1">#{card.number}</p>}
          {card.rarity && <p className="text-sm mb-1">Rarity: {card.rarity}</p>}
          {card.hp && <p className="text-sm">HP: {card.hp}</p>}
          <p className="text-xs mt-4 text-center opacity-75">Click to flip</p>
        </div>
      </motion.div>
    </div>
  );
};

export default FlippableTCGCard;