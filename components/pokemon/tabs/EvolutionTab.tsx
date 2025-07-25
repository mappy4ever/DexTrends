import React from 'react';
import type { Pokemon, PokemonSpecies } from '../../../types/api/pokemon';
import PokemonGlassCard from '../PokemonGlassCard';
import EnhancedEvolutionDisplay from '../../ui/EnhancedEvolutionDisplay';

interface EvolutionTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  evolutionChain?: any;
  typeColors: any;
}

const EvolutionTab: React.FC<EvolutionTabProps> = ({ pokemon, species, typeColors }) => {
  return (
    <PokemonGlassCard variant="default" pokemonTypes={pokemon.types}>
      <h3 className="text-xl font-bold mb-4">Evolution Chain</h3>
      {species?.evolution_chain?.url ? (
        <EnhancedEvolutionDisplay 
          speciesUrl={`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}/`}
          currentPokemonId={pokemon.id}
        />
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No evolution data available.</p>
      )}
    </PokemonGlassCard>
  );
};

export default EvolutionTab;