/**
 * PokeballLoader - Enhanced Pokemon-themed loading indicator
 *
 * Features Apple-like smooth animations:
 * - Gentle bounce animation (not aggressive spin)
 * - Subtle center glow pulse
 * - Smooth fade-out on load complete
 * - Multiple Pokeball variants
 */

import React, { useState, useEffect, memo } from 'react';
import { cn } from '@/utils/cn';

interface PokeballType {
  name: string;
  topColor: string;
  bottomColor: string;
  glowColor: string;
}

const pokeballTypes: PokeballType[] = [
  { name: 'pokeball', topColor: '#ee1515', bottomColor: '#f5f5f5', glowColor: 'rgba(238, 21, 21, 0.4)' },
  { name: 'greatball', topColor: '#3B82F6', bottomColor: '#f5f5f5', glowColor: 'rgba(59, 130, 246, 0.4)' },
  { name: 'ultraball', topColor: '#78350f', bottomColor: '#fbbf24', glowColor: 'rgba(251, 191, 36, 0.4)' },
  { name: 'masterball', topColor: '#7c3aed', bottomColor: '#f5f5f5', glowColor: 'rgba(124, 58, 237, 0.4)' },
  { name: 'luxuryball', topColor: '#78350f', bottomColor: '#fbbf24', glowColor: 'rgba(251, 191, 36, 0.4)' },
  { name: 'premierball', topColor: '#f5f5f5', bottomColor: '#dc2626', glowColor: 'rgba(220, 38, 38, 0.4)' },
  { name: 'timerball', topColor: '#f5f5f5', bottomColor: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.4)' },
  { name: 'diveball', topColor: '#3b82f6', bottomColor: '#60a5fa', glowColor: 'rgba(96, 165, 250, 0.4)' },
  { name: 'nestball', topColor: '#10b981', bottomColor: '#fde047', glowColor: 'rgba(16, 185, 129, 0.4)' },
  { name: 'healball', topColor: '#ec4899', bottomColor: '#f5f5f5', glowColor: 'rgba(236, 72, 153, 0.4)' }
];

type Size = 'small' | 'medium' | 'large';

interface PokeballLoaderProps {
  size?: Size;
  text?: string;
  randomBall?: boolean;
  isComplete?: boolean;
  minimal?: boolean;
  className?: string;
}

const sizeConfig: Record<Size, { container: string; centerButton: string; borderWidth: number }> = {
  small: { container: 'w-10 h-10', centerButton: 'w-3 h-3', borderWidth: 4 },
  medium: { container: 'w-14 h-14', centerButton: 'w-4 h-4', borderWidth: 5 },
  large: { container: 'w-20 h-20', centerButton: 'w-5 h-5', borderWidth: 6 },
};

