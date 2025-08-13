import type { Pokemon, PokemonSpecies } from "../../../../types/pokemon";
import type { FormatEligibility } from './types';

// Special format checks
export const checkFormatEligibility = (pokemon: Pokemon, species: PokemonSpecies): FormatEligibility => {
  const baseStatTotal = Array.isArray(pokemon.stats) 
    ? pokemon.stats.reduce((sum, stat) => sum + (stat?.base_stat || 0), 0) 
    : 0;
  
  return {
    littleCup: species.evolves_from_species === null && species.is_baby === false && 
               !['Ditto', 'Cosmog', 'Cosmoem', 'Solgaleo', 'Lunala'].includes(pokemon.name),
    monotype: pokemon.types?.length === 1,
    nfe: species.evolves_from_species !== null || species.evolution_chain !== null,
    vgc: true, // Most Pokemon are VGC eligible
    battleStadium: baseStatTotal <= 600 && !species.is_legendary && !species.is_mythical,
  };
};