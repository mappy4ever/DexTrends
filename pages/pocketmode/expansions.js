import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations";
import { useTheme } from "../../context/themecontext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { InlineLoadingSpinner } from "../../components/ui/LoadingSpinner";
import { SetLoadingScreen } from "../../components/ui/UnifiedLoadingScreen";
import StyledBackButton from "../../components/ui/StyledBackButton";
import PocketCardList from "../../components/PocketCardList";
import BackToTop from "../../components/ui/BackToTop";
import { fetchPocketData } from "../../utils/pocketData";
import { FullBleedWrapper } from "../../components/ui/FullBleedWrapper";

export default function PocketExpansions() {
  const [allCards, setAllCards] = useState([]);
  const [expansions, setExpansions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedExpansionId, setSelectedExpansionId] = useState(null);
  const [selectedExpansion, setSelectedExpansion] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { theme } = useTheme();

  // Filter options
  const [filterSeries, setFilterSeries] = useState("");
  const [sortOption, setSortOption] = useState("releaseDate");
  const [sortDirection, setSortDirection] = useState("desc");

  useEffect(() => {
    async function fetchExpansions() {
      setLoading(true);
      setError(null);
      try {
        const cards = await fetchPocketData();
        setAllCards(cards || []);
        
        // Process cards into expansion structure
        const expansionData = processCardsIntoExpansions(cards || []);
        setExpansions(expansionData);
      } catch (err) {
        setError("Failed to load Pocket expansions. Please try again later.");
        setAllCards([]);
        setExpansions([]);
      }
      setLoading(false);
    }
    fetchExpansions();
  }, []);

  // Process cards into expansion structure similar to TCG Sets
  const processCardsIntoExpansions = (cards) => {
    if (!cards.length) return [];
    
    // Separate promo cards from main set cards
    const promoCards = cards.filter(card => {
      const packName = (card.pack || '').toLowerCase();
      return packName.includes('promo') || 
             packName.includes('promotional') || 
             packName.includes('special') ||
             packName.includes('shop') ||
             packName.includes('campaign') ||
             packName.includes('premium') ||
             packName.includes('wonder');
    });
    
    const mainSetCards = cards.filter(card => {
      const packName = (card.pack || '').toLowerCase();
      return !packName.includes('promo') && 
             !packName.includes('promotional') && 
             !packName.includes('special') &&
             !packName.includes('shop') &&
             !packName.includes('campaign') &&
             !packName.includes('premium') &&
             !packName.includes('wonder') &&
             packName !== 'unknown' &&
             packName !== '';
    });
    
    // Redistribute shared cards to individual packs based on type
    const redistributedCards = mainSetCards.map(card => {
      if (card.pack === 'Shared(Genetic Apex)') {
        const cardType = (card.type || '').toLowerCase();
        
        if (['grass', 'psychic', 'darkness', 'dark'].includes(cardType)) {
          return { ...card, pack: 'Mewtwo' };
        } else if (['lightning', 'electric'].includes(cardType)) {
          return { ...card, pack: 'Pikachu' };
        } else if (['water', 'fighting', 'fire'].includes(cardType)) {
          return { ...card, pack: 'Charizard' };
        } else {
          const hash = card.name.charCodeAt(0) % 3;
          const packs = ['Mewtwo', 'Pikachu', 'Charizard'];
          return { ...card, pack: packs[hash] };
        }
      }
      return card;
    });
    
    // Group cards by expansion series
    const seriesGroups = {
      'Genetic Apex': { 
        code: 'A1', 
        packs: ['Mewtwo', 'Charizard', 'Pikachu'], 
        releaseDate: '2024-10-30',
        description: 'The first expansion set for Pokémon TCG Pocket featuring legendary Pokémon.'
      },
      'Mythical Island': { 
        code: 'A1a', 
        packs: ['Mythical Island'], 
        releaseDate: '2024-11-01',
        description: 'Discover mystical Pokémon from the legendary Mythical Island.'
      },
      'Space-Time Smackdown': { 
        code: 'A2', 
        packs: ['Dialga', 'Palkia'], 
        releaseDate: '2024-12-01',
        description: 'Master time and space with the legendary powers of Dialga and Palkia.'
      },
      'Triumphant Light': { 
        code: 'A2a', 
        packs: ['Triumphant Light'], 
        releaseDate: '2024-12-15',
        description: 'Illuminate your path to victory with brilliant light-type Pokémon.'
      },
      'Shining Revelry': { 
        code: 'A2b', 
        packs: ['Shining Revelry'], 
        releaseDate: '2024-12-30',
        description: 'Experience the ultimate rivalry with shining rare Pokémon cards.'
      },
      'Celestial Guardians': { 
        code: 'A3', 
        packs: ['Solgaleo', 'Lunala'], 
        releaseDate: '2025-01-15',
        description: 'Harness the celestial powers of the sun and moon guardians.'
      },
      'Extradimensional Crisis': { 
        code: 'A3a', 
        packs: ['Extradimensional Crisis'], 
        releaseDate: '2025-02-01',
        description: 'Battle across dimensions with ultra-rare interdimensional Pokémon.'
      },
      'Eevee Grove': { 
        code: 'A4', 
        packs: ['Eevee Grove'], 
        releaseDate: '2025-03-01',
        description: 'Celebrate the evolution possibilities with Eevee and all its evolutions in this special grove expansion.'
      },
      'Promo-A': {
        code: 'PA',
        packs: [], // Promo cards don't have specific packs
        releaseDate: '2024-10-30',
        description: 'Exclusive promotional cards available through special events, campaigns, and shop purchases.',
        isPromo: true
      }
    };
    
    // Build expansion data
    const expansions = [];
    
    Object.entries(seriesGroups).forEach(([seriesName, seriesInfo]) => {
      let seriesCards;
      
      if (seriesInfo.isPromo) {
        // For promo sets, use the promo cards we filtered earlier
        seriesCards = promoCards;
      } else {
        // For regular sets, filter by pack names
        seriesCards = redistributedCards.filter(card => 
          seriesInfo.packs.includes(card.pack)
        );
      }
      
      // Skip minimum card check for Eevee Grove and Promo sets to ensure they're included
      if (seriesCards.length < 50 && seriesName !== 'Eevee Grove' && !seriesInfo.isPromo) return; // Only include series with significant card counts
      
      // Define expansion logos/images using real images from Bulbapedia
      const expansionImages = {
        'Genetic Apex': {
          logo: '/images/pocket-expansions/genetic-apex-logo.png',
          symbol: '/images/pocket-expansions/genetic-apex-symbol.png'
        },
        'Mythical Island': {
          logo: '/images/pocket-expansions/mythical-island-logo.png',
          symbol: '/images/pocket-expansions/mythical-island-symbol.png'
        },
        'Space-Time Smackdown': {
          logo: '/images/pocket-expansions/space-time-smackdown-logo.png',
          symbol: '/images/pocket-expansions/space-time-symbol.png'
        },
        'Triumphant Light': {
          logo: '/images/pocket-expansions/triumphant-light-logo.png',
          symbol: '/images/pocket-expansions/triumphant-light-symbol.png'
        },
        'Shining Revelry': {
          logo: '/images/pocket-expansions/shining-revelry-logo.png',
          symbol: '/images/pocket-expansions/shining-revelry-symbol.png'
        },
        'Celestial Guardians': {
          logo: '/images/pocket-expansions/celestial-guardians-logo.png',
          symbol: '/images/pocket-expansions/celestial-guardians-symbol.png'
        },
        'Extradimensional Crisis': {
          logo: '/images/pocket-expansions/extradimensional-crisis-logo.png',
          symbol: '/images/pocket-expansions/extradimensional-crisis-symbol.png'
        },
        'Eevee Grove': {
          logo: '/images/pocket-expansions/eevee-grove-logo.png',
          symbol: '/images/pocket-expansions/eevee-grove-symbol.png'
        },
        'Promo-A': {
          logo: '/images/pocket-expansions/promo-a-logo.png',
          symbol: '/images/pocket-expansions/promo-a-symbol.png'
        }
      };
      
      expansions.push({
        id: seriesName.toLowerCase().replace(/\s+/g, '-'),
        name: seriesName,
        images: expansionImages[seriesName] || {
          logo: 'https://images.pokemontcg.io/base1/logo.png',
          symbol: 'https://images.pokemontcg.io/base1/symbol.png'
        },
        code: seriesInfo.code,
        releaseDate: seriesInfo.releaseDate,
        description: seriesInfo.description,
        total: seriesCards.length,
        series: 'Pokémon TCG Pocket',
        cards: seriesCards
      });
    });
    
    return expansions;
  };

  // Helper functions for expansion metadata
  function getExpansionSymbol(name) {
    const symbols = {
      'Genetic Apex': '/images/PocketSymbols/genetic-apex.png',
      'Mythical Island': '/images/PocketSymbols/mythical-island.png',
      'Space-Time Smackdown': '/images/PocketSymbols/space-time-smackdown.png',
      'Triumphant Light': '/images/PocketSymbols/triumphant-light.png',
      'Shining Revelry': '/images/PocketSymbols/shining-revelry.png',
      'Celestial Guardians': '/images/PocketSymbols/celestial-guardians.png',
      'Extradimensional Crisis': '/images/PocketSymbols/extradimensional-crisis.png',
      'Eevee Grove': '/images/PocketSymbols/eevee-grove.png'
    };
    return symbols[name] || null;
  }

  function getExpansionLogo(name) {
    const logos = {
      'Genetic Apex': '/images/PocketLogos/genetic-apex-logo.png',
      'Mythical Island': '/images/PocketLogos/mythical-island-logo.png',
      'Space-Time Smackdown': '/images/PocketLogos/space-time-smackdown-logo.png',
      'Triumphant Light': '/images/PocketLogos/triumphant-light-logo.png',
      'Shining Revelry': '/images/PocketLogos/shining-revelry-logo.png',
      'Celestial Guardians': '/images/PocketLogos/celestial-guardians-logo.png',
      'Extradimensional Crisis': '/images/PocketLogos/extradimensional-crisis-logo.png',
      'Eevee Grove': '/images/PocketLogos/eevee-grove-logo.png'
    };
    return logos[name] || null;
  }

  // Extract unique series for filtering
  const uniqueSeries = useMemo(() => {
    const seriesSet = new Set();
    expansions.forEach(expansion => {
      if (expansion.series) {
        seriesSet.add(expansion.series);
      }
    });
    return Array.from(seriesSet).sort();
  }, [expansions]);

  // Filter expansions by search query and series
  const filteredExpansions = useMemo(() => {
    return expansions.filter((expansion) => {
      let matches = expansion.name.toLowerCase().includes(search.toLowerCase());
      
      if (filterSeries && expansion.series) {
        matches = matches && expansion.series === filterSeries;
      }
      
      return matches;
    });
  }, [expansions, search, filterSeries]);

  // Sort the filtered expansions
  const sortedExpansions = useMemo(() => {
    return [...filteredExpansions].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "releaseDate":
          comparison = new Date(a.releaseDate || "1970-01-01") - new Date(b.releaseDate || "1970-01-01");
          break;
        case "cardCount":
          comparison = (a.total || 0) - (b.total || 0);
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredExpansions, sortOption, sortDirection]);

  // Infinite scroll for expansions
  const { visibleItems: visibleExpansions, hasMore, isLoading: scrollLoading, sentinelRef } = useInfiniteScroll(
    sortedExpansions, 
    12, // Initial visible count
    6   // Load 6 more at a time
  );

  // Handle expansion click to show cards
  const handleExpansionClick = (expansion) => {
    setSelectedExpansion(expansion);
  };

  // If showing cards for a specific expansion, render the card list
  if (selectedExpansion) {
    return (
      <>
        <Head>
          <title>{selectedExpansion.name} Cards | Pokémon Pocket | DexTrends</title>
          <meta name="description" content={`Browse all cards from ${selectedExpansion.name} expansion in Pokémon TCG Pocket.`} />
        </Head>
        <FullBleedWrapper gradient="pocket">
          <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto animate-fadeIn pt-8">
          
          <FadeIn>
            <div className="mb-8">
              <StyledBackButton 
                variant="pocket" 
                text="Back to Expansions" 
                onClick={() => setSelectedExpansion(null)} 
                className="mb-4"
              />
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
                  {selectedExpansion.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">{selectedExpansion.description}</p>
              </div>
            </div>
            
            <PocketCardList 
              cards={selectedExpansion.cards}
              loading={false}
              error={null}
              emptyMessage={`No cards found in ${selectedExpansion.name}.`}
              showPack={true}
              showRarity={true}
              showHP={true}
              imageWidth={110}
              imageHeight={154}
            />
          </FadeIn>
          </div>
        </FullBleedWrapper>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Pokémon Pocket Expansions | DexTrends</title>
        <meta name="description" content="Browse Pokémon TCG Pocket expansion sets and discover cards from each collection." />
      </Head>
      <FullBleedWrapper gradient="pocket">
        <div className="section-spacing-y-default max-w-7xl mx-auto animate-fadeIn pt-8">
        
        <FadeIn>
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <StyledBackButton 
                variant="pocket" 
                text="Back to Pocket Mode" 
                onClick={() => router.push('/pocketmode')} 
                className="mx-auto mb-6"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Pocket Expansions
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover exclusive Pokémon TCG Pocket expansion sets and their unique cards
            </p>
          </div>
          
          {/* Search and Filters Card */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/30 mb-8">
            {/* Search and Filters */}
            <div className="flex flex-col gap-6">
              {/* Search Bar */}
              <div className="relative">
                <input
                  id="searchInput"
                  type="text"
                  className="w-full pr-6 py-4 pl-12 bg-gray-50 border border-gray-200 rounded-full text-lg focus:outline-none focus:border-orange-400 focus:bg-white transition-all duration-300"
                  placeholder="Search for an expansion (e.g., Genetic Apex, Mythical Island)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-6 w-6 text-gray-400 dark:text-gray-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-end">
            
                <div className="flex-1">
                  <label htmlFor="seriesFilter" className="block text-sm font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">Filter by Series</label>
                  <div className="relative">
                    <select
                      id="seriesFilter"
                      className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full appearance-none cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300 text-sm"
                      value={filterSeries}
                      onChange={(e) => setFilterSeries(e.target.value)}
                    >
                      <option value="">All Series</option>
                      {uniqueSeries.map(series => (
                        <option key={series} value={series}>{series}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
            
                <div className="flex-1">
                  <label htmlFor="sortOption" className="block text-sm font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">Sort By</label>
                  <div className="relative">
                    <select
                      id="sortOption"
                      className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full appearance-none cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300 text-sm"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="releaseDate">Release Date</option>
                      <option value="name">Name</option>
                      <option value="cardCount">Card Count</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
            
                <div className="flex-1">
                  <label htmlFor="sortDirection" className="block text-sm font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">Order</label>
                  <div className="relative">
                    <select
                      id="sortDirection"
                      className="w-full px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full appearance-none cursor-pointer hover:border-orange-300 dark:hover:border-orange-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-300 text-gray-700 dark:text-gray-300 text-sm"
                      value={sortDirection}
                      onChange={(e) => setSortDirection(e.target.value)}
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
            
                <button 
                  className="px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-gray-200 font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
                  onClick={() => {
                    setSearch("");
                    setFilterSeries("");
                    setSortOption("releaseDate");
                    setSortDirection("desc");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      
      {loading ? (
        <SetLoadingScreen 
          message="Loading Pocket expansions..."
          preventFlash={true}
        />
        ) : error ? (
          <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-3xl p-8 text-center shadow-lg">
            <h2 className="text-2xl font-bold text-red-600">Error</h2>
            <p className="text-red-600 mt-2">{error}</p>
          </div>
        ) : (
          <StaggeredChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleExpansions.map((expansion) => (
              <CardHover
                key={expansion.id}
                className="animate-fadeIn group"
                onClick={() => handleExpansionClick(expansion)}
              >
                <div 
                  className={`relative flex flex-col h-full rounded-3xl overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border cursor-pointer transition-all duration-300 ${
                    selectedExpansionId === expansion.id 
                      ? 'border-orange-500 dark:border-orange-400 shadow-2xl scale-105' 
                      : 'border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl hover:border-orange-300 dark:hover:border-orange-400'
                  }`}
                >
                  {/* Expansion Image Background */}
                  {expansion.images?.logo && (
                    <div className={`relative h-40 w-full flex items-center justify-center p-4 overflow-hidden transition-all duration-300 ${
                      expansion.name === 'Promo-A' 
                        ? 'bg-gradient-to-br from-yellow-200 via-amber-100 to-orange-100 dark:from-yellow-500/60 dark:via-amber-500/60 dark:to-orange-500/60 group-hover:from-yellow-300 group-hover:via-amber-200 group-hover:to-orange-200 dark:group-hover:from-yellow-400/70 dark:group-hover:via-amber-400/70 dark:group-hover:to-orange-400/70' 
                        : 'bg-gradient-to-br from-orange-200 via-yellow-100 to-amber-100 dark:from-orange-500/60 dark:via-yellow-500/60 dark:to-amber-500/60 group-hover:from-orange-300 group-hover:via-yellow-200 group-hover:to-amber-200 dark:group-hover:from-orange-400/70 dark:group-hover:via-yellow-400/70 dark:group-hover:to-amber-400/70'
                    }`}>
                      {/* Expansion Code Pill */}
                      <div className="absolute top-3 right-3 z-20">
                        <div className="bg-black text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                          {expansion.code}
                        </div>
                      </div>
                      
                      <img
                        src={expansion.images.logo}
                        alt={expansion.name}
                        className="max-h-24 max-w-[85%] object-contain z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                        draggable="false"
                      />
                    </div>
                  )}
                
                  {/* Expansion Info */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="font-bold text-xl text-gray-800 dark:text-gray-100 mb-1">{expansion.name}</h2>
                    
                    {expansion.series && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">{expansion.series}</p>
                    )}
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                      {expansion.description}
                    </p>
                    
                    <div className="mt-auto space-y-3 mb-6">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-800/30 dark:to-emerald-800/30 rounded-2xl p-3 border border-green-200/50 dark:border-green-700/50">
                        <p className="text-xs text-green-700 dark:text-green-300 font-medium">Released</p>
                        <p className="font-bold text-green-900 dark:text-green-100">{expansion.releaseDate || "Unknown"}</p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-800/30 dark:to-indigo-800/30 rounded-2xl p-3 border border-blue-200/50 dark:border-blue-700/50">
                        <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Total Cards</p>
                        <p className="font-bold text-blue-900 dark:text-blue-100">{expansion.total || "?"}</p>
                      </div>
                    </div>
                    
                    {/* View Cards Button */}
                    <button 
                      className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-full transition-all duration-300 transform group-hover:scale-105 shadow-md"
                    >
                      View Cards
                    </button>
                  </div>
                </div>
              </CardHover>
            ))}
          </StaggeredChildren>
        )}

        {/* Infinite scroll loading indicator */}
        {hasMore && (
          <div ref={sentinelRef} className="h-4 w-full flex items-center justify-center mt-12">
            {scrollLoading && (
              <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
                <InlineLoadingSpinner 
                  text="Loading more expansions..." 
                />
              </div>
            )}
          </div>
        )}

        {/* Show scroll hint */}
        {!loading && !error && hasMore && (
          <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
            <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm rounded-full px-6 py-3 shadow-md">
              <span className="text-sm font-medium">Showing {visibleExpansions.length} of {sortedExpansions.length} expansions</span>
            </div>
            <div className="text-xs text-orange-600 mt-2 font-medium">
              Scroll down to load more...
            </div>
          </div>
        )}

        {!loading && !scrollLoading && !hasMore && sortedExpansions.length > 0 && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full px-6 py-3">
              <span className="text-sm font-semibold text-orange-700">All {sortedExpansions.length} expansions loaded</span>
            </div>
          </div>
        )}
      
        {!loading && !error && sortedExpansions.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-orange-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h9a2 2 0 002-2V6a2 2 0 00-2-2h-1.064M12 20v-2m0 0c-2.761 0-5-2.239-5-5a5 5 0 0110 0c0 2.761-2.239 5-5 5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">No Expansions Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filters</p>
              <button 
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={() => {
                  setSearch("");
                  setFilterSeries("");
                  setSortOption("releaseDate");
                  setSortDirection("desc");
                }}
              >
                Show All Expansions
              </button>
            </div>
          </div>
        )}
        
        {/* Back to Top Button */}
        <BackToTop />
        </div>
      </FullBleedWrapper>
    </>
  );
}

// Mark this page as fullBleed to remove default padding
PocketExpansions.fullBleed = true;