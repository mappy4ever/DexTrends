import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useEnhancedAnimation, easings } from './EnhancedAnimationSystem';

// Types
type Rarity = 'common' | 'uncommon' | 'rare' | 'holo' | 'ultra' | 'secret';
type PackType = 'standard' | 'premium' | 'special';
type TypeName = 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' | 'fighting' | 
                'poison' | 'ground' | 'flying' | 'psychic' | 'bug' | 'rock' | 'ghost' | 
                'dragon' | 'dark' | 'steel' | 'fairy';

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  rarity?: Rarity;
  isActive?: boolean;
  onClick?: () => void;
}

interface FlippableCardProps {
  frontContent: React.ReactNode;
  backContent: React.ReactNode;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
  flipDuration?: number;
}

interface PackOpeningAnimationProps {
  isOpen: boolean;
  onComplete?: () => void;
  children: React.ReactNode;
  packType?: PackType;
}

interface CardStackProps {
  cards?: React.ReactNode[];
  spread?: number;
  rotation?: number;
  className?: string;
}

interface EvolutionAnimationProps {
  stages?: React.ReactNode[];
  currentStage?: number;
  onStageChange?: (stage: number) => void;
  className?: string;
}

interface AnimatedTypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

interface RarityConfig {
  gradient: string;
  shimmerColor: string;
  glowColor: string;
  animate?: boolean;
  rainbow?: boolean;
}

interface PackConfig {
  color: string;
  sparkleColor: string;
}

// Holographic card effect
export const HolographicCard: React.FC<HolographicCardProps> = ({ 
  children, 
  className = '',
  rarity = 'common',
  isActive = false,
  onClick,
}) => {
  const { prefersReducedMotion, enableMicroInteractions } = useEnhancedAnimation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  const rarityConfigs: Record<Rarity, RarityConfig> = {
    common: {
      gradient: 'from-gray-400 to-gray-600',
      shimmerColor: 'rgba(255, 255, 255, 0.3)',
      glowColor: 'rgba(156, 163, 175, 0.4)',
    },
    uncommon: {
      gradient: 'from-green-400 to-emerald-600',
      shimmerColor: 'rgba(34, 197, 94, 0.4)',
      glowColor: 'rgba(34, 197, 94, 0.5)',
    },
    rare: {
      gradient: 'from-blue-400 to-indigo-600',
      shimmerColor: 'rgba(59, 130, 246, 0.5)',
      glowColor: 'rgba(59, 130, 246, 0.6)',
    },
    holo: {
      gradient: 'from-purple-400 via-pink-500 to-blue-500',
      shimmerColor: 'rgba(168, 85, 247, 0.6)',
      glowColor: 'rgba(168, 85, 247, 0.7)',
      animate: true,
    },
    ultra: {
      gradient: 'from-yellow-400 via-orange-500 to-red-600',
      shimmerColor: 'rgba(251, 191, 36, 0.7)',
      glowColor: 'rgba(251, 191, 36, 0.8)',
      animate: true,
    },
    secret: {
      gradient: 'from-pink-400 via-purple-500 to-indigo-600',
      shimmerColor: 'rgba(236, 72, 153, 0.8)',
      glowColor: 'rgba(236, 72, 153, 0.9)',
      animate: true,
      rainbow: true,
    },
  };

  const config = rarityConfigs[rarity] || rarityConfigs.common;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enableMicroInteractions || prefersReducedMotion) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  useEffect(() => {
    if (config.animate && !prefersReducedMotion) {
      controls.start({
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        },
      });
    }
  }, [config.animate, prefersReducedMotion, controls]);

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      whileHover={enableMicroInteractions && !prefersReducedMotion ? {
        scale: 1.05,
        rotateY: 5,
        rotateX: -5,
      } : {}}
      whileTap={enableMicroInteractions && !prefersReducedMotion ? {
        scale: 0.98,
      } : {}}
      transition={easings.springSmooth}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {/* Base card content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Holographic overlay */}
      {enableMicroInteractions && !prefersReducedMotion && (
        <>
          {/* Gradient background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-30`}
            animate={config.animate ? controls : {}}
            style={{
              backgroundSize: '200% 200%',
            }}
          />

          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, ${config.shimmerColor}, transparent)`,
              opacity: 0.6,
            }}
          />

          {/* Rainbow effect for secret rares */}
          {config.rainbow && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                background: 'linear-gradient(45deg, rgba(255,0,0,0.1) 0%, rgba(255,154,0,0.1) 10%, rgba(208,222,33,0.1) 20%, rgba(79,220,74,0.1) 30%, rgba(63,218,216,0.1) 40%, rgba(47,201,226,0.1) 50%, rgba(28,127,238,0.1) 60%, rgba(95,21,242,0.1) 70%, rgba(186,12,248,0.1) 80%, rgba(251,7,217,0.1) 90%, rgba(255,0,0,0.1) 100%)',
                backgroundSize: '200% 200%',
                mixBlendMode: 'overlay',
              }}
            />
          )}

          {/* Glow effect */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  boxShadow: `0 0 30px ${config.glowColor}, 0 0 60px ${config.glowColor}`,
                }}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

