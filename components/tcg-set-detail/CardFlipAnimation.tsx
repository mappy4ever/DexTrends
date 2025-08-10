import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { TCGCard } from '../../types/api/cards';
import { getRaritySymbol, getRarityGlowClass } from '../../utils/tcgRaritySymbols';
import hapticFeedback from '../../utils/hapticFeedback';
import { easings } from '../ui/EnhancedAnimationSystem';

interface CardFlipAnimationProps {
  card: TCGCard;
  isFlipped: boolean;
  onFlip: () => void;
  onCardClick: (card: TCGCard) => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (card: TCGCard) => void;
}

export const CardFlipAnimation: React.FC<CardFlipAnimationProps> = ({
  card,
  isFlipped,
  onFlip,
  onCardClick,
  isFavorite = false,
  onFavoriteToggle
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback.cardFlip();
    onFlip();
  };

  const handleCardClick = () => {
    if (!isFlipped) {
      hapticFeedback.buttonTap();
      onCardClick(card);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(card);
    }
  };

  const cardVariants = {
    front: {
      rotateY: 0,
      transition: easings.springSmooth
    },
    back: {
      rotateY: 180,
      transition: easings.springSmooth
    }
  };

  const glowVariants = {
    idle: {
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)"
    },
    hover: {
      boxShadow: `0 8px 30px ${getRarityGlowClass(card.rarity || 'Common')}`
    }
  };

  return (
    <motion.div
      className="relative w-full h-full cursor-pointer"
      style={{ perspective: 1000 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ 
          transformStyle: "preserve-3d",
          transformOrigin: "center center"
        }}
        animate={isFlipped ? "back" : "front"}
        variants={cardVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Front of card */}
        <motion.div
          className="absolute inset-0 backface-hidden rounded-xl overflow-hidden"
          style={{ backfaceVisibility: "hidden" }}
          variants={glowVariants}
          animate={isHovered ? "hover" : "idle"}
        >
          <div className="relative w-full h-full">
            <Image
              src={card.images.large || card.images.small}
              alt={card.name}
              fill
              className="object-contain"
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
            />
          </div>
          
          {/* Hover Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4"
              >
                <div className="flex items-center justify-between">
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleFlip}
                    className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </motion.button>
                  
                  {onFavoriteToggle && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleFavoriteClick}
                      className={`rounded-full p-2 ${
                        isFavorite ? 'bg-red-500 text-white' : 'bg-white/20 backdrop-blur-sm text-white'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Rarity Badge */}
          {card.rarity && (
            <motion.div
              className="absolute top-2 right-2"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, ...easings.springBouncy }}
            >
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                <span className="text-white text-sm font-medium">{getRaritySymbol(card.rarity)}</span>
              </div>
            </motion.div>
          )}
          
          {/* Price Badge */}
          {card.tcgplayer?.prices && (
            <motion.div
              className="absolute top-2 left-2"
              initial={{ scale: 0, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: 0.3, ...easings.springSmooth }}
            >
              <div className="bg-green-500/80 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-white text-sm font-bold">
                  ${card.tcgplayer.prices.holofoil?.market || card.tcgplayer.prices.normal?.market || 'N/A'}
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Back of card */}
        <motion.div
          className="absolute inset-0 backface-hidden rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 p-6"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div className="h-full flex flex-col text-white">
            <h3 className="text-2xl font-bold mb-4">{card.name}</h3>
            
            <div className="space-y-3 flex-1">
              {card.hp && (
                <div className="flex justify-between">
                  <span className="opacity-80">HP</span>
                  <span className="font-bold">{card.hp}</span>
                </div>
              )}
              
              {card.types && (
                <div className="flex justify-between">
                  <span className="opacity-80">Type</span>
                  <span className="font-bold">{card.types.join(', ')}</span>
                </div>
              )}
              
              {card.artist && (
                <div className="flex justify-between">
                  <span className="opacity-80">Artist</span>
                  <span className="font-bold">{card.artist}</span>
                </div>
              )}
              
              {card.set && (
                <div className="flex justify-between">
                  <span className="opacity-80">Set</span>
                  <span className="font-bold">{card.set.name}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="opacity-80">Number</span>
                <span className="font-bold">#{card.number}</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFlip}
              className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg py-2 px-4 font-medium"
            >
              Flip Back
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default CardFlipAnimation;