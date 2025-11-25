import React from 'react';
import { motion } from 'framer-motion';
import type { Pokemon, PokemonSpecies } from "../../../types/pokemon";
import type { CompetitiveTierRecord } from '../../../utils/supabase';
import { GlassContainer } from '../../ui/design-system';
import CompactTypeEffectiveness from '../CompactTypeEffectiveness';
import { formatEggGroups } from '../../../utils/pokemonDetailUtils';
import { cn } from '../../../utils/cn';
import {
  FaFlask, FaTag, FaHome, FaPalette, FaShapes, FaEgg,
  FaClock, FaHeart, FaChartLine, FaRuler, FaStar,
  FaRunning, FaMedal, FaTrophy, FaPercent, FaGraduationCap,
  FaDna, FaMapMarkerAlt, FaSmile
} from 'react-icons/fa';
import { GiEggClutch, GiDna2 } from 'react-icons/gi';
import { HiSparkles } from 'react-icons/hi';

interface TypeColors {
  accent: string;
  animationAccent: string;
  from?: string;
  to?: string;
}

interface AbilityData {
  name: string;
  isHidden: boolean;
  effect: string;
  short_effect: string;
}

interface OverviewTabV3Props {
  pokemon: Pokemon;
  species: PokemonSpecies;
  abilities: Record<string, AbilityData>;
  typeColors: TypeColors;
  competitiveTiers?: CompetitiveTierRecord | null;
}

