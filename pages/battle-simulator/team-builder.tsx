import React, { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import { Container } from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import { TypeBadge } from '../../components/ui/TypeBadge';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY, TRANSITION } from '../../components/ui/design-system/glass-constants';
import { fetchJSON } from '../../utils/unifiedFetch';
import { API_CONFIG } from '../../config/api';
import { IoAdd, IoClose, IoSearch, IoShieldCheckmark, IoFlash, IoSwapHorizontal, IoTrash, IoDownload, IoShareSocial } from 'react-icons/io5';

// ===========================================
// TYPES
// ===========================================

interface TeamMember {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

interface TeamSlot {
  index: number;
  pokemon: TeamMember | null;
}

// ===========================================
// POKEMON SEARCH MODAL
// ===========================================

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pokemon: TeamMember) => void;
  excludeIds: number[];
}

function PokemonSearchModal({ isOpen, onClose, onSelect, excludeIds }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ name: string; url: string }>>([]);
  const [allPokemon, setAllPokemon] = useState<Array<{ name: string; url: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPokemon = async () => {
      try {
        const data = await fetchJSON<{ results: Array<{ name: string; url: string }> }>(
          `${API_CONFIG.POKEAPI_BASE_URL}/pokemon?limit=1025`
        );
        if (data?.results) {
          setAllPokemon(data.results);
          setResults(data.results.slice(0, 20));
        }
      } catch (err) {
        console.error('Failed to load Pokemon list:', err);
      }
    };
    if (isOpen) loadPokemon();
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(allPokemon.slice(0, 20));
      return;
    }
    const filtered = allPokemon.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 20);
    setResults(filtered);
  }, [query, allPokemon]);

  const handleSelect = async (pokemon: { name: string; url: string }) => {
    setLoading(true);
    try {
      const data = await fetchJSON<any>(pokemon.url);
      if (data) {
        onSelect({
          id: data.id,
          name: data.name,
          sprite: data.sprites?.front_default || '',
          types: data.types?.map((t: any) => t.type.name) || [],
        });
        onClose();
      }
    } catch (err) {
      console.error('Failed to load Pokemon:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-stone-200 dark:border-stone-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn(TYPOGRAPHY.heading.h4)}>Add Pokemon</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800">
              <IoClose className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Pokemon..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((pokemon) => {
                const id = parseInt(pokemon.url.split('/').filter(Boolean).pop() || '0');
                const isExcluded = excludeIds.includes(id);
                return (
                  <button
                    key={pokemon.name}
                    onClick={() => !isExcluded && handleSelect(pokemon)}
                    disabled={isExcluded}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                      isExcluded ? 'opacity-50 cursor-not-allowed' : 'hover:bg-stone-100 dark:hover:bg-stone-800'
                    )}
                  >
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                      alt={pokemon.name}
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                    <span className="font-medium capitalize">{pokemon.name.replace(/-/g, ' ')}</span>
                    <span className="text-sm text-stone-400">#{String(id).padStart(3, '0')}</span>
                    {isExcluded && <span className="ml-auto text-xs text-stone-400">(In team)</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ===========================================
// TEAM SLOT COMPONENT
// ===========================================

interface TeamSlotProps {
  slot: TeamSlot;
  onAdd: () => void;
  onRemove: () => void;
}

function TeamSlotCard({ slot, onAdd, onRemove }: TeamSlotProps) {
  const { pokemon } = slot;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'relative aspect-square rounded-2xl border-2 border-dashed transition-all',
        pokemon
          ? 'border-transparent bg-white dark:bg-stone-800 shadow-lg'
          : 'border-stone-300 dark:border-stone-600 bg-stone-50 dark:bg-stone-800/50 hover:border-amber-400 dark:hover:border-amber-500 cursor-pointer'
      )}
      onClick={() => !pokemon && onAdd()}
    >
      {pokemon ? (
        <div className="h-full flex flex-col items-center justify-center p-3">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
          >
            <IoClose className="w-4 h-4" />
          </button>
          <Image
            src={pokemon.sprite}
            alt={pokemon.name}
            width={80}
            height={80}
            className="w-20 h-20"
          />
          <p className="font-semibold capitalize text-sm text-center mt-1 text-stone-900 dark:text-white">
            {pokemon.name.replace(/-/g, ' ')}
          </p>
          <div className="flex gap-1 mt-1">
            {pokemon.types.map(type => (
              <TypeBadge key={type} type={type} size="xs" />
            ))}
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-500">
          <div className="w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-700 flex items-center justify-center mb-2">
            <IoAdd className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">Slot {slot.index + 1}</span>
        </div>
      )}
    </motion.div>
  );
}

// ===========================================
// TEAM ANALYSIS
// ===========================================

interface TeamAnalysisProps {
  team: TeamMember[];
}

function TeamAnalysis({ team }: TeamAnalysisProps) {
  const allTypes = team.flatMap(p => p.types);
  const uniqueTypes = [...new Set(allTypes)];

  const typeCount: Record<string, number> = {};
  allTypes.forEach(type => {
    typeCount[type] = (typeCount[type] || 0) + 1;
  });

  if (team.length === 0) return null;

  return (
    <Container variant="elevated" className="p-4">
      <h3 className={cn(TYPOGRAPHY.label, 'mb-3')}>TEAM COVERAGE</h3>
      <div className="flex flex-wrap gap-2">
        {uniqueTypes.map(type => (
          <div key={type} className="flex items-center gap-1.5">
            <TypeBadge type={type} size="sm" />
            <span className="text-xs font-medium text-stone-500">×{typeCount[type]}</span>
          </div>
        ))}
      </div>
      {team.length < 6 && (
        <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
          Add {6 - team.length} more Pokemon to complete your team
        </p>
      )}
    </Container>
  );
}

// ===========================================
// MAIN PAGE
// ===========================================

const TeamBuilderPage: NextPage = () => {
  const [slots, setSlots] = useState<TeamSlot[]>(
    Array.from({ length: 6 }, (_, i) => ({ index: i, pokemon: null }))
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  const team = slots.filter(s => s.pokemon).map(s => s.pokemon!);
  const excludeIds = team.map(p => p.id);

  const handleAddPokemon = (slotIndex: number) => {
    setActiveSlot(slotIndex);
    setSearchOpen(true);
  };

  const handleSelectPokemon = (pokemon: TeamMember) => {
    setSlots(prev => prev.map((slot, i) =>
      i === activeSlot ? { ...slot, pokemon } : slot
    ));
  };

  const handleRemovePokemon = (slotIndex: number) => {
    setSlots(prev => prev.map((slot, i) =>
      i === slotIndex ? { ...slot, pokemon: null } : slot
    ));
  };

  const clearTeam = () => {
    setSlots(Array.from({ length: 6 }, (_, i) => ({ index: i, pokemon: null })));
  };

  return (
    <>
      <Head>
        <title>Team Builder - DexTrends</title>
        <meta name="description" content="Build and analyze your Pokemon team" />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <PageHeader
            title="Team Builder"
            description="Build your perfect Pokemon team with type coverage analysis"
            breadcrumbs={[
              { title: 'Home', href: '/', icon: '🏠', isActive: false },
              { title: 'Battle Tools', href: '/battle-simulator', icon: '⚔️', isActive: false },
              { title: 'Team Builder', href: '/battle-simulator/team-builder', icon: '👥', isActive: true },
            ]}
          >
            <div className="flex gap-2">
              {team.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearTeam} icon={<IoTrash className="w-4 h-4" />}>
                  Clear
                </Button>
              )}
            </div>
          </PageHeader>

          {/* Team Grid */}
          <Container variant="default" className="p-4 md:p-6 mb-6">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
              <AnimatePresence mode="popLayout">
                {slots.map((slot) => (
                  <TeamSlotCard
                    key={slot.index}
                    slot={slot}
                    onAdd={() => handleAddPokemon(slot.index)}
                    onRemove={() => handleRemovePokemon(slot.index)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </Container>

          {/* Team Analysis */}
          <TeamAnalysis team={team} />

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/battle-simulator/type-matchup">
              <Button variant="secondary" icon={<IoShieldCheckmark className="w-4 h-4" />}>
                Type Calculator
              </Button>
            </Link>
            <Link href="/battle-simulator/damage-calc">
              <Button variant="secondary" icon={<IoFlash className="w-4 h-4" />}>
                Damage Calc
              </Button>
            </Link>
          </div>
        </div>
      </FullBleedWrapper>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <PokemonSearchModal
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
            onSelect={handleSelectPokemon}
            excludeIds={excludeIds}
          />
        )}
      </AnimatePresence>
    </>
  );
};

(TeamBuilderPage as any).fullBleed = true;

export default TeamBuilderPage;
