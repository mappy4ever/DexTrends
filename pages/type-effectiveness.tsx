import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { createGlassStyle } from '../components/ui/design-system/glass-constants';
import { UnifiedSearchBar, EmptyStateGlass, LoadingStateGlass } from '../components/ui/glass-components';
import { GradientButton, CircularButton } from '../components/ui/design-system';
import { TypeBadge } from '../components/ui/TypeBadge';
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

const TypeEffectivenessPage = () => {
  const router = useRouter();
  const [selectedAttacker, setSelectedAttacker] = useState<string>('');
  const [selectedDefender1, setSelectedDefender1] = useState<string>('');
  const [selectedDefender2, setSelectedDefender2] = useState<string>('');
  const [teamTypes, setTeamTypes] = useState<string[][]>([]);
  const [typeDetails, setTypeDetails] = useState<Record<string, TypeDetails>>({});
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calculator' | 'chart' | 'team'>('calculator');

  // Glass morphism styles
  const glassStyle = createGlassStyle({});
  const glassButtonStyle = createGlassStyle({ opacity: 'subtle', blur: 'md' });

  useEffect(() => {
    const init = async () => {
      await loadTypeChart();
      
      // Load type details from PokeAPI
      const details: Record<string, TypeDetails> = {};
      for (const type of POKEMON_TYPES) {
        try {
          const data: any = await fetchJSON(`https://pokeapi.co/api/v2/type/${type}`);
          if (data) {
            details[type] = {
              name: type,
              damageRelations: data.damage_relations || {}
            };
          }
        } catch (error) {
          logger.error(`Failed to load type ${type}`, { error });
        }
      }
      setTypeDetails(details);
      setLoading(false);
    };
    init();
  }, []);

  const calculateDamage = () => {
    if (!selectedAttacker || !selectedDefender1) return null;
    
    const defenderTypes = selectedDefender2 && selectedDefender2 !== selectedDefender1
      ? [selectedDefender1, selectedDefender2]
      : [selectedDefender1];
    
    return calculateTypeEffectiveness(selectedAttacker, defenderTypes);
  };

  const getEffectivenessColor = (multiplier: number) => {
    if (multiplier === 0) return 'bg-gray-400';
    if (multiplier === 0.25) return 'bg-purple-500';
    if (multiplier === 0.5) return 'bg-red-500';
    if (multiplier === 2) return 'bg-green-500';
    if (multiplier === 4) return 'bg-emerald-600';
    return 'bg-blue-400';
  };

  const getEffectivenessText = (multiplier: number) => {
    if (multiplier === 0) return 'No Effect';
    if (multiplier === 0.25) return 'Very Weak';
    if (multiplier === 0.5) return 'Not Very Effective';
    if (multiplier === 2) return 'Super Effective';
    if (multiplier === 4) return 'Extremely Effective';
    return 'Normal Damage';
  };


  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Type Effectiveness Calculator | DexTrends</title>
        <meta name="description" content="Master Pokemon type matchups with our interactive type effectiveness calculator and team analyzer" />
      </Head>

      {/* Enhanced Glass Header */}
      <motion.div 
        className={`sticky top-0 z-50 ${glassStyle}`}
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CircularButton
                onClick={() => router.push('/pokemon')}
                variant="secondary"
                size="sm"
              >
                Back
              </CircularButton>
            </motion.div>
            
            <motion.h1 
              className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Type Effectiveness
            </motion.h1>
            
            <motion.div 
              className={`text-sm font-medium text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full ${glassButtonStyle}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Calculator
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Glass View Mode Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <motion.div 
            className={`inline-flex gap-1 p-1.5 rounded-full ${glassStyle}`}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {[
              { key: 'calculator', label: 'Calculator' },
              { key: 'chart', label: 'Type Chart' },
              { key: 'team', label: 'Team Analyzer' }
            ].map(({ key, label }) => (
              <motion.button
                key={key}
                onClick={() => setViewMode(key as any)}
                className={`px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${
                  viewMode === key
                    ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 text-white shadow-xl'
                    : `text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white ${glassButtonStyle}`
                }`}
                whileHover={{ scale: viewMode === key ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
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
            className="space-y-8"
          >
            {/* Type Selector */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Enhanced Glass Attacking Type */}
              <motion.div
                className={`rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 ${glassStyle}`}
                whileHover={{ scale: 1.02, y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/10 flex items-center justify-center shadow-md shadow-red-500/10">
                    <span className="text-lg font-bold text-red-500">ATK</span>
                  </div>
                  <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                    Attacking Type
                  </h3>
                </div>
                

                <div className="grid grid-cols-6 gap-2">
                  {POKEMON_TYPES.map(type => (
                    <motion.button
                      key={type}
                      onClick={() => setSelectedAttacker(type)}
                      className={`relative p-3 rounded-2xl transition-all ${
                        selectedAttacker === type
                          ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-lg scale-105'
                          : 'hover:scale-105 hover:shadow-md'
                      }`}
                      style={{
                        background: selectedAttacker === type
                          ? `linear-gradient(135deg, ${getTypeColor(type)}30, ${getTypeColor(type)}10)`
                          : 'rgba(255, 255, 255, 0.5)',
                        borderColor: selectedAttacker === type ? getTypeColor(type) : 'transparent',
                        '--tw-ring-color': getTypeColor(type)
                      } as React.CSSProperties}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <TypeBadge type={type} size="sm" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Glass Defending Type(s) */}
              <motion.div
                className={`rounded-3xl p-8 border border-white/20 dark:border-gray-700/50 ${glassStyle}`}
                whileHover={{ scale: 1.02, y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 flex items-center justify-center shadow-md shadow-blue-500/10">
                    <span className="text-lg font-bold text-blue-500">DEF</span>
                  </div>
                  <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                    Defending Type(s)
                  </h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-3 block uppercase tracking-wider">
                      Primary Type
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {POKEMON_TYPES.map(type => (
                        <motion.button
                          key={type}
                          onClick={() => setSelectedDefender1(type)}
                          className={`relative p-3 rounded-2xl transition-all ${
                            selectedDefender1 === type
                              ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-lg scale-105'
                              : 'hover:scale-105 hover:shadow-md'
                          }`}
                          style={{
                            background: selectedDefender1 === type
                              ? `linear-gradient(135deg, ${getTypeColor(type)}30, ${getTypeColor(type)}10)`
                              : 'rgba(255, 255, 255, 0.5)',
                            borderColor: selectedDefender1 === type ? getTypeColor(type) : 'transparent',
                            '--tw-ring-color': getTypeColor(type)
                          } as React.CSSProperties}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <TypeBadge type={type} size="sm" />
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-3 block uppercase tracking-wider">
                      Secondary Type (Optional)
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      <motion.button
                        onClick={() => setSelectedDefender2('')}
                        className={`relative p-3 rounded-2xl transition-all ${
                          !selectedDefender2
                            ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-gray-400 shadow-lg'
                            : 'hover:scale-105 hover:shadow-md bg-gray-100 dark:bg-gray-800'
                        }`}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-xs font-medium">None</span>
                      </motion.button>
                      {POKEMON_TYPES.filter(t => t !== selectedDefender1).map(type => (
                        <motion.button
                          key={type}
                          onClick={() => setSelectedDefender2(type)}
                          className={`relative p-3 rounded-2xl transition-all ${
                            selectedDefender2 === type
                              ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-lg scale-105'
                              : 'hover:scale-105 hover:shadow-md'
                          }`}
                          style={{
                            background: selectedDefender2 === type
                              ? `linear-gradient(135deg, ${getTypeColor(type)}30, ${getTypeColor(type)}10)`
                              : 'rgba(255, 255, 255, 0.5)',
                            borderColor: selectedDefender2 === type ? getTypeColor(type) : 'transparent',
                            '--tw-ring-color': getTypeColor(type)
                          } as React.CSSProperties}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <TypeBadge type={type} size="sm" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Enhanced Glass Result Display */}
            {selectedAttacker && selectedDefender1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 300, damping: 25 }}
              >
                <motion.div 
                  className={`text-center py-10 px-8 rounded-3xl border border-white/20 dark:border-gray-700/50 ${glassStyle}`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)'
                  }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div>
                      <TypeBadge type={selectedAttacker} size="md" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Attacking</p>
                    </div>
                    
                    <div className="text-2xl text-gray-400">→</div>
                    
                    <div>
                      <div className="flex gap-2 justify-center">
                        <TypeBadge type={selectedDefender1} size="md" />
                        {selectedDefender2 && <TypeBadge type={selectedDefender2} size="md" />}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Defending</p>
                    </div>
                  </div>

                  {(() => {
                    const damage = calculateDamage();
                    if (damage === null) return null;
                    
                    return (
                      <motion.div 
                        className={`inline-block px-10 py-5 rounded-full ${getEffectivenessColor(damage)} text-white shadow-lg`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      >
                        <div className="text-3xl font-bold mb-1">
                          {getEffectivenessLabel(damage)}
                        </div>
                        <div className="text-sm">
                          {getEffectivenessText(damage)}
                        </div>
                      </motion.div>
                    );
                  })()}
                </motion.div>
              </motion.div>
            )}

            {/* Type Details */}
            {selectedAttacker && typeDetails[selectedAttacker] && (
              <motion.div 
                className={`p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 ${glassStyle}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.01, y: -2 }}
              >
                <h3 className="text-lg font-bold mb-6 capitalize text-gray-800 dark:text-gray-200">
                  {selectedAttacker} Type Matchups
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Offensive */}
                  <div>
                    <h4 className="font-semibold text-md mb-3 text-red-600 dark:text-red-400">Offensive</h4>
                    
                    {typeDetails[selectedAttacker].damageRelations.double_damage_to && typeDetails[selectedAttacker].damageRelations.double_damage_to.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-green-700 mb-2">Super Effective (2×)</p>
                        <div className="flex flex-wrap gap-2">
                          {typeDetails[selectedAttacker].damageRelations.double_damage_to!.map(t => (
                            <TypeBadge key={t.name} type={t.name} size="sm" />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {typeDetails[selectedAttacker].damageRelations.half_damage_to && typeDetails[selectedAttacker].damageRelations.half_damage_to.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-red-700 mb-2">Not Very Effective (0.5×)</p>
                        <div className="flex flex-wrap gap-2">
                          {typeDetails[selectedAttacker].damageRelations.half_damage_to!.map(t => (
                            <TypeBadge key={t.name} type={t.name} size="sm" />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {typeDetails[selectedAttacker].damageRelations.no_damage_to && typeDetails[selectedAttacker].damageRelations.no_damage_to.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">No Effect (0×)</p>
                        <div className="flex flex-wrap gap-2">
                          {typeDetails[selectedAttacker].damageRelations.no_damage_to!.map(t => (
                            <TypeBadge key={t.name} type={t.name} size="sm" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Defensive */}
                  <div>
                    <h4 className="font-semibold text-md mb-3 text-blue-600 dark:text-blue-400">Defensive</h4>
                    
                    {typeDetails[selectedAttacker].damageRelations.double_damage_from && typeDetails[selectedAttacker].damageRelations.double_damage_from.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-orange-700 mb-2">Weak To (2×)</p>
                        <div className="flex flex-wrap gap-2">
                          {typeDetails[selectedAttacker].damageRelations.double_damage_from!.map(t => (
                            <TypeBadge key={t.name} type={t.name} size="sm" />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {typeDetails[selectedAttacker].damageRelations.half_damage_from && typeDetails[selectedAttacker].damageRelations.half_damage_from.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-blue-700 mb-2">Resists (0.5×)</p>
                        <div className="flex flex-wrap gap-2">
                          {typeDetails[selectedAttacker].damageRelations.half_damage_from!.map(t => (
                            <TypeBadge key={t.name} type={t.name} size="sm" />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {typeDetails[selectedAttacker].damageRelations.no_damage_from && typeDetails[selectedAttacker].damageRelations.no_damage_from.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-purple-700 mb-2">Immune To (0×)</p>
                        <div className="flex flex-wrap gap-2">
                          {typeDetails[selectedAttacker].damageRelations.no_damage_from!.map(t => (
                            <TypeBadge key={t.name} type={t.name} size="sm" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Type Chart Mode */}
        {viewMode === 'chart' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className={`overflow-x-auto p-8 rounded-3xl border border-white/20 dark:border-gray-700/50 ${glassStyle}`}
              whileHover={{ scale: 1.005 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <h3 className="text-xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">Complete Type Effectiveness Chart</h3>
            
              <div className="min-w-[800px]">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="p-1 text-xs font-bold sticky left-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                        ATK→DEF
                      </th>
                      {POKEMON_TYPES.map(type => (
                        <th key={type} className="p-1">
                          <div className="w-10 h-10 flex items-center justify-center">
                            <TypeBadge type={type} size="xs" />
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {POKEMON_TYPES.map(attacker => (
                      <tr key={attacker}>
                        <td className="p-1 sticky left-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                          <TypeBadge type={attacker} size="xs" />
                        </td>
                        {POKEMON_TYPES.map(defender => {
                          const effectiveness = calculateTypeEffectiveness(attacker, [defender]);
                          const color = getEffectivenessColor(effectiveness);
                          
                          return (
                            <td key={`${attacker}-${defender}`} className="p-1">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs ${color}`}
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

              {/* Legend */}
              <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-emerald-600 rounded-full"></div>
                  <span>4×</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                  <span>2×</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                  <span>1×</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                  <span>0.5×</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  <span>0.25×</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                  <span>0×</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Team Analyzer Mode */}
        {viewMode === 'team' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Enhanced Glass Team Builder */}
            <motion.div
              className={`rounded-3xl p-10 border border-white/20 dark:border-gray-700/50 ${glassStyle}`}
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)'
              }}
              whileHover={{ scale: 1.015, y: -6 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 flex items-center justify-center shadow-md shadow-purple-500/10">
                  <span className="text-xl font-bold text-purple-500">TEAM</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                    Team Synergy Analyzer
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Build your perfect team with type coverage analysis
                  </p>
                </div>
              </div>
              
              {/* Team Slots */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2, 3, 4, 5].map(slot => (
                  <motion.div 
                    key={slot} 
                    className={`rounded-2xl p-5 border border-white/15 dark:border-gray-600/30 ${glassButtonStyle}`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                    }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                    
                    {/* Type Display or Selection */}
                    {teamTypes[slot]?.[0] ? (
                      <div className="space-y-2">
                        <div className="flex gap-2 justify-center mb-2">
                          <TypeBadge type={teamTypes[slot][0]} size="md" />
                          {teamTypes[slot][1] && (
                            <TypeBadge type={teamTypes[slot][1]} size="md" />
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const newTeam = [...teamTypes];
                            newTeam[slot] = [];
                            setTeamTypes(newTeam);
                          }}
                          className="w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Change Types
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-1">
                        {POKEMON_TYPES.slice(0, 6).map(type => (
                          <motion.button
                            key={type}
                            onClick={() => {
                              const newTeam = [...teamTypes];
                              newTeam[slot] = [type];
                              setTeamTypes(newTeam);
                            }}
                            className="p-2 rounded-xl bg-white dark:bg-gray-700 hover:shadow-md"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <TypeBadge type={type} size="xs" />
                          </motion.button>
                        ))}
                        <button
                          onClick={() => {
                            // Show all types modal/dropdown
                            const type = prompt('Enter type name:')?.toLowerCase();
                            if (type && POKEMON_TYPES.includes(type as any)) {
                              const newTeam = [...teamTypes];
                              newTeam[slot] = [type];
                              setTeamTypes(newTeam);
                            }
                          }}
                          className="col-span-3 p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          More Types...
                        </button>
                      </div>
                    )}
                    
                    {/* Second Type Option */}
                    {teamTypes[slot]?.[0] && !teamTypes[slot]?.[1] && (
                      <div className="mt-2">
                        <button
                          onClick={() => {
                            const type = prompt('Enter second type:')?.toLowerCase();
                            if (type && POKEMON_TYPES.includes(type as any) && type !== teamTypes[slot][0]) {
                              const newTeam = [...teamTypes];
                              newTeam[slot] = [newTeam[slot][0], type];
                              setTeamTypes(newTeam);
                            }
                          }}
                          className="w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 py-1"
                        >
                          + Add Second Type
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Glass Team Analysis Results */}
            {teamTypes.filter(t => t.length > 0).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`rounded-3xl p-10 border border-white/20 dark:border-gray-700/50 ${glassStyle}`}
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)'
                }}
                whileHover={{ scale: 1.015, y: -6 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/10 flex items-center justify-center shadow-md shadow-green-500/10">
                    <span className="text-lg font-bold text-green-500">STATS</span>
                  </div>
                  <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                    Analysis Results
                  </h3>
                </div>
                
                {(() => {
                  const analysis = analyzeTeamTypeSynergy(teamTypes);
                  
                  return (
                    <div className="space-y-6">
                      {/* Score Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <motion.div 
                          className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-4 border border-purple-200 dark:border-purple-800"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                            {analysis.defensiveScore}%
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Defensive Rating</div>
                        </motion.div>
                        
                        <motion.div 
                          className="bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl p-4 border border-red-200 dark:border-red-800"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-3xl font-bold text-red-500">
                            {Object.keys(analysis.sharedWeaknesses).length}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Shared Weaknesses</div>
                        </motion.div>
                        
                        <motion.div 
                          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-200 dark:border-green-800"
                          whileHover={{ scale: 1.05 }}
                        >
                          <div className="text-3xl font-bold text-green-500">
                            {18 - analysis.uncoveredTypes.length}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Types Covered</div>
                        </motion.div>
                      </div>

                      {/* Shared Weaknesses */}
                      {Object.keys(analysis.sharedWeaknesses).length > 0 && (
                        <motion.div
                          className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 border border-red-200 dark:border-red-800"
                          whileHover={{ scale: 1.02 }}
                        >
                          <h4 className="text-sm font-medium text-red-600 dark:text-red-400 mb-3 uppercase tracking-wider">
                            Critical Weaknesses
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(analysis.sharedWeaknesses).map(([type, count]) => (
                              <motion.div 
                                key={type} 
                                className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl shadow-sm"
                                whileHover={{ y: -2 }}
                              >
                                <TypeBadge type={type} size="sm" />
                                <span className="text-sm font-bold text-red-600">{count} members</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Uncovered Types */}
                      {analysis.uncoveredTypes.length > 0 && (
                        <motion.div
                          className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 border border-orange-200 dark:border-orange-800"
                          whileHover={{ scale: 1.02 }}
                        >
                          <h4 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-3 uppercase tracking-wider">
                            Unresisted Types
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {analysis.uncoveredTypes.map(type => (
                              <motion.div
                                key={type}
                                whileHover={{ y: -2 }}
                              >
                                <TypeBadge type={type} size="md" />
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* Individual Type Coverage */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">
                          Individual Coverage
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {teamTypes.filter(t => t.length > 0).map((types, idx) => {
                            const matchups = getTypeMatchups(types);
                            return (
                              <motion.div 
                                key={idx} 
                                className={`rounded-2xl p-5 border border-white/15 dark:border-gray-600/30 ${glassButtonStyle}`}
                                style={{
                                  background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)'
                                }}
                                whileHover={{ scale: 1.03, y: -4 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Slot {idx + 1}
                                  </span>
                                  <div className="flex gap-1">
                                    {types.map(t => (
                                      <TypeBadge key={t} type={t} size="sm" />
                                    ))}
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-red-500">
                                      {Object.keys(matchups.weaknesses).length}
                                    </div>
                                    <div className="text-xs text-gray-500">Weaknesses</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-500">
                                      {Object.keys(matchups.resistances).length}
                                    </div>
                                    <div className="text-xs text-gray-500">Resistances</div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </FullBleedWrapper>
  );
};

export default TypeEffectivenessPage;