const OverviewTabV3: React.FC<OverviewTabV3Props> = ({
  pokemon,
  species,
  abilities,
  typeColors,
  competitiveTiers
}) => {
  // Get flavor text
  const getFlavorText = () => {
    if (!species?.flavor_text_entries) return 'No description available.';
    const englishEntry = species.flavor_text_entries.find(
      entry => entry.language.name === 'en'
    );
    return englishEntry ? englishEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.';
  };

  // Info card component for consistent styling
  const InfoCard = ({ icon: Icon, title, children, iconColor = "text-gray-500", className = "" }: { icon: React.ComponentType<{ className?: string }>, title: string, children: React.ReactNode, iconColor?: string, className?: string }) => (
    <div className="transform transition-transform duration-300 hover:scale-[1.02] will-change-transform">
      <GlassContainer variant="dark" className={cn("h-full", className)} animate={false}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn("w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center", iconColor)}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <div className="space-y-3">
            {children}
          </div>
        </div>
      </GlassContainer>
    </div>
  );

  const StatRow = ({ label, value, icon: Icon }: { label: string, value: string | number, icon: React.ComponentType<{ className?: string }> }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Pokedex Entry with Training and Breeding - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassContainer
          variant="dark"
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <h2
              className="text-sm font-medium uppercase tracking-[0.15em] mb-6 bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #6366f1, #a855f7)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Pokédex Entry
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-gray-700 dark:text-gray-200 font-light">
              {getFlavorText()}
            </p>
          </div>
        </GlassContainer>
      </motion.div>

      {/* Training, Breeding, and Biology Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Training Info */}
              <motion.div
                className="group"
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shadow-md shadow-blue-500/10">
                      <FaGraduationCap className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-blue-400">Training</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaSmile className="w-4 h-4 text-blue-400/70" />
                        Base Happiness
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{species.base_happiness || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaPercent className="w-4 h-4 opacity-70" />
                        Catch Rate
                      </span>
                      <div className="text-right">
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{Math.round((species.capture_rate / 255) * 100)}%</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({species.capture_rate})</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaChartLine className="w-4 h-4 opacity-70" />
                        Growth Rate
                      </span>
                      <span className="font-semibold capitalize text-gray-700 dark:text-gray-200">{species.growth_rate?.name.replace('-', ' ') || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaStar className="w-4 h-4 opacity-70" />
                        Base EXP
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{pokemon.base_experience || 0}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Breeding Info */}
              <motion.div
                className="group"
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 flex items-center justify-center shadow-md shadow-pink-500/10">
                      <GiEggClutch className="w-5 h-5 text-pink-400" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-pink-400">Breeding</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaEgg className="w-4 h-4 opacity-70" />
                        Egg Groups
                      </span>
                      <span className="font-semibold text-right text-gray-700 dark:text-gray-200">{formatEggGroups(species.egg_groups).join(', ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaClock className="w-4 h-4 opacity-70" />
                        Hatch Time
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{(species.hatch_counter || 0) * 256} steps</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaHeart className="w-4 h-4 opacity-70" />
                        Gender
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">
                        {species.gender_rate === -1 ? 'Genderless' : (
                          <div className="flex items-center gap-1">
                            <span className="text-blue-500">{Math.round(((8 - species.gender_rate) / 8) * 100)}%</span>
                            <span className="text-gray-500">/</span>
                            <span className="text-pink-500">{Math.round((species.gender_rate / 8) * 100)}%</span>
                          </div>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Biology Info */}
              <motion.div
                className="group"
                whileHover={{ scale: 1.03, y: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <div className="h-full bg-white dark:bg-gray-900/50 rounded-2xl p-5 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center shadow-md shadow-green-500/10">
                      <GiDna2 className="w-5 h-5 text-green-400" />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-wider text-green-400">Biology</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaDna className="w-4 h-4 opacity-70" />
                        Species
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{species.genera?.find(g => g.language.name === 'en')?.genus || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaMapMarkerAlt className="w-4 h-4 opacity-70" />
                        Habitat
                      </span>
                      <span className="font-semibold capitalize text-gray-700 dark:text-gray-200">{species.habitat?.name.replace('-', ' ') || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaShapes className="w-4 h-4 opacity-70" />
                        Shape
                      </span>
                      <span className="font-semibold capitalize text-gray-700 dark:text-gray-200">{species.shape?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <FaPalette className="w-4 h-4 opacity-70" />
                        Color
                      </span>
                      <span className="font-semibold capitalize text-gray-700 dark:text-gray-200">{species.color?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
        </div>
      </motion.div>

      {/* Type Effectiveness with Type Advantage Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassContainer
          variant="dark"
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-6">
              Type Matchups
            </h2>
            <CompactTypeEffectiveness types={pokemon.types || []} competitiveTiers={competitiveTiers} />
          </div>
        </GlassContainer>
      </motion.div>



      {/* Abilities - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassContainer
          variant="dark"
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-6">
              Abilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pokemon.abilities?.map((ability, index) => {
                const abilityData = abilities[ability.ability.name];
                const isHidden = ability.is_hidden;

                return (
                  <motion.div
                    key={ability.ability.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 400 }}
                    whileHover={{ scale: 1.02 }}
                    className="group"
                  >
                    <div className={cn(
                      "relative h-full p-5 rounded-2xl backdrop-blur-md border transition-all duration-300",
                      isHidden
                        ? "bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:shadow-purple-500/20"
                        : "bg-gradient-to-br from-amber-500/10 to-orange-600/5 border-amber-500/20 hover:shadow-amber-500/20",
                      "shadow-lg hover:shadow-xl"
                    )}>
                      {/* Hidden Badge */}
                      {isHidden && (
                        <div className="absolute -top-2 -right-2">
                          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-500 text-white shadow-lg">
                            Hidden
                          </span>
                        </div>
                      )}

                      <div>
                        <h3 className="font-bold capitalize mb-2 text-gray-800 dark:text-gray-100">
                          {ability.ability.name.replace('-', ' ')}
                        </h3>
                        {abilityData && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            {abilityData.short_effect || abilityData.effect}
                          </p>
                        )}
                      </div>

                      {/* Slot indicator */}
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400 opacity-50">
                        Slot {ability.slot}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </GlassContainer>
      </motion.div>

    </div>
  );
};

export default OverviewTabV3;
