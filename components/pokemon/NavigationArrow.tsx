import React from 'react';
import { motion } from 'framer-motion';
import type { PokemonType } from "../../types/pokemon";
import { getTypeUIColors } from '../../utils/pokemonTypeGradients';
import { cn } from '../../utils/cn';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface NavigationArrowProps {
  direction: 'prev' | 'next';
  pokemon: { id: number; name: string; types: PokemonType[] } | null;
  onClick: () => void;
}

const NavigationArrow: React.FC<NavigationArrowProps> = ({ direction, pokemon, onClick }) => {
  if (!pokemon) return null;
  
  const typeColors = getTypeUIColors(pokemon.types || []);
  const isPrev = direction === 'prev';
  
  return (
    <motion.button
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-30 group",
        isPrev ? "left-4" : "right-4"
      )}
      initial={{ opacity: 0, x: isPrev ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      onClick={onClick}
      data-testid={`nav-${direction}`}
    >
      {/* Main arrow button */}
      <div className={cn(
        "relative bg-white/90 dark:bg-stone-800/90 backdrop-blur-md rounded-full p-3",
        "shadow-lg border border-stone-200/50 dark:border-stone-700/50",
        "hover:scale-110 transition-all duration-200"
      )}>
        {isPrev ? (
          <FaChevronLeft className="w-6 h-6 text-stone-700 dark:text-stone-300" />
        ) : (
          <FaChevronRight className="w-6 h-6 text-stone-700 dark:text-stone-300" />
        )}
      </div>
      
      {/* Hover preview card */}
      <motion.div
        className={cn(
          "absolute top-1/2 -translate-y-1/2",
          isPrev ? "right-full mr-2" : "left-full ml-2",
          "pointer-events-none"
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        whileHover={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className={cn(
          "bg-white dark:bg-stone-800 rounded-xl shadow-2xl p-4 min-w-[200px]",
          "border border-stone-200 dark:border-stone-700",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        )}>
          {/* Pokemon preview */}
          <div className="flex items-center gap-3">
            <div className="text-3xl">#{String(pokemon.id).padStart(4, '0')}</div>
            <div className="flex-1">
              <p className="font-semibold capitalize">{pokemon.name.replace(/-/g, ' ')}</p>
              <div className="flex gap-1 mt-1">
                {pokemon.types?.map((typeInfo, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300"
                  >
                    {typeInfo.type.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Direction hint */}
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 text-center">
            {isPrev ? '← Previous' : 'Next →'}
          </div>
        </div>
      </motion.div>
      
      {/* Keyboard hint */}
      <div className={cn(
        "absolute -bottom-8 left-1/2 -translate-x-1/2",
        "text-xs text-stone-400 dark:text-stone-600 whitespace-nowrap",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      )}>
        Press {isPrev ? '←' : '→'}
      </div>
    </motion.button>
  );
};

export default NavigationArrow;