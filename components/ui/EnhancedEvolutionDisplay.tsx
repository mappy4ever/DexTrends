import React, { useState, useEffect, useCallback, Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TypeBadge } from './TypeBadge';
import { fetchData } from '../../utils/apiutils';
import { getRegionalEvolutionChain } from './RegionalEvolutionHandler';
import { Pokemon } from '../../types/api/pokemon';

// Types
interface EvolutionDetails {
  min_level?: number;
  item?: { name: string };
  trigger?: { name: string };
  min_happiness?: number;
  time_of_day?: string;
  location?: { name: string };
  known_move?: { name: string };
  min_beauty?: number;
}

interface PokemonForm {
  name: string;
  displayName: string;
  id: string;
  types: string[];
  sprite: string | null;
  shinySprite: string | null;
  isMega: boolean;
  isRegional: boolean;
  hasOwnEvolution: boolean;
}

interface EvolutionNode {
  id: string;
  name: string;
  types: string[];
  forms?: PokemonForm[];
  level: number;
  parentId: string | null;
  sprite: string;
  shinySprite: string;
  evolutions: EvolutionNode[];
  evolutionDetails?: EvolutionDetails | null;
  isSplitEvolution?: boolean;
}

interface FlatPokemon {
  id: string;
  name: string;
  types: string[];
  forms?: PokemonForm[];
  level: number;
  sprite: string;
  shinySprite: string;
  evolutionDetails?: EvolutionDetails | null;
  evolutionMethod?: string;
}

interface EvolutionData {
  chain: FlatPokemon[];
  structure: EvolutionNode | null;
}

interface RegionalChain {
  variant: string;
  chain: FlatPokemon[];
}

interface EnhancedEvolutionDisplayProps {
  speciesUrl: string;
  currentPokemonId: string | number;
}

interface PokemonCardProps {
  pokemon: FlatPokemon | EvolutionNode;
  currentPokemonId: string | number;
  isShiny: boolean;
}

interface EvolutionTreeDisplayProps {
  node: EvolutionNode;
  currentPokemonId: string | number;
  isShiny: boolean;
  parentPosition?: any;
}

interface EeveeEvolutionDisplayProps {
  evolutionData: EvolutionData;
  currentPokemonId: string | number;
  isShiny: boolean;
  setIsShiny: (value: boolean) => void;
}

interface RegionalVariantEvolutionsProps {
  basePokemonName?: string;
  detectedVariants: string[];
  currentPokemonId: string | number;
  isShiny: boolean;
}

