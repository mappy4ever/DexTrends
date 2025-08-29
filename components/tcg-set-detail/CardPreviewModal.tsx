import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import { RarityBadge } from './RarityBadge';
import { use3DTiltCard, getHolographicGradient } from '@/hooks/use3DTiltCard';
import type { TCGCard } from '@/types/api/cards';

interface CardPreviewModalProps {
  card: TCGCard | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onToggleOwned?: (cardId: string) => void;
  onToggleWishlist?: (cardId: string) => void;
  isOwned?: boolean;
  isWishlisted?: boolean;
}

export const CardPreviewModal: React.FC<CardPreviewModalProps> = ({
  card,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  onToggleOwned,
  onToggleWishlist,
  isOwned = false,
  isWishlisted = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'prices' | 'abilities'>('details');
  
  // 3D Tilt and Holographic effects
  const {
    cardRef,
    isHovered,
    rotateX,
    rotateY,
    scale,
    holoX,
    holoY,
    holoOpacity,
    shimmerX,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    shouldShowHolo,
    holoIntensity,
    particleCount
  } = use3DTiltCard({
    rarity: card?.rarity,
    enableHolo: true,
    maxRotation: 15
  });
  
  // Create shimmer position as a percentage string
  const [shimmerPosition, setShimmerPosition] = useState('0%');
  useEffect(() => {
    if (shimmerX) {
      const unsubscribe = shimmerX.on('change', (value) => {
        setShimmerPosition(`${value}%`);
      });
      return unsubscribe;
    }
    return undefined;
  }, [shimmerX]);
  
  // Reset state when card changes
  useEffect(() => {
    if (card) {
      setImageLoaded(false);
      setActiveTab('details');
    }
  }, [card?.id]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrevious) onPrevious?.();
          break;
        case 'ArrowRight':
          if (hasNext) onNext?.();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious, hasNext, hasPrevious]);
  
  if (!card) return null;
  
  const price = card.tcgplayer?.prices
    ? Object.values(card.tcgplayer.prices)[0]?.market || 0
    : 0;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[900px] md:max-h-[600px] z-50"
          >
            <div className={cn(
              'w-full h-full rounded-2xl overflow-hidden',
              createGlassStyle({
                blur: 'xl',
                opacity: 'strong',
                border: 'strong',
                rounded: 'xl',
                shadow: 'xl'
              }),
              'bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-900/95 dark:to-gray-800/95'
            )}>
              <div className="flex flex-col md:flex-row h-full">
                {/* Left side - Card image with 3D tilt */}
                <div 
                  className="relative md:w-[400px] p-6 flex items-center justify-center bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20 perspective-1000"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Navigation arrows */}
                  {hasPrevious && (
                    <button
                      onClick={onPrevious}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors z-10"
                    >
                      <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  
                  {hasNext && (
                    <button
                      onClick={onNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition-colors z-10"
                    >
                      <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  
                  {/* Card image with 3D tilt and holographic effects */}
                  <motion.div
                    ref={cardRef}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: imageLoaded ? 1 : 0.5 }}
                    style={{
                      rotateX,
                      rotateY,
                      scale,
                      transformStyle: 'preserve-3d'
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative w-full max-w-[280px] aspect-[2.5/3.5] preserve-3d"
                  >
                    <div className="relative w-full h-full rounded-lg overflow-hidden">
                      <Image
                        src={card.images.large}
                        alt={card.name}
                        fill
                        className="object-contain rounded-lg"
                        sizes="280px"
                        priority
                        onLoad={() => setImageLoaded(true)}
                      />
                      
                      {/* Holographic overlay that moves with tilt */}
                      {shouldShowHolo && (
                        <>
                          {/* Base holographic gradient */}
                          <motion.div
                            className={cn(
                              "absolute inset-0 rounded-lg mix-blend-color-dodge pointer-events-none",
                              "bg-gradient-to-br",
                              getHolographicGradient(card.rarity || 'Common')
                            )}
                            style={{ opacity: holoOpacity }}
                          />
                          
                          {/* Dynamic light reflection that follows tilt */}
                          <motion.div
                            className="absolute inset-0 rounded-lg pointer-events-none"
                            style={{
                              background: `radial-gradient(circle at ${holoX}% ${holoY}%, rgba(255,255,255,${holoIntensity * 0.4}) 0%, transparent 50%)`,
                              mixBlendMode: 'overlay'
                            }}
                          />
                          
                          {/* Rainbow shimmer effect */}
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                className="absolute inset-0 rounded-lg pointer-events-none"
                                initial={{ x: '-100%' }}
                                animate={{ x: shimmerPosition }}
                                transition={{ duration: 0.6 }}
                              >
                                <div 
                                  className="h-full w-1/2"
                                  style={{
                                    background: `linear-gradient(90deg, 
                                      transparent 0%,
                                      rgba(255, 0, 0, ${holoIntensity * 0.3}) 20%,
                                      rgba(255, 255, 0, ${holoIntensity * 0.3}) 35%,
                                      rgba(0, 255, 0, ${holoIntensity * 0.3}) 50%,
                                      rgba(0, 255, 255, ${holoIntensity * 0.3}) 65%,
                                      rgba(0, 0, 255, ${holoIntensity * 0.3}) 80%,
                                      transparent 100%
                                    )`,
                                    filter: 'blur(20px)',
                                    mixBlendMode: 'screen'
                                  }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          {/* Foil texture overlay */}
                          <div 
                            className="absolute inset-0 rounded-lg pointer-events-none"
                            style={{
                              opacity: isHovered ? holoIntensity * 0.3 : 0,
                              backgroundImage: `
                                repeating-linear-gradient(
                                  45deg,
                                  transparent,
                                  transparent 3px,
                                  rgba(255, 255, 255, 0.1) 3px,
                                  rgba(255, 255, 255, 0.1) 6px
                                )
                              `,
                              transition: 'opacity 0.3s ease'
                            }}
                          />
                          
                          {/* Sparkle particles for rare cards */}
                          {particleCount > 0 && isHovered && (
                            <div className="absolute inset-0 rounded-lg pointer-events-none">
                              {Array.from({ length: particleCount }).map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1 h-1 bg-white rounded-full"
                                  initial={{ 
                                    x: Math.random() * 280,
                                    y: Math.random() * 392,
                                    scale: 0,
                                    opacity: 0
                                  }}
                                  animate={{
                                    scale: [0, 1.5, 0],
                                    opacity: [0, 1, 0],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeOut"
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                      
                      {!imageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  {/* Quick action buttons */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-center gap-2">
                    <button
                      onClick={() => onToggleOwned?.(card.id)}
                      className={cn(
                        'p-2 rounded-lg backdrop-blur-sm transition-all duration-200',
                        isOwned
                          ? 'bg-green-500/80 text-white hover:bg-green-600/80'
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                      )}
                      title={isOwned ? 'Remove from collection' : 'Add to collection'}
                    >
                      <svg className="w-5 h-5" fill={isOwned ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => onToggleWishlist?.(card.id)}
                      className={cn(
                        'p-2 rounded-lg backdrop-blur-sm transition-all duration-200',
                        isWishlisted
                          ? 'bg-red-500/80 text-white hover:bg-red-600/80'
                          : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700'
                      )}
                      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <svg className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Right side - Card details */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{card.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                          <RarityBadge rarity={card.rarity || 'Common'} size="sm" showLabel />
                          <span className="text-sm text-gray-500">#{card.number}/{card.set?.printedTotal}</span>
                          {card.set && (
                            <span className="text-sm text-gray-500">• {card.set.name}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Close button */}
                      <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Price display */}
                    {price > 0 && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Market Price:</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${price.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex items-center gap-1 p-2 border-b border-gray-200/50 dark:border-gray-700/50">
                    {['details', 'prices', 'abilities'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                          activeTab === tab
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  {/* Tab content */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <AnimatePresence mode="wait">
                      {activeTab === 'details' && (
                        <motion.div
                          key="details"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          {/* Card types and HP */}
                          <div className="grid grid-cols-2 gap-4">
                            {card.types && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Types</p>
                                <div className="flex gap-1">
                                  {card.types.map(type => (
                                    <span key={type} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {card.hp && (
                              <div>
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">HP</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{card.hp}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Additional details */}
                          <div className="space-y-2">
                            {card.artist && (
                              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Artist</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{card.artist}</span>
                              </div>
                            )}
                            {card.set && (
                              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Set</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{card.set.name}</span>
                              </div>
                            )}
                            {card.set?.releaseDate && (
                              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Release Date</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {new Date(card.set.releaseDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                      
                      {activeTab === 'prices' && (
                        <motion.div
                          key="prices"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-3"
                        >
                          {card.tcgplayer?.prices ? (
                            Object.entries(card.tcgplayer.prices).map(([type, prices]: [string, any]) => (
                              <div key={type} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 capitalize">
                                  {type.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                  {prices.low && (
                                    <div>
                                      <p className="text-xs text-gray-500">Low</p>
                                      <p className="text-sm font-semibold">${prices.low.toFixed(2)}</p>
                                    </div>
                                  )}
                                  {prices.mid && (
                                    <div>
                                      <p className="text-xs text-gray-500">Mid</p>
                                      <p className="text-sm font-semibold">${prices.mid.toFixed(2)}</p>
                                    </div>
                                  )}
                                  {prices.high && (
                                    <div>
                                      <p className="text-xs text-gray-500">High</p>
                                      <p className="text-sm font-semibold">${prices.high.toFixed(2)}</p>
                                    </div>
                                  )}
                                  {prices.market && (
                                    <div>
                                      <p className="text-xs text-gray-500">Market</p>
                                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                        ${prices.market.toFixed(2)}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No price data available</p>
                          )}
                        </motion.div>
                      )}
                      
                      {activeTab === 'abilities' && (
                        <motion.div
                          key="abilities"
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          {card.abilities && card.abilities.length > 0 ? (
                            card.abilities.map((ability, index) => (
                              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                    {ability.type}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {ability.name}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{ability.text}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No abilities</p>
                          )}
                          
                          {card.attacks && card.attacks.length > 0 && (
                            <>
                              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4">Attacks</h4>
                              {card.attacks.map((attack, index) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {attack.name}
                                    </span>
                                    {attack.damage && (
                                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                        {attack.damage}
                                      </span>
                                    )}
                                  </div>
                                  {attack.text && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{attack.text}</p>
                                  )}
                                  {attack.cost && (
                                    <div className="flex gap-1 mt-2">
                                      {attack.cost.map((cost, i) => (
                                        <span key={i} className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                                          {cost}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CardPreviewModal;