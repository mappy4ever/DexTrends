import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { fetchJSON } from '@/utils/unifiedFetch';
import logger from '@/utils/logger';
import { cn } from '@/utils/cn';
import { Container } from '@/components/ui/Container';
import UnifiedCacheManager from '@/utils/UnifiedCacheManager';

interface PokemonEvolution {
  id: number;
  name: string;
  types?: string[];
  sprite: string;
  spriteShiny?: string;
  level?: number;
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
    total: number;
  };
}

interface StarterPokemon {
  id: number;
  name: string;
  types: string[];
  sprite: string;
  spriteShiny?: string;
  artwork: string;
  artworkShiny?: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    spAttack: number;
    spDefense: number;
    speed: number;
    total: number;
  };
  abilities: {
    name: string;
    isHidden: boolean;
  }[];
  evolutions: PokemonEvolution[];
  height: number;
  weight: number;
  genus?: string;
  description?: string;
}

interface EnhancedStarterSelectorProps {
  region: string;
  regionName: string;
  starterIds: number[];
  starterNames: string[];
  color?: string;
  onSelectStarter?: (pokemon: StarterPokemon) => void;
  showComparison?: boolean;
}

// Ability descriptions mapping
const abilityDescriptions: Record<string, string> = {
  'overgrow': 'Powers up Grass-type moves when HP is low.',
  'chlorophyll': 'Boosts Speed stat in sunshine.',
  'blaze': 'Powers up Fire-type moves when HP is low.',
  'solar-power': 'Boosts Special Attack in sunshine, but HP decreases.',
  'torrent': 'Powers up Water-type moves when HP is low.',
  'rain-dish': 'The Pokemon gradually regains HP in rain.',
  'swarm': 'Powers up Bug-type moves when HP is low.',
  'shed-skin': 'The Pokemon may heal its own status problems.',
  'compound-eyes': 'Increases accuracy of moves.',
  'shield-dust': 'Blocks additional effects of attacks.',
  'run-away': 'Enables a sure getaway from wild Pokemon.',
  'guts': 'Boosts Attack if there is a status problem.',
  'hustle': 'Boosts Attack, but lowers accuracy.',
  'intimidate': 'Lowers the opposing Pokemon\'s Attack stat.',
  'unnerve': 'Makes the foe nervous and unable to eat berries.',
  'static': 'Contact with the Pokemon may cause paralysis.',
  'lightning-rod': 'Draws in all Electric-type moves to up Special Attack.',
  'adaptability': 'Powers up moves of the same type.',
  'anticipation': 'Senses a foe\'s dangerous moves.',
  'synchronize': 'Passes a burn, poison, or paralysis to the foe.',
  'inner-focus': 'Protects from flinching.',
  'magic-guard': 'Protects from indirect damage.',
  'bulletproof': 'Protects from ball and bomb moves.',
  'soundproof': 'Gives immunity to sound-based moves.',
  'thick-fat': 'Ups resistance to Fire and Ice-type moves.',
  'sap-sipper': 'Boosts Attack when hit by a Grass-type move.',
  'hydration': 'Heals status problems if it is raining.',
  'ice-body': 'HP is gradually restored in a hailstorm.',
  'snow-cloak': 'Raises evasion in a hailstorm.',
  'sand-veil': 'Boosts evasion in a sandstorm.',
  'sand-rush': 'Boosts Speed in a sandstorm.',
  'pickup': 'The Pokemon may pick up items.',
  'technician': 'Powers up weaker moves.',
  'skill-link': 'Increases the frequency of multi-strike moves.',
  'sniper': 'Powers up critical hits.',
  'super-luck': 'Heightens critical-hit ratios.',
  'damp': 'Prevents the use of self-destructing moves.',
  'cloud-nine': 'Eliminates effects of weather.',
  'vital-spirit': 'Prevents the Pokemon from falling asleep.',
  'insomnia': 'Prevents the Pokemon from falling asleep.',
  'early-bird': 'Awakens quickly from sleep.',
  'flash-fire': 'Powers up if hit by Fire-type moves.',
  'drought': 'Turns the sunlight harsh when entering battle.',
  'drizzle': 'Makes it rain when entering battle.',
  'sand-stream': 'Summons a sandstorm when entering battle.',
  'snow-warning': 'Summons a hailstorm when entering battle.',
  'tangled-feet': 'Raises evasion if confused.',
  'motor-drive': 'Raises Speed if hit by Electric-type moves.',
  'rivalry': 'Deals more damage to Pokemon of same gender.',
  'steadfast': 'Raises Speed when flinched.',
  'gluttony': 'Uses held berries earlier.',
  'anger-point': 'Maxes Attack after taking a critical hit.',
  'unburden': 'Raises Speed if a held item is used.',
  'simple': 'Doubles stat changes.',
  'unaware': 'Ignores stat changes in the opponent.',
  'moody': 'Raises one stat and lowers another.',
  'overcoat': 'Protects from weather damage and powder moves.',
  'poison-touch': 'May poison targets when making contact.',
  'regenerator': 'Restores HP when switching out.',
  'big-pecks': 'Protects from Defense drops.',
  'keen-eye': 'Prevents accuracy loss.',
  'defiant': 'Attack sharply rises when stats are lowered.',
  'competitive': 'Sharply raises Sp. Atk when stats are lowered.',
  'libero': 'Changes type to match the move being used.',
  'protean': 'Changes type to match the move being used.',
  'grassy-surge': 'Turns the ground into Grassy Terrain when entering battle.',
  'liquid-voice': 'All sound-based moves become Water-type moves.'
};

