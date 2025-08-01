import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Head from "next/head";
// Import pokemontcgsdk dynamically to reduce initial bundle size
import Modal from "../components/ui/modals/Modal";
import CardListComponent from "../components/CardList";
import Image from 'next/image';
import { getPrice, getRarityRank } from "../utils/pokemonutils";
import { CircularButton } from "../components/ui/design-system";
// Use centralized icon imports for better tree-shaking
import { 
  Book, Search, Globe, Trophy, Heart, 
  CardList, Grid, GraphUp,
  CardPickup, PokerHand, CrossedSwords,
  ShoppingBag, TrendingUp,
  Bulb 
} from "../utils/icons";
import { DynamicAdvancedSearchModal, DynamicMarketAnalytics, preloadCriticalComponents } from "../components/dynamic/DynamicComponents";
import dynamic from 'next/dynamic';
import { toggleFeature, isFeatureEnabled } from "../utils/featureFlags";
import FullBleedWrapper from "../components/ui/FullBleedWrapper";
import { NextPage } from 'next';
import { TCGCard } from '../types/api/cards';

// Safe dynamic imports for enhanced components
const VisualSearchFilters = dynamic(() => import('../components/ui/forms/VisualSearchFilters'), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading visual filters...</div>
});

const CardComparisonTool = dynamic(() => import('../components/ui/cards/CardComparisonTool'), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading comparison tool...</div>
});

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;

function getRarityGlow(rarity?: string): string {
  if (!rarity) return "";
  const rare = rarity.toLowerCase();
  if (rare.includes("ultra") || rare.includes("secret")) return "shadow-glow-ultra";
  if (rare.includes("rare")) return "shadow-glow-rare";
  if (rare.includes("holo")) return "shadow-glow-holo";
  return "";
}

const renderEvolutionLine = (card: TCGCard) => (
  <div className="mt-2 flex flex-wrap gap-2 text-xs">
    {card.evolvesFrom && (
      <span>
        <b className="text-foreground-muted">Evolves From:</b>{" "}
        <span className="font-medium">{card.evolvesFrom}</span>
      </span>
    )}
    {card.evolvesTo && card.evolvesTo.length > 0 && (
      <span>
        <b className="text-foreground-muted">Evolves To:</b>{" "}
        <span className="font-medium">{card.evolvesTo.join(", ")}</span>
      </span>
    )}
  </div>
);

