import React from 'react';
import type { Pokemon, PokemonSpecies } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import { TypeEffectivenessBadge } from '../../ui/TypeEffectivenessBadge';
import { typeEffectiveness } from '../../../utils/pokemonutils';
import { formatEggGroups } from '../../../utils/pokemonDetailUtils';
import { cn } from '../../../utils/cn';

interface OverviewTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  abilities: Record<string, any>;
  typeColors: any;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ 
  pokemon, 
  species, 
  abilities,
  typeColors 
}) => {
  // Get type effectiveness
  const getTypeEffectiveness = () => {
    if (!pokemon?.types) return { weaknesses: [], resistances: [], immunities: [] };
    
    const typeNames = pokemon.types.map(t => t.type.name);
    const weaknesses = new Set<string>();
    const resistances = new Set<string>();
    const immunities = new Set<string>();
    
    typeNames.forEach(typeName => {
      const typeData = typeEffectiveness[typeName.toLowerCase()];
      if (!typeData) return;
      
      typeData.weakTo.forEach(weak => weaknesses.add(weak));
      typeData.resistantTo.forEach(resist => resistances.add(resist));
      typeData.immuneTo.forEach(immune => immunities.add(immune));
    });
    
    const finalWeaknesses = Array.from(weaknesses).filter(type => !resistances.has(type) && !immunities.has(type));
    const finalResistances = Array.from(resistances).filter(type => !weaknesses.has(type));
    
    return {
      weaknesses: finalWeaknesses,
      resistances: finalResistances,
      immunities: Array.from(immunities)
    };
  };
  
  // Get flavor text
  const getFlavorText = () => {
    if (!species?.flavor_text_entries) return 'No description available.';
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    return englishEntry ? englishEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.';
  };
  
  const effectiveness = getTypeEffectiveness();
  
  return (
    <div className="space-y-6">
      {/* Combined Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pokedex Entry - Takes up 1 column on lg screens */}
        <PokemonGlassCard variant="default" pokemonTypes={pokemon.types} className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-2">Pokédex Entry</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {getFlavorText()}
          </p>
        </PokemonGlassCard>
        
        {/* Biological Info */}
        <PokemonGlassCard variant="compact" pokemonTypes={pokemon.types}>
          <h4 className="font-medium text-sm mb-2">Biological Info</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Species</span>
              <span className="font-medium">
                {species.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Habitat</span>
              <span className="font-medium capitalize">
                {species.habitat?.name.replace(/-/g, ' ') || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Shape</span>
              <span className="font-medium capitalize">
                {species.shape?.name.replace(/-/g, ' ') || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Color</span>
              <span className="font-medium capitalize">
                {species.color?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </PokemonGlassCard>
        
        {/* Training Info */}
        <PokemonGlassCard variant="compact" pokemonTypes={pokemon.types}>
          <h4 className="font-medium text-sm mb-2">Training Info</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Base Happiness</span>
              <span className="font-medium">{species.base_happiness || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Growth Rate</span>
              <span className="font-medium capitalize">
                {species.growth_rate?.name.replace(/-/g, ' ') || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Egg Groups</span>
              <span className="font-medium">
                {formatEggGroups(species.egg_groups).join(', ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700 dark:text-gray-300">Hatch Counter</span>
              <span className="font-medium">{species.hatch_counter || 0} cycles</span>
            </div>
          </div>
        </PokemonGlassCard>
      </div>
      
      {/* Type Effectiveness */}
      <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
        <h3 className="text-xl font-bold mb-4">Type Effectiveness</h3>
        <div className="space-y-4">
          {effectiveness.weaknesses.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Weak to (2× damage)
              </h4>
              <div className="flex flex-wrap gap-2">
                {effectiveness.weaknesses.map(type => (
                  <TypeEffectivenessBadge key={type} type={type} multiplier={2} />
                ))}
              </div>
            </div>
          )}
          
          {effectiveness.resistances.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Resistant to (0.5× damage)
              </h4>
              <div className="flex flex-wrap gap-2">
                {effectiveness.resistances.map(type => (
                  <TypeEffectivenessBadge key={type} type={type} multiplier={0.5} />
                ))}
              </div>
            </div>
          )}
          
          {effectiveness.immunities.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                Immune to (0× damage)
              </h4>
              <div className="flex flex-wrap gap-2">
                {effectiveness.immunities.map(type => (
                  <TypeEffectivenessBadge key={type} type={type} multiplier={0} />
                ))}
              </div>
            </div>
          )}
        </div>
      </PokemonGlassCard>
      
      {/* Abilities */}
      <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
        <h3 className="text-xl font-bold mb-4">Abilities</h3>
        <div className="space-y-3">
          {pokemon.abilities?.map(abilityInfo => {
            const ability = abilities[abilityInfo.ability.name];
            
            return (
              <div
                key={abilityInfo.ability.name}
                className={cn(
                  "p-4 rounded-xl transition-all duration-300",
                  abilityInfo.is_hidden
                    ? "bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700"
                    : "bg-gray-100 dark:bg-gray-800/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg capitalize">
                    {abilityInfo.ability.name.replace(/-/g, ' ')}
                  </h4>
                  {abilityInfo.is_hidden && (
                    <span className="px-3 py-1 text-xs font-medium bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full">
                      Hidden Ability
                    </span>
                  )}
                </div>
                
                {ability && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {ability.short_effect || ability.effect}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </PokemonGlassCard>
    </div>
  );
};

export default OverviewTab;