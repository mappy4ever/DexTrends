import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import pokemon from "pokemontcgsdk";
import Modal from "../../components/ui/modals/Modal";
import CardList from "../../components/CardList";
import { FadeIn, SlideUp } from "../../components/ui/animations";
import PriceHistoryChart from "../../components/ui/PriceHistoryChart"; // Updated path
import { useTheme } from "../../context/UnifiedAppContext";
import { useFavorites } from "../../context/UnifiedAppContext";
import { useViewSettings } from "../../context/UnifiedAppContext";
import { SetLoadingScreen } from "../../components/ui/UnifiedLoadingScreen";
import logger from "../../utils/logger";
import { FullBleedWrapper } from "../../components/ui/FullBleedWrapper";

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;

// Configure SDK only if key is available, but don't throw error
if (pokemonKey) {
  pokemon.configure({ apiKey: pokemonKey });
}

export default function SetIdPage() {
  const router = useRouter();
  const { setid } = router.query; // Changed to setid
  const { theme } = useTheme();
  const { toggleCardFavorite, isCardFavorite } = useFavorites();
  const { viewSettings } = useViewSettings();
  
  // Create refs for scrolling
  const cardsGridRef = React.useRef(null);
  
  // State variables
  const [setInfo, setSetInfo] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  
  // Filter states
  const [filterRarity, setFilterRarity] = useState("");
  const [filterSubtype, setFilterSubtype] = useState("");
  const [filterSupertype, setFilterSupertype] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Set statistics
  const [statistics, setStatistics] = useState({
    rarityDistribution: {},
    valueByRarity: {},
    highestValueCards: []
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCard, setModalCard] = useState(null);

  // Fetch set information and cards
  useEffect(() => {
    if (!setid) return; // Changed to setid

    setLoading(true);
    setError(null);
    
    Promise.all([
      pokemon.set.find(setid).catch(err => { // Changed to setid
        logger.error("Error fetching set info:", { error: err });
        setError("Failed to load set information");
        return null;
      }),
      
      pokemon.card.where({ q: `set.id:${setid}` }).catch(err => { // Changed to setid
        logger.error("Error fetching cards:", { error: err });
        setError("Failed to load cards for this set");
        return { data: [] };
      })
    ])
    .then(([setData, cardsData]) => {
      if (setData) setSetInfo(setData);
      if (cardsData?.data) {
        setCards(cardsData.data);
        calculateSetStatistics(cardsData.data);
      }
      setLoading(false);
    });
  }, [setid]); // Changed to setid

  // Calculate set statistics when cards are loaded
  const calculateSetStatistics = (cardsData) => {
    try {
      if (!cardsData || cardsData.length === 0) return;
      
      // Rarity distribution
      const rarityCount = {};
      const rarityValue = {};
      const valuedCards = [];
      
      cardsData.forEach(card => {
        // Count rarities
        if (card.rarity) {
          rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
        }
        
        // Calculate value by rarity
        if (card.tcgplayer?.prices) {
          const price = getPrice(card);
          if (price && price > 0) {
            if (!rarityValue[card.rarity]) rarityValue[card.rarity] = [];
            rarityValue[card.rarity].push(price);
            
            valuedCards.push({
              id: card.id,
              name: card.name,
              number: card.number,
              rarity: card.rarity,
              price: price,
              image: card.images?.small
            });
          }
        }
      });
      
      // Calculate average value per rarity
      const avgRarityValue = {};
      Object.keys(rarityValue).forEach(rarity => {
        const prices = rarityValue[rarity];
        avgRarityValue[rarity] = parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2));
      });
      
      // Sort highest value cards
      const topCards = valuedCards.sort((a, b) => b.price - a.price).slice(0, 5);
      
      setStatistics({
        rarityDistribution: rarityCount,
        valueByRarity: avgRarityValue,
        highestValueCards: topCards
      });
    } catch (err) {
      logger.error("Error calculating statistics:", { error: err });
    }
  };

  // Extract unique rarities, subtypes, and supertypes for filtering
  const filterOptions = useMemo(() => {
    const rarities = new Set();
    const subtypes = new Set();
    const supertypes = new Set();
    
    cards.forEach(card => {
      if (card.rarity) rarities.add(card.rarity);
      if (card.subtypes) card.subtypes.forEach(subtype => subtypes.add(subtype));
      if (card.supertype) supertypes.add(card.supertype);
    });
    
    return {
      rarities: Array.from(rarities).sort(),
      subtypes: Array.from(subtypes).sort(),
      supertypes: Array.from(supertypes).sort()
    };
  }, [cards]);

  // Filter cards based on criteria
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      let matches = true;
      
      // Filter by rarity
      if (filterRarity && card.rarity) {
        matches = matches && card.rarity === filterRarity;
      }
      
      // Filter by subtype
      if (filterSubtype && card.subtypes) {
        matches = matches && card.subtypes.includes(filterSubtype);
      }
      
      // Filter by supertype
      if (filterSupertype && card.supertype) {
        matches = matches && card.supertype === filterSupertype;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        matches = matches && (
          card.name.toLowerCase().includes(query) || 
          (card.id && card.id.toLowerCase().includes(query)) ||
          (card.number && card.number.includes(query))
        );
      }
      
      return matches;
    });
  }, [cards, filterRarity, filterSubtype, filterSupertype, searchQuery]);

  // Helper function to get price from a card
  function getPrice(card) {
    // Check all possible price fields
    let price = null;
    
    if (card.tcgplayer?.prices) {
      const prices = card.tcgplayer.prices;
      price = prices.holofoil?.market || 
              prices.normal?.market || 
              prices.reverseHolofoil?.market || 
              prices.firstEditionHolofoil?.market ||
              prices.unlimitedHolofoil?.market;
    }
    
    return price || 0;
  }

  // Open card detail modal
  function openModal(card) {
    setModalCard(card);
    setModalOpen(true);
    setSelectedCardId(card.id);
  }

  // Close card detail modal
  function closeModal() {
    setModalOpen(false);
    setModalCard(null);
  }

  // Toggle favorite status for a card
  function handleToggleFavorite(card) {
    toggleCardFavorite(card);
  }

  // Helper function for rarity ranking
  function getRarityRank(card) {
    const rarityOrder = {
      "Common": 1,
      "Uncommon": 2,
      "Rare": 3,
      "Rare Holo": 4,
      "Rare Ultra": 5,
      "Rare Secret": 6,
      "Rare Holo GX": 7,
      "Rare Rainbow": 8,
      "Rare Prism Star": 9,
      "Rare Full Art": 10,
      "Rare Holo EX": 11,
      "Rare Holo V": 12,
      "Rare Holo VMAX": 13,
      "Amazing Rare": 14,
      "Ultra Rare": 15,
      "Secret Rare": 16,
      "Hyper Rare": 17,
    };
    return rarityOrder[card.rarity] || 0;
  }

  // Function to handle filtering by rarity and scroll to cards section
  function handleFilterByRarity(rarity) {
    setFilterRarity(rarity);
    
    // Scroll to cards grid after a short delay to ensure filter is applied
    setTimeout(() => {
      if (cardsGridRef.current) {
        cardsGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Clear all filters
  function clearFilters() {
    setFilterRarity("");
    setFilterSubtype("");
    setFilterSupertype("");
    setSearchQuery("");
  }

  // Loading state
  if (loading) {
    return (
      <SetLoadingScreen 
        message="Loading set information..."
        preventFlash={true}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container section-spacing-y-default max-w-6xl mx-auto px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-600">Error</h2>
          <p className="text-red-600 mt-2">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            onClick={() => router.push('/tcgsets')}
          >
            Back to Sets
          </button>
        </div>
      </div>
    );
  }

  return (
    <FullBleedWrapper gradient="tcg">
      <div className="section-spacing-y-default max-w-7xl mx-auto animate-fadeIn pt-8">
        {/* Set Header */}
        <FadeIn>
          {/* Back to Sets Button */}
          <div className="mb-6">
            <Link href="/tcgsets" className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 group">
              <svg className="w-5 h-5 text-purple-600 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-semibold text-gray-700">Back to Sets</span>
            </Link>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/30 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Set Logo */}
              <div className="flex-shrink-0">
                {setInfo?.images?.logo ? (
                  <div className="relative bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50 rounded-3xl p-8 shadow-lg">
                    <img
                      src={setInfo.images.logo}
                      alt={setInfo.name}
                      className="h-32 max-w-xs object-contain drop-shadow-lg"
                    />
                  </div>
                ) : (
                  <div className="h-32 w-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center">
                    <span className="text-gray-500 font-medium">{setInfo?.name || 'Loading...'}</span>
                  </div>
                )}
              </div>
            
              {/* Set Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  {setInfo?.name}
                </h1>
                <p className="text-lg text-gray-600 font-medium mb-6">{setInfo?.series}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Released</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{setInfo?.releaseDate || 'Unknown'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Cards</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{setInfo?.total || 'Unknown'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-900/20 dark:to-orange-900/20 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Printed Total</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{setInfo?.printedTotal || 'Unknown'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Cards Found</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{cards.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

      {/* Set Statistics */}
      <SlideUp delay={200}>
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/30 mb-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Set Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rarity Distribution */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Rarity Distribution</h3>
              <div className="space-y-2">
                {Object.keys(statistics.rarityDistribution).map(rarity => (
                  <div 
                    key={rarity} 
                    className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                      filterRarity === rarity 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400'
                        : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border border-transparent'
                    }`}
                    onClick={() => handleFilterByRarity(rarity)}
                    title={`Filter by ${rarity} cards`}
                  >
                    <div className="flex items-center">
                      <svg 
                        className={`w-4 h-4 mr-1.5 ${filterRarity === rarity ? 'text-blue-500 opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      <span className="font-medium">{rarity}</span>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                      filterRarity === rarity
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                    }`}>
                      {statistics.rarityDistribution[rarity]} cards
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Top Value Cards */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Highest Value Cards</h3>
              {statistics.highestValueCards.length > 0 ? (
                <div className="space-y-3">
                  {statistics.highestValueCards.map(card => (
                    <Link key={card.id}
                            href={`/cards/${card.id}`}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 cursor-pointer transition-all duration-300 w-full text-left block hover:shadow-md transform hover:scale-[1.02]"
                    >
                      {card.image && (
                        <img 
                          src={card.image} 
                          alt={card.name}
                          className="w-12 h-16 object-contain rounded-lg shadow-sm"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{card.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{card.rarity} · #{card.number}</p>
                      </div>
                      <div className="font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">${card.price.toFixed(2)}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No pricing data available</p>
              )}
            </div>
          </div>
        </div>
      </SlideUp>

      {/* Card Filtering */}
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-white/30 mb-8"
           style={{ position: 'relative', zIndex: 1 }}>
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Browse Cards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label htmlFor="cardSearch" className="block text-sm font-medium mb-1">Search Cards</label>
            <div className="relative">
              <input
                id="cardSearch"
                type="text"
                placeholder="Search cards by name or number..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-base focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Rarity Filter */}
          <div>
            <label htmlFor="rarityFilter" className="block text-sm font-medium mb-1">Rarity</label>
            <div className="relative">
              <select
                id="rarityFilter"
                className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-full appearance-none cursor-pointer hover:border-purple-300 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300 text-gray-700 text-sm"
                value={filterRarity}
                onChange={(e) => handleFilterByRarity(e.target.value)}
              >
                <option value="">All Rarities</option>
                {filterOptions.rarities.map(rarity => (
                  <option key={rarity} value={rarity}>{rarity}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Subtype Filter */}
          <div>
            <label htmlFor="subtypeFilter" className="block text-sm font-medium mb-1">Subtype</label>
            <div className="relative">
              <select
                id="subtypeFilter"
                className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-200 rounded-full appearance-none cursor-pointer hover:border-purple-300 focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300 text-gray-700 text-sm"
                value={filterSubtype}
                onChange={(e) => setFilterSubtype(e.target.value)}
              >
                <option value="">All Subtypes</option>
                {filterOptions.subtypes.map(subtype => (
                  <option key={subtype} value={subtype}>{subtype}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Clear Filters */}
          <div>
            <label className="block text-sm font-medium mb-1">&nbsp;</label>
            <button
              className="w-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 text-gray-700 dark:text-gray-200 font-semibold py-2.5 px-6 rounded-full transition-all duration-300 transform hover:scale-105 shadow-md h-[42px]"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Card Grid */}
      <div ref={cardsGridRef}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
          <div>
            <h2 className="text-2xl font-bold flex items-center flex-wrap">
              Cards 
              <span className="text-gray-500 text-lg ml-2">
                {filteredCards.length === cards.length 
                  ? `(${cards.length})` 
                  : `(${filteredCards.length} of ${cards.length})`
                }
              </span>
            </h2>
            {filterRarity && (
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">Filtered by: </span>
                <span className="ml-2 font-semibold text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full">
                  {filterRarity}
                </span>
                <button 
                  onClick={() => setFilterRarity("")}
                  className="ml-2 text-gray-500 hover:text-red-600 transition-colors duration-200"
                  aria-label="Clear rarity filter"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <Link href="/tcgsets" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg hover:bg-white transition-all duration-300 group">
            <svg className="w-4 h-4 text-purple-600 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-semibold text-gray-700">Back to Sets</span>
          </Link>
        </div>
        
        <div style={{ position: 'relative', zIndex: 0 }}>
          <CardList
            cards={filteredCards}
            loading={loading}
            error={error}
            initialSortOption="number"
            onCardClick={openModal}
            getPrice={getPrice}
            getReleaseDate={(card) => card.set?.releaseDate || "0000-00-00"}
            getRarityRank={getRarityRank}
          />
        </div>
        
        {filteredCards.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="h-10 w-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h9a2 2 0 002-2V6a2 2 0 00-2-2h-1.064M12 20v-2m0 0c-2.761 0-5-2.239-5-5a5 5 0 0110 0c0 2.761-2.239 5-5 5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Cards Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <button 
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Card Detail Modal */}
      {modalOpen && modalCard && (
        <Modal onClose={closeModal}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 max-w-4xl mx-auto">
            <div className="relative group">
              <img
                src={modalCard.images.large}
                alt={modalCard.name}
                className="max-w-[85vw] md:max-w-[360px] max-h-[70vh] object-contain rounded-lg shadow-lg transform transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-xl"
              />
              <div className="absolute top-2 right-2">
                <button 
                  className={`p-2 rounded-full transition-all duration-300 shadow-sm ${
                    isCardFavorite(modalCard.id) 
                      ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                      : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                  onClick={() => handleToggleFavorite(modalCard)}
                  aria-label={isCardFavorite(modalCard.id) ? "Remove from favorites" : "Add to favorites"}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={isCardFavorite(modalCard.id) ? "currentColor" : "none"}
                    stroke="currentColor" 
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isCardFavorite(modalCard.id) ? 0 : 2} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{modalCard.name}</h3>
              </div>
              
              <div className="mt-6 space-y-3 bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Number</span>
                  <span className="font-semibold">{modalCard.number}/{setInfo?.printedTotal || "?"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Rarity</span>
                  <span className="font-semibold">{modalCard.rarity || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-300">Type</span>
                  <span>
                    {modalCard.types?.join(', ') || 
                     (modalCard.supertype === 'Trainer' ? 'Trainer' : 
                      modalCard.supertype === 'Energy' ? 'Energy' : 'N/A')}
                  </span>
                </div>
                {modalCard.artist && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">Artist</span>
                    <span>{modalCard.artist}</span>
                  </div>
                )}
                
                {/* Card attributes based on card type */}
                {modalCard.hp && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">HP</span>
                    <span>{modalCard.hp}</span>
                  </div>
                )}
                
                {/* Card Rules Text */}
                {modalCard.rules && modalCard.rules.length > 0 && (
                  <div className="py-2 border-b">
                    <span className="font-medium block mb-1">Rules</span>
                    {modalCard.rules.map((rule, index) => (
                      <p key={index} className="text-gray-600 italic text-sm">{rule}</p>
                    ))}
                  </div>
                )}
                
                {/* Pricing Information */}
                <div className="mt-6">
                  <h4 className="font-bold text-lg mb-2">Market Prices</h4>
                  {modalCard.tcgplayer?.prices ? (
                    <div className="space-y-2">
                      {modalCard.tcgplayer.prices.normal?.market && (
                        <div className="flex justify-between py-2 bg-gray-50 px-3 rounded">
                          <span>Normal</span>
                          <span className="font-bold">${modalCard.tcgplayer.prices.normal.market.toFixed(2)}</span>
                        </div>
                      )}
                      {modalCard.tcgplayer.prices.holofoil?.market && (
                        <div className="flex justify-between py-2 bg-blue-50 px-3 rounded">
                          <span>Holofoil</span>
                          <span className="font-bold">${modalCard.tcgplayer.prices.holofoil.market.toFixed(2)}</span>
                        </div>
                      )}
                      {modalCard.tcgplayer.prices.reverseHolofoil?.market && (
                        <div className="flex justify-between py-2 bg-purple-50 px-3 rounded">
                          <span>Reverse Holofoil</span>
                          <span className="font-bold">${modalCard.tcgplayer.prices.reverseHolofoil.market.toFixed(2)}</span>
                        </div>
                      )}
                      {modalCard.tcgplayer.prices.firstEditionHolofoil?.market && (
                        <div className="flex justify-between py-2 bg-yellow-50 px-3 rounded">
                          <span>1st Edition Holofoil</span>
                          <span className="font-bold">${modalCard.tcgplayer.prices.firstEditionHolofoil.market.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No pricing data available</p>
                  )}
                </div>
                
                {/* TCGPlayer Link */}
                {modalCard.tcgplayer?.url && (
                  <a 
                    href={modalCard.tcgplayer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View on TCGPlayer
                  </a>
                )}
              </div>
              
              {/* Price History Chart */}
              <div className="mt-8">
                <h4 className="font-bold text-lg mb-4">Price History</h4>
                <PriceHistoryChart 
                  cardId={modalCard.id} 
                  initialPrice={getPrice(modalCard)} 
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </FullBleedWrapper>
  );
}

// Mark this page as fullBleed to remove default padding
SetIdPage.fullBleed = true;