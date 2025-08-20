import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { NextPage } from "next";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations/animations";
import { useTheme } from "../../context/UnifiedAppContext";
import { pokemonTheme } from "../../utils/pokemonTheme";
import StyledBackButton from "../../components/ui/StyledBackButton";
import { TypeBadge } from "../../components/ui/TypeBadge";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import { createGlassStyle } from "../../components/ui/design-system/glass-constants";
import logger from "../../utils/logger";
import { SmartSkeleton } from "../../components/ui/SkeletonLoader";
import { BsBook, BsSearch, BsLightning, BsShield, BsQuestionCircle } from "react-icons/bs";
import { fetchJSON } from "../../utils/unifiedFetch";
import { showdownQueries, PokemonLearnsetRecord } from "../../utils/supabase";
import { getPokemonIdFromName } from "../../utils/pokemonNameIdMap";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [movesPerPage] = useState<number>(20);
  const [expandedMoveId, setExpandedMoveId] = useState<number | null>(null);
  const [moveLearners, setMoveLearners] = useState<Record<number, PokemonLearnsetRecord[]>>({});
  const [learnersLoading, setLearnersLoading] = useState<Record<number, boolean>>({});

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

  // Filter moves based on search, type, category, and special
  useEffect(() => {
    let filtered = moves;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(move =>
        move.name.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredMoves(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedCategory, selectedSpecial, moves]);

  // Pagination
  const indexOfLastMove = currentPage * movesPerPage;
  const indexOfFirstMove = indexOfLastMove - movesPerPage;
  const currentMoves = filteredMoves.slice(indexOfFirstMove, indexOfLastMove);
  const totalPages = Math.ceil(filteredMoves.length / movesPerPage);

  // Fetch Pokemon that can learn a specific move
  const fetchMoveLearners = async (moveId: number, moveName: string) => {
    if (moveLearners[moveId]) return; // Already fetched
    
    setLearnersLoading(prev => ({ ...prev, [moveId]: true }));
    try {
      const learners = await showdownQueries.getPokemonByMove(moveName);
      setMoveLearners(prev => ({ ...prev, [moveId]: learners }));
    } catch (error) {
      logger.error('Failed to fetch move learners:', error);
    } finally {
      setLearnersLoading(prev => ({ ...prev, [moveId]: false }));
    }
  };

  // Toggle move expansion
  const toggleMoveExpansion = async (moveId: number, moveName: string) => {
    if (expandedMoveId === moveId) {
      setExpandedMoveId(null);
    } else {
      setExpandedMoveId(moveId);
      await fetchMoveLearners(moveId, moveName);
    }
  };

  // Format Pokemon name for display
  const formatPokemonName = (pokemonId: string): string => {
    return pokemonId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get Pokemon sprite URL - use PokeAPI directly with Pokemon name/ID
  const getPokemonSprite = (pokemonId: string): string => {
    // Try local mapping first for common Pokemon
    const dexNumber = getPokemonIdFromName(pokemonId);
    if (dexNumber) {
      return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;
    }
    
    // For others, use PokeAPI directly with the Pokemon ID string
    // PokeAPI accepts both names and numbers in the URL
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  };

  // Format learn method for display
  const formatLearnMethod = (method: string, level: number | null): string => {
    switch (method) {
      case 'level-up':
        return level ? `Lv ${level}` : 'Level';
      case 'machine':
        return 'TM';
      case 'egg':
        return 'Egg';
      case 'tutor':
        return 'Tutor';
      default:
        return method;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'physical':
        return <Image src="/images/move-categories/physical.png" alt="Physical" width={36} height={36} className="object-contain" />;
      case 'special':
        return <Image src="/images/move-categories/special.png" alt="Special" width={36} height={36} className="object-contain" />;
      case 'status':
        return <Image src="/images/move-categories/status.png" alt="Status" width={36} height={36} className="object-contain" />;
      default:
        return <BsQuestionCircle className="w-9 h-9 text-gray-400" />;
    }
  };

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Moves & TMs | DexTrends</title>
        <meta name="description" content="Complete database of Pokemon moves, TMs, and HMs" />
      </Head>

      <FadeIn>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <StyledBackButton 
              text="Back to Pokémon Hub" 
              onClick={() => router.push('/pokemon')} 
            />
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3" data-testid="moves-heading">
              <BsBook className="text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Moves & TMs
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Master every move in the Pokémon world
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Complete move database from Pokemon Showdown
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search moves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-blue-400`}
              />
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType('all')}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                    selectedType === 'all'
                      ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Types
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground'].map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`transition-all duration-200 scale-95 ${
                      selectedType === type ? 'ring-2 ring-blue-400 ring-offset-2 shadow-lg !scale-100' : 'hover:scale-100'
                    }`}
                  >
                    <TypeBadge type={type} size="md" variant="gradient" />
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {['flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'].map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`transition-all duration-200 scale-95 ${
                      selectedType === type ? 'ring-2 ring-blue-400 ring-offset-2 shadow-lg !scale-100' : 'hover:scale-100'
                    }`}
                  >
                    <TypeBadge type={type} size="md" variant="gradient" />
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {Object.entries(getMoveCategories()).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    selectedCategory === key
                      ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Special Move Filter */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedSpecial('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedSpecial === 'all'
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All Moves
              </button>
              <button
                onClick={() => setSelectedSpecial('z-moves')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedSpecial === 'z-moves'
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ⚡ Z-Moves
              </button>
              <button
                onClick={() => setSelectedSpecial('max-moves')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedSpecial === 'max-moves'
                    ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                💥 Max Moves
              </button>
              <button
                onClick={() => setSelectedSpecial('gmax-moves')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedSpecial === 'gmax-moves'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                🔥 G-Max Moves
              </button>
              <button
                onClick={() => setSelectedSpecial('signature')}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  selectedSpecial === 'signature'
                    ? 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                ✨ Signature/Legendary
              </button>
            </div>
          </div>

          {/* Moves List */}
          {loading ? (
            <div className="w-full">
              <SmartSkeleton 
                type="table"
                rows={10} 
                columns={5}
                className="glass-medium rounded-xl p-6 shadow-lg"
              />
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600 dark:text-gray-400">
                Showing {filteredMoves.length} moves
              </div>

              {/* Solid container for moves */}
              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="moves-grid">
                  {currentMoves.map((move, index) => {
                    // Get type-based background color with more transparency
                    const getTypeBackground = () => {
                      const typeColors: Record<string, string> = {
                        normal: 'bg-gradient-to-br from-gray-100/60 to-gray-200/60',
                        fire: 'bg-gradient-to-br from-red-100/60 to-orange-100/60',
                        water: 'bg-gradient-to-br from-blue-100/60 to-cyan-100/60',
                        electric: 'bg-gradient-to-br from-yellow-100/60 to-amber-100/60',
                        grass: 'bg-gradient-to-br from-green-100/60 to-emerald-100/60',
                        ice: 'bg-gradient-to-br from-cyan-100/60 to-blue-100/60',
                        fighting: 'bg-gradient-to-br from-orange-100/60 to-red-100/60',
                        poison: 'bg-gradient-to-br from-purple-100/60 to-fuchsia-100/60',
                        ground: 'bg-gradient-to-br from-orange-100/40 to-amber-100/40',
                        flying: 'bg-gradient-to-br from-indigo-100/60 to-sky-100/60',
                        psychic: 'bg-gradient-to-br from-pink-100/60 to-rose-100/60',
                        bug: 'bg-gradient-to-br from-lime-100/60 to-green-100/60',
                        rock: 'bg-gradient-to-br from-stone-200/40 to-gray-300/40',
                        ghost: 'bg-gradient-to-br from-purple-200/60 to-indigo-100/60',
                        dragon: 'bg-gradient-to-br from-indigo-200/60 to-purple-200/60',
                        dark: 'bg-gradient-to-br from-gray-200/60 to-slate-200/60',
                        steel: 'bg-gradient-to-br from-slate-100/60 to-gray-200/60',
                        fairy: 'bg-gradient-to-br from-pink-100/60 to-rose-100/60'
                      };
                      return typeColors[move.type] || 'bg-gradient-to-br from-gray-100/60 to-gray-200/60';
                    };

                    // Dark mode type colors with more transparency
                    const getDarkTypeBackground = () => {
                      const typeColors: Record<string, string> = {
                        normal: 'bg-gradient-to-br from-gray-700/30 to-gray-800/30',
                        fire: 'bg-gradient-to-br from-red-900/30 to-orange-900/30',
                        water: 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30',
                        electric: 'bg-gradient-to-br from-yellow-900/30 to-amber-900/30',
                        grass: 'bg-gradient-to-br from-green-900/30 to-emerald-900/30',
                        ice: 'bg-gradient-to-br from-cyan-900/30 to-blue-900/30',
                        fighting: 'bg-gradient-to-br from-orange-900/30 to-red-900/30',
                        poison: 'bg-gradient-to-br from-purple-900/30 to-fuchsia-900/30',
                        ground: 'bg-gradient-to-br from-orange-900/20 to-amber-900/20',
                        flying: 'bg-gradient-to-br from-indigo-900/30 to-sky-900/30',
                        psychic: 'bg-gradient-to-br from-pink-900/30 to-rose-900/30',
                        bug: 'bg-gradient-to-br from-lime-900/30 to-green-900/30',
                        rock: 'bg-gradient-to-br from-stone-700/20 to-gray-600/20',
                        ghost: 'bg-gradient-to-br from-purple-800/30 to-indigo-900/30',
                        dragon: 'bg-gradient-to-br from-indigo-800/30 to-purple-800/30',
                        dark: 'bg-gradient-to-br from-gray-800/30 to-slate-800/30',
                        steel: 'bg-gradient-to-br from-slate-800/30 to-gray-700/30',
                        fairy: 'bg-gradient-to-br from-pink-900/30 to-rose-900/30'
                      };
                      return typeColors[move.type] || 'bg-gradient-to-br from-gray-700/30 to-gray-800/30';
                    };

                    const isExpanded = expandedMoveId === move.id;
                    const learners = moveLearners[move.id] || [];
                    const isLoadingLearners = learnersLoading[move.id] || false;
                    
                    // Check if we need to render the expanded section after this card
                    const showExpandedAfter = isExpanded;
                    
                    // Group learners by method for better organization
                    const learnersByMethod = learners.reduce((acc, learner) => {
                      const method = learner.learn_method;
                      if (!acc[method]) acc[method] = [];
                      acc[method].push(learner);
                      return acc;
                    }, {} as Record<string, typeof learners>);

                    return (
                      <>
                        <div 
                          key={move.id} 
                          onClick={() => toggleMoveExpansion(move.id, move.name)}
                          className={`relative overflow-hidden p-5 rounded-2xl group transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-lg hover:shadow-xl border border-white/20 dark:border-gray-700/30 cursor-pointer ${
                            theme === 'dark' ? getDarkTypeBackground() : getTypeBackground()
                          } ${isExpanded ? 'ring-2 ring-blue-400 scale-[1.02]' : ''}`}>
                        {/* Glass overlay for better readability */}
                        <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm" />
                        
                        {/* Content wrapper - positioned above glass overlay */}
                        <div className="relative z-10">
                          {/* Move header with name and type */}
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize truncate flex-1 tracking-tight">{move.name}</h3>
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(move.category)}
                              <TypeBadge type={move.type} size="md" variant="gradient" />
                            </div>
                          </div>
                          
                          {/* Compact stats display */}
                          <div className="flex flex-wrap gap-3 text-xs mb-2">
                            {move.power && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">PWR:</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">{move.power}</span>
                              </div>
                            )}
                            {move.accuracy && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">ACC:</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">{move.accuracy}%</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500 dark:text-gray-400 font-medium">PP:</span>
                              <span className="font-bold text-gray-800 dark:text-gray-200">{move.pp}</span>
                            </div>
                            {move.priority !== 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">PRI:</span>
                                <span className="font-bold text-gray-800 dark:text-gray-200">{move.priority > 0 ? '+' : ''}{move.priority}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Short effect - truncated */}
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 mb-2" title={move.short_effect}>
                            {move.short_effect}
                          </p>
                          
                          {/* Subtle expand indicator */}
                          <div className="absolute bottom-2 right-2 opacity-50 group-hover:opacity-100 transition-opacity">
                            {isExpanded ? (
                              <BsChevronUp className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                            ) : (
                              <BsChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Expanded Pokemon Learners Section - Spans full grid width */}
                      {showExpandedAfter && (
                        <div className={`col-span-1 md:col-span-2 lg:col-span-3 -mt-2 mb-3 transition-all duration-300 ease-in-out ${
                          isLoadingLearners ? 'opacity-80' : 'opacity-100'
                        }`}>
                          <div className="p-6 rounded-2xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-md border border-gray-200/30 dark:border-gray-700/30 shadow-lg animate-fadeIn">
                            <div className="text-base font-bold text-gray-800 dark:text-gray-200 mb-4">
                              Pokemon that can use {move.name}
                            </div>
                            
                            {isLoadingLearners ? (
                              <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 dark:border-t-blue-400"></div>
                                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Loading Pokemon...</p>
                              </div>
                            ) : learners.length > 0 ? (
                              <div className="space-y-4">
                                {Object.entries(learnersByMethod).map(([method, methodLearners]) => (
                                  <div key={method}>
                                    <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 capitalize">
                                      {method === 'level-up' ? 'Level Up' : method === 'machine' ? 'TM/HM' : method === 'egg' ? 'Egg Move' : method === 'tutor' ? 'Move Tutor' : method}
                                    </h4>
                                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                                      {methodLearners.map((learner, idx) => {
                                        const pokemonName = formatPokemonName(learner.pokemon_id);
                                        const spriteUrl = getPokemonSprite(learner.pokemon_id);
                                        const learnDetail = method === 'level-up' && learner.level ? `Lv ${learner.level}` : '';
                                        
                                        return (
                                          <div key={`${learner.pokemon_id}-${idx}`} className="flex flex-col items-center hover:scale-110 transition-transform cursor-pointer animate-fadeIn">
                                            <img
                                              src={spriteUrl}
                                              alt={pokemonName}
                                              className="w-12 h-12 object-contain"
                                              loading="lazy"
                                              onError={(e) => {
                                                // Try alternate sprite URL on error
                                                const target = e.target as HTMLImageElement;
                                                if (!target.src.includes('/sprites/pokemon/')) {
                                                  // If official artwork fails, try regular sprite
                                                  target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${learner.pokemon_id}.png`;
                                                } else {
                                                  // Final fallback
                                                  target.src = '/images/pokeball-placeholder.png';
                                                }
                                              }}
                                            />
                                            <span className="text-xs text-gray-700 dark:text-gray-300 text-center mt-1 line-clamp-1">
                                              {pokemonName}
                                            </span>
                                            {learnDetail && (
                                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                {learnDetail}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-4">
                                No Pokemon data available for this move
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                    );
                  })}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-400 text-white hover:bg-blue-500'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-400 text-white hover:bg-blue-500'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Info Section */}
          <SlideUp>
            <div className={`mt-12 p-8 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <h2 className="text-2xl font-bold mb-6 text-center">Move Categories</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Image src="/images/move-categories/physical.png" alt="Physical" width={48} height={48} />
                  </div>
                  <h3 className="font-bold mb-2">Physical Moves</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Damage based on Attack stat
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Image src="/images/move-categories/special.png" alt="Special" width={48} height={48} />
                  </div>
                  <h3 className="font-bold mb-2">Special Moves</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Damage based on Special Attack stat
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Image src="/images/move-categories/status.png" alt="Status" width={48} height={48} />
                  </div>
                  <h3 className="font-bold mb-2">Status Moves</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No direct damage, various effects
                  </p>
                </div>
              </div>
            </div>
          </SlideUp>
        </div>
      </FadeIn>
    </FullBleedWrapper>
  );
};

export default MovesPage;

// Add custom animation styles
if (typeof window !== 'undefined') {
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
  if (!document.head.querySelector('[data-moves-animations]')) {
    style.setAttribute('data-moves-animations', 'true');
    document.head.appendChild(style);
  }
}