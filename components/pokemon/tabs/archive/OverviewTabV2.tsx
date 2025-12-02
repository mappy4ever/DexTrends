import React from 'react';
import type { Pokemon, PokemonSpecies } from "../../../types/pokemon";
import type { CompetitiveTierRecord } from '../../../utils/supabase';
import { Container } from '../../ui/Container';
import TypeEffectivenessWheel from '../TypeEffectivenessWheel';
import { TierBadgeGroup } from '../../ui/TierBadge';
import { formatEggGroups } from '../../../utils/pokemonDetailUtils';
import { cn } from '../../../utils/cn';
import { FaFlask, FaTag, FaHome, FaPalette, FaBullseye, FaChartLine, FaEgg, FaClock, FaMedal, FaRunning, FaCalculator, FaTrophy, FaHeart, FaGem } from 'react-icons/fa';

interface TypeColors {
  accent: string;
  animationAccent: string;
  from?: string;
  to?: string;
}

interface AbilityData {
  name: string;
  isHidden: boolean;
  effect: string;
  short_effect: string;
}

interface OverviewTabV2Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  abilities: Record<string, AbilityData>;
  typeColors: TypeColors;
  competitiveTiers?: CompetitiveTierRecord | null;
}

const OverviewTabV2: React.FC<OverviewTabV2Props> = ({ 
  pokemon, 
  species, 
  abilities,
  typeColors,
  competitiveTiers 
}) => {
  // Get flavor text
  const getFlavorText = () => {
    if (!species?.flavor_text_entries) return 'No description available.';
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    return englishEntry ? englishEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.';
  };
  
  return (
    <div className="space-y-6">
      {/* Magazine-style hero section with Pokedex entry */}
      <Container variant="default" className="relative overflow-hidden">
        {/* Background gradient accent */}
        <div 
          className={cn(
            "absolute inset-0 opacity-5 bg-gradient-to-br",
            typeColors.from,
            typeColors.to
          )}
        />
        
        <div className="relative z-10 p-8">
          {/* Large quote-style Pokedex entry */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-6xl text-stone-300 dark:text-stone-500 mb-4">"</div>
            <p className="text-xl lg:text-2xl leading-relaxed text-stone-700 dark:text-stone-300 italic">
              {getFlavorText()}
            </p>
            <div className="text-6xl text-stone-300 dark:text-stone-500 mt-4 rotate-180">"</div>
          </div>
        </div>
      </Container>
      
      {/* Info grid with visual icons */}
      <div className={cn(
        "grid gap-4",
        competitiveTiers 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {/* Biological Info Card */}
        <Container variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl text-green-600 dark:text-green-400">
              <FaFlask />
            </div>
            <h3 className="text-lg font-bold">Biology</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaTag className="text-sm" /> Species
              </span>
              <span className="font-semibold">
                {species.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaHome className="text-sm" /> Habitat
              </span>
              <span className="font-semibold capitalize">
                {species.habitat?.name.replace(/-/g, ' ') || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaGem className="text-sm" /> Shape
              </span>
              <span className="font-semibold capitalize">
                {species.shape?.name.replace(/-/g, ' ') || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaPalette className="text-sm" /> Color
              </span>
              <span className="font-semibold capitalize">
                {species.color?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </Container>
        
        {/* Training Info Card */}
        <Container variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl text-amber-600 dark:text-amber-400">
              <FaBullseye />
            </div>
            <h3 className="text-lg font-bold">Training</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaHeart className="text-sm text-pink-500" /> Base Happiness
              </span>
              <span className="font-semibold">{species.base_happiness || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaChartLine className="text-sm" /> Growth Rate
              </span>
              <span className="font-semibold capitalize">
                {species.growth_rate?.name.replace(/-/g, ' ') || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaEgg className="text-sm" /> Egg Groups
              </span>
              <span className="font-semibold capitalize text-right">
                {formatEggGroups(species.egg_groups).join(', ')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaClock className="text-sm" /> Hatch Time
              </span>
              <span className="font-semibold">{species.hatch_counter || 0} cycles</span>
            </div>
          </div>
        </Container>
        
        {/* Battle Info Card */}
        <Container variant="default" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl text-red-600 dark:text-red-400">
              <FaTrophy />
            </div>
            <h3 className="text-lg font-bold">Battle</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaMedal className="text-sm" /> Base EXP
              </span>
              <span className="font-semibold">{pokemon.base_experience || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaRunning className="text-sm" /> Flee Rate
              </span>
              <span className="font-semibold">
                {species.capture_rate ? `${((255 - species.capture_rate) / 255 * 100).toFixed(0)}%` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaCalculator className="text-sm" /> Base Stats
              </span>
              <span className="font-semibold">
                {pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600 dark:text-stone-300 flex items-center gap-2">
                <FaTrophy className="text-sm" /> EV Yield
              </span>
              <span className="font-semibold">
                {pokemon.stats?.filter(s => s.effort > 0).length || 0} stats
              </span>
            </div>
          </div>
        </Container>
        
        {/* Competitive Info Card */}
        {competitiveTiers && (
          <Container variant="default" className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl text-amber-600 dark:text-amber-400">
                <FaTrophy />
              </div>
              <h3 className="text-lg font-bold">Competitive</h3>
            </div>
            <div className="space-y-3">
              <TierBadgeGroup 
                tiers={{
                  singles: competitiveTiers.singles_tier,
                  doubles: competitiveTiers.doubles_tier,
                  nationalDex: competitiveTiers.national_dex_tier
                }}
                size="sm"
              />
            </div>
          </Container>
        )}
      </div>
      
      {/* Type Effectiveness - Interactive Wheel */}
      <div>
        <h3 className="text-xl font-bold mb-4">Type Matchups</h3>
        <TypeEffectivenessWheel pokemonTypes={pokemon.types || []} />
      </div>
      
      {/* Abilities with enhanced visual design */}
      <div>
        <h3 className="text-xl font-bold mb-4">Abilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pokemon.abilities?.map(abilityInfo => {
            const ability = abilities[abilityInfo.ability.name];
            
            return (
              <Container
                key={abilityInfo.ability.name}
                variant="default"
                className={cn(
                  "p-6 transition-all duration-300",
                  abilityInfo.is_hidden && "ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-stone-900"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-lg capitalize">
                    {abilityInfo.ability.name.replace(/-/g, ' ')}
                  </h4>
                  {abilityInfo.is_hidden && (
                    <span className="px-3 py-1 text-xs font-medium bg-amber-500 text-white rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
                
                {ability && (
                  <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                    {ability.short_effect || ability.effect}
                  </p>
                )}
                
                {/* Visual indicator for ability slot */}
                <div className="mt-4 flex items-center gap-2">
                  <div className="text-xs text-stone-600 dark:text-stone-300">
                    Slot {abilityInfo.slot}
                  </div>
                  {abilityInfo.is_hidden && (
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      • Requires special method to obtain
                    </div>
                  )}
                </div>
              </Container>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OverviewTabV2;