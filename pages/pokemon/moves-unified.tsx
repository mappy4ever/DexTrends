import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { NextPage } from "next";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { UnifiedDataTable, Column } from "@/components/unified/UnifiedDataTable";
import { fetchJSON } from "@/utils/unifiedFetch";
import { showdownQueries, PokemonLearnsetRecord } from "@/utils/supabase";
import { getPokemonIdFromName } from "@/utils/pokemonNameIdMap";
import logger from "@/utils/logger";
import { cn } from "@/utils/cn";

/**
 * Unified Moves Page - Production-ready responsive design
 * 
 * Features:
 * - One codebase for all devices
 * - Responsive data table (cards on mobile, table on desktop)
 * - Virtual scrolling for performance
 * - Smart column prioritization
 * - No duplicate code or conditional rendering
 */

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
  type: { name: string };
  damage_class: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  effect_chance: number | null;
  generation: { name: string };
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
}

const MovesPage: NextPage = () => {
  const router = useRouter();
  const [moves, setMoves] = useState<Move[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [expandedMoveId, setExpandedMoveId] = useState<number | null>(null);
  const [moveLearners, setMoveLearners] = useState<Record<number, PokemonLearnsetRecord[]>>({});
  const [learnersLoading, setLearnersLoading] = useState<Record<number, boolean>>({});

  // Load moves data
  useEffect(() => {
    const loadMoves = async () => {
      try {
        setLoading(true);
        
        // Get list of all moves
        const movesList = await fetchJSON<{ results: Array<{ name: string; url: string }> }>(
          'https://pokeapi.co/api/v2/move?limit=1000'
        );
        
        if (!movesList?.results) {
          throw new Error('Failed to fetch moves list');
        }
        
        // Create placeholders first for fast initial load
        const placeholderMoves: Move[] = movesList.results.map((m, index) => ({
          id: index + 1,
          name: m.name,
          type: 'normal',
          category: 'physical',
          power: null,
          accuracy: null,
          pp: 0,
          priority: 0,
          effect_chance: null,
          effect: '',
          short_effect: '',
          generation: 1
        }));
        
        setMoves(placeholderMoves);
        setLoading(false);
        
        // Load detailed data in batches
        const batchSize = 20;
        const allMoves = [...placeholderMoves];
        
        for (let i = 0; i < movesList.results.length; i += batchSize) {
          const batch = movesList.results.slice(i, i + batchSize);
          const promises = batch.map(async (move) => {
            try {
              const data = await fetchJSON<MoveApiResponse>(move.url);
              if (!data) return null;
              
              const englishEffect = data.effect_entries?.find(e => e.language.name === 'en');
              
              return {
                id: data.id,
                name: data.name,
                type: data.type.name,
                category: data.damage_class.name,
                power: data.power,
                accuracy: data.accuracy,
                pp: data.pp,
                priority: data.priority,
                effect_chance: data.effect_chance,
                effect: englishEffect?.effect || '',
                short_effect: englishEffect?.short_effect || '',
                generation: parseInt(data.generation.name.split('-')[1]) || 1
              };
            } catch (error) {
              logger.error('Failed to load move details', { move: move.name, error });
              return null;
            }
          });
          
          const batchResults = await Promise.all(promises);
          batchResults.forEach((result, index) => {
            if (result) {
              const moveIndex = i + index;
              if (moveIndex < allMoves.length) {
                allMoves[moveIndex] = result;
              }
            }
          });
          
          setMoves([...allMoves]);
          
          // Small delay to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        logger.info('All moves loaded successfully');
      } catch (error) {
        logger.error('Failed to load moves', { error });
        setLoading(false);
      }
    };
    
    loadMoves();
  }, []);

  // Load Pokemon that can learn a move
  const loadMoveLearners = useCallback(async (moveId: number, moveName: string) => {
    if (moveLearners[moveId] || learnersLoading[moveId]) return;
    
    setLearnersLoading(prev => ({ ...prev, [moveId]: true }));
    
    try {
      const learners = await showdownQueries.getPokemonByMove(moveName);
      setMoveLearners(prev => ({ ...prev, [moveId]: learners || [] }));
    } catch (error) {
      logger.error('Failed to load move learners', { moveId, moveName, error });
      setMoveLearners(prev => ({ ...prev, [moveId]: [] }));
    } finally {
      setLearnersLoading(prev => ({ ...prev, [moveId]: false }));
    }
  }, [moveLearners, learnersLoading]);

  // Handle move expansion
  const handleToggleExpand = useCallback((moveId: number, moveName: string) => {
    setExpandedMoveId(prev => prev === moveId ? null : moveId);
    if (expandedMoveId !== moveId) {
      loadMoveLearners(moveId, moveName);
    }
  }, [expandedMoveId, loadMoveLearners]);


  // Filter moves
  const filteredMoves = useMemo(() => {
    let filtered = [...moves];
    
    if (selectedType) {
      filtered = filtered.filter(m => m.type === selectedType);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }
    
    return filtered;
  }, [moves, selectedType, selectedCategory]);

  // Define table columns
  const columns: Column<Move>[] = [
    {
      key: 'name',
      label: 'Move',
      sortable: true,
      priority: 'primary',
      renderCell: (move) => (
        <Link href={`/pokemon/moves/${move.name}`}>
          <span className="font-semibold text-amber-600 dark:text-amber-400 hover:underline capitalize">
            {move.name.replace(/-/g, ' ')}
          </span>
        </Link>
      )
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      priority: 'primary',
      width: '120px',
      renderCell: (move) => <TypeBadge type={move.type} size="sm" />
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      priority: 'secondary',
      width: '120px',
      renderCell: (move) => (
        <CategoryIcon category={move.category} size={18} showLabel={true} />
      )
    },
    {
      key: 'power',
      label: 'Power',
      sortable: true,
      priority: 'secondary',
      width: '80px',
      align: 'center',
      renderCell: (move) => (
        <span className={cn(
          'font-medium',
          move.power && move.power >= 100 && 'text-red-600 dark:text-red-400',
          move.power && move.power >= 80 && move.power < 100 && 'text-orange-600 dark:text-orange-400'
        )}>
          {move.power || '-'}
        </span>
      )
    },
    {
      key: 'accuracy',
      label: 'Acc',
      mobileLabel: 'Acc',
      sortable: true,
      priority: 'secondary',
      width: '80px',
      align: 'center',
      renderCell: (move) => (
        <span className={cn(
          'text-sm',
          move.accuracy === 100 && 'text-green-600 dark:text-green-400',
          move.accuracy && move.accuracy < 100 && 'text-yellow-600 dark:text-yellow-400'
        )}>
          {move.accuracy ? `${move.accuracy}%` : '-'}
        </span>
      )
    },
    {
      key: 'pp',
      label: 'PP',
      sortable: true,
      priority: 'detail',
      width: '60px',
      align: 'center'
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      priority: 'detail',
      width: '80px',
      align: 'center',
      renderCell: (move) => (
        <span className={cn(
          'text-sm font-medium',
          move.priority > 0 && 'text-green-600 dark:text-green-400',
          move.priority < 0 && 'text-red-600 dark:text-red-400'
        )}>
          {move.priority > 0 ? `+${move.priority}` : move.priority}
        </span>
      )
    },
    {
      key: 'short_effect',
      label: 'Effect',
      priority: 'detail',
      renderCell: (move) => (
        <span className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2">
          {move.short_effect || move.effect || 'No description available'}
        </span>
      )
    }
  ];

  // Render expanded content
  const renderExpanded = useCallback((move: Move) => {
    const learners = moveLearners[move.id] || [];
    const isLoading = learnersLoading[move.id];
    
    return (
      <div className="space-y-4">
        {/* Full effect description */}
        <div>
          <h4 className="font-semibold text-sm mb-2 text-stone-700 dark:text-stone-300">Full Description</h4>
          <p className="text-sm text-stone-600 dark:text-stone-300">
            {move.effect || move.short_effect || 'No description available'}
          </p>
        </div>
        
        {/* Move details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-stone-500 dark:text-stone-300">Generation:</span>
            <span className="ml-2 font-medium">Gen {move.generation}</span>
          </div>
          {move.effect_chance && (
            <div>
              <span className="text-stone-500 dark:text-stone-300">Effect Chance:</span>
              <span className="ml-2 font-medium">{move.effect_chance}%</span>
            </div>
          )}
        </div>
        
        {/* Pokemon that can learn this move */}
        <div>
          <h4 className="font-semibold text-sm mb-2 text-stone-700 dark:text-stone-300">
            Pokémon that can learn {move.name.replace(/-/g, ' ')}
          </h4>
          {isLoading ? (
            <div className="text-sm text-stone-500">Loading...</div>
          ) : learners.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {learners.slice(0, 20).map(learner => {
                const pokemonId = getPokemonIdFromName(learner.pokemon_id);
                return (
                  <Link
                    key={learner.pokemon_id}
                    href={`/pokedex/${pokemonId || learner.pokemon_id}`}
                    className="px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors capitalize"
                  >
                    {learner.pokemon_id.replace(/-/g, ' ')}
                  </Link>
                );
              })}
              {learners.length > 20 && (
                <span className="px-3 py-1 text-sm text-stone-500">
                  +{learners.length - 20} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-sm text-stone-500">No Pokémon data available</p>
          )}
        </div>
      </div>
    );
  }, [moveLearners, learnersLoading]);

  return (
    <>
      <Head>
        <title>Pokémon Moves - DexTrends</title>
        <meta name="description" content="Browse all Pokémon moves with details on power, accuracy, type, and effects" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Pokémon Moves
            </h1>
            <p className="text-stone-600 dark:text-stone-300">
              {filteredMoves.length} moves available
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6 bg-white/80 dark:bg-stone-800/80 backdrop-blur rounded-2xl p-4 shadow-lg">
            <div className="flex flex-wrap gap-4">
              {/* Type Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Types</option>
                  {['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'].map(type => (
                    <option key={type} value={type} className="capitalize">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  <option value="physical">Physical</option>
                  <option value="special">Special</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Unified Data Table */}
          <UnifiedDataTable
            data={filteredMoves}
            columns={columns}
            getItemKey={(move) => move.id}
            onItemClick={(move) => router.push(`/pokemon/moves/${move.name}`)}
            loading={loading}
            searchable={true}
            searchKeys={['name', 'effect', 'short_effect']}
            searchPlaceholder="Search moves..."
            defaultSort="name"
            expandable={true}
            renderExpanded={renderExpanded}
            virtualize={true}
            striped={true}
            hover={true}
            className="mt-6"
          />
        </div>
      </div>
    </>
  );
};

export default MovesPage;