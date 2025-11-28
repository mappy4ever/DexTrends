import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { SlideUp, CardHover } from '../../ui/animations/animations';
import { TypeBadge } from '../../ui/TypeBadge';
import { BsStars } from 'react-icons/bs';
import type { StarterData } from './types';
import { getTypeGradient, getFirstEvolution } from './utils';
import { getEvolutionChain } from './starterData';

interface StarterCardProps {
  starterName: string;
  starter: StarterData;
  index: number;
  isSelected: boolean;
  theme: string;
  onSelect: (name: string) => void;
}

export const StarterCard: React.FC<StarterCardProps> = ({
  starterName,
  starter,
  index,
  isSelected,
  theme,
  onSelect
}) => {
  const router = useRouter();
  const evolutionChain = getEvolutionChain(starterName);
  const firstPokemon = getFirstEvolution(evolutionChain);

  return (
    <SlideUp delay={index * 0.1}>
      <CardHover>
        <div 
          className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
            isSelected ? 'ring-4 ring-amber-500 scale-105' : ''
          } ${theme === 'dark' ? 'bg-stone-900' : 'bg-stone-50'}`}
          onClick={() => onSelect(starterName)}
        >
          {/* Type-based gradient background */}
          <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${getTypeGradient(starter.types?.[0])}`} />

          {/* Content */}
          <div className="relative p-6">
            {/* Pokemon Number */}
            <div className="absolute top-4 right-4 text-4xl font-bold opacity-10">
              #{starter.number}
            </div>

            {/* Pokemon Image */}
            <div className="relative w-48 h-48 mx-auto mb-4">
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${firstPokemon?.id || 1}.png`}
                alt={starterName}
                fill
                className="object-contain drop-shadow-2xl hover:scale-110 transition-transform"
              />
            </div>

            {/* Pokemon Info */}
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-bold">{starterName}</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400">{starter.species}</p>
              
              {/* Types */}
              <div className="flex justify-center gap-2">
                {starter.types?.map((type) => (
                  <TypeBadge key={type} type={type} size="md" />
                ))}
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 pt-4">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-stone-800' : 'bg-white'}`}>
                  <p className="text-xs text-stone-500">Height</p>
                  <p className="font-semibold">{starter.height}</p>
                </div>
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-stone-800' : 'bg-white'}`}>
                  <p className="text-xs text-stone-500">Weight</p>
                  <p className="font-semibold">{starter.weight}</p>
                </div>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center justify-center gap-1 text-amber-500 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (firstPokemon) {
                      router.push(`/pokedex/${firstPokemon.id}`);
                    }
                  }}
                >
                  <BsStars />
                  <span className="font-semibold text-xs">Explore in Pokédex →</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </CardHover>
    </SlideUp>
  );
};