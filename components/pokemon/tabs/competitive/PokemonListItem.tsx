import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '../../../../utils/cn';
import { getPokemonIdFromName, formatPokedexNumber } from '../../../../utils/pokemonNameIdMap';

interface PokemonListItemProps {
  name: string;
  value: number;
  valueLabel: string;
  isCounter?: boolean;
  onClick: () => void;
}

export const PokemonListItem: React.FC<PokemonListItemProps> = ({ 
  name, 
  value, 
  valueLabel, 
  isCounter = false, 
  onClick 
}) => {
  // Get Pokemon ID from name using utility
  const pokemonId = getPokemonIdFromName(name);
  const spriteUrl = pokemonId 
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`; // Default to Pikachu

  const getValueColor = () => {
    if (isCounter) {
      if (value >= 70) return 'from-red-500 to-red-700';
      if (value >= 60) return 'from-orange-500 to-red-600';
      return 'from-yellow-500 to-orange-600';
    } else {
      if (value >= 40) return 'from-green-500 to-emerald-600';
      if (value >= 30) return 'from-blue-500 to-green-500';
      return 'from-gray-500 to-blue-500';
    }
  };

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 dark:bg-gray-800/50 hover:bg-white/10 dark:hover:bg-gray-800 transition-all cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Pokemon Image */}
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-white/5 p-1">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
          <Image
            src={spriteUrl}
            alt={name}
            width={64}
            height={64}
            className="object-contain scale-110"
          />
        </div>
      </div>
      
      {/* Name and Stats */}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{name.replace('-', ' ')}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {pokemonId ? formatPokedexNumber(pokemonId) : '#???'}
        </p>
      </div>
      
      {/* Value Badge */}
      <div className={cn(
        "px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r whitespace-nowrap",
        getValueColor()
      )}>
        {value}% {valueLabel}
      </div>
    </motion.div>
  );
};