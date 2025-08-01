import React from 'react';
import type { Pokemon, PokemonSpecies } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import { PokemonLearnset } from '../PokemonLearnset';

interface MovesTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  typeColors: any;
}

const MovesTab: React.FC<MovesTabProps> = ({ pokemon, species, typeColors }) => {
  // Validate pokemon data
  if (!pokemon || !pokemon.name) {
    return (
      <div className="text-center py-8 text-red-500">
        Pokemon data not available
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="pokemon-moves">
      {/* Header Card */}
      <PokemonGlassCard variant="compact" pokemonTypes={pokemon.types}>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-serif text-gray-900 dark:text-white">
            Move Pool
          </h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Complete learnset from Pokemon Showdown
          </span>
        </div>
      </PokemonGlassCard>

      {/* Moves Display - Using Showdown Learnset Data */}
      <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
        <PokemonLearnset 
          pokemonId={pokemon.name}
          generation={9}
          className="mt-4"
        />
      </PokemonGlassCard>
    </div>
  );
};

export default MovesTab;