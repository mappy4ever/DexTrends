import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/utils/cn';
// Glass constants replaced with direct Tailwind classes
const GLASS_BLUR = { sm: 'backdrop-blur-sm', md: 'backdrop-blur-md', lg: 'backdrop-blur-lg' };
const GLASS_OPACITY = { subtle: 'bg-white/60', medium: 'bg-white/80', strong: 'bg-white/95' };
const GLASS_BORDER = { light: 'border-white/20', medium: 'border-white/40' };
const GLASS_SHADOW = { sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg' };
const GLASS_ROUNDED = { sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg' };
const TYPE_GRADIENTS = {
  fire: 'bg-gradient-to-r from-red-500 to-orange-500',
  water: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  grass: 'bg-gradient-to-r from-green-500 to-emerald-500',
  electric: 'bg-gradient-to-r from-yellow-400 to-amber-500',
  psychic: 'bg-gradient-to-r from-pink-500 to-purple-500',
  ice: 'bg-gradient-to-r from-cyan-300 to-blue-400',
  dragon: 'bg-gradient-to-r from-indigo-600 to-purple-600',
  dark: 'bg-gradient-to-r from-gray-700 to-gray-900',
  fairy: 'bg-gradient-to-r from-pink-300 to-rose-400',
};
const createGlassStyle = () => "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20";
import logger from '@/utils/logger';

// Mock card data for demonstrations
const mockCard = {
  id: 'base1-4',
  name: 'Charizard',
  images: {
    small: 'https://images.pokemontcg.io/base1/4.png',
    large: 'https://images.pokemontcg.io/base1/4_hires.png'
  },
  types: ['Fire'],
  hp: '120',
  rarity: 'Rare Holo',
  set: { name: 'Base Set' },
  number: '4',
  artist: 'Mitsuhiro Arita',
  prices: {
    normal: { market: 350.00 },
    holofoil: { market: 2500.00 }
  }
};

// 3D Tilt Card Component
const Card3DTilt: React.FC<{ rarity?: string }> = ({ rarity = 'Common' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for smooth animation
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform motion values to rotation values
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);
  
  // Spring configuration for smooth animation
  const springConfig = { damping: 20, stiffness: 300 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const xPct = (mouseX / width - 0.5) * 200;
    const yPct = (mouseY / height - 0.5) * 200;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div className="perspective-1000 w-64 h-[352px]">
      <motion.div
        ref={cardRef}
        className="relative w-full h-full cursor-pointer preserve-3d"
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className={cn(
          "relative w-full h-full rounded-xl overflow-hidden",
          "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900",
          "shadow-2xl transition-shadow duration-300",
          isHovered && "shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
        )}>
          <Image
            src={mockCard.images.large}
            alt={mockCard.name}
            fill
            className="object-cover pointer-events-none"
            sizes="256px"
            priority
          />
          
          {/* Gradient overlay for depth */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent",
            "transition-opacity duration-300",
            isHovered ? "opacity-40" : "opacity-0"
          )} />
          
          {/* Shine effect overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
                  animate={{
                    x: ['0%', '50%', '0%'],
                    y: ['0%', '50%', '0%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform rotate-45" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Rarity badge */}
          <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <span className="text-white text-xs font-semibold">{rarity}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Holographic Effect Component
const HolographicCard: React.FC<{ rarity: string }> = ({ rarity }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Motion values for mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  const getHolographicGradient = () => {
    switch (rarity) {
      case 'Secret Rare':
        return 'from-pink-500 via-purple-500 to-indigo-500';
      case 'Ultra Rare':
        return 'from-yellow-500 via-red-500 to-purple-500';
      case 'Rare Holo':
        return 'from-blue-500 via-cyan-500 to-teal-500';
      case 'Illustration Rare':
        return 'from-amber-500 via-orange-500 to-red-500';
      default:
        return 'from-gray-400 via-gray-500 to-gray-600';
    }
  };

  // Transform mouse position to gradient position
  const backgroundImage = useTransform(
    [mouseX, mouseY],
    ([latestX, latestY]: number[]) => {
      const x = latestX * 100;
      const y = latestY * 100;
      return `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.3) 0%, transparent 40%)`;
    }
  );

  return (
    <motion.div
      ref={cardRef}
      className="relative w-64 h-[352px] rounded-xl overflow-hidden cursor-pointer group"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Card Image */}
      <div className="relative w-full h-full">
        <Image
          src={mockCard.images.large}
          alt={mockCard.name}
          fill
          className="object-cover"
          sizes="256px"
          priority
        />
        
        {/* Base holographic gradient */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-60 transition-opacity duration-300",
          "bg-gradient-to-br",
          getHolographicGradient(),
          "mix-blend-color-dodge"
        )} />
        
        {/* Dynamic holographic overlay that follows mouse */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"
          style={{ backgroundImage }}
        />
        
        {/* Rainbow shimmer effect */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 opacity-40"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <div 
                className="h-full w-1/2"
                style={{
                  background: `linear-gradient(90deg, 
                    transparent 0%,
                    rgba(255, 0, 0, 0.3) 20%,
                    rgba(255, 255, 0, 0.3) 35%,
                    rgba(0, 255, 0, 0.3) 50%,
                    rgba(0, 255, 255, 0.3) 65%,
                    rgba(0, 0, 255, 0.3) 80%,
                    transparent 100%
                  )`,
                  filter: 'blur(20px)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Foil pattern overlay */}
        <div 
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300",
            "pointer-events-none"
          )}
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 3px,
                rgba(255, 255, 255, 0.1) 3px,
                rgba(255, 255, 255, 0.1) 6px
              ),
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 3px,
                rgba(255, 255, 255, 0.05) 3px,
                rgba(255, 255, 255, 0.05) 6px
              )
            `,
          }}
        />
        
        {/* Sparkle particles for higher rarities */}
        {(rarity === 'Secret Rare' || rarity === 'Ultra Rare') && isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ 
                  x: Math.random() * 256,
                  y: Math.random() * 352,
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
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Rarity badge */}
      <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full">
        <span className="text-white text-xs font-semibold">{rarity}</span>
      </div>
    </motion.div>
  );
};

// Type-based Visual Effects Component
const TypeEffectCard: React.FC<{ type: keyof typeof TYPE_GRADIENTS }> = ({ type }) => {
  const [isActive, setIsActive] = useState(false);

  const getTypeEffect = () => {
    switch (type) {
      case 'fire':
        return (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={isActive ? {
              opacity: [0.4, 0.6, 0.4],
              scale: [1, 1.02, 1],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-radial from-orange-600/40 via-red-600/20 to-transparent" />
            {/* Fire particles */}
            {isActive && Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-orange-400 rounded-full"
                initial={{ 
                  bottom: '10%', 
                  left: `${20 + i * 15}%`,
                  opacity: 0 
                }}
                animate={{
                  bottom: '100%',
                  opacity: [0, 1, 0],
                  x: [0, (i % 2 ? 10 : -10), 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        );
      
      case 'water':
        return (
          <motion.div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            animate={isActive ? {
              opacity: [0.3, 0.5, 0.3],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-radial from-blue-400/30 via-cyan-400/20 to-transparent" />
            {/* Ripple effect */}
            {isActive && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                animate={{
                  scale: [0, 3],
                  opacity: [0.8, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <div className="w-20 h-20 border-2 border-cyan-400 rounded-full" />
              </motion.div>
            )}
          </motion.div>
        );
      
      case 'electric':
        return (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={isActive ? {
              opacity: [0.5, 0.8, 0.5],
            } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-gradient-radial from-yellow-300/40 via-yellow-400/20 to-transparent" />
            {/* Lightning bolts */}
            {isActive && (
              <svg className="absolute inset-0 w-full h-full">
                <motion.path
                  d="M 20 20 L 40 50 L 30 50 L 50 80"
                  stroke="rgba(255, 255, 0, 0.8)"
                  strokeWidth="2"
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: [0, 1, 1],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              </svg>
            )}
          </motion.div>
        );
      
      default:
        return (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={isActive ? {
              opacity: [0.3, 0.5, 0.3],
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-radial",
              `from-${type}-400/30 via-${type}-500/20 to-transparent`
            )} />
          </motion.div>
        );
    }
  };

  return (
    <div
      className="relative w-64 h-88 rounded-xl overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br",
        TYPE_GRADIENTS[type],
        "opacity-20"
      )} />
      
      <div className="relative w-full h-full p-6 flex flex-col items-center justify-center">
        <div className="text-6xl mb-4">
          {type === 'fire' && '🔥'}
          {type === 'water' && '💧'}
          {type === 'grass' && '🌿'}
          {type === 'electric' && '⚡'}
          {type === 'psychic' && '🔮'}
          {type === 'ice' && '❄️'}
          {type === 'dragon' && '🐉'}
          {type === 'dark' && '🌙'}
          {type === 'fairy' && '✨'}
        </div>
        <h3 className="text-2xl font-bold capitalize text-white">{type}</h3>
        <p className="text-white/80 mt-2">Hover for effect</p>
      </div>
      
      {getTypeEffect()}
    </div>
  );
};

// Glass Morphism Variations Component
const GlassVariations: React.FC = () => {
  const variations = [
    { blur: 'sm', opacity: 'subtle', name: 'Subtle Glass' },
    { blur: 'md', opacity: 'medium', name: 'Medium Glass' },
    { blur: 'lg', opacity: 'strong', name: 'Strong Glass' },
    { blur: 'xl', opacity: 'subtle', name: 'Extra Blur' },
    { blur: '2xl', opacity: 'medium', name: 'Heavy Blur' },
    { blur: '3xl', opacity: 'strong', name: 'Maximum Blur' },
  ] as const;

  return (
    <div className="grid grid-cols-3 gap-4">
      {variations.map((variant) => (
        <motion.div
          key={variant.name}
          className={"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">{variant.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Blur: {variant.blur}, Opacity: {variant.opacity}
            </p>
            <div className="mt-4 space-y-2">
              <div className="h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
              <div className="h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full w-3/4" />
              <div className="h-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full w-1/2" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Loading States Component
const LoadingStates: React.FC = () => {
  const [loadingType, setLoadingType] = useState<'skeleton' | 'blur' | 'stagger'>('skeleton');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setLoadingType('skeleton')}
          className={cn(
            "px-4 py-2 rounded-lg transition-colors",
            loadingType === 'skeleton' 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 dark:bg-gray-700"
          )}
        >
          Skeleton
        </button>
        <button
          onClick={() => setLoadingType('blur')}
          className={cn(
            "px-4 py-2 rounded-lg transition-colors",
            loadingType === 'blur' 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 dark:bg-gray-700"
          )}
        >
          Blur-up
        </button>
        <button
          onClick={() => setLoadingType('stagger')}
          className={cn(
            "px-4 py-2 rounded-lg transition-colors",
            loadingType === 'stagger' 
              ? "bg-blue-500 text-white" 
              : "bg-gray-200 dark:bg-gray-700"
          )}
        >
          Stagger
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
            }}
            transition={{
              delay: loadingType === 'stagger' ? i * 0.1 : 0,
              duration: 0.5,
            }}
          >
            {loadingType === 'skeleton' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            )}
            
            {loadingType === 'blur' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700"
                initial={{ filter: 'blur(20px)', scale: 1.1 }}
                animate={{ filter: 'blur(0px)', scale: 1 }}
                transition={{ duration: 0.8, delay: i * 0.05 }}
              />
            )}
            
            {loadingType === 'stagger' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 opacity-20"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main UI Test Page
export default function UITestPage() {
  const [activeSection, setActiveSection] = useState('3d-tilt');

  const sections = [
    { id: '3d-tilt', name: '3D Tilt Cards' },
    { id: 'holographic', name: 'Holographic Effects' },
    { id: 'type-effects', name: 'Type Effects' },
    { id: 'glass', name: 'Glass Morphism' },
    { id: 'loading', name: 'Loading States' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">UI Enhancement Test Page</h1>
        
        {/* Navigation */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "px-6 py-3 rounded-full transition-all duration-300",
                activeSection === section.id
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                  : "bg-white/80 dark:bg-gray-800/80 backdrop-blur hover:scale-102"
              )}
            >
              {section.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
          >
            {activeSection === '3d-tilt' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold mb-4">3D Tilt Card Effects</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Mouse-tracking 3D tilt with spring physics. Move your cursor over the cards to see the effect.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                  <div className="text-center">
                    <h3 className="mb-4 font-semibold">Common Card</h3>
                    <Card3DTilt rarity="Common" />
                  </div>
                  <div className="text-center">
                    <h3 className="mb-4 font-semibold">Rare Card</h3>
                    <Card3DTilt rarity="Rare" />
                  </div>
                  <div className="text-center">
                    <h3 className="mb-4 font-semibold">Ultra Rare</h3>
                    <Card3DTilt rarity="Ultra Rare" />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'holographic' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold mb-4">Holographic & Rarity Effects</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Different holographic effects based on card rarity. Move your mouse over the cards to see the shimmer.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                  <HolographicCard rarity="Rare Holo" />
                  <HolographicCard rarity="Ultra Rare" />
                  <HolographicCard rarity="Secret Rare" />
                  <HolographicCard rarity="Illustration Rare" />
                  <HolographicCard rarity="Common" />
                  <HolographicCard rarity="Uncommon" />
                </div>
              </div>
            )}

            {activeSection === 'type-effects' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold mb-4">Type-Based Visual Effects</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Unique visual effects for each Pokemon type. Hover over the cards to activate the effects.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
                  <TypeEffectCard type="fire" />
                  <TypeEffectCard type="water" />
                  <TypeEffectCard type="electric" />
                  <TypeEffectCard type="psychic" />
                  <TypeEffectCard type="grass" />
                  <TypeEffectCard type="ice" />
                </div>
              </div>
            )}

            {activeSection === 'glass' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold mb-4">Glass Morphism Variations</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Different levels of glass morphism effects with varying blur and opacity.
                </p>
                <GlassVariations />
              </div>
            )}

            {activeSection === 'loading' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold mb-4">Loading States & Animations</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Different loading animations for smooth user experience.
                </p>
                <LoadingStates />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}