export const PokeballLoader = memo(function PokeballLoader({
  size = 'medium',
  text = 'Loading...',
  randomBall = true,
  isComplete = false,
  minimal = false,
  className,
}: PokeballLoaderProps) {
  const [selectedBall, setSelectedBall] = useState<PokeballType>(pokeballTypes[0]);
  const [mounted, setMounted] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (randomBall) {
      const randomIndex = Math.floor(Math.random() * pokeballTypes.length);
      setSelectedBall(pokeballTypes[randomIndex]);
    }
  }, [randomBall]);

  // Handle smooth fade-out when loading completes
  useEffect(() => {
    if (isComplete) {
      setFadeOut(true);
    }
  }, [isComplete]);

  const config = sizeConfig[size];

  // Minimal mode - just the pokeball, no text
  if (minimal) {
    return (
      <div
        className={cn(
          'relative inline-flex items-center justify-center',
          fadeOut && 'animate-fade-out',
          className
        )}
      >
        <div
          className={cn(config.container, 'relative animate-pokeball-bounce')}
          role="status"
          aria-label="Loading"
        >
          {/* Pokeball body */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden shadow-md"
            style={{ border: `${config.borderWidth}px solid #292524` }}
          >
            {/* Top half */}
            <div
              className="absolute top-0 left-0 w-full h-1/2"
              style={{ backgroundColor: selectedBall.topColor }}
            />
            {/* Bottom half */}
            <div
              className="absolute bottom-0 left-0 w-full h-1/2"
              style={{ backgroundColor: selectedBall.bottomColor }}
            />
            {/* Center band */}
            <div
              className="absolute top-1/2 left-0 w-full -translate-y-1/2"
              style={{ height: config.borderWidth, backgroundColor: '#292524' }}
            />
          </div>
          {/* Center button with glow pulse */}
          <div
            className={cn(
              config.centerButton,
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'rounded-full bg-white border-2 border-stone-800',
              'animate-pokeball-glow'
            )}
            style={{
              boxShadow: `0 0 8px 2px ${selectedBall.glowColor}`,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'text-center transition-opacity duration-300 ease-out',
        fadeOut && 'opacity-0',
        className
      )}
    >
      <div className="relative">
        {/* Pokeball with bounce animation */}
        <div className={cn(config.container, 'mx-auto mb-4 relative animate-pokeball-bounce')}>
          {/* Pokeball body */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden shadow-lg"
            style={{ border: `${config.borderWidth}px solid #292524` }}
          >
            {/* Top half */}
            <div
              className="absolute top-0 left-0 w-full h-1/2"
              style={{ backgroundColor: selectedBall.topColor }}
            />
            {/* Bottom half */}
            <div
              className="absolute bottom-0 left-0 w-full h-1/2"
              style={{ backgroundColor: selectedBall.bottomColor }}
            />
            {/* Center band */}
            <div
              className="absolute top-1/2 left-0 w-full -translate-y-1/2"
              style={{ height: config.borderWidth, backgroundColor: '#292524' }}
            />
          </div>
          {/* Center button with glow pulse */}
          <div
            className={cn(
              config.centerButton,
              'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
              'rounded-full bg-white border-2 border-stone-800',
              'animate-pokeball-glow'
            )}
            style={{
              boxShadow: `0 0 12px 3px ${selectedBall.glowColor}`,
            }}
          />
        </div>

        {text && (
          <div className="space-y-1">
            <p className="text-lg font-medium text-stone-700">{text}</p>
            {mounted && (
              <p className="text-sm text-stone-500">
                {selectedBall.name === 'pokeball' && 'Catching wild Pokémon...'}
                {selectedBall.name === 'greatball' && 'Better chance of catching...'}
                {selectedBall.name === 'ultraball' && 'Even better success rate...'}
                {selectedBall.name === 'masterball' && '100% catch rate guaranteed!'}
                {selectedBall.name === 'luxuryball' && 'Catching in style...'}
                {selectedBall.name === 'premierball' && 'Commemorative capture...'}
                {selectedBall.name === 'timerball' && 'The longer the better...'}
                {selectedBall.name === 'diveball' && 'Perfect for water types...'}
                {selectedBall.name === 'nestball' && 'Great for lower levels...'}
                {selectedBall.name === 'healball' && 'Healing while catching...'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

PokeballLoader.displayName = 'PokeballLoader';

export default PokeballLoader;

/**
 * PokemonLoader - Full-page loading state with PokeballLoader
 */
interface PokemonLoaderProps {
  text?: string;
  isComplete?: boolean;
}

export const PokemonLoader = memo(function PokemonLoader({
  text = 'Catching Pokemon...',
  isComplete = false,
}: PokemonLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
      <PokeballLoader size="large" text={text} randomBall isComplete={isComplete} />
    </div>
  );
});

PokemonLoader.displayName = 'PokemonLoader';

/**
 * CardLoader - Full-page loading for card content
 */
interface CardLoaderProps {
  text?: string;
  isComplete?: boolean;
}

export const CardLoader = memo(function CardLoader({
  text = 'Loading cards...',
  isComplete = false,
}: CardLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
      <PokeballLoader size="medium" text={text} randomBall isComplete={isComplete} />
    </div>
  );
});

CardLoader.displayName = 'CardLoader';

/**
 * InlineLoader - Small inline loading indicator
 */
interface InlineLoaderProps {
  className?: string;
}

export const InlineLoader = memo(function InlineLoader({ className }: InlineLoaderProps) {
  return <PokeballLoader size="small" minimal className={className} />;
});

InlineLoader.displayName = 'InlineLoader';