import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { FadeIn, SlideUp, Scale } from "../../components/ui/animations";
import { TypeBadge } from "../../components/ui/TypeBadge"; // Updated path
import { fetchPocketData } from "../../utils/pocketData";
import PocketCardList from "../../components/PocketCardList";
import Modal from "../../components/ui/Modal";

function PocketPokemonDetail() {
  const router = useRouter();
  const { pokemonid } = router.query; // Changed to pokemonid
  
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [zoomedCard, setZoomedCard] = useState(null);
  
  useEffect(() => {
    if (!router.isReady || !pokemonid) return; // Changed to pokemonid
    
    const fetchPokemonDetails = async () => {
      try {
        setLoading(true);
        // Fetch all Pocket data and find the specific card
        const allCards = await fetchPocketData();
        const card = allCards.find(c => c.id === pokemonid);
        
        if (!card) {
          throw new Error("Card not found");
        }
        
        setPokemonDetails(card);
        
        // Find related cards (same name or same Pokémon family)
        const relatedCards = allCards.filter(c => 
          c.id !== pokemonid && 
          (c.name.toLowerCase() === card.name.toLowerCase() || 
           (c.name.includes(card.name.split(' ')[0]) || card.name.includes(c.name.split(' ')[0])))
        ).slice(0, 10); // Limit to 10 related cards
        
        setCards(relatedCards);
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch Pokémon details:", err);
        setError(err.message || "Failed to load card details");
        setLoading(false);
      }
    };
    
    fetchPokemonDetails();
  }, [router.isReady, pokemonid]); // Changed to pokemonid
  
  if (loading) {
    return (
      <div className="container section-spacing-y-default max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
            <div className="w-20 h-20 rounded-full border-4 border-t-primary border-r-primary/70 border-b-primary/40 border-l-transparent animate-spin"></div>
          </div>
          <h3 className="mt-6 text-xl font-semibold">Loading card details...</h3>
        </div>
      </div>
    );
  }
  
  if (error || !pokemonDetails) {
    return (
      <div className="container section-spacing-y-default max-w-6xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 opacity-30 rounded-full"></div>
            <svg className="w-24 h-24 text-red-500 mx-auto relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-600 dark:text-red-500">Error Loading Card</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md text-center">
            {error || "Card not found or unavailable at this time."}
          </p>
          <button 
            onClick={() => router.push('/pocketmode', undefined, { shallow: false })}
            className="mt-6 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all"
          >
            Back to Pocket Mode
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <Head>
        <title>{pokemonDetails.name} | Pokémon TCG Pocket Card | DexTrends</title>
        <meta name="description" content={`View detailed information about ${pokemonDetails.name} Pokémon TCG Pocket card, including attacks, abilities, and market prices.`} />
        <meta property="og:title" content={`${pokemonDetails.name} | Pokémon TCG Pocket Card`} />
        <meta property="og:description" content={`Explore ${pokemonDetails.name} card details, attacks, abilities, and related cards in the Pokémon TCG Pocket format.`} />
        <meta property="og:type" content="website" />
        {pokemonDetails.image && <meta property="og:image" content={pokemonDetails.image} />}
        <meta name="keywords" content={`Pokemon TCG Pocket, ${pokemonDetails.name}, Pokemon card, ${pokemonDetails.types?.join(', ')}`} />
      </Head>
      <FadeIn>
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
            <Scale className="relative flex-shrink-0">
              <div className="relative w-64 h-96 sm:w-72 sm:h-108 lg:w-80 lg:h-120 cursor-pointer group">
                <Image 
                  src={pokemonDetails.image || "/back-card.png"} 
                  alt={pokemonDetails.name}
                  fill
                  className="drop-shadow-xl object-contain group-hover:scale-105 transition-transform duration-300 rounded-lg"
                  onClick={() => setZoomedCard(pokemonDetails)}
                  priority
                />
                {/* Zoom overlay indicator */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white/90 p-2 rounded-full shadow-lg">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Scale>
            
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold capitalize">
                    {pokemonDetails.name}
                    {pokemonDetails.supertype && (
                      <span className="ml-2 text-lg px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {pokemonDetails.supertype}
                      </span>
                    )}
                  </h1>
                </div>
                <Link href="/pocketmode">
                  <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Link>
              </div>
              
              <div className="flex gap-2 mt-3">
                {pokemonDetails.type && (
                  <TypeBadge 
                    type={pokemonDetails.type} 
                    size="lg" 
                    isPocketCard={true}
                  />
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg backdrop-blur-sm">
                {pokemonDetails.health && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">HP</h3>
                    <p className="text-lg font-semibold">{pokemonDetails.health}</p>
                  </div>
                )}
                {pokemonDetails.pack && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Pack</h3>
                    <p className="text-lg font-semibold">{pokemonDetails.pack}</p>
                  </div>
                )}
                {pokemonDetails.rarity && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Rarity</h3>
                    <p className="text-lg font-semibold">{pokemonDetails.rarity}</p>
                  </div>
                )}
                {pokemonDetails.artist && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Artist</h3>
                    <p className="text-lg font-semibold">{pokemonDetails.artist}</p>
                  </div>
                )}
                {pokemonDetails.ex && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">EX Card</h3>
                    <p className="text-lg font-semibold">{pokemonDetails.ex}</p>
                  </div>
                )}
                {pokemonDetails.fullart && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Art</h3>
                    <p className="text-lg font-semibold">{pokemonDetails.fullart}</p>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </FadeIn>
      
      <SlideUp delay={200}>
        {/* Mobile-optimized tab navigation */}
        <div className="mb-6">
          {/* Mobile: Horizontal scroll tabs */}
          <div className="flex sm:hidden overflow-x-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-2 gap-1 scrollbar-hide">
            <button
              className={`flex-shrink-0 px-4 py-2.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`flex-shrink-0 px-4 py-2.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${
                activeTab === "abilities"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("abilities")}
            >
              Abilities
            </button>
            <button
              className={`flex-shrink-0 px-4 py-2.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${
                activeTab === "similar"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("similar")}
            >
              Similar
            </button>
            <button
              className={`flex-shrink-0 px-4 py-2.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${
                activeTab === "tcg"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("tcg")}
            >
              TCG
            </button>
          </div>

          {/* Desktop: Grid tabs */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-2">
            <button
              className={`px-4 py-2.5 font-medium text-sm rounded-md transition-all ${
                activeTab === "overview"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`px-4 py-2.5 font-medium text-sm rounded-md transition-all ${
                activeTab === "abilities"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("abilities")}
            >
              Abilities
            </button>
            <button
              className={`px-4 py-2.5 font-medium text-sm rounded-md transition-all ${
                activeTab === "similar"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("similar")}
            >
              Similar Cards
            </button>
            <button
              className={`px-4 py-2.5 font-medium text-sm rounded-md transition-all ${
                activeTab === "tcg"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setActiveTab("tcg")}
            >
              View in TCG
            </button>
          </div>
        </div>
        
        <div className="mb-8">
          {activeTab === "overview" && (
            <FadeIn>
              <div className="p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
                <h3 className="font-bold text-lg mb-4">Card Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-500 mb-2">Card Information</h4>
                    <div className="space-y-2">
                      {pokemonDetails.artist && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Artist:</span>
                          <span className="font-medium">{pokemonDetails.artist}</span>
                        </div>
                      )}
                      {pokemonDetails.cardmarket?.prices?.averageSellPrice && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Avg. Market Price:</span>
                          <span className="font-medium">€{pokemonDetails.cardmarket.prices.averageSellPrice.toFixed(2)}</span>
                        </div>
                      )}
                      {pokemonDetails.set && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Release Date:</span>
                          <span className="font-medium">{pokemonDetails.set.releaseDate || "Unknown"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-500 mb-2">Game Details</h4>
                    <div className="space-y-2">
                      {pokemonDetails.retreatCost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Retreat Cost:</span>
                          <span className="font-medium">{pokemonDetails.retreatCost.length}</span>
                        </div>
                      )}
                      {pokemonDetails.convertedRetreatCost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Conv. Retreat Cost:</span>
                          <span className="font-medium">{pokemonDetails.convertedRetreatCost}</span>
                        </div>
                      )}
                      {pokemonDetails.evolvesFrom && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Evolves From:</span>
                          <span className="font-medium">{pokemonDetails.evolvesFrom}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}
          
          {activeTab === "abilities" && (
            <FadeIn>
              <div className="p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
                <h3 className="font-bold text-lg mb-4">Abilities & Attacks</h3>
                
                {/* Abilities */}
                {pokemonDetails.abilities && pokemonDetails.abilities.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="font-medium text-primary mb-3">Abilities</h4>
                    <div className="space-y-4">
                      {pokemonDetails.abilities.map((ability, index) => (
                        <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <h5 className="font-bold">{ability.name}</h5>
                          <p className="mt-1 text-sm">{ability.text}</p>
                          {ability.type && (
                            <div className="mt-2">
                              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                                {ability.type}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 mb-6">This Pokémon has no special abilities.</p>
                )}
                
                {/* Attacks */}
                {pokemonDetails.attacks && pokemonDetails.attacks.length > 0 ? (
                  <div>
                    <h4 className="font-medium text-primary mb-3">Attacks</h4>
                    <div className="space-y-4">
                      {pokemonDetails.attacks.map((attack, index) => (
                        <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div className="flex justify-between items-center">
                            <h5 className="font-bold">{attack.name}</h5>
                            <span className="text-right">
                              {attack.damage && (
                                <span className="ml-2 px-2 py-1 bg-red-100 dark:bg-red-800 rounded-full text-sm">
                                  {attack.damage}
                                </span>
                              )}
                            </span>
                          </div>
                          
                          <div className="flex items-center mt-2">
                            <div className="flex gap-1 mr-3">
                              {attack.cost?.map((type, i) => (
                                <div key={i} className="w-6 h-6">
                                  <TypeBadge type={type} size="xs" isPocketCard={true} />
                                </div>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              Cost: {attack.convertedEnergyCost || attack.cost?.length || 0}
                            </span>
                          </div>
                          
                          {attack.text && <p className="mt-2 text-sm">{attack.text}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">This Pokémon has no attacks.</p>
                )}
              </div>
            </FadeIn>
          )}
          
          {activeTab === "similar" && (
            <FadeIn>
              <div className="p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
                <h3 className="font-bold text-lg mb-4">Similar Cards</h3>
                
                <PocketCardList 
                  cards={cards}
                  loading={false}
                  error={null}
                  emptyMessage="No similar cards found."
                  showPack={true}
                  showRarity={true}
                  showHP={false}
                  gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                />
              </div>
            </FadeIn>
          )}
          
          {activeTab === "tcg" && (
            <FadeIn>
              <div className="p-6 rounded-lg shadow-sm bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50">
                <h3 className="font-bold text-lg mb-4">View in TCG Pokédex</h3>
                
                <div className="flex items-center justify-center py-8">
                  <Link href={`/pokedex/${pokemonDetails.name.toLowerCase()}`}>
                    <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-sm hover:shadow flex items-center gap-2">
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      View {pokemonDetails.name} in TCG Pokédex
                    </button>
                  </Link>
                </div>
                
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-center">
                    View the traditional Pokédex entry for {pokemonDetails.name} to see detailed Pokémon information, 
                    stats, evolutions, and more TCG cards.
                  </p>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </SlideUp>

      {/* Zoom Modal */}
      {zoomedCard && (
        <Modal onClose={() => setZoomedCard(null)}>
          <div className="flex flex-col items-center p-4">
            <div className="relative w-full max-w-md">
              <Image
                src={zoomedCard.image || "/back-card.png"}
                alt={zoomedCard.name}
                width={400}
                height={560}
                className="rounded-lg shadow-2xl w-full h-auto"
                priority
              />
            </div>
            <h3 className="mt-4 text-xl font-bold text-center">{zoomedCard.name}</h3>
            {zoomedCard.pack && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{zoomedCard.pack}</p>
            )}
            <button
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              onClick={() => setZoomedCard(null)}
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PocketPokemonDetail;