// Helper function to get ability description
const getAbilityDescription = (abilityName: string): string => {
  const key = abilityName.toLowerCase();
  return abilityDescriptions[key] || 'This ability has a unique effect in battle.';
};

// Type color mappings
const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  grass: { 
    bg: 'bg-gradient-to-br from-green-400/20 to-emerald-500/20', 
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-400/50'
  },
  fire: { 
    bg: 'bg-gradient-to-br from-red-400/20 to-orange-500/20', 
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-400/50'
  },
  water: {
    bg: 'bg-gradient-to-br from-cyan-400/20 to-cyan-500/20',
    text: 'text-cyan-700 dark:text-cyan-300',
    border: 'border-cyan-400/50'
  },
  flying: {
    bg: 'bg-gradient-to-br from-amber-400/20 to-sky-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-400/50'
  },
  dark: {
    bg: 'bg-gradient-to-br from-stone-700/20 to-stone-900/20',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-600/50'
  },
  psychic: {
    bg: 'bg-gradient-to-br from-pink-400/20 to-amber-500/20',
    text: 'text-pink-700 dark:text-pink-300',
    border: 'border-pink-400/50'
  },
  poison: {
    bg: 'bg-gradient-to-br from-amber-400/20 to-pink-500/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-400/50'
  },
  fighting: { 
    bg: 'bg-gradient-to-br from-red-600/20 to-orange-600/20', 
    text: 'text-red-800 dark:text-red-300',
    border: 'border-red-600/50'
  },
  ground: { 
    bg: 'bg-gradient-to-br from-yellow-600/20 to-amber-600/20', 
    text: 'text-yellow-800 dark:text-yellow-300',
    border: 'border-yellow-600/50'
  }
};

