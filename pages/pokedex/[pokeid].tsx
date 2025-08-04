import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { NextPage } from "next";
import { motion } from "framer-motion";
import { fetchData, fetchPokemon, fetchPokemonSpecies, fetchNature, fetchTCGCards, fetchPocketCards, sanitizePokemonName } from "../../utils/apiutils";
import { showdownQueries, CompetitiveTierRecord } from "../../utils/supabase";
import { loadTypeChart } from "../../utils/typeEffectiveness";
import type { 
  AbilityData as AbilityApiData,
  Pokemon, 
  PokemonSpecies, 
  Nature, 
  EvolutionChain, 
  PokemonAbility, 
  PokemonStat,
  PokemonTab,
  PokemonType,
  LocationAreaEncounterDetail
} from "../../types/api/pokemon";
import type { TCGCard } from "../../types/api/cards";
import type { PocketCard } from "../../types/api/pocket-cards";
import PokemonHeroSectionV3 from "../../components/pokemon/PokemonHeroSectionV3";
import PokemonTabSystem from "../../components/pokemon/PokemonTabSystem";
import FloatingActionBar from "../../components/pokemon/FloatingActionBar";
import { PageLoader } from "../../utils/unifiedLoading";
import { FullBleedWrapper } from "../../components/ui";
import { PageErrorBoundary } from "../../components/ui";
import { CircularButton } from "../../components/ui/design-system";
import { getPokemonTheme } from "../../utils/pokemonAnimations";
import NavigationArrow from "../../components/pokemon/NavigationArrow";

// Interface for abilities state
interface AbilityData {
  name: string;
  isHidden: boolean;
  effect: string;
  short_effect: string;
}

