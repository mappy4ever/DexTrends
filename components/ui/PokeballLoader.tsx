import React, { useState, useEffect } from 'react';

interface PokeballType {
  name: string;
  topColor: string;
  bottomColor: string;
}

const pokeballTypes: PokeballType[] = [
  { name: 'pokeball', topColor: '#ee1515', bottomColor: '#f5f5f5' },
  { name: 'greatball', topColor: '#3B82F6', bottomColor: '#f5f5f5' },
  { name: 'ultraball', topColor: '#1f2937', bottomColor: '#fbbf24' },
  { name: 'masterball', topColor: '#7c3aed', bottomColor: '#f5f5f5' },
  { name: 'luxuryball', topColor: '#1f2937', bottomColor: '#fbbf24' },
  { name: 'premierball', topColor: '#f5f5f5', bottomColor: '#dc2626' },
  { name: 'timerball', topColor: '#f5f5f5', bottomColor: '#ef4444' },
  { name: 'diveball', topColor: '#3b82f6', bottomColor: '#60a5fa' },
  { name: 'nestball', topColor: '#10b981', bottomColor: '#fde047' },
  { name: 'healball', topColor: '#ec4899', bottomColor: '#f5f5f5' }
];

type Size = 'small' | 'medium' | 'large';

interface PokeballLoaderProps {
  size?: Size;
  text?: string;
  randomBall?: boolean;
}

export default function PokeballLoader({ 
  size = 'medium', 
  text = 'Loading...', 
  randomBall = true 
}: PokeballLoaderProps) {
  // Start with default pokeball to avoid hydration mismatch
  const [selectedBall, setSelectedBall] = useState<PokeballType>(pokeballTypes[0]);
  const [mounted, setMounted] = useState(false);

  // Only randomize after mounting on client
  useEffect(() => {
    setMounted(true);
    if (randomBall) {
      const randomIndex = Math.floor(Math.random() * pokeballTypes.length);
      setSelectedBall(pokeballTypes[randomIndex]);
    }
  }, [randomBall]);

  const sizeClasses: Record<Size, string> = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  return (
    <div className="text-center">
      <div className="relative">
        {/* Pokeball animation - matching pokedex page exactly */}
        <div className={`${sizeClasses[size]} mx-auto mb-6 relative`}>
          <div className={`${sizeClasses[size]} border-8 border-gray-200 rounded-full animate-spin`}>
            <div className={`absolute top-0 left-0 w-full h-1/2 rounded-t-full`} style={{ backgroundColor: selectedBall.topColor }}></div>
            <div className={`absolute bottom-0 left-0 w-full h-1/2 rounded-b-full border-t-4 border-gray-800`} style={{ backgroundColor: selectedBall.bottomColor }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-gray-800 rounded-full"></div>
          </div>
        </div>
        
        {text && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{text}</h2>
            <p className="text-gray-600">
              {mounted ? (
                <>
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
                </>
              ) : 'Catching wild Pokémon...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export a more specific Pokemon-themed loader
interface PokemonLoaderProps {
  text?: string;
}

export function PokemonLoader({ text = "Catching Pokemon..." }: PokemonLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center">
      <PokeballLoader size="large" text={text} randomBall={true} />
    </div>
  );
}

// Export a card loading component
interface CardLoaderProps {
  text?: string;
}

export function CardLoader({ text = "Loading cards..." }: CardLoaderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 flex items-center justify-center">
      <PokeballLoader size="medium" text={text} randomBall={true} />
    </div>
  );
}