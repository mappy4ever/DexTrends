import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { fetchPocketData } from '../../utils/pocketData';
import { TypeBadge } from '../../components/ui/TypeBadge';

export default function DeckBuilder() {
  const router = useRouter();
  
  // Card data state
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Deck state
  const [deck, setDeck] = useState([]);
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedPack, setSelectedPack] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [showDeckList, setShowDeckList] = useState(false);
  
  // Constants matching Pokemon Pocket
  const MAX_DECK_SIZE = 20;
  const MAX_COPIES_PER_CARD = 2;
  
  // Load cards on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true);
        const data = await fetchPocketData();
        setAllCards(data || []);
      } catch (err) {
        setError('Failed to load cards');
        console.error('Error loading pocket cards:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadCards();
  }, []);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!allCards.length) return { types: [], packs: [], rarities: [] };
    
    const types = [...new Set(allCards.map(card => card.type).filter(Boolean))].sort();
    const packs = [...new Set(allCards.map(card => card.pack).filter(Boolean))].sort();
    const rarities = [...new Set(allCards.map(card => card.rarity).filter(Boolean))].sort();
    
    return { types, packs, rarities };
  }, [allCards]);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let filtered = allCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || card.type === selectedType;
      const matchesPack = !selectedPack || card.pack === selectedPack;
      const matchesRarity = !selectedRarity || card.rarity === selectedRarity;
      
      return matchesSearch && matchesType && matchesPack && matchesRarity;
    });
    
    // Sort cards
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'health':
          return parseInt(b.health || 0) - parseInt(a.health || 0);
        case 'rarity':
          return a.rarity.localeCompare(b.rarity);
        case 'pack':
          return a.pack.localeCompare(b.pack);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [allCards, searchTerm, selectedType, selectedPack, selectedRarity, sortBy]);

  // Deck statistics
  const deckStats = useMemo(() => {
    const totalCards = deck.reduce((sum, entry) => sum + entry.count, 0);
    const typeDistribution = {};
    const rarityDistribution = {};
    
    deck.forEach(entry => {
      const type = entry.card.type;
      const rarity = entry.card.rarity;
      
      typeDistribution[type] = (typeDistribution[type] || 0) + entry.count;
      rarityDistribution[rarity] = (rarityDistribution[rarity] || 0) + entry.count;
    });
    
    return {
      totalCards,
      typeDistribution,
      rarityDistribution,
      isEmpty: totalCards === 0,
      isFull: totalCards >= MAX_DECK_SIZE
    };
  }, [deck]);

  // Add card to deck
  const addCardToDeck = useCallback((card) => {
    setDeck(prevDeck => {
      const existingIndex = prevDeck.findIndex(entry => entry.card.id === card.id);
      const totalCards = prevDeck.reduce((sum, entry) => sum + entry.count, 0);
      
      // Check deck size limit
      if (totalCards >= MAX_DECK_SIZE && existingIndex === -1) {
        return prevDeck;
      }
      
      if (existingIndex >= 0) {
        // Card already in deck, increase count if under limit
        const currentCount = prevDeck[existingIndex].count;
        if (currentCount >= MAX_COPIES_PER_CARD) {
          return prevDeck;
        }
        
        if (totalCards >= MAX_DECK_SIZE) {
          return prevDeck;
        }
        
        const newDeck = [...prevDeck];
        newDeck[existingIndex].count += 1;
        return newDeck;
      } else {
        // New card, add to deck
        return [...prevDeck, { card, count: 1 }];
      }
    });
  }, []);

  // Remove card from deck
  const removeCardFromDeck = useCallback((cardId) => {
    setDeck(prevDeck => {
      const existingIndex = prevDeck.findIndex(entry => entry.card.id === cardId);
      if (existingIndex === -1) return prevDeck;
      
      const newDeck = [...prevDeck];
      if (newDeck[existingIndex].count > 1) {
        newDeck[existingIndex].count -= 1;
      } else {
        newDeck.splice(existingIndex, 1);
      }
      
      return newDeck;
    });
  }, []);

  // Clear entire deck
  const clearDeck = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the entire deck?')) {
      setDeck([]);
    }
  }, []);

  // Save deck
  const saveDeck = useCallback(() => {
    if (!deckName.trim()) {
      alert('Please enter a deck name');
      return;
    }
    
    if (deckStats.totalCards === 0) {
      alert('Cannot save an empty deck');
      return;
    }
    
    const deckData = {
      id: `deck_${Date.now()}`,
      name: deckName,
      description: deckDescription,
      cards: deck,
      stats: deckStats,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage (in a real app, this would be sent to a server)
    try {
      const savedDecks = JSON.parse(localStorage.getItem('pocketDecks') || '[]');
      savedDecks.push(deckData);
      localStorage.setItem('pocketDecks', JSON.stringify(savedDecks));
      
      alert('Deck saved successfully!');
      setShowSaveModal(false);
      setDeckName('');
      setDeckDescription('');
    } catch (error) {
      alert('Failed to save deck');
      console.error('Save error:', error);
    }
  }, [deckName, deckDescription, deck, deckStats]);

  // Get card count in deck
  const getCardCountInDeck = useCallback((cardId) => {
    const entry = deck.find(entry => entry.card.id === cardId);
    return entry ? entry.count : 0;
  }, [deck]);

  // Pokemon Pocket style rarity colors
  const getRarityColor = (rarity) => {
    if (rarity.includes('★★')) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
    if (rarity.includes('★')) return 'bg-gradient-to-r from-purple-500 to-purple-700 text-white';
    if (rarity.includes('◊◊◊◊')) return 'bg-gradient-to-r from-pink-500 to-pink-700 text-white';
    if (rarity.includes('◊◊◊')) return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
    if (rarity.includes('◊◊')) return 'bg-gradient-to-r from-green-500 to-green-700 text-white';
    return 'bg-gradient-to-r from-gray-400 to-gray-600 text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Head>
          <title>Deck Builder | Pokemon Pocket | DexTrends</title>
        </Head>
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading Cards...</h3>
          <p className="text-gray-300">Preparing the deck builder</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <Head>
          <title>Deck Builder | Pokemon Pocket | DexTrends</title>
        </Head>
        <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <Head>
        <title>Deck Builder | Pokemon Pocket | DexTrends</title>
        <meta name="description" content="Build and customize your Pokemon Pocket decks" />
      </Head>

      {/* Top Navigation Bar - Pokemon Pocket Style */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/pocketmode" 
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Pocket Mode
              </Link>
              <h1 className="text-2xl font-bold text-white">🛠️ Deck Builder</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm text-gray-300">Cards in Deck</div>
                <div className={`text-lg font-bold ${deckStats.isFull ? 'text-red-400' : 'text-yellow-400'}`}>
                  {deckStats.totalCards}/{MAX_DECK_SIZE}
                </div>
              </div>
              
              {!deckStats.isEmpty && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
                >
                  💾 Save Deck
                </button>
              )}
              
              <button
                onClick={() => setShowDeckList(!showDeckList)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
              >
                📋 {showDeckList ? 'Hide' : 'Show'} Deck
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Deck Panel - Left Side */}
          <div className={`lg:col-span-1 space-y-4 ${showDeckList ? '' : 'hidden lg:block'}`}>
            <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Current Deck</h2>
                {!deckStats.isEmpty && (
                  <button
                    onClick={clearDeck}
                    className="text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    🗑️ Clear
                  </button>
                )}
              </div>

              {deckStats.isEmpty ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">🃏</div>
                  <p className="text-sm">Start building your deck!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {deck.map((entry, index) => (
                    <div key={entry.card.id} className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
                      <div className="relative w-12 h-16 flex-shrink-0">
                        <Image
                          src={entry.card.image || "/dextrendslogo.png"}
                          alt={entry.card.name}
                          fill
                          className="object-contain rounded"
                          sizes="48px"
                        />
                      </div>
                      
                      <div className="flex-grow min-w-0">
                        <div className="font-medium text-white text-sm truncate">{entry.card.name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <TypeBadge type={entry.card.type} size="sm" />
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getRarityColor(entry.card.rarity)}`}>
                            {entry.card.rarity}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-sm font-bold px-2 py-1 rounded">
                          {entry.count}x
                        </span>
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => addCardToDeck(entry.card)}
                            disabled={entry.count >= MAX_COPIES_PER_CARD || deckStats.isFull}
                            className="text-green-400 hover:text-green-300 disabled:text-gray-500 disabled:cursor-not-allowed text-xs transition-colors"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeCardFromDeck(entry.card.id)}
                            className="text-red-400 hover:text-red-300 text-xs transition-colors"
                          >
                            −
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Deck Stats */}
              {!deckStats.isEmpty && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-sm">
                    <div className="font-semibold text-gray-300 mb-2">Type Distribution</div>
                    <div className="space-y-1">
                      {Object.entries(deckStats.typeDistribution).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TypeBadge type={type} size="sm" />
                            <span className="text-xs text-gray-300">{type}</span>
                          </div>
                          <span className="text-xs text-white font-mono">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card Browser - Right Side */}
          <div className="lg:col-span-3 space-y-4">
            {/* Filters - Pokemon Pocket Style */}
            <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {filterOptions.types.map(type => (
                    <option key={type} value={type} className="bg-gray-800">{type}</option>
                  ))}
                </select>
                
                <select
                  value={selectedPack}
                  onChange={(e) => setSelectedPack(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Packs</option>
                  {filterOptions.packs.map(pack => (
                    <option key={pack} value={pack} className="bg-gray-800">{pack}</option>
                  ))}
                </select>
                
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Rarities</option>
                  {filterOptions.rarities.map(rarity => (
                    <option key={rarity} value={rarity} className="bg-gray-800">{rarity}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name" className="bg-gray-800">Sort by Name</option>
                  <option value="type" className="bg-gray-800">Sort by Type</option>
                  <option value="health" className="bg-gray-800">Sort by Health</option>
                  <option value="rarity" className="bg-gray-800">Sort by Rarity</option>
                  <option value="pack" className="bg-gray-800">Sort by Pack</option>
                </select>
              </div>
              
              <div className="mt-3 text-sm text-gray-300">
                Showing {filteredCards.length} of {allCards.length} cards
              </div>
            </div>

            {/* Card Grid - Pokemon Pocket Style */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredCards.map((card) => {
                const countInDeck = getCardCountInDeck(card.id);
                const canAdd = countInDeck < MAX_COPIES_PER_CARD && !deckStats.isFull;
                
                return (
                  <div
                    key={card.id}
                    className="group relative bg-black/40 backdrop-blur-sm rounded-xl p-2 border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105 hover:bg-black/60"
                  >
                    {countInDeck > 0 && (
                      <div className="absolute top-1 right-1 z-10 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {countInDeck}
                      </div>
                    )}
                    
                    <div className="relative w-full aspect-[3/4] mb-2 overflow-hidden rounded-lg">
                      <Image
                        src={card.image || "/dextrendslogo.png"}
                        alt={card.name}
                        fill
                        className="object-contain transition-transform duration-200 group-hover:scale-110"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
                        sizes="(max-width: 640px) 150px, (max-width: 768px) 120px, 100px"
                      />
                    </div>
                    
                    <div className="text-center">
                      <h4 className="font-medium text-sm text-white mb-1 line-clamp-2">{card.name}</h4>
                      
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <TypeBadge type={card.type} size="sm" />
                      </div>
                      
                      <div className="text-xs mb-2">
                        <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRarityColor(card.rarity)}`}>
                          {card.rarity}
                        </div>
                        {card.health && (
                          <div className="text-gray-300 mt-1">HP: {card.health}</div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => addCardToDeck(card)}
                        disabled={!canAdd}
                        className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${
                          !canAdd 
                            ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                            : countInDeck > 0
                              ? 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
                              : 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
                        }`}
                      >
                        {!canAdd 
                          ? (countInDeck >= MAX_COPIES_PER_CARD ? `Max ${MAX_COPIES_PER_CARD}x` : 'Deck Full')
                          : countInDeck > 0 
                            ? `Add Another (${countInDeck}x)`
                            : 'Add to Deck'
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Save Deck Modal - Pokemon Pocket Style */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-black/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">💾 Save Deck</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deck Name</label>
                <input
                  type="text"
                  placeholder="Enter deck name..."
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Describe your deck strategy..."
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 mt-4">
              <h4 className="font-semibold text-white mb-2">Deck Summary</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Total Cards: {deckStats.totalCards}</div>
                <div>Types: {Object.keys(deckStats.typeDistribution).join(', ')}</div>
                <div>Unique Cards: {deck.length}</div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDeck}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
              >
                Save Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}