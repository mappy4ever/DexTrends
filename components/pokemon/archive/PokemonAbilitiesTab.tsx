/**
 * Pokemon Abilities Tab Component
 * Displays Pokemon abilities with descriptions
 */

import React from 'react';
import { FadeIn } from '../ui/animations/animations';
import type { Pokemon } from "../../types/pokemon";

interface DetailedAbility {
  name: string;
  is_hidden: boolean;
  description: string;
}

interface PokemonAbilitiesTabProps {
  pokemonDetails: Pokemon | null;
  detailedAbilities: DetailedAbility[];
}

const PokemonAbilitiesTab: React.FC<PokemonAbilitiesTabProps> = ({ pokemonDetails, detailedAbilities }) => {
  return (
    <FadeIn>
      <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
        <h3 className="text-2xl font-bold text-stone-900 dark:text-white mb-6">Abilities</h3>
        
        {detailedAbilities.length > 0 ? (
          <div className="space-y-4">
            {detailedAbilities.map((ability, index) => (
              <div key={ability.name} className={`glass-elevated rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl ${
                ability.is_hidden 
                  ? 'border-l-amber-500 bg-gradient-to-r from-amber-50 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/20' 
                  : 'border-l-amber-500 bg-gradient-to-r from-amber-50 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/20'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-lg capitalize text-stone-900 dark:text-white">
                    {ability.name.replace('-', ' ')}
                  </h4>
                  {ability.is_hidden && (
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 text-xs px-3 py-1 rounded-full font-semibold">
                      Hidden
                    </span>
                  )}
                </div>
                
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed text-sm">
                  {ability.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {pokemonDetails?.abilities?.map((ability, index) => (
              <div key={ability.ability.name} className={`glass-elevated rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl ${
                ability.is_hidden 
                  ? 'border-l-amber-500 bg-gradient-to-r from-amber-50 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/20' 
                  : 'border-l-amber-500 bg-gradient-to-r from-amber-50 to-amber-50 dark:from-amber-900/20 dark:to-amber-900/20'
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-lg capitalize text-stone-900 dark:text-white">
                    {ability.ability.name.replace('-', ' ')}
                  </h4>
                  {ability.is_hidden && (
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 text-xs px-3 py-1 rounded-full font-semibold">
                      Hidden
                    </span>
                  )}
                </div>
                
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-stone-300 dark:bg-stone-600 rounded w-full"></div>
                  <div className="h-4 bg-stone-300 dark:bg-stone-600 rounded w-3/4"></div>
                </div>
                <p className="text-stone-500 dark:text-stone-300 text-sm mt-2 italic">
                  Loading ability description...
                </p>
              </div>
            )) || (
              <div className="text-center py-12">
                <p className="text-stone-500 dark:text-stone-300">No abilities data available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </FadeIn>
  );
};

export default PokemonAbilitiesTab;