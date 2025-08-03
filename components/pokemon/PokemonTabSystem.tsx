import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Pokemon, PokemonSpecies, PokemonTab } from '../../types/api/pokemon';
import type { CompetitiveTierRecord } from '../../utils/supabase';
import { getTypeUIColors, getTypeAnimationAccent } from '../../utils/pokemonTypeGradients';
import PokemonGlassCard from './PokemonGlassCard';
import { cn } from '../../utils/cn';
import { PageLoader } from '../../utils/unifiedLoading';
import { FaClipboardList, FaChartBar, FaExchangeAlt, FaMapMarkerAlt, FaTrophy, FaLayerGroup } from 'react-icons/fa';
import { GiCrossedSwords, GiEggClutch } from 'react-icons/gi';
import { getAnimationProps, UI_ANIMATION_SETS } from '../../utils/standardizedAnimations';
import { useTheme } from '../../context/UnifiedAppContext';

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
    
    console.log(`Cleaned up ${keysToRemove.length} localStorage entries`);
  } catch (error) {
    console.error('Error during localStorage cleanup:', error);
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
  const typeColors = getTypeUIColors(pokemon.types || []);
  const typeAccentHex = getTypeAnimationAccent(pokemon.types || []);
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
    } catch (error) {
      console.error('Error loading tab preference:', error);
    }
  }, [pokemon.id]); // Only depend on pokemon.id, not activeTab
  
  // Save tab preference with debouncing to prevent rapid writes
  useEffect(() => {
    // Don't save if we're loading from localStorage
    if (isLoadingFromLocalStorage.current) return;
    
    // Don't save if it's the same as last saved value
    if (lastSavedTab.current === activeTab) return;
    
    const timeoutId = setTimeout(() => {
      try {
        // Save with timestamp for better cleanup
        const tabData = JSON.stringify({ tab: activeTab, timestamp: Date.now() });
        localStorage.setItem(`pokemon-tab-${pokemon.id}`, tabData);
        lastSavedTab.current = activeTab;
      } catch (error: any) {
        if (error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, attempting cleanup...');
          // Try to clean up old Pokemon tab preferences
          cleanupOldTabPreferences();
          // Try again after cleanup
          try {
            const tabData = JSON.stringify({ tab: activeTab, timestamp: Date.now() });
            localStorage.setItem(`pokemon-tab-${pokemon.id}`, tabData);
            lastSavedTab.current = activeTab;
          } catch {
            console.error('Failed to save tab preference after cleanup');
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
            abilities={abilities}
            typeColors={typeColors}
            competitiveTiers={competitiveTiers}
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
        try {
          return (
            <BreedingTab
              {...commonProps}
              typeColors={typeColors}
            />
          );
        } catch (error) {
          console.error('Error rendering BreedingTab:', error);
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
              locationEncounters={locationEncounters}
              typeColors={typeColors}
            />
          );
        } catch (error) {
          console.error('Error rendering LocationsTab:', error);
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
      {/* Tab Header with Circular Design */}
      <div 
        className="backdrop-blur-md border-b relative z-50 shadow-md"
        style={{
          background: theme === 'dark'
            ? `linear-gradient(to bottom, 
                color-mix(in srgb, ${typeColors.accent} 25%, rgba(31, 41, 55, 0.95)), 
                color-mix(in srgb, ${typeColors.accent} 20%, rgba(17, 24, 39, 0.95))
              )`
            : `linear-gradient(to bottom, 
                color-mix(in srgb, ${typeColors.accent} 28%, rgba(255, 255, 255, 0.95)), 
                color-mix(in srgb, ${typeColors.accent} 25%, rgba(249, 250, 251, 0.95))
              )`,
          borderBottomColor: `color-mix(in srgb, ${typeColors.accent} 30%, ${theme === 'dark' ? '#374151' : '#e5e7eb'})`,
          boxShadow: `0 2px 8px rgba(0, 0, 0, ${theme === 'dark' ? '0.2' : '0.08'})`
        }}>
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
              data-testid={tab.id === 'moves' ? 'moves-tab' : `tab-${tab.id}`}
              style={{
                position: 'relative',
                zIndex: 51,
                ...(activeTab === tab.id ? {
                  backgroundImage: pokemon.types?.length === 2
                    ? theme === 'dark'
                      ? `linear-gradient(135deg, 
                          color-mix(in srgb, ${typeColors.animationAccent} 70%, #1f2937), 
                          color-mix(in srgb, ${getTypeAnimationAccent([pokemon.types[1]]) || typeColors.animationAccent} 70%, #111827)
                        )`
                      : `linear-gradient(135deg, 
                          color-mix(in srgb, ${typeColors.animationAccent} 60%, #f3f4f6), 
                          color-mix(in srgb, ${getTypeAnimationAccent([pokemon.types[1]]) || typeColors.animationAccent} 60%, #e5e7eb)
                        )`
                    : theme === 'dark'
                      ? `linear-gradient(135deg, 
                          color-mix(in srgb, ${typeColors.animationAccent} 70%, #1f2937), 
                          color-mix(in srgb, ${typeColors.animationAccent} 60%, #111827)
                        )`
                      : `linear-gradient(135deg, 
                          color-mix(in srgb, ${typeColors.animationAccent} 60%, #f3f4f6), 
                          color-mix(in srgb, ${typeColors.animationAccent} 50%, #e5e7eb)
                        )`,
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  border: `1px solid ${typeColors.animationAccent}50`,
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                } : {})
              }}
              className={cn(
                "px-4 py-2 font-medium text-sm transition-all duration-300 whitespace-nowrap flex items-center gap-2 rounded-full",
                activeTab === tab.id
                  ? "text-white transform scale-[1.02] font-semibold drop-shadow-md"
                  : "text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-white/90 dark:hover:bg-gray-700/90 hover:shadow-md"
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