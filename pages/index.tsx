import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import pokemon from "pokemontcgsdk";
import Modal from "../components/ui/modals/Modal";
import CardList from "../components/CardList";
import Image from 'next/image';
import { getPrice, getRarityRank } from "../utils/pokemonutils";
import { BsBook, BsCardList, BsGrid, BsSearch, BsGlobeEuropeAfrica, BsTrophy, BsHeart, BsGraphUp } from "react-icons/bs";
import { GiCardPickup, GiCrossedSwords, GiPokerHand } from "react-icons/gi";
import { FiTrendingUp, FiShoppingBag } from "react-icons/fi";
import { AiOutlineBulb } from "react-icons/ai";
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
      // Configure Pokemon SDK before use
      pokemon.configure({ apiKey: pokemonKey });
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
                <BsSearch className="h-5 w-5 text-gray-500" aria-hidden="true" />
              </div>
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
              >
                Search
              </button>
            </div>
          </form>
        </div>
        
        {/* Main Navigation Grid - 8 Key Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Pokédex */}
          <Link href="/pokedex" className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <BsBook className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Pokédex</h3>
              <p className="text-sm text-gray-600 mb-4">Explore all 1000+ Pokémon with stats, evolutions, and abilities</p>
              <div className="flex items-center text-red-600 font-semibold text-sm">
                <span>Browse Now</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* TCG Sets */}
          <Link href="/tcgsets" className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <BsCardList className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">TCG Sets</h3>
              <p className="text-sm text-gray-600 mb-4">Browse all Pokémon TCG sets and expansions</p>
              <div className="flex items-center text-blue-600 font-semibold text-sm">
                <span>View Sets</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Pokemon Regions */}
          <Link href="/pokemon/regions" className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <BsGlobeEuropeAfrica className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Regions</h3>
              <p className="text-sm text-gray-600 mb-4">Journey through Kanto, Johto, Hoenn, and beyond</p>
              <div className="flex items-center text-green-600 font-semibold text-sm">
                <span>Explore</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Battle Simulator */}
          <Link href="/battle-simulator" className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <GiCrossedSwords className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Battle</h3>
              <p className="text-sm text-gray-600 mb-4">Simulate battles and build competitive teams</p>
              <div className="flex items-center text-orange-600 font-semibold text-sm">
                <span>Battle Now</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Collections */}
          <Link href="/collections" className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <BsHeart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">My Collection</h3>
              <p className="text-sm text-gray-600 mb-4">Track your cards, favorites, and collection value</p>
              <div className="flex items-center text-yellow-600 font-semibold text-sm">
                <span>Manage</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Pocket Mode */}
          <Link href="/pocketmode" className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <GiCardPickup className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Pocket TCG</h3>
              <p className="text-sm text-gray-600 mb-4">Mobile-optimized TCG with exclusive cards</p>
              <div className="flex items-center text-purple-600 font-semibold text-sm">
                <span>Play Now</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Price Tracker */}
          <Link href="/trending" className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <FiTrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Price Tracker</h3>
              <p className="text-sm text-gray-600 mb-4">Monitor card prices and market trends</p>
              <div className="flex items-center text-emerald-600 font-semibold text-sm">
                <span>Track Prices</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Fun & Games */}
          <Link href="/fun" className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105 border border-white/50">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300">
                <AiOutlineBulb className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Fun Zone</h3>
              <p className="text-sm text-gray-600 mb-4">Quizzes, games, and Pokémon trivia</p>
              <div className="flex items-center text-indigo-600 font-semibold text-sm">
                <span>Have Fun</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Pokemon Card Search Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Pokémon Card Search
                </h2>
                <p className="text-gray-600">Search any Pokémon TCG card from our extensive database</p>
              </div>
              <button
                onClick={() => setShowCardSearch(!showCardSearch)}
                className={`px-6 py-3 font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                  showCardSearch 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
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
                      className="w-full px-6 py-4 pl-14 bg-gray-50 border border-gray-200 rounded-full text-lg focus:outline-none focus:border-purple-400 focus:bg-white transition-all duration-300"
                      placeholder="Search for Pokémon cards (e.g., Charizard, Pikachu)..."
                      value={cardSearchTerm}
                      onChange={(e) => setCardSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <BsSearch className="h-5 w-5 text-gray-500" aria-hidden="true" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Search Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedSearch(true)}
                    className="px-6 py-4 bg-white border-2 border-purple-300 text-purple-700 font-semibold rounded-full hover:bg-purple-50 transition-all duration-300 flex items-center gap-2"
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
                    <BsGraphUp className="inline-block w-4 h-4 mr-2" />
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
                <GiPokerHand className="w-8 h-8 mx-auto mb-2 text-red-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Starter Pokémon</span>
              </div>
            </Link>
            <Link href="/pokemon/moves" className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/50">
                <BsBook className="w-8 h-8 mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Moves & TMs</span>
              </div>
            </Link>
            <Link href="/pokemon/items" className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/50">
                <FiShoppingBag className="w-8 h-8 mx-auto mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">Items</span>
              </div>
            </Link>
            <Link href="/type-effectiveness" className="group">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 text-center hover:bg-white hover:shadow-lg transition-all duration-300 border border-white/50">
                <BsTrophy className="w-8 h-8 mx-auto mb-2 text-yellow-500 group-hover:scale-110 transition-transform" />
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
            <CardList
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
  );
};

// Tell the layout this page uses full bleed
(IndexPage as any).fullBleed = true;

export default IndexPage;