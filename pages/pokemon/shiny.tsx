import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../../components/ui/Container';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import { TypeBadge } from '../../components/ui/TypeBadge';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import { cn } from '../../utils/cn';
import logger from '../../utils/logger';
import { fetchJSON } from '../../utils/unifiedFetch';
import { FaSearch, FaStar, FaRandom, FaExpand, FaTimes, FaChevronLeft, FaChevronRight, FaHeart } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny: string;
    other?: {
      'official-artwork'?: {
        front_default: string;
        front_shiny: string;
      };
      home?: {
        front_default: string;
        front_shiny: string;
      };
    };
  };
  types: Array<{ type: { name: string } }>;
}

interface SimplePokemon {
  id: number;
  name: string;
  url: string;
}

const GENERATIONS = [
  { name: 'Gen 1', range: [1, 151], label: 'Kanto' },
  { name: 'Gen 2', range: [152, 251], label: 'Johto' },
  { name: 'Gen 3', range: [252, 386], label: 'Hoenn' },
  { name: 'Gen 4', range: [387, 493], label: 'Sinnoh' },
  { name: 'Gen 5', range: [494, 649], label: 'Unova' },
  { name: 'Gen 6', range: [650, 721], label: 'Kalos' },
  { name: 'Gen 7', range: [722, 809], label: 'Alola' },
  { name: 'Gen 8', range: [810, 905], label: 'Galar' },
  { name: 'Gen 9', range: [906, 1025], label: 'Paldea' },
];

// Notable shinies with color changes
const NOTABLE_SHINIES = [
  { id: 6, name: 'Charizard', reason: 'Black Charizard - iconic color swap' },
  { id: 25, name: 'Pikachu', reason: 'Slightly darker yellow - subtle but classic' },
  { id: 94, name: 'Gengar', reason: 'Barely visible change - infamous subtle shiny' },
  { id: 129, name: 'Magikarp', reason: 'Golden Magikarp - symbol of shiny hunting' },
  { id: 130, name: 'Gyarados', reason: 'Red Gyarados - first shiny many players saw' },
  { id: 149, name: 'Dragonite', reason: 'Green Dragonite - dramatic color change' },
  { id: 150, name: 'Mewtwo', reason: 'Green-tinted legendary' },
  { id: 249, name: 'Lugia', reason: 'Pink accents - beautiful legendary' },
  { id: 250, name: 'Ho-Oh', reason: 'Silver/gold swap - gorgeous redesign' },
  { id: 384, name: 'Rayquaza', reason: 'Black Rayquaza - fan favorite' },
  { id: 445, name: 'Garchomp', reason: 'Nearly invisible change - controversial' },
  { id: 373, name: 'Salamence', reason: 'Green body - striking change' },
  { id: 376, name: 'Metagross', reason: 'Silver and gold - premium look' },
  { id: 658, name: 'Greninja', reason: 'Black ninja - sleek design' },
  { id: 778, name: 'Mimikyu', reason: 'Muted colors - subtle creepiness' },
];

/**
 * Shiny Pokemon Gallery
 *
 * Features:
 * - Side-by-side normal vs shiny comparison
 * - Generation filtering
 * - Notable shinies showcase
 * - Fullscreen view mode
 * - Random shiny discovery
 */
