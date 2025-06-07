import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import Head from "next/head";
import { FadeIn, SlideUp } from "../../components/ui/Animations";
import { TypeBadge } from "../../components/ui/TypeBadge";
import CardList from "../../components/CardList";
import { useFavorites } from "../../context/FavoritesContext";
import { typeEffectiveness } from "../../utils/pokemonUtils";

export default function PokemonDetail() {
  const router = useRouter();
  const { pokeId } = router.query;
  const { favorites, togglePokemonFavorite } = useFavorites();
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [pokemonSpecies, setPokemonSpecies] = useState(null);
  const [generationInfo, setGenerationInfo] = useState(null);
  const [evolutions, setEvolutions] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("about");
  const [activeCardSource, setActiveCardSource] = useState("tcg");
  const [filterRarity, setFilterRarity] = useState("");
  const [filterSet, setFilterSet] = useState("");

  // Helper: is this Pokémon a favorite?
  const isFavorite = favorites?.pokemon?.includes(String(pokeId));

  // Fetch Pokémon details, species, evolution, and cards
  useEffect(() => {
    if (!router.isReady || !pokeId) return;
    setLoading(true);
    setError(null);
    setPokemonDetails(null);
    setPokemonSpecies(null);
    setGenerationInfo(null);
    setEvolutions([]);
    setCards([]);

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
        console.log('Fetching Pokémon details for', pokeId);
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`);
        console.log('Pokémon details response:', res);
        if (!res.ok) throw new Error("Pokémon not found");
        const details = await res.json();
        if (didCancel) return;
        setPokemonDetails(details);

        console.log('Fetching species:', details.species.url);
        const speciesRes = await fetch(details.species.url);
        console.log('Species response:', speciesRes);
        const species = await speciesRes.json();
        if (didCancel) return;
        setPokemonSpecies(species);

        if (species.generation) {
          console.log('Fetching generation:', species.generation.url);
          const genRes = await fetch(species.generation.url);
          const genData = await genRes.json();
          if (didCancel) return;
          setGenerationInfo(genData);
        }

        if (species.evolution_chain) {
          console.log('Fetching evolution chain:', species.evolution_chain.url);
          const evoRes = await fetch(species.evolution_chain.url);
          const evoData = await evoRes.json();
          if (didCancel) return;
          const evoList = [];
          let evo = evoData.chain;
          while (evo) {
            evoList.push({
              name: evo.species.name,
              url: evo.species.url,
            });
            evo = evo.evolves_to && evo.evolves_to[0];
          }
          setEvolutions(evoList);
        }

        try {
          console.log('Fetching TCG cards for', details.name);
          const cardsRes = await fetch(`https://api.pokemontcg.io/v2/cards?q=name:${details.name}`);
          console.log('TCG cards response:', cardsRes);
          if (cardsRes.ok) {
            const cardsData = await cardsRes.json();
            if (didCancel) return;
            setCards(cardsData.data || []);
          } else {
            console.error('TCG API error:', cardsRes.status, await cardsRes.text());
          }
        } catch (cardErr) {
          console.error('TCG API fetch failed:', cardErr);
        }
      } catch (err) {
        setError(err.message);
        console.error('Pokémon fetch failed:', err);
      } finally {
        if (!didCancel) setLoading(false);
        clearTimeout(timeout);
      }
    };
    fetchAll();
    return () => { didCancel = true; clearTimeout(timeout); };
  }, [router.isReady, pokeId]);

  // Type effectiveness info
  let typeEffectivenessInfo = null;
  if (pokemonDetails?.types?.length) {
    // Merge all types' effectiveness
    const allTypes = pokemonDetails.types.map(t => t.type.name);
    const weakTo = new Set();
    const resistantTo = new Set();
    const immuneTo = new Set();
    allTypes.forEach(type => {
      const eff = typeEffectiveness[type] || {};
      (eff.weakTo || []).forEach(t => weakTo.add(t));
      (eff.resistantTo || []).forEach(t => resistantTo.add(t));
      (eff.immuneTo || []).forEach(t => immuneTo.add(t));
    });
    typeEffectivenessInfo = {
      weakTo: Array.from(weakTo),
      resistantTo: Array.from(resistantTo),
      immuneTo: Array.from(immuneTo)
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
              src={pokemonDetails.sprites?.other?.["official-artwork"]?.front_default || "/DexTrendsLogo.png"}
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
                activeTab === "about"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("about")}
            >
              About
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
            <button
              className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all ${
                activeTab === "evolution"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("evolution")}
            >
              Evolution
            </button>
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
          {/* About Tab */}
          {activeTab === "about" && (
            <FadeIn>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Description */}
                <div className={`p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50`}>
                  <h3 className="font-bold text-lg mb-3">Description</h3>
                  <p className="mb-4">
                    {pokemonSpecies?.flavor_text_entries?.find(entry => entry.language.name === 'en')?.flavor_text.replace(/[\f\n]/g, ' ') || 'No description available.'}
                  </p>
                  <h3 className="font-bold text-lg mt-6 mb-3">Taxonomy</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Species</p>
                      <p className="font-medium">{pokemonSpecies?.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Habitat</p>
                      <p className="font-medium capitalize">{pokemonSpecies?.habitat?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Shape</p>
                      <p className="font-medium capitalize">{pokemonSpecies?.shape?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Growth Rate</p>
                      <p className="font-medium capitalize">{pokemonSpecies?.growth_rate?.name.replace('-', ' ') || 'Unknown'}</p>
                    </div>
                  </div>
                </div>
                {/* Type Effectiveness */}
                <div className={`p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50`}>
                  <h3 className="font-bold text-lg mb-4">Type Effectiveness</h3>
                  {typeEffectivenessInfo && (
                    <div className="space-y-4">
                      {typeEffectivenessInfo.weakTo.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-500 mb-1">Weak to</h4>
                          <div className="flex flex-wrap gap-2">
                            {typeEffectivenessInfo.weakTo.map(type => (
                              <TypeBadge key={type} type={type} size="md" />
                            ))}
                          </div>
                        </div>
                      )}
                      {typeEffectivenessInfo.resistantTo.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-500 mb-1">Resistant to</h4>
                          <div className="flex flex-wrap gap-2">
                            {typeEffectivenessInfo.resistantTo.map(type => (
                              <TypeBadge key={type} type={type} size="md" />
                            ))}
                          </div>
                        </div>
                      )}
                      {typeEffectivenessInfo.immuneTo.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-gray-500 mb-1">Immune to</h4>
                          <div className="flex flex-wrap gap-2">
                            {typeEffectivenessInfo.immuneTo.map(type => (
                              <TypeBadge key={type} type={type} size="md" />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Training Info */}
                  <h3 className="font-bold text-lg mt-6 mb-3">Training</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Base Happiness</p>
                      <p className="font-medium">{pokemonSpecies?.base_happiness || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Capture Rate</p>
                      <p className="font-medium">{pokemonSpecies?.capture_rate || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Base Exp</p>
                      <p className="font-medium">{pokemonDetails?.base_experience || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">EV Yield</p>
                      <p className="font-medium capitalize">
                        {pokemonDetails?.stats
                          .filter(stat => stat.effort > 0)
                          .map(stat => `${stat.effort} ${stat.stat.name.replace('-', ' ')}`)
                          .join(', ') || 'None'}
                      </p>
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
                {/* Base Stats */}
                <div className={`p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50`}>
                  <h3 className="font-bold text-lg mb-4">Base Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {pokemonDetails.stats.map(stat => (
                      <div key={stat.stat.name}>
                        <p className="text-sm text-gray-500 capitalize">{stat.stat.name.replace('-', ' ')}</p>
                        <p className="font-medium">{stat.base_stat}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Abilities (detailed) */}
                <div className={`p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50`}>
                  <h3 className="font-bold text-lg mb-4">Abilities (Detailed)</h3>
                  {pokemonDetails.abilities.map((ability, idx) => (
                    <div key={ability.ability.name} className="mb-4">
                      <h4 className="font-medium text-md capitalize">{ability.ability.name.replace('-', ' ')}</h4>
                      <p className="text-sm text-gray-500 mb-2">
                        {ability.is_hidden ? 'Hidden Ability' : 'Normal Ability'}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {ability.effect_entries?.find(entry => entry.language.name === 'en')?.effect || 'No effect description available.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Evolution Tab */}
          {activeTab === "evolution" && (
            <FadeIn>
              <div className="grid grid-cols-1 gap-8">
                {/* Evolution Chain */}
                <div className={`p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50`}>
                  <h3 className="font-bold text-lg mb-4">Evolution Chain</h3>
                  {evolutions.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {evolutions.map((evo, idx) => (
                        <div key={evo.url} className="flex items-center gap-2">
                          <Image
                            src={`https://pokeapi.co/media/sprites/pokemon/${evo.url.split('/').slice(-2, -1)}.png`}
                            alt={evo.name}
                            width={80}
                            height={80}
                            className="rounded-full"
                          />
                          <div className="flex-1">
                            <p className="text-md font-medium capitalize">{evo.name}</p>
                            <p className="text-sm text-gray-500">#{String(evo.url.split('/').slice(-2, -1)).padStart(3, '0')}</p>
                          </div>
                          {idx < evolutions.length - 1 && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No evolutions found.</p>
                  )}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Cards Tab */}
          {activeTab === "cards" && (
            <FadeIn>
              <div className="grid grid-cols-1 gap-8">
                {/* Card Filters */}
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
                  </div
