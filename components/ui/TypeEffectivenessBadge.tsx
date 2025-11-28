import React from 'react';

type PokemonType = 
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice' 
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug' 
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

interface TypeColorConfig {
  bg: string;
  text: 'white' | 'black';
}

const typeColors: Record<PokemonType, TypeColorConfig> = {
  normal: { bg: '#A8A878', text: 'white' },
  fire: { bg: '#F08030', text: 'white' },
  water: { bg: '#6890F0', text: 'white' },
  electric: { bg: '#F8D030', text: 'black' },
  grass: { bg: '#78C850', text: 'white' },
  ice: { bg: '#98D8D8', text: 'black' },
  fighting: { bg: '#C03028', text: 'white' },
  poison: { bg: '#A040A0', text: 'white' },
  ground: { bg: '#E0C068', text: 'black' },
  flying: { bg: '#A890F0', text: 'white' },
  psychic: { bg: '#F85888', text: 'white' },
  bug: { bg: '#A8B820', text: 'white' },
  rock: { bg: '#B8A038', text: 'white' },
  ghost: { bg: '#705898', text: 'white' },
  dragon: { bg: '#7038F8', text: 'white' },
  dark: { bg: '#705848', text: 'white' },
  steel: { bg: '#B8B8D0', text: 'black' },
  fairy: { bg: '#EE99AC', text: 'black' }
};

interface TypeEffectivenessBadgeProps {
  type: string;
  multiplier: number;
}

export function TypeEffectivenessBadge({ type, multiplier }: TypeEffectivenessBadgeProps) {
  const colors = typeColors[type as PokemonType] || { bg: '#68A090', text: 'white' };
  
  // Format multiplier display
  const getMultiplierDisplay = (): string => {
    switch(multiplier) {
      case 4: return '4×';
      case 2: return '2×';
      case 0.5: return '½';
      case 0.25: return '¼';
      case 0: return '0×';
      default: return '1×';
    }
  };

  return (
    <div className="inline-block relative">
      <div
        className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium pr-8"
        style={{
          backgroundColor: colors.bg,
          minWidth: '100px'
        }}
      >
        <span
          className={`capitalize ${colors.text === 'white' ? 'text-white' : 'text-black'}`}
        >
          {type}
        </span>
      </div>
      {/* Multiplier circle */}
      <div
        className="absolute -right-1 top-1/2 transform -translate-y-1/2 bg-white rounded-full w-7 h-7 flex items-center justify-center border-2 border-stone-200 shadow-sm"
      >
        <span 
          className="font-bold text-black"
          style={{
            fontSize: multiplier === 0.5 || multiplier === 0.25 ? '15px' : '12px'
          }}
        >
          {getMultiplierDisplay()}
        </span>
      </div>
    </div>
  );
}

export default TypeEffectivenessBadge;