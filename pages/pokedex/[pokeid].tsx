import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { NextPage } from "next";
import { motion } from "framer-motion";
import { fetchJSON } from "../../utils/unifiedFetch";
import RouteErrorBoundary from "../../components/RouteErrorBoundary";
import { sanitizePokemonName } from "../../utils/pokemonNameSanitizer";
import { fetchTCGCards, fetchPocketCards } from "../../utils/apiutils";
import logger from "../../utils/logger";
import { POKEAPI } from "../../config/api";
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
} from "../../types/pokemon";
import type { TCGCard } from "../../types/api/cards";
import type { PocketCard } from "../../types/api/pocket-cards";
import PokemonHeroSectionV3 from "../../components/pokemon/PokemonHeroSectionV3";
import PokemonTabSystem from "../../components/pokemon/PokemonTabSystem";
import FloatingActionBar from "../../components/pokemon/FloatingActionBar";
import { DetailPageSkeleton } from '@/components/ui/SkeletonLoadingSystem';
import { FullBleedWrapper } from "../../components/ui";
import { PageErrorBoundary } from "../../components/ui";
import { CircularButton } from "../../components/ui/design-system";
import { getPokemonTheme } from "../../utils/pokemonAnimations";
import NavigationArrow from "../../components/pokemon/NavigationArrow";
import { MobileLayout } from "../../components/mobile/MobileLayout";
import { useMobileDetection } from '@/hooks/useMobileDetection';
import BottomSheet from "../../components/mobile/BottomSheet";
import EnhancedSwipeGestures from "../../components/mobile/EnhancedSwipeGestures";
import { PullToRefresh } from "../../components/mobile/PullToRefresh";
import { ProgressiveImage } from "../../components/ui/ProgressiveImage";
import MobilePokemonDetail from "../../components/pokemon/MobilePokemonDetail";

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
  
  // Mobile detection with SSR support
  const { isMobile: isMobileView, isLoading: isMobileLoading } = useMobileDetection();
  
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
        promises.push(fetchJSON<Pokemon>(POKEAPI.pokemon(prevId)));
      } else {
        promises.push(Promise.resolve(null));
      }
      
      // Load next Pokemon if within known range (Gen 9 limit)
      if (nextId <= 1025) {
        promises.push(fetchJSON<Pokemon>(POKEAPI.pokemon(nextId)));
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
      logger.error('Error loading adjacent Pokemon:', { error: err instanceof Error ? err.message : String(err) });
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
      const data = await fetchJSON<Nature>(POKEAPI.nature(natureName));
      if (data) {
        setNatureData(data);
      } else {
        logger.error('Failed to fetch nature data:', { natureName });
      }
    } catch (err) {
      logger.error('Error loading nature data:', { error: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  // Load all available natures
  const loadAllNatures = useCallback(async () => {
    try {
      const response = await fetchJSON<{ results: { name: string; url: string }[] }>(POKEAPI.natureList());
      if (!response) {
        logger.error('Failed to fetch natures list');
        return;
      }
      // Load full data for each nature
      const naturesWithData = await Promise.all(
        response.results.map(async (nature: { name: string; url: string }) => {
          try {
            const natureData = await fetchJSON<Nature>(nature.url);
            return natureData || { name: nature.name };
          } catch (err) {
            logger.error(`Error loading nature ${nature.name}:`, { error: err instanceof Error ? err.message : String(err) });
            return { name: nature.name };
          }
        })
      );
      setAllNatures(naturesWithData as Nature[]);
      // Load default nature data
      await loadNatureData('hardy');
    } catch (err) {
      logger.error('Error loading natures:', { error: err instanceof Error ? err.message : String(err) });
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

        // logger.debug('Loading Pokemon with ID:', { pokeid, form });
        
        // First, determine if we're dealing with a numeric ID or a name
        let pokemonIdentifier: string = pokeid as string;
        
        // If we have a form parameter, we need to construct the full form name
        if (form && typeof form === 'string') {
          // Try to load species data first if pokeid is numeric
          if (/^\d+$/.test(pokeid as string)) {
            // It's a numeric ID, we need to get the Pokemon name first
            try {
              const baseSpeciesData = await fetchJSON<PokemonSpecies>(POKEAPI.species(pokeid as string));
              if (baseSpeciesData) {
                pokemonIdentifier = `${baseSpeciesData.name}-${form.toLowerCase()}`;
              } else {
                pokemonIdentifier = `${pokeid as string}-${form.toLowerCase()}`;
              }
            } catch (error) {
              // If species fetch fails, try with the form anyway
              pokemonIdentifier = `${pokeid as string}-${form.toLowerCase()}`;
            }
          } else {
            // It's already a name, just append the form
            pokemonIdentifier = `${pokeid as string}-${form.toLowerCase()}`;
          }
        }
        
        // Sanitize the Pokemon identifier for API calls
        const sanitizedId = sanitizePokemonName(pokemonIdentifier);

        // Load Pokemon data
        const pokemonData = await fetchJSON<Pokemon>(POKEAPI.pokemon(sanitizedId));
        if (!pokemonData) {
          throw new Error(`Pokemon not found: ${sanitizedId}`);
        }
        
        // For species, always use the base Pokemon ID (numeric part)
        const baseSpeciesId = pokemonData.species?.url?.split('/').filter(Boolean).pop() || (typeof pokeid === 'string' ? pokeid : pokeid[0]);
        const speciesData = await fetchJSON<PokemonSpecies>(POKEAPI.species(baseSpeciesId));
        if (!speciesData) {
          throw new Error(`Species not found: ${baseSpeciesId}`);
        }

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
          logger.warn('[Showdown Data] Failed to load competitive tiers:', { error: err instanceof Error ? err.message : String(err) });
        });
        

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
          logger.warn('[Secondary Data] Some secondary data failed to load:', { error: err instanceof Error ? err.message : String(err) });
        });

        // Defer heavy/optional data loading using requestIdleCallback
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            // Load location encounters (deferred)
            if (pokemonData.location_area_encounters) {
              loadLocationEncounters(pokemonData.location_area_encounters).catch(err => {
                logger.warn('[Location Data] Failed to load location data:', { error: err instanceof Error ? err.message : String(err) });
              });
            }

            // Load evolution chain (deferred)
            if (speciesData.evolution_chain) {
              loadEvolutionChain(speciesData.evolution_chain.url).catch(err => {
                logger.warn('[Evolution Data] Failed to load evolution data:', { error: err instanceof Error ? err.message : String(err) });
              });
            }

            // Load TCG cards for this Pokemon (deferred)
            // Delay card loading to prevent Fast Refresh loops
            setTimeout(() => {
              loadCards(pokemonData.name).catch(err => {
                logger.warn('[Card Loading] Background card load failed:', { error: err instanceof Error ? err.message : String(err) });
              });
            }, 500);
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            if (pokemonData.location_area_encounters) {
              loadLocationEncounters(pokemonData.location_area_encounters).catch(err => {
                logger.warn('[Location Data] Failed to load location data:', { error: err instanceof Error ? err.message : String(err) });
              });
            }

            if (speciesData.evolution_chain) {
              loadEvolutionChain(speciesData.evolution_chain.url).catch(err => {
                logger.warn('[Evolution Data] Failed to load evolution data:', { error: err instanceof Error ? err.message : String(err) });
              });
            }

            // Delay card loading to prevent Fast Refresh loops
            setTimeout(() => {
              loadCards(pokemonData.name).catch(err => {
                logger.warn('[Card Loading] Background card load failed:', { error: err instanceof Error ? err.message : String(err) });
              });
            }, 500);
          }, 100);
        }

      } catch (err: unknown) {
        logger.error('Error loading Pokemon:', { error: err instanceof Error ? err.message : String(err) });
        setError(`Failed to load Pokemon data: ${err instanceof Error ? err.message : String(err)}`);
        setLoading(false);
      }
    };

    loadPokemon();
  }, [router.isReady, pokeid, form, loadAllNatures, loadAdjacentPokemon]);

  // Load location encounters
  const loadLocationEncounters = async (encountersUrl?: string) => {
    if (!encountersUrl) return;
    
    try {
      const encounters = await fetchJSON<LocationAreaEncounterDetail[]>(encountersUrl);
      if (encounters) {
        setLocationAreaEncounters(encounters);
      } else {
        setLocationAreaEncounters([]);
      }
    } catch (err) {
      logger.error('Error loading location encounters:', { error: err instanceof Error ? err.message : String(err) });
      setLocationAreaEncounters([]);
    }
  };

  // Load evolution chain
  const loadEvolutionChain = async (evolutionUrl: string) => {
    if (!evolutionUrl) return;
    
    try {
      const chainData = await fetchJSON<EvolutionChain>(evolutionUrl);
      if (chainData) {
        setEvolutionChain(chainData);
      } else {
        setEvolutionChain(null);
      }
    } catch (err) {
      logger.error('Error loading evolution chain:', { error: err instanceof Error ? err.message : String(err) });
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
        const abilityData = await fetchJSON<AbilityApiData>(abilityInfo.ability.url);
        if (!abilityData) {
          logger.error(`Failed to fetch ability data for ${abilityInfo.ability.name}`);
          continue;
        }
        const englishEntry = abilityData.effect_entries.find(entry => entry.language.name === 'en');
        
        abilitiesData[abilityInfo.ability.name] = {
          name: abilityInfo.ability.name,
          isHidden: abilityInfo.is_hidden,
          effect: englishEntry?.effect || 'No description available.',
          short_effect: englishEntry?.short_effect || 'No short description available.'
        };
      } catch (err) {
        logger.error(`Error loading ability ${abilityInfo.ability.name}:`, { error: err instanceof Error ? err.message : String(err) });
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
              logger.error('[Card Loading] TCG cards error:', {
                error: err instanceof Error ? err.message : String(err),
                stack: err instanceof Error ? err.stack : undefined
              });
              return [];
            }),
          fetchPocketCards(pokemonName).catch(err => {
            logger.error('[Card Loading] Pocket cards error:', { error: err instanceof Error ? err.message : String(err) });
            return [];
          })
        ]),
        timeoutPromise
      ]).catch(() => {
        logger.warn('[Card Loading] Timeout reached, using empty arrays');
        return [[], []];
      });
      
      
      logger.debug('[pokeid] Setting card data', {
        tcgCardsCount: tcgCardsData?.length || 0,
        pocketCardsCount: pocketCardsData?.length || 0,
        tcgCardsIsArray: Array.isArray(tcgCardsData),
        pocketCardsIsArray: Array.isArray(pocketCardsData),
        firstTcgCard: tcgCardsData?.[0]
      });
      setTcgCards(tcgCardsData || []);
      setPocketCards(pocketCardsData || []);
    } catch (err) {
      logger.error('[Card Loading] Unexpected error:', { error: err instanceof Error ? err.message : String(err) });
      setTcgCards([]);
      setPocketCards([]);
    } finally {
      setCardsLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <FullBleedWrapper>
        <DetailPageSkeleton 
          variant="pokemon"
          showHeader={true}
          showImage={true}
          showStats={true}
          showTabs={true}
          showRelated={true}
        />
      </FullBleedWrapper>
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

  // Mobile view - check first to ensure mobile renders when ready
  if (isMobileView && pokemon && species) {
    return (
      <PageErrorBoundary pageName="Pokemon Detail Mobile">
        <Head>
          <title>{pokemon.name ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) : 'Pokemon'} - Pokédex | DexTrends</title>
          <meta 
            name="description" 
            content={`View detailed information about ${pokemon.name || 'this Pokemon'}, including stats, abilities, evolution chain, and more.`} 
          />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        </Head>
        
        <MobileLayout
          hasBottomNav={false}
          hasHeader={true}
          headerTitle={pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          backgroundColor="gradient"
          fullHeight={true}
        >
          <MobilePokemonDetail
            pokemon={pokemon}
            species={species}
            evolutionChain={evolutionChain}
            abilities={abilities}
            tcgCards={tcgCards}
            pocketCards={pocketCards}
            showShiny={showShiny}
            onShinyToggle={() => setShowShiny(!showShiny)}
            adjacentPokemon={adjacentPokemon}
            router={router}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            selectedForm={selectedForm}
            onFormChange={handleFormChange}
            locationEncounters={locationAreaEncounters}
            natureData={natureData}
            allNatures={allNatures}
            selectedNature={selectedNature}
            onNatureChange={handleNatureChange}
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
            competitiveTiers={competitiveTiers}
          />
        </MobileLayout>
      </PageErrorBoundary>
    );
  }

  // Desktop view
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
          <div className="container mx-auto px-2 xs:px-3 sm:px-4 py-4 xs:py-6 sm:py-8 space-y-4 xs:space-y-6 sm:space-y-8">
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