// Card flip animation for reveal effects
export const FlippableCard: React.FC<FlippableCardProps> = ({ 
  frontContent, 
  backContent, 
  isFlipped = false,
  onFlip,
  className = '',
  flipDuration = 0.6,
}) => {
  const { prefersReducedMotion, animationSpeed } = useEnhancedAnimation();

  return (
    <div 
      className={`relative ${className}`}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        style={{
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: prefersReducedMotion ? 0.01 : flipDuration / animationSpeed,
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        onClick={onFlip}
      >
        {/* Front face */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
          }}
        >
          {frontContent}
        </div>

        {/* Back face */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {backContent}
        </div>
      </motion.div>
    </div>
  );
};

// Pack opening animation
export const PackOpeningAnimation: React.FC<PackOpeningAnimationProps> = ({ 
  isOpen, 
  onComplete,
  children,
  packType = 'standard',
}) => {
  const { prefersReducedMotion, animationSpeed } = useEnhancedAnimation();
  const [stage, setStage] = useState<'closed' | 'opening' | 'revealing' | 'complete'>('closed');

  const packConfigs: Record<PackType, PackConfig> = {
    standard: {
      color: 'from-blue-500 to-blue-700',
      sparkleColor: 'rgba(59, 130, 246, 0.8)',
    },
    premium: {
      color: 'from-purple-500 to-purple-700',
      sparkleColor: 'rgba(147, 51, 234, 0.8)',
    },
    special: {
      color: 'from-yellow-500 to-orange-600',
      sparkleColor: 'rgba(251, 191, 36, 0.8)',
    },
  };

  const config = packConfigs[packType] || packConfigs.standard;

  useEffect(() => {
    if (isOpen && stage === 'closed') {
      setStage('opening');
      setTimeout(() => {
        setStage('revealing');
        setTimeout(() => {
          setStage('complete');
          onComplete?.();
        }, prefersReducedMotion ? 10 : 1000 / animationSpeed);
      }, prefersReducedMotion ? 10 : 800 / animationSpeed);
    }
  }, [isOpen, stage, onComplete, prefersReducedMotion, animationSpeed]);

  return (
    <AnimatePresence>
      {stage !== 'complete' && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background blur */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Pack wrapper */}
          <motion.div
            className="relative"
            animate={stage === 'opening' ? {
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            } : {}}
            transition={{
              duration: prefersReducedMotion ? 0.01 : 0.8 / animationSpeed,
              ease: easings.easeInOutQuart,
            }}
          >
            {/* Pack */}
            <motion.div
              className={`w-48 h-64 bg-gradient-to-br ${config.color} rounded-lg shadow-2xl`}
              animate={stage === 'revealing' ? {
                scaleY: 0,
                y: -100,
                opacity: 0,
              } : {}}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.5 / animationSpeed,
                ease: easings.easeInOutQuart,
              }}
            />

            {/* Sparkles */}
            {stage === 'opening' && !prefersReducedMotion && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      background: config.sparkleColor,
                      top: '50%',
                      left: '50%',
                    }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 200],
                      y: [0, (Math.random() - 0.5) * 200],
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1 / animationSpeed,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </>
            )}
          </motion.div>

          {/* Cards reveal */}
          {stage === 'revealing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.5 / animationSpeed,
                ease: easings.springBouncy,
              }}
            >
              {children}
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Card stack animation for deck displays
export const CardStack: React.FC<CardStackProps> = ({ 
  cards = [], 
  spread = 20,
  rotation = 5,
  className = '',
}) => {
  const { prefersReducedMotion, enableMicroInteractions } = useEnhancedAnimation();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className={`relative ${className}`}>
      {cards.map((card, index) => {
        const isHovered = hoveredIndex === index;
        const offset = index * spread;
        const rotate = index * rotation;

        return (
          <motion.div
            key={index}
            className="absolute"
            style={{
              zIndex: isHovered ? cards.length + 1 : index,
            }}
            initial={{
              x: offset,
              y: -offset / 2,
              rotate: rotate,
            }}
            animate={enableMicroInteractions && !prefersReducedMotion ? {
              x: isHovered ? offset - 20 : offset,
              y: isHovered ? -offset / 2 - 30 : -offset / 2,
              rotate: isHovered ? 0 : rotate,
              scale: isHovered ? 1.1 : 1,
            } : {}}
            transition={easings.springSmooth}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
          >
            {card}
          </motion.div>
        );
      })}
    </div>
  );
};

