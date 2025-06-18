import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { FadeIn, SlideUp } from "../components/ui/animations";
import { TypeBadge } from "../components/ui/TypeBadge"; // Updated path
import { TypeFilter } from "../components/ui/TypeFilter"; // Updated path
import PocketDeckViewer from "../components/PocketDeckViewer"; // Updated path
import PocketExpansionViewer from "../components/PocketExpansionViewer"; // Updated path
import PocketRulesGuide from "../components/PocketRulesGuide"; // Updated path
import PocketCardList from "../components/PocketCardList"; // Import PocketCardList
import { fetchPocketData } from "../utils/pocketData";

export default function PocketMode() {
  const router = useRouter();
  const [pokemon, setPokemon] = useState([]);
  const [expansions, setExpansions] = useState([]);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState({
    pokemon: true,
    expansions: true,
    decks: true
  });
  const [error, setError] = useState({
    pokemon: null,
    expansions: null,
    decks: null
  });
  const [search, setSearch] = useState("");
  const [currentView, setCurrentView] = useState("pokemon"); // pokemon, decks, expansions, rules, packs
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name"); // name, rarity
  const [selectedExpansion, setSelectedExpansion] = useState(null);
  const [expansionCards, setExpansionCards] = useState([]);
  
  // Replace fetchPokemonData to use the live Pocket API
  const fetchPokemonData = async () => {
    try {
      setLoading(prev => ({ ...prev, pokemon: true }));
      setError(prev => ({ ...prev, pokemon: null }));
      const cards = await fetchPocketData(); // Now returns an array
      setPokemon(cards || []);
      setLoading(prev => ({ ...prev, pokemon: false }));
    } catch (err) {
      console.error("Failed to fetch Pokémon Pocket data:", err);
      setError(prev => ({ 
        ...prev, 
        pokemon: "Failed to load Pokémon Pocket data. Please try again later." 
      }));
      setLoading(prev => ({ ...prev, pokemon: false }));
    }
  };

  // Define fetch functions for expansions and decks
  const fetchExpansionsData = async () => {
    try {
      setLoading(prev => ({ ...prev, expansions: true }));
      setError(prev => ({ ...prev, expansions: null }));
      const data = await fetchPocketData();
      // Build unique expansions from the 'pack' property of each card
      const packs = Array.from(new Set(data.map(card => card.pack).filter(Boolean)));
      const expansions = packs.map(pack => ({ id: pack, name: pack }));
      setExpansions(expansions);
      setLoading(prev => ({ ...prev, expansions: false }));
    } catch (err) {
      console.error("Failed to fetch expansions data:", err);
      setError(prev => ({ 
        ...prev, 
        expansions: "Failed to load expansion data. Please try again later." 
      }));
      setLoading(prev => ({ ...prev, expansions: false }));
    }
  };
  
  const fetchDecksData = async () => {
    try {
      setLoading(prev => ({ ...prev, decks: true }));
      setError(prev => ({ ...prev, decks: null }));
      
      const response = await fetch("/api/pocket-decks", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store" // Disable caching
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch decks: " + response.status + " " + response.statusText);
      }
      
      const data = await response.json();
      setDecks(data);
      setLoading(prev => ({ ...prev, decks: false }));
    } catch (err) {
      console.error("Failed to fetch decks data:", err);
      setError(prev => ({ 
        ...prev, 
        decks: "Failed to load deck data. Please try again later." 
      }));
      setLoading(prev => ({ ...prev, decks: false }));
    }
  };
  
  // Call fetch functions when component mounts or view changes
  useEffect(() => {
    fetchPokemonData();
  }, []);
  
  useEffect(() => {
    if (currentView === "expansions" && expansions.length === 0) {
      fetchExpansionsData();
    } else if (currentView === "decks" && decks.length === 0) {
      fetchDecksData();
    }
  }, [currentView, expansions.length, decks.length]);

  // Filter and sort Pokémon by search term, type, and sort order
  const filteredPokemon = pokemon
    .filter(poke => 
      poke.name.toLowerCase().includes(search.toLowerCase()) &&
      (typeFilter === "all" || (poke.type && poke.type.toLowerCase() === typeFilter.toLowerCase()) || (poke.types && poke.types.includes(typeFilter)))
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "rarity") {
        // Simple rarity sorting logic (can be expanded)
        const rarityOrder = {
          "Common": 1,
          "Uncommon": 2,
          "Rare": 3,
          "Rare Holo": 4,
          "Rare Holo V": 5,
          "Rare Ultra": 6,
          "Rare Secret": 7
        };
        return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
      }
      return 0;
    });
  
  // Get unique types from all Pokémon cards for filter options
  const uniqueTypes = [...new Set(pokemon.flatMap(p => p.type ? [p.type] : (p.types || [])))];
  
  // View-specific loading state
  const isViewLoading = currentView === "pokemon" 
    ? loading.pokemon 
    : currentView === "expansions" 
      ? loading.expansions 
      : loading.decks;
  
  // View-specific error state
  const viewError = currentView === "pokemon" 
    ? error.pokemon 
    : currentView === "expansions" 
      ? error.expansions 
      : error.decks;

  // When an expansion is selected, filter cards for that set
  useEffect(() => {
    if (selectedExpansion && pokemon.length > 0) {
      const cardsForSet = pokemon.filter(card => card.pack === selectedExpansion.id);
      setExpansionCards(cardsForSet);
    } else {
      setExpansionCards([]);
    }
  }, [selectedExpansion, pokemon]);

  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <Head>
        <title>Pokémon TCG Pocket | DexTrends</title>
        <meta name="description" content="Explore the Pokémon Trading Card Game Pocket - the streamlined mobile version with simplified rules, exclusive cards, top decks, and expansions." />
        <meta property="og:title" content="Pokémon TCG Pocket | DexTrends" />
        <meta property="og:description" content="Explore Pokémon TCG Pocket cards, decks, and expansions for the mobile-optimized version of the Pokémon Trading Card Game." />
        <meta property="og:type" content="website" />
        <meta name="keywords" content="Pokemon TCG Pocket, Pokemon cards, TCG mobile, Pocket decks, Pokemon expansions" />
      </Head>
      <FadeIn>
        <div className="flex flex-col items-center justify-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-3">Pokémon TCG Pocket</h1>
          <p className="text-lg text-center text-gray-600 dark:text-gray-400 max-w-2xl mb-4">
            Explore the streamlined mobile version of the Pokémon Trading Card Game with simplified rules and unique cards.
          </p>
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded"></div>
        </div>
        
        {/* Secondary navigation for Pocket Mode - Sticky on mobile */}
        <div className="mb-6 sticky top-0 z-30 -mx-4 px-4 pt-2 pb-2 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <div className="flex overflow-x-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-2 shadow-sm">
            <button
              className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${
                currentView === "pokemon"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setCurrentView("pokemon")}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Cards
              </div>
            </button>
            <button
              className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${
                currentView === "decks"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setCurrentView("decks")}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Top Decks
              </div>
            </button>
            <button
              className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${
                currentView === "expansions"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setCurrentView("expansions")}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Expansions
              </div>
            </button>
            <button
              className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${
                currentView === "packs"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setCurrentView("packs")}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Booster Packs
              </div>
            </button>
            <button
              className={`px-5 py-2.5 font-medium text-sm rounded-md transition-all whitespace-nowrap ${
                currentView === "rules"
                  ? "bg-primary text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setCurrentView("rules")}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Rules
              </div>
            </button>
          </div>
        </div>
        
        {/* Dynamic filters based on current view */}
        {currentView === "pokemon" && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="block w-full p-3 pl-10 pr-10 text-base rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="Search cards by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button 
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => setSearch('')}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filters */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select
                    className="block w-full p-3 text-base rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Sort by Name</option>
                    <option value="rarity">Sort by Rarity</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Type filter using the new component */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-medium mb-2 text-gray-500 dark:text-gray-400">Filter by Type</h3>
              <TypeFilter 
                types={uniqueTypes} 
                selectedType={typeFilter} 
                onTypeChange={setTypeFilter}
              />
            </div>
          </div>
        )}
      
        {/* Main content */}
        {isViewLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
              <div className="w-20 h-20 rounded-full border-4 border-t-primary border-r-primary/70 border-b-primary/40 border-l-transparent animate-spin"></div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24">
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 4.75L19.25 9L12 13.25L4.75 9L12 4.75Z"
                  ></path>
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.25 12L4.75 15L12 19.25L19.25 15L14.6722 12"
                  ></path>
                </svg>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading...</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Preparing your Pokémon Pocket experience</p>
            </div>
          </div>
        ) : viewError ? (
          <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 opacity-30 rounded-full"></div>
              <svg className="w-24 h-24 text-red-500 mx-auto relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-red-600 dark:text-red-500">Connection Error</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md text-center">
              {viewError}
            </p>
            
            <button 
              onClick={() => {
                if (currentView === "pokemon") fetchPokemonData();
                else if (currentView === "expansions") fetchExpansionsData();
                else if (currentView === "decks") fetchDecksData();
              }} 
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-md transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
          </div>
        ) : currentView === "pokemon" ? (
          <>
            {/* TEST: Show one random card from each Pocket set */}
            {expansions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-3 text-center">Test: One Random Card from Each Pocket Set</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {expansions.map(set => {
                    const cardsInSet = pokemon.filter(card => card.pack === set.id);
                    if (!cardsInSet.length) return null;
                    const randomCard = cardsInSet[Math.floor(Math.random() * cardsInSet.length)];
                    return (
                      <Link href={`/pocketmode/${randomCard.id}`} key={randomCard.id} className="block transition-all duration-300">
                        <div className="flex flex-col items-center rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 border border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md relative overflow-hidden">
                          <div className="relative w-full h-40 mb-3">
                            <Image
                              src={randomCard.image || "/back-card.png"}
                              alt={randomCard.name}
                              width={150}
                              height={200}
                              layout="responsive"
                              className="transition-all duration-500 hover:scale-110 object-contain"
                              onError={e => { e.currentTarget.src = "/back-card.png"; }}
                            />
                          </div>
                          <h3 className="capitalize font-bold text-sm text-center mb-1 truncate w-full px-1">{randomCard.name}</h3>
                          <div className="flex gap-1.5 mt-1 flex-wrap justify-center">
                            {randomCard.types?.map(type => (
                              <TypeBadge key={type} type={type.toLowerCase()} size="sm" />
                            ))}
                          </div>
                          {randomCard.rarity && (
                            <span className="mt-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs rounded-full">{randomCard.rarity}</span>
                          )}
                          <div className="text-xs text-gray-400 mt-1 text-center">{set.name}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            {/* END TEST */}
            
            {/* Use PocketCardList for better rendering */}
            <PocketCardList 
              cards={filteredPokemon}
              loading={loading.pokemon}
              error={error.pokemon}
              emptyMessage="No Pokémon found. Try adjusting your search criteria."
              showPack={true}
              showRarity={true}
              showHP={true}
            />
          </>
        ) : currentView === "decks" ? (
          <div className="space-y-8">
            <div className="mb-5">
              <h2 className="text-2xl font-bold mb-5 flex items-center">
                <svg className="w-6 h-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Top Performing Decks
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
                Browse the most successful decks in the Pokémon TCG Pocket format. These decks have been optimized for the 30-card format and streamlined gameplay of the mobile version.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {decks.filter(deck => deck && deck.id).map(deck => (
                  <PocketDeckViewer key={deck.id} deck={deck} />
                ))}
              </div>
              
              <div className="flex justify-center mt-8">
                <button className="px-6 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg hover:shadow-md transition-all transform hover:scale-105 active:scale-95">
                  View All Decks
                </button>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="md:w-1/3">
                  <Image 
                    src="/back-card.png"
                    alt="Build your deck"
                    width={180}
                    height={250}
                    className="rounded-lg shadow-lg transform -rotate-6"
                  />
                </div>
                <div className="md:w-2/3">
                  <h3 className="text-xl font-bold mb-3">Build Your Own Deck</h3>
                  <p className="mb-4">
                    Create your own custom Pokémon TCG Pocket deck using our deck builder tool. Test your strategies and share your creations with the community.
                  </p>
                  <button className="px-5 py-2 bg-white dark:bg-gray-800 text-primary font-medium rounded-md hover:shadow transition-all flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Deck
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : currentView === "expansions" ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Expansions List Sidebar */}
            <div className="md:w-1/3 w-full md:max-w-xs mb-6 md:mb-0">
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 sticky top-24 max-h-[70vh] overflow-y-auto">
                <h3 className="text-lg font-bold mb-4 text-center">All Expansions</h3>
                <div className="space-y-3">
                  {expansions.filter(exp => exp && exp.id).map(expansion => (
                    <div
                      key={expansion.id}
                      className={`cursor-pointer rounded-lg px-3 py-2 transition-all border border-transparent hover:bg-primary/10 ${selectedExpansion && selectedExpansion.id === expansion.id ? 'bg-primary/20 border-primary' : ''}`}
                      onClick={() => setSelectedExpansion(expansion)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Optionally add logo here if available in future */}
                        <span className="font-medium text-base">{expansion.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Expansion Details & Cards */}
            <div className="flex-1">
              {selectedExpansion ? (
                <>
                  <button
                    className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium"
                    onClick={() => setSelectedExpansion(null)}
                  >
                    ← Back to All Expansions
                  </button>
                  <PocketExpansionViewer expansion={selectedExpansion} />
                  <h3 className="text-xl font-bold mt-8 mb-4 text-center">All Cards in {selectedExpansion.name}</h3>
                  <PocketCardList 
                    cards={expansionCards}
                    loading={false}
                    error={null}
                    emptyMessage="No cards found for this expansion."
                    showPack={false}
                    showRarity={true}
                    showHP={true}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-4">Select an expansion to view its details and cards.</h3>
                  <svg className="w-16 h-16 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ) : currentView === "packs" ? (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Booster Packs
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Discover the available booster packs in Pokémon TCG Pocket. Each pack contains carefully curated cards designed for the mobile experience.
              </p>
            </div>
            
            {/* Pack Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {expansions.map(pack => {
                const packCards = pokemon.filter(card => card.pack === pack.id);
                const cardCount = packCards.length;
                const rareCards = packCards.filter(card => card.rarity && (card.rarity.includes('★') || card.rarity.length >= 3));
                
                return (
                  <div key={pack.id} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{pack.name} Pack</h3>
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Cards:</span>
                        <span className="font-semibold">{cardCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Rare Cards:</span>
                        <span className="font-semibold text-yellow-600">{rareCards.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (rareCards.length / cardCount) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Sample Cards Preview */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Sample Cards:</h4>
                      <div className="flex gap-2 overflow-x-auto">
                        {packCards.slice(0, 3).map(card => (
                          <div key={card.id} className="flex-shrink-0 w-16 h-20 relative rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
                            <Image
                              src={card.image || "/back-card.png"}
                              alt={card.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ))}
                        {cardCount > 3 && (
                          <div className="flex-shrink-0 w-16 h-20 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-xs font-medium text-gray-500">
                            +{cardCount - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setSelectedExpansion(pack);
                        setCurrentView("expansions");
                      }}
                      className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-2.5 rounded-lg font-medium hover:shadow-md transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Explore {pack.name} Pack
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* Pack Opening Simulator */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-8 text-center border border-blue-200 dark:border-blue-800">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l2.09 6.26L21 9.27l-5 4.87L17.18 21 12 17.27 6.82 21 8 14.14l-5-4.87 6.91-1.01z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Pack Opening Simulator
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Experience the thrill of opening booster packs! Try your luck and see what rare cards you can discover.
                </p>
                <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105 active:scale-95">
                  Open a Pack
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  *Simulation only - no real cards or purchases involved
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-2xl font-bold mb-5 flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Pokémon TCG Pocket Rules & Guide
            </h2>
            
            {/* Import the PocketRulesGuide component */}
            <PocketRulesGuide />
          </div>
        )}
      </FadeIn>
    </div>
  );
}
