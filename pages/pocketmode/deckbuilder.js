import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { fetchPocketData } from '../../utils/pocketData';
import { TypeBadge } from '../../components/ui/TypeBadge';
import { FadeIn, SlideUp } from '../../components/ui/animations';
import BackToTop from '../../components/ui/BackToTop';

export default function DeckBuilder() {
  const router = useRouter();
  
  // Card data state
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Deck state
  const [deck, setDeck] = useState([]);
  const [deckName, setDeckName] = useState('My Pocket Deck');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [zoomedCard, setZoomedCard] = useState(null);
  const [deckZoomIndex, setDeckZoomIndex] = useState(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedRarities, setSelectedRarities] = useState([]);
  const [selectedPacks, setSelectedPacks] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('compact'); // 'compact' or 'expanded'
  const [deckViewMode, setDeckViewMode] = useState('2x10'); // '2x10' or '5x5'
  
  // Constants matching Pokemon Pocket
  const MAX_DECK_SIZE = 20;
  const MAX_COPIES_PER_CARD = 2;
  
  // All available packs
  const ALL_PACKS = [
    'Charizard', 'Mewtwo', 'Pikachu', 'Mythical Island',
    'Apex', 'Mythical', 'Celestial', 'Eevee Grove',
    'Dialga', 'Palkia', 'Triumphant Light', 'Shining Revelry',
    'Solgaleo', 'Lunala', 'Extradimensional Crisis'
  ];
  
  // Load cards on component mount
  useEffect(() => {
    const loadCards = async () => {
      try {
        setLoading(true);
        const data = await fetchPocketData();
        setAllCards(data || []);
      } catch (err) {
        setError('Failed to load cards');
      } finally {
        setLoading(false);
      }
    };
    
    loadCards();
  }, []);

  // Helper function to get display type (handles trainer subtypes)
  const getDisplayType = useCallback((type, card) => {
    const lowerType = type?.toLowerCase() || '';
    
    if (lowerType === 'trainer') {
      const name = card.name?.toLowerCase() || '';
      
      const fossilPatterns = [/^helix fossil$/, /^dome fossil$/, /^old amber$/];
      const toolPatterns = [
        /tool$/, /^rocky helmet/, /^muscle band/, /^leftovers/, /^float stone/, /^choice band/, /^focus sash/, /^weakness policy/, /^air balloon/,
        /berry$/, /^lam berry/, /^oran berry/, /^sitrus berry/, /^pecha berry/, /^cheri berry/, /^aspear berry/,
        /cape$/, /^giant cape/, /^rescue cape/, /band$/, /^poison band/, /^expert band/, /^team band/,
        /barb$/, /^poison barb/, /^toxic barb/, /cord$/, /^electrical cord/, /^power cord/,
        /stone$/, /^evolution stone/, /^fire stone/, /^water stone/, /^thunder stone/, /^leaf stone/,
        /^protective/, /^defense/, /^shield/, /^energy/, /^double colorless energy/, /^rainbow energy/,
        /^lucky/, /^amulet/, /^charm/, /^crystal/, /^scope/, /^specs/, /^goggles/
      ];
      const supporterPatterns = [
        /^professor/, /^dr\./, /^mr\./, /^ms\./, /^mrs\./, /^captain/, /^gym leader/, /^elite/,
        /^team .* (grunt|admin|boss|leader)/, /grunt$/, /admin$/, /boss$/,
        /'s (advice|training|encouragement|help|research|orders|conviction|dedication|determination|resolve)$/,
        /research$/, /analysis$/, /theory$/,
        /^(erika|misty|blaine|koga|giovanni|brock|lt\. surge|sabrina|bill|oak|red)$/,
        /^(blue|green|yellow|gold|silver|crystal|ruby|sapphire)$/,
        /^(cynthia|lance|steven|wallace|diantha|iris|alder)$/,
        /^team/, /rocket/, /aqua/, /magma/, /galactic/, /plasma/, /flare/
      ];
      
      const itemPatterns = [
        /potion$/, /^potion$/, /^super potion/, /^hyper potion/, /^max potion/,
        /ball$/, /^poke ball/, /^great ball/, /^ultra ball/,
        /^x /, // X Speed, X Attack, etc.
        /^switch/, /^rope/, /candy$/, /^rare candy/
      ];
      
      if (fossilPatterns.some(pattern => pattern.test(name))) return 'Fossil';
      if (toolPatterns.some(pattern => pattern.test(name))) return 'Tool';
      if (itemPatterns.some(pattern => pattern.test(name))) return 'Item';
      if (supporterPatterns.some(pattern => pattern.test(name))) return 'Supporter';
      
      const words = card.name?.split(' ') || [];
      if (words.length <= 3 && words[0] && /^[A-Z]/.test(words[0])) {
        const personIndicators = ['grunt', 'admin', 'boss', 'leader', 'trainer', 'champion', 'rival'];
        if (personIndicators.some(indicator => name.includes(indicator))) return 'Supporter';
        if (words.length === 1 && /^[A-Z][a-z]+$/.test(words[0])) return 'Supporter';
      }
      
      return 'Item';
    }
    
    return type?.charAt(0).toUpperCase() + type?.slice(1).toLowerCase();
  }, []);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!allCards.length) return { types: [], packs: [], rarities: [] };
    
    // Get base types from cards
    const baseTypes = [...new Set(allCards.map(card => card.type).filter(Boolean))].sort();
    // Add trainer subtypes as separate filter options
    const types = baseTypes.includes('trainer') 
      ? [...baseTypes.filter(t => t !== 'trainer'), 'item', 'supporter', 'tool'].sort()
      : baseTypes;
    
    // Show all available packs from ALL_PACKS that have cards
    const allPacks = [...new Set(allCards.map(card => card.pack).filter(Boolean))];
    const packs = ALL_PACKS.filter(pack => allPacks.includes(pack));
    const rarities = [...new Set(allCards.map(card => card.rarity).filter(Boolean))].sort();
    
    return { types, packs, rarities };
  }, [allCards]);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let filtered = allCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle trainer subtype filtering
      let matchesType = selectedTypes.length === 0;
      if (!matchesType && card.type) {
        const cardTypeLower = card.type.toLowerCase();
        if (cardTypeLower === 'trainer') {
          // Check if any selected trainer subtype matches
          const displayType = getDisplayType(card.type, card).toLowerCase();
          matchesType = selectedTypes.includes(displayType);
        } else {
          // For non-trainer cards, check direct type match
          matchesType = selectedTypes.includes(cardTypeLower);
        }
      } else if (!matchesType && card.types) {
        // For cards with multiple types (array)
        matchesType = card.types.some(t => selectedTypes.includes(t.toLowerCase()));
      }
      
      const matchesPack = selectedPacks.length === 0 || selectedPacks.includes(card.pack);
      const matchesRarity = selectedRarities.length === 0 || selectedRarities.includes(card.rarity);
      
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
  }, [allCards, searchTerm, selectedTypes, selectedPacks, selectedRarities, sortBy]);

  // Deck statistics
  const deckStats = useMemo(() => {
    const totalCards = deck.reduce((sum, entry) => sum + entry.count, 0);
    const typeDistribution = {};
    
    deck.forEach(entry => {
      const type = entry.card.type;
      typeDistribution[type] = (typeDistribution[type] || 0) + entry.count;
    });
    
    return {
      totalCards,
      typeDistribution,
      isEmpty: totalCards === 0,
      isFull: totalCards >= MAX_DECK_SIZE
    };
  }, [deck]);

  // Add card to deck
  const addCardToDeck = useCallback((card) => {
    setDeck(prevDeck => {
      const existingIndex = prevDeck.findIndex(entry => entry.card.id === card.id);
      const totalCards = prevDeck.reduce((sum, entry) => sum + entry.count, 0);
      
      if (totalCards >= MAX_DECK_SIZE && existingIndex === -1) return prevDeck;
      
      if (existingIndex >= 0) {
        const currentCount = prevDeck[existingIndex].count;
        if (currentCount >= MAX_COPIES_PER_CARD || totalCards >= MAX_DECK_SIZE) return prevDeck;
        
        const newDeck = [...prevDeck];
        newDeck[existingIndex].count += 1;
        return newDeck;
      } else {
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

  // Add default cards (2x Professor Oak + 2x Pokeball)
  const addDefaultCards = useCallback(() => {
    const professorOak = allCards.find(card => 
      card.name.toLowerCase() === 'professor oak' || 
      card.name.toLowerCase() === 'professor research' ||
      card.name.toLowerCase() === 'professor\'s research'
    );
    const pokeball = allCards.find(card => 
      card.name.toLowerCase() === 'poke ball' || 
      card.name.toLowerCase() === 'poké ball' ||
      card.name.toLowerCase() === 'pokeball'
    );

    if (professorOak) {
      addCardToDeck(professorOak);
      addCardToDeck(professorOak);
    }
    if (pokeball) {
      addCardToDeck(pokeball);
      addCardToDeck(pokeball);
    }
  }, [allCards, addCardToDeck]);

  // Get card count in deck
  const getCardCountInDeck = useCallback((cardId) => {
    const entry = deck.find(entry => entry.card.id === cardId);
    return entry ? entry.count : 0;
  }, [deck]);

  // Clear entire deck
  const clearDeck = useCallback(() => {
    setDeck([]);
  }, []);

  // Save deck
  const saveDeck = useCallback(() => {
    if (deckStats.totalCards === 0) {
      alert('Cannot save an empty deck');
      return;
    }
    
    const deckData = {
      id: `deck_${Date.now()}`,
      name: deckName.trim() || 'Unnamed Deck',
      cards: deck,
      stats: deckStats,
      createdAt: new Date().toISOString()
    };
    
    try {
      const savedDecks = JSON.parse(localStorage.getItem('pocketDecks') || '[]');
      savedDecks.push(deckData);
      localStorage.setItem('pocketDecks', JSON.stringify(savedDecks));
      alert('Deck saved successfully!');
      setShowSaveModal(false);
    } catch (error) {
      alert('Failed to save deck');
    }
  }, [deck, deckName, deckStats]);

  // Toggle filter selection
  const toggleFilter = useCallback((value, setFunction) => {
    setFunction(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  }, []);

  // Type colors for filters
  const getTypeColor = (type) => {
    const typeColors = {
      fire: 'bg-red-500 hover:bg-red-600 text-white',
      water: 'bg-blue-500 hover:bg-blue-600 text-white',
      grass: 'bg-green-500 hover:bg-green-600 text-white',
      electric: 'bg-yellow-400 hover:bg-yellow-500 text-black',
      lightning: 'bg-yellow-400 hover:bg-yellow-500 text-black',
      psychic: 'bg-pink-500 hover:bg-pink-600 text-white',
      fighting: 'bg-orange-600 hover:bg-orange-700 text-white',
      darkness: 'bg-gray-800 hover:bg-gray-900 text-white',
      metal: 'bg-gray-500 hover:bg-gray-600 text-white',
      dragon: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      colorless: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
      trainer: 'bg-purple-500 hover:bg-purple-600 text-white',
      item: 'bg-blue-500 hover:bg-blue-600 text-white',
      supporter: 'bg-orange-500 hover:bg-orange-600 text-white',
      tool: 'bg-purple-600 hover:bg-purple-700 text-white'
    };
    return typeColors[type?.toLowerCase()] || 'bg-gray-400 hover:bg-gray-500 text-white';
  };

  // Pack colors
  const getPackColor = (pack) => {
    const packColors = {
      'Charizard': 'bg-orange-500 hover:bg-orange-600',
      'Mewtwo': 'bg-purple-500 hover:bg-purple-600',
      'Pikachu': 'bg-yellow-400 hover:bg-yellow-500 text-black',
      'Mythical Island': 'bg-pink-500 hover:bg-pink-600',
      'Apex': 'bg-red-600 hover:bg-red-700',
      'Mythical': 'bg-indigo-500 hover:bg-indigo-600',
      'Celestial': 'bg-cyan-500 hover:bg-cyan-600',
      'Eevee Grove': 'bg-green-500 hover:bg-green-600',
      'Dialga': 'bg-blue-600 hover:bg-blue-700',
      'Palkia': 'bg-purple-600 hover:bg-purple-700',
      'Triumphant Light': 'bg-yellow-500 hover:bg-yellow-600 text-black',
      'Shining Revelry': 'bg-pink-600 hover:bg-pink-700',
      'Solgaleo': 'bg-amber-500 hover:bg-amber-600',
      'Lunala': 'bg-indigo-600 hover:bg-indigo-700',
      'Extradimensional Crisis': 'bg-violet-500 hover:bg-violet-600'
    };
    return packColors[pack] || 'bg-gray-500 hover:bg-gray-600';
  };

  // Rarity colors
  const getRarityColor = (rarity) => {
    const rarityColors = {
      '◊': 'from-gray-400 to-gray-500',
      '◊◊': 'from-green-400 to-green-500',
      '◊◊◊': 'from-blue-400 to-blue-500',
      '◊◊◊◊': 'from-purple-400 to-purple-500',
      '★': 'from-yellow-400 to-amber-500',
      '★★': 'from-red-400 to-rose-500',
      '☆☆☆': 'from-pink-400 to-fuchsia-500'
    };
    return rarityColors[rarity] || 'from-gray-400 to-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Head>
          <title>Deck Builder | Pokemon Pocket | DexTrends</title>
        </Head>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pokemon-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 dark:text-gray-400">Loading Deck Builder...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Head>
          <title>Deck Builder | Pokemon Pocket | DexTrends</title>
        </Head>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-xl max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-pokemon-blue hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>Pokemon Pocket Deck Builder | DexTrends</title>
        <meta name="description" content="Build and customize your Pokemon Pocket decks with our advanced deck builder" />
      </Head>

      {/* Header */}
      <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/pocketmode"
                            className="flex items-center gap-2 text-pokemon-blue hover:text-blue-700 font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deck Builder</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {!deckStats.isEmpty && (
                <>
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Save Deck
                  </button>
                  <Link
                    href="/pocketmode/decks"
                            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                  >
                    My Decks
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Deck View at Top */}
      <div className="sticky top-16 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Deck Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Deck</h2>
              <div className={`text-xl font-bold ${
                deckStats.isFull ? 'text-green-600' : 
                deckStats.totalCards > 15 ? 'text-yellow-600' : 
                'text-gray-600 dark:text-gray-400'
              }`}>
                {deckStats.totalCards}/{MAX_DECK_SIZE}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Deck Zoom Button */}
              {!deckStats.isEmpty && (
                <button
                  onClick={() => setDeckZoomIndex(0)}
                  className="p-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title="View deck cards"
                >
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
              )}
              
              {/* Actions */}
              <button
                onClick={addDefaultCards}
                className="px-3 py-1.5 bg-pokemon-blue hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                + Starter
              </button>
              {!deckStats.isEmpty && (
                <button
                  onClick={clearDeck}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          {/* Deck Cards Grid */}
          <div className="w-full">
            {deck.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <div className="text-center">
                  <div className="text-3xl mb-2">🎴</div>
                  <p className="text-sm">Add cards to build your deck</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-10 grid-rows-2 gap-1 sm:gap-1.5 lg:gap-2 max-w-full mx-auto">
                {/* Fill grid with cards and empty slots */}
                {Array.from({ length: 20 }, (_, index) => {
                  // Calculate which card/count this slot represents
                  let cardIndex = 0;
                  let countIndex = index;
                  
                  for (const entry of deck) {
                    if (countIndex < entry.count) {
                      return (
                        <div
                          key={`slot-${index}`}
                          onClick={() => removeCardFromDeck(entry.card.id)}
                          className="relative aspect-[3/4] cursor-pointer group"
                        >
                          <div className="relative w-full h-full bg-gray-100 dark:bg-gray-700 rounded-md lg:rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-red-500 transition-all hover:scale-105">
                            <Image
                              src={entry.card.image || "/back-card.png"}
                              alt={entry.card.name}
                              fill
                              className="object-contain"
                              sizes="(max-width: 640px) 50px, (max-width: 1024px) 70px, (max-width: 1536px) 90px, 110px"
                            />
                            
                            {/* HP Badge */}
                            {entry.card.health && (
                              <div className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-0.5 sm:px-1 py-0.5 rounded-full">
                                {entry.card.health}
                              </div>
                            )}
                            
                            {/* EX Badge */}
                            {(entry.card.rarity === '★' || entry.card.name.toLowerCase().includes(' ex')) && (
                              <div className="absolute top-3 sm:top-4 right-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[8px] sm:text-[10px] font-bold px-0.5 sm:px-1 py-0.5 rounded-full">
                                EX
                              </div>
                            )}
                            
                            {/* Remove overlay */}
                            <div className="absolute inset-0 bg-red-600/0 hover:bg-red-600/20 transition-colors flex items-center justify-center">
                              <span className="text-white text-sm sm:text-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    countIndex -= entry.count;
                  }
                  
                  // Empty slot
                  return (
                    <div
                      key={`empty-${index}`}
                      className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded-md lg:rounded-lg border border-dashed border-gray-300 dark:border-gray-600 opacity-30"
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="space-y-4">
          {/* Card Browser */}
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search cards..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pokemon-red focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Simplified Filters */}
              <div className="space-y-3">
                {/* Type Filters */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Types</label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.types.map(type => {
                      const displayType = getDisplayType(type, { type });
                      return (
                        <button
                          key={type}
                          onClick={() => toggleFilter(type, setSelectedTypes)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            selectedTypes.includes(type)
                              ? `${getTypeColor(type)} shadow-md scale-105`
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                        >
                          {displayType}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rarity Filters */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Rarity</label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.rarities.map(rarity => (
                      <button
                        key={rarity}
                        onClick={() => toggleFilter(rarity, setSelectedRarities)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          selectedRarities.includes(rarity)
                            ? `bg-gradient-to-r ${getRarityColor(rarity)} text-white shadow-md scale-105`
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {rarity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pack Filters - Core packs only */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Packs</label>
                  <div className="flex flex-wrap gap-2">
                    {filterOptions.packs.map(pack => (
                      <button
                        key={pack}
                        onClick={() => toggleFilter(pack, setSelectedPacks)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all text-white ${
                          selectedPacks.includes(pack)
                            ? `${getPackColor(pack)} shadow-md scale-105`
                            : 'bg-gray-400 hover:bg-gray-500 opacity-60'
                        }`}
                      >
                        {pack}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pokemon-red text-gray-900 dark:text-white"
                  >
                    <option value="name">Name</option>
                    <option value="type">Type</option>
                    <option value="health">Health</option>
                    <option value="rarity">Rarity</option>
                  </select>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredCards.length} cards
                  </div>
                </div>
              </div>
            </div>

            {/* Card Grid - Responsive */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 lg:gap-4">
              {filteredCards.map((card) => {
                const countInDeck = getCardCountInDeck(card.id);
                const canAdd = countInDeck < MAX_COPIES_PER_CARD && !deckStats.isFull;
                const isEX = card.rarity === '★' || card.name.toLowerCase().includes(' ex');
                
                return (
                  <div
                    key={card.id}
                    onClick={() => canAdd && addCardToDeck(card)}
                    className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-300 overflow-hidden ${
                      !canAdd 
                        ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed' 
                        : countInDeck > 0
                          ? 'border-2 border-green-500 cursor-pointer hover:shadow-lg hover:scale-105 hover:border-green-400'
                          : 'border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg hover:scale-105 hover:border-pokemon-blue hover:border-2'
                    }`}
                  >
                    {/* Count Badge - Centered and larger */}
                    {countInDeck > 0 && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-green-500 text-white text-lg font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg border-2 border-white">
                        {countInDeck}
                      </div>
                    )}
                    
                    {/* Card Image */}
                    <div className="relative w-full aspect-[3/4] bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={card.image || "/back-card.png"}
                        alt={card.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, (max-width: 1024px) 160px, (max-width: 1280px) 180px, 200px"
                      />
                      
                      {/* HP Badge - Positioned at top right */}
                      {card.health && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                          {card.health} HP
                        </div>
                      )}
                      
                      {/* EX Badge - Positioned under HP badge */}
                      {isEX && (
                        <div className={`absolute right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-md ${
                          card.health ? 'top-8' : 'top-2'
                        }`}>
                          EX
                        </div>
                      )}
                      
                      {/* Magnifier Button - Positioned at top left */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedCard(card);
                        }}
                        className="absolute top-2 left-2 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                        title="View card details"
                      >
                        <svg className="w-4 h-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </button>
                      
                      {/* Hover Overlay */}
                      {canAdd && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <div className="text-white text-sm font-semibold text-center drop-shadow-lg">
                              {card.name}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Save Deck</h3>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Enter deck name..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pokemon-red text-gray-900 dark:text-white mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveDeck}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {zoomedCard && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setZoomedCard(null)}
        >
          <div 
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedCard(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
              <div className="relative aspect-[3/4]">
                <Image
                  src={zoomedCard.image || "/back-card.png"}
                  alt={zoomedCard.name}
                  fill
                  className="object-contain"
                  sizes="400px"
                  priority
                />
              </div>
              <div className="p-4 space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{zoomedCard.name}</h3>
                <div className="flex items-center gap-2">
                  {zoomedCard.type && (
                    <TypeBadge type={zoomedCard.type} size="sm" />
                  )}
                  {zoomedCard.health && (
                    <span className="px-2 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
                      {zoomedCard.health} HP
                    </span>
                  )}
                  {zoomedCard.rarity && (
                    <span className="px-2 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
                      {zoomedCard.rarity}
                    </span>
                  )}
                </div>
                {zoomedCard.pack && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Pack: <span className="font-medium">{zoomedCard.pack}</span>
                  </p>
                )}
                <button
                  onClick={() => {
                    if (getCardCountInDeck(zoomedCard.id) < MAX_COPIES_PER_CARD && !deckStats.isFull) {
                      addCardToDeck(zoomedCard);
                    }
                    setZoomedCard(null);
                  }}
                  disabled={getCardCountInDeck(zoomedCard.id) >= MAX_COPIES_PER_CARD || deckStats.isFull}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    getCardCountInDeck(zoomedCard.id) >= MAX_COPIES_PER_CARD || deckStats.isFull
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-pokemon-blue hover:bg-blue-700 text-white'
                  }`}
                >
                  {getCardCountInDeck(zoomedCard.id) >= MAX_COPIES_PER_CARD 
                    ? 'Max copies reached' 
                    : deckStats.isFull 
                      ? 'Deck is full'
                      : `Add to Deck (${getCardCountInDeck(zoomedCard.id)}/2)`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deck Zoom Modal */}
      {deckZoomIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setDeckZoomIndex(null)}
        >
          <div 
            className="relative max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => {
                  const flatDeck = deck.flatMap(entry => Array(entry.count).fill(entry.card));
                  const prevIndex = deckZoomIndex > 0 ? deckZoomIndex - 1 : flatDeck.length - 1;
                  setDeckZoomIndex(prevIndex);
                }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                disabled={deck.length === 0}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-white text-lg font-medium">
                {(() => {
                  const flatDeck = deck.flatMap(entry => Array(entry.count).fill(entry.card));
                  return `${deckZoomIndex + 1} / ${flatDeck.length}`;
                })()}
              </div>
              
              <button
                onClick={() => {
                  const flatDeck = deck.flatMap(entry => Array(entry.count).fill(entry.card));
                  const nextIndex = deckZoomIndex < flatDeck.length - 1 ? deckZoomIndex + 1 : 0;
                  setDeckZoomIndex(nextIndex);
                }}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
                disabled={deck.length === 0}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Card Display */}
            {(() => {
              const flatDeck = deck.flatMap(entry => Array(entry.count).fill(entry.card));
              const currentCard = flatDeck[deckZoomIndex];
              
              if (!currentCard) return null;
              
              return (
                <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={currentCard.image || "/back-card.png"}
                      alt={currentCard.name}
                      fill
                      className="object-contain"
                      sizes="400px"
                      priority
                    />
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentCard.name}</h3>
                    <div className="flex items-center gap-2">
                      {currentCard.type && (
                        <TypeBadge type={currentCard.type} size="sm" />
                      )}
                      {currentCard.health && (
                        <span className="px-2 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
                          {currentCard.health} HP
                        </span>
                      )}
                      {currentCard.rarity && (
                        <span className="px-2 py-1 bg-purple-600 text-white text-sm font-bold rounded-full">
                          {currentCard.rarity}
                        </span>
                      )}
                    </div>
                    {currentCard.pack && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pack: <span className="font-medium">{currentCard.pack}</span>
                      </p>
                    )}
                    <button
                      onClick={() => {
                        removeCardFromDeck(currentCard.id);
                        // Update index if needed
                        const newFlatDeck = deck.flatMap(entry => Array(entry.count).fill(entry.card));
                        if (deckZoomIndex >= newFlatDeck.length && newFlatDeck.length > 0) {
                          setDeckZoomIndex(newFlatDeck.length - 1);
                        } else if (newFlatDeck.length === 0) {
                          setDeckZoomIndex(null);
                        }
                      }}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Remove from Deck
                    </button>
                  </div>
                </div>
              );
            })()}
            
            {/* Close button */}
            <button
              onClick={() => setDeckZoomIndex(null)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Save/View Actions - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-gray-900 dark:text-white">Actions</h3>
            <div className={`text-lg font-bold ${
              deckStats.isFull ? 'text-green-600' : 
              deckStats.totalCards > 15 ? 'text-yellow-600' : 
              'text-gray-600 dark:text-gray-400'
            }`}>
              {deckStats.totalCards}/{MAX_DECK_SIZE}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addDefaultCards}
              className="px-3 py-1.5 bg-pokemon-blue hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
            >
              + Starter
            </button>
            {!deckStats.isEmpty && (
              <button
                onClick={clearDeck}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        {/* Horizontal scrolling deck preview */}
        {deck.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {deck.map((entry) => (
              Array.from({ length: entry.count }, (_, i) => (
                <div
                  key={`${entry.card.id}-${i}`}
                  onClick={() => removeCardFromDeck(entry.card.id)}
                  className="flex-shrink-0 w-12 cursor-pointer group"
                >
                  <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700 rounded overflow-hidden border border-gray-200 dark:border-gray-600 hover:border-red-500 transition-colors">
                    <Image
                      src={entry.card.image || "/back-card.png"}
                      alt={entry.card.name}
                      fill
                      className="object-contain"
                      sizes="48px"
                    />
                  </div>
                </div>
              ))
            ))}
          </div>
        )}
      </div>

      {/* Add padding to prevent content from being hidden behind mobile deck bar */}
      <div className="lg:hidden h-32"></div>

      <BackToTop />
    </div>
  );
}