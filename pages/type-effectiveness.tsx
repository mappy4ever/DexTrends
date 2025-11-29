import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { createGlassStyle, TYPOGRAPHY } from '../components/ui/design-system/glass-constants';
import { UnifiedSearchBar, EmptyStateGlass, LoadingStateGlass } from '../components/ui/glass-components';
import { GradientButton, CircularButton } from '../components/ui/design-system';
import { TypeBadge } from '../components/ui/TypeBadge';
import { PageHeader } from '../components/ui/BreadcrumbNavigation';
import { Container } from '../components/ui/Container';
import Button from '../components/ui/Button';
import {
  calculateTypeEffectiveness,
  getTypeMatchups,
  analyzeTeamTypeSynergy,
  POKEMON_TYPES,
  getTypeColor,
  getEffectivenessLabel,
  loadTypeChart
} from '../utils/typeEffectiveness';
import logger from '../utils/logger';
import { fetchJSON } from '../utils/unifiedFetch';
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { cn } from '@/utils/cn';
import { IoCalculator, IoGrid, IoGitNetwork } from 'react-icons/io5';

interface TypeDetails {
  name: string;
  damageRelations: {
    double_damage_from?: Array<{ name: string }>;
    double_damage_to?: Array<{ name: string }>;
    half_damage_from?: Array<{ name: string }>;
    half_damage_to?: Array<{ name: string }>;
    no_damage_from?: Array<{ name: string }>;
    no_damage_to?: Array<{ name: string }>;
  };
}

/**
 * Unified Type Effectiveness Page
 * 
 * Features:
 * - Single responsive component for all viewports
 * - No conditional mobile/desktop rendering
 * - Intelligent layout adaptation
 * - Touch-optimized interactions
 * - Performant type chart rendering
 */
