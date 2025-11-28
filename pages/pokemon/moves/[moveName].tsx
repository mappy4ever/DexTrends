import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import { motion } from 'framer-motion';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import { GlassContainer } from '@/components/ui/design-system';
import { FullBleedWrapper } from '@/components/ui/FullBleedWrapper';
import StyledBackButton from '@/components/ui/StyledBackButton';
import { fetchJSON } from '@/utils/unifiedFetch';
import { showdownQueries, MoveCompetitiveDataRecord } from '@/utils/supabase';
import { cn } from '@/utils/cn';
import { typeColors } from '@/utils/unifiedTypeColors';
import { FaChevronLeft, FaGamepad, FaStar, FaUsers } from 'react-icons/fa';
import { BsLightning, BsShield, BsSpeedometer } from 'react-icons/bs';
import { GiOnTarget } from 'react-icons/gi';
import logger from '@/utils/logger';

interface MoveDetailPageProps {
  moveName: string;
}

interface MoveApiData {
  id: number;
  name: string;
  type: { name: string };
  damage_class: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  effect_chance: number | null;
  effect_entries: Array<{
    effect: string;
    short_effect: string;
    language: { name: string };
  }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
    version_group: { name: string };
  }>;
  learned_by_pokemon: Array<{ name: string; url: string }>;
  generation: { name: string };
}

