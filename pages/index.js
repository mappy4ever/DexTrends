import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import pokemon from "pokemontcgsdk";
import Modal from "../components/ui/Modal";
import CardList from "../components/CardList";
import CustomSiteLogo from "../components/icons/customsitelogo";
import { getPrice, getRarityRank } from "../utils/pokemonutils.js";
import { BsBook, BsCardList, BsGrid } from "react-icons/bs";
import { GiCardPickup } from "react-icons/gi";
import { DynamicAdvancedSearchModal, DynamicMarketAnalytics, preloadCriticalComponents } from "../components/dynamic/DynamicComponents";
import dynamic from 'next/dynamic';
import { toggleFeature, isFeatureEnabled } from "../utils/featureFlags";

// Safe dynamic imports for enhanced components
const VisualSearchFilters = dynamic(() => import('../components/ui/VisualSearchFilters'), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading visual filters...</div>
});

const CardComparisonTool = dynamic(() => import('../components/ui/CardComparisonTool'), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading comparison tool...</div>
});

const pokemonKey = process.env.NEXT_PUBLIC_POKEMON_TCG_SDK_API_KEY;

// Configure Pokemon SDK only if key is available
if (pokemonKey) {
  pokemon.configure({ apiKey: pokemonKey });
}

function getRarityGlow(rarity) {
  if (!rarity) return "";
  const rare = rarity.toLowerCase();
  if (rare.includes("ultra") || rare.includes("secret")) return "shadow-glow-ultra";
  if (rare.includes("rare")) return "shadow-glow-rare";
  if (rare.includes("holo")) return "shadow-glow-holo";
  return "";
}

