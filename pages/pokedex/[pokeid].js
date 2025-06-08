import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { FadeIn, SlideUp } from "../../components/ui/animations";
import { TypeBadge } from "../../components/ui/TypeBadge"; // Updated path
import CardList from "../../components/cardlist";
import { useFavorites } from "../../context/favoritescontext";
import { typeEffectiveness, extractIdFromUrl } from "../../utils/pokemonutils";
import { toLowercaseUrl } from "../../utils/formatters";
import { fetchData } from "../../utils/apiutils"; // Import fetchData

export default function PokemonDetail() {
  const router = useRouter();
  const { pokeid } = router.query;
  const { favorites, togglePokemonFavorite } = useFavorites();
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [pokemonSpecies, setPokemonSpecies] = useState(null);
  const [generationInfo, setGenerationInfo] = useState(null);
  // const [evolutions, setEvolutions] = useState([]); // Old simple evolutions state
  const [processedEvolutions, setProcessedEvolutions] = useState([]);
  const [showShinySprite, setShowShinySprite] = useState(false);
  const [showShinyEvolutionSprite, setShowShinyEvolutionSprite] = useState(false);
  const [detailedAbilities, setDetailedAbilities] = useState([]);
  const [groupedMoves, setGroupedMoves] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // Part 1: Default to "info"
  const [activeCardSource, setActiveCardSource] = useState("tcg");
  const [filterRarity, setFilterRarity] = useState("");
  const [filterSet, setFilterSet] = useState("");
  const [relatedPokemonList, setRelatedPokemonList] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState(null);

  // Helper: is this Pokémon a favorite?
  const isFavorite = favorites?.pokemon?.includes(String(pokeid)); // Changed pokeId to pokeid

  // Fetch Pokémon details, species, evolution, and cards
  useEffect(() => {
    if (!router.isReady || !pokeid) return; // Changed pokeId to pokeid
    setLoading(true);
    setError(null);
    setPokemonDetails(null);
    setPokemonSpecies(null);
    setGenerationInfo(null);
    setEvolutions([]);
    setCards([]);
    setRelatedPokemonList([]); // Reset related list on new Pokemon
    setRelatedError(null);    // Reset related error

    let didCancel = false;
    // Timeout fallback: always end loading after 15s
    const timeout = setTimeout(() => {
      if (!didCancel) {
        setLoading(false);
        setError('Request timed out.');
        console.error('Pokémon detail fetch timed out.');
      }
    }, 15000);

    // Fetch main Pokémon data
    const fetchAll = async () => {
      try {
        console.log('Fetching Pokémon details for', pokeid); // Corrected pokeId to pokeid
        const details = await fetchData(`https://pokeapi.co/api/v2/pokemon/${pokeid}`);
        if (didCancel) return;
        setPokemonDetails(details);

        console.log('Fetching species:', details.species.url);
        const species = await fetchData(details.species.url);
        if (didCancel) return;
        setPokemonSpecies(species);

        if (species.generation && species.generation.url) {
          console.log('Fetching generation:', species.generation.url);
          const genData = await fetchData(species.generation.url);
          if (didCancel) return;
          setGenerationInfo(genData);

          // Fetch related Pokemon from the same generation
          if (genData.pokemon_species && pokeid) { // Changed pokeId to pokeid
            setRelatedLoading(true);
            setRelatedError(null);
            try {
              // Ensure pokeid is a string for comparison, as IDs from URL are strings
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
        } else {
            if (!didCancel) setRelatedLoading(false);
        }


        if (species.evolution_chain && species.evolution_chain.url) {
          console.log('Fetching evolution chain:', species.evolution_chain.url);
          const evoData = await fetchData(species.evolution_chain.url);
          if (didCancel) return;
          // const evoList = []; // Old simple list
          let evo = evoData.chain;
          // Process the evolution chain data in detail (Part 2)
          const parseEvoChain = (chain) => {
            const flatList = [];
            function buildFlatListRecursively(node, evolutionDetailsToReachThisNode = null) {
              if (!node || !node.species) return;
              const speciesId = extractIdFromUrl(node.species.url);
              flatList.push({
                name: node.species.name,
                id: speciesId,
                spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
                shinySpriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${speciesId}.png`,
                evolutionDetails: evolutionDetailsToReachThisNode,
              });
              if (node.evolves_to && node.evolves_to.length > 0) {
                // Simplified: takes the first evolution path
                buildFlatListRecursively(node.evolves_to[0], node.evolves_to[0].evolution_details);
              }
            }
            if (chain) {
              buildFlatListRecursively(chain);
            }
            return flatList;
          };
          if (evoData.chain) {
            setProcessedEvolutions(parseEvoChain(evoData.chain));
          } else {
            setProcessedEvolutions([]);
          }
        }

        // Fetch detailed abilities (Part 3)
        if (details.abilities) {
          const abilityPromises = details.abilities.map(async (abilityEntry) => {
            try {
              const abilityData = await fetchData(abilityEntry.ability.url);
              const effectEntry = abilityData.effect_entries.find(e => e.language.name === 'en');
              return {
                name: abilityData.name.replace('-', ' '), // Already formatted in previous step, but ensure consistency
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
          });
          const resolvedAbilities = (await Promise.all(abilityPromises));
          if (!didCancel) setDetailedAbilities(resolvedAbilities.filter(Boolean));
        }

        try {
          console.log('Fetching TCG cards for', details.name);
          // Note: The TCG API might have different error structures,
          // but fetchData provides basic handling. Specific error handling for TCG might be needed if issues arise.
          const cardsData = await fetchData(`https://api.pokemontcg.io/v2/cards?q=name:${details.name}`);
          if (didCancel) return;
          setCards(cardsData.data || []);
        } catch (cardErr) {
          console.error('TCG API fetch failed:', cardErr.message); // Log message from fetchData
          // Optionally, set a specific error state for cards if needed
        }
      } catch (err) { // This catches errors from the primary fetchData calls (pokemon, species, etc.)
        if (!didCancel) setError(err.message);
        console.error('Pokémon fetch failed:', err);
      } finally {
        if (!didCancel) setLoading(false);
        clearTimeout(timeout);
      }
    };
    fetchAll();
    return () => { didCancel = true; clearTimeout(timeout); };
  }, [router.isReady, pokeid]);

  // Process moves data (Part 2)
  useEffect(() => {
    if (pokemonDetails && pokemonDetails.moves) {
      const movesByMethod = pokemonDetails.moves.reduce((acc, moveEntry) => {
        const moveName = moveEntry.move.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const learnDetail = moveEntry.version_group_details[moveEntry.version_group_details.length - 1]; // Use latest
        const method = learnDetail.move_learn_method.name;

        if (!acc[method]) acc[method] = [];

        let displayData = { name: moveName, id: extractIdFromUrl(moveEntry.move.url) };
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
    <div className="container max-w-2xl mx-auto py-10 px-4">
      <Head>
        <title>{pokemonDetails.name} | Pokédex | DexTrends</title>
      </Head>
      <FadeIn>
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* Pokémon Image */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <Image
              src={pokemonDetails.sprites?.other?.["official-artwork"]?.front_default || "/dextrendslogo.png"}
              alt={pokemonDetails.name}
              width={240}
              height={240}
              className="mb-4"
            />
          </div>

          {/* Pokémon Info */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold capitalize flex items-center">
                  {pokemonDetails.name}
                  <span className="text-primary font-bold ml-3 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md text-2xl md:text-3xl">
                    #{String(pokemonDetails.id).padStart(3, '0')}
                  </span>
                </h1>
              </div>
              <button
                className={`p-2 rounded-full transition-all duration-300 ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-500'}`}
                onClick={() => togglePokemonFavorite(pokemonDetails.id)}
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

            {/* Pokémon Types */}
            <div className="flex gap-2 mt-3">
              {pokemonDetails.types.map((type) => (
                <TypeBadge
                  key={type.type.name}
                  type={type.type.name}
                  size="lg"
                />
              ))}
            </div>

            {/* Generation info as a badge */}
            {generationInfo && (
              <div className="mt-2">
                <span className="inline-block bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-semibold px-2.5 py-1 rounded">
                  {generationInfo.name}
                </span>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg backdrop-blur-sm">
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
                <p className="text-lg font-semibold capitalize">
                  {pokemonDetails.abilities.map((ability, idx) => (
                    <span key={ability.ability.name}>
                      {ability.ability.name.replace('-', ' ')}
                      {ability.is_hidden && <span className="text-xs text-gray-500 ml-1">(Hidden)</span>}
                      {idx < pokemonDetails.abilities.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </FadeIn>

      <SlideUp delay={200}>
        {/* Tabs */}
        <div className="flex flex-col mb-6">
          {/* Card Source Toggle */}
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

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-2">
            <button
              className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all ${
                activeTab === "info" // Part 1: Renamed tab check
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("info")} // Part 1: Renamed tab set
            >
              Info
            </button>
            <button
              className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all ${
                activeTab === "stats"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("stats")}
            >
              Stats
            </button>
            {/* Evolution Tab Button Removed */}
            <button
              className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all ${
                activeTab === "cards"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("cards")}
            >
              Cards
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {/* Info Tab (Renamed from About) */}
          {activeTab === "info" && (
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Description, Taxonomy, Training, Type Effectiveness, Additional Info */}
                <div className={`p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50`}>
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
                      <p className="font-medium capitalize">
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

                {/* Column 2: Base Stats & Shiny Toggle (Part 1) */}
                <div className={`p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50`}>
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
                      unoptimized={true}
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
                </div>
              </div>
            </FadeIn>
          )}
          {/* Stats Tab */}
          {activeTab === "stats" && (
            <FadeIn>
              <div className="grid grid-cols-1 gap-8">
                 <div className={`p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50`}>
                   <h3 className="font-bold text-lg mb-4">Detailed Stat Analysis</h3>
                   <p className="text-gray-600 dark:text-gray-400 mb-4">
                     Base stats are now displayed in the "Info" tab. This section can be used for a more in-depth look at stat distributions,
                     effort values (EVs), or how this Pokémon's stats compare to others.
                   </p>
                   <h4 className="font-semibold text-md mt-4 mb-2">EV Yield</h4>
                   <p className="text-gray-700 dark:text-gray-300 capitalize">
                     {pokemonDetails?.stats?.filter(s => s.effort > 0).map(s => `${s.effort} ${s.stat.name.replace('-', ' ')}`).join(', ') || 'None specified'}
                   </p>
                 </div>
                {/* Abilities (detailed) (Part 3) */}
                <div className={`p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50`}>
                  <h3 className="font-bold text-lg mb-4">Abilities</h3>
                  {detailedAbilities.length > 0 ? (
                    detailedAbilities.map((ability) => (
                      <div key={ability.name} className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0 last:mb-0">
                        <h4 className="font-semibold text-md capitalize flex items-center">
                          {ability.name}
                          {ability.is_hidden && (
                            <span className="ml-2 text-xs bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-purple-200 px-1.5 py-0.5 rounded-full">
                              Hidden
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ability.description}</p>
                      </div>
                    ))
                  ) : (
                     pokemonDetails.abilities.map((ability) => (
                      <div key={ability.ability.name} className="mb-4">
                        <h4 className="font-medium text-md capitalize">{ability.ability.name.replace('-', ' ')}</h4>
                        <p className="text-sm text-gray-500 mb-2">
                          {ability.is_hidden ? 'Hidden Ability' : 'Normal Ability'}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 italic">Loading description...</p>
                      </div>
                     ))
                  )}
                </div>
              </div>
            </FadeIn>
          )}
          {/* Evolution Tab content removed as it's a separate section now */}
          {activeTab === "evolution" && (
             <FadeIn>
               <div className="p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
                 <h3 className="font-bold text-lg mb-4">Evolution Data</h3>
                 <p className="text-gray-600 dark:text-gray-400">
                   The full evolution chain is now displayed in a dedicated section below.
                 </p>
               </div>
             </FadeIn>
          )}
          {/* Cards Tab */}
          {activeTab === "cards" && (
            <FadeIn>
              <div className="grid grid-cols-1 gap-8">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Rarity Filter */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rarity</label>
                    <select
                      value={filterRarity}
                      onChange={(e) => setFilterRarity(e.target.value)}
                      className="block w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary"
                    >
                      <option value="">All Rarities</option>
                      {uniqueRarities.map(rarity => (
                        <option key={rarity} value={rarity}>{rarity}</option>
                      ))}
                    </select>
                  </div>

                  {/* Set Filter */}
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Set</label>
                    <select
                      value={filterSet}
                      onChange={(e) => setFilterSet(e.target.value)}
                      className="block w-full p-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-primary focus:border-primary"
                    >
                      <option value="">All Sets</option>
                      {uniqueSets.map(set => (
                        <option key={set} value={set}>{set}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <CardList
                  cards={filteredCards}
                  source={activeCardSource}
                  pokemonName={pokemonDetails.name}
                  loading={loading && cards.length === 0}
                  error={!loading && cards.length === 0 && pokemonDetails?.name ? 'No cards found for this Pokémon.' : null}
                />
              </div>
            </FadeIn>
          )}
        </div>
      </SlideUp>

      {/* Related Pokemon Section */}
      {relatedPokemonList.length > 0 && !relatedLoading && !relatedError && (
        <SlideUp delay={300}>
          <div className="mt-12 p-4 md:p-6 rounded-lg shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
              Other Pokémon in {generationInfo?.name ? generationInfo.name.replace('generation-','Gen ').toUpperCase() : 'this Generation'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {relatedPokemonList.map(relatedPoke => {
                const id = extractIdFromUrl(relatedPoke.url); // Use utility here
                const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
                return (
                  <div
                    key={id}
                    className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-200 cursor-pointer group transform hover:scale-105 active:scale-95 shadow-sm border border-gray-200/50 dark:border-gray-700/50"
                    onClick={() => router.push(toLowercaseUrl(`/pokedex/${id}`))} // Already uses toLowercaseUrl
                    title={`View ${relatedPoke.name}`}
                  >
                    <div className="relative w-20 h-20 md:w-24 md:h-24 mb-2">
                      <Image
                        src={spriteUrl}
                        alt={relatedPoke.name}
                        layout="fill"
                        objectFit="contain"
                        className="group-hover:rotate-3 transition-transform"
                        onError={(e) => {
                          e.currentTarget.srcset = "/dextrendslogo.png"; // Fallback for modern browsers
                          e.currentTarget.src = "/dextrendslogo.png"; // Fallback for older browsers
                        }}
                      />
                    </div>
                    <p className="text-sm font-semibold capitalize text-center text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                      {relatedPoke.name.replace(/-/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">#{String(id).padStart(3, '0')}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </SlideUp>
      )}

      {/* Loading/Error states for Related Pokemon (if list is empty or during initial load, or if main loading is done) */}
      {relatedLoading && (!pokemonDetails || relatedPokemonList.length === 0) && (
         <div className="text-center py-8">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-3"></div>
           <p className="text-gray-500 dark:text-gray-400">Loading related Pokémon...</p>
         </div>
       )}
      {relatedError && (!pokemonDetails || relatedPokemonList.length === 0) &&(
        <div className="text-center py-8 px-4">
          <p className="text-red-500 bg-red-50 dark:bg-red-900/30 p-3 rounded-md border border-red-200 dark:border-red-700/50">
            <span className="font-semibold">Error:</span> {relatedError}
          </p>
        </div>
      )}
    </div>
  );
}
