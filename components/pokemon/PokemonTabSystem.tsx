import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies, PokemonTab, Nature, LocationAreaEncounterDetail } from "../../types/pokemon";
import type { TCGCard } from '../../types/api/cards';
import type { PocketCard } from '../../types/api/pocket-cards';
import type { CompetitiveTierRecord } from '../../utils/supabase';
import type { TypeColors } from '../../types/pokemon-tabs';
import { getTypeUIColors, getTypeAnimationAccent } from '../../utils/pokemonTypeGradients';
import PokemonGlassPanel from './PokemonGlassPanel';
import { cn } from '../../utils/cn';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import { FaClipboardList, FaChartBar, FaExchangeAlt, FaMapMarkerAlt, FaTrophy, FaLayerGroup } from 'react-icons/fa';
import { GiCrossedSwords, GiEggClutch } from 'react-icons/gi';
import { getAnimationProps } from '../../utils/animations';
import { useTheme } from '../../context/UnifiedAppContext';
import logger from '../../utils/logger';

interface ExtendedPocketCard extends PocketCard {
  health?: string | number;
  pack?: string;
  ex?: "Yes" | "No";
  fullart?: "Yes" | "No";
  type?: string;
}

// Lazy load tab components
const OverviewTab = lazy(() => import('./tabs/OverviewTabV3'));
const StatsTab = lazy(() => import('./tabs/StatsTabV2'));
const EvolutionTab = lazy(() => import('./tabs/EvolutionTabV3'));
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
  tcgCards?: TCGCard[];
  pocketCards?: ExtendedPocketCard[];
  abilities?: Record<string, unknown>;
  evolutionChain?: unknown;
  locationEncounters?: unknown[];
  natureData?: unknown;
  allNatures?: unknown[];
  onNatureChange?: (nature: string) => void;
  selectedNature?: string;
  selectedLevel?: number;
  onLevelChange?: (level: number) => void;
  competitiveTiers?: CompetitiveTierRecord | null;
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