const MoveDetailPage: React.FC<MoveDetailPageProps> = ({ moveName }) => {
  const router = useRouter();
  const [moveData, setMoveData] = useState<MoveApiData | null>(null);
  const [competitiveData, setCompetitiveData] = useState<MoveCompetitiveDataRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMoveData = async () => {
      if (!moveName || typeof moveName !== 'string') return;
      
      try {
        setLoading(true);
        setError(null);

        // Fetch from PokeAPI
        const apiData = await fetchJSON<MoveApiData>(`https://pokeapi.co/api/v2/move/${moveName}`);
        if (apiData) {
          setMoveData(apiData);
        }

        // Fetch competitive data if available
        if (showdownQueries && typeof showdownQueries.getMoveData === 'function') {
          try {
            const compData = await showdownQueries.getMoveData(moveName);
            if (compData) {
              setCompetitiveData(compData);
            }
          } catch (err) {
            logger.error('Failed to fetch competitive data:', { error: err instanceof Error ? err.message : String(err) });
          }
        }
      } catch (err) {
        logger.error('Failed to fetch move data:', { error: err instanceof Error ? err.message : String(err) });
        setError('Failed to load move data');
      } finally {
        setLoading(false);
      }
    };

    fetchMoveData();
  }, [moveName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error || !moveData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Move</h1>
          <p className="text-stone-600 dark:text-stone-400 mb-4">{error || 'Move not found'}</p>
          <StyledBackButton 
            text="Back to Moves" 
            onClick={() => router.push('/pokemon/moves')} 
          />
        </div>
      </div>
    );
  }

  const displayName = moveData.name.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const englishEffect = moveData.effect_entries.find(e => e.language.name === 'en');
  const englishFlavor = moveData.flavor_text_entries.find(f => f.language.name === 'en');
  const moveType = competitiveData?.type || moveData.type.name;
  const moveCategory = competitiveData?.category || moveData.damage_class.name;
  const basePower = competitiveData?.power || moveData.power;
  const accuracy = competitiveData?.accuracy || moveData.accuracy;
  const priority = competitiveData?.priority ?? moveData.priority;
  const typeColor = typeColors[moveType]?.bg || 'bg-stone-600';
  
  // Get generation number
  const generation = moveData.generation.name.replace('generation-', '').toUpperCase();

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>{displayName} - Move Details | DexTrends</title>
        <meta name="description" content={`Details about the Pokemon move ${displayName}`} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <StyledBackButton 
            text="Back to Moves" 
            onClick={() => router.back()} 
          />
        </div>

        {/* Move Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassContainer variant="dark" className="p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{displayName}</h1>
                <div className="flex items-center gap-3">
                  <TypeBadge type={moveType} size="lg" />
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={moveCategory as 'physical' | 'special' | 'status' | null} size={24} />
                    <span className="text-sm font-medium capitalize">{moveCategory}</span>
                  </div>
                  <span className="text-sm text-stone-500 dark:text-stone-400">Gen {generation}</span>
                </div>
              </div>
              
              {/* Move ID */}
              <div className="text-right">
                <div className="text-sm text-stone-500 dark:text-stone-400">Move ID</div>
                <div className="text-2xl font-bold">#{moveData.id}</div>
              </div>
            </div>
          </GlassContainer>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Stats and Description */}
          <div className="space-y-6">
            {/* Battle Stats */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <GlassContainer variant="medium" className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BsLightning className="text-yellow-500" />
                  Battle Statistics
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4">
                    <div className="text-sm text-stone-500 dark:text-stone-400 mb-1">Power</div>
                    <div className="text-2xl font-bold">
                      {basePower || '—'}
                    </div>
                  </div>
                  
                  <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4">
                    <div className="text-sm text-stone-500 dark:text-stone-400 mb-1">Accuracy</div>
                    <div className="text-2xl font-bold">
                      {accuracy ? `${accuracy}%` : '—'}
                    </div>
                  </div>
                  
                  <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4">
                    <div className="text-sm text-stone-500 dark:text-stone-400 mb-1">PP</div>
                    <div className="text-2xl font-bold">{moveData.pp}</div>
                  </div>
                  
                  <div className="bg-stone-100 dark:bg-stone-800 rounded-lg p-4">
                    <div className="text-sm text-stone-500 dark:text-stone-400 mb-1">Priority</div>
                    <div className="text-2xl font-bold">
                      {priority > 0 ? `+${priority}` : priority}
                    </div>
                  </div>
                </div>

                {moveData.effect_chance && (
                  <div className="mt-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Effect Chance: {moveData.effect_chance}%
                    </div>
                  </div>
                )}
              </GlassContainer>
            </motion.div>

            {/* Effect Description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassContainer variant="medium" className="p-6">
                <h2 className="text-xl font-bold mb-4">Effect</h2>
                <p className="text-stone-700 dark:text-stone-300 leading-relaxed">
                  {englishEffect?.effect || englishFlavor?.flavor_text || 'No effect description available.'}
                </p>
                
                {englishEffect?.short_effect && englishEffect.short_effect !== englishEffect.effect && (
                  <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                    <h3 className="font-semibold mb-2">Short Description</h3>
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {englishEffect.short_effect}
                    </p>
                  </div>
                )}
              </GlassContainer>
            </motion.div>

            {/* Competitive Data */}
            {competitiveData && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <GlassContainer variant="medium" className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <FaStar className="text-yellow-500" />
                    Competitive Information
                  </h2>
                  
                  {/* Flags */}
                  {competitiveData.flags && competitiveData.flags.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Move Properties</h3>
                      <div className="flex flex-wrap gap-2">
                        {competitiveData.flags.map(flag => (
                          <span 
                            key={flag}
                            className="text-xs bg-stone-200 dark:bg-stone-700 px-3 py-1 rounded-full"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Secondary Effects */}
                  {competitiveData.secondary_effect && (
                    <div>
                      <h3 className="font-semibold mb-2">Secondary Effects</h3>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        {formatSecondaryEffects(competitiveData.secondary_effect)}
                      </p>
                    </div>
                  )}
                </GlassContainer>
              </motion.div>
            )}
          </div>

          {/* Right Column - Pokemon that learn this move */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassContainer variant="medium" className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FaUsers className="text-amber-500" />
                Pokémon that can learn {displayName}
              </h2>
              
              <div className="text-sm text-stone-600 dark:text-stone-400 mb-4">
                {moveData.learned_by_pokemon.length} Pokémon can learn this move
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {moveData.learned_by_pokemon.slice(0, 30).map(pokemon => (
                    <Link
                      key={pokemon.name}
                      href={`/pokedex/${pokemon.name}`}
                      className="bg-stone-100 dark:bg-stone-800 rounded-lg p-3 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors text-center"
                    >
                      <span className="text-sm font-medium capitalize">
                        {pokemon.name.replace(/-/g, ' ')}
                      </span>
                    </Link>
                  ))}
                </div>
                
                {moveData.learned_by_pokemon.length > 30 && (
                  <div className="mt-4 text-center text-sm text-stone-500 dark:text-stone-400">
                    And {moveData.learned_by_pokemon.length - 30} more...
                  </div>
                )}
              </div>
            </GlassContainer>
          </motion.div>
        </div>

        {/* Related Moves Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <GlassContainer variant="medium" className="p-6">
            <h2 className="text-xl font-bold mb-4">Quick Navigation</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/pokemon/moves"
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FaGamepad />
                Browse All Moves
              </Link>
              <Link
                href={`/pokemon/moves?type=${moveType}`}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors",
                  typeColor,
                  "hover:opacity-90"
                )}
              >
                View {moveType.charAt(0).toUpperCase() + moveType.slice(1)} Moves
              </Link>
            </div>
          </GlassContainer>
        </motion.div>
      </div>
    </FullBleedWrapper>
  );
};

// Helper function for formatting secondary effects
function formatSecondaryEffects(effects: Record<string, any>): string {
  const parts: string[] = [];
  
  if (effects.chance) {
    parts.push(`${effects.chance}% chance to`);
  }
  
  if (effects.status) {
    parts.push(`inflict ${effects.status}`);
  }
  
  if (effects.volatileStatus) {
    parts.push(`cause ${effects.volatileStatus}`);
  }
  
  if (effects.boosts) {
    const boostStrings = Object.entries(effects.boosts).map(([stat, value]) => {
      const numValue = value as number;
      const direction = numValue > 0 ? 'raise' : 'lower';
      return `${direction} ${stat} by ${Math.abs(numValue)}`;
    });
    parts.push(boostStrings.join(' and '));
  }
  
  return parts.join(' ') || 'None';
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { moveName } = context.params as { moveName: string };
  
  return {
    props: {
      moveName,
    },
  };
};

export default MoveDetailPage;