const IndexPage: NextPage = () => {
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [cardSearchTerm, setCardSearchTerm] = useState("");
  const [cards, setCards] = useState<TCGCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCardSearch, setShowCardSearch] = useState(false);

  // State for modal and selected card
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCard, setModalCard] = useState<TCGCard | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // New advanced features state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showMarketAnalytics, setShowMarketAnalytics] = useState(false);
  const [showVisualFilters, setShowVisualFilters] = useState(false);
  const [showComparisonTool, setShowComparisonTool] = useState(false);

  // Ref to detect clicks outside expanded card modal
  const containerRef = useRef<HTMLDivElement>(null);
  const globalSearchRef = useRef<HTMLInputElement>(null);

  function openModal(card: TCGCard) {
    setModalCard(card);
    setModalOpen(true);
    setSelectedCardId(card.id);
  }

  function closeModal() {
    setModalOpen(false);
    setModalCard(null);
    setSelectedCardId(null);
  }

  const handleCardSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pokemonKey) {
      setError("Pokemon TCG API key is not configured. Please check your environment variables.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setCards([]);
    try {
      // Dynamically import and configure Pokemon SDK
      const pokemonModule = await import('pokemontcgsdk');
      const pokemon = pokemonModule.default || pokemonModule;
      if (pokemonKey && typeof pokemon.configure === 'function') {
        pokemon.configure({ apiKey: pokemonKey });
      }
      const result = await pokemon.card.where({ q: `name:${cardSearchTerm}*` });
      setCards((result as any).data as TCGCard[]);
    } catch (err) {
      setError("Failed to load cards.");
    }
    setLoading(false);
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle global search - could navigate to a search results page
    // or filter content on the current page
    console.log('Global search:', globalSearchTerm);
  };


  // Handle click outside expanded card modal to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeModal();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalOpen]);

  return (
    <>
      <Head>
        <title>DexTrends - Pokemon TCG Card Prices & Trends</title>
        <meta name="description" content="Track Pokemon TCG card prices, explore trending cards, manage your collection, and discover the latest Pokemon TCG market trends" />
        <meta name="keywords" content="Pokemon TCG, card prices, Pokemon cards, TCG trends, Pokemon collection, card values" />
      </Head>
      <FullBleedWrapper gradient="pokedex">
        {/* Pokemon-themed Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-red-200/10 to-pink-200/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        {/* Header with Global Search */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-1">
            <Image
              src="/images/dextrends-vertical-logo.png"
              alt="DexTrends"
              width={500}
              height={600}
              className="h-72 md:h-80 lg:h-96 w-auto mx-auto transform hover:scale-105 transition-transform duration-300 filter contrast-200 saturate-140 brightness-90 drop-shadow-2xl"
              priority
            />
          </div>
          
          <p className="text-lg text-gray-600 font-medium mb-4 max-w-3xl mx-auto">
            Your ultimate destination for everything Pokémon - from TCG cards to game data, 
            competitive battles to collection tracking.
          </p>
          
          {/* Global Search Bar */}
          <form onSubmit={handleGlobalSearch} className="max-w-2xl mx-auto mb-6">
            <div className="relative group">
              <input
                ref={globalSearchRef}
                type="text"
                className="w-full px-6 py-4 pl-14 pr-32 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-full text-lg focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300 shadow-lg group-hover:shadow-xl"
                placeholder="Search Pokémon, cards, moves, items, regions..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
              </div>
              <CircularButton
                type="submit"
                variant="primary"
                size="md"
                className="absolute right-2 top-1/2 -translate-y-1/2"
              >
                Search
              </CircularButton>
            </div>
          </form>
        </div>
        
        {/* Main Navigation Grid - 8 Key Sections */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 mb-12">
          {/* Pokédex */}
          <Link href="/pokedex" className="group flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-4">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-pink-500 p-1 shadow-lg group-hover:shadow-xl transition-all duration-300">
                {/* Middle ring */}
                <div className="w-full h-full rounded-full bg-white p-2">
                  {/* Inner circle */}
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-50 to-pink-50 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Book className="w-12 h-12 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">Pokédex</h3>
            <p className="text-sm text-gray-600 text-center mt-1">1000+ Pokémon</p>
          </Link>

          {/* TCG Sets */}
          <Link href="/tcgsets" className="group flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-1 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white p-2">
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-purple-50 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CardList className="w-12 h-12 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">TCG Sets</h3>
            <p className="text-sm text-gray-600 text-center mt-1">All expansions</p>
          </Link>

          {/* Pokemon Regions */}
          <Link href="/pokemon/regions" className="group flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-500 to-teal-500 p-1 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white p-2">
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-green-50 to-teal-50 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Globe className="w-12 h-12 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">Regions</h3>
            <p className="text-sm text-gray-600 text-center mt-1">All regions</p>
          </Link>

          {/* Battle Simulator */}
          <Link href="/battle-simulator" className="group flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-1 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white p-2">
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-orange-50 to-red-50 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CrossedSwords className="w-12 h-12 text-orange-500" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">Battle</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Simulator</p>
          </Link>

          {/* Collections */}
          <Link href="/collections" className="group flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 p-1 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white p-2">
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-yellow-50 to-amber-50 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-12 h-12 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">Collection</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Track cards</p>
          </Link>

          {/* Pocket Mode */}
          <Link href="/pocketmode" className="group flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-1 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white p-2">
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-purple-50 to-pink-50 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <CardPickup className="w-12 h-12 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">Pocket TCG</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Mobile cards</p>
          </Link>

          {/* Price Tracker */}
          <Link href="/trending" className="group flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 p-1 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white p-2">
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-50 to-green-50 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="w-12 h-12 text-emerald-500" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">Prices</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Track trends</p>
          </Link>

          {/* Fun & Games */}
          <Link href="/fun" className="group flex flex-col items-center">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-1 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <div className="w-full h-full rounded-full bg-white p-2">
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-indigo-50 to-purple-50 shadow-inner flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Bulb className="w-12 h-12 text-indigo-500" />
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 text-center">Fun Zone</h3>
            <p className="text-sm text-gray-600 text-center mt-1">Games & trivia</p>
          </Link>
        </div>
        
        {/* Pokemon Card Search Section */}
        <div className="mb-12">
          <div className="panel-base">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="text-center sm:text-left">
                <h2 className="text-3xl font-bold text-gradient mb-2">
                  Pokémon Card Search
                </h2>
                <p className="text-gray-600">Search any Pokémon TCG card from our extensive database</p>
              </div>
              <button
                onClick={() => setShowCardSearch(!showCardSearch)}
                className={`btn ${
                  showCardSearch 
                    ? 'btn-secondary' 
                    : 'btn-primary'
                }`}
              >
                {showCardSearch ? 'Hide' : 'Show'} Card Search
              </button>
            </div>
            
            {showCardSearch && (
              <div className="space-y-6">
                <form onSubmit={handleCardSearch} className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="input"
                      placeholder="Search for Pokémon cards (e.g., Charizard, Pikachu)..."
                      value={cardSearchTerm}
                      onChange={(e) => setCardSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Search Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSearch(true)}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    Advanced
                  </button>
                </form>
                
                {/* Feature Toggle Pills */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button
                    onClick={() => setShowMarketAnalytics(!showMarketAnalytics)}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                      showMarketAnalytics
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <GraphUp className="inline-block w-4 h-4 mr-2" />
                    Market Analytics
                  </button>
                  
                  <button
                    onClick={() => setShowVisualFilters(!showVisualFilters)}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                      showVisualFilters
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    Visual Filters
                  </button>
                  
                  <button
                    onClick={() => setShowComparisonTool(!showComparisonTool)}
                    className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                      showComparisonTool
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="inline-block w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a4 4 0 004 4z" />
                    </svg>
                    Compare Cards
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Links Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Popular Destinations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/pokemon/starters" className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/50">
                <PokerHand className="w-8 h-8 mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Starter Pokémon</span>
              </div>
            </Link>
            <Link href="/pokemon/moves" className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/50">
                <Book className="w-8 h-8 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Moves & TMs</span>
              </div>
            </Link>
            <Link href="/pokemon/items" className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/50">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Items</span>
              </div>
            </Link>
            <Link href="/type-effectiveness" className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/50">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Type Chart</span>
              </div>
            </Link>
          </div>
        </div>
        
        {/* Market Analytics Section */}
        {showMarketAnalytics && (
          <div className="w-full mb-8">
            <DynamicMarketAnalytics />
          </div>
        )}
        
        {/* Visual Search Filters Section */}
        {showVisualFilters && (
          <div className="w-full mb-8">
            <VisualSearchFilters 
              onFiltersChange={(filters) => {
                // Apply visual filters to search
                console.log('Visual filters applied:', filters);
              }}
            />
          </div>
        )}
        
        {/* Card Comparison Tool Section */}
        {showComparisonTool && (
          <div className="w-full mb-8">
            <CardComparisonTool 
              isOpen={true}
              onClose={() => setShowComparisonTool(false)}
            />
          </div>
        )}
        
        {/* Card Results Section */}
        {(showCardSearch && cards.length > 0) && (
          <div className="w-full mb-8">
            <CardListComponent
              cards={cards}
              loading={loading}
              error={error}
              initialSortOption="price"
              onCardClick={openModal}
              getPrice={(card) => {
                // Extract numeric price from the formatted string
                const priceStr = getPrice(card);
                if (priceStr === "N/A") return 0;
                return parseFloat(priceStr.replace("$", "")) || 0;
              }}
              getReleaseDate={(card) => card.set?.releaseDate || "0000-00-00"}
              getRarityRank={getRarityRank}
            />
          </div>
        )}
      </div>
      
      {/* Modals */}
      {modalOpen && modalCard && (
        <Modal isOpen={modalOpen} onClose={closeModal}>
          <div className="flex flex-col items-center" ref={containerRef}>
            <img
              src={modalCard.images.large}
              alt={modalCard.name}
              className="max-w-[80vw] md:max-w-[400px] max-h-[80vh] object-contain rounded-2xl border-4 border-[#FFDE59] shadow-xl bg-white"
            />
            <h3 className="text-2xl font-bold mt-4 text-[#FF0000] drop-shadow-md">{modalCard.name}</h3>
            <p className="text-content-default mt-2">
              <b>Set:</b> {modalCard.set?.name || "N/A"}
            </p>
            <p className="text-content-default mt-1">
              <b>Rarity:</b> {modalCard.rarity || "N/A"}
            </p>
            <p className="text-content-default mt-1">
              <b>Price:</b> {getPrice(modalCard)}
            </p>
            {renderEvolutionLine(modalCard)}
          </div>
        </Modal>
      )}
      
      {/* Advanced Search Modal */}
      <DynamicAdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => setShowAdvancedSearch(false)}
        onSearchResults={(results) => {
          setCards(results);
          setShowAdvancedSearch(false);
          setShowCardSearch(true);
        }}
      />
      
      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .shadow-glow-rare {
          box-shadow: 0 0 14px 4px #ffe06655, 0 2px 8px 0 var(--color-shadow-default);
        }
        .shadow-glow-ultra {
          box-shadow: 0 0 18px 6px #a685ff99, 0 2px 8px 0 var(--color-shadow-default);
        }
        .shadow-glow-holo {
          box-shadow: 0 0 16px 5px #99ecff99, 0 2px 8px 0 var(--color-shadow-default);
        }
        @keyframes sparkleBurst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2);
          }
        }
        .animate-sparkleBurst {
          animation: sparkleBurst 0.2s ease-out forwards;
        }
      `}</style>
    </FullBleedWrapper>
    </>
  );
};

// Tell the layout this page uses full bleed
(IndexPage as any).fullBleed = true;

export default IndexPage;