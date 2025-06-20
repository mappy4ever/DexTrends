import React from "react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { FadeIn, SlideUp } from "../../components/ui/animations"; // Lowercase filename
import { TypeBadge } from "../../components/ui/TypeBadge"; // Updated path
import EvolutionStageCard from "../../components/ui/EvolutionStageCard"; // Add missing import
import CardList from "../../components/CardList"; // Correct capitalization
import PocketCardList from "../../components/PocketCardList";
import { useFavorites } from "../../context/favoritescontext";
import { typeEffectiveness, extractIdFromUrl } from "../../utils/pokemonutils";
import { toLowercaseUrl } from "../../utils/formatters";
import { fetchData } from "../../utils/apiutils"; // Import fetchData
import { fetchPocketData } from "../../utils/pocketData";

// Simple cache for Pokemon API requests to avoid duplicate calls
const pokemonCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cachedFetchData = async (url) => {
  const now = Date.now();
  const cached = pokemonCache.get(url);
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetchData(url);
  pokemonCache.set(url, { data, timestamp: now });
  return data;
};

// const [pocketCards, setPocketCards] = useState([]);
// const [loadingPocketCards, setLoadingPocketCards] = useState(false);
// const [errorPocketCards, setErrorPocketCards] = useState(null);

// --- Evolution Tree Utilities ---
// Recursively build a tree structure for the evolution chain
const buildEvolutionTree = async (node, fetchDataFn, extractIdFromUrl) => {
  if (!node || !node.species) return null;
  
  try {
    const speciesId = extractIdFromUrl(node.species.url);
    let types = [];
    let formName = '';
    let isVariant = false;
    
    try {
      const pokeData = await fetchDataFn(`https://pokeapi.co/api/v2/pokemon/${speciesId}`);
      if (pokeData && pokeData.types) {
        types = pokeData.types.map(t => t.type.name);
      }
      // Detect variant forms (e.g., galar, alola, hisui, paldea, etc.)
    const variantMatch = pokeData.name.match(/-(galar|alola|hisui|paldea|mega|gigantamax|totem|origin|crowned|busted|school|eternamax|starter|battle|dawn|midnight|dusk|ultra|rainy|snowy|sunny|attack|defense|speed|fan|frost|heat|mow|wash|sky|therian|black|white|resolute|pirouette|ash|baile|pom-pom|pau|sensu|zen|dada|single|rapid|low-key|amped|noice|super|small|large|average|male|female|plant|sandy|trash|east|west|blue-striped|red-striped|white-striped|yellow-striped|striped|unbound|complete|core|10|50|solo|midday|disguised|hangry|gmax)/);
    if (variantMatch) {
      isVariant = true;
      formName = variantMatch[1];
    }
    } catch (fetchError) {
      console.error('Error fetching Pokemon data for evolution tree:', fetchError);
      // Fallback to basic data
    }
    
    // If this is a variant (e.g. galarian Mr. Mime), only show evolutions for the variant, not for the base form
    let children = [];
    if (node.evolves_to && node.evolves_to.length > 0) {
      children = await Promise.all(
        node.evolves_to.map(async child => {
          // For Mr. Mime, only allow evolutions for Galarian Mr. Mime (id 10163, name 'mr-mime-galar')
          if (speciesId === 122 && node.species.name === 'mr-mime' && !isVariant) {
            // Base Mr. Mime (Kanto) does not evolve
            return null;
          }
          // For other Pokémon, allow evolutions for variants only if the child is a variant
          if (isVariant || node.species.name !== 'mr-mime') {
            return buildEvolutionTree(child, fetchDataFn, extractIdFromUrl);
          }
          return null;
        })
      );
    }
    
    return {
      name: node.species.name,
      id: speciesId,
      spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
      shinySpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${speciesId}.png`,
      evolutionDetails: node.evolution_details,
      types,
      children: children.filter(Boolean),
    };
  } catch (error) {
    console.error('Error in buildEvolutionTree:', error);
    return null;
  }
};

// --- Evolution Tree Renderer ---
function EvolutionTree({ node, showShiny, currentId, formatEvolutionDetails }) {
  if (!node) return null;
  return (
    <div className="flex flex-col items-center">
      <EvolutionStageCard
        name={node.name}
        id={node.id}
        spriteUrl={showShiny ? node.shinySpriteUrl : node.spriteUrl}
        types={node.types}
        isCurrent={currentId === node.id}
        evolutionDetails={node.evolutionDetails && formatEvolutionDetails(node.evolutionDetails)}
        circleSize="large"
      />
      {node.children && node.children.length > 0 && (
        <div className="flex flex-row items-start justify-center mt-2 gap-4">
          {node.children.map((child, idx) => (
            <div key={child.id} className="flex flex-col items-center">
              {/* Arrow */}
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 32 32" stroke="currentColor">
                <path d="M8 16h16M20 10l4 6-4 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <EvolutionTree
                node={child}
                showShiny={showShiny}
                currentId={currentId}
                formatEvolutionDetails={formatEvolutionDetails}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PokemonDetail() {
  const router = useRouter();
  const { pokeid } = router.query;
  const { favorites, togglePokemonFavorite } = useFavorites();
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [pokemonSpecies, setPokemonSpecies] = useState(null);
  const [generationInfo, setPokemonGenerationInfo] = useState(null);
  const [processedEvolutions, setProcessedEvolutions] = useState(null);
  const [showShinySprite, setShowShinySprite] = useState(false);
  const [showShinyEvolutionSprite, setShowShinyEvolutionSprite] = useState(false);
  const [detailedAbilities, setDetailedAbilities] = useState([]);
  const [groupedMoves, setGroupedMoves] = useState(null);
  const [detailedMoves, setDetailedMoves] = useState({});
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // Default to "overview"
  const [activeCardSource, setActiveCardSource] = useState("tcg");
  const [filterRarity, setFilterRarity] = useState("");
  const [filterSet, setFilterSet] = useState("");
  const [showMoveDetails, setShowMoveDetails] = useState(false); // Toggle for move details
  const [moveFilter, setMoveFilter] = useState("learned"); // "learned", "learnable", "all"
  const [relatedPokemonList, setRelatedPokemonList] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);
  const [forms, setForms] = useState([]); // All forms for this species
  const [selectedFormIdx, setSelectedFormIdx] = useState(0); // Index of selected form
  const [baseSpeciesName, setBaseSpeciesName] = useState('');
  const [pocketCards, setPocketCards] = useState([]);
  const [loadingPocketCards, setLoadingPocketCards] = useState(false);
  const [errorPocketCards, setErrorPocketCards] = useState(null);

  // Helper: is this Pokémon a favorite?
  const isFavorite = favorites?.pokemon?.includes(String(pokeid)); // Changed pokeId to pokeid

  // Helper: get type color for moves
  const getTypeColor = (type) => {
    const typeColorMap = {
      normal: 'bg-gray-400 text-white',
      fire: 'bg-red-500 text-white',
      water: 'bg-blue-500 text-white',
      electric: 'bg-yellow-400 text-black',
      grass: 'bg-green-500 text-white',
      ice: 'bg-cyan-400 text-white',
      fighting: 'bg-red-700 text-white',
      poison: 'bg-purple-500 text-white',
      ground: 'bg-yellow-600 text-white',
      flying: 'bg-indigo-400 text-white',
      psychic: 'bg-pink-500 text-white',
      bug: 'bg-green-400 text-white',
      rock: 'bg-yellow-800 text-white',
      ghost: 'bg-purple-700 text-white',
      dragon: 'bg-indigo-700 text-white',
      dark: 'bg-gray-800 text-white',
      steel: 'bg-gray-500 text-white',
      fairy: 'bg-pink-300 text-black',
    };
    return typeColorMap[type?.toLowerCase()] || 'bg-gray-400 text-white';
  };

  // Helper: filter moves based on current filter
  const getFilteredMoves = (moves) => {
    if (!moves) return {};
    
    const filtered = {};
    Object.entries(moves).forEach(([method, moveList]) => {
      if (moveFilter === "learned" && method === "level-up") {
        filtered[method] = moveList;
      } else if (moveFilter === "learnable" && method === "machine") {
        filtered["Technical Machines (TM)"] = moveList;
      } else if (moveFilter === "all") {
        const displayMethod = method === "machine" ? "Technical Machines (TM)" : method;
        filtered[displayMethod] = moveList;
      }
    });
    return filtered;
  };

  // Fetch Pokémon details, species, evolution, and cards
  useEffect(() => {
    if (!router.isReady || !pokeid) return;
    setLoading(true);
    setError(null);
    setPokemonDetails(null);
    setPokemonSpecies(null);
    setPokemonGenerationInfo(null);
    setProcessedEvolutions(null);
    setCards([]);
    setRelatedPokemonList([]);
    setRelatedError(null);
    setForms([]);
    setSelectedFormIdx(0);
    setBaseSpeciesName('');
    let didCancel = false;
    const timeout = setTimeout(() => {
      if (!didCancel) {
        setLoading(false);
        setError('Request timed out.');
        console.error('Pokémon detail fetch timed out.');
      }
    }, 15000);
    const fetchAll = async () => {
      try {
        const pokeApiId = toLowercaseUrl(pokeid);
        console.log(`Fetching Pokemon details for ID: ${pokeApiId}`);
        
        const details = await cachedFetchData(`https://pokeapi.co/api/v2/pokemon/${pokeApiId}`);
        if (didCancel) return;
        
        if (!details || !details.species) {
          throw new Error(`Invalid Pokemon data for ID: ${pokeApiId}`);
        }
        
        setPokemonDetails(details);
        console.log(`Successfully fetched Pokemon: ${details.name}`);
        
        // Fetch species and parallel API calls
        const [species, cardsData] = await Promise.allSettled([
          cachedFetchData(details.species.url).catch(err => {
            console.error('Species fetch failed:', err);
            return null;
          }),
          fetchData(`https://api.pokemontcg.io/v2/cards?q=name:${details.name}`).catch(err => {
            console.error('TCG API fetch failed:', err.message);
            return { data: [] };
          })
        ]);
        
        if (didCancel) return;
        
        const speciesData = species.status === 'fulfilled' ? species.value : null;
        const cardsResult = cardsData.status === 'fulfilled' ? cardsData.value : { data: [] };
        
        if (speciesData) {
          setPokemonSpecies(speciesData);
          setBaseSpeciesName(speciesData.name);
        }
        setCards(cardsResult.data || []);
        // Fetch all forms/varieties and other data in parallel
        let allForms = [];
        const parallelTasks = [];
        
        if (speciesData?.varieties && speciesData.varieties.length > 1) {
          parallelTasks.push(
            Promise.all(
              speciesData.varieties.map(async (variety) => {
                const formDetail = await cachedFetchData(variety.pokemon.url);
                return {
                  ...formDetail,
                  id: formDetail.id,
                  name: formDetail.name,
                  is_default: variety.is_default,
                  types: formDetail.types.map((t) => t.type.name),
                  sprite: formDetail.sprites?.other?.["official-artwork"]?.front_default || formDetail.sprites?.front_default,
                  formName: variety.pokemon.name !== speciesData.name ? variety.pokemon.name.replace(speciesData.name, '').replace(/^-/, '').replace(/-/g, ' ').trim() : '',
                };
              })
            )
          );
        } else {
          allForms = [{
            ...details,
            id: details.id,
            name: details.name,
            is_default: true,
            types: details.types.map((t) => t.type.name),
            sprite: details.sprites?.other?.["official-artwork"]?.front_default || details.sprites?.front_default,
            formName: '',
          }];
        }
        
        // Add generation data fetch to parallel tasks
        if (speciesData?.generation) {
          parallelTasks.push(cachedFetchData(speciesData.generation.url));
        }
        
        // Add evolution chain fetch to parallel tasks
        if (speciesData?.evolution_chain?.url) {
          parallelTasks.push(cachedFetchData(speciesData.evolution_chain.url));
        }
        
        // Add abilities fetch to parallel tasks
        if (details.abilities) {
          parallelTasks.push(
            Promise.all(
              details.abilities.map(async (abilityEntry) => {
                try {
                  const abilityData = await cachedFetchData(abilityEntry.ability.url);
                  const effectEntry = abilityData.effect_entries.find(e => e.language.name === 'en');
                  return {
                    name: abilityData.name.replace('-', ' '),
                    description: effectEntry?.short_effect || effectEntry?.effect || 'No English description available.',
                    is_hidden: abilityEntry.is_hidden,
                  };
                } catch (err) {
                  console.error(`Error fetching ability ${abilityEntry.ability.name}:`, err);
                  return {
                    name: abilityEntry.ability.name.replace('-', ' '),
                    description: 'Error loading ability details.',
                    is_hidden: abilityEntry.is_hidden,
                  };
                }
              })
            )
          );
        }
        
        // Execute all parallel tasks
        const parallelResults = await Promise.allSettled(parallelTasks);
        let resultIndex = 0;
        
        // Process forms result
        if (speciesData?.varieties && speciesData.varieties.length > 1) {
          const formsResult = parallelResults[resultIndex++];
          if (formsResult.status === 'fulfilled') {
            allForms = formsResult.value;
            // Remove Eevee starter form (id === 133 and name === 'eevee') if there are other forms
            if (speciesData.name === 'eevee') {
              allForms = allForms.filter(f => !(f.id === 133 && f.name === 'eevee'));
            }
          }
        }
        
        allForms.sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
        setForms(allForms);
        // Set selected form index to match pokeid if possible
        const idx = allForms.findIndex(f => String(f.id) === String(pokeid));
        setSelectedFormIdx(idx >= 0 ? idx : 0);

        // Process generation data result
        let genData = null;
        if (speciesData?.generation) {
          const genResult = parallelResults[resultIndex++];
          if (genResult.status === 'fulfilled') {
            genData = genResult.value;
            setPokemonGenerationInfo(genData);
          }
        }

        // Process related Pokemon from the same generation
        if (genData?.pokemon_species && pokeid) {
          setRelatedLoading(true);
          setRelatedError(null);
          try {
            const currentPokemonIdString = String(pokeid);
            const filteredRelatedPokemon = genData.pokemon_species.filter(p => {
              const relatedId = extractIdFromUrl(p.url);
              return relatedId !== currentPokemonIdString;
            });
            setRelatedPokemonList(filteredRelatedPokemon);
          } catch (err) {
            console.error('Error processing related Pokemon:', err);
            setRelatedError('Failed to load related Pokemon.');
          } finally {
            if (!didCancel) setRelatedLoading(false);
          }
        } else {
          if (!didCancel) setRelatedLoading(false);
        }

        // Process evolution chain result
        if (speciesData?.evolution_chain?.url) {
          const evoResult = parallelResults[resultIndex++];
          if (evoResult.status === 'fulfilled') {
            const evoData = evoResult.value;
            console.log('Processing evolution chain data for Pokemon:', details.name);
            try {
              if (evoData.chain) {
                const evoTree = await buildEvolutionTree(evoData.chain, cachedFetchData, extractIdFromUrl);
                if (!didCancel) setProcessedEvolutions(evoTree);
              } else {
                console.log('No evolution chain data available');
                setProcessedEvolutions(null);
              }
            } catch (evoError) {
              console.error('Error building evolution tree:', evoError);
              setProcessedEvolutions(null);
            }
          } else {
            console.log('Failed to fetch evolution chain');
            setProcessedEvolutions(null);
          }
        } else {
          console.log('No evolution chain URL available');
          setProcessedEvolutions(null);
        }

        // Process abilities result
        if (details.abilities) {
          const abilitiesResult = parallelResults[resultIndex++];
          if (abilitiesResult.status === 'fulfilled') {
            const resolvedAbilities = abilitiesResult.value;
            if (!didCancel) setDetailedAbilities(resolvedAbilities.filter(Boolean));
          }
        }
      } catch (err) {
        console.error('Pokémon fetch failed:', err);
        if (!didCancel) {
          if (err.message && err.message.includes('404')) {
            setError(`Pokémon with ID "${pokeid}" not found. This might be an invalid ID or a form that doesn't exist in the API.`);
          } else if (err.message && err.message.includes('Invalid Pokemon data')) {
            setError(`Invalid data structure for Pokémon ID "${pokeid}". This might be a special form or variant.`);
          } else {
            setError(`Failed to load Pokémon: ${err.message || 'Unknown error'}`);
          }
        }
      } finally {
        if (!didCancel) setLoading(false);
        clearTimeout(timeout);
      }
    };
    fetchAll();
    return () => { didCancel = true; clearTimeout(timeout); };
  }, [router.isReady, pokeid]);

  // Fetch Pocket cards for this Pokémon
  useEffect(() => {
    if (!pokemonDetails?.name) return;
    
    const fetchPocketCards = async () => {
      try {
        setLoadingPocketCards(true);
        setErrorPocketCards(null);
        
        const allPocketCards = await fetchPocketData();
        
        // Filter cards by Pokémon name (case insensitive)
        const pokemonName = pokemonDetails.name.toLowerCase().trim();
        const baseName = pokemonName.split(' ')[0]; // Get first word (e.g., "venusaur" from "venusaur-mega")
        
        console.log('Looking for Pocket cards for:', pokemonName, 'base name:', baseName);
        
        const matchingCards = allPocketCards.filter(card => {
          const cardName = card.name.toLowerCase().trim();
          const cardBaseName = cardName.split(' ')[0];
          
          // Match exact name or base name
          return cardName === pokemonName || 
                 cardBaseName === baseName || 
                 cardName.includes(baseName) || 
                 baseName.includes(cardBaseName);
        });
        
        console.log('Found Pocket cards:', matchingCards.length, matchingCards.map(c => c.name));
        
        setPocketCards(matchingCards);
        setLoadingPocketCards(false);
      } catch (err) {
        console.error('Failed to fetch Pocket cards:', err);
        setErrorPocketCards('Failed to load Pocket cards.');
        setLoadingPocketCards(false);
      }
    };
    
    fetchPocketCards();
  }, [pokemonDetails?.name]);

  // Use selected form for all display
  const selectedForm = forms[selectedFormIdx] || pokemonDetails;
  // Helper for display name with improved grammar and base form label
  function getDisplayName(form) {
    if (!form) return '';
    // Known special cases for base form names
    const specialBaseNames = {
      dialga: 'Dialga',
      palkia: 'Palkia',
      giratina: 'Giratina',
      tornadus: 'Tornadus',
      thundurus: 'Thundurus',
      landorus: 'Landorus',
      enamorus: 'Enamorus',
      urshifu: 'Urshifu',
      calyrex: 'Calyrex',
      basculegion: 'Basculegion',
      lycanroc: 'Lycanroc',
      toxtricity: 'Toxtricity',
      indeedee: 'Indeedee',
      meowstic: 'Meowstic',
      basculin: 'Basculin',
      darmanitan: 'Darmanitan',
      zacian: 'Zacian',
      zamacenta: 'Zamazenta',
      greninja: 'Greninja',
      oricorio: 'Oricorio',
      necrozma: 'Necrozma',
      mimikyu: 'Mimikyu',
      wishiwashi: 'Wishiwashi',
      minior: 'Minior',
      eiscue: 'Eiscue',
      morpeko: 'Morpeko',
      urshifu: 'Urshifu',
      zarude: 'Zarude',
      dudunsparce: 'Dudunsparce',
      squawkabilly: 'Squawkabilly',
      oinkologne: 'Oinkologne',
      palafin: 'Palafin',
      maushold: 'Maushold',
      tatsugiri: 'Tatsugiri',
      tauros: 'Tauros',
      ogrepon: 'Ogerpon',
      terapagos: 'Terapagos',
    };
    // Use special base name if available
    const base = specialBaseNames[baseSpeciesName] || baseSpeciesName.replace(/-/g, ' ');
    if (form.formName) {
      // Capitalize and add 'Forme' if not present
      let label = form.formName.trim();
      if (!/form(e|a)/i.test(label)) {
        label = label.charAt(0).toUpperCase() + label.slice(1) + ' Forme';
      } else {
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }
      return `${base} (${label})`;
    }
    // For default form, show 'Base Forme' if there are other forms
    if (forms.length > 1) {
      return `${base} (Base Forme)`;
    }
    return base;
  }

  // Process moves data (Part 2)
  useEffect(() => {
    if (pokemonDetails && pokemonDetails.moves) {
      const movesByMethod = pokemonDetails.moves.reduce((acc, moveEntry) => {
        const moveName = moveEntry.move.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const learnDetail = moveEntry.version_group_details[moveEntry.version_group_details.length - 1]; // Use latest
        const method = learnDetail.move_learn_method.name;

        if (!acc[method]) acc[method] = [];

        let displayData = { 
          name: moveName, 
          id: extractIdFromUrl(moveEntry.move.url),
          url: moveEntry.move.url
        };
        if (method === 'level-up') displayData.level = learnDetail.level_learned_at;

        acc[method].push(displayData);
        return acc;
      }, {});

      if (movesByMethod['level-up']) {
        movesByMethod['level-up'].sort((a, b) => a.level - b.level);
      }
      setGroupedMoves(movesByMethod);
    }
  }, [pokemonDetails]);

  // Fetch detailed move information when moves tab is active
  useEffect(() => {
    if (activeTab === "moves" && groupedMoves && Object.keys(groupedMoves).length > 0) {
      const fetchMoveDetails = async () => {
        const moveDetailsMap = { ...detailedMoves }; // Keep existing details
        const allMoves = Object.values(groupedMoves).flat();
        const movesToFetch = allMoves.filter(move => !moveDetailsMap[move.id]); // Only fetch missing moves
        
        console.log(`Fetching details for ${movesToFetch.length} moves...`);
        
        // Fetch moves in batches to avoid overwhelming the API
        const batchSize = 10;
        for (let i = 0; i < movesToFetch.length; i += batchSize) {
          const batch = movesToFetch.slice(i, i + batchSize);
          
          await Promise.all(batch.map(async (move) => {
            try {
              const moveData = await cachedFetchData(move.url);
              moveDetailsMap[move.id] = {
                name: move.name,
                type: moveData.type?.name || 'normal',
                power: moveData.power || 'N/A',
                accuracy: moveData.accuracy || 'N/A',
                pp: moveData.pp || 'N/A',
                description: moveData.effect_entries?.find(entry => entry.language.name === 'en')?.short_effect || 
                            moveData.flavor_text_entries?.find(entry => entry.language.name === 'en')?.flavor_text || 
                            'No description available',
                damageClass: moveData.damage_class?.name || 'status',
                target: moveData.target?.name || 'selected-pokemon'
              };
            } catch (error) {
              console.error(`Failed to fetch move details for ${move.name}:`, error);
              moveDetailsMap[move.id] = {
                name: move.name,
                type: 'normal',
                power: 'N/A',
                accuracy: 'N/A', 
                pp: 'N/A',
                description: 'Details unavailable',
                damageClass: 'status',
                target: 'selected-pokemon'
              };
            }
          }));
          
          // Update state after each batch to show progress
          setDetailedMoves({ ...moveDetailsMap });
          
          // Small delay between batches to be respectful to the API
          if (i + batchSize < movesToFetch.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      };
      
      fetchMoveDetails();
    }
  }, [activeTab, groupedMoves]);

  // Helper function to format evolution details (Part 2)
  const formatEvolutionDetails = (detailsArray) => {
    if (!detailsArray || detailsArray.length === 0) return "Natural progression";
    const detail = detailsArray[0];
    let parts = [];
    const triggerName = detail.trigger?.name?.replace('-', ' ') || 'Unknown';

    if (detail.min_level) parts.push(`Lvl ${detail.min_level}`);
    if (detail.item?.name) parts.push(`Use ${detail.item.name.replace('-', ' ')}`);
    if (detail.held_item?.name) parts.push(`Hold ${detail.held_item.name.replace('-', ' ')}`);
    if (triggerName === 'trade') {
      parts.push('Trade');
      if (detail.trade_species?.name) parts.push(`for ${detail.trade_species.name.replace('-', ' ')}`);
    } else if (triggerName !== 'level up' && triggerName !== 'use item' && triggerName !== 'unknown') {
      parts.push(triggerName.charAt(0).toUpperCase() + triggerName.slice(1));
    }
    if (detail.known_move?.name) parts.push(`Know ${detail.known_move.name.replace('-', ' ')}`);
    if (detail.known_move_type?.name) parts.push(`Know ${detail.known_move_type.name.replace('-', ' ')} move`);
    if (detail.location?.name) parts.push(`at ${detail.location.name.replace('-', ' ')}`);
    if (detail.min_affection) parts.push(`${detail.min_affection} Affection`);
    if (detail.min_beauty) parts.push(`${detail.min_beauty} Beauty`);
    if (detail.min_happiness) parts.push(`${detail.min_happiness} Happiness`);
    if (detail.needs_overworld_rain) parts.push("In Rain");
    if (detail.party_species?.name) parts.push(`With ${detail.party_species.name.replace('-', ' ')} in party`);
    if (detail.party_type?.name) parts.push(`With a ${detail.party_type.name.replace('-', ' ')} type in party`);
    if (detail.relative_physical_stats !== null && detail.relative_physical_stats !== undefined) {
      const comparison = detail.relative_physical_stats > 0 ? "(Atk > Def)" : detail.relative_physical_stats < 0 ? "(Atk < Def)" : "(Atk = Def)";
      parts.push(comparison);
    }
    if (detail.time_of_day) parts.push(detail.time_of_day.charAt(0).toUpperCase() + detail.time_of_day.slice(1));
    if (detail.turn_upside_down) parts.push("Upside Down");
    if (detail.gender !== null && detail.gender !== undefined) parts.push(detail.gender === 1 ? "(Female)" : "(Male)");

    let finalString = parts.join(', ');
    if (parts.length === 0 && triggerName === 'level up') finalString = "Level up";
    else if (parts.length === 0 && triggerName !== 'shed') finalString = triggerName.charAt(0).toUpperCase() + triggerName.slice(1);
    return finalString.length > 0 ? finalString : "Special conditions";
  };

  // Refined Type effectiveness info logic (Part 3)
  let typeEffectivenessInfo = null;
  if (pokemonDetails?.types?.length) {
    const pokemonTypes = pokemonDetails.types.map(t => t.type.name);
    let netDamageRelations = {};
    Object.keys(typeEffectiveness).forEach(type => { netDamageRelations[type] = 1; });

    pokemonTypes.forEach(pokemonType => {
      const relations = typeEffectiveness[pokemonType];
      if (!relations) return;
      relations.immuneTo?.forEach(immuneType => { netDamageRelations[immuneType] = 0; });
      relations.weakTo?.forEach(weakType => {
        if (netDamageRelations[weakType] === 0) return;
        netDamageRelations[weakType] = (netDamageRelations[weakType] || 1) * 2;
      });
      relations.resistantTo?.forEach(resistantType => {
        if (netDamageRelations[resistantType] === 0) return;
        netDamageRelations[resistantType] = (netDamageRelations[resistantType] || 1) * 0.5;
      });
    });

    const finalWeaknesses = [];
    const finalResistances = [];
    const finalImmunities = [];

    for (const type in netDamageRelations) {
      if (netDamageRelations[type] > 1) finalWeaknesses.push({type: type, multiplier: netDamageRelations[type]});
      else if (netDamageRelations[type] < 1 && netDamageRelations[type] > 0) finalResistances.push({type: type, multiplier: netDamageRelations[type]});
      else if (netDamageRelations[type] === 0) finalImmunities.push(type);
    }

    finalWeaknesses.sort((a,b) => b.multiplier - a.multiplier || a.type.localeCompare(b.type));
    finalResistances.sort((a,b) => a.multiplier - b.multiplier || a.type.localeCompare(b.type));
    finalImmunities.sort();

    typeEffectivenessInfo = {
      weakTo: finalWeaknesses,
      resistantTo: finalResistances,
      immuneTo: finalImmunities
    };
  }

  // Card filters
  const uniqueRarities = Array.from(new Set(cards.map(card => card.rarity).filter(Boolean)));
  const uniqueSets = Array.from(new Set(cards.map(card => card.set?.name).filter(Boolean)));
  const filteredCards = cards.filter(card =>
    (!filterRarity || card.rarity === filterRarity) &&
    (!filterSet || card.set?.name === filterSet)
  );

  // UI: Loading/Error
  if (loading) {
    return (
      <div className="container max-w-xl mx-auto py-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Pokémon details...</p>
      </div>
    );
  }
  if (error || !pokemonDetails) {
    return (
      <div className="container max-w-xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
        <p className="text-gray-600">{error || "Pokémon not found."}</p>
      </div>
    );
  }

  // Main UI
  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <Head>
        <title>{getDisplayName(selectedForm)} | Pokédex | DexTrends</title>
      </Head>
      <FadeIn>
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Pokémon Image */}
          <div className="flex-shrink-0 flex flex-col items-center" style={{ marginTop: '60px' }}>
            <Image
              src={selectedForm?.sprites?.other?.["official-artwork"]?.front_default || selectedForm?.sprite || "/dextrendslogo.png"}
              alt={getDisplayName(selectedForm)}
              width={240}
              height={240}
              className="mb-4"
            />
            {/* Form definition and selector */}
            {forms.length > 1 && (
              <div className="w-full flex flex-col items-center mt-2">
                <select
                  className="mt-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-primary/30 focus:border-primary"
                  value={selectedFormIdx}
                  onChange={e => {
                    const idx = Number(e.target.value);
                    if (forms[idx] && forms[idx].stats && JSON.stringify(forms[idx].stats) !== JSON.stringify(selectedForm.stats)) {
                      router.replace(`/pokedex/${forms[idx].id}`);
                    } else {
                      setSelectedFormIdx(idx);
                    }
                  }}
                  aria-label="Select Pokémon form"
                >
                  {forms.map((form, idx) => (
                    <option key={form.id} value={idx}>
                      {getDisplayName(form)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Pokémon Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold capitalize flex items-center">
                  {getDisplayName(selectedForm)}
                  <span className="text-primary font-bold ml-3 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-2xl md:text-3xl">
                    #{String(selectedForm.id).padStart(3, '0')}
                  </span>
                </h1>
              </div>
              <button
                className={`p-2 rounded-full transition-all duration-300 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-500'}`}
                onClick={() => togglePokemonFavorite(selectedForm.id)}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isFavorite ? 0 : 2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </button>
            </div>

            {/* Enhanced Pokémon Types - Always Visible */}
            <div className="flex gap-3 mt-4">
              {selectedForm.types && selectedForm.types.map((type) => (
                <div key={type} className="group">
                  <TypeBadge
                    type={type}
                    size="lg"
                    className="shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 border-2 border-white/50"
                  />
                </div>
              ))}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 glass-elevated p-6 rounded-2xl shadow-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Height</h3>
                <p className="text-lg font-semibold">{(pokemonDetails.height / 10).toFixed(1)} m</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Weight</h3>
                <p className="text-lg font-semibold">{(pokemonDetails.weight / 10).toFixed(1)} kg</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Base Experience</h3>
                <p className="text-lg font-semibold">{pokemonDetails.base_experience || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Abilities</h3>
                <div className="flex flex-wrap gap-2">
                  {pokemonDetails.abilities.map((ability) => (
                    <button
                      key={ability.ability.name}
                      onClick={() => setActiveTab("abilities")}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${
                        ability.is_hidden 
                          ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border border-purple-300' 
                          : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300'
                      }`}
                    >
                      {ability.ability.name.replace('-', ' ')}
                      {ability.is_hidden && <span className="text-xs ml-1">★</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <SlideUp delay={200}>
        {/* Enhanced Pokémon-themed Tab Navigation */}
        <div className="flex flex-col mb-8">
          <div className="glass-elevated rounded-2xl p-3 mb-6 shadow-lg">
            <div className="flex overflow-x-auto gap-2">
              {[
                { key: "overview", label: "Overview" },
                { key: "stats", label: "Stats" },
                { key: "moves", label: "Moves" },
                { key: "abilities", label: "Abilities" },
                { key: "evolution", label: "Evolution" },
                { key: "cards", label: "Cards" },
                { key: "flavor", label: "Flavor Texts" },
                { key: "media", label: "Media" },
              ].map(tab => (
                <button
                  key={tab.key}
                  className={`flex items-center gap-2 px-4 py-3 font-medium text-sm rounded-lg transition-all duration-300 whitespace-nowrap border-2
                    ${activeTab === tab.key
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700"}
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20`
                  }
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mb-8">
          {/* Overview Tab - Essential Pokemon Information */}
          {activeTab === "overview" && (
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
                  <h3 className="font-bold text-lg mb-3">Description</h3>
                  <p className="mb-4 text-sm leading-relaxed">
                    {pokemonSpecies?.flavor_text_entries?.find(entry => entry.language.name === 'en')?.flavor_text.replace(/[\f\n]/g, ' ') || 'No description available.'}
                  </p>

                  <h3 className="font-bold text-lg mt-6 mb-3">Taxonomy</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
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

                  {/* Type Effectiveness (Part 3) */}
                  <h3 className="font-bold text-lg mt-6 mb-3">Type Effectiveness</h3>
                  {typeEffectivenessInfo ? (
                    <div className="space-y-3 text-sm">
                      {typeEffectivenessInfo.weakTo.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Weak to</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {typeEffectivenessInfo.weakTo.map(item => (
                              <TypeBadge key={item.type} type={item.type} size="sm" className="relative">
                                <span className="absolute -top-1 -right-1.5 text-xs font-bold text-red-500 bg-white/70 dark:bg-gray-800/70 px-1 rounded-full scale-75">x{item.multiplier}</span>
                              </TypeBadge>
                            ))}
                          </div>
                        </div>
                      )}
                      {typeEffectivenessInfo.resistantTo.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Resistant to</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {typeEffectivenessInfo.resistantTo.map(item => (
                              <TypeBadge key={item.type} type={item.type} size="sm" className="relative">
                                <span className="absolute -top-1 -right-1.5 text-xs font-bold text-green-500 bg-white/70 dark:bg-gray-800/70 px-1 rounded-full scale-75">x{item.multiplier}</span>
                              </TypeBadge>
                            ))}
                          </div>
                        </div>
                      )}
                      {typeEffectivenessInfo.immuneTo.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-1">Immune to</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {typeEffectivenessInfo.immuneTo.map(type => (
                              <TypeBadge key={type} type={type} size="sm" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : <p className="text-sm text-gray-500 dark:text-gray-400">Type effectiveness data not available.</p>}

                  {/* Additional Info (Part 3) */}
                  <h3 className="font-bold text-lg mt-6 mb-3">Additional Info</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Gender Ratio: </span>
                      {pokemonSpecies?.gender_rate === -1
                        ? "Genderless"
                        : `♀ ${((pokemonSpecies?.gender_rate || 0) / 8) * 100}%, ♂ ${((8 - (pokemonSpecies?.gender_rate || 0)) / 8) * 100}%`}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">Egg Groups: </span>
                      {pokemonSpecies?.egg_groups?.map(eg => eg.name.charAt(0).toUpperCase() + eg.name.slice(1)).join(', ') || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Column 2: Base Stats & Sprite */}
                <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Base Stats</h3>
                    <button
                      onClick={() => setShowShinySprite(!showShinySprite)}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
                      title={showShinySprite ? "Show default sprite" : "Show shiny sprite"}
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles">
                        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
                      </svg>
                      {showShinySprite ? "Default" : "Shiny"}
                    </button>
                  </div>
                  <div className="flex flex-col items-center mb-6">
                    <Image
                      src={showShinySprite
                        ? (pokemonDetails.sprites?.front_shiny || pokemonDetails.sprites?.front_default || "/dextrendslogo.png")
                        : (pokemonDetails.sprites?.front_default || "/dextrendslogo.png")}
                      alt={showShinySprite ? `${pokemonDetails.name} Shiny Sprite` : `${pokemonDetails.name} Default Sprite`}
                      width={96}
                      height={96}
                      className="pixelated mb-2 drop-shadow-lg"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
                      sizes="96px"
                    />
                  </div>
                  <div className="space-y-3">
                    {pokemonDetails.stats.map(stat => {
                      const statName = stat.stat.name.replace('-', ' ');
                      const statValue = stat.base_stat;
                      const maxStatValue = 255;
                      const barPercentage = Math.max(0, Math.min(100, (statValue / maxStatValue) * 100));
                      let barColorClass = "bg-red-500";
                      if (statValue >= 120) barColorClass = "bg-green-500";
                      else if (statValue >= 90) barColorClass = "bg-sky-500";
                      else if (statValue >= 60) barColorClass = "bg-yellow-400";
                      else if (statValue >= 40) barColorClass = "bg-orange-500";
                      if (stat.stat.name.toLowerCase() === 'hp') {
                         if (statValue >= 100) barColorClass = "bg-green-500";
                         else if (statValue >= 60) barColorClass = "bg-yellow-400";
                         else barColorClass = "bg-red-500";
                      }
                      return (
                        <div key={stat.stat.name}>
                          <div className="flex justify-between text-sm mb-0.5">
                            <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{statName}</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-200">{statValue}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
                            <div
                              className={`h-3 rounded-full ${barColorClass} transition-all duration-500 ease-out`}
                              style={{ width: `${barPercentage}%` }}
                              title={`${statValue} / ${maxStatValue}`}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>
                </div>
              </FadeIn>
            )}
            {/* Stats Tab - Enhanced with visual stat comparison */}
            {activeTab === "stats" && (
              <FadeIn>
                <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
                  <h3 className="font-pokemon text-2xl mb-6 text-pokeball-red">Detailed Stats</h3>
                  
                  {/* Enhanced Base Stats with bars */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-lg mb-4 text-greatball-blue">Base Stats</h4>
                    <div className="space-y-4">
                      {pokemonDetails.stats.map(stat => {
                        const statName = stat.stat.name.replace('-', ' ');
                        const statValue = stat.base_stat;
                        const maxStatValue = 255;
                        const barPercentage = Math.max(0, Math.min(100, (statValue / maxStatValue) * 100));
                        let barColorClass = "bg-red-500";
                        if (statValue >= 120) barColorClass = "bg-green-500";
                        else if (statValue >= 90) barColorClass = "bg-sky-500";
                        else if (statValue >= 60) barColorClass = "bg-yellow-400";
                        else if (statValue >= 40) barColorClass = "bg-orange-500";
                        
                        return (
                          <div key={stat.stat.name} className="glass p-4 rounded-xl">
                            <div className="flex justify-between items-center mb-2">
                              <span className="capitalize font-semibold text-gray-700 dark:text-gray-300">{statName}</span>
                              <span className="font-bold text-pokeball-red text-lg">{statValue}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden shadow-inner">
                              <div
                                className={`h-4 rounded-full ${barColorClass} transition-all duration-1000 ease-out shadow-lg`}
                                style={{ width: `${barPercentage}%` }}
                                title={`${statValue} / ${maxStatValue}`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* EV Yield Section */}
                  <div className="bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-indigo-400 p-4 rounded-xl text-white shadow-lg">
                    <h4 className="font-semibold text-lg mb-2 text-indigo-200">EV Yield</h4>
                    <p className="capitalize text-white font-medium">
                      {pokemonDetails?.stats?.filter(s => s.effort > 0).map(s => `${s.effort} ${s.stat.name.replace('-', ' ')}`).join(', ') || 'None specified'}
                    </p>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Moves Tab - Clean table layout with filters */}
            {activeTab === "moves" && (
              <FadeIn>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Moves & Attacks</h3>
                    
                    {/* Move Controls */}
                    <div className="flex items-center gap-4">
                      {/* Move Filter */}
                      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                        {[
                          { key: "learned", label: "Learned" },
                          { key: "learnable", label: "TM" },
                          { key: "all", label: "All" }
                        ].map(filter => (
                          <button
                            key={filter.key}
                            onClick={() => setMoveFilter(filter.key)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                              moveFilter === filter.key
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                      
                      {/* Details Toggle */}
                      <button
                        onClick={() => setShowMoveDetails(!showMoveDetails)}
                        className={`px-3 py-1 text-sm font-medium rounded-lg border transition-all ${
                          showMoveDetails
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
                        }`}
                      >
                        {showMoveDetails ? 'Hide Details' : 'Show Details'}
                      </button>
                    </div>
                  </div>
                  
                  {groupedMoves ? (
                    <div className="space-y-6">
                      {Object.entries(getFilteredMoves(groupedMoves)).map(([method, moves]) => (
                        <div key={method} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            {method.replace('-', ' ')}
                            <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                              {moves.length}
                            </span>
                          </h4>
                          
                          {/* Table Layout */}
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                  {method === 'level-up' && <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Level</th>}
                                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Move</th>
                                  <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Type</th>
                                  {showMoveDetails && (
                                    <>
                                      <th className="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Power</th>
                                      <th className="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Acc</th>
                                      <th className="text-center py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">PP</th>
                                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Category</th>
                                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-600 dark:text-gray-400">Description</th>
                                    </>
                                  )}
                                </tr>
                              </thead>
                              <tbody>
                                {moves.slice(0, showMoveDetails ? 15 : 25).map((move, idx) => {
                                  const moveDetails = detailedMoves[move.id];
                                  return (
                                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                      {method === 'level-up' && (
                                        <td className="py-3 px-3">
                                          {move.level > 0 && (
                                            <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                              {move.level}
                                            </span>
                                          )}
                                        </td>
                                      )}
                                      <td className="py-3 px-3">
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {move.name}
                                        </span>
                                      </td>
                                      <td className="py-3 px-3">
                                        {moveDetails && (
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(moveDetails.type)}`}>
                                            {moveDetails.type}
                                          </span>
                                        )}
                                      </td>
                                      {showMoveDetails && (
                                        <>
                                          <td className="py-3 px-3 text-center text-sm">
                                            {moveDetails ? (moveDetails.power || '—') : '—'}
                                          </td>
                                          <td className="py-3 px-3 text-center text-sm">
                                            {moveDetails ? (moveDetails.accuracy === 'N/A' ? '—' : `${moveDetails.accuracy}%`) : '—'}
                                          </td>
                                          <td className="py-3 px-3 text-center text-sm">
                                            {moveDetails ? moveDetails.pp : '—'}
                                          </td>
                                          <td className="py-3 px-3">
                                            {moveDetails && (
                                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                moveDetails.damageClass === 'physical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                moveDetails.damageClass === 'special' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                              }`}>
                                                {moveDetails.damageClass}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-3 px-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                                            {moveDetails ? (
                                              <span className="line-clamp-2" title={moveDetails.description}>
                                                {moveDetails.description}
                                              </span>
                                            ) : (
                                              <span className="text-gray-400 italic">Loading...</span>
                                            )}
                                          </td>
                                        </>
                                      )}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                          
                          {moves.length > (showMoveDetails ? 15 : 25) && (
                            <div className="mt-3 text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Showing {showMoveDetails ? 15 : 25} of {moves.length} moves
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No move data available.</p>
                    </div>
                  )}
                </div>
              </FadeIn>
            )}

            {/* Abilities Tab - Clean abilities section */}
            {activeTab === "abilities" && (
              <FadeIn>
                <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Abilities</h3>
                  
                  {detailedAbilities.length > 0 ? (
                    <div className="space-y-4">
                      {detailedAbilities.map((ability, index) => (
                        <div key={ability.name} className={`glass-elevated rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl ${
                          ability.is_hidden 
                            ? 'border-l-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20' 
                            : 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-lg capitalize text-gray-900 dark:text-white">
                              {ability.name.replace('-', ' ')}
                            </h4>
                            {ability.is_hidden && (
                              <span className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 text-xs px-3 py-1 rounded-full font-semibold">
                                Hidden
                              </span>
                            )}
                          </div>
                          
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                            {ability.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pokemonDetails.abilities.map((ability, index) => (
                        <div key={ability.ability.name} className={`glass-elevated rounded-xl p-6 shadow-lg border-l-4 transition-all duration-300 hover:shadow-xl ${
                          ability.is_hidden 
                            ? 'border-l-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20' 
                            : 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-lg capitalize text-gray-900 dark:text-white">
                              {ability.ability.name.replace('-', ' ')}
                            </h4>
                            {ability.is_hidden && (
                              <span className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 text-xs px-3 py-1 rounded-full font-semibold">
                                Hidden
                              </span>
                            )}
                          </div>
                          
                          <div className="animate-pulse space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 italic">
                            Loading ability description...
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FadeIn>
            )}
          {/* Evolution Tab - Enhanced styling */}
          {activeTab === "evolution" && (
            <FadeIn>
              <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Evolution Chain</h3>
                  <button
                    onClick={() => setShowShinyEvolutionSprite(!showShinyEvolutionSprite)}
                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5"
                    title={showShinyEvolutionSprite ? "Show default sprites" : "Show shiny sprites"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
                  </svg>
                    {showShinyEvolutionSprite ? "Default" : "Shiny"}
                  </button>
                </div>
                {/* Eevee special case */}
                {pokemonDetails?.name === 'eevee' && (
                  <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded text-yellow-900 dark:text-yellow-100 text-center font-semibold">
                    Eevee has multiple unique evolutions! Select any branch below to explore its forms.
                  </div>
                )}
                {processedEvolutions ? (
                  <EvolutionTree
                    node={processedEvolutions}
                    showShiny={showShinyEvolutionSprite}
                    currentId={pokemonDetails?.id}
                    formatEvolutionDetails={formatEvolutionDetails}
                  />
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">No evolution data available.</p>
                )}
              </div>
            </FadeIn>
          )}
          {/* Cards Tab */}
          {activeTab === "cards" && (
            <FadeIn>
              <div className="mb-8">
                {/* TCG/Pocket Toggle - only show inside Cards tab */}
                <div className="flex items-center mb-4 justify-end">
                  <span className="mr-3 text-sm text-gray-600 dark:text-gray-400">Card source:</span>
                  <div className="flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                    <button
                      className={`px-4 py-1.5 text-sm ${activeCardSource === 'tcg' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'} transition-all flex items-center gap-1`}
                      onClick={() => setActiveCardSource('tcg')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      TCG
                    </button>
                    <button
                      className={`px-4 py-1.5 text-sm ${activeCardSource === 'pocket' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'} transition-all flex items-center gap-1`}
                      onClick={() => setActiveCardSource('pocket')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Pocket
                    </button>
                  </div>
                </div>
                {/* Card Lists */}
                <div className="min-h-[120px]">
                  {activeCardSource === 'tcg' ? (
                    <CardList
                      cards={filteredCards}
                      loading={loading}
                      error={error}
                      emptyMessage="No cards found for this Pokémon."
                      cardClassName="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
                      gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                    />
                  ) : (
                    <PocketCardList
                      cards={pocketCards}
                      loading={loadingPocketCards}
                      error={errorPocketCards}
                      emptyMessage="No Pocket cards found for this Pokémon."
                      cardClassName="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
                      gridClassName="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                    />
                  )}
                  {activeCardSource === 'tcg' && filteredCards.length === 0 && !loading && (
                    <div className="text-center py-10">
                      <p className="text-lg text-gray-500">No cards found matching your filters</p>
                      {(filterRarity || filterSet) && (
                        <button
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                          onClick={() => { setFilterRarity(''); setFilterSet(''); }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Flavor Texts Tab - Clean organized Pokédex entries */}
          {activeTab === "flavor" && (
            <FadeIn>
              <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Pokédex Entries</h3>
                
                {pokemonSpecies?.flavor_text_entries ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pokemonSpecies.flavor_text_entries
                      .filter(entry => entry.language.name === 'en')
                      .slice(0, 8)
                      .map((entry, idx) => (
                        <div key={idx} className="glass-elevated rounded-xl p-5 shadow-lg border-l-4 border-l-blue-500 hover:shadow-xl transition-all duration-300">
                          <div className="flex items-center justify-between mb-3">
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs px-3 py-1 rounded-full font-semibold">
                              {entry.version?.name?.toUpperCase() || `Entry ${idx + 1}`}
                            </span>
                            <div className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                              #{String(pokemonDetails?.id || 0).padStart(3, '0')}
                            </div>
                          </div>
                          
                          <blockquote className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm italic border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                            "{entry.flavor_text.replace(/[\f\n]/g, ' ')}"
                          </blockquote>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glass-elevated rounded-xl">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No Pokédex entries available</p>
                  </div>
                )}
              </div>
            </FadeIn>
          )}

          {/* Media Tab - Clean sprites and visual content */}
          {activeTab === "media" && (
            <FadeIn>
              <div className="glass-elevated p-6 rounded-2xl shadow-lg border-0">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Media Gallery</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Sprites Section */}
                  <div className="glass-elevated p-6 rounded-xl shadow-lg">
                    <h4 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white text-center">Game Sprites</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {pokemonDetails.sprites?.front_default && (
                        <div className="glass-elevated p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
                          <img src={pokemonDetails.sprites.front_default} alt="Front sprite" className="mx-auto mb-3 pixelated w-16 h-16" />
                          <p className="text-gray-700 dark:text-gray-300 text-xs font-semibold">Front</p>
                        </div>
                      )}
                      {pokemonDetails.sprites?.back_default && (
                        <div className="glass-elevated p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                          <img src={pokemonDetails.sprites.back_default} alt="Back sprite" className="mx-auto mb-3 pixelated w-16 h-16" />
                          <p className="text-gray-700 dark:text-gray-300 text-xs font-semibold">Back</p>
                        </div>
                      )}
                      {pokemonDetails.sprites?.front_shiny && (
                        <div className="glass-elevated p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
                          <img src={pokemonDetails.sprites.front_shiny} alt="Shiny front sprite" className="mx-auto mb-3 pixelated w-16 h-16" />
                          <p className="text-gray-700 dark:text-gray-300 text-xs font-semibold">✨ Shiny Front</p>
                        </div>
                      )}
                      {pokemonDetails.sprites?.back_shiny && (
                        <div className="glass-elevated p-4 rounded-lg text-center shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
                          <img src={pokemonDetails.sprites.back_shiny} alt="Shiny back sprite" className="mx-auto mb-3 pixelated w-16 h-16" />
                          <p className="text-gray-700 dark:text-gray-300 text-xs font-semibold">✨ Shiny Back</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Official Artwork */}
                  <div className="glass-elevated p-6 rounded-xl shadow-lg">
                    <h4 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white text-center">Official Artwork</h4>
                    {pokemonDetails.sprites?.other?.["official-artwork"]?.front_default ? (
                      <div className="text-center">
                        <div className="p-6 rounded-xl">
                          <img 
                            src={pokemonDetails.sprites.other["official-artwork"].front_default} 
                            alt={`${pokemonDetails.name} official artwork`}
                            className="mx-auto rounded-lg shadow-2xl max-w-full h-auto hover:scale-105 transition-transform duration-300"
                            style={{ maxHeight: '300px' }}
                          />
                          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">
                            Official Nintendo Artwork
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 glass-elevated rounded-xl">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">No official artwork available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Media Section */}
                <div className="mt-8 glass-elevated p-6 rounded-xl shadow-lg">
                  <h4 className="font-semibold text-lg mb-6 text-gray-900 dark:text-white text-center">Additional Sprites</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Dream World Sprite */}
                    {pokemonDetails.sprites?.other?.dream_world?.front_default && (
                      <div className="text-center glass-elevated p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-pink-500">
                        <img 
                          src={pokemonDetails.sprites.other.dream_world.front_default} 
                          alt="Dream World sprite" 
                          className="mx-auto mb-2 w-16 h-16 object-contain"
                        />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Dream World</p>
                      </div>
                    )}
                    
                    {/* Home Sprite */}
                    {pokemonDetails.sprites?.other?.home?.front_default && (
                      <div className="text-center glass-elevated p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                        <img 
                          src={pokemonDetails.sprites.other.home.front_default} 
                          alt="Home sprite" 
                          className="mx-auto mb-2 w-16 h-16 object-contain"
                        />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Pokémon Home</p>
                      </div>
                    )}

                    {/* Showdown Sprite */}
                    {pokemonDetails.sprites?.other?.showdown?.front_default && (
                      <div className="text-center glass-elevated p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
                        <img 
                          src={pokemonDetails.sprites.other.showdown.front_default} 
                          alt="Showdown sprite" 
                          className="mx-auto mb-2 w-16 h-16 object-contain"
                        />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Showdown</p>
                      </div>
                    )}

                    {/* Crystal Sprite */}
                    {pokemonDetails.sprites?.versions?.["generation-ii"]?.crystal?.front_default && (
                      <div className="text-center p-4 rounded-lg hover:shadow-lg transition-all duration-300 border-l-4 border-l-cyan-500">
                        <img 
                          src={pokemonDetails.sprites.versions["generation-ii"].crystal.front_default} 
                          alt="Crystal sprite" 
                          className="mx-auto mb-2 w-16 h-16 object-contain pixelated"
                        />
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">Crystal</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </SlideUp>
    </div>
  );
}

// ISR implementation for performance optimization
export async function getStaticPaths() {
  // Pre-generate popular Pokemon pages
  const popularPokemonIds = [
    1, 4, 7, 25, 39, 52, 54, 58, 104, 113, 122, 131, 133, 143, 150, 151, // Gen 1 favorites
    155, 158, 161, 179, 196, 197, 212, 248, 249, 250, // Gen 2 favorites
    255, 258, 261, 302, 380, 381, 384, // Gen 3 favorites
    387, 390, 393, 448, 483, 484, 487, // Gen 4 favorites
    495, 498, 501, 570, 635, 644, 645, 646, // Gen 5 favorites
  ];

  const paths = popularPokemonIds.map(id => ({
    params: { pokeid: id.toString() }
  }));

  return {
    paths,
    fallback: 'blocking' // Generate other pages on-demand
  };
}

export async function getStaticProps({ params }) {
  const { pokeid } = params;
  
  try {
    // Import caching utilities
    const { fetchPokemonWithCache, fetchPokemonSpeciesWithCache } = await import('../../utils/cachedPokemonUtils');
    
    // Fetch basic Pokemon data with caching
    const pokemonData = await fetchPokemonWithCache(pokeid);
    const speciesData = await fetchPokemonSpeciesWithCache(pokeid);
    
    // Basic error handling
    if (!pokemonData) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        pokemonData,
        speciesData,
        pokeid
      },
      revalidate: 3600 // Revalidate every hour (Pokemon data doesn't change often)
    };
  } catch (error) {
    console.error(`Error generating static props for Pokemon ${pokeid}:`, error);
    
    return {
      notFound: true
    };
  }
}
