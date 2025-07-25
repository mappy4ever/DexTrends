import React, { memo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import type { Pokemon } from '../../../types/api/pokemon';
import { TypeBadge } from '../TypeBadge';

interface CircularPokemonCardProps {
  pokemon: {
    id: number;
    name: string;
    sprite?: string;
    types?: Array<{ type: { name: string } }>;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

// Size mappings based on design language
const sizeClasses = {
  sm: 'w-24 h-24',      // 96px
  md: 'w-32 h-32',      // 128px - default
  lg: 'w-36 h-36',      // 144px
  xl: 'w-48 h-48'       // 192px - hero
};

// Responsive size classes
const responsiveSizeClasses = {
  sm: 'w-24 h-24 sm:w-28 sm:h-28',
  md: 'w-32 h-32 sm:w-36 sm:h-36',
  lg: 'w-36 h-36 sm:w-40 sm:h-40',
  xl: 'w-40 h-40 sm:w-48 sm:h-48'
};

const CircularPokemonCard = memo(({ 
  pokemon, 
  size = 'md', 
  onClick,
  className = ''
}: CircularPokemonCardProps) => {
  const router = useRouter();
  
  // Get type gradient colors
  const getTypeGradient = () => {
    if (!pokemon.types || pokemon.types.length === 0) {
      return 'from-gray-400 to-gray-500';
    }
    
    const type1 = pokemon.types[0].type.name;
    const type2 = pokemon.types[1]?.type.name;
    
    if (type2) {
      return `from-poke-${type1} to-poke-${type2}`;
    }
    return `from-poke-${type1} to-poke-${type1}`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/pokedex/${pokemon.id}`);
    }
  };

  // Format Pokemon number with padding
  const formatNumber = (num: number) => {
    return `#${String(num).padStart(3, '0')}`;
  };

  return (
    <div className={`group ${className}`}>
      {/* Circular card container with hover effects */}
      <div 
        className={`
          relative ${responsiveSizeClasses[size]} cursor-pointer
          transform transition-all duration-300
          hover:-translate-y-2 hover:scale-110
        `}
        onClick={handleClick}
        data-testid="pokemon-card"
      >
        {/* Outer ring - Type gradient */}
        <div className={`
          absolute inset-0 rounded-full 
          bg-gradient-to-br ${getTypeGradient()}
          p-1 shadow-lg
          group-hover:shadow-xl
          transition-shadow duration-300
        `}>
          {/* Middle ring - White spacing */}
          <div className="w-full h-full rounded-full bg-white p-2">
            {/* Inner circle - Pokemon image */}
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner overflow-hidden">
              {pokemon.sprite ? (
                <Image 
                  src={pokemon.sprite} 
                  alt={pokemon.name}
                  fill
                  className="object-contain p-2"
                  sizes={`(max-width: 640px) ${size === 'sm' ? '96px' : size === 'md' ? '128px' : size === 'lg' ? '144px' : '192px'}, ${size === 'sm' ? '112px' : size === 'md' ? '144px' : size === 'lg' ? '160px' : '192px'}`}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">
                    {pokemon.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating number badge */}
        <div className="
          absolute -top-2 -right-2 
          bg-white rounded-full shadow-md 
          border-2 border-gray-200 
          px-2 py-1
          transform transition-all duration-300
          group-hover:scale-110 group-hover:shadow-lg
        ">
          <span className="text-xs font-mono font-bold text-gray-600">
            {formatNumber(pokemon.id)}
          </span>
        </div>
      </div>
      
      {/* Pokemon name below circle */}
      <div className="text-center mt-3">
        <h3 className="
          font-bold text-sm sm:text-base 
          capitalize text-gray-800
          group-hover:text-pokemon-red
          transition-colors duration-300
        ">
          {pokemon.name}
        </h3>
        {/* Pokemon types */}
        {pokemon.types && pokemon.types.length > 0 && (
          <div className="flex justify-center gap-1 mt-1">
            {pokemon.types.map((type, index) => (
              <TypeBadge
                key={index}
                type={type.type.name}
                size="xs"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

CircularPokemonCard.displayName = 'CircularPokemonCard';

export default CircularPokemonCard;