// Component to handle split evolutions and regional forms
function EnhancedEvolutionDisplay({ speciesUrl, currentPokemonId }: EnhancedEvolutionDisplayProps) {
  const [evolutionData, setEvolutionData] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShiny, setIsShiny] = useState(false);
  const [hasRegionalVariants, setHasRegionalVariants] = useState(false);
  const [detectedVariants, setDetectedVariants] = useState<string[]>([]);

  // Helper to check if a form is a regional variant
  const isRegionalForm = useCallback((name: string) => {
    return name.includes('-alola') || name.includes('-galar') || name.includes('-hisui') || name.includes('-paldea');
  }, []);

  // Helper to check if a form is a mega evolution
  const isMegaEvolution = useCallback((name: string) => {
    return name.includes('-mega');
  }, []);

  // Helper to check if a form should be displayed
  const isValidForm = useCallback((name: string) => {
    // Filter out cosmetic forms
    const cosmeticPatterns = [
      '-totem', '-cosplay', '-rock-star', '-belle', '-pop-star', '-phd', '-libre',
      '-original-cap', '-hoenn-cap', '-sinnoh-cap', '-unova-cap', '-kalos-cap',
      '-alola-cap', '-partner-cap', '-world-cap', '-starter',
      '-own-tempo' // Rockruff form that doesn't affect stats
    ];
    
    return !cosmeticPatterns.some(pattern => name.includes(pattern));
  }, []);

  // Format form names for display
  const formatFormName = useCallback((fullName: string, baseName: string) => {
    if (fullName.includes('-alola')) return 'Alolan Form';
    if (fullName.includes('-galar')) return 'Galarian Form';
    if (fullName.includes('-hisui')) return 'Hisuian Form';
    if (fullName.includes('-paldea')) return 'Paldean Form';
    if (fullName.includes('-mega')) {
      // Keep the full mega form name for proper display
      const megaPart = fullName.replace(baseName + '-', '');
      return megaPart.charAt(0).toUpperCase() + megaPart.slice(1).replace(/-/g, ' ');
    }
    return fullName.replace(baseName + '-', '').replace(/-/g, ' ');
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadEvolution = async () => {
      if (!speciesUrl) {
        setLoading(false);
        return;
      }
      
      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        
        // Get species data
        const speciesData = await fetchData(speciesUrl);
        
        // Check if evolution chain URL exists
        if (!speciesData.evolution_chain?.url) {
          console.warn(`No evolution chain URL found for species ${currentPokemonId}`);
          setEvolutionData({ chain: [], structure: null });
          return;
        }
        
        // Get current Pokemon data to check if it's a regional form
        const currentPokemonData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${currentPokemonId}`);
        const currentPokemonName = currentPokemonData.name;
        
        // Check if this is a regional form
        if (isRegionalForm(currentPokemonName)) {
          // Use regional evolution handler for regional forms
          const regionalChain = await getRegionalEvolutionChain(currentPokemonName);
          if (regionalChain && regionalChain.length > 0) {
            // Convert regional chain to our format
            const structure: EvolutionNode = {
              id: regionalChain[0].id,
              name: regionalChain[0].name,
              types: regionalChain[0].types,
              level: 0,
              parentId: null,
              sprite: regionalChain[0].sprite,
              shinySprite: regionalChain[0].shinySprite,
              evolutions: []
            };
            
            // Build evolution tree from regional chain
            let currentNode = structure;
            for (let i = 1; i < regionalChain.length; i++) {
              const evolution: EvolutionNode = {
                id: regionalChain[i].id,
                name: regionalChain[i].name,
                types: regionalChain[i].types,
                level: i,
                parentId: regionalChain[i-1].id,
                sprite: regionalChain[i].sprite,
                shinySprite: regionalChain[i].shinySprite,
                evolutions: [],
                isSplitEvolution: regionalChain[i].isSplitEvolution
              };
              
              if (regionalChain[i].isSplitEvolution) {
                // Handle split evolutions (like Galarian Slowpoke)
                currentNode.evolutions.push(evolution);
              } else {
                currentNode.evolutions = [evolution];
                currentNode = evolution;
              }
            }
            
            if (isMounted) {
              setEvolutionData({
                chain: regionalChain,
                structure: structure
              });
            }
            return;
          }
        }
        
        if (!speciesData.evolution_chain?.url) {
          if (isMounted) {
            setEvolutionData({ chain: [], structure: null });
          }
          return;
        }
        
        // Get evolution chain for non-regional forms
        let evoData;
        try {
          evoData = await fetchData(speciesData.evolution_chain.url);
        } catch (error) {
          console.error('Failed to fetch evolution chain:', error);
          if (isMounted) {
            setEvolutionData({ chain: [], structure: null });
          }
          return;
        }
        
        // Parse the chain into a tree structure
        const parseEvolutionNode = async (node: any, parentId: string | null = null, level: number = 0): Promise<EvolutionNode | null> => {
          if (!node) return null;
          
          const speciesId = node.species.url.split('/').slice(-2, -1)[0];
          
          // Get Pokemon data for types
          let types: string[] = [];
          let forms: PokemonForm[] = [];
          try {
            const pokeData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);
            types = pokeData.types.map((t: any) => t.type.name);
            
            // Get available forms including mega evolutions
            const speciesDetail = await fetchData(node.species.url);
            if (speciesDetail.varieties && speciesDetail.varieties.length > 1) {
              forms = await Promise.all(
                speciesDetail.varieties
                  .filter((v: any) => !v.is_default || isRegionalForm(v.pokemon.name) || isMegaEvolution(v.pokemon.name))
                  .map(async (variety: any) => {
                    try {
                      const formData = await fetchData(variety.pokemon.url);
                      // Check if this regional form should show its own evolution chain
                      const isRegional = isRegionalForm(variety.pokemon.name);
                      return {
                        name: variety.pokemon.name,
                        displayName: formatFormName(variety.pokemon.name, node.species.name),
                        id: formData.id,
                        types: formData.types.map((t: any) => t.type.name),
                        sprite: formData.sprites?.front_default,
                        shinySprite: formData.sprites?.front_shiny,
                        isMega: isMegaEvolution(variety.pokemon.name),
                        isRegional: isRegional,
                        hasOwnEvolution: isRegional // Regional forms have their own evolution chains
                      };
                    } catch (e) {
                      return null;
                    }
                  })
              );
              forms = forms.filter((f): f is PokemonForm => f !== null && isValidForm(f.name));
            }
          } catch (e) {
            console.error('Failed to fetch Pokemon data:', e);
          }
          
          const pokemonNode: EvolutionNode = {
            id: speciesId,
            name: node.species.name,
            types,
            forms,
            level,
            parentId,
            sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
            shinySprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${speciesId}.png`,
            evolutions: []
          };
          
          // Process all evolution branches (for split evolutions)
          if (node.evolves_to && node.evolves_to.length > 0) {
            for (let i = 0; i < node.evolves_to.length; i++) {
              const evolution = node.evolves_to[i];
              const evolutionSpeciesName = evolution.species.name;
              
              // Skip regional variant evolutions for base forms
              const regionalExclusions: Record<string, string[]> = {
                'meowth': ['perrserker'], // Galarian Meowth evolves to Perrserker
                'corsola': ['cursola'], // Galarian Corsola evolves to Cursola
                'farfetchd': ['sirfetchd'], // Galarian Farfetch'd evolves to Sirfetch'd
                'linoone': ['obstagoon'], // Galarian Linoone evolves to Obstagoon
                'yamask': ['runerigus'], // Galarian Yamask evolves to Runerigus
                'mr-mime': ['mr-rime'], // Galarian Mr. Mime evolves to Mr. Rime
              };
              
              if (regionalExclusions[node.species.name] && regionalExclusions[node.species.name].includes(evolutionSpeciesName)) {
                continue;
              }
              
              const evolutionDetails = evolution.evolution_details?.[0] || null;
              const childNode = await parseEvolutionNode(evolution, speciesId, level + 1);
              if (childNode) {
                childNode.evolutionDetails = evolutionDetails;
                pokemonNode.evolutions.push(childNode);
              }
            }
          }
          
          return pokemonNode;
        };
        
        const evolutionTree = await parseEvolutionNode(evoData.chain);
        
        // Flatten the tree for easy access
        const flattenTree = (node: EvolutionNode | null, result: FlatPokemon[] = []): FlatPokemon[] => {
          if (!node) return result;
          result.push({
            id: node.id,
            name: node.name,
            types: node.types,
            forms: node.forms,
            level: node.level,
            sprite: node.sprite,
            shinySprite: node.shinySprite,
            evolutionDetails: node.evolutionDetails
          });
          node.evolutions.forEach(evo => flattenTree(evo, result));
          return result;
        };
        
        const flatChain = flattenTree(evolutionTree);
        
        if (isMounted) {
          setEvolutionData({
            chain: flatChain,
            structure: evolutionTree
          });
        }
        
      } catch (err: any) {
        console.error('Error loading evolution:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadEvolution();
    
    return () => {
      isMounted = false;
    };
  }, [speciesUrl, currentPokemonId, isRegionalForm, isMegaEvolution, isValidForm, formatFormName]);

  // Check if base Pokemon has regional variants (automated detection)
  useEffect(() => {
    // Reset state when evolutionData changes
    setHasRegionalVariants(false);
    setDetectedVariants([]);
    
    const checkForRegionalVariants = async () => {
      if (!evolutionData || !evolutionData.structure || !evolutionData.structure.name) return;
      
      try {
        // Get species data to check varieties
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${evolutionData.structure.name}`;
        const speciesData = await fetchData(speciesUrl);
        
        if (speciesData.varieties && speciesData.varieties.length > 1) {
          // Filter for regional variants using naming pattern
          const regionalPattern = /-(alola|galar|hisui|paldea)($|-)/;
          const variants = speciesData.varieties
            .filter((v: any) => !v.is_default && regionalPattern.test(v.pokemon.name))
            .map((v: any) => v.pokemon.name);
          
          if (variants.length > 0) {
            setHasRegionalVariants(true);
            setDetectedVariants(variants);
          }
        }
      } catch (error) {
        console.error('Error checking for regional variants:', error);
      }
    };
    
    checkForRegionalVariants();
  }, [evolutionData]);

  if (loading) {
    return <div className="text-center py-4">Loading evolution data...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">Failed to load evolution data</div>;
  }

  if (!evolutionData || !evolutionData.structure) {
    return <div className="text-center py-4 text-gray-500">This Pokémon does not evolve</div>;
  }

  // Check if this is Eevee (special circular layout)
  const isEeveeFamily = evolutionData.chain.some(p => p.name.toLowerCase() === 'eevee');
  
  if (isEeveeFamily) {
    return <EeveeEvolutionDisplay 
      evolutionData={evolutionData} 
      currentPokemonId={currentPokemonId}
      isShiny={isShiny}
      setIsShiny={setIsShiny}
    />;
  }

  // Regular evolution display with split evolution support
  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        <div className="space-y-8 flex-1">
          {/* Main evolution chain */}
          <EvolutionTreeDisplay 
            node={evolutionData.structure}
            currentPokemonId={currentPokemonId}
            isShiny={isShiny}
          />
          
          {/* Regional variant chains */}
          {hasRegionalVariants && <RegionalVariantEvolutions 
            basePokemonName={evolutionData.structure?.name}
            detectedVariants={detectedVariants}
            currentPokemonId={currentPokemonId}
            isShiny={isShiny}
          />}
        </div>
        
        <button
          onClick={() => setIsShiny(!isShiny)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ml-4 ${
            isShiny 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span>Shiny</span>
        </button>
      </div>
    </div>
  );
}

// Component for displaying evolution trees with branches
function EvolutionTreeDisplay({ node, currentPokemonId, isShiny, parentPosition = null }: EvolutionTreeDisplayProps) {
  if (!node) return null;

  const hasMultipleEvolutions = node.evolutions && node.evolutions.length > 1;

  return (
    <div className="flex items-center">
      {/* Current Pokemon */}
      <div className="flex flex-col items-center">
        <PokemonCard 
          pokemon={node}
          currentPokemonId={currentPokemonId}
          isShiny={isShiny}
        />
        
      </div>

      {/* Evolution branches */}
      {node.evolutions && node.evolutions.length > 0 && (
        <>
          {/* Arrow */}
          <div className="mx-4 flex flex-col items-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            {node.evolutions[0]?.evolutionDetails && (
              <div className="text-xs text-gray-500 mt-1 text-center max-w-[100px]">
                {formatEvolutionMethod(node.evolutions[0].evolutionDetails)}
              </div>
            )}
          </div>

          {/* Evolution(s) */}
          <div className={`flex ${hasMultipleEvolutions ? 'flex-col gap-4' : ''}`}>
            {node.evolutions.map((evolution, index) => (
              <div key={evolution.id} className={hasMultipleEvolutions && index > 0 ? 'border-t-2 border-gray-200 pt-4' : ''}>
                <EvolutionTreeDisplay 
                  node={evolution}
                  currentPokemonId={currentPokemonId}
                  isShiny={isShiny}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Mega Evolutions - shown after the Pokemon, not as forms */}
      {node.forms && node.forms.filter(f => f.isMega).length > 0 && !node.evolutions?.length && (
        <>
          {/* Special Mega Evolution Arrow */}
          <div className="mx-4 flex flex-col items-center">
            <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="text-xs text-purple-600 mt-1 text-center font-medium">
              Mega
            </div>
          </div>

          {/* Mega Evolution Forms */}
          <div className="flex flex-col gap-4">
            {node.forms.filter(f => f.isMega).map((mega) => {
              // Extract base Pokemon name and format Mega name properly
              const baseName = node.name.charAt(0).toUpperCase() + node.name.slice(1);
              const megaFormName = mega.displayName.toLowerCase().includes('mega-x') ? 'Mega X' : 
                                   mega.displayName.toLowerCase().includes('mega-y') ? 'Mega Y' : 'Mega';
              const fullMegaName = `${megaFormName} ${baseName}`;
              
              return (
                <Link key={mega.id}
                  href={`/pokedex/${mega.id}`}
                  className={`flex flex-col items-center p-3 transition-all hover:scale-110 ${
                    parseInt(mega.id) === parseInt(String(currentPokemonId)) ? 'scale-110' : ''
                  }`}
                  style={{ minWidth: '160px' }}
                >
                  <div className="relative w-32 h-32 mb-6">
                    <Image
                      src={isShiny ? mega.shinySprite || '/dextrendslogo.png' : mega.sprite || '/dextrendslogo.png'}
                      alt={mega.name}
                      fill
                      className="object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/dextrendslogo.png';
                      }}
                    />
                  </div>
                  <p className="font-medium capitalize text-center w-full px-2">{fullMegaName}</p>
                  <p className="text-sm text-gray-500">#{mega.id.toString().padStart(3, '0')}</p>
                  <div className="flex gap-1 mt-1 justify-center">
                    {mega.types.map(type => (
                      <TypeBadge key={type} type={type} size="sm" />
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// Pokemon card component
function PokemonCard({ pokemon, currentPokemonId, isShiny }: PokemonCardProps) {
  // Safety checks
  if (!pokemon) return null;
  
  const pokemonId = pokemon.id || '000';
  const pokemonName = pokemon.name || 'Unknown';
  const pokemonTypes = pokemon.types || [];
  const pokemonSprite = isShiny ? pokemon.shinySprite : pokemon.sprite;
  
  return (
    <Link 
      href={`/pokedex/${pokemonId}`}
      className={`flex flex-col items-center p-3 transition-all hover:scale-110 ${
        parseInt(pokemonId) === parseInt(String(currentPokemonId)) ? 'scale-110' : ''
      }`}
      style={{ minWidth: '160px' }}
    >
      <div className="relative w-32 h-32 mb-6">
        <Image
          src={pokemonSprite || '/dextrendslogo.png'}
          alt={pokemonName}
          fill
          className="object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/dextrendslogo.png';
          }}
        />
      </div>
      <p className="font-medium capitalize text-center w-full px-2">{pokemonName.replace(/-/g, ' ')}</p>
      <p className="text-sm text-gray-500">#{pokemonId.toString().padStart(3, '0')}</p>
      <div className="flex gap-1 mt-1 justify-center">
        {pokemonTypes.map(type => (
          <TypeBadge key={type} type={type} size="sm" />
        ))}
      </div>
    </Link>
  );
}

// Special Eevee evolution display
function EeveeEvolutionDisplay({ evolutionData, currentPokemonId, isShiny, setIsShiny }: EeveeEvolutionDisplayProps) {
  const eevee = evolutionData.chain.find(p => p.name.toLowerCase() === 'eevee');
  const evolutions = evolutionData.chain.filter(p => p.name.toLowerCase() !== 'eevee');
  
  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        <div className="relative flex justify-center items-center mx-auto flex-1" style={{ height: '650px', width: '100%', maxWidth: '850px' }}>
          {/* Eevee in the center */}
          {eevee && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <PokemonCard 
                pokemon={eevee}
                currentPokemonId={currentPokemonId}
                isShiny={isShiny}
              />
            </div>
          )}
          
          {/* Evolutions arranged in a circle */}
          {evolutions.map((evolution, index) => {
            const angle = (360 / evolutions.length) * index - 90;
            const radian = (angle * Math.PI) / 180;
            const radius = 230;
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            
            return (
              <div
                key={evolution.id}
                className="absolute"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <PokemonCard 
                  pokemon={evolution}
                  currentPokemonId={currentPokemonId}
                  isShiny={isShiny}
                />
              </div>
            );
          })}
        </div>
        
        <button
          onClick={() => setIsShiny(!isShiny)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ml-4 ${
            isShiny 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          <span>Shiny</span>
        </button>
      </div>
    </div>
  );
}

// Format evolution method details
function formatEvolutionMethod(details: EvolutionDetails) {
  if (!details) return 'Evolves';
  
  const parts: string[] = [];
  
  if (details.min_level) {
    parts.push(`Lv ${details.min_level}`);
  }
  
  if (details.item) {
    parts.push(details.item.name.replace(/-/g, ' '));
  }
  
  if (details.trigger && details.trigger.name !== 'level-up') {
    parts.push(details.trigger.name.replace(/-/g, ' '));
  }
  
  if (details.min_happiness) {
    parts.push(`Happiness ${details.min_happiness}+`);
  }
  
  if (details.time_of_day) {
    parts.push(`${details.time_of_day} time`);
  }
  
  if (details.location) {
    parts.push(`at ${details.location.name.replace(/-/g, ' ')}`);
  }
  
  if (details.known_move) {
    parts.push(`knowing ${details.known_move.name.replace(/-/g, ' ')}`);
  }
  
  if (details.min_beauty) {
    parts.push(`Beauty ${details.min_beauty}+`);
  }
  
  return parts.join(', ') || 'Evolves';
}

// Component to display regional variant evolution chains
function RegionalVariantEvolutions({ basePokemonName, detectedVariants, currentPokemonId, isShiny }: RegionalVariantEvolutionsProps) {
  const [regionalChains, setRegionalChains] = useState<RegionalChain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRegionalChains = async () => {
      const chains: RegionalChain[] = [];
      
      // Use the automatically detected variants instead of hardcoded list
      const variants = detectedVariants || [];
      
      for (const variant of variants) {
        try {
          const chain = await getRegionalEvolutionChain(variant);
          if (chain && chain.length > 0) {
            chains.push({
              variant: variant,
              chain: chain
            });
          }
        } catch (error) {
          console.error(`Failed to load evolution chain for ${variant}:`, error);
        }
      }
      
      setRegionalChains(chains);
      setLoading(false);
    };

    loadRegionalChains();
  }, [basePokemonName, detectedVariants]);

  if (loading) return null;
  if (regionalChains.length === 0) return null;

  return (
    <div className="space-y-6">
      {regionalChains.map(({ variant, chain }) => (
        <div key={variant} className="border-t pt-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-4">
            {(() => {
              const baseName = variant.split('-')[0];
              const capitalizedName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
              if (variant.includes('alola')) return `Alolan ${capitalizedName}`;
              if (variant.includes('galar')) return `Galarian ${capitalizedName}`;
              if (variant.includes('hisui')) return `Hisuian ${capitalizedName}`;
              if (variant.includes('paldea')) return `Paldean ${capitalizedName}`;
              return `Regional ${capitalizedName}`;
            })()}
          </h4>
          <div className="flex items-center">
            {chain.map((pokemon, index) => (
              <Fragment key={pokemon.id}>
                <PokemonCard 
                  pokemon={pokemon}
                  currentPokemonId={currentPokemonId}
                  isShiny={isShiny}
                />
                {index < chain.length - 1 && (
                  <div className="mx-4 flex flex-col items-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    {chain[index + 1].evolutionMethod && (
                      <div className="text-xs text-gray-500 mt-1 text-center max-w-[100px]">
                        {chain[index + 1].evolutionMethod}
                      </div>
                    )}
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EnhancedEvolutionDisplay;