const PokemonDetail: NextPage = () => {
  const router = useRouter();
  const { pokeid, form } = router.query;
  
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PokemonTab>('overview');
  const [tcgCards, setTcgCards] = useState<TCGCard[]>([]);
  const [pocketCards, setPocketCards] = useState<PocketCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState<boolean>(false);
  const [abilities, setAbilities] = useState<Record<string, AbilityData>>({});
  const [locationAreaEncounters, setLocationAreaEncounters] = useState<LocationAreaEncounterDetail[]>([]);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(null);
  const [selectedNature, setSelectedNature] = useState<string>('hardy');
  const [selectedLevel, setSelectedLevel] = useState<number>(50);
  const [natureData, setNatureData] = useState<Nature | null>(null);
  const [allNatures, setAllNatures] = useState<Nature[]>([]);
  const [showShiny, setShowShiny] = useState<boolean>(false);
  const [adjacentPokemon, setAdjacentPokemon] = useState<{
    prev: { id: number; name: string; types: PokemonType[] } | null;
    next: { id: number; name: string; types: PokemonType[] } | null;
  }>({ prev: null, next: null });
  const [competitiveTiers, setCompetitiveTiers] = useState<CompetitiveTierRecord | null>(null);
  const [selectedForm, setSelectedForm] = useState<string>('');

  // Load adjacent Pokemon for navigation
  const loadAdjacentPokemon = useCallback(async (currentId: number) => {
    try {
      const prevId = currentId - 1;
      const nextId = currentId + 1;
      
      const promises = [];
      
      // Load previous Pokemon if valid ID
      if (prevId > 0) {
        promises.push(fetchPokemon(prevId.toString()));
      } else {
        promises.push(Promise.resolve(null));
      }
      
      // Load next Pokemon if within known range (Gen 9 limit)
      if (nextId <= 1025) {
        promises.push(fetchPokemon(nextId.toString()));
      } else {
        promises.push(Promise.resolve(null));
      }
      
      const [prevData, nextData] = await Promise.allSettled(promises);
      
      setAdjacentPokemon({
        prev: prevData.status === 'fulfilled' && prevData.value ? {
          id: Number(prevData.value.id),
          name: prevData.value.name,
          types: prevData.value.types || []
        } : null,
        next: nextData.status === 'fulfilled' && nextData.value ? {
          id: Number(nextData.value.id),
          name: nextData.value.name,
          types: nextData.value.types || []
        } : null
      });
    } catch (err) {
      console.error('Error loading adjacent Pokemon:', err);
    }
  }, []);

  // Handle navigation
  const handleNavigate = useCallback((pokemonId: number) => {
    router.push(`/pokedex/${pokemonId}`);
  }, [router]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && adjacentPokemon.prev) {
        handleNavigate(adjacentPokemon.prev.id);
      } else if (e.key === 'ArrowRight' && adjacentPokemon.next) {
        handleNavigate(adjacentPokemon.next.id);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [adjacentPokemon, handleNavigate]);

  // Load specific nature data (cached)
  const loadNatureData = useCallback(async (natureName: string) => {
    try {
      const data = await fetchNature(natureName);
      setNatureData(data);
    } catch (err) {
      console.error('Error loading nature data:', err);
    }
  }, []);

  // Load all available natures
  const loadAllNatures = useCallback(async () => {
    try {
      const response = await fetchData('https://pokeapi.co/api/v2/nature/') as { results: { name: string; url: string }[] };
      // Load full data for each nature
      const naturesWithData = await Promise.all(
        response.results.map(async (nature: { name: string; url: string }) => {
          try {
            const natureData = await fetchData(nature.url);
            return natureData;
          } catch (err) {
            console.error(`Error loading nature ${nature.name}:`, err);
            return { name: nature.name };
          }
        })
      );
      setAllNatures(naturesWithData as Nature[]);
      // Load default nature data
      await loadNatureData('hardy');
    } catch (err) {
      console.error('Error loading natures:', err);
    }
  }, [loadNatureData]);

  // Handle form changes
  const handleFormChange = useCallback((formName: string) => {
    if (formName === selectedForm) return;
    
    // Extract base pokemon ID from current species
    const baseId = species?.id || pokeid as string;
    const baseName = species?.name || pokeid as string;
    const isDefaultForm = species?.varieties?.find(v => v.pokemon.name === formName)?.is_default;
    
    // Update URL with form parameter
    if (isDefaultForm || formName === baseName) {
      // Default form - remove form parameter
      router.push(`/pokedex/${baseId}`, undefined, { shallow: false });
    } else {
      // Alternate form - add form parameter
      // Remove base name prefix to get form suffix
      let formSuffix = formName;
      if (formName.startsWith(baseName + '-')) {
        formSuffix = formName.substring(baseName.length + 1);
      }
      router.push(`/pokedex/${baseId}?form=${formSuffix}`, undefined, { shallow: false });
    }
  }, [pokeid, selectedForm, species, router]);

  useEffect(() => {
    // Wait for router to be ready and pokeid to be available
    if (!router.isReady || !pokeid) return;

    const loadPokemon = async () => {
      try {
        setLoading(true);
        setError(null);

        // console.log('Loading Pokemon with ID:', pokeid, 'Form:', form);
        
        // Handle regional forms
        let pokemonIdentifier: string;
        if (form && typeof form === 'string') {
          // Construct regional form name (e.g., "vulpix-alolan")
          pokemonIdentifier = `${pokeid as string}-${form.toLowerCase()}`;
        } else {
          pokemonIdentifier = pokeid as string;
        }
        
        // Sanitize the Pokemon identifier for API calls
        const sanitizedId = sanitizePokemonName(pokemonIdentifier);

        // Load critical Pokemon and species data in parallel first
        const pokemonData = await fetchPokemon(sanitizedId);
        
        // For species, always use the base Pokemon ID (numeric part)
        const baseSpeciesId = pokemonData.species?.url?.split('/').filter(Boolean).pop() || pokeid;
        const speciesData = await fetchPokemonSpecies(baseSpeciesId);

        setPokemon(pokemonData);
        setSpecies(speciesData);
        setSelectedForm(pokemonData.name); // Set the current form

        // Set loading to false immediately for faster perceived performance
        setLoading(false);
        
        // Load type chart from Showdown data
        loadTypeChart().catch(() => {
          // Type chart load failure is not critical
        });
        
        // Load competitive tiers from Showdown data
        showdownQueries.getPokemonTiers(pokemonData.name).then(tiers => {
          if (tiers) {
            setCompetitiveTiers(tiers);
          }
        }).catch(err => {
          console.warn('[Showdown Data] Failed to load competitive tiers:', err);
        });
        
        // Reset tab to saved preference on Pokemon change
        // Temporarily disabled to fix Fast Refresh loop
        // try {
        //   if (typeof window !== 'undefined') {
        //     const pokemonId = pokemonData.id;
        //     const savedTab = localStorage.getItem(`pokemon-tab-${pokemonId}`);
        //     if (savedTab && ['overview', 'stats', 'evolution', 'moves', 'breeding', 'locations', 'cards', 'competitive'].includes(savedTab)) {
        //       setActiveTab(savedTab as PokemonTab);
        //     }
        //   }
        // } catch (err) {
        //   console.warn('Failed to read localStorage for tab preference:', err);
        // }

        // Load secondary data in parallel (non-blocking)
        const secondaryDataPromises = [
          // Load abilities data
          pokemonData.abilities ? loadAbilities(pokemonData.abilities) : Promise.resolve(),
          // Load adjacent Pokemon for navigation
          loadAdjacentPokemon(Number(pokemonData.id)),
          // Load all natures
          loadAllNatures()
        ];

        // Start secondary data loading without waiting
        Promise.allSettled(secondaryDataPromises).catch(err => {
          console.warn('[Secondary Data] Some secondary data failed to load:', err);
        });

        // Defer heavy/optional data loading using requestIdleCallback
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            // Load location encounters (deferred)
            if (pokemonData.location_area_encounters) {
              loadLocationEncounters(pokemonData.location_area_encounters).catch(err => {
                console.warn('[Location Data] Failed to load location data:', err);
              });
            }

            // Load evolution chain (deferred)
            if (speciesData.evolution_chain) {
              loadEvolutionChain(speciesData.evolution_chain.url).catch(err => {
                console.warn('[Evolution Data] Failed to load evolution data:', err);
              });
            }

            // Load TCG cards for this Pokemon (deferred)
            // Delay card loading to prevent Fast Refresh loops
            setTimeout(() => {
              loadCards(pokemonData.name).catch(err => {
                console.warn('[Card Loading] Background card load failed:', err);
              });
            }, 500);
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            if (pokemonData.location_area_encounters) {
              loadLocationEncounters(pokemonData.location_area_encounters).catch(err => {
                console.warn('[Location Data] Failed to load location data:', err);
              });
            }

            if (speciesData.evolution_chain) {
              loadEvolutionChain(speciesData.evolution_chain.url).catch(err => {
                console.warn('[Evolution Data] Failed to load evolution data:', err);
              });
            }

            // Delay card loading to prevent Fast Refresh loops
            setTimeout(() => {
              loadCards(pokemonData.name).catch(err => {
                console.warn('[Card Loading] Background card load failed:', err);
              });
            }, 500);
          }, 100);
        }

      } catch (err: any) {
        console.error('Error loading Pokemon:', err);
        setError(`Failed to load Pokemon data: ${err.message}`);
        setLoading(false);
      }
    };

    loadPokemon();
  }, [router.isReady, pokeid, form, loadAllNatures, loadAdjacentPokemon]);

  // Load location encounters
  const loadLocationEncounters = async (encountersUrl?: string) => {
    if (!encountersUrl) return;
    
    try {
      const encounters = await fetchData(encountersUrl);
      setLocationAreaEncounters(encounters as LocationAreaEncounterDetail[]);
    } catch (err) {
      console.error('Error loading location encounters:', err);
      setLocationAreaEncounters([]);
    }
  };

  // Load evolution chain
  const loadEvolutionChain = async (evolutionUrl: string) => {
    if (!evolutionUrl) return;
    
    try {
      const chainData = await fetchData(evolutionUrl);
      setEvolutionChain(chainData as EvolutionChain);
    } catch (err) {
      console.error('Error loading evolution chain:', err);
      setEvolutionChain(null);
    }
  };


  // Handle nature change
  const handleNatureChange = async (nature: string) => {
    setSelectedNature(nature);
    await loadNatureData(nature);
  };

  // Load abilities data
  const loadAbilities = async (abilitiesList?: PokemonAbility[]) => {
    if (!abilitiesList || abilitiesList.length === 0) return;
    
    const abilitiesData: Record<string, AbilityData> = {};
    
    for (const abilityInfo of abilitiesList) {
      try {
        const abilityData = await fetchData<AbilityApiData>(abilityInfo.ability.url);
        const englishEntry = abilityData.effect_entries.find(entry => entry.language.name === 'en');
        
        abilitiesData[abilityInfo.ability.name] = {
          name: abilityInfo.ability.name,
          isHidden: abilityInfo.is_hidden,
          effect: englishEntry?.effect || 'No description available.',
          short_effect: englishEntry?.short_effect || 'No short description available.'
        };
      } catch (err) {
        console.error(`Error loading ability ${abilityInfo.ability.name}:`, err);
      }
    }
    
    setAbilities(abilitiesData);
  };

  // Load cards for this Pokemon
  const loadCards = async (pokemonName: string) => {
    if (!pokemonName) return;
    
    setCardsLoading(true);
    
    try {
      // Create a timeout promise to ensure we don't block too long
      const timeoutPromise = new Promise<[any[], any[]]>((_, reject) => 
        setTimeout(() => reject(new Error('Card loading timeout')), 5000)
      );
      
      // Load both card types in parallel with timeout
      const [tcgCardsData, pocketCardsData] = await Promise.race([
        Promise.all([
          fetchTCGCards(pokemonName)
            .catch(err => {
              console.error('[Card Loading] TCG cards error:', err);
              console.error('[Card Loading] TCG cards error details:', err.message, err.stack);
              return [];
            }),
          fetchPocketCards(pokemonName).catch(err => {
            console.error('[Card Loading] Pocket cards error:', err);
            return [];
          })
        ]),
        timeoutPromise
      ]).catch(() => {
        console.warn('[Card Loading] Timeout reached, using empty arrays');
        return [[], []];
      });
      
      
      setTcgCards(tcgCardsData || []);
      setPocketCards(pocketCardsData || []);
    } catch (err) {
      console.error('[Card Loading] Unexpected error:', err);
      setTcgCards([]);
      setPocketCards([]);
    } finally {
      setCardsLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <PageLoader text="Loading Pokémon details..." />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <CircularButton
            onClick={() => router.push('/pokedex')}
            variant="primary"
          >
            Back to Pokédex
          </CircularButton>
        </div>
      </div>
    );
  }

  // No data state
  if (!pokemon || !species) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Pokémon not found</p>
          <CircularButton
            onClick={() => router.push('/pokedex')}
            variant="primary"
          >
            Back to Pokédex
          </CircularButton>
        </div>
      </div>
    );
  }

  // Get theme based on Pokemon types
  const theme = getPokemonTheme(pokemon.types);

  return (
    <PageErrorBoundary pageName="Pokemon Detail">
      <Head>
        <title>{pokemon?.name ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) : 'Pokemon'} - Pokédex | DexTrends</title>
        <meta 
          name="description" 
          content={`View detailed information about ${pokemon?.name || 'this Pokemon'}, including stats, abilities, evolution chain, and more.`} 
        />
      </Head>
      
      <FullBleedWrapper 
        gradient="pokemon-type"
        pokemonTypes={pokemon.types}
      >
        <div className="min-h-screen">
          {/* Navigation Header */}
          <motion.div 
            className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 dark:bg-gray-900/5"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="border-b border-white/20 dark:border-gray-700/20">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <CircularButton
                    onClick={() => router.push('/pokedex')}
                    variant="secondary"
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    }
                  >
                    Back to Pokédex
                  </CircularButton>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <PokemonHeroSectionV3 
                pokemon={pokemon}
                species={species}
                showShiny={showShiny}
                onShinyToggle={() => setShowShiny(!showShiny)}
                onFormChange={handleFormChange}
              />
            </motion.div>

            {/* Tab System */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <PokemonTabSystem
                pokemon={pokemon}
                species={species}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tcgCards={tcgCards}
                pocketCards={pocketCards}
                abilities={abilities}
                evolutionChain={evolutionChain}
                locationEncounters={locationAreaEncounters}
                natureData={natureData}
                allNatures={allNatures}
                onNatureChange={handleNatureChange}
                selectedNature={selectedNature}
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
                competitiveTiers={competitiveTiers}
              />
            </motion.div>
          </div>
          
          {/* Navigation Arrows */}
          <NavigationArrow 
            direction="prev" 
            pokemon={adjacentPokemon.prev} 
            onClick={() => adjacentPokemon.prev && handleNavigate(adjacentPokemon.prev.id)}
          />
          <NavigationArrow 
            direction="next" 
            pokemon={adjacentPokemon.next} 
            onClick={() => adjacentPokemon.next && handleNavigate(adjacentPokemon.next.id)}
          />
          
          {/* Floating Action Bar */}
          <FloatingActionBar pokemon={pokemon} />
        </div>
      </FullBleedWrapper>
    </PageErrorBoundary>
  );
};

// Tell Layout to use fullBleed mode
(PokemonDetail as any).fullBleed = true;

export default PokemonDetail;