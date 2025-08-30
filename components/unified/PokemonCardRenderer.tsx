import React from 'react';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { useProgressiveImage } from '@/hooks/useProgressiveImage';
import { cn } from '@/utils/cn';

interface PokemonCardProps {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  onClick?: () => void;
  width: number;
  height: number;
  isLegendary?: boolean;
  isMythical?: boolean;
  isStarter?: boolean;
}

/**
 * PokemonCardRenderer - Elegant circular Pokémon card design
 * 
 * Features:
 * - Circular gradient background based on types
 * - Maintains aspect ratio for images
 * - Smooth hover animations
 * - Type badges below the circle
 * - Professional, sophisticated look
 */
export const PokemonCardRenderer: React.FC<PokemonCardProps> = ({
  id,
  name,
  sprite,
  types,
  onClick,
  width,
  height,
  isLegendary,
  isMythical,
  isStarter
}) => {
  const { currentSrc, isLoading } = useProgressiveImage({ src: sprite });
  
  // Get type colors for gradient
  const getTypeGradient = () => {
    const typeColors: Record<string, string> = {
      normal: 'from-gray-400 to-gray-600',
      fire: 'from-orange-400 to-red-600',
      water: 'from-blue-400 to-blue-600',
      electric: 'from-yellow-300 to-yellow-500',
      grass: 'from-green-400 to-green-600',
      ice: 'from-cyan-300 to-blue-400',
      fighting: 'from-red-600 to-red-800',
      poison: 'from-purple-500 to-purple-700',
      ground: 'from-yellow-600 to-amber-700',
      flying: 'from-blue-300 to-indigo-400',
      psychic: 'from-pink-400 to-pink-600',
      bug: 'from-lime-400 to-green-500',
      rock: 'from-yellow-700 to-stone-600',
      ghost: 'from-purple-600 to-indigo-800',
      dragon: 'from-indigo-600 to-purple-700',
      dark: 'from-gray-700 to-gray-900',
      steel: 'from-slate-400 to-slate-600',
      fairy: 'from-pink-300 to-pink-500'
    };
    
    if (types.length === 1) {
      return typeColors[types[0]] || 'from-gray-400 to-gray-600';
    }
    
    // Dual type: use first type as primary gradient
    return typeColors[types[0]] || 'from-gray-400 to-gray-600';
  };
  
  // Calculate circle size (80% of width for padding)
  const circleSize = Math.min(width * 0.8, height * 0.55);
  
  // Special border for legendary/mythical
  const getBorderStyle = () => {
    if (isMythical) return 'ring-2 ring-purple-400 ring-offset-2';
    if (isLegendary) return 'ring-2 ring-yellow-400 ring-offset-2';
    if (isStarter) return 'ring-2 ring-green-400 ring-offset-1';
    return '';
  };
  
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-start group focus:outline-none focus:scale-105 transition-transform"
      style={{ width, height }}
      data-testid={`pokemon-card-${id}`}
    >
      {/* Circular container with gradient background */}
      <div
        className={cn(
          'relative rounded-full overflow-hidden',
          'shadow-lg hover:shadow-xl transition-all duration-300',
          'transform hover:scale-110 active:scale-95',
          'bg-gradient-to-br',
          getTypeGradient(),
          getBorderStyle()
        )}
        style={{
          width: circleSize,
          height: circleSize
        }}
      >
        {/* Dark overlay for better image visibility */}
        <div className="absolute inset-0 bg-black/20" />
        
        {/* Pokémon image */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {isLoading ? (
            <div className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <img
              src={currentSrc}
              alt={name}
              className="w-full h-full object-contain drop-shadow-lg"
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))'
              }}
              loading="lazy"
            />
          )}
        </div>
        
        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors duration-300" />
      </div>
      
      {/* Pokémon info below circle */}
      <div className="mt-2 text-center w-full px-1">
        {/* Number */}
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          #{String(id).padStart(3, '0')}
        </p>
        
        {/* Name */}
        <h3 className="text-sm font-bold text-gray-900 dark:text-white capitalize truncate">
          {name.replace(/-/g, ' ')}
        </h3>
        
        {/* Type badges */}
        <div className="flex justify-center gap-1 mt-1">
          {types.map(type => (
            <TypeBadge 
              key={type} 
              type={type} 
              size="xs"
              className="scale-90"
            />
          ))}
        </div>
      </div>
    </button>
  );
};

// Compact version for smaller grids
export const CompactPokemonCard: React.FC<PokemonCardProps> = ({
  id,
  name,
  sprite,
  types,
  onClick,
  width,
  height
}) => {
  const { currentSrc, isLoading } = useProgressiveImage({ src: sprite });
  
  const getTypeGradient = () => {
    const typeColors: Record<string, string> = {
      normal: 'from-gray-300 to-gray-500',
      fire: 'from-orange-300 to-red-500',
      water: 'from-blue-300 to-blue-500',
      electric: 'from-yellow-200 to-yellow-400',
      grass: 'from-green-300 to-green-500',
      ice: 'from-cyan-200 to-blue-300',
      fighting: 'from-red-500 to-red-700',
      poison: 'from-purple-400 to-purple-600',
      ground: 'from-yellow-500 to-amber-600',
      flying: 'from-blue-200 to-indigo-300',
      psychic: 'from-pink-300 to-pink-500',
      bug: 'from-lime-300 to-green-400',
      rock: 'from-yellow-600 to-stone-500',
      ghost: 'from-purple-500 to-indigo-700',
      dragon: 'from-indigo-500 to-purple-600',
      dark: 'from-gray-600 to-gray-800',
      steel: 'from-slate-300 to-slate-500',
      fairy: 'from-pink-200 to-pink-400'
    };
    
    return typeColors[types[0]] || 'from-gray-300 to-gray-500';
  };
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'shadow-md hover:shadow-lg transition-all duration-200',
        'transform hover:scale-105 active:scale-95',
        'bg-gradient-to-br',
        getTypeGradient(),
        'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500'
      )}
      style={{ width, height }}
      data-testid={`pokemon-compact-${id}`}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />
      
      {/* Pokémon sprite */}
      <div className="absolute inset-0 flex items-center justify-center p-3">
        {isLoading ? (
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <img
            src={currentSrc}
            alt={name}
            className="w-full h-full object-contain drop-shadow-md"
            loading="lazy"
          />
        )}
      </div>
      
      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
        <p className="text-[10px] text-white/80 font-medium">
          #{String(id).padStart(3, '0')}
        </p>
        <h3 className="text-xs font-bold text-white capitalize truncate">
          {name.replace(/-/g, ' ')}
        </h3>
        
        {/* Mini type badges */}
        <div className="flex justify-center gap-0.5 mt-1">
          {types.map(type => (
            <span
              key={type}
              className="px-1.5 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[9px] font-medium text-white"
            >
              {type.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};