const ShinyGalleryPage: NextPage = () => {
  const router = useRouter();
  const [allPokemon, setAllPokemon] = useState<SimplePokemon[]>([]);
  const [loadedPokemon, setLoadedPokemon] = useState<Map<number, Pokemon>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGen, setSelectedGen] = useState<number | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showComparison, setShowComparison] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 24;
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shiny-favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      localStorage.setItem('shiny-favorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  // Fetch all Pokemon list
  useEffect(() => {
    const fetchPokemonList = async () => {
      try {
        const data = await fetchJSON<{ results: Array<{ name: string; url: string }> }>(
          'https://pokeapi.co/api/v2/pokemon?limit=1025',
          { useCache: true, cacheTime: 60 * 60 * 1000 }
        );
        if (data?.results) {
          const pokemon = data.results.map((p, index) => ({
            id: index + 1,
            name: p.name,
            url: p.url
          }));
          setAllPokemon(pokemon);
        }
      } catch (error) {
        logger.error('Failed to fetch Pokemon list', { error });
      } finally {
        setLoading(false);
      }
    };
    fetchPokemonList();
  }, []);

  // Filter Pokemon
  const filteredPokemon = useMemo(() => {
    let filtered = allPokemon;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery)
      );
    }

    if (selectedGen !== null) {
      const gen = GENERATIONS[selectedGen];
      if (gen) {
        filtered = filtered.filter(p =>
          p.id >= gen.range[0] && p.id <= gen.range[1]
        );
      }
    }

    return filtered;
  }, [allPokemon, searchQuery, selectedGen]);

  // Paginated Pokemon
  const paginatedPokemon = useMemo(() => {
    return filteredPokemon.slice(0, page * ITEMS_PER_PAGE);
  }, [filteredPokemon, page]);

  // Load more on scroll
  const loadMore = useCallback(() => {
    if (paginatedPokemon.length < filteredPokemon.length) {
      setPage(p => p + 1);
    }
  }, [paginatedPokemon.length, filteredPokemon.length]);

  // Intersection observer for infinite scroll
  const lastItemRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loadMore]);

  // Fetch individual Pokemon details
  const fetchPokemonDetails = useCallback(async (id: number) => {
    if (loadedPokemon.has(id)) return loadedPokemon.get(id);

    try {
      const data = await fetchJSON<Pokemon>(
        `https://pokeapi.co/api/v2/pokemon/${id}`,
        { useCache: true, cacheTime: 30 * 60 * 1000 }
      );
      if (data) {
        setLoadedPokemon(prev => new Map(prev).set(id, data));
        return data;
      }
    } catch (error) {
      logger.error('Failed to fetch Pokemon details', { error, id });
    }
    return null;
  }, [loadedPokemon]);

  // Open modal with full details
  const openPokemonModal = async (id: number) => {
    const pokemon = loadedPokemon.get(id) || await fetchPokemonDetails(id);
    if (pokemon) {
      setSelectedPokemon(pokemon);
    }
  };

  // Random shiny
  const showRandomShiny = async () => {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    await openPokemonModal(randomId);
  };

  const formatPokemonName = (name: string): string => {
    return name.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getShinySprite = (pokemon: Pokemon, useOfficial: boolean = true): string => {
    if (useOfficial) {
      return pokemon.sprites.other?.['official-artwork']?.front_shiny ||
             pokemon.sprites.other?.home?.front_shiny ||
             pokemon.sprites.front_shiny;
    }
    return pokemon.sprites.front_shiny;
  };

  const getNormalSprite = (pokemon: Pokemon, useOfficial: boolean = true): string => {
    if (useOfficial) {
      return pokemon.sprites.other?.['official-artwork']?.front_default ||
             pokemon.sprites.other?.home?.front_default ||
             pokemon.sprites.front_default;
    }
    return pokemon.sprites.front_default;
  };

  const renderPokemonCard = (pokemon: SimplePokemon, index: number, isLast: boolean) => {
    const isNotable = NOTABLE_SHINIES.some(n => n.id === pokemon.id);
    const isFavorite = favorites.has(pokemon.id);

    return (
      <motion.div
        key={pokemon.id}
        ref={isLast ? lastItemRef : null}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: (index % ITEMS_PER_PAGE) * 0.02 }}
        whileHover={{ y: -4 }}
        onClick={() => openPokemonModal(pokemon.id)}
        className="cursor-pointer"
      >
        <Container
          variant="elevated"
          className={cn(
            'p-4 relative overflow-hidden group',
            isNotable && 'ring-2 ring-amber-400'
          )}
        >
          {/* Notable Badge */}
          {isNotable && (
            <div className="absolute top-2 left-2 z-10">
              <span className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                <FaStar className="w-3 h-3" />
                Notable
              </span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(pokemon.id);
            }}
            className={cn(
              'absolute top-2 right-2 z-10 p-2 rounded-full transition-colors',
              isFavorite
                ? 'bg-pink-500 text-white'
                : 'bg-stone-100 dark:bg-stone-700 text-stone-400 hover:bg-pink-100 hover:text-pink-500'
            )}
          >
            <FaHeart className="w-4 h-4" />
          </button>

          {/* Pokemon Images */}
          <div className="flex justify-center gap-2">
            {/* Normal */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                alt={`${pokemon.name} normal`}
                className="w-full h-full object-contain pixelated"
                loading="lazy"
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-stone-400">
                Normal
              </span>
            </div>

            {/* Arrow */}
            <div className="flex items-center text-stone-300 dark:text-stone-600">
              <HiSparkles className="w-4 h-4 text-amber-400" />
            </div>

            {/* Shiny */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-200/30 to-pink-200/30 dark:from-amber-500/20 dark:to-pink-500/20 rounded-lg" />
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`}
                alt={`${pokemon.name} shiny`}
                className="w-full h-full object-contain pixelated relative z-10"
                loading="lazy"
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-amber-500 font-medium">
                Shiny
              </span>
            </div>
          </div>

          {/* Pokemon Info */}
          <div className="text-center mt-4">
            <p className="text-xs text-stone-400 mb-1">#{pokemon.id.toString().padStart(4, '0')}</p>
            <h3 className="font-semibold text-stone-800 dark:text-white truncate">
              {formatPokemonName(pokemon.name)}
            </h3>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors pointer-events-none" />
        </Container>
      </motion.div>
    );
  };

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Shiny Pokemon Gallery | DexTrends</title>
        <meta name="description" content="Browse and compare shiny Pokemon sprites. Discover rare color variations and notable shinies across all generations." />
      </Head>

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Shiny Gallery"
          description="Discover rare shiny Pokemon variations"
          breadcrumbs={[
            { title: 'Home', href: '/', icon: '🏠', isActive: false },
            { title: 'Pokemon', href: '/pokemon', icon: '📖', isActive: false },
            { title: 'Shiny Gallery', href: '/pokemon/shiny', icon: '✨', isActive: true },
          ]}
        >
          {/* Random Button */}
          <motion.button
            onClick={showRandomShiny}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-pink-500 text-white rounded-xl font-medium shadow-lg"
          >
            <FaRandom className="w-4 h-4" />
            Random Shiny
          </motion.button>
        </PageHeader>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Notable Shinies Showcase */}
        <Container variant="gradient" className="p-4 sm:p-6 mb-6">
          <h3 className="font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
            <FaStar className="text-amber-500" />
            Notable Shinies
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {NOTABLE_SHINIES.map(notable => (
              <motion.button
                key={notable.id}
                onClick={() => openPokemonModal(notable.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 flex flex-col items-center gap-2 p-3 bg-white dark:bg-stone-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <img
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${notable.id}.png`}
                    alt={notable.name}
                    className="w-16 h-16 object-contain pixelated"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent rounded-full" />
                </div>
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  {notable.name}
                </span>
              </motion.button>
            ))}
          </div>
        </Container>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search Pokemon by name or number..."
              className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* Generation Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-6">
          <motion.button
            onClick={() => {
              setSelectedGen(null);
              setPage(1);
            }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
              selectedGen === null
                ? 'bg-amber-500 text-white'
                : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
            )}
          >
            All Generations
          </motion.button>
          {GENERATIONS.map((gen, index) => (
            <motion.button
              key={gen.name}
              onClick={() => {
                setSelectedGen(selectedGen === index ? null : index);
                setPage(1);
              }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                selectedGen === index
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
              )}
            >
              {gen.name} ({gen.label})
            </motion.button>
          ))}
        </div>

        {/* Results Count */}
        <div className="text-sm text-stone-500 dark:text-stone-300 mb-4">
          Showing {paginatedPokemon.length} of {filteredPokemon.length} Pokemon
        </div>

        {/* Pokemon Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <Container key={i} variant="elevated" className="p-4 animate-pulse">
                <div className="flex justify-center gap-2 mb-4">
                  <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-lg" />
                  <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-lg" />
                </div>
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mx-auto" />
              </Container>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {paginatedPokemon.map((pokemon, index) =>
              renderPokemonCard(pokemon, index, index === paginatedPokemon.length - 1)
            )}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredPokemon.length === 0 && (
          <Container variant="elevated" className="p-8 text-center">
            <FaSearch className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-800 dark:text-white mb-2">
              No Pokemon found
            </h3>
            <p className="text-stone-500 dark:text-stone-300">
              Try adjusting your search criteria
            </p>
          </Container>
        )}
      </div>

      {/* Pokemon Modal */}
      <AnimatePresence>
        {selectedPokemon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedPokemon(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-stone-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 p-4 flex items-center justify-between z-10">
                <div>
                  <p className="text-sm text-stone-500">#{selectedPokemon.id.toString().padStart(4, '0')}</p>
                  <h2 className="text-xl font-bold text-stone-800 dark:text-white">
                    {formatPokemonName(selectedPokemon.name)}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(selectedPokemon.id)}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      favorites.has(selectedPokemon.id)
                        ? 'bg-pink-500 text-white'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-400'
                    )}
                  >
                    <FaHeart className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedPokemon(null)}
                    className="p-2 rounded-full bg-stone-100 dark:bg-stone-700 hover:bg-stone-200 dark:hover:bg-stone-600"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Side by Side Comparison */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Normal */}
                  <div className="text-center">
                    <div className="bg-stone-50 dark:bg-stone-700 rounded-2xl p-4 mb-3">
                      <img
                        src={getNormalSprite(selectedPokemon)}
                        alt={`${selectedPokemon.name} normal`}
                        className="w-40 h-40 mx-auto object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium text-stone-600 dark:text-stone-300">
                      Normal Form
                    </span>
                  </div>

                  {/* Shiny */}
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-amber-50 to-pink-50 dark:from-amber-900/30 dark:to-pink-900/30 rounded-2xl p-4 mb-3 ring-2 ring-amber-400">
                      <img
                        src={getShinySprite(selectedPokemon)}
                        alt={`${selectedPokemon.name} shiny`}
                        className="w-40 h-40 mx-auto object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                      <HiSparkles className="w-3 h-3" />
                      Shiny Form
                    </span>
                  </div>
                </div>

                {/* Types */}
                <div className="flex justify-center gap-2 mb-6">
                  {selectedPokemon.types.map(t => (
                    <TypeBadge key={t.type.name} type={t.type.name} size="md" />
                  ))}
                </div>

                {/* Notable Info */}
                {NOTABLE_SHINIES.find(n => n.id === selectedPokemon.id) && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-500 rounded-lg">
                        <FaStar className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-amber-700 dark:text-amber-400 mb-1">
                          Notable Shiny
                        </h4>
                        <p className="text-sm text-amber-600 dark:text-amber-500">
                          {NOTABLE_SHINIES.find(n => n.id === selectedPokemon.id)?.reason}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => {
                      const prevId = selectedPokemon.id > 1 ? selectedPokemon.id - 1 : 1025;
                      openPokemonModal(prevId);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-700 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                  >
                    <FaChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <button
                    onClick={() => router.push(`/pokedex/${selectedPokemon.id}`)}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    View Full Details
                  </button>
                  <button
                    onClick={() => {
                      const nextId = selectedPokemon.id < 1025 ? selectedPokemon.id + 1 : 1;
                      openPokemonModal(nextId);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 dark:bg-stone-700 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                  >
                    Next
                    <FaChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </FullBleedWrapper>
  );
};

export default ShinyGalleryPage;
