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
    
    // Filter out promo cards and redistribute shared cards to individual packs
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
      }
    };
    
    // Build expansion data
    const expansions = [];
    
    Object.entries(seriesGroups).forEach(([seriesName, seriesInfo]) => {
      const seriesCards = redistributedCards.filter(card => 
        seriesInfo.packs.includes(card.pack)
      );
      
      if (seriesCards.length < 50) return; // Only include series with significant card counts
      
      expansions.push({
        id: seriesName.toLowerCase().replace(/\s+/g, '-'),
        name: seriesName,
        code: seriesInfo.code,
        releaseDate: seriesInfo.releaseDate,
        description: seriesInfo.description,
        total: seriesCards.length,
        series: 'Pokémon TCG Pocket',
        cards: seriesCards,
        images: {
          symbol: getExpansionSymbol(seriesName),
          logo: getExpansionLogo(seriesName)
        }
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
      'Extradimensional Crisis': '/images/PocketSymbols/extradimensional-crisis.png'
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
      'Extradimensional Crisis': '/images/PocketLogos/extradimensional-crisis-logo.png'
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
      <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
        <Head>
          <title>{selectedExpansion.name} Cards | Pokémon Pocket | DexTrends</title>
          <meta name="description" content={`Browse all cards from ${selectedExpansion.name} expansion in Pokémon TCG Pocket.`} />
        </Head>
        
        <FadeIn>
          <div className="mb-6 flex items-center gap-4">
            <StyledBackButton 
              variant="pocket" 
              text="Back to Expansions" 
              onClick={() => setSelectedExpansion(null)} 
            />
            <div>
              <h1 className="text-3xl font-bold">{selectedExpansion.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{selectedExpansion.description}</p>
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
          />
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <Head>
        <title>Pokémon Pocket Expansions | DexTrends</title>
        <meta name="description" content="Browse Pokémon TCG Pocket expansion sets and discover cards from each collection." />
      </Head>
      
      <FadeIn>
        <div className="mb-6">
          <StyledBackButton variant="pocket" text="Back to Pocket Mode" onClick={() => router.push('/pocketmode')} />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-8">Pokémon Pocket Expansions</h1>
        
        <div className={`p-6 rounded-xl shadow-md mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="searchInput" className="block text-sm font-medium mb-1">Search Expansions</label>
              <div className="relative">
                <input
                  id="searchInput"
                  type="text"
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Search for an expansion (e.g., Genetic Apex, Mythical Island)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="seriesFilter" className="block text-sm font-medium mb-1">Filter by Series</label>
              <select
                id="seriesFilter"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={filterSeries}
                onChange={(e) => setFilterSeries(e.target.value)}
              >
                <option value="">All Series</option>
                {uniqueSeries.map(series => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="sortOption" className="block text-sm font-medium mb-1">Sort By</label>
              <select
                id="sortOption"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="releaseDate">Release Date</option>
                <option value="name">Name</option>
                <option value="cardCount">Card Count</option>
              </select>
            </div>
            
            <div className="w-full md:w-48">
              <label htmlFor="sortDirection" className="block text-sm font-medium mb-1">Order</label>
              <select
                id="sortDirection"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
            
            <button 
              className="w-full md:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
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
      </FadeIn>
      
      {loading ? (
        <SetLoadingScreen 
          message="Loading Pocket expansions..."
          preventFlash={true}
        />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      ) : (
        <StaggeredChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {visibleExpansions.map((expansion) => (
            <CardHover
              key={expansion.id}
              className="animate-fadeIn"
              onClick={() => handleExpansionClick(expansion)}
            >
              <div 
                className={`relative flex flex-col h-full rounded-xl overflow-hidden shadow-md border cursor-pointer ${
                  selectedExpansionId === expansion.id 
                    ? 'border-purple-500 ring-2 ring-purple-500' 
                    : theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                }`}
              >
                {/* Expansion Image Background */}
                {expansion.images?.logo && (
                  <div className="relative h-32 w-full bg-gradient-to-b from-purple-100 to-purple-200 flex items-center justify-center p-4 overflow-hidden">
                    {expansion.images.symbol && (
                      <div className="absolute opacity-10 w-full h-full flex items-center justify-center">
                        <img
                          src={expansion.images.symbol}
                          alt=""
                          className="w-32 h-32 object-contain"
                        />
                      </div>
                    )}
                    <img
                      src={expansion.images.logo}
                      alt={expansion.name}
                      className="max-h-20 max-w-[80%] object-contain z-10"
                      draggable="false"
                    />
                  </div>
                )}
                
                {/* Expansion Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="font-bold text-lg">{expansion.name}</h2>
                  
                  {expansion.series && (
                    <p className="text-sm text-gray-500 mb-2">{expansion.series}</p>
                  )}
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {expansion.description}
                  </p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Released</p>
                      <p className="font-medium">{expansion.releaseDate || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Cards</p>
                      <p className="font-medium">{expansion.total || "?"}</p>
                    </div>
                  </div>
                  
                  {/* View Cards Button */}
                  <div className="mt-4">
                    <button 
                      className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors text-sm"
                    >
                      View Cards
                    </button>
                  </div>
                </div>
              </div>
            </CardHover>
          ))}
        </StaggeredChildren>
      )}

      {/* Infinite scroll loading indicator */}
      {hasMore && (
        <div ref={sentinelRef} className="h-4 w-full flex items-center justify-center">
          {scrollLoading && (
            <InlineLoadingSpinner 
              text="Loading more expansions..." 
              className="mt-8"
            />
          )}
        </div>
      )}

      {/* Show scroll hint */}
      {!loading && !error && hasMore && (
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {visibleExpansions.length} of {sortedExpansions.length} expansions
          <div className="text-xs text-primary mt-1">
            Scroll down to load more...
          </div>
        </div>
      )}

      {!loading && !scrollLoading && !hasMore && sortedExpansions.length > 0 && (
        <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          All {sortedExpansions.length} expansions loaded
        </div>
      )}
      
      {!loading && !error && sortedExpansions.length === 0 && (
        <div className="text-center py-16">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h9a2 2 0 002-2V6a2 2 0 00-2-2h-1.064M12 20v-2m0 0c-2.761 0-5-2.239-5-5a5 5 0 0110 0c0 2.761-2.239 5-5 5z" />
          </svg>
          <h3 className="text-xl font-bold mt-4">No Expansions Found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
          <button 
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors"
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
      )}
      
      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}