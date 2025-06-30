import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import dynamic from "next/dynamic";
import { FadeIn, SlideUp } from "../components/ui/animations";
import { TypeBadge } from "../components/ui/TypeBadge";
import { TypeFilter } from "../components/ui/TypeFilter";
import PocketCardList from "../components/PocketCardList";
import { fetchPocketData } from "../utils/pocketData";
import BackToTop from "../components/ui/BackToTop";

// Dynamic imports for components that might cause SSR issues
const PokemonLoadingScreen = dynamic(() => import("../components/ui/PokemonLoadingScreen"), { ssr: false });
const PokemonEmptyState = dynamic(() => import("../components/ui/PokemonEmptyState"), { ssr: false });

export default function PocketMode() {
  const router = useRouter();
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState({
    pokemon: true
  });
  const [error, setError] = useState({
    pokemon: null
  });
  const [search, setSearch] = useState("");
  const [currentView, setCurrentView] = useState("cards"); // cards, deckbuilder
  const [typeFilter, setTypeFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name"); // name, rarity
  
  // Simple deck builder state
  const [currentDeck, setCurrentDeck] = useState([]);
  const [deckName, setDeckName] = useState("My Pocket Deck");
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  
  // Replace fetchPokemonData to use the live Pocket API
  const fetchPokemonData = async () => {
    try {
      setLoading(prev => ({ ...prev, pokemon: true }));
      setError(prev => ({ ...prev, pokemon: null }));
      const cards = await fetchPocketData(); // Now returns an array
      setPokemon(cards || []);
      setLoading(prev => ({ ...prev, pokemon: false }));
    } catch (err) {
      // Failed to fetch Pokémon Pocket data
      setError(prev => ({ 
        ...prev, 
        pokemon: "Failed to load Pokémon Pocket data. Please try again later." 
      }));
      setLoading(prev => ({ ...prev, pokemon: false }));
    }
  };
  
  // Call fetch functions when component mounts and load saved deck
  useEffect(() => {
    fetchPokemonData();
    
    // Check URL query parameter for view
    if (router.query.view === 'deckbuilder') {
      setCurrentView('deckbuilder');
    }
    
    // Auto-load saved deck if available
    const savedDeck = localStorage.getItem('pocket-deck');
    if (savedDeck) {
      try {
        const deckData = JSON.parse(savedDeck);
        setCurrentDeck(deckData.cards || []);
        setDeckName(deckData.name || 'My Pocket Deck');
      } catch (error) {
        console.error('Error loading saved deck:', error);
      }
    }
  }, [router.query.view]);

  // Smooth scroll to top when filters change significantly
  useEffect(() => {
    if (search || typeFilter !== 'all' || rarityFilter !== 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [search, typeFilter, rarityFilter]);

  // Enhanced keyboard shortcuts for better UX
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search on Ctrl/Cmd + K or just '/' key
      if ((e.ctrlKey || e.metaKey) && e.key === 'k' || e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search cards"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Switch between views with 1 and 2 keys
      if (e.key === '1' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
          setCurrentView('cards');
        }
      }
      
      if (e.key === '2' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        const activeElement = document.activeElement;
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
          setCurrentView('deckbuilder');
        }
      }
      
      // Clear search with Escape
      if (e.key === 'Escape') {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT' && activeElement.value) {
          setSearch('');
          activeElement.blur();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Simple deck builder functions
  const addCardToDeck = (card) => {
    const cardCount = currentDeck.filter(c => c.id === card.id).length;
    if (cardCount < 2 && currentDeck.length < 20) { // Pokemon Pocket rules: max 2 copies, 20 card deck
      setCurrentDeck([...currentDeck, card]);
    }
  };

  const removeCardFromDeck = (card) => {
    const cardIndex = currentDeck.findIndex(c => c.id === card.id);
    if (cardIndex !== -1) {
      const newDeck = [...currentDeck];
      newDeck.splice(cardIndex, 1);
      setCurrentDeck(newDeck);
    }
  };

  const clearDeck = () => {
    setCurrentDeck([]);
    localStorage.removeItem('pocket-deck');
  };

  const saveDeck = () => {
    if (currentDeck.length === 0) return;
    const deckData = {
      name: deckName,
      cards: currentDeck,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('pocket-deck', JSON.stringify(deckData));
    alert('Deck saved successfully!');
  };

  const loadDeck = () => {
    const savedDeck = localStorage.getItem('pocket-deck');
    if (savedDeck) {
      try {
        const deckData = JSON.parse(savedDeck);
        setCurrentDeck(deckData.cards || []);
        setDeckName(deckData.name || 'My Pocket Deck');
        alert('Deck loaded successfully!');
      } catch (error) {
        alert('Error loading deck');
      }
    } else {
      alert('No saved deck found');
    }
  };

  const getCardCountInDeck = (card) => {
    return currentDeck.filter(c => c.id === card.id).length;
  };

  // Filter and sort Pokémon by search term, type, rarity, and sort order
  const filteredPokemon = pokemon
    .filter(poke => 
      poke.name.toLowerCase().includes(search.toLowerCase()) &&
      (typeFilter === "all" || (poke.type && poke.type.toLowerCase() === typeFilter.toLowerCase()) || (poke.types && poke.types.includes(typeFilter))) &&
      (rarityFilter === "all" || poke.rarity === rarityFilter)
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
  
  // Get unique types and rarities from all Pokémon cards for filter options
  const uniqueTypes = [...new Set(pokemon.flatMap(p => p.type ? [p.type.toLowerCase()] : (p.types || []).map(t => t.toLowerCase())))];
  const uniqueRarities = [...new Set(pokemon.map(p => p.rarity).filter(Boolean))];
  
  // Use pokemon loading/error states
  const isViewLoading = loading.pokemon;
  const viewError = error.pokemon;

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
          
          {/* Simple View Toggle */}
          <div className="flex gap-2 mt-6 bg-light-grey rounded-lg p-1">
            <button
              onClick={() => setCurrentView("cards")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                currentView === "cards"
                  ? "bg-pokemon-red text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Browse Cards <span className="text-xs opacity-70 ml-1">(1)</span>
            </button>
            <button
              onClick={() => setCurrentView("deckbuilder")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                currentView === "deckbuilder"
                  ? "bg-pokemon-red text-white shadow-md"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Deck Builder <span className="text-xs opacity-70 ml-1">(2)</span>
            </button>
          </div>
          
          {/* Keyboard Shortcuts Help */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Press <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">/ or Cmd+K</kbd> to search, 
              <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded ml-1">1-2</kbd> to switch views,
              <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded ml-1">Esc</kbd> to clear
            </p>
          </div>
        </div>
        
        {/* Filters for Cards View */}
        {currentView === "cards" && (
          <div className="mb-4 px-4">
            {/* Search and Sort - Mobile Stack */}
            <div className="space-y-3 mb-4">
              {/* Search input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-text-grey" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="input-clean w-full pl-10 pr-10 focus:ring-2 focus:ring-pokemon-red/20 focus:border-pokemon-red transition-all duration-300"
                  placeholder="Search cards... (Press / to focus)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button 
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-grey hover:text-dark-text"
                    onClick={() => setSearch('')}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Sort and Rarity Filter dropdowns */}
              <div className="flex gap-3">
                <select
                  className="select-clean flex-1"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by Name</option>
                  <option value="rarity">Sort by Rarity</option>
                </select>
                <select
                  className="select-clean flex-1"
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                >
                  <option value="all">All Rarities</option>
                  {uniqueRarities.map(rarity => (
                    <option key={rarity} value={rarity}>
                      {rarity === '◊' ? 'Common (◊)' : 
                       rarity === '◊◊' ? 'Uncommon (◊◊)' : 
                       rarity === '◊◊◊' ? 'Rare (◊◊◊)' : 
                       rarity === '◊◊◊◊' ? 'Double Rare (◊◊◊◊)' : 
                       rarity === '★' ? 'EX (★)' : 
                       rarity === '★★' ? 'Crown (★★)' : 
                       rarity}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results counter */}
            {filteredPokemon.length !== pokemon.length && (
              <div className="bg-pokemon-red/10 border border-pokemon-red/20 rounded-lg p-3 text-center">
                <p className="text-sm text-pokemon-red font-medium">
                  Showing {filteredPokemon.length} of {pokemon.length} cards
                  {(search || typeFilter !== 'all' || rarityFilter !== 'all') && (
                    <span className="block text-xs mt-1 opacity-75">Active filters applied</span>
                  )}
                </p>
              </div>
            )}

            {/* Type filter - Mobile Horizontal Scroll */}
            <div className="bg-light-grey rounded-lg p-3">
              <h3 className="text-sm font-medium mb-2 text-text-grey">Filter by Type</h3>
              <TypeFilter 
                types={uniqueTypes} 
                selectedType={typeFilter} 
                onTypeChange={setTypeFilter}
                isPocketCard={true}
              />
            </div>
          </div>
        )}
        
        {/* Deck Builder Interface */}
        {currentView === "deckbuilder" && (
          <div className="mb-6 px-4">
            {/* Deck Info */}
            <div className="bg-white rounded-lg border border-border-color p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <input
                    type="text"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="text-xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-pokemon-red/20 rounded px-2"
                  />
                  <p className="text-sm text-gray-600">Pokémon TCG Pocket Deck</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    currentDeck.length === 20 ? 'text-green-600' : 
                    currentDeck.length > 20 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {currentDeck.length}/20
                  </div>
                  <div className="text-sm text-gray-500">Cards</div>
                  {currentDeck.length === 20 && (
                    <div className="text-xs text-green-600 font-medium">✓ Deck Complete!</div>
                  )}
                  {currentDeck.length > 20 && (
                    <div className="text-xs text-red-600 font-medium">Too many cards</div>
                  )}
                </div>
              </div>
              
              {/* Deck Statistics */}
              {currentDeck.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {[...new Set(currentDeck.map(c => c.type))].length}
                    </div>
                    <div className="text-xs text-gray-500">Types</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {[...new Set(currentDeck.map(c => c.rarity))].length}
                    </div>
                    <div className="text-xs text-gray-500">Rarities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-800">
                      {new Set(currentDeck.map(c => c.id)).size}
                    </div>
                    <div className="text-xs text-gray-500">Unique Cards</div>
                  </div>
                </div>
              )}
              
              {/* Deck Actions */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={saveDeck}
                    disabled={currentDeck.length === 0}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors text-sm flex-1"
                  >
                    Save
                  </button>
                  <button
                    onClick={loadDeck}
                    className="px-3 py-2 bg-pokemon-blue hover:bg-blue-700 text-white rounded-md font-medium transition-colors text-sm flex-1"
                  >
                    Load
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearDeck}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors text-sm flex-1"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setShowDeckBuilder(!showDeckBuilder)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors text-sm flex-1"
                  >
                    {showDeckBuilder ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              
              {/* Current Deck Display */}
              {showDeckBuilder && currentDeck.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Current Deck ({currentDeck.length}/20)</h4>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                    {Object.entries(
                      currentDeck.reduce((acc, card) => {
                        acc[card.id] = (acc[card.id] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([cardId, count]) => {
                      const card = currentDeck.find(c => c.id === cardId);
                      return (
                        <div key={cardId} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex items-center gap-3">
                            <Image
                              src={card.image || '/back-card.png'}
                              alt={card.name}
                              width={40}
                              height={56}
                              className="rounded"
                            />
                            <div>
                              <div className="font-medium text-sm">{card.name}</div>
                              <div className="text-xs text-gray-500">{card.type} • {card.rarity}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{count}x</span>
                            <button
                              onClick={() => removeCardFromDeck(card)}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Search for deck building */}
            <div className="bg-light-grey rounded-lg p-3 mb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-text-grey" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="input-clean w-full pl-10 pr-4 focus:ring-2 focus:ring-pokemon-red/20 focus:border-pokemon-red transition-all duration-300"
                  placeholder="Search cards to add to deck..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      
        {/* Main content with enhanced loading */}
        {isViewLoading ? (
          <div className="relative">
            <PokemonLoadingScreen 
              type="silhouette" 
              message="Preparing Pocket Mode..."
            />
          </div>
        ) : viewError ? (
          <PokemonEmptyState 
            type="error"
            customMessage={viewError}
            actionButton={
              <button 
                onClick={() => fetchPokemonData()} 
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                ⚡ Revive Connection
              </button>
            }
          />
        ) : currentView === "cards" ? (
          <PocketCardList 
            cards={filteredPokemon}
            loading={loading.pokemon}
            error={error.pokemon}
            emptyMessage={`No Pokémon found${search || typeFilter !== 'all' || rarityFilter !== 'all' ? ' with current filters' : ''}. Try adjusting your search criteria.`}
            showPack={true}
            showRarity={true}
            showHP={true}
          />
        ) : (
          /* Deck Builder Cards View */
          (<div className="px-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredPokemon.map((card) => {
                const cardCount = getCardCountInDeck(card);
                const canAdd = cardCount < 2 && currentDeck.length < 20;
                
                return (
                  <div key={card.id} className="relative group">
                    {/* Card Image */}
                    <div className="relative bg-white rounded-lg border border-border-color overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div className="aspect-[3/4] relative">
                        <Image
                          src={card.image || '/back-card.png'}
                          alt={card.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.67vw"
                        />
                        
                        {/* Card count badge */}
                        {cardCount > 0 && (
                          <div className="absolute top-2 right-2 bg-pokemon-red text-white text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                            {cardCount}
                          </div>
                        )}
                      </div>
                      
                      {/* Card Info */}
                      <div className="p-3">
                        <h3 className="font-medium text-sm mb-1 line-clamp-2">{card.name}</h3>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{card.type}</span>
                          <span>{card.rarity}</span>
                        </div>
                      </div>
                      
                      {/* Add/Remove Buttons */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => addCardToDeck(card)}
                          disabled={!canAdd}
                          className={`px-3 py-1 text-sm font-medium rounded transition-all transform hover:scale-105 ${
                            canAdd
                              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                          }`}
                          title={!canAdd ? (cardCount >= 2 ? 'Max 2 copies allowed' : 'Deck is full (20 cards)') : 'Add to deck'}
                        >
                          {canAdd ? '+Add' : (cardCount >= 2 ? 'Max' : 'Full')}
                        </button>
                        {cardCount > 0 && (
                          <button
                            onClick={() => removeCardFromDeck(card)}
                            className="px-3 py-1 text-sm font-medium rounded bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-105 shadow-lg"
                            title="Remove from deck"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {filteredPokemon.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No cards found matching your search.</p>
                <button
                  onClick={() => setSearch('')}
                  className="px-4 py-2 bg-pokemon-red hover:bg-red-700 text-white rounded-md font-medium transition-colors"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>)
        )}
      </FadeIn>
      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}