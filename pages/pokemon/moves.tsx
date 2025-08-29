import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { NextPage } from "next";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations/animations";
import { useTheme } from "../../context/UnifiedAppContext";
import { pokemonTheme } from "../../utils/pokemonTheme";
import StyledBackButton from "../../components/ui/StyledBackButton";
import { TypeBadge } from "../../components/ui/TypeBadge";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import { createGlassStyle } from "../../components/ui/design-system/glass-constants";
import logger from "../../utils/logger";
import { SmartSkeleton } from "../../components/ui/SkeletonLoader";
import { BsBook, BsSearch, BsLightning, BsShield, BsQuestionCircle, BsSortUp, BsSortDown } from "react-icons/bs";
import { FaChevronUp } from "react-icons/fa";
import { fetchJSON } from "../../utils/unifiedFetch";
import { showdownQueries, PokemonLearnsetRecord } from "../../utils/supabase";
import { getPokemonIdFromName } from "../../utils/pokemonNameIdMap";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { useInView } from 'react-intersection-observer';
import { CircularButton } from "../../components/ui/design-system";

// Interfaces
interface Move {
  id: number;
  name: string;
  type: string;
  category: string;
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  effect_chance: number | null;
  effect: string;
  short_effect: string;
  generation: number;
}

type SortOption = 'name' | 'power' | 'accuracy' | 'pp' | 'type';
type SortDirection = 'asc' | 'desc';

interface MoveApiResponse {
  id: number;
  name: string;
  type: {
    name: string;
    url: string;
  };
  damage_class: {
    name: string;
    url: string;
  };
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  effect_chance: number | null;
  generation: {
    name: string;
    url: string;
  };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: {
      name: string;
      url: string;
    };
  }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }>;
}

interface MoveListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

interface MoveCategory {
  name: string;
  icon: React.ReactNode;
  color?: string;
}

// Move categories - will be initialized after component mount to use Image
const getMoveCategories = (): Record<string, MoveCategory> => ({
  all: { name: "All Moves", icon: <BsBook /> },
  physical: { name: "Physical", icon: <Image src="/images/move-categories/physical.png" alt="Physical" width={20} height={20} />, color: "bg-orange-500" },
  special: { name: "Special", icon: <Image src="/images/move-categories/special.png" alt="Special" width={20} height={20} />, color: "bg-blue-500" },
  status: { name: "Status", icon: <Image src="/images/move-categories/status.png" alt="Status" width={20} height={20} />, color: "bg-gray-500" }
});

