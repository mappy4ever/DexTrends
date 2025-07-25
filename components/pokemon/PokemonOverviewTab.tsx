/**
 * Pokemon Overview Tab Component
 * Displays essential Pokemon information including description, taxonomy, and training data
 */

import React from 'react';
import { TypeBadge } from '../ui/TypeBadge';
import { FadeIn } from '../ui/animations/animations';
import type { Pokemon, PokemonSpecies } from '../../types/api/pokemon';

interface TypeEffectivenessItem {
  type: string;
  multiplier: number;
}

interface TypeEffectivenessInfo {
  weakTo: TypeEffectivenessItem[];
  resistantTo: TypeEffectivenessItem[];
  immuneTo: TypeEffectivenessItem[];
}

interface GenerationInfo {
  name: string;
  url: string;
}

interface RelatedPokemon {
  name: string;
  url: string;
}

interface PokemonOverviewTabProps {
  pokemonDetails: Pokemon | null;
  pokemonSpecies: PokemonSpecies | null;
  generationInfo: GenerationInfo | null;
  typeEffectivenessInfo: TypeEffectivenessInfo | null;
  relatedPokemonList: RelatedPokemon[];
  relatedLoading: boolean;
  relatedError: string | null;
}

const PokemonOverviewTab: React.FC<PokemonOverviewTabProps> = ({ 
  pokemonDetails, 
  pokemonSpecies, 
  generationInfo, 
  typeEffectivenessInfo,
  relatedPokemonList,
  relatedLoading,
  relatedError
}) => {
  return (
    <FadeIn>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1: Essential Information */}
        <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
          {/* Generation Tag */}
          {generationInfo && (
            <div className="mb-2">
              <span className="inline-block glass-pokeball text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                Gen {generationInfo.name?.match(/generation-(\w+)/i)?.[1]?.toUpperCase() || generationInfo.name}
              </span>
            </div>
          )}
          <h3 className="font-bold text-xl mb-3">Description</h3>
          <p className="mb-4 text-base leading-relaxed">
            {pokemonSpecies?.flavor_text_entries?.find(entry => entry.language.name === 'en')?.flavor_text.replace(/[\f\n]/g, ' ') || 'No description available.'}
          </p>

          <h3 className="font-bold text-xl mt-6 mb-3">Taxonomy</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-base">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Species</p>
              <p className="font-medium">{pokemonSpecies?.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Habitat</p>
              <p className="font-medium capitalize">{pokemonSpecies?.habitat?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Shape</p>
              <p className="font-medium capitalize">{pokemonSpecies?.shape?.name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Growth Rate</p>
              <p className="font-medium capitalize">{pokemonSpecies?.growth_rate?.name.replace('-', ' ') || 'Unknown'}</p>
            </div>
          </div>

          <h3 className="font-bold text-lg mt-6 mb-3">Training</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Base Happiness</p>
              <p className="font-medium">{pokemonSpecies?.base_happiness ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Capture Rate</p>
              <p className="font-medium">{pokemonSpecies?.capture_rate ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Base Exp</p>
              <p className="font-medium">{pokemonDetails?.base_experience ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">EV Yield</p>
              <p className="font-medium">
                {pokemonDetails?.stats?.filter(s => s.effort > 0).map(s => `${s.effort} ${s.stat.name.replace('-', ' ')}`).join(', ') || 'None'}
              </p>
            </div>
          </div>

          {/* Type Effectiveness */}
          <h3 className="font-bold text-lg mt-6 mb-3">Type Effectiveness</h3>
          {typeEffectivenessInfo ? (
            <div className="space-y-3 text-sm">
              {typeEffectivenessInfo.weakTo.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Weak to</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {typeEffectivenessInfo.weakTo.map(item => (
                      <div key={item.type} className="relative inline-block">
                        <TypeBadge type={item.type} size="sm" />
                        <span className="absolute -top-1 -right-1.5 text-xs font-bold text-red-500 bg-white/70 dark:bg-gray-800/70 px-1 rounded-full scale-75">x{item.multiplier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {typeEffectivenessInfo.resistantTo.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Resistant to</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {typeEffectivenessInfo.resistantTo.map(item => (
                      <div key={item.type} className="relative inline-block">
                        <TypeBadge type={item.type} size="sm" />
                        <span className="absolute -top-1 -right-1.5 text-xs font-bold text-green-500 bg-white/70 dark:bg-gray-800/70 px-1 rounded-full scale-75">x{item.multiplier}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {typeEffectivenessInfo.immuneTo.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Immune to</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {typeEffectivenessInfo.immuneTo.map(item => (
                      <div key={item.type} className="relative inline-block">
                        <TypeBadge type={item.type} size="sm" />
                        <span className="absolute -top-1 -right-1.5 text-xs font-bold text-gray-500 bg-white/70 dark:bg-gray-800/70 px-1 rounded-full scale-75">x0</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Calculating type effectiveness...</p>
          )}
        </div>

        {/* Column 2: Related Pokemon */}
        <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
          <h3 className="font-bold text-lg mb-4">
            Related Pokémon 
            {generationInfo && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                (Generation {generationInfo.name?.match(/generation-(\w+)/i)?.[1]?.toUpperCase()})
              </span>
            )}
          </h3>
          
          {relatedLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : relatedError ? (
            <p className="text-red-500 dark:text-red-400 text-sm">{relatedError}</p>
          ) : relatedPokemonList && relatedPokemonList.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto">
              {relatedPokemonList.slice(0, 24).map((pokemon, index) => {
                const pokemonId = pokemon.url?.split('/').filter(Boolean).pop();
                return (
                  <a
                    key={index}
                    href={`/pokedex/${pokemonId}`}
                    className="group bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  >
                    <div className="aspect-square flex items-center justify-center mb-2">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
                        alt={pokemon.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-base text-gray-900 dark:text-white capitalize truncate">
                        {pokemon.name.replace('-', ' ')}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        #{String(pokemonId).padStart(3, '0')}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No related Pokémon data available.</p>
          )}
        </div>
      </div>
    </FadeIn>
  );
};

export default PokemonOverviewTab;