// Cleanup function for old Pokemon tab preferences
const cleanupOldTabPreferences = () => {
  try {
    if (typeof window === 'undefined' || !localStorage) return;
    
    const keysToRemove: string[] = [];
    const tabPreferences: { [key: string]: { tab: string; timestamp: number } } = {};
    
    // Find all Pokemon tab keys and parse them
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('pokemon-tab-')) {
        const value = localStorage.getItem(key);
        if (value) {
          // Try to parse as object with timestamp, fallback to string
          try {
            const data = JSON.parse(value);
            tabPreferences[key] = data;
          } catch {
            // Old format, just the tab name
            tabPreferences[key] = { tab: value, timestamp: 0 };
          }
        }
      }
    }
    
    // Sort by timestamp and keep only the most recent 50
    const sortedKeys = Object.keys(tabPreferences).sort((a, b) => 
      (tabPreferences[b].timestamp || 0) - (tabPreferences[a].timestamp || 0)
    );
    
    // Remove all but the most recent 50
    if (sortedKeys.length > 50) {
      keysToRemove.push(...sortedKeys.slice(50));
    }
    
    // Also remove any dextrends_cache_ entries that are expired
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('dextrends_cache_')) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            const data = JSON.parse(item);
            if (data.expiry && Date.now() > data.expiry) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid entry, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    // Remove identified keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore errors during cleanup
      }
    });
    
    logger.debug(`Cleaned up ${keysToRemove.length} localStorage entries`);
  } catch (error) {
    logger.error('Error during localStorage cleanup:', error);
  }
};

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
  onLevelChange,
  competitiveTiers = null
}) => {
  const typeUIColors = getTypeUIColors(pokemon.types || []);
  const typeAccentHex = getTypeAnimationAccent(pokemon.types || []);
  
  // Create a proper TypeColors object for tabs
  const typeColors: TypeColors = {
    primary: typeUIColors.accent || '',
    accent: typeUIColors.accent || '',
    animationAccent: typeAccentHex || typeUIColors.accent || '',
    secondary: typeUIColors.button,
    tabActive: typeUIColors.tabActive
  };
  const [swipeDirection, setSwipeDirection] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isLoadingFromLocalStorage = useRef(false);
  const lastSavedTab = useRef<string | null>(null);
  const { theme } = useTheme();
  
  // Get current tab index
  const currentTabIndex = POKEMON_TABS.findIndex(tab => tab.id === activeTab);
  
  // Load saved tab preference only on Pokemon change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem(`pokemon-tab-${pokemon.id}`);
      if (savedData) {
        let savedTab: string;
        
        // Handle both old format (string) and new format (object)
        try {
          const parsed = JSON.parse(savedData);
          savedTab = parsed.tab || parsed;
        } catch {
          // Old format, just a string
          savedTab = savedData;
        }
        
        // Only change tab if it's different from the current one
        if (savedTab && savedTab !== activeTab && POKEMON_TABS.find(t => t.id === savedTab)) {
          isLoadingFromLocalStorage.current = true;
          onTabChange(savedTab as PokemonTab);
          // Reset the flag after a short delay
          setTimeout(() => {
            isLoadingFromLocalStorage.current = false;
          }, 100);
        }
      }
      }
    } catch (error) {
      logger.error('Error loading tab preference:', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemon.id, onTabChange]); // Only run when pokemon changes, not when activeTab changes
  
  // Save tab preference with debouncing to prevent rapid writes
  useEffect(() => {
    // Don't save if we're loading from localStorage
    if (isLoadingFromLocalStorage.current) return;
    
    // Don't save if it's the same as last saved value
    if (lastSavedTab.current === activeTab) return;
    
    const timeoutId = setTimeout(() => {
      try {
        // Save with timestamp for better cleanup
        if (typeof window !== 'undefined') {
          const tabData = JSON.stringify({ tab: activeTab, timestamp: Date.now() });
          localStorage.setItem(`pokemon-tab-${pokemon.id}`, tabData);
          lastSavedTab.current = activeTab;
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          logger.warn('localStorage quota exceeded, attempting cleanup...');
          // Try to clean up old Pokemon tab preferences
          cleanupOldTabPreferences();
          // Try again after cleanup
          try {
            if (typeof window !== 'undefined') {
              const tabData = JSON.stringify({ tab: activeTab, timestamp: Date.now() });
              localStorage.setItem(`pokemon-tab-${pokemon.id}`, tabData);
              lastSavedTab.current = activeTab;
            }
          } catch {
            logger.error('Failed to save tab preference after cleanup');
          }
        }
      }
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
            abilities={abilities as Record<string, any>}
            typeColors={typeColors}
            competitiveTiers={competitiveTiers}
          />
        );
      
      case 'stats':
        return (
          <StatsTab
            pokemon={pokemon}
            species={species}
            natureData={natureData as any}
            allNatures={allNatures as Nature[]}
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
            evolutionChain={evolutionChain as any}
            typeColors={typeColors}
          />
        );
      
      case 'moves':
        return (
          <MovesTab
            pokemon={pokemon}
            species={species}
            typeColors={typeColors}
          />
        );
      
      case 'breeding':
        try {
          return (
            <BreedingTab
              {...commonProps}
              typeColors={typeColors}
            />
          );
        } catch (error) {
          logger.error('Error rendering BreedingTab:', error);
          return (
            <div className="p-8 text-center text-gray-500">
              <p>Unable to load breeding information</p>
            </div>
          );
        }
      
      case 'locations':
        try {
          return (
            <LocationsTab
              {...commonProps}
              locationEncounters={locationEncounters as LocationAreaEncounterDetail[]}
              typeColors={typeColors}
            />
          );
        } catch (error) {
          logger.error('Error rendering LocationsTab:', error);
          return (
            <div className="p-8 text-center text-gray-500">
              <p>Unable to load location information</p>
            </div>
          );
        }
      
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
            competitiveTiers={competitiveTiers}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div 
      className="rounded-lg border border-white/20 dark:border-gray-700/30 shadow-lg overflow-hidden backdrop-blur-sm"
      style={{
        background: theme === 'dark' 
          ? `linear-gradient(135deg, 
              color-mix(in srgb, ${typeColors.accent} 8%, #111827), 
              color-mix(in srgb, ${typeColors.animationAccent} 8%, #1f2937)
            )`
          : `linear-gradient(135deg, 
              color-mix(in srgb, ${typeColors.accent} 10%, #ffffff), 
              color-mix(in srgb, ${typeColors.animationAccent} 10%, #f9fafb)
            )`
      }}>
      {/* Tab Header with Mobile-Optimized Design */}
      <div className="tab-header-mobile backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-b border-gray-200 dark:border-gray-700 relative z-50 shadow-md">
        <div className="tab-scroll-container flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2 md:gap-3">
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
              data-testid={tab.id === 'moves' ? 'moves-tab' : `tab-${tab.id}`}
              title={tab.label}
              aria-label={tab.label}
              className={cn(
                "tab-button-mobile",
                "px-4 py-2.5 md:px-5 md:py-2.5 font-medium text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 rounded-full",
                "transform hover:scale-[1.02] active:scale-[0.98] min-h-[48px]",
                activeTab === tab.id
                  ? "active bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-transparent"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <span className="text-lg md:text-base">{tab.icon}</span>
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab Content */}
      <div 
        className="p-6 md:p-8 relative bg-gray-100/80 dark:bg-gray-900/40"
        style={{ 
          transform: 'translateZ(0)',
          willChange: 'auto'
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            {...getAnimationProps('tabSwitch')}
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