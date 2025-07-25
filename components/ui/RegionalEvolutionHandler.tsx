import { optimizedFetch as fetchData } from '../../utils/apiOptimizations';
import { sanitizePokemonName } from '../../utils/apiutils';

// Map of regional evolutions
const REGIONAL_EVOLUTION_MAP: { [key: string]: string | string[] | null } = {
  // Alolan forms
  'rattata-alola': 'raticate-alola',
  'sandshrew-alola': 'sandslash-alola',
  'vulpix-alola': 'ninetales-alola',
  'diglett-alola': 'dugtrio-alola',
  'meowth-alola': 'persian-alola',
  'geodude-alola': 'graveler-alola',
  'graveler-alola': 'golem-alola',
  'grimer-alola': 'muk-alola',
  
  // Galarian forms
  'meowth-galar': 'perrserker',
  'ponyta-galar': 'rapidash-galar',
  'slowpoke-galar': ['slowbro-galar', 'slowking-galar'],
  'farfetchd-galar': 'sirfetchd',
  'weezing-galar': null, // No evolution
  'mr-mime-galar': 'mr-rime',
  'corsola-galar': 'cursola',
  'zigzagoon-galar': 'linoone-galar',
  'linoone-galar': 'obstagoon',
  'darumaka-galar': 'darmanitan-galar',
  'yamask-galar': 'runerigus',
  'stunfisk-galar': null, // No evolution
  
  // Hisuian forms
  'growlithe-hisui': 'arcanine-hisui',
  'voltorb-hisui': 'electrode-hisui',
  'typhlosion-hisui': null, // Final evolution
  'qwilfish-hisui': 'overqwil',
  'sneasel-hisui': 'sneasler',
  'samurott-hisui': null, // Final evolution
  'lilligant-hisui': null, // Final evolution
  'zorua-hisui': 'zoroark-hisui',
  'braviary-hisui': null, // Final evolution
  'sliggoo-hisui': 'goodra-hisui',
  'avalugg-hisui': null, // Final evolution
  'decidueye-hisui': null, // Final evolution
  
  // Paldean forms
  'wooper-paldea': 'clodsire',
  'tauros-paldea': null, // No evolution
};

// Get the regional evolution chain for a Pokemon
export async function getRegionalEvolutionChain(pokemonName: string, currentForm: string | null = null): Promise<any[] | null> {
  const evolutionChain: any[] = [];
  
  // Check if this is a regional form
  const isRegional = pokemonName.includes('-alola') || 
                     pokemonName.includes('-galar') || 
                     pokemonName.includes('-hisui') || 
                     pokemonName.includes('-paldea');
  
  if (!isRegional && !currentForm) {
    return null; // Not a regional form
  }
  
  // Get the base species name
  const baseName = pokemonName.split('-')[0];
  const region = currentForm || pokemonName.split('-')[1];
  
  // Build the evolution chain for this regional variant
  const regionalName = currentForm ? `${baseName}-${currentForm}` : pokemonName;
  const sanitizedRegionalName = sanitizePokemonName(regionalName);
  
  // Add the current Pokemon
  try {
    const pokemonData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${sanitizedRegionalName}`);
    evolutionChain.push({
      id: pokemonData.id,
      name: regionalName,
      types: pokemonData.types.map((t: any) => t.type.name),
      sprite: pokemonData.sprites?.front_default,
      shinySprite: pokemonData.sprites?.front_shiny,
      isRegional: true,
      region: region
    });
  } catch (e) {
    console.error(`Failed to fetch regional form: ${regionalName}`, e);
  }
  
  // Check for evolutions
  const evolution = REGIONAL_EVOLUTION_MAP[regionalName];
  if (evolution) {
    if (Array.isArray(evolution)) {
      // Split evolution (like Galarian Slowpoke)
      for (const evo of evolution) {
        try {
          const evoData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${sanitizePokemonName(evo)}`);
          evolutionChain.push({
            id: evoData.id,
            name: evo,
            types: evoData.types.map((t: any) => t.type.name),
            sprite: evoData.sprites?.front_default,
            shinySprite: evoData.sprites?.front_shiny,
            isRegional: true,
            region: region,
            isSplitEvolution: true
          });
        } catch (e) {
          console.error(`Failed to fetch evolution: ${evo}`, e);
        }
      }
    } else {
      // Single evolution
      try {
        const evoData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${sanitizePokemonName(evolution)}`);
        evolutionChain.push({
          id: evoData.id,
          name: evolution,
          types: evoData.types.map((t: any) => t.type.name),
          sprite: evoData.sprites?.front_default,
          shinySprite: evoData.sprites?.front_shiny,
          isRegional: true,
          region: region
        });
        
        // Check if this evolution has further evolutions
        const furtherEvolution = REGIONAL_EVOLUTION_MAP[evolution];
        if (furtherEvolution && !Array.isArray(furtherEvolution)) {
          const furtherEvoData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${sanitizePokemonName(furtherEvolution)}`);
          evolutionChain.push({
            id: furtherEvoData.id,
            name: furtherEvolution,
            types: furtherEvoData.types.map((t: any) => t.type.name),
            sprite: furtherEvoData.sprites?.front_default,
            shinySprite: furtherEvoData.sprites?.front_shiny,
            isRegional: true,
            region: region
          });
        }
      } catch (e) {
        console.error(`Failed to fetch evolution: ${evolution}`, e);
      }
    }
  }
  
  // Check for pre-evolutions
  const preEvolutions = Object.entries(REGIONAL_EVOLUTION_MAP).filter(
    ([pre, evo]) => evo === regionalName || (Array.isArray(evo) && evo.includes(regionalName))
  );
  
  for (const [preEvo] of preEvolutions) {
    try {
      const preEvoData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${sanitizePokemonName(preEvo)}`);
      evolutionChain.unshift({
        id: preEvoData.id,
        name: preEvo,
        types: preEvoData.types.map((t: any) => t.type.name),
        sprite: preEvoData.sprites?.front_default,
        shinySprite: preEvoData.sprites?.front_shiny,
        isRegional: true,
        region: region
      });
    } catch (e) {
      console.error(`Failed to fetch pre-evolution: ${preEvo}`, e);
    }
  }
  
  return evolutionChain;
}

// Check if a Pokemon has regional forms that evolve
export function hasRegionalEvolution(pokemonName: string): boolean {
  return REGIONAL_EVOLUTION_MAP.hasOwnProperty(pokemonName);
}