// Evolution chain animation
export const EvolutionAnimation: React.FC<EvolutionAnimationProps> = ({ 
  stages = [],
  currentStage = 0,
  onStageChange,
  className = '',
}) => {
  const { prefersReducedMotion, animationSpeed } = useEnhancedAnimation();

  return (
    <div className={`flex items-center justify-center space-x-8 ${className}`}>
      {stages.map((stage, index) => {
        const isActive = index === currentStage;
        const isPast = index < currentStage;

        return (
          <React.Fragment key={index}>
            {/* Evolution stage */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: isPast || isActive ? 1 : 0.3,
                scale: isActive ? 1.2 : 1,
              }}
              transition={{
                duration: prefersReducedMotion ? 0.01 : 0.5 / animationSpeed,
                ease: easings.springBouncy,
              }}
              onClick={() => onStageChange?.(index)}
            >
              {stage}
              
              {/* Glow effect for active stage */}
              {isActive && !prefersReducedMotion && (
                <motion.div
                  className="absolute inset-0 -z-10"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                      '0 0 40px rgba(59, 130, 246, 0.8)',
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                    ],
                  }}
                  transition={{
                    duration: 2 / animationSpeed,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              )}
            </motion.div>

            {/* Evolution arrow */}
            {index < stages.length - 1 && (
              <motion.div
                className="text-gray-400"
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: isPast ? 1 : 0.3,
                  x: 0,
                }}
                transition={{
                  duration: prefersReducedMotion ? 0.01 : 0.3 / animationSpeed,
                  delay: prefersReducedMotion ? 0 : 0.2 / animationSpeed,
                }}
              >
                →
              </motion.div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// Type badge with animation
export const AnimatedTypeBadge: React.FC<AnimatedTypeBadgeProps> = ({ 
  type, 
  size = 'md',
  className = '',
  animated = true,
}) => {
  const { prefersReducedMotion, enableMicroInteractions } = useEnhancedAnimation();

  const typeColors: Record<string, string> = {
    normal: 'from-gray-400 to-gray-500',
    fire: 'from-red-500 to-orange-500',
    water: 'from-blue-500 to-cyan-500',
    electric: 'from-yellow-400 to-yellow-500',
    grass: 'from-green-500 to-emerald-500',
    ice: 'from-cyan-400 to-blue-400',
    fighting: 'from-red-700 to-red-800',
    poison: 'from-purple-500 to-purple-600',
    ground: 'from-yellow-600 to-amber-700',
    flying: 'from-indigo-400 to-blue-500',
    psychic: 'from-pink-500 to-pink-600',
    bug: 'from-lime-500 to-green-500',
    rock: 'from-yellow-800 to-amber-900',
    ghost: 'from-purple-700 to-purple-800',
    dragon: 'from-indigo-700 to-purple-700',
    dark: 'from-gray-800 to-gray-900',
    steel: 'from-gray-500 to-gray-600',
    fairy: 'from-pink-400 to-pink-500',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <motion.div
      className={`
        inline-flex items-center justify-center
        bg-gradient-to-r ${typeColors[type.toLowerCase()] || typeColors.normal}
        text-white font-medium rounded-full
        ${sizes[size] || sizes.md}
        ${className}
      `}
      whileHover={animated && enableMicroInteractions && !prefersReducedMotion ? {
        scale: 1.1,
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
      } : {}}
      whileTap={animated && enableMicroInteractions && !prefersReducedMotion ? {
        scale: 0.95,
      } : {}}
      transition={easings.springBouncy}
    >
      {type}
    </motion.div>
  );
};

const PokemonCardAnimations = {
  HolographicCard,
  FlippableCard,
  PackOpeningAnimation,
  CardStack,
  EvolutionAnimation,
  AnimatedTypeBadge,
};

export default PokemonCardAnimations;