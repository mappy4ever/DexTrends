import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations";
import { useTheme } from "../../context/themecontext";
import { pokemonTheme } from "../../utils/pokemonTheme";
import StyledBackButton from "../../components/ui/StyledBackButton";
import { TypeBadge } from "../../components/ui/TypeBadge";
import { BsBook, BsSearch, BsLightning, BsShield, BsQuestionCircle } from "react-icons/bs";
import { fetchData } from "../../utils/apiutils";

// Move categories
const moveCategories = {
  all: { name: "All Moves", icon: <BsBook /> },
  physical: { name: "Physical", icon: <BsLightning />, color: "bg-red-500" },
  special: { name: "Special", icon: <BsLightning />, color: "bg-blue-500" },
  status: { name: "Status", icon: <BsShield />, color: "bg-gray-500" }
};

export default function MovesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [moves, setMoves] = useState([]);
  const [filteredMoves, setFilteredMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [movesPerPage] = useState(20);

  // Pokemon types
  const types = [
    "all", "normal", "fire", "water", "electric", "grass", "ice",
    "fighting", "poison", "ground", "flying", "psychic", "bug",
    "rock", "ghost", "dragon", "dark", "steel", "fairy"
  ];

  // Fetch moves from PokeAPI
  useEffect(() => {
    const fetchMoves = async () => {
      setLoading(true);
      try {
        // PokeAPI has a lot of moves, so we'll fetch them with pagination
        const response = await fetchData(`https://pokeapi.co/api/v2/move?limit=1000`);
        
        // Fetch details for first batch of moves
        const moveDetailsPromises = response.results.slice(0, 100).map(move => 
          fetchData(move.url)
        );
        
        const moveDetails = await Promise.all(moveDetailsPromises);
        
        // Process move data
        const processedMoves = moveDetails.map(move => ({
          id: move.id,
          name: move.name.replace(/-/g, ' '),
          type: move.type.name,
          category: move.damage_class.name,
          power: move.power,
          accuracy: move.accuracy,
          pp: move.pp,
          priority: move.priority,
          description: move.effect_entries.find(entry => entry.language.name === 'en')?.short_effect || 
                      move.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text || 
                      'No description available',
          generation: move.generation.name,
          target: move.target.name.replace(/-/g, ' ')
        }));
        
        setMoves(processedMoves);
        setFilteredMoves(processedMoves);
      } catch (error) {
        console.error("Error fetching moves:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoves();
  }, []);

  // Filter moves based on search, type, and category
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

    setFilteredMoves(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedCategory, moves]);

  // Pagination
  const indexOfLastMove = currentPage * movesPerPage;
  const indexOfFirstMove = indexOfLastMove - movesPerPage;
  const currentMoves = filteredMoves.slice(indexOfFirstMove, indexOfLastMove);
  const totalPages = Math.ceil(filteredMoves.length / movesPerPage);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'physical':
        return <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">P</div>;
      case 'special':
        return <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">S</div>;
      case 'status':
        return <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center text-white text-xs font-bold">ST</div>;
      default:
        return <BsQuestionCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen">
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
            <h1 className="text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <BsBook className="text-blue-400" />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Moves & TMs
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Master every move in the Pokémon world
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Data from PokeAPI
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
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedType === type
                      ? 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2">
              {Object.entries(moveCategories).map(([key, category]) => (
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
          </div>

          {/* Moves List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading moves from PokeAPI...</p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-gray-600 dark:text-gray-400">
                Showing {filteredMoves.length} moves
              </div>

              <div className="grid gap-4">
                <StaggeredChildren>
                  {currentMoves.map((move) => (
                    <CardHover key={move.id}>
                      <div className={`rounded-xl p-6 ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      } shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold capitalize">{move.name}</h3>
                              <TypeBadge type={move.type} size="sm" />
                              {getCategoryIcon(move.category)}
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 mb-3">
                              {move.description}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                              {move.power && (
                                <div>
                                  <span className="text-gray-500">Power</span>
                                  <p className="font-bold">{move.power}</p>
                                </div>
                              )}
                              {move.accuracy && (
                                <div>
                                  <span className="text-gray-500">Accuracy</span>
                                  <p className="font-bold">{move.accuracy}%</p>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-500">PP</span>
                                <p className="font-bold">{move.pp}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Priority</span>
                                <p className="font-bold">{move.priority > 0 ? '+' : ''}{move.priority}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Target</span>
                                <p className="font-bold text-xs">{move.target}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHover>
                  ))}
                </StaggeredChildren>
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
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-3">
                    P
                  </div>
                  <h3 className="font-bold mb-2">Physical Moves</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Damage based on Attack stat
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-3">
                    S
                  </div>
                  <h3 className="font-bold mb-2">Special Moves</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Damage based on Special Attack stat
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-3">
                    ST
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
    </div>
  );
}