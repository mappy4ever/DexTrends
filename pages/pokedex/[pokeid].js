import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { TypeBadge } from "../../components/ui/TypeBadge";
import { useFavorites } from "../../context/favoritescontext";
import { typeEffectiveness, getGeneration } from "../../utils/pokemonutils";
import { fetchData } from "../../utils/apiutils";
import EnhancedEvolutionDisplay from "../../components/ui/EnhancedEvolutionDisplay";
import PokemonFormSelector from "../../components/ui/PokemonFormSelector";
import EnhancedMovesDisplay from "../../components/ui/EnhancedMovesDisplay";
import CardList from "../../components/CardList";
import PocketCardList from "../../components/PocketCardList";
import { fetchPocketData } from "../../utils/pocketData";
import pokemonTCG from "pokemontcgsdk";
import PokeballLoader from "../../components/ui/PokeballLoader";
import Modal from "../../components/ui/Modal";

// Initialize Pokemon TCG SDK at module level
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY) {
  pokemonTCG.configure({ apiKey: process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY });
}

export default function PokemonDetail() {
  const router = useRouter();
  const { pokeid } = router.query;
  const { favorites, togglePokemonFavorite, isPokemonFavorite } = useFavorites();
  
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [tcgCards, setTcgCards] = useState([]);
  const [pocketCards, setPocketCards] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [abilities, setAbilities] = useState({});
  const [cardType, setCardType] = useState('tcg'); // Toggle between 'tcg' and 'pocket'
  const [zoomedCard, setZoomedCard] = useState(null);

  useEffect(() => {
    // Wait for router to be ready and pokeid to be available
    if (!router.isReady || !pokeid) return;

    const loadPokemon = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Loading Pokemon with ID:', pokeid);

        // Load Pokemon basic data
        const pokemonData = await fetchData(`https://pokeapi.co/api/v2/pokemon/${pokeid}`);
        setPokemon(pokemonData);

        // Load species data
        const speciesData = await fetchData(pokemonData.species.url);
        setSpecies(speciesData);

        // Load abilities
        await loadAbilities(pokemonData.abilities);

        // Load TCG cards for this Pokemon
        await loadCards(pokemonData.name);

      } catch (err) {
        console.error('Error loading Pokemon:', err);
        setError(`Failed to load Pokemon data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadPokemon();
  }, [router.isReady, pokeid]);

  // Load abilities data
  const loadAbilities = async (abilitiesList) => {
    if (!abilitiesList || abilitiesList.length === 0) return;
    
    const abilitiesData = {};
    
    for (const abilityInfo of abilitiesList) {
      try {
        const abilityData = await fetchData(abilityInfo.ability.url);
        const englishEntry = abilityData.effect_entries.find(entry => entry.language.name === 'en');
        
        abilitiesData[abilityInfo.ability.name] = {
          name: abilityInfo.ability.name,
          isHidden: abilityInfo.is_hidden,
          effect: englishEntry?.effect || 'No description available.',
          shortEffect: englishEntry?.short_effect || 'No description available.'
        };
      } catch (err) {
        console.error(`Error loading ability ${abilityInfo.ability.name}:`, err);
        abilitiesData[abilityInfo.ability.name] = {
          name: abilityInfo.ability.name,
          isHidden: abilityInfo.is_hidden,
          effect: 'Failed to load ability description.',
          shortEffect: 'Failed to load ability description.'
        };
      }
    }
    
    setAbilities(abilitiesData);
  };

  // Load related cards
  const loadCards = async (pokemonName) => {
    console.log('Loading cards for:', pokemonName);
    setCardsLoading(true);
    try {
      // Load TCG cards - with proper error handling
      try {
        console.log('API Key exists:', !!process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY);
        
        if (process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY) {
          pokemonTCG.configure({ apiKey: process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY });
        }
        
        // Check if pokemonTCG.card exists before using it
        if (pokemonTCG && pokemonTCG.card) {
          console.log('Searching TCG cards for:', pokemonName);
          const tcgResponse = await pokemonTCG.card.where({ q: `name:"${pokemonName}"` });
          console.log('TCG Response:', tcgResponse);
          setTcgCards(tcgResponse?.data || []);
        } else {
          console.warn('Pokemon TCG SDK not properly initialized');
          setTcgCards([]);
        }
      } catch (tcgError) {
        console.error('Error loading TCG cards:', tcgError);
        setTcgCards([]);
      }

      // Load Pocket cards - with separate error handling
      try {
        const allPocketCards = await fetchPocketData();
        const relatedPocketCards = allPocketCards.filter(card => 
          card.name.toLowerCase().includes(pokemonName.toLowerCase())
        );
        setPocketCards(relatedPocketCards);
      } catch (pocketError) {
        console.error('Error loading Pocket cards:', pocketError);
        setPocketCards([]);
      }
    } catch (err) {
      console.error('Error in loadCards:', err);
      setTcgCards([]);
      setPocketCards([]);
    } finally {
      setCardsLoading(false);
    }
  };

  const isFavorite = pokemon && isPokemonFavorite(pokemon.id);

  const toggleFavorite = () => {
    if (!pokemon) return;
    
    const favoriteData = {
      id: pokemon.id.toString(),
      name: pokemon.name,
      image: pokemon.sprites?.other?.["official-artwork"]?.front_default || pokemon.sprites?.front_default,
      types: pokemon.types.map(t => t.type.name),
      type: 'pokemon'
    };

    togglePokemonFavorite(favoriteData);
  };

  // Handle form changes
  const handleFormChange = async (formData) => {
    setPokemon(formData);
    // Update abilities for the new form
    await loadAbilities(formData.abilities);
    // Update cards for the new form
    await loadCards(formData.name);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PokeballLoader size="large" text="Loading Pokemon data..." randomBall={true} />
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Pokemon not found'}</p>
          <Link href="/pokedex" className="text-pokemon-red hover:underline">
            ← Back to Pokédex
          </Link>
        </div>
      </div>
    );
  }

  const generation = getGeneration(pokemon.id);

  return (
    <div>
      <Head>
        <title>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} | DexTrends Pokédex</title>
        <meta name="description" content={`Detailed information about ${pokemon.name} including stats, types, and abilities.`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/pokedex" className="text-pokemon-red hover:underline flex items-center">
            ← Back to Pokédex
          </Link>
          <button
            onClick={toggleFavorite}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isFavorite 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
          </button>
        </div>

        {/* Pokemon Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="text-center">
              <div className="relative w-64 h-64 mx-auto mb-4">
                <Image
                  src={pokemon.sprites?.other?.["official-artwork"]?.front_default || pokemon.sprites?.front_default || "/dextrendslogo.png"}
                  alt={pokemon.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="text-sm text-gray-500 font-mono">
                #{pokemon.id.toString().padStart(3, '0')}
              </p>
            </div>

            {/* Details */}
            <div>
              <h1 className="text-4xl font-bold capitalize text-gray-800 mb-4">
                {pokemon.name}
              </h1>

              {/* Form Selector */}
              {species && (
                <PokemonFormSelector
                  pokemon={pokemon}
                  species={species}
                  onFormChange={handleFormChange}
                />
              )}

              {/* Types */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Types</h3>
                <div className="flex gap-2">
                  {pokemon.types.map((typeInfo) => (
                    <TypeBadge key={typeInfo.type.name} type={typeInfo.type.name} size="md" />
                  ))}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-700 text-lg">Height</h4>
                  <p className="text-gray-600 text-lg">{(pokemon.height / 10).toFixed(1)} m</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 text-lg">Weight</h4>
                  <p className="text-gray-600 text-lg">{(pokemon.weight / 10).toFixed(1)} kg</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 text-lg">Generation</h4>
                  <p className="text-gray-600 text-lg">Generation {generation}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 text-lg">Base Experience</h4>
                  <p className="text-gray-600 text-lg">{pokemon.base_experience || 'Unknown'}</p>
                </div>
              </div>

              {/* Special Status */}
              {species && (species.is_legendary || species.is_mythical) && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 text-lg mb-1">Category</h4>
                  <p className="text-gray-600 text-lg">
                    {species.is_legendary && 'Legendary Pokémon'}
                    {species.is_mythical && 'Mythical Pokémon'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'stats', name: 'Stats' },
                { id: 'abilities', name: 'Abilities' },
                { id: 'moves', name: 'Moves' },
                { id: 'cards', name: 'Cards' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-pokemon-red text-pokemon-red'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Overview</h3>
                {species?.flavor_text_entries && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2 text-lg">Description</h4>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {species.flavor_text_entries
                        .find(entry => entry.language.name === 'en')
                        ?.flavor_text.replace(/\f/g, ' ') || 'No description available.'}
                    </p>
                  </div>
                )}
                
                {/* Type Effectiveness */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3 text-lg">Type Effectiveness</h4>
                  {(() => {
                    // Combine effectiveness for all Pokemon types
                    const combinedWeakTo = new Set();
                    const combinedResistantTo = new Set();
                    const combinedImmuneTo = new Set();
                    
                    pokemon.types.forEach(typeInfo => {
                      const effectiveness = typeEffectiveness[typeInfo.type.name];
                      if (effectiveness) {
                        effectiveness.weakTo?.forEach(t => combinedWeakTo.add(t));
                        effectiveness.resistantTo?.forEach(t => combinedResistantTo.add(t));
                        effectiveness.immuneTo?.forEach(t => combinedImmuneTo.add(t));
                      }
                    });
                    
                    // For dual types, remove resistances that are also weaknesses
                    if (pokemon.types.length > 1) {
                      combinedWeakTo.forEach(t => combinedResistantTo.delete(t));
                    }
                    
                    return (
                      <div className="space-y-3">
                        {combinedWeakTo.size > 0 && (
                          <div>
                            <p className="text-sm text-red-600 font-medium mb-1">Weak to:</p>
                            <div className="flex flex-wrap gap-1">
                              {Array.from(combinedWeakTo).map(type => (
                                <TypeBadge key={type} type={type} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {combinedResistantTo.size > 0 && (
                          <div>
                            <p className="text-sm text-green-600 font-medium mb-1">Resistant to:</p>
                            <div className="flex flex-wrap gap-1">
                              {Array.from(combinedResistantTo).map(type => (
                                <TypeBadge key={type} type={type} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {combinedImmuneTo.size > 0 && (
                          <div>
                            <p className="text-sm text-purple-600 font-medium mb-1">Immune to:</p>
                            <div className="flex flex-wrap gap-1">
                              {Array.from(combinedImmuneTo).map(type => (
                                <TypeBadge key={type} type={type} size="sm" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Evolution Chain */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 text-lg">Evolution Chain</h4>
                  <EnhancedEvolutionDisplay 
                    speciesUrl={pokemon.species.url}
                    currentPokemonId={pokemon.id}
                  />
                </div>
              </div>
            )}


            {activeTab === 'stats' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Base Stats</h3>
                <div className="space-y-4">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name} className="flex items-center">
                      <div className="w-32 text-base font-medium text-gray-700 capitalize">
                        {stat.stat.name.replace(/-/g, ' ')}
                      </div>
                      <div className="w-16 text-base text-gray-600 text-right mr-4">
                        {stat.base_stat}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-pokemon-red h-3 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((stat.base_stat / 200) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <div className="w-32 text-base font-bold text-gray-700">
                        Total
                      </div>
                      <div className="w-16 text-base font-bold text-gray-800 text-right mr-4">
                        {pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
                      </div>
                      <div className="flex-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'abilities' && (
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Abilities</h3>
                <div className="space-y-4">
                  {pokemon.abilities.map((abilityInfo) => {
                    const abilityData = abilities[abilityInfo.ability.name];
                    return (
                      <div key={abilityInfo.ability.name} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 capitalize mb-2 text-lg">
                          {abilityInfo.ability.name.replace(/-/g, ' ')}
                          {abilityInfo.is_hidden && (
                            <span className="ml-2 text-sm text-blue-600 font-normal">(Hidden Ability)</span>
                          )}
                        </h4>
                        <p className="text-gray-600 mb-2 text-base">
                          {abilityData?.effect || 'Loading ability description...'}
                        </p>
                        {abilityData?.shortEffect && abilityData.shortEffect !== abilityData.effect && (
                          <p className="text-base text-gray-500 italic">
                            {abilityData.shortEffect}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'moves' && (
              <EnhancedMovesDisplay moves={pokemon.moves} pokemonName={pokemon.name} />
            )}

            {activeTab === 'cards' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {cardType === 'tcg' ? 'TCG Cards' : 'Pocket Cards'}
                  </h3>
                  <div className="flex gap-3 mb-2">
                    <button
                      onClick={() => setCardType('tcg')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        cardType === 'tcg'
                          ? 'bg-pokemon-red text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      TCG
                    </button>
                    <button
                      onClick={() => setCardType('pocket')}
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        cardType === 'pocket'
                          ? 'bg-pokemon-red text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Pocket
                    </button>
                  </div>
                </div>
                
                {cardsLoading ? (
                  <div className="py-8">
                    <PokeballLoader size="medium" text="Loading cards..." randomBall={true} />
                  </div>
                ) : (
                  <>
                    {cardType === 'tcg' ? (
                      tcgCards.length > 0 ? (
                        <CardList 
                          cards={tcgCards}
                          loading={false}
                          showPrice={true}
                          showSet={true}
                          showView={false}
                        />
                      ) : (
                        <p className="text-center text-gray-500 py-8">No TCG cards found for {pokemon?.name || 'this Pokémon'}.</p>
                      )
                    ) : (
                      pocketCards.length > 0 ? (
                        <PocketCardList 
                          cards={pocketCards}
                          loading={false}
                          showPack={true}
                          showRarity={true}
                          setZoomedCard={setZoomedCard}
                          gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                        />
                      ) : (
                        <p className="text-center text-gray-500 py-8">No Pocket cards found for {pokemon?.name || 'this Pokémon'}.</p>
                      )
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <div>
            {pokemon.id > 1 && (
              <Link 
                href={`/pokedex/${pokemon.id - 1}`}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ← Previous
              </Link>
            )}
          </div>
          <div>
            {pokemon.id < 1010 && (
              <Link 
                href={`/pokedex/${pokemon.id + 1}`}
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Modal for zoomed card */}
      {zoomedCard && (
        <Modal onClose={() => setZoomedCard(null)}>
          <div className="flex justify-center">
            <Image
              src={zoomedCard.image}
              alt={zoomedCard.name}
              width={400}
              height={560}
              className="rounded-lg"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}