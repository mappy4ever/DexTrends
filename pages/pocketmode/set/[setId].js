import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { fetchPocketData } from '../../../utils/pocketData';
import { TypeBadge } from '../../../components/ui/TypeBadge';
import StyledBackButton from '../../../components/ui/StyledBackButton';
import { FullBleedWrapper } from '../../../components/ui/FullBleedWrapper';

export default function SetView() {
  const router = useRouter();
  const { setId } = router.query;
  
  // Data state
  const [allCards, setAllCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [setInfo, setSetInfo] = useState(null);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  
  // Load cards and set info on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!setId) return;
      
      try {
        setLoading(true);
        
        // Load cards data
        const cards = await fetchPocketData();
        setAllCards(cards || []);
        
        // Load set information from API
        const expansionsResponse = await fetch("/api/pocket-expansions");
        if (expansionsResponse.ok) {
          const expansions = await expansionsResponse.json();
          const currentSet = expansions.find(exp => exp.id === setId);
          setSetInfo(currentSet);
        }
        
      } catch (err) {
        setError('Failed to load set data');
        console.error('Error loading set data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [setId]);

  // Filter cards for this set
  const setCards = useMemo(() => {
    if (!allCards.length || !setId) return [];
    
    // Map set IDs to pack names
    const setNameMap = {
      'mewtwo': 'Mewtwo',
      'charizard': 'Charizard', 
      'pikachu': 'Pikachu'
    };
    
    const packName = setNameMap[setId];
    return allCards.filter(card => card.pack === packName);
  }, [allCards, setId]);

  // Get unique values for filters
  const filterOptions = useMemo(() => {
    if (!setCards.length) return { types: [], rarities: [] };
    
    const types = [...new Set(setCards.map(card => card.type).filter(Boolean))].sort();
    const rarities = [...new Set(setCards.map(card => card.rarity).filter(Boolean))].sort();
    
    return { types, rarities };
  }, [setCards]);

  // Filter and sort cards
  const filteredCards = useMemo(() => {
    let filtered = setCards.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || card.type === selectedType;
      const matchesRarity = !selectedRarity || card.rarity === selectedRarity;
      
      return matchesSearch && matchesType && matchesRarity;
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
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [setCards, searchTerm, selectedType, selectedRarity, sortBy]);

  // Get set theme
  const getSetTheme = (setId) => {
    const themes = {
      'mewtwo': {
        gradient: 'from-purple-600 via-pink-600 to-purple-800',
        emoji: '🔮',
        name: 'Genetic Apex: Mewtwo'
      },
      'charizard': {
        gradient: 'from-red-600 via-orange-600 to-red-800',
        emoji: '🔥',
        name: 'Genetic Apex: Charizard'
      },
      'pikachu': {
        gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
        emoji: '⚡',
        name: 'Genetic Apex: Pikachu'
      }
    };
    return themes[setId] || {
      gradient: 'from-blue-600 via-cyan-600 to-blue-800',
      emoji: '📦',
      name: 'Unknown Set'
    };
  };

  const theme = getSetTheme(setId);

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
      <>
        <Head>
          <title>Loading Set | Pokemon Pocket | DexTrends</title>
        </Head>
        <FullBleedWrapper gradient="pocket">
          <div className="min-h-screen flex items-center justify-center">
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
              <h3 className="text-2xl font-bold text-white mb-2">Loading Set...</h3>
              <p className="text-gray-300">Preparing card collection</p>
            </div>
          </div>
        </FullBleedWrapper>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Error | Pokemon Pocket | DexTrends</title>
        </Head>
        <FullBleedWrapper gradient="pocket">
          <div className="min-h-screen flex items-center justify-center">
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
        </FullBleedWrapper>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{theme.name} | Pokemon Pocket | DexTrends</title>
        <meta name="description" content={`Browse all cards from ${theme.name} in Pokemon Pocket`} />
      </Head>
      <FullBleedWrapper gradient="pocket" className="text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <StyledBackButton 
                variant="pocket" 
                text="Back to Packs"
                onClick={() => router.push('/pocketmode/expansions')}
                className="text-yellow-400 hover:text-yellow-300"
              />
              <div className="flex items-center gap-3">
                <div className="text-4xl animate-bounce">{theme.emoji}</div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                  {theme.name}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-sm font-medium">Total Cards: </span>
                <span className="text-yellow-400 font-bold">{setCards.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-sm font-medium">Showing: </span>
                <span className="text-yellow-400 font-bold">{filteredCards.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Set Description */}
        {setInfo && (
          <div className="bg-black/40 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/20">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                {setInfo.name}
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-6">
                {setInfo.description}
              </p>
              
              {/* Set Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`bg-gradient-to-r ${theme.gradient} bg-opacity-20 rounded-xl p-4 border border-white/10`}>
                  <div className="text-2xl font-bold text-white">{setCards.length}</div>
                  <div className="text-sm text-gray-300">Total Cards</div>
                </div>
                <div className={`bg-gradient-to-r ${theme.gradient} bg-opacity-20 rounded-xl p-4 border border-white/10`}>
                  <div className="text-2xl font-bold text-white">{filterOptions.types.length}</div>
                  <div className="text-sm text-gray-300">Types</div>
                </div>
                <div className={`bg-gradient-to-r ${theme.gradient} bg-opacity-20 rounded-xl p-4 border border-white/10`}>
                  <div className="text-2xl font-bold text-white">{filterOptions.rarities.length}</div>
                  <div className="text-sm text-gray-300">Rarities</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 mb-8 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex-1 py-2 px-3 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredCards.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-4">No cards found</h3>
            <p className="text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredCards.map((card) => (
              <Link key={card.id} href={`/pokedex/${card.id}`}>
                <div className="group bg-black/40 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:border-white/40 transition-all duration-200 hover:scale-105 hover:bg-black/60 cursor-pointer">
                  <div className="relative w-full aspect-[3/4] mb-3 overflow-hidden rounded-lg">
                    <Image
                      src={card.image || "/dextrendslogo.png"}
                      alt={card.name}
                      fill
                      className="object-contain transition-transform duration-200 group-hover:scale-110"
                      loading="lazy"
                      sizes="(max-width: 640px) 150px, (max-width: 768px) 120px, 100px"
                    />
                  </div>
                  
                  <div className="text-center">
                    <h4 className="font-medium text-sm text-white mb-2 line-clamp-2">{card.name}</h4>
                    
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCards.map((card) => (
              <Link key={card.id} href={`/pokedex/${card.id}`}>
                <div className="group bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-200 hover:bg-black/60 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-20 flex-shrink-0">
                      <Image
                        src={card.image || "/dextrendslogo.png"}
                        alt={card.name}
                        fill
                        className="object-contain rounded"
                        sizes="64px"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <h4 className="font-medium text-white text-lg mb-1">{card.name}</h4>
                      <div className="flex items-center gap-3 mb-2">
                        <TypeBadge type={card.type} size="sm" />
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getRarityColor(card.rarity)}`}>
                          {card.rarity}
                        </span>
                        {card.health && (
                          <span className="text-gray-300 text-sm">HP: {card.health}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </FullBleedWrapper>
    </>
  );
}

// Mark this page as fullBleed to remove default padding
SetView.fullBleed = true;