const MovesPage: NextPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [moves, setMoves] = useState<Move[]>([]);
  const [filteredMoves, setFilteredMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSpecial, setSelectedSpecial] = useState<string>("all");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [visibleCount, setVisibleCount] = useState(30);
  const [expandedMoveId, setExpandedMoveId] = useState<number | null>(null);
  const [moveLearners, setMoveLearners] = useState<Record<number, PokemonLearnsetRecord[]>>({});
  const [learnersLoading, setLearnersLoading] = useState<Record<number, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Pokemon types
  const types = [
    "all", "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy"
  ];

  // Fetch moves from Supabase Showdown data
  useEffect(() => {
    const fetchMoves = async () => {
      setLoading(true);
      try {
        // Get all moves from our Supabase database (Showdown data)
        const showdownMoves = await showdownQueries.getAllMoves();
        logger.info('Fetched moves from Supabase:', { count: showdownMoves.length });
        logger.debug('Sample move data:', { firstMove: showdownMoves[0] });
        
        // Process move data from Showdown format to our Move interface
        const processedMoves = showdownMoves.map((move, index) => {
          return {
            id: move.id || index + 1,
            name: move.name || 'Unknown',  // Names are pre-formatted in database
            type: move.type || 'normal',
            category: move.category || 'status',
            power: move.power ?? null,
            accuracy: move.accuracy,
            pp: move.pp || 5,
            priority: move.priority || 0,
            effect_chance: move.secondary_effect?.chance || null,
            effect: move.description || 'No effect available',
            short_effect: move.short_description || move.description || 'No description available',
            generation: 1 // Default generation, can be enhanced later
          } as Move;
        });
        
        logger.info(`Processed ${processedMoves.length} moves from Showdown database`);
        setMoves(processedMoves);
        setFilteredMoves(processedMoves);
      } catch (error) {
        logger.error("Failed to fetch moves from Supabase", { error, details: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    fetchMoves();
  }, []);

  // Add custom animation styles for moves page
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      if (!document.head.querySelector('[data-moves-animations]')) {
        const style = document.createElement('style');
        style.textContent = `
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `;
        style.setAttribute('data-moves-animations', 'true');
        document.head.appendChild(style);
      }
    }
  }, []);

  // Filter and sort moves
  useEffect(() => {
    let filtered = moves;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(move =>
        move.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        move.short_effect.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by letter
    if (selectedLetter) {
      filtered = filtered.filter(move => 
        move.name.toUpperCase().startsWith(selectedLetter)
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(move => move.type === selectedType);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(move => move.category === selectedCategory);
    }

    // Filter by special move category
    if (selectedSpecial !== "all") {
      filtered = filtered.filter(move => {
        const name = move.name;
        switch (selectedSpecial) {
          case "z-moves":
            return name.includes('Downpour') || 
                   name.includes('Pummeling') || 
                   name.includes('Eclipse') || 
                   name.includes('Bloom Doom') ||
                   name.includes('Blitz') ||
                   name.includes('Crush') ||
                   name.includes('Vortex') ||
                   name.includes('Overdrive') ||
                   name.includes('Havoc') ||
                   name.includes('Drake') ||
                   name.includes('Nightmare') ||
                   name.includes('Spin-Out') ||
                   name.includes('Psyche') ||
                   name.includes('Skystrike') ||
                   name.includes('Tectonic Rage') ||
                   name.includes('Slammer') ||
                   name.includes('Twinkle Tackle') ||
                   name.includes('10,000,000 Volt') ||
                   name.includes('Catastropika') ||
                   name.includes('Stoked Sparksurfer') ||
                   name.includes('Extreme Evoboost') ||
                   name.includes('Pulverizing Pancake') ||
                   name.includes('Genesis Supernova') ||
                   name.includes('Sinister Arrow') ||
                   name.includes('Malicious Moonsault') ||
                   name.includes('Oceanic Operetta') ||
                   name.includes('Guardian of Alola') ||
                   name.includes('Soul-Stealing') ||
                   name.includes('Clangorous Soulblaze') ||
                   name.includes('Let\'s Snuggle') ||
                   name.includes('Splintered Stormshards') ||
                   name.includes('Searing Sunraze') ||
                   name.includes('Menacing Moonraze') ||
                   name.includes('Light That Burns');
          case "max-moves":
            return name.startsWith('Max ');
          case "gmax-moves":
            return name.startsWith('G-Max');
          case "signature":
            return name.includes('10,000,000 Volt') ||
                   name.includes('Astral Barrage') ||
                   name.includes('Behemoth') ||
                   name.includes('Blue Flare') ||
                   name.includes('Bolt Strike') ||
                   name.includes('Dark Void') ||
                   name.includes('Diamond Storm') ||
                   name.includes('Dragon Energy') ||
                   name.includes('Dynamax Cannon') ||
                   name.includes('Eternabeam') ||
                   name.includes('Fishious Rend') ||
                   name.includes('Fusion') ||
                   name.includes('Geomancy') ||
                   name.includes('Glacial Lance') ||
                   name.includes('Hyperspace') ||
                   name.includes('Judgment') ||
                   name.includes('Land\'s Wrath') ||
                   name.includes('Moongeist Beam') ||
                   name.includes('Oblivion Wing') ||
                   name.includes('Origin Pulse') ||
                   name.includes('Photon Geyser') ||
                   name.includes('Plasma Fists') ||
                   name.includes('Precipice Blades') ||
                   name.includes('Prismatic Laser') ||
                   name.includes('Psystrike') ||
                   name.includes('Roar of Time') ||
                   name.includes('Sacred Fire') ||
                   name.includes('Seed Flare') ||
                   name.includes('Shadow Force') ||
                   name.includes('Spacial Rend') ||
                   name.includes('Spectral Thief') ||
                   name.includes('Steam Eruption') ||
                   name.includes('Sunsteel Strike') ||
                   name.includes('Surging Strikes') ||
                   name.includes('Thousand') ||
                   name.includes('Thunder Cage') ||
                   name.includes('V-create') ||
                   name.includes('Wicked Blow');
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'power':
          const aPower = a.power ?? -1;
          const bPower = b.power ?? -1;
          comparison = bPower - aPower;
          break;
        case 'accuracy':
          const aAccuracy = a.accuracy ?? -1;
          const bAccuracy = b.accuracy ?? -1;
          comparison = bAccuracy - aAccuracy;
          break;
        case 'pp':
          comparison = b.pp - a.pp;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          if (comparison === 0) {
            comparison = a.name.localeCompare(b.name);
          }
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredMoves(filtered);
    setVisibleCount(30); // Reset visible count when filters change
  }, [searchTerm, selectedType, selectedCategory, selectedSpecial, selectedLetter, sortOption, sortDirection, moves]);

  // Lazy loading with intersection observer
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && visibleCount < filteredMoves.length) {
      setVisibleCount(prev => Math.min(prev + 30, filteredMoves.length));
    }
  }, [inView, visibleCount, filteredMoves.length]);

  const visibleMoves = useMemo(() => {
    return filteredMoves.slice(0, visibleCount);
  }, [filteredMoves, visibleCount]);

  // Generate alphabet array
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Function to fetch Pokemon that can learn a move
  const fetchMoveLearners = async (moveId: number, moveName: string) => {
    if (moveLearners[moveId]) {
      return;
    }

    setLearnersLoading(prev => ({ ...prev, [moveId]: true }));
    
    try {
      const learners = await showdownQueries.getPokemonByMove(moveName);
      setMoveLearners(prev => ({ ...prev, [moveId]: learners }));
    } catch (error) {
      logger.error(`Failed to fetch learners for move ${moveName}`, error);
      setMoveLearners(prev => ({ ...prev, [moveId]: [] }));
    } finally {
      setLearnersLoading(prev => ({ ...prev, [moveId]: false }));
    }
  };

  // Toggle move expansion
  const toggleMoveExpansion = (moveId: number, moveName: string) => {
    if (expandedMoveId === moveId) {
      setExpandedMoveId(null);
    } else {
      setExpandedMoveId(moveId);
      fetchMoveLearners(moveId, moveName);
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical':
        return <Image src="/images/move-categories/physical.png" alt="Physical" width={24} height={24} />;
      case 'special':
        return <Image src="/images/move-categories/special.png" alt="Special" width={24} height={24} />;
      case 'status':
        return <Image src="/images/move-categories/status.png" alt="Status" width={24} height={24} />;
      default:
        return null;
    }
  };

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Moves Database | DexTrends</title>
        <meta name="description" content="Explore all Pokemon moves, their types, power, and effects" />
      </Head>

      {/* Header */}
      <motion.div 
        className={`sticky top-0 z-50 ${createGlassStyle({
          blur: '2xl',
          opacity: 'medium',
          gradient: true,
          border: 'subtle',
          shadow: 'lg',
          rounded: 'sm'
        })} border-b border-white/20`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <CircularButton
              onClick={() => router.push('/pokemon')}
              variant="secondary"
              size="sm"
            >
              ← Back
            </CircularButton>
            
            <div className="text-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent mb-1 tracking-tight">
                Moves
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Browse all Pokemon moves and their effects
              </p>
            </div>
            
            <div className={`${createGlassStyle({
              blur: 'sm',
              opacity: 'subtle',
              gradient: false,
              border: 'subtle',
              shadow: 'sm',
              rounded: 'lg'
            })} px-3 py-2 rounded-lg text-center`}>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {loading ? '...' : moves.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                moves
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`${createGlassStyle({
            blur: 'xl',
            opacity: 'medium',
            gradient: true,
            border: 'medium',
            shadow: 'xl',
            rounded: 'xl',
            hover: 'subtle'
          })} mb-8 p-8 rounded-3xl`}>
            {/* Search Bar */}
            <div className="relative mb-6">
              <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-lg z-10" />
              <input
                type="text"
                placeholder="Search moves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`${createGlassStyle({
                  blur: 'md',
                  opacity: 'medium',
                  gradient: false,
                  border: 'medium',
                  shadow: 'md',
                  rounded: 'full'
                })} w-full pl-12 pr-4 py-4 rounded-full text-gray-800 dark:text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-300 transition-all duration-300`}
              />
            </div>

            {/* Alphabet Filter */}
            <div className="mb-4 p-3 bg-white/20 dark:bg-gray-800/20 rounded-xl">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Quick Navigation:</p>
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setSelectedLetter(null)}
                  className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                    selectedLetter === null
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white/30 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-white/50'
                  }`}
                >
                  All
                </button>
                {alphabet.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setSelectedLetter(letter)}
                    className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                      selectedLetter === letter
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/30 dark:bg-gray-700/30 text-gray-600 dark:text-gray-400 hover:bg-white/50'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorting Options */}
            <div className="mb-4 p-3 bg-white/20 dark:bg-gray-800/20 rounded-xl">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Sort By:</p>
                <div className="flex items-center gap-2">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="px-3 py-1 text-xs bg-white/30 dark:bg-gray-700/30 rounded-lg border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300"
                  >
                    <option value="name">Name</option>
                    <option value="power">Power</option>
                    <option value="accuracy">Accuracy</option>
                    <option value="pp">PP</option>
                    <option value="type">Type</option>
                  </select>
                  <button
                    onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="p-1 bg-white/30 dark:bg-gray-700/30 rounded-lg border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300 hover:bg-white/50 transition-all"
                  >
                    {sortDirection === 'asc' ? <BsSortUp className="text-sm" /> : <BsSortDown className="text-sm" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Type Filter */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Type:</p>
              <div className="flex flex-wrap gap-2">
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedType === type
                        ? 'scale-105 shadow-lg'
                        : 'opacity-75 hover:opacity-100'
                    }`}
                  >
                    {type === 'all' ? (
                      <span className={`px-3 py-1 rounded-full ${
                        selectedType === type
                          ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        All Types
                      </span>
                    ) : (
                      <TypeBadge type={type} className="text-xs" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Category and Special Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Category:</p>
                <div className="flex gap-2">
                  {Object.entries(getMoveCategories()).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedCategory === key
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-white/30 dark:bg-gray-700/30 text-gray-700 dark:text-gray-300 hover:bg-white/50'
                      }`}
                    >
                      {category.icon}
                      <span>{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Special:</p>
                <select
                  value={selectedSpecial}
                  onChange={(e) => setSelectedSpecial(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white/30 dark:bg-gray-700/30 rounded-lg border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Moves</option>
                  <option value="z-moves">Z-Moves</option>
                  <option value="max-moves">Max Moves</option>
                  <option value="gmax-moves">G-Max Moves</option>
                  <option value="signature">Signature Moves</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {visibleMoves.length} of {filteredMoves.length} moves
            </div>
          </div>
        </motion.div>

        {/* Moves Table */}
        {loading ? (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <div className={`${createGlassStyle({
                blur: 'xl',
                opacity: 'medium',
                gradient: true,
                border: 'medium',
                shadow: 'lg',
                rounded: 'xl'
              })} p-6 rounded-2xl`}>
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span>Loading moves...</span>
                  <span className="text-blue-500 font-medium">Please wait</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                    animate={{ 
                      x: ['-100%', '100%'],
                      transition: { 
                        repeat: Infinity,
                        duration: 2,
                        ease: "easeInOut"
                      }
                    }}
                  />
                </div>
              </div>
            </motion.div>
            {[...Array(10)].map((_, i) => (
              <SmartSkeleton key={i} type="card" height="60px" />
            ))}
          </div>
        ) : (
          <>
            <div ref={containerRef} className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`${createGlassStyle({
                    blur: 'md',
                    opacity: 'medium',
                    gradient: true,
                    border: 'subtle',
                    shadow: 'sm',
                    rounded: 'lg'
                  })}`}>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">Name</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Category</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Power</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Accuracy</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">PP</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMoves.map((move, index) => (
                    <React.Fragment key={move.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.01, 0.3) }}
                        className={`${createGlassStyle({
                          blur: 'sm',
                          opacity: 'subtle',
                          gradient: false,
                          border: 'subtle',
                          shadow: 'sm',
                          rounded: 'md',
                          hover: 'lift'
                        })} cursor-pointer transition-all hover:scale-[1.02]`}
                        onClick={() => toggleMoveExpansion(move.id, move.name)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {move.name}
                            </span>
                            <button
                              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                              {expandedMoveId === move.id ? <BsChevronUp /> : <BsChevronDown />}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <TypeBadge type={move.type} className="text-xs inline-block" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {getCategoryIcon(move.category)}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                          {move.power || '—'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                          {move.accuracy ? `${move.accuracy}%` : '—'}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                          {move.pp}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-700 dark:text-gray-300">
                          {move.priority !== 0 && (
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              move.priority > 0 
                                ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                                : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                            }`}>
                              {move.priority > 0 ? '+' : ''}{move.priority}
                            </span>
                          )}
                        </td>
                      </motion.tr>
                      
                      {/* Expanded Move Details */}
                      <AnimatePresence>
                        {expandedMoveId === move.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={7} className="px-4 py-0">
                              <div className={`${createGlassStyle({
                                blur: 'lg',
                                opacity: 'medium',
                                gradient: true,
                                border: 'medium',
                                shadow: 'md',
                                rounded: 'lg'
                              })} p-4 mb-2 rounded-lg`}>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                                  {move.effect}
                                </p>
                                
                                {learnersLoading[move.id] ? (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                                    Loading Pokemon that can learn this move...
                                  </div>
                                ) : moveLearners[move.id] && moveLearners[move.id].length > 0 ? (
                                  <div>
                                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                                      Pokemon that can learn {move.name}:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {moveLearners[move.id].slice(0, 20).map((learner, idx) => {
                                        const pokemonId = getPokemonIdFromName(learner.pokemon_id);
                                        return pokemonId ? (
                                          <Link
                                            key={idx}
                                            href={`/pokedex/${pokemonId}`}
                                            className="px-2 py-1 bg-white/30 dark:bg-gray-700/30 rounded-lg text-xs hover:bg-white/50 dark:hover:bg-gray-600/50 transition-all capitalize"
                                          >
                                            {learner.pokemon_id.replace(/-/g, ' ')}
                                          </Link>
                                        ) : (
                                          <span
                                            key={idx}
                                            className="px-2 py-1 bg-white/30 dark:bg-gray-700/30 rounded-lg text-xs capitalize"
                                          >
                                            {learner.pokemon_id.replace(/-/g, ' ')}
                                          </span>
                                        );
                                      })}
                                      {moveLearners[move.id].length > 20 && (
                                        <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                                          +{moveLearners[move.id].length - 20} more
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More Trigger */}
            {visibleCount < filteredMoves.length && (
              <div ref={inViewRef} className="flex justify-center mt-8">
                <div className={`${createGlassStyle({
                  blur: 'lg',
                  opacity: 'medium',
                  gradient: true,
                  border: 'medium',
                  shadow: 'md',
                  rounded: 'full'
                })} px-6 py-3 rounded-full`}>
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Loading more moves... ({visibleCount}/{filteredMoves.length})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll to Top Button */}
            {visibleCount > 60 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 flex justify-center"
              >
                <button
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setVisibleCount(30);
                  }}
                  className={`${createGlassStyle({
                    blur: 'xl',
                    opacity: 'medium',
                    gradient: true,
                    border: 'medium',
                    shadow: 'lg',
                    rounded: 'full',
                    hover: 'lift'
                  })} px-6 py-3 rounded-full flex items-center gap-2`}
                >
                  <FaChevronUp className="text-sm" />
                  <span className="text-sm font-semibold">Back to Top</span>
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </FullBleedWrapper>
  );
};

export default MovesPage;