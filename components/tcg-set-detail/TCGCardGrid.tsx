import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Image from 'next/image';
import { TCGCard } from '../../types/api/cards';
// FlippableTCGCard removed - use TCGCard component instead
import { InteractiveCard, easings, useEnhancedAnimation } from '../ui/EnhancedAnimationSystem';
import { getRaritySymbol } from '../../utils/tcgRaritySymbols';
import hapticFeedback from '../../utils/hapticFeedback';

// CardFlipAnimation component - inline implementation
interface CardFlipAnimationProps {
  card: TCGCard;
  isFlipped: boolean;
  onFlip: () => void;
  onCardClick: (card: TCGCard) => void;
  isFavorite: boolean;
  onFavoriteToggle?: (card: TCGCard) => void;
}

const CardFlipAnimation: React.FC<CardFlipAnimationProps> = ({
  card,
  isFlipped,
  onFlip,
  onCardClick,
  isFavorite,
  onFavoriteToggle
}) => {
  return (
    <motion.div
      className="relative w-full h-full cursor-pointer"
      style={{ perspective: 1000 }}
      onClick={() => onCardClick(card)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <Image
            src={card.images?.small || card.images?.large || ''}
            alt={card.name}
            fill
            className="object-cover"
            loading="lazy"
          />
          {/* Favorite button */}
          {onFavoriteToggle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteToggle(card);
              }}
              className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                isFavorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/80 text-gray-600 hover:bg-red-100'
              }`}
            >
              <svg className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          )}
          {/* Flip button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/80 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Flip card"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        {/* Back of card - Info */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 p-3 flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div>
            <h4 className="text-white font-bold text-sm truncate">{card.name}</h4>
            <p className="text-gray-400 text-xs mt-1">#{card.number}</p>
            {card.rarity && (
              <p className="text-purple-400 text-xs mt-1">{getRaritySymbol(card.rarity)} {card.rarity}</p>
            )}
          </div>
          {card.tcgplayer?.prices && (
            <div className="text-green-400 font-bold text-lg">
              ${card.tcgplayer.prices.holofoil?.market || card.tcgplayer.prices.normal?.market || 'N/A'}
            </div>
          )}
          {/* Flip back button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            title="Flip card"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface TCGCardGridProps {
  cards: TCGCard[];
  onCardClick: (card: TCGCard) => void;
  onFavoriteToggle?: (card: TCGCard) => void;
  favorites?: TCGCard[];
  viewMode?: 'grid' | 'list';
  className?: string;
}

export const TCGCardGrid: React.FC<TCGCardGridProps> = ({
  cards,
  onCardClick,
  onFavoriteToggle,
  favorites = [],
  viewMode = 'grid',
  className = ''
}) => {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { enableMicroInteractions } = useEnhancedAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  const handleCardFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const isFavorite = (card: TCGCard) => {
    return favorites.some(fav => fav.id === card.id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: easings.springSmooth
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: easings.springSmooth
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        ref={containerRef}
        className={`space-y-4 ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            variants={listItemVariants}
            custom={index}
            whileHover={{ x: 10 }}
            onClick={() => {
              hapticFeedback.buttonTap();
              onCardClick(card);
            }}
            className="cursor-pointer"
          >
            <InteractiveCard
              enableTilt={false}
              enableGlow={true}
              glowColor="rgba(168, 85, 247, 0.2)"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-4">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={easings.spring}
                  >
                    <div className="relative w-20 h-28">
                      <Image
                        src={card.images.small}
                        alt={card.name}
                        width={80}
                        height={112}
                        className="object-contain rounded-lg shadow-lg"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R"
                      />
                    </div>
                    {enableMicroInteractions && hoveredCard === card.id && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </motion.div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {card.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>#{card.number}</span>
                      {card.rarity && (
                        <span className="flex items-center gap-1">
                          {getRaritySymbol(card.rarity)} {card.rarity}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {card.tcgplayer?.prices && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, ...easings.springBouncy }}
                      >
                        <p className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                          ${card.tcgplayer.prices.holofoil?.market || 
                            card.tcgplayer.prices.normal?.market || 'N/A'}
                        </p>
                      </motion.div>
                    )}
                  </div>
                  
                  {onFavoriteToggle && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFavoriteToggle(card);
                      }}
                      className={`p-2 rounded-full ${
                        isFavorite(card) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <svg className="w-5 h-5" fill={isFavorite(card) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              </div>
            </InteractiveCard>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Grid view with flip animations
  return (
    <motion.div
      ref={containerRef}
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          variants={cardVariants}
          custom={index}
          onMouseEnter={() => setHoveredCard(card.id)}
          onMouseLeave={() => setHoveredCard(null)}
          className="relative aspect-[63/88]"
        >
          <CardFlipAnimation
            card={card}
            isFlipped={flippedCards.has(card.id)}
            onFlip={() => handleCardFlip(card.id)}
            onCardClick={onCardClick}
            isFavorite={isFavorite(card)}
            onFavoriteToggle={onFavoriteToggle}
          />
          
          {/* Hover Effects */}
          <AnimatePresence>
            {enableMicroInteractions && hoveredCard === card.id && !flippedCards.has(card.id) && (
              <>
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-transparent rounded-xl blur-xl" />
                </motion.div>
                
                {/* Particle effects for rare cards */}
                {card.rarity && ['Rare', 'Ultra Rare', 'Secret Rare'].includes(card.rarity) && (
                  <motion.div className="absolute inset-0 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                        initial={{ 
                          x: Math.random() * 100 - 50,
                          y: Math.random() * 100 - 50,
                          scale: 0
                        }}
                        animate={{
                          x: Math.random() * 200 - 100,
                          y: Math.random() * 200 - 100,
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default TCGCardGrid;