const EnhancedStarterSelector: React.FC<EnhancedStarterSelectorProps> = ({
  region,
  regionName,
  starterIds,
  starterNames,
  color = 'from-amber-500 to-pink-500',
  onSelectStarter,
  showComparison = false
}) => {
  const router = useRouter();
  const [starters, setStarters] = useState<StarterPokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [selectedStarter, setSelectedStarter] = useState<number | null>(null);
  const [hoveredStarter, setHoveredStarter] = useState<number | null>(null);
  const [expandedStarter, setExpandedStarter] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showShiny, setShowShiny] = useState(false);
  const [selectedEvolution, setSelectedEvolution] = useState<PokemonEvolution | null>(null);

  useEffect(() => {
    const fetchStarterData = async () => {
      try {
        setLoading(true);
        
        // Check cache first for all starters
        const cachedStarters: StarterPokemon[] = [];
        const startersToFetch: number[] = [];
        
        // Check which starters are cached
        for (const id of starterIds) {
          const cacheKey = `starter_${region}_${id}`;
          const cached = await UnifiedCacheManager.get(cacheKey);
          
          if (cached) {
            cachedStarters.push(cached as StarterPokemon);
          } else {
            startersToFetch.push(id);
          }
        }
        
        // Immediately show cached starters
        if (cachedStarters.length > 0) {
          setStarters(cachedStarters);
          setLoading(false);
        }
        
        // If all starters are cached, we're done
        if (startersToFetch.length === 0) {
          return;
        }
        
        // Fetch missing starters in parallel
        const fetchPromises = startersToFetch.map(async (id) => {
          setLoadingStates(prev => ({ ...prev, [id]: true }));
          
          try {
            // Fetch Pokemon and species data in parallel
            const [pokemonData, speciesData] = await Promise.all([
              fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`),
              fetchJSON(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
            ]);
            
            // Get evolution chain URL
            const evolutionChainUrl = (speciesData as any).evolution_chain.url;
            const evolutionData: any = await fetchJSON(evolutionChainUrl);
            
            // Parse evolution chain with parallel fetching
            const evolutions: PokemonEvolution[] = [];
            const evolutionFetches: Promise<any>[] = [];
            const evolutionDetails: any[] = [];
            
            // Collect all evolution species to fetch
            let currentEvolution = evolutionData.chain;
            while (currentEvolution) {
              evolutionDetails.push({
                name: currentEvolution.species.name,
                level: currentEvolution.evolution_details[0]?.min_level
              });
              evolutionFetches.push(fetchJSON(`https://pokeapi.co/api/v2/pokemon/${currentEvolution.species.name}`));
              currentEvolution = currentEvolution.evolves_to[0];
            }
            
            // Fetch all evolutions in parallel
            const evolutionDataArray = await Promise.all(evolutionFetches);
            
            // Build evolution array
            evolutionDataArray.forEach((evoData: any, index) => {
              evolutions.push({
                id: evoData.id,
                name: evoData.name,
                level: evolutionDetails[index].level,
                sprite: evoData.sprites.front_default,
                spriteShiny: evoData.sprites.front_shiny,
                types: evoData.types.map((t: any) => t.type.name),
                stats: {
                  hp: evoData.stats[0].base_stat,
                  attack: evoData.stats[1].base_stat,
                  defense: evoData.stats[2].base_stat,
                  spAttack: evoData.stats[3].base_stat,
                  spDefense: evoData.stats[4].base_stat,
                  speed: evoData.stats[5].base_stat,
                  total: evoData.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)
                }
              });
            });

            // Get English genus and description
            const genus = (speciesData as any).genera.find((g: any) => g.language.name === 'en')?.genus || '';
            const description = (speciesData as any).flavor_text_entries.find((f: any) => f.language.name === 'en')?.flavor_text
              ?.replace(/\f/g, ' ')
              ?.replace(/\n/g, ' ') || '';

            const starter: StarterPokemon = {
              id: (pokemonData as any).id,
              name: (pokemonData as any).name,
              types: (pokemonData as any).types.map((t: any) => t.type.name),
              sprite: (pokemonData as any).sprites.front_default,
              spriteShiny: (pokemonData as any).sprites.front_shiny,
              artwork: (pokemonData as any).sprites.other['official-artwork'].front_default,
              artworkShiny: (pokemonData as any).sprites.other['official-artwork'].front_shiny,
              stats: {
                hp: (pokemonData as any).stats[0].base_stat,
                attack: (pokemonData as any).stats[1].base_stat,
                defense: (pokemonData as any).stats[2].base_stat,
                spAttack: (pokemonData as any).stats[3].base_stat,
                spDefense: (pokemonData as any).stats[4].base_stat,
                speed: (pokemonData as any).stats[5].base_stat,
                total: (pokemonData as any).stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)
              },
              abilities: (pokemonData as any).abilities.map((a: any) => ({
                name: a.ability.name.replace(/-/g, ' '),
                isHidden: a.is_hidden
              })),
              evolutions,
              height: (pokemonData as any).height / 10, // Convert to meters
              weight: (pokemonData as any).weight / 10, // Convert to kg
              genus,
              description
            };
            
            // Cache the starter data
            const cacheKey = `starter_${region}_${id}`;
            await UnifiedCacheManager.set(cacheKey, starter, {
              ttl: 6 * 60 * 60 * 1000, // 6 hours
              priority: 2 // HIGH priority (memory + localStorage)
            });
            
            return starter;
          } catch (error) {
            logger.error(`Failed to fetch starter ${id}`, { error });
            return null;
          } finally {
            setLoadingStates(prev => ({ ...prev, [id]: false }));
          }
        });
        
        // Wait for all fetches to complete
        const fetchedStarters = await Promise.all(fetchPromises);
        const validStarters = fetchedStarters.filter(s => s !== null) as StarterPokemon[];
        
        // Combine cached and newly fetched starters, maintaining order
        const allStarters = starterIds.map(id => {
          const cached = cachedStarters.find(s => s.id === id);
          if (cached) return cached;
          return validStarters.find(s => s.id === id);
        }).filter(s => s !== undefined) as StarterPokemon[];
        
        setStarters(allStarters);
        setLoading(false);
      } catch (error) {
        logger.error('Failed to fetch starter data', { error });
        setLoading(false);
      }
    };

    fetchStarterData();
  }, [starterIds, region]);

  const handleSelectStarter = (starter: StarterPokemon) => {
    setSelectedStarter(starter.id);
    if (onSelectStarter) {
      onSelectStarter(starter);
    }
  };

  const handleCardClick = (starter: StarterPokemon) => {
    // Toggle expansion
    if (expandedStarter === starter.id) {
      setExpandedStarter(null);
      setSelectedEvolution(null);
    } else {
      setExpandedStarter(starter.id);
      setSelectedStarter(starter.id);
      setSelectedEvolution(null); // Reset evolution selection when switching starters
    }
  };

  const handleViewDetails = (pokemon: StarterPokemon) => {
    router.push(`/pokedex/${pokemon.id}`);
  };

  // Get stat bar width percentage
  const getStatPercentage = (value: number, max: number = 150) => {
    // Most Pokemon stats are under 150, with 255 being the absolute max
    // Using 150 as default provides better visual distribution
    return Math.min((value / max) * 100, 100);
  };

  // Get stat color based on stat value
  const getStatColor = (value: number) => {
    if (value >= 100) return 'from-green-500 to-emerald-500';  // Excellent
    if (value >= 80) return 'from-amber-500 to-cyan-500';      // Good
    if (value >= 60) return 'from-yellow-500 to-amber-500';   // Average
    if (value >= 40) return 'from-orange-500 to-orange-600';  // Below Average
    return 'from-red-500 to-red-600';                         // Poor
  };

  if (loading && starters.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-stone-400">Loading starter Pokemon...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Shiny Toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowShiny(!showShiny)}
          className="relative px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
          style={{
            background: showShiny
              ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
              : 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            border: showShiny
              ? '2px solid rgba(251, 191, 36, 0.3)'
              : '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: showShiny
              ? '0 8px 32px rgba(251, 191, 36, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
            color: showShiny ? 'white' : '#374151'
          }}
        >
          <span>{showShiny ? 'Shiny Color' : 'Normal Color'}</span>
        </button>
      </div>

      {/* Starter Cards Grid - Fixed Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {starterIds.map((starterId) => {
          const starter = starters.find(s => s.id === starterId);
          const isLoading = loadingStates[starterId];
          
          // Show skeleton while loading this specific starter
          if (!starter || isLoading) {
            return (
              <div key={starterId} className="relative group">
                <div className="rounded-3xl overflow-hidden animate-pulse"
                     style={{
                       background: 'rgba(255, 255, 255, 0.85)',
                       backdropFilter: 'blur(20px)',
                       border: '1px solid rgba(209, 213, 219, 0.3)',
                       boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                     }}>
                  <div className="p-6">
                    <div className="h-6 bg-stone-200 rounded w-24 mb-4"></div>
                    <div className="w-40 h-40 mx-auto mb-4 bg-stone-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-stone-200 rounded"></div>
                      <div className="h-3 bg-stone-200 rounded"></div>
                      <div className="h-3 bg-stone-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          
          const isSelected = selectedStarter === starter.id;
          const isHovered = hoveredStarter === starter.id;
          const isExpanded = expandedStarter === starter.id;
          const primaryType = starter.types[0];
          const typeStyle = typeColors[primaryType] || typeColors.grass;

          return (
            <div
              key={starter.id}
              className="relative group"
            >
              {/* Clickable Card */}
              <div 
                className={cn(
                  "cursor-pointer transform transition-all duration-300",
                  isHovered && !isExpanded && "scale-105 z-10"
                )}
                onMouseEnter={() => setHoveredStarter(starter.id)}
                onMouseLeave={() => setHoveredStarter(null)}
                onClick={() => handleCardClick(starter)}
              >
                <div 
                  className="relative h-full rounded-3xl overflow-hidden"
                  style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: isSelected
                      ? primaryType === 'grass' 
                        ? '2px solid rgba(34, 197, 94, 0.4)'
                        : primaryType === 'fire'
                        ? '2px solid rgba(239, 68, 68, 0.4)'
                        : '2px solid rgba(59, 130, 246, 0.4)'
                      : '1px solid rgba(209, 213, 219, 0.3)',
                    boxShadow: isSelected
                      ? primaryType === 'grass'
                        ? '0 12px 40px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                        : primaryType === 'fire'
                        ? '0 12px 40px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                        : '0 12px 40px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                      : isHovered
                      ? '0 16px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                      : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}
                >
                  {/* Type Background Gradient - Softer */}
                  <div className={cn("absolute inset-0 opacity-20", typeStyle.bg)} />
                  
                  {/* Pokeball Watermark - Centered with Pokemon image */}
                  <div className="absolute pointer-events-none flex items-center justify-center" style={{ 
                    top: '86px',  // Adjusted to keep centered with larger size
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '200px',  // Larger container
                    height: '200px',  // Larger container
                    zIndex: 1 
                  }}>
                    <svg 
                      viewBox="0 0 100 100" 
                      className="w-56 h-56 opacity-15"
                    >
                      {/* Top half - red */}
                      <path d="M 50 2 A 48 48 0 0 1 98 50 L 2 50 A 48 48 0 0 1 50 2" fill="#ef4444" opacity="0.3"/>
                      {/* Bottom half - white */}
                      <path d="M 50 98 A 48 48 0 0 1 2 50 L 98 50 A 48 48 0 0 1 50 98" fill="#f3f4f6" opacity="0.3"/>
                      {/* Center line */}
                      <rect x="2" y="48" width="96" height="4" fill="#374151" opacity="0.2"/>
                      {/* Outer circle */}
                      <circle cx="50" cy="50" r="48" fill="none" stroke="#374151" strokeWidth="2" opacity="0.2"/>
                      {/* Center button outer */}
                      <circle cx="50" cy="50" r="12" fill="#f3f4f6" stroke="#374151" strokeWidth="2" opacity="0.3"/>
                      {/* Center button inner */}
                      <circle cx="50" cy="50" r="8" fill="#374151" opacity="0.25"/>
                    </svg>
                  </div>

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 z-20">
                      <div 
                        className="px-4 py-2 rounded-full text-xs font-bold text-white"
                        style={{
                          background: primaryType === 'grass'
                            ? 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)'
                            : primaryType === 'fire'
                            ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                          boxShadow: primaryType === 'grass'
                            ? '0 4px 16px rgba(34, 197, 94, 0.3)'
                            : primaryType === 'fire'
                            ? '0 4px 16px rgba(239, 68, 68, 0.3)'
                            : '0 4px 16px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        Selected
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 p-6">
                    {/* Pokemon Number & Name */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-semibold text-amber-600/70 font-mono">
                          #{String(starter.id).padStart(3, '0')}
                        </p>
                        <h3 className="text-xl font-bold capitalize bg-gradient-to-r from-stone-800 to-stone-600 dark:from-white dark:to-stone-200 bg-clip-text text-transparent">
                          {starter.name}
                        </h3>
                        {starter.genus && (
                          <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 font-medium">
                            {starter.genus}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pokemon Image */}
                    <div className="relative w-40 h-40 mx-auto mb-4" style={{ zIndex: 2 }}>
                      <div className={cn(
                        "absolute inset-0 rounded-full blur-3xl opacity-20",
                        primaryType === 'grass' && "bg-green-400",
                        primaryType === 'fire' && "bg-orange-400",
                        primaryType === 'water' && "bg-cyan-400"
                      )} />
                      <Image
                        src={showShiny ? (starter.artworkShiny || starter.artwork) : starter.artwork}
                        alt={starter.name}
                        fill
                        className="object-contain drop-shadow-xl relative z-10"
                      />
                      {showShiny && (
                        <div className="absolute -top-2 -right-2">
                          <span className="text-2xl">✨</span>
                        </div>
                      )}
                    </div>

                  {/* Types */}
                  <div className="flex justify-center gap-2 mb-3 mt-8">
                    {starter.types.map((type) => (
                      <span
                        key={type}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-bold capitalize",
                          "bg-gradient-to-r shadow-md",
                          type === 'grass' && "from-green-500 to-emerald-500",
                          type === 'fire' && "from-red-500 to-orange-500",
                          type === 'water' && "from-cyan-500 to-cyan-500",
                          type === 'poison' && "from-amber-500 to-pink-500",
                          type === 'flying' && "from-amber-500 to-sky-500",
                          type === 'dark' && "from-stone-700 to-stone-900",
                          type === 'psychic' && "from-pink-500 to-amber-500",
                          type === 'fighting' && "from-red-600 to-orange-600",
                          type === 'ground' && "from-yellow-600 to-amber-600",
                          "text-white"
                        )}
                      >
                        {type}
                      </span>
                    ))}
                  </div>

                  {/* Key Stats */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-stone-600 dark:text-stone-400 mb-2">
                      Base Stats
                    </p>
                    <div className="space-y-2">
                      {/* HP */}
                      <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 w-12">HP</span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          <div
                            className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(starter.stats.hp))}
                            style={{ 
                              width: `${getStatPercentage(starter.stats.hp)}%`,
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300 w-8 text-right">
                          {starter.stats.hp}
                        </span>
                      </div>
                      
                      {/* Attack */}
                      <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 w-12">ATK</span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          <div
                            className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(starter.stats.attack))}
                            style={{ 
                              width: `${getStatPercentage(starter.stats.attack)}%`,
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300 w-8 text-right">
                          {starter.stats.attack}
                        </span>
                      </div>
                      
                      {/* Defense */}
                      <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 w-12">DEF</span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          <div
                            className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(starter.stats.defense))}
                            style={{ 
                              width: `${getStatPercentage(starter.stats.defense)}%`,
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300 w-8 text-right">
                          {starter.stats.defense}
                        </span>
                      </div>
                      
                      {/* Special Attack */}
                      <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 w-12">SP.A</span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          <div
                            className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(starter.stats.spAttack))}
                            style={{ 
                              width: `${getStatPercentage(starter.stats.spAttack)}%`,
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300 w-8 text-right">
                          {starter.stats.spAttack}
                        </span>
                      </div>
                      
                      {/* Special Defense */}
                      <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 w-12">SP.D</span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          <div
                            className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(starter.stats.spDefense))}
                            style={{ 
                              width: `${getStatPercentage(starter.stats.spDefense)}%`,
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300 w-8 text-right">
                          {starter.stats.spDefense}
                        </span>
                      </div>
                      
                      {/* Speed */}
                      <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                        background: 'rgba(255, 255, 255, 0.4)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 w-12">SPD</span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                          background: 'rgba(255, 255, 255, 0.5)',
                          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(4px)'
                        }}>
                          <div
                            className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(starter.stats.speed))}
                            style={{ 
                              width: `${getStatPercentage(starter.stats.speed)}%`,
                              boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-stone-700 dark:text-stone-300 w-8 text-right">
                          {starter.stats.speed}
                        </span>
                      </div>
                    </div>
                    
                    {/* Total Stats */}
                    <div className="mt-3 pt-3 border-t border-stone-200/50 dark:border-stone-700/50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Total Base Stats</span>
                        <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">
                          {starter.stats.total}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Evolution Preview */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-stone-600 dark:text-stone-400 mb-2">
                      Evolution Chain
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      {starter.evolutions.map((evo, index) => (
                        <React.Fragment key={evo.id}>
                          {index > 0 && (
                            <div className="flex flex-col items-center">
                              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                              {evo.level && (
                                <span className="text-[9px] text-stone-500 dark:text-stone-400">
                                  Lv.{evo.level}
                                </span>
                              )}
                            </div>
                          )}
                          <div 
                            className="relative w-12 h-12 rounded-full p-1"
                            style={{
                              background: 'rgba(255, 255, 255, 0.6)',
                              backdropFilter: 'blur(8px)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}
                          >
                            <Image
                              src={showShiny ? (evo.spriteShiny || evo.sprite) : evo.sprite}
                              alt={evo.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Physical Info */}
                  <div className="flex justify-around py-3 border-t border-stone-200/50 dark:border-stone-700/50">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">Height</p>
                      <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                        {starter.height}m
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">Weight</p>
                      <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                        {starter.weight}kg
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <button
                      className="flex-1 px-4 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {isExpanded ? 'Click to Collapse' : 'Click for Details'}
                    </button>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Details Section - Completely Outside Grid */}
      {expandedStarter && (
        <div 
          className="mt-8 p-8 rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(241, 245, 249, 0.95)',
            border: '1px solid rgba(209, 213, 219, 0.5)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}
        >
          {(() => {
            const starter = starters.find(s => s.id === expandedStarter);
            if (!starter) return null;
            
            return (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - Stats & Abilities */}
                <div className="space-y-4">
                        {/* Detailed Stats */}
                        <div>
                          <h4 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-3">
                            Detailed Base Stats {selectedEvolution && `- ${selectedEvolution.name}`}
                          </h4>
                          <div className="space-y-2">
                            {/* HP */}
                            <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                              background: 'rgba(255, 255, 255, 0.4)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                              <span className="text-xs font-semibold text-stone-700 w-12">HP</span>
                              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                                background: 'rgba(255, 255, 255, 0.5)',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(4px)'
                              }}>
                                <div
                                  className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(selectedEvolution?.stats?.hp || starter.stats.hp))}
                                  style={{ 
                                    width: `${getStatPercentage(selectedEvolution?.stats?.hp || starter.stats.hp)}%`,
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold text-stone-700 w-8 text-right">{selectedEvolution?.stats?.hp || starter.stats.hp}</span>
                            </div>
                            {/* Attack */}
                            <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                              background: 'rgba(255, 255, 255, 0.4)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                              <span className="text-xs font-semibold text-stone-700 w-12">ATK</span>
                              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                                background: 'rgba(255, 255, 255, 0.5)',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(4px)'
                              }}>
                                <div
                                  className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(selectedEvolution?.stats?.attack || starter.stats.attack))}
                                  style={{ 
                                    width: `${getStatPercentage(selectedEvolution?.stats?.attack || starter.stats.attack)}%`,
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold text-stone-700 w-8 text-right">{selectedEvolution?.stats?.attack || starter.stats.attack}</span>
                            </div>
                            {/* Defense */}
                            <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                              background: 'rgba(255, 255, 255, 0.4)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                              <span className="text-xs font-semibold text-stone-700 w-12">DEF</span>
                              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                                background: 'rgba(255, 255, 255, 0.5)',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(4px)'
                              }}>
                                <div
                                  className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(selectedEvolution?.stats?.defense || starter.stats.defense))}
                                  style={{ 
                                    width: `${getStatPercentage(selectedEvolution?.stats?.defense || starter.stats.defense)}%`,
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold text-stone-700 w-8 text-right">{selectedEvolution?.stats?.defense || starter.stats.defense}</span>
                            </div>
                            {/* Special Attack */}
                            <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                              background: 'rgba(255, 255, 255, 0.4)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                              <span className="text-xs font-semibold text-stone-700 w-12">SP.A</span>
                              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                                background: 'rgba(255, 255, 255, 0.5)',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(4px)'
                              }}>
                                <div
                                  className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(selectedEvolution?.stats?.spAttack || starter.stats.spAttack))}
                                  style={{ 
                                    width: `${getStatPercentage(selectedEvolution?.stats?.spAttack || starter.stats.spAttack)}%`,
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold text-stone-700 w-8 text-right">{selectedEvolution?.stats?.spAttack || starter.stats.spAttack}</span>
                            </div>
                            {/* Special Defense */}
                            <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                              background: 'rgba(255, 255, 255, 0.4)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                              <span className="text-xs font-semibold text-stone-700 w-12">SP.D</span>
                              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                                background: 'rgba(255, 255, 255, 0.5)',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(4px)'
                              }}>
                                <div
                                  className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(selectedEvolution?.stats?.spDefense || starter.stats.spDefense))}
                                  style={{ 
                                    width: `${getStatPercentage(selectedEvolution?.stats?.spDefense || starter.stats.spDefense)}%`,
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold text-stone-700 w-8 text-right">{selectedEvolution?.stats?.spDefense || starter.stats.spDefense}</span>
                            </div>
                            {/* Speed */}
                            <div className="flex items-center gap-2 p-2 rounded-lg backdrop-blur-sm" style={{
                              background: 'rgba(255, 255, 255, 0.4)',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                              border: '1px solid rgba(255, 255, 255, 0.3)'
                            }}>
                              <span className="text-xs font-semibold text-stone-700 w-12">SPD</span>
                              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{
                                background: 'rgba(255, 255, 255, 0.5)',
                                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                                backdropFilter: 'blur(4px)'
                              }}>
                                <div
                                  className={cn("h-full bg-gradient-to-r rounded-full", getStatColor(selectedEvolution?.stats?.speed || starter.stats.speed))}
                                  style={{ 
                                    width: `${getStatPercentage(selectedEvolution?.stats?.speed || starter.stats.speed)}%`,
                                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold text-stone-700 w-8 text-right">{selectedEvolution?.stats?.speed || starter.stats.speed}</span>
                            </div>
                            {/* Total */}
                            <div className="pt-2 mt-2 border-t border-stone-200 dark:border-stone-700">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">Total</span>
                                <span className="text-sm font-bold text-stone-900 dark:text-white">{selectedEvolution?.stats?.total || starter.stats.total}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Abilities Section - Bottom of Left Column */}
                        <div className="mt-6">
                          <h4 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-3">
                            Abilities
                          </h4>
                          <div className="space-y-2">
                            {starter.abilities.map((ability) => (
                              <div 
                                key={ability.name}
                                className="p-3 rounded-xl backdrop-blur-md"
                                style={{
                                  background: 'rgba(255, 255, 255, 0.75)',
                                  border: '1px solid rgba(255, 255, 255, 0.5)',
                                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                                }}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm capitalize text-stone-800">
                                    {ability.name.replace('-', ' ')}
                                  </span>
                                  {ability.isHidden && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                      Hidden
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                  {getAbilityDescription(ability.name)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Column - Pokedex Entry & Evolution Details */}
                      <div className="space-y-4">
                        {/* Pokedex Entry */}
                        {starter.description && (
                          <div>
                            <h4 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-3">
                              Pokedex Entry
                            </h4>
                            <div 
                              className="p-4 rounded-xl backdrop-blur-md"
                              style={{
                                background: 'rgba(255, 255, 255, 0.75)',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                              }}
                            >
                              <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                                {starter.description}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        {/* Evolution Line */}
                        <div className="w-full">
                          <h4 className="text-sm font-semibold text-stone-600 dark:text-stone-400 mb-3">
                            Complete Evolution Line
                          </h4>
                          <div className="flex items-center justify-between gap-2 p-4">
                            {starter.evolutions.map((evo, index) => (
                              <React.Fragment key={evo.id}>
                                {/* Evolution Arrow */}
                                {index > 0 && (
                                  <div className="flex flex-col items-center">
                                    <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    {evo.level && (
                                      <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                        Lv.{evo.level}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {/* Evolution Stage - Clickable with Circle Background */}
                                <div className="flex-1 text-center">
                                  <div 
                                    onClick={() => setSelectedEvolution(evo)}
                                    className="cursor-pointer"
                                  >
                                    <div className="relative mx-auto mb-2">
                                      {/* White Circle Background */}
                                      <div className={cn(
                                        "relative w-32 h-32 mx-auto rounded-full bg-white/95 backdrop-blur-sm border-2 shadow-lg cursor-pointer hover:scale-105 transition-all duration-200 flex items-center justify-center",
                                        selectedEvolution?.id === evo.id
                                          ? evo.types && evo.types[0] === 'grass'
                                            ? "ring-4 ring-green-500/50 ring-offset-2 ring-offset-stone-100 border-green-400"
                                            : evo.types && evo.types[0] === 'fire'
                                            ? "ring-4 ring-red-500/50 ring-offset-2 ring-offset-stone-100 border-red-400"
                                            : "ring-4 ring-amber-500/50 ring-offset-2 ring-offset-stone-100 border-amber-400"
                                          : "border-stone-300"
                                      )}>
                                        <div className="relative w-24 h-24">
                                          <Image
                                            src={showShiny ? (evo.spriteShiny || evo.sprite) : evo.sprite}
                                            alt={evo.name}
                                            fill
                                            className="object-contain drop-shadow-md"
                                          />
                                        </div>
                                        {showShiny && (
                                          <span className="absolute -top-1 -right-1 text-sm">✨</span>
                                        )}
                                      </div>
                                    </div>
                                    <p className="font-bold capitalize text-sm mb-1 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">{evo.name}</p>
                                  </div>
                                  {evo.types && (
                                    <div className="flex justify-center gap-1">
                                      {evo.types.map((type) => (
                                        <span
                                          key={type}
                                          className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                                            "bg-gradient-to-r shadow-sm",
                                            type === 'grass' && "from-green-500 to-emerald-500",
                                            type === 'fire' && "from-red-500 to-orange-500",
                                            type === 'water' && "from-cyan-500 to-cyan-500",
                                            type === 'poison' && "from-amber-500 to-pink-500",
                                            type === 'flying' && "from-amber-500 to-sky-500",
                                            type === 'dark' && "from-stone-700 to-stone-900",
                                            type === 'psychic' && "from-pink-500 to-amber-500",
                                            type === 'fighting' && "from-red-600 to-orange-600",
                                            type === 'ground' && "from-yellow-600 to-amber-600",
                                            type === 'steel' && "from-stone-400 to-stone-600",
                                            type === 'fairy' && "from-pink-400 to-pink-600",
                                            type === 'dragon' && "from-amber-600 to-amber-700",
                                            type === 'electric' && "from-yellow-400 to-yellow-500",
                                            type === 'ice' && "from-cyan-400 to-cyan-500",
                                            type === 'rock' && "from-yellow-700 to-yellow-800",
                                            type === 'bug' && "from-lime-500 to-lime-600",
                                            type === 'ghost' && "from-amber-600 to-amber-700",
                                            type === 'normal' && "from-stone-400 to-stone-500",
                                            "text-white"
                                          )}
                                        >
                                          {type}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-4 space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/pokedex/${selectedEvolution?.id || starter.id}`);
                            }}
                            className="w-full px-6 py-4 text-white font-bold rounded-2xl transition-all duration-300 text-center transform hover:scale-105"
                            style={{
                              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)'
                            }}
                          >
                            View Full Pokedex Entry →
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
        </div>
      )}

      {/* Comparison Section (if enabled) */}
      {showComparison && selectedStarter && (
        <div className="mt-8 p-6 backdrop-blur-xl bg-white/90 dark:bg-stone-800/90 rounded-2xl border border-stone-200 dark:border-stone-700">
          <h3 className="text-xl font-bold text-stone-900 dark:text-white mb-4">
            Your Selected Starter
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 relative">
              <Image
                src={starters.find(s => s.id === selectedStarter)?.artwork || ''}
                alt="Selected starter"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <p className="text-lg font-semibold capitalize text-stone-900 dark:text-white">
                {starters.find(s => s.id === selectedStarter)?.name}
              </p>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {starters.find(s => s.id === selectedStarter)?.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedStarterSelector;