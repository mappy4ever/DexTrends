import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies, PokemonTab } from '../../types/api/pokemon';
import { getTypeUIColors } from '../../utils/pokemonTypeGradients';
import PokemonGlassCard from './PokemonGlassCard';
import { cn } from '../../utils/cn';
import { PageLoader } from '../../utils/unifiedLoading';
import { FaClipboardList, FaChartBar, FaExchangeAlt, FaMapMarkerAlt, FaTrophy, FaLayerGroup } from 'react-icons/fa';
import { GiCrossedSwords, GiEggClutch } from 'react-icons/gi';

// Lazy load tab components
const OverviewTab = lazy(() => import('./tabs/OverviewTab'));
const StatsTab = lazy(() => import('./tabs/StatsTab'));
const EvolutionTab = lazy(() => import('./tabs/EvolutionTab'));
const MovesTab = lazy(() => import('./tabs/MovesTab'));
const BreedingTab = lazy(() => import('./tabs/BreedingTab'));
const LocationsTab = lazy(() => import('./tabs/LocationsTab'));
const CardsTab = lazy(() => import('./tabs/CardsTab'));
const CompetitiveTab = lazy(() => import('./tabs/CompetitiveTab'));

interface PokemonTabSystemProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  activeTab: PokemonTab;
  onTabChange: (tab: PokemonTab) => void;
  // Additional props for specific tabs
  tcgCards?: any[];
  pocketCards?: any[];
  abilities?: Record<string, any>;
  evolutionChain?: any;
  locationEncounters?: any[];
  natureData?: any;
  allNatures?: any[];
  onNatureChange?: (nature: string) => void;
  selectedNature?: string;
  selectedLevel?: number;
  onLevelChange?: (level: number) => void;
}

// Tab configuration - moved outside component to prevent recreation
const POKEMON_TABS: { id: PokemonTab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <FaClipboardList /> },
  { id: 'stats', label: 'Stats', icon: <FaChartBar /> },
  { id: 'evolution', label: 'Evolution', icon: <FaExchangeAlt /> },
  { id: 'moves', label: 'Moves', icon: <GiCrossedSwords /> },
  { id: 'breeding', label: 'Breeding', icon: <GiEggClutch /> },
  { id: 'locations', label: 'Locations', icon: <FaMapMarkerAlt /> },
  { id: 'cards', label: 'Cards', icon: <FaLayerGroup /> },
  { id: 'competitive', label: 'Competitive', icon: <FaTrophy /> }
];

const PokemonTabSystem: React.FC<PokemonTabSystemProps> = ({
  pokemon,
  species,
  activeTab,
  onTabChange,
  tcgCards = [],
  pocketCards = [],
  abilities = {},
  evolutionChain,
  locationEncounters = [],
  natureData,
  allNatures = [],
  onNatureChange,
  selectedNature = 'hardy',
  selectedLevel = 50,
  onLevelChange
}) => {
  const typeColors = getTypeUIColors(pokemon.types || []);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isLoadingFromLocalStorage = useRef(false);
  const lastSavedTab = useRef<string | null>(null);
  
  // Get current tab index
  const currentTabIndex = POKEMON_TABS.findIndex(tab => tab.id === activeTab);
  
  // Load saved tab preference only on Pokemon change
  useEffect(() => {
    const savedTab = localStorage.getItem(`pokemon-tab-${pokemon.id}`);
    // Only change tab if it's different from the current one
    if (savedTab && savedTab !== activeTab && POKEMON_TABS.find(t => t.id === savedTab)) {
      isLoadingFromLocalStorage.current = true;
      onTabChange(savedTab as PokemonTab);
      // Reset the flag after a short delay
      setTimeout(() => {
        isLoadingFromLocalStorage.current = false;
      }, 100);
    }
  }, [pokemon.id]); // Only depend on pokemon.id, not activeTab
  
  // Save tab preference with debouncing to prevent rapid writes
  useEffect(() => {
    // Don't save if we're loading from localStorage
    if (isLoadingFromLocalStorage.current) return;
    
    // Don't save if it's the same as last saved value
    if (lastSavedTab.current === activeTab) return;
    
    const timeoutId = setTimeout(() => {
      localStorage.setItem(`pokemon-tab-${pokemon.id}`, activeTab);
      lastSavedTab.current = activeTab;
    }, 300); // Debounce for 300ms
    
    return () => clearTimeout(timeoutId);
  }, [pokemon.id, activeTab]);
  
  // Touch handlers for swipe navigation
  const minSwipeDistance = 50;
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentTabIndex < POKEMON_TABS.length - 1) {
      setSwipeDirection(1);
      onTabChange(POKEMON_TABS[currentTabIndex + 1].id);
    }
    if (isRightSwipe && currentTabIndex > 0) {
      setSwipeDirection(-1);
      onTabChange(POKEMON_TABS[currentTabIndex - 1].id);
    }
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentTabIndex > 0) {
        setSwipeDirection(-1);
        onTabChange(POKEMON_TABS[currentTabIndex - 1].id);
      } else if (e.key === 'ArrowRight' && currentTabIndex < POKEMON_TABS.length - 1) {
        setSwipeDirection(1);
        onTabChange(POKEMON_TABS[currentTabIndex + 1].id);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTabIndex, onTabChange]);
  
  // Render tab content
  const renderTabContent = () => {
    const commonProps = { pokemon, species };
    
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            {...commonProps}
            abilities={abilities}
            typeColors={typeColors}
          />
        );
      
      case 'stats':
        return (
          <StatsTab
            {...commonProps}
            natureData={natureData}
            allNatures={allNatures}
            onNatureChange={onNatureChange}
            selectedNature={selectedNature}
            selectedLevel={selectedLevel}
            onLevelChange={onLevelChange}
            typeColors={typeColors}
          />
        );
      
      case 'evolution':
        return (
          <EvolutionTab
            {...commonProps}
            evolutionChain={evolutionChain}
            typeColors={typeColors}
          />
        );
      
      case 'moves':
        return (
          <MovesTab
            {...commonProps}
            typeColors={typeColors}
          />
        );
      
      case 'breeding':
        return (
          <BreedingTab
            {...commonProps}
            typeColors={typeColors}
          />
        );
      
      case 'locations':
        return (
          <LocationsTab
            {...commonProps}
            locationEncounters={locationEncounters}
            typeColors={typeColors}
          />
        );
      
      case 'cards':
        return (
          <CardsTab
            {...commonProps}
            tcgCards={tcgCards}
            pocketCards={pocketCards}
            typeColors={typeColors}
          />
        );
      
      case 'competitive':
        return (
          <CompetitiveTab
            {...commonProps}
            typeColors={typeColors}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Tab Header with Circular Design */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 relative z-50">
        <div className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2">
          {POKEMON_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const newIndex = POKEMON_TABS.findIndex(t => t.id === tab.id);
                setSwipeDirection(newIndex > currentTabIndex ? 1 : -1);
                onTabChange(tab.id);
              }}
              data-testid={`tab-${tab.id}`}
              style={{ position: 'relative', zIndex: 51 }}
              className={cn(
                "px-5 py-2 font-medium text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 rounded-full",
                activeTab === tab.id
                  ? "text-white bg-gradient-to-r from-purple-500 to-blue-500 shadow-lg transform scale-105"
                  : "text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md"
              )}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div 
        className="p-6 md:p-8"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ 
              opacity: 0 
            }}
            animate={{ 
              opacity: 1 
            }}
            exit={{ 
              opacity: 0 
            }}
            transition={{ 
              duration: 0.2,
              ease: "easeInOut"
            }}
          >
            <Suspense fallback={
              <div className="min-h-[400px] flex items-center justify-center">
                <PageLoader text="Loading..." />
              </div>
            }>
              {renderTabContent()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation hints */}
      <div className="hidden md:block absolute bottom-4 right-4 text-xs text-gray-400 dark:text-gray-600">
        Use ← → arrow keys to navigate tabs
      </div>
      <div className="md:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 dark:text-gray-600">
        Swipe to navigate tabs
      </div>
    </div>
  );
};

export default PokemonTabSystem;