const UnifiedTypeEffectivenessPage = () => {
  const router = useRouter();
  const [selectedAttacker, setSelectedAttacker] = useState<string>('');
  const [selectedDefender1, setSelectedDefender1] = useState<string>('');
  const [selectedDefender2, setSelectedDefender2] = useState<string>('');
  const [teamTypes, setTeamTypes] = useState<string[][]>([]);
  const [typeDetails, setTypeDetails] = useState<Record<string, TypeDetails>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [viewMode, setViewMode] = useState<'calculator' | 'chart' | 'team'>('calculator');

  // Glass morphism styles
  const glassStyle = createGlassStyle({});
  const glassButtonStyle = createGlassStyle({ opacity: 'subtle', blur: 'md' });

  // Initialize type effectiveness data
  const init = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsRetrying(false);
      
      // Load type chart first
      await loadTypeChart();
      
      // Load type details from PokeAPI
      const details: Record<string, TypeDetails> = {};
      let successCount = 0;
      
      const typePromises = POKEMON_TYPES.map(async (type) => {
        try {
          const data = await fetchJSON<any>(`https://pokeapi.co/api/v2/type/${type}`, {
            useCache: true,
            cacheTime: 30 * 60 * 1000, // Cache for 30 minutes
            timeout: 8000,
            retries: 2
          });
          
          if (data && data.damage_relations) {
            details[type] = {
              name: type,
              damageRelations: data.damage_relations
            };
            successCount++;
            return { type, success: true };
          }
          return { type, success: false, error: 'No damage relations data' };
        } catch (error) {
          logger.error(`Failed to load type ${type}`, { error, type });
          return { type, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });
      
      const results = await Promise.all(typePromises);
      const failedTypes = results.filter(r => !r.success);
      
      // If too many types failed to load, show error
      if (successCount < POKEMON_TYPES.length * 0.8) {
        throw new Error(`Failed to load ${failedTypes.length} out of ${POKEMON_TYPES.length} Pokemon types`);
      }
      
      if (failedTypes.length > 0) {
        logger.warn('Some types failed to load but continuing', {
          failedCount: failedTypes.length,
          successCount,
          failedTypes: failedTypes.map(f => f.type)
        });
      }
      
      setTypeDetails(details);
      
    } catch (err) {
      let errorMessage = "Failed to load type effectiveness data.";
      let shouldRetry = false;
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        errorMessage = "Network connection failed. Please check your internet connection.";
        shouldRetry = true;
      } else if (err instanceof Error) {
        if (err.message.includes('timeout') || err.message.includes('TIMEOUT')) {
          errorMessage = "Request timed out. The Pokemon API is taking too long to respond.";
          shouldRetry = true;
        } else if (err.message.includes('500') || err.message.includes('502') || err.message.includes('503')) {
          errorMessage = "Pokemon API server error. Please try again in a few minutes.";
          shouldRetry = true;
        }
      }
      
      logger.error("Error initializing type effectiveness data", { 
        error: err, 
        errorMessage, 
        shouldRetry, 
        retryCount,
        timestamp: new Date().toISOString()
      });
      
      // Attempt retry for network-related errors
      if (shouldRetry && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          retryInit(3 - retryCount);
        }, 2000 * (retryCount + 1));
        return;
      }
      
      setError(errorMessage);
      setRetryCount(0);
      
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  // Retry logic helper
  const retryInit = async (retries = 3, delay = 1000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        if (attempt > 0) {
          setIsRetrying(true);
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
        await init();
        return;
      } catch (error) {
        logger.warn(`Initialization attempt ${attempt + 1} failed`, { error, attempt });
        if (attempt === retries - 1) {
          throw error;
        }
      }
    }
  };

  // Initial load on mount
  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateDamage = () => {
    if (!selectedAttacker || !selectedDefender1) return null;
    
    const defenderTypes = selectedDefender2 && selectedDefender2 !== selectedDefender1
      ? [selectedDefender1, selectedDefender2]
      : [selectedDefender1];
    
    return calculateTypeEffectiveness(selectedAttacker, defenderTypes);
  };

  const getEffectivenessColor = (multiplier: number) => {
    if (multiplier === 0) return 'bg-stone-800 dark:bg-stone-600';
    if (multiplier === 0.25) return 'bg-red-700 dark:bg-red-600';
    if (multiplier === 0.5) return 'bg-orange-600 dark:bg-orange-500';
    if (multiplier === 2) return 'bg-green-600 dark:bg-green-500';
    if (multiplier === 4) return 'bg-amber-700 dark:bg-amber-500';
    return 'bg-stone-500 dark:bg-stone-400';
  };

  const getEffectivenessText = (multiplier: number) => {
    if (multiplier === 0) return 'No Effect';
    if (multiplier === 0.25) return 'Very Weak';
    if (multiplier === 0.5) return 'Not Very Effective';
    if (multiplier === 2) return 'Super Effective';
    if (multiplier === 4) return 'Extremely Effective';
    return 'Normal Damage';
  };

  // Type selector grid - responsive columns
  const renderTypeGrid = (
    types: string[],
    selected: string | null,
    onSelect: (type: string) => void,
    allowNone?: boolean
  ) => (
    <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 lg:grid-cols-6 gap-1.5 sm:gap-2">
      {allowNone && (
        <motion.button
          onClick={() => onSelect('')}
          className={cn(
            'relative min-h-[44px] p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl transition-all touch-target',
            !selected
              ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-white dark:ring-offset-stone-900 ring-stone-400 shadow-lg'
              : 'hover:scale-105 hover:shadow-md bg-stone-100 dark:bg-stone-800'
          )}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-[10px] sm:text-xs font-medium">None</span>
        </motion.button>
      )}
      {types.map(type => (
        <motion.button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            'relative min-h-[44px] p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl transition-all touch-target',
            selected === type
              ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-white dark:ring-offset-stone-900 shadow-lg scale-105'
              : 'hover:scale-105 hover:shadow-md'
          )}
          style={{
            background: selected === type
              ? `linear-gradient(135deg, ${getTypeColor(type)}30, ${getTypeColor(type)}10)`
              : 'rgba(255, 255, 255, 0.5)',
            borderColor: selected === type ? getTypeColor(type) : 'transparent',
            '--tw-ring-color': getTypeColor(type)
          } as React.CSSProperties}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <TypeBadge type={type} size="sm" />
        </motion.button>
      ))}
    </div>
  );

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Type Effectiveness Calculator | DexTrends</title>
        <meta name="description" content="Master Pokemon type matchups with our interactive type effectiveness calculator and team analyzer" />
      </Head>

      {/* Header with PageHeader */}
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Type Effectiveness"
          description="Calculate type matchups and analyze team coverage"
          breadcrumbs={[
            { title: 'Home', href: '/', icon: '🏠', isActive: false },
            { title: 'Battle Tools', href: '/battle-simulator', icon: '⚔️', isActive: false },
            { title: 'Type Calculator', href: '/type-effectiveness', icon: '🎯', isActive: true },
          ]}
        >
          {/* View Mode Tabs */}
          <div className="flex gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-full">
            <button
              onClick={() => setViewMode('calculator')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                viewMode === 'calculator'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              )}
            >
              <IoCalculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculator</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                viewMode === 'chart'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              )}
            >
              <IoGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Chart</span>
            </button>
            <button
              onClick={() => setViewMode('team')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5',
                viewMode === 'team'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              )}
            >
              <IoGitNetwork className="w-4 h-4" />
              <span className="hidden sm:inline">Team</span>
            </button>
          </div>
        </PageHeader>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
        {/* Loading and Error States */}
        {loading ? (
          <LoadingStateGlass />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <div className={cn(
              'max-w-md mx-auto p-6 sm:p-8 rounded-xl sm:rounded-xl',
              'border border-red-200 dark:border-red-800',
              glassStyle
            )} 
            style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))' }}>
              <h3 className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mb-3">
                Unable to Load Type Data
              </h3>
              <p className="text-sm text-red-500 dark:text-red-400 mb-4">{error}</p>
              <div className="flex gap-3 justify-center">
                <GradientButton
                  onClick={() => window.location.reload()}
                  variant="primary"
                  size="sm"
                >
                  Refresh Page
                </GradientButton>
                <CircularButton
                  onClick={() => router.push('/pokemon')}
                  variant="secondary"
                  size="sm"
                >
                  Go Back
                </CircularButton>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {/* View Mode Selector - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="flex justify-center mb-6 sm:mb-8"
            >
              <motion.div className={cn(
                'inline-flex gap-1 p-1 sm:p-1.5 rounded-full',
                glassStyle
              )}>
                {[
                  { key: 'calculator', label: 'Calculator' },
                  { key: 'chart', label: 'Chart' },
                  { key: 'team', label: 'Team' }
                ].map(({ key, label }) => (
                  <motion.button
                    key={key}
                    onClick={() => setViewMode(key as any)}
                    className={cn(
                      'min-h-[44px] px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-xs sm:text-sm touch-target',
                      'transition-all duration-200',
                      viewMode === key
                        ? 'bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 text-white shadow-xl'
                        : cn('text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white', glassButtonStyle)
                    )}
                    whileHover={{ scale: viewMode === key ? 1.05 : 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {label}
                  </motion.button>
                ))}
              </motion.div>
            </motion.div>

            {/* Calculator Mode */}
            {viewMode === 'calculator' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Type Selectors - Responsive grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Attacking Type */}
                  <motion.div
                    className={cn(
                      'rounded-xl sm:rounded-xl p-4 sm:p-6 md:p-8',
                      'border border-white/20 dark:border-stone-700/50',
                      glassStyle
                    )}
                    whileHover={{ scale: 1.02, y: -6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <div className="flex items-center gap-3 mb-4 sm:mb-5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center">
                        <span className="text-sm sm:text-lg font-bold text-red-500">ATK</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        Attacking Type
                      </h3>
                    </div>

                    {renderTypeGrid([...POKEMON_TYPES], selectedAttacker, setSelectedAttacker)}
                  </motion.div>

                  {/* Defending Type(s) */}
                  <motion.div
                    className={cn(
                      'rounded-xl sm:rounded-xl p-4 sm:p-6 md:p-8',
                      'border border-white/20 dark:border-stone-700/50',
                      glassStyle
                    )}
                    whileHover={{ scale: 1.02, y: -6 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <div className="flex items-center gap-3 mb-4 sm:mb-5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-cyan-500/10 flex items-center justify-center">
                        <span className="text-sm sm:text-lg font-bold text-amber-500">DEF</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        Defending Type(s)
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-stone-500 dark:text-stone-500 mb-2 sm:mb-3 block uppercase tracking-wider">
                          Primary Type
                        </label>
                        {renderTypeGrid([...POKEMON_TYPES], selectedDefender1, setSelectedDefender1)}
                      </div>

                      <div>
                        <label className="text-xs font-medium text-stone-500 dark:text-stone-500 mb-2 sm:mb-3 block uppercase tracking-wider">
                          Secondary Type (Optional)
                        </label>
                        {renderTypeGrid(
                          POKEMON_TYPES.filter(t => t !== selectedDefender1),
                          selectedDefender2,
                          setSelectedDefender2,
                          true
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Result Display */}
                {selectedAttacker && selectedDefender1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={cn(
                      'text-center py-6 sm:py-8 md:py-10 px-4 sm:px-6 md:px-8',
                      'rounded-xl sm:rounded-xl',
                      'border border-white/20 dark:border-stone-700/50',
                      glassStyle
                    )}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)'
                    }}
                  >
                    <div className="flex items-center justify-center gap-4 sm:gap-6 mb-6">
                      <div>
                        <TypeBadge type={selectedAttacker} size="md" />
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-2">Attacking</p>
                      </div>

                      <div className="text-xl sm:text-2xl text-stone-400">→</div>

                      <div>
                        <div className="flex gap-2 justify-center">
                          <TypeBadge type={selectedDefender1} size="md" />
                          {selectedDefender2 && <TypeBadge type={selectedDefender2} size="md" />}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-2">Defending</p>
                      </div>
                    </div>

                    {(() => {
                      const damage = calculateDamage();
                      if (damage === null) return null;
                      
                      return (
                        <motion.div 
                          className={cn(
                            'inline-block px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full',
                            getEffectivenessColor(damage),
                            'text-white shadow-lg'
                          )}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 260, damping: 20 }}
                        >
                          <div className="text-2xl sm:text-3xl font-bold mb-1">
                            {getEffectivenessLabel(damage)}
                          </div>
                          <div className="text-xs sm:text-sm">
                            {getEffectivenessText(damage)}
                          </div>
                        </motion.div>
                      );
                    })()}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Type Chart Mode - Responsive */}
            {viewMode === 'chart' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn(
                  'p-4 sm:p-6 lg:p-8',
                  'rounded-xl sm:rounded-xl',
                  'border border-white/20 dark:border-stone-700/50',
                  glassStyle
                )}
              >
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-center text-stone-800 dark:text-stone-200">
                  Type Effectiveness Chart
                </h3>
                
                {/* Mobile: Scrollable, Desktop: Full view */}
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="min-w-[640px] sm:min-w-0">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <th className="p-1 text-[10px] sm:text-xs font-bold sticky left-0 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm z-10">
                            ATK→DEF
                          </th>
                          {POKEMON_TYPES.map(type => (
                            <th key={type} className="p-0.5 sm:p-1">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
                                <TypeBadge type={type} size="xs" />
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {POKEMON_TYPES.map(attacker => (
                          <tr key={attacker}>
                            <td className="p-1 sticky left-0 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm z-10">
                              <TypeBadge type={attacker} size="xs" />
                            </td>
                            {POKEMON_TYPES.map(defender => {
                              const effectiveness = calculateTypeEffectiveness(attacker, [defender]);
                              const color = getEffectivenessColor(effectiveness);
                              
                              return (
                                <td key={`${attacker}-${defender}`} className="p-0.5 sm:p-1">
                                  <div
                                    className={cn(
                                      'w-8 h-8 sm:w-10 sm:h-10',
                                      'rounded-md sm:rounded-lg',
                                      'flex items-center justify-center',
                                      'text-white font-bold text-[10px] sm:text-xs',
                                      color
                                    )}
                                    title={`${attacker} → ${defender}: ${getEffectivenessLabel(effectiveness)}`}
                                  >
                                    {getEffectivenessLabel(effectiveness)}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Legend - Responsive grid */}
                <div className="mt-4 sm:mt-6 grid grid-cols-3 sm:flex sm:flex-wrap justify-center gap-2 sm:gap-3 text-xs">
                  {[
                    { color: 'bg-emerald-600', label: '4×' },
                    { color: 'bg-green-500', label: '2×' },
                    { color: 'bg-amber-400', label: '1×' },
                    { color: 'bg-red-500', label: '0.5×' },
                    { color: 'bg-amber-500', label: '0.25×' },
                    { color: 'bg-stone-400', label: '0×' }
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1 justify-center">
                      <div className={cn('w-4 h-4 sm:w-6 sm:h-6 rounded-full', color)} />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Team Analyzer Mode - Responsive */}
            {viewMode === 'team' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6 sm:space-y-8"
              >
                {/* Team Builder */}
                <motion.div
                  className={cn(
                    'rounded-xl sm:rounded-xl p-6 sm:p-10',
                    'border border-white/20 dark:border-stone-700/50',
                    glassStyle
                  )}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-pink-500/10 flex items-center justify-center">
                      <span className="text-lg sm:text-xl font-bold text-amber-500">TEAM</span>
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                        Team Synergy Analyzer
                      </h3>
                      <p className="text-xs text-stone-500 dark:text-stone-500 mt-1 hidden sm:block">
                        Build your perfect team with type coverage analysis
                      </p>
                    </div>
                  </div>
                  
                  {/* Team Slots - Responsive grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
                    {[0, 1, 2, 3, 4, 5].map(slot => (
                      <motion.div
                        key={slot}
                        className={cn(
                          'rounded-xl sm:rounded-xl p-4 sm:p-5',
                          'border border-white/15 dark:border-stone-600/30',
                          glassButtonStyle
                        )}
                        style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                        }}
                        whileHover={{ y: -4, scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                            Slot {slot + 1}
                          </span>
                          {teamTypes[slot]?.[0] && (
                            <button
                              onClick={() => {
                                const newTeam = [...teamTypes];
                                newTeam.splice(slot, 1);
                                setTeamTypes(newTeam);
                              }}
                              className="text-xs text-red-500 hover:text-red-600"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                        
                        {teamTypes[slot]?.[0] ? (
                          <div className="space-y-2">
                            <div className="flex gap-1 sm:gap-2 justify-center mb-2">
                              <TypeBadge type={teamTypes[slot][0]} size="sm" />
                              {teamTypes[slot][1] && (
                                <TypeBadge type={teamTypes[slot][1]} size="sm" />
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-1">
                            {POKEMON_TYPES.slice(0, 4).map(type => (
                              <motion.button
                                key={type}
                                onClick={() => {
                                  const newTeam = [...teamTypes];
                                  newTeam[slot] = [type];
                                  setTeamTypes(newTeam);
                                }}
                                className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white dark:bg-stone-700 hover:shadow-md"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <TypeBadge type={type} size="xs" />
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Team Analysis Results - Responsive */}
                {teamTypes.filter(t => t.length > 0).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={cn(
                      'rounded-xl sm:rounded-xl p-6 sm:p-10',
                      'border border-white/20 dark:border-stone-700/50',
                      glassStyle
                    )}
                  >
                    {(() => {
                      const analysis = analyzeTeamTypeSynergy(teamTypes);

                      return (
                        <div className="space-y-4 sm:space-y-6">
                          {/* Score Cards - Responsive grid */}
                          <div className="grid grid-cols-3 gap-3 sm:gap-4">
                            <motion.div
                              className="bg-gradient-to-br from-amber-500/10 to-amber-500/10 rounded-xl sm:rounded-xl p-3 sm:p-4 border border-amber-200 dark:border-amber-800"
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-500 bg-clip-text text-transparent">
                                {analysis.defensiveScore}%
                              </div>
                              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Defense</div>
                            </motion.div>

                            <motion.div
                              className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-xl sm:rounded-xl p-3 sm:p-4 border border-red-200 dark:border-red-800"
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="text-xl sm:text-3xl font-bold text-red-500">
                                {Object.keys(analysis.sharedWeaknesses).length}
                              </div>
                              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Weaknesses</div>
                            </motion.div>

                            <motion.div
                              className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl sm:rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-800"
                              whileHover={{ scale: 1.05 }}
                            >
                              <div className="text-xl sm:text-3xl font-bold text-green-500">
                                {18 - analysis.uncoveredTypes.length}
                              </div>
                              <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">Coverage</div>
                            </motion.div>
                          </div>

                          {/* Weaknesses and Coverage - Responsive */}
                          {Object.keys(analysis.sharedWeaknesses).length > 0 && (
                            <motion.div
                              className="bg-red-50 dark:bg-red-900/20 rounded-xl sm:rounded-xl p-3 sm:p-4 border border-red-200 dark:border-red-800"
                              whileHover={{ scale: 1.02 }}
                            >
                              <h4 className="text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 mb-2 sm:mb-3 uppercase tracking-wider">
                                Critical Weaknesses
                              </h4>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {Object.entries(analysis.sharedWeaknesses).map(([type, count]) => (
                                  <motion.div
                                    key={type}
                                    className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-stone-800 px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl shadow-sm"
                                    whileHover={{ y: -2 }}
                                  >
                                    <TypeBadge type={type} size="xs" />
                                    <span className="text-xs sm:text-sm font-bold text-red-600">{count}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                )}
              </motion.div>
            )}
          </>
        )}
      </div>
    </FullBleedWrapper>
  );
};

export default UnifiedTypeEffectivenessPage;