export default function IndexPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for modal and selected card
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCard, setModalCard] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);

  // New advanced features state
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showMarketAnalytics, setShowMarketAnalytics] = useState(false);
  const [showVisualFilters, setShowVisualFilters] = useState(false);
  const [showComparisonTool, setShowComparisonTool] = useState(false);

  // Ref to detect clicks outside expanded card modal
  const containerRef = useRef(null);

  function openModal(card) {
    setModalCard(card);
    setModalOpen(true);
    setSelectedCardId(card.id);
  }

  function closeModal() {
    setModalOpen(false);
    setModalCard(null);
    setSelectedCardId(null);
  }

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!pokemonKey) {
      setError("Pokemon TCG API key is not configured. Please check your environment variables.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setCards([]);
    try {
      const result = await pokemon.card.where({ q: `name:${searchTerm}*` });
      setCards(result.data);
    } catch (err) {
      setError("Failed to load cards.");
    }
    setLoading(false);
  };

  const renderEvolutionLine = (card) => (
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
    function handleClickOutside(event) {
      if (
        modalOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
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
    <div className="section-spacing-y-default max-w-[98vw] 2xl:max-w-[1800px] mx-auto px-2 sm:px-4 animate-fadeIn">
      <div className="flex flex-col items-center mb-8 relative">
        {/* Clean Logo Container */}
        <div className="relative p-8 mb-6 transition-transform duration-300 hover:scale-105">
          <CustomSiteLogo size={150} className="mx-auto" />
        </div>
        
        {/* Clean Title */}
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-4 text-pokemon-red">
          DexTrends
        </h1>
        
        <p className="text-lg md:text-xl text-text-grey font-medium text-center mb-6 max-w-2xl">
          Discover, track, and explore <span className="font-bold text-pokemon-red">Pokémon TCG</span> card prices and trends in a beautiful 
          <span className="font-bold text-pokemon-blue"> Pokédex-inspired</span> experience.
        </p>
        
        {/* Enhanced Quick Action Tiles with Descriptions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mt-12">
          <Link
            href="/pokedex"
            className="group bg-white border border-border-color p-6 rounded-xl shadow-sm card-hover text-center hover:shadow-lg transition-all duration-300">
            
            <BsBook className="mx-auto mb-4 text-4xl text-pokemon-red group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-semibold text-lg text-dark-text mb-2">Pokédex</h3>
            <p className="text-sm text-text-grey">Browse all Pokémon with detailed stats and information</p>
          </Link>
          <Link
            href="/tcgsets"
            className="group bg-white border border-border-color p-6 rounded-xl shadow-sm card-hover text-center hover:shadow-lg transition-all duration-300">
            
            <BsCardList className="mx-auto mb-4 text-4xl text-pokemon-blue group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-semibold text-lg text-dark-text mb-2">Pokémon TCG</h3>
            <p className="text-sm text-text-grey">Explore sets, track prices, and manage collections</p>
          </Link>
          <Link
            href="/pocketmode"
            className="group bg-white border border-border-color p-6 rounded-xl shadow-sm card-hover text-center hover:shadow-lg transition-all duration-300">
            
            <GiCardPickup className="mx-auto mb-4 text-4xl text-pokemon-yellow group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-semibold text-lg text-dark-text mb-2">Pocket Mode</h3>
            <p className="text-sm text-text-grey">Mobile TCG format with streamlined gameplay</p>
          </Link>
          <Link
            href="/leaderboard"
            className="group bg-white border border-border-color p-6 rounded-xl shadow-sm card-hover text-center hover:shadow-lg transition-all duration-300">
            
            <BsGrid className="mx-auto mb-4 text-4xl text-pokemon-green group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-semibold text-lg text-dark-text mb-2">Rankings</h3>
            <p className="text-sm text-text-grey">See top players and competitive statistics</p>
          </Link>
        </div>
        
        {/* Features Preview Section */}
        <div className="w-full max-w-6xl mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl border border-blue-100">
            <h3 className="text-2xl font-bold text-dark-text mb-4">🎯 Smart Collection Management</h3>
            <p className="text-text-grey mb-6">Track your card values, set price alerts, and get insights into market trends with our advanced collection tools.</p>
            <Link href="/collections">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Manage Collection
              </button>
            </Link>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-xl border border-purple-100">
            <h3 className="text-2xl font-bold text-dark-text mb-4">⚡ Pocket Mode Experience</h3>
            <p className="text-text-grey mb-6">Dive into the mobile-optimized TCG format with exclusive cards, quick battles, and streamlined rules.</p>
            <Link href="/pocketmode">
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Explore Pocket
              </button>
            </Link>
          </div>
        </div>
      </div>
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8 w-full max-w-3xl mx-auto">
        <div className="relative flex-1 w-full md:max-w-lg">
          <input
            type="text"
            className="input-clean px-6 py-4 text-lg rounded-lg"
            placeholder="Search for Pokémon cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-grey">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button 
          type="submit" 
          className="btn-primary px-8 py-4 text-lg font-semibold rounded-lg hover:scale-105 transition-all duration-300"
        >
          Search
        </button>
        <button
          type="button"
          onClick={() => setShowAdvancedSearch(true)}
          className="btn-secondary px-6 py-4 text-lg font-semibold rounded-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          Advanced
        </button>
      </form>
      {/* Enhanced Features Toggle Bar */}
      <div className="w-full mb-8 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setShowMarketAnalytics(!showMarketAnalytics)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {showMarketAnalytics ? 'Hide' : 'Show'} Market Analytics
        </button>
        
        <button
          onClick={() => setShowVisualFilters(!showVisualFilters)}
          className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {showVisualFilters ? 'Hide' : 'Show'} Visual Filters
        </button>
        
        <button
          onClick={() => setShowComparisonTool(!showComparisonTool)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM7 21h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a4 4 0 004 4z" />
          </svg>
          {showComparisonTool ? 'Hide' : 'Show'} Card Comparison
        </button>
        
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
          <CardComparisonTool />
        </div>
      )}
      <div className="w-full mb-8">
        <CardList
          cards={cards}
          loading={loading}
          error={error}
          initialSortOption="price"
          onCardClick={openModal}
          getPrice={getPrice}
          getReleaseDate={(card) => card.set?.releaseDate || "0000-00-00"}
          getRarityRank={getRarityRank}
        />
      </div>
      {modalOpen && modalCard && (
        <Modal onClose={closeModal}>
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
        }}
      />
      <style jsx global>{`
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
    </div>
  );
}