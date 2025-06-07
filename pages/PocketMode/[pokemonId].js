import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { FadeIn, SlideUp, Scale } from "../../components/ui/Animations";
import { TypeBadge } from "../../components/ui/TypeBadge";

function PocketPokemonDetail() {
  const router = useRouter();
  const { pokemonId } = router.query;
  
  // Debug: Log router state and pokemonId on every render
  if (typeof window !== 'undefined') {
    console.log('router.isReady:', router.isReady, 'pokemonId:', pokemonId, 'router.query:', router.query);
  }
  
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  useEffect(() => {
    if (!router.isReady || !pokemonId) return;
    
    const fetchPokemonDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.tcgdex.net/v2/en/cards/${pokemonId}`);
        if (!response.ok) throw new Error("Card not found");
        const data = await response.json();
        
        setPokemonDetails(data);
        
        // Also fetch related cards
        try {
          const relatedResponse = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(data.name)}`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            setCards(relatedData.filter(card => card.id !== pokemonId));
          }
        } catch (err) {
          console.error("Failed to fetch related cards:", err);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch Pokémon details:", err);
        setError(err.message || "Failed to load card details");
        setLoading(false);
      }
    };
    
    fetchPokemonDetails();
  }, [router.isReady, pokemonId]);
  
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
            onClick={() => router.push('/PocketMode', undefined, { shallow: false })}
            className="mt-6 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all"
          >
            Back to Pocket Mode
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container section-spacing-y-default max-w-6xl mx-auto px-4">
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
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Scale className="relative">
              <div className="relative w-48 h-64 md:w-64 md:h-80 transform hover:scale-105 transition-transform duration-300">
                <Image 
                  src={pokemonDetails.image || "/back-card.png"} 
                  alt={pokemonDetails.name}
                  width={260}
                  height={360}
                  layout="responsive"
                  className="drop-shadow-xl object-contain"
                />
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
                <Link href="/PocketMode">
                  <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Link>
              </div>
              
              <div className="flex gap-2 mt-3">
                {pokemonDetails.types?.map(type => (
                  <TypeBadge 
                    key={type} 
                    type={type.toLowerCase()} 
                    size="lg" 
                  />
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg backdrop-blur-sm">
                {pokemonDetails.hp && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">HP</h3>
                    <p className="text-lg font-semibold">{pokemonDetails.hp}</p>
                  </div>
                )}
                {pokemonDetails.set && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Set</h3>
                    <p className="text-lg font-semibold">{pokemonDetails.set.name}</p>
                  </div>
                )}
                {pokemonDetails.number && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Card Number</h3>
                    <p className="text-lg font-semibold">{pokemonDetails.number}</p>
                  </div>
                )}
              </div>
              
              {pokemonDetails.tcgplayer?.prices && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg backdrop-blur-sm">
                  <h3 className="font-medium text-lg mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Market Prices
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(pokemonDetails.tcgplayer.prices).map(([key, value]) => (
                      <div key={key} className="p-2 bg-white dark:bg-gray-800 rounded shadow-sm">
                        <h4 className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</h4>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${value.market ? value.market.toFixed(2) : (value.mid || 0).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </FadeIn>
      
      <SlideUp delay={200}>
        <div className="flex mb-6 overflow-x-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-2">
          <button
            className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all ${
              activeTab === "overview"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all ${
              activeTab === "abilities"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("abilities")}
          >
            Abilities
          </button>
          <button
            className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all ${
              activeTab === "similar"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("similar")}
          >
            Similar Cards
          </button>
          <button
            className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all ${
              activeTab === "tcg"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("tcg")}
          >
            View in TCG
          </button>
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
                                  <TypeBadge type={type.toLowerCase()} size="xs" />
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
                
                {cards && cards.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {cards.map(card => (
                      <Link href={`/PocketMode/${card.id}`} key={card.id}>
                        <div className="flex flex-col items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg transform hover:scale-105 transition-all">
                          <div className="relative w-full h-40 mb-2">
                            <Image 
                              src={card.image || "/back-card.png"} 
                              alt={card.name}
                              width={120}
                              height={180}
                              layout="responsive"
                              className="drop-shadow-sm"
                              objectFit="contain"
                            />
                          </div>
                          <h4 className="text-sm font-medium text-center truncate w-full">{card.name}</h4>
                          {card.set && (
                            <p className="text-xs text-gray-500 text-center truncate w-full">{card.set.name}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">No similar cards found.</p>
                  </div>
                )}
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
    </div>
  );
};

export default PocketPokemonDetail;
