import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Image from 'next/image';
import type { Pokemon, PokemonSpecies } from '../../../types/api/pokemon';
import type { CompetitiveTierRecord } from '../../../utils/supabase';
import { showdownQueries } from '../../../utils/supabase';
import { TierBadge, TierBadgeGroup } from '../../ui/TierBadge';
import { GlassContainer } from '../../ui/design-system';
import { cn } from '../../../utils/cn';
import { getPokemonIdFromName, formatPokedexNumber } from '../../../utils/pokemonNameIdMap';
import { STAT_NAMES } from '../../../utils/pokemonDetailUtils';
import {
  generateMovesets,
  generateTeammates,
  generateCounters,
  calculateUsageStats,
  determinePokemonRole,
} from '../../../utils/competitiveAnalysis';
import logger from '@/utils/logger';
import { 
  FaTrophy, FaChartLine, FaUsers, FaShieldAlt, 
  FaRunning, FaGamepad, FaInfoCircle, FaMedal,
  FaChessBishop, FaFistRaised, FaStar, FaExchangeAlt,
  FaHeart, FaBrain, FaBalanceScale, FaBaby, FaGlobe,
  FaCrown, FaPalette, FaUser, FaLayerGroup,
  FaCheckCircle, FaTimesCircle, FaExclamationTriangle
} from 'react-icons/fa';
import { GiPodium, GiSwordWound, GiSpeedometer, GiShield, GiSparkles, GiCrystalBall } from 'react-icons/gi';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { MdCatchingPokemon } from 'react-icons/md';

interface CompetitiveTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  typeColors: any;
  competitiveTiers?: CompetitiveTierRecord | null;
}

interface MovesetData {
  name: string;
  usage: number;
  item: string;
  ability: string;
  nature: string;
  evs: Record<string, number>;
  moves: string[];
}

interface TeammateData {
  name: string;
  usage: number;
  reason?: string;
}

interface CounterData {
  name: string;
  winRate: number;
  reason?: string;
}

// Format descriptions
const FORMAT_INFO = {
  standard: {
    name: 'Standard Formats',
    description: 'Current generation competitive formats',
    icon: MdCatchingPokemon,
    color: 'from-blue-500 to-purple-600'
  },
  nationalDex: {
    name: 'National Dex',
    description: 'All Pokémon and mechanics from every generation',
    icon: MdCatchingPokemon,
    color: 'from-teal-500 to-blue-600'
  },
  otherFormats: {
    name: 'Other Formats',
    description: 'Special rulesets and alternative formats',
    icon: MdCatchingPokemon,
    color: 'from-orange-500 to-pink-600'
  }
};

// Complete tier descriptions including all formats
const TIER_INFO = {
  // Anything Goes
  'AG': { 
    description: 'Anything Goes - No restrictions, all Pokemon and strategies allowed',
    color: 'from-black to-gray-800'
  },
  
  // Singles Tiers
  'Uber': { 
    description: 'Most powerful Pokémon, often legendary/mythical. Banned from standard play',
    color: 'from-purple-600 to-pink-600'
  },
  'OU': { 
    description: 'OverUsed - Top tier competitive Pokémon seen in most teams',
    color: 'from-blue-600 to-purple-600'
  },
  'UUBL': { 
    description: 'UU Banlist - Too strong for UU but not used enough for OU',
    color: 'from-blue-500 to-blue-600'
  },
  'UU': { 
    description: 'UnderUsed - Strong Pokémon that see less usage than OU',
    color: 'from-green-600 to-blue-600'
  },
  'RUBL': { 
    description: 'RU Banlist - Too strong for RU but not used enough for UU',
    color: 'from-green-500 to-green-600'
  },
  'RU': { 
    description: 'RarelyUsed - Viable Pokémon with niche roles',
    color: 'from-yellow-600 to-green-600'
  },
  'NUBL': { 
    description: 'NU Banlist - Too strong for NU but not used enough for RU',
    color: 'from-yellow-500 to-yellow-600'
  },
  'NU': { 
    description: 'NeverUsed - Lower tier but still competitively viable',
    color: 'from-orange-600 to-yellow-600'
  },
  'PUBL': { 
    description: 'PU Banlist - Too strong for PU but not used enough for NU',
    color: 'from-orange-500 to-orange-600'
  },
  'PU': { 
    description: 'Lowest official tier, requires specific strategies',
    color: 'from-red-600 to-orange-600'
  },
  'ZU': { 
    description: 'Zero Used - Unofficial tier below PU',
    color: 'from-red-700 to-red-600'
  },
  
  // Special Formats
  'LC': { 
    description: 'Little Cup - Only unevolved Pokémon at Level 5',
    color: 'from-pink-600 to-purple-600'
  },
  'LC Uber': { 
    description: 'Little Cup Uber - Banned from Little Cup for being too strong',
    color: 'from-pink-700 to-pink-600'
  },
  'NFE': { 
    description: 'Not Fully Evolved - Can still evolve further',
    color: 'from-gray-600 to-gray-500'
  },
  
  // Doubles Tiers (shown without D prefix in UI)
  'DOU': { 
    description: 'OverUsed - Top tier in 2v2 format',
    color: 'from-indigo-600 to-purple-600'
  },
  'DUU': { 
    description: 'UnderUsed - Below OU in usage',
    color: 'from-indigo-500 to-indigo-600'
  },
  'DNU': { 
    description: 'NeverUsed - Lower tier format',
    color: 'from-indigo-400 to-indigo-500'
  },
  
  // National Dex Tiers
  'ND': { 
    description: 'National Dex - Includes all Pokémon from all generations',
    color: 'from-teal-600 to-blue-600'
  },
  'ND UU': { 
    description: 'National Dex UnderUsed',
    color: 'from-teal-500 to-teal-600'
  },
  'ND RU': { 
    description: 'National Dex RarelyUsed',
    color: 'from-teal-400 to-teal-500'
  },
  
  'Untiered': { 
    description: 'Not ranked in any competitive tier',
    color: 'from-gray-600 to-gray-500'
  },
  
  // Special Status Tiers
  'Illegal': { 
    description: 'Not obtainable or usable in this generation/format',
    color: 'from-gray-800 to-gray-700'
  },
  'Unreleased': { 
    description: 'Not yet released but exists in game data',
    color: 'from-gray-700 to-gray-600'
  }
};

// Role descriptions for movesets
const ROLE_INFO = {
  'Physical Sweeper': {
    description: 'High Attack and Speed, designed to KO opponents quickly',
    icon: GiSwordWound,
    color: 'text-red-400'
  },
  'Special Sweeper': {
    description: 'High Special Attack and Speed, uses special moves',
    icon: GiSparkles,
    color: 'text-purple-400'
  },
  'Bulky Pivot': {
    description: 'High defenses, switches in to take hits and pivot to teammates',
    icon: GiShield,
    color: 'text-blue-400'
  },
  'Wall': {
    description: 'Extremely high defenses, stalls opponents',
    icon: FaShieldAlt,
    color: 'text-gray-400'
  },
  'Support': {
    description: 'Sets up entry hazards, status, or team support',
    icon: FaHeart,
    color: 'text-pink-400'
  },
  'Setup Sweeper': {
    description: 'Uses stat-boosting moves before sweeping',
    icon: FaBrain,
    color: 'text-yellow-400'
  },
  'Mixed Attacker': {
    description: 'Uses both physical and special attacks',
    icon: FaBalanceScale,
    color: 'text-green-400'
  },
  'Mega Sweeper': {
    description: 'Mega Evolution focused on offense',
    icon: FaStar,
    color: 'text-orange-400'
  }
};

// Special format checks
const checkFormatEligibility = (pokemon: Pokemon, species: PokemonSpecies) => {
  const baseStatTotal = pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
  
  return {
    littleCup: species.evolves_from_species === null && species.is_baby === false && 
               !['Ditto', 'Cosmog', 'Cosmoem', 'Solgaleo', 'Lunala'].includes(pokemon.name),
    monotype: pokemon.types?.length === 1,
    nfe: species.evolves_from_species !== null || species.evolution_chain !== null,
    vgc: true, // Most Pokemon are VGC eligible
    battleStadium: baseStatTotal <= 600 && !species.is_legendary && !species.is_mythical,
  };
};

// Pokemon list item component for teammates/counters
const PokemonListItem: React.FC<{
  name: string;
  value: number;
  valueLabel: string;
  isCounter?: boolean;
  onClick: () => void;
}> = ({ name, value, valueLabel, isCounter = false, onClick }) => {
  // Get Pokemon ID from name using utility
  const pokemonId = getPokemonIdFromName(name);
  const spriteUrl = pokemonId 
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png`; // Default to Pikachu

  const getValueColor = () => {
    if (isCounter) {
      if (value >= 70) return 'from-red-500 to-red-700';
      if (value >= 60) return 'from-orange-500 to-red-600';
      return 'from-yellow-500 to-orange-600';
    } else {
      if (value >= 40) return 'from-green-500 to-emerald-600';
      if (value >= 30) return 'from-blue-500 to-green-500';
      return 'from-gray-500 to-blue-500';
    }
  };

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 dark:bg-gray-800/50 hover:bg-white/10 dark:hover:bg-gray-800 transition-all cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Pokemon Image */}
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-white/5 p-1">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
          <Image
            src={spriteUrl}
            alt={name}
            width={64}
            height={64}
            className="object-contain scale-110"
          />
        </div>
      </div>
      
      {/* Name and Stats */}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{name.replace('-', ' ')}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
          {pokemonId ? formatPokedexNumber(pokemonId) : '#???'}
        </p>
      </div>
      
      {/* Value Badge */}
      <div className={cn(
        "px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg bg-gradient-to-r whitespace-nowrap",
        getValueColor()
      )}>
        {value}% {valueLabel}
      </div>
    </motion.div>
  );
};

// Mock competitive data (in a real app, this would come from an API)
const SAMPLE_MOVESETS = [
  {
    name: 'Physical Sweeper',
    usage: 45.3,
    item: 'Life Orb',
    ability: 'Intimidate',
    nature: 'Adamant',
    evs: { hp: 0, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 4, speed: 252 },
    moves: ['Dragon Dance', 'Earthquake', 'Ice Fang', 'Waterfall']
  },
  {
    name: 'Bulky Pivot',
    usage: 32.7,
    item: 'Leftovers',
    ability: 'Intimidate',
    nature: 'Impish',
    evs: { hp: 248, attack: 8, defense: 252, 'special-attack': 0, 'special-defense': 0, speed: 0 },
    moves: ['Stealth Rock', 'Earthquake', 'Ice Fang', 'Roar']
  },
  {
    name: 'Mega Sweeper',
    usage: 22.0,
    item: 'Gyaradosite',
    ability: 'Mold Breaker',
    nature: 'Jolly',
    evs: { hp: 0, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 4, speed: 252 },
    moves: ['Dragon Dance', 'Crunch', 'Ice Fang', 'Waterfall']
  }
];

// Format-specific usage and win rate data
const FORMAT_STATS = {
  standard: {
    singles: { usage: 4.5, winRate: 48.7 },
    doubles: { usage: 2.1, winRate: 51.2 }
  },
  nationalDex: {
    usage: 3.8,
    winRate: 49.3
  },
  otherFormats: {
    littleCup: { usage: 0, winRate: 0 },
    monotype: { usage: 5.2, winRate: 52.1 },
    vgc: { usage: 3.1, winRate: 50.8 }
  }
};

const COMMON_TEAMMATES = [
  { name: 'Ferrothorn', usage: 42.1 },
  { name: 'Landorus-Therian', usage: 38.7 },
  { name: 'Tapu Koko', usage: 35.2 },
  { name: 'Heatran', usage: 31.9 },
  { name: 'Toxapex', usage: 28.4 }
];

const COUNTERS = [
  { name: 'Tapu Koko', winRate: 78.3 },
  { name: 'Rotom-Wash', winRate: 71.2 },
  { name: 'Ferrothorn', winRate: 68.9 },
  { name: 'Zapdos', winRate: 66.4 },
  { name: 'Tangrowth', winRate: 63.7 }
];

const CompetitiveTab: React.FC<CompetitiveTabProps> = ({ pokemon, species, typeColors, competitiveTiers }) => {
  const router = useRouter();
  const [expandedMoveset, setExpandedMoveset] = useState<number | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<'standard' | 'nationalDex' | 'otherFormats'>('standard');
  const [showTierLegend, setShowTierLegend] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  
  // State for real competitive data
  const [movesets, setMovesets] = useState<MovesetData[]>([]);
  const [teammates, setTeammates] = useState<TeammateData[]>([]);
  const [counters, setCounters] = useState<CounterData[]>([]);
  const [usageStats, setUsageStats] = useState<{ usage: number; winRate: number }>({ usage: 0, winRate: 0 });
  const [loading, setLoading] = useState(true);
  
  // Calculate base stat total for fallback tier estimation
  const baseStatTotal = pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
  const estimatedTier = baseStatTotal >= 600 ? 'Uber' : 
    baseStatTotal >= 500 ? 'OU' : 
    baseStatTotal >= 450 ? 'UU' : 
    baseStatTotal >= 400 ? 'RU' : 'NU';

  // Check format eligibility
  const formatEligibility = checkFormatEligibility(pokemon, species);

  // Load competitive data on mount
  useEffect(() => {
    async function loadCompetitiveData() {
      setLoading(true);
      try {
        // Get learnset for moveset generation
        const learnset = await showdownQueries.getPokemonLearnset(pokemon.name);
        
        // Generate movesets
        const generatedMovesets = await generateMovesets(pokemon, species, learnset);
        setMovesets(generatedMovesets);
        
        // Generate teammates
        const generatedTeammates = await generateTeammates(pokemon, species);
        setTeammates(generatedTeammates);
        
        // Generate counters
        const generatedCounters = await generateCounters(pokemon, species);
        setCounters(generatedCounters);
        
        // Calculate usage stats based on tier
        const tier = competitiveTiers?.singles_tier || estimatedTier;
        const stats = calculateUsageStats(pokemon, tier);
        setUsageStats(stats);
      } catch (error) {
        logger.error('Error loading competitive data:', { error });
        // Fall back to sample data if needed
        setMovesets(SAMPLE_MOVESETS);
        setTeammates(COMMON_TEAMMATES);
        setCounters(COUNTERS);
        setUsageStats({ usage: 4.5, winRate: 48.7 });
      } finally {
        setLoading(false);
      }
    }

    loadCompetitiveData();
  }, [pokemon, species, competitiveTiers, estimatedTier]);

  return (
    <div className="space-y-6">
      {/* Tier Legend */}
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                  <MdCatchingPokemon className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Competitive Information
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTierLegend(!showTierLegend)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    "transform hover:scale-[1.02] active:scale-[0.98]",
                    showTierLegend
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                      : "bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/20"
                  )}
                >
                  {showTierLegend ? 'Hide' : 'Show'} Tiers
                </button>
                <button
                  onClick={() => setShowRoles(!showRoles)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    "transform hover:scale-[1.02] active:scale-[0.98]",
                    showRoles
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/20"
                  )}
                >
                  {showRoles ? 'Hide' : 'Show'} Roles
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {showTierLegend && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 mt-6">Competitive Tiers Explained</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(TIER_INFO).map(([tier, info], index) => (
                      <motion.div
                        key={tier}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="p-3 rounded-xl bg-white/5 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <TierBadge tier={tier} size="sm" />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {info.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {showRoles && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 mt-6">Competitive Roles Explained</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(ROLE_INFO).map(([role, info], index) => {
                      const Icon = info.icon;
                      return (
                        <motion.div
                          key={role}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="p-3 rounded-xl bg-white/5 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className={cn("w-5 h-5", info.color)} />
                            <span className="font-semibold text-sm">{role}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {info.description}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </GlassContainer>
      </motion.div>

      {/* Format Tabs & Overview */}
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
            {/* Format Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
                  <MdCatchingPokemon className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Competitive Formats
                </h2>
              </div>
            </div>
            
            {/* Format Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {Object.entries(FORMAT_INFO).map(([key, format]) => {
                const Icon = format.icon;
                const isSelected = selectedFormat === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedFormat(key as any)}
                    className={cn(
                      "p-4 rounded-xl transition-all duration-200",
                      "border-2 flex flex-col items-center gap-2",
                      "transform hover:scale-[1.02] active:scale-[0.98]",
                      isSelected
                        ? `bg-gradient-to-br ${format.color} text-white border-transparent shadow-lg`
                        : "bg-white/5 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 hover:bg-white/10"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="font-semibold text-sm">{format.name}</span>
                    <span className="text-xs opacity-80 text-center">{format.description}</span>
                  </button>
                );
              })}
            </div>

            {/* Tier Display Based on Format */}
            <div className="space-y-6">
              {selectedFormat === 'standard' && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Standard Format Statistics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current generation competitive play</p>
                  </div>
                  
                  {/* Usage and Win Rate Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Singles Stats */}
                    <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <MdCatchingPokemon className="w-4 h-4 text-blue-400" />
                        Singles Format
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Usage Rate</span>
                            <span className="font-bold text-sm">{usageStats.usage.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, usageStats.usage * 10)}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Win Rate</span>
                            <span className="font-bold text-sm">{usageStats.winRate.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={cn(
                                "h-full",
                                usageStats.winRate >= 50 
                                  ? "bg-gradient-to-r from-green-400 to-green-600"
                                  : "bg-gradient-to-r from-orange-400 to-red-500"
                              )}
                              initial={{ width: 0 }}
                              animate={{ width: `${usageStats.winRate}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Doubles Stats */}
                    <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <MdCatchingPokemon className="w-4 h-4 text-purple-400" />
                        Doubles Format
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Usage Rate</span>
                            <span className="font-bold text-sm">{FORMAT_STATS.standard.doubles.usage}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purple-400 to-purple-600"
                              initial={{ width: 0 }}
                              animate={{ width: `${FORMAT_STATS.standard.doubles.usage * 10}%` }}
                              transition={{ duration: 0.8 }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Win Rate</span>
                            <span className="font-bold text-sm">{FORMAT_STATS.standard.doubles.winRate}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className={cn(
                                "h-full",
                                FORMAT_STATS.standard.doubles.winRate >= 50 
                                  ? "bg-gradient-to-r from-green-400 to-green-600"
                                  : "bg-gradient-to-r from-orange-400 to-red-500"
                              )}
                              initial={{ width: 0 }}
                              animate={{ width: `${FORMAT_STATS.standard.doubles.winRate}%` }}
                              transition={{ duration: 0.8, delay: 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

                  {/* All Tiers, VGC, and Battle Stadium in one row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Current Tiers */}
                    <div className="p-6 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <MdCatchingPokemon className="w-5 h-5 text-purple-400" />
                        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Current Tiers</p>
                      </div>
                      <div className="text-center">
                        {competitiveTiers ? (
                          <div className="flex items-center justify-center gap-4">
                            {competitiveTiers.singles_tier && (
                              <div className="flex flex-col items-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Singles</p>
                                <TierBadge tier={competitiveTiers.singles_tier} size="md" />
                              </div>
                            )}
                            {competitiveTiers.doubles_tier && (
                              <div className="flex flex-col items-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Doubles</p>
                                <TierBadge tier={competitiveTiers.doubles_tier} format="doubles" size="md" />
                              </div>
                            )}
                            {!competitiveTiers.singles_tier && !competitiveTiers.doubles_tier && (
                              <TierBadge tier={estimatedTier} size="md" />
                            )}
                          </div>
                        ) : (
                          <div>
                            <TierBadge tier={estimatedTier} size="md" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-2">
                              Estimated based on stats
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* VGC Eligibility */}
                    <div className="p-6 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <MdCatchingPokemon className="w-5 h-5 text-blue-400" />
                        <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">VGC Eligibility</h4>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-center">
                        {formatEligibility.vgc ? (
                          <>
                            <FaCheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Legal</span>
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Not Legal</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Battle Stadium */}
                    <div className="p-6 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <MdCatchingPokemon className="w-5 h-5 text-yellow-400" />
                        <h4 className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Battle Stadium</h4>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-center">
                        {formatEligibility.battleStadium ? (
                          <>
                            <FaCheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Legal</span>
                          </>
                        ) : (
                          <>
                            <FaTimesCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Restricted</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedFormat === 'nationalDex' && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-green-50 dark:from-teal-900/10 dark:to-green-900/10 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">National Dex Format</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">All generations with legacy mechanics</p>
                  </div>
                  
                  {/* National Dex Stats */}
                  <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <MdCatchingPokemon className="w-4 h-4 text-teal-400" />
                      National Dex Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Usage Rate</span>
                          <span className="font-bold text-sm">{FORMAT_STATS.nationalDex.usage}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-teal-400 to-teal-600"
                            initial={{ width: 0 }}
                            animate={{ width: `${FORMAT_STATS.nationalDex.usage * 10}%` }}
                            transition={{ duration: 0.8 }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Win Rate</span>
                          <span className="font-bold text-sm">{FORMAT_STATS.nationalDex.winRate}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className={cn(
                              "h-full",
                              FORMAT_STATS.nationalDex.winRate >= 50 
                                ? "bg-gradient-to-r from-green-400 to-green-600"
                                : "bg-gradient-to-r from-orange-400 to-red-500"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${FORMAT_STATS.nationalDex.winRate}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

                  <div className="text-center p-6 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <MdCatchingPokemon className="w-5 h-5 text-purple-400" />
                      <p className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">National Dex Tier</p>
                    </div>
                    {competitiveTiers?.national_dex_tier ? (
                      <TierBadge tier={competitiveTiers.national_dex_tier} format="national-dex" size="lg" />
                    ) : (
                      <div>
                        <TierBadge tier={estimatedTier} format="national-dex" size="lg" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic mt-2">
                          Estimated tier - actual may vary
                        </p>
                      </div>
                    )}
                    <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                      <p className="text-sm text-teal-700 dark:text-teal-300">
                        National Dex includes all Pokémon, Mega Evolutions, Z-Moves, and moves from every generation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedFormat === 'otherFormats' && (
                <div className="space-y-6">
                  {/* Section Header */}
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/10 dark:to-pink-900/10 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Alternative Formats</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Special rulesets and niche metagames</p>
                  </div>
                  
                  <div className="space-y-4">
                  {/* Little Cup */}
                  <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="font-semibold text-sm mb-2">Little Cup</h4>
                    <div className="flex items-start gap-2">
                      {formatEligibility.littleCup ? (
                        <>
                          <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Little Cup eligible (Level 5, unevolved)</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {species.is_baby
                              ? 'Baby Pokémon are banned in Little Cup'
                              : species.evolves_from_species
                              ? 'Has evolved - not LC eligible'
                              : 'Not eligible for Little Cup'}
                          </span>
                        </>
                      )}
                    </div>
                    {formatEligibility.littleCup && (
                      <div className="mt-2 text-xs">
                        <span className="text-gray-500">Usage: </span>
                        <span className="font-bold">{FORMAT_STATS.otherFormats.littleCup.usage}%</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

                  {/* Monotype */}
                  <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="font-semibold text-sm mb-2">Monotype</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Good on {pokemon.types?.map(t => t.type.name).join(' and ') || 'Unknown type'} teams
                    </p>
                    <div className="mt-2 text-xs">
                      <span className="text-gray-500">Usage: </span>
                      <span className="font-bold">{FORMAT_STATS.otherFormats.monotype.usage}%</span>
                      <span className="text-gray-500 ml-2">Win Rate: </span>
                      <span className="font-bold">{FORMAT_STATS.otherFormats.monotype.winRate}%</span>
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

                  {/* NFE */}
                  <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="font-semibold text-sm mb-2">NFE (Not Fully Evolved)</h4>
                    <div className="flex items-center gap-2">
                      {formatEligibility.nfe ? (
                        <>
                          <FaCheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Eligible for NFE format</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Fully evolved - not NFE eligible</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />

                  {/* 1v1 */}
                  <div className="p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="font-semibold text-sm mb-2">1v1</h4>
                    <div className="flex items-center gap-2">
                      {baseStatTotal >= 500 ? (
                        <>
                          <FaCheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">Viable in 1v1 format</span>
                        </>
                      ) : (
                        <>
                          <FaExclamationTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">May struggle in 1v1</span>
                        </>
                      )}
                    </div>
                  </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </GlassContainer>
      </motion.div>

      {/* Common Movesets */}
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
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                  <FaChessBishop className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Popular Movesets
                </h3>
              </div>
              {loading && <span className="text-xs text-gray-500 dark:text-gray-400 italic">Loading...</span>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(loading ? SAMPLE_MOVESETS : movesets).map((moveset, index) => {
                const roleInfo = ROLE_INFO[moveset.name as keyof typeof ROLE_INFO];
                const Icon = roleInfo?.icon || FaChessBishop;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 400 }}
                    whileHover={{ scale: 1.02 }}
                    className={cn(
                      "border rounded-xl overflow-hidden transition-all cursor-pointer",
                      "bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30",
                      "border-gray-200/50 dark:border-gray-700/50",
                      "hover:shadow-lg",
                      expandedMoveset === index && "ring-2 ring-purple-500/50"
                    )}
                    onClick={() => setExpandedMoveset(expandedMoveset === index ? null : index)}
                  >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={cn("w-5 h-5", roleInfo?.color || 'text-purple-400')} />
                          <h5 className="font-semibold text-gray-900 dark:text-white">
                            {moveset.name}
                          </h5>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold text-white shadow-md bg-gradient-to-r",
                          moveset.usage >= 40 ? "from-purple-500 to-pink-500" :
                          moveset.usage >= 25 ? "from-blue-500 to-purple-500" :
                          moveset.usage >= 10 ? "from-green-500 to-blue-500" :
                          "from-gray-500 to-gray-600"
                        )}>
                          {moveset.usage}% usage
                        </div>
                      </div>
                      
                      {/* Quick Info */}
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center p-2 bg-white/5 dark:bg-gray-800/50 rounded">
                          <p className="text-gray-500 dark:text-gray-400">Item</p>
                          <p className="font-medium">{moveset.item}</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 dark:bg-gray-800/50 rounded">
                          <p className="text-gray-500 dark:text-gray-400">Ability</p>
                          <p className="font-medium">{moveset.ability}</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 dark:bg-gray-800/50 rounded">
                          <p className="text-gray-500 dark:text-gray-400">Nature</p>
                          <p className="font-medium">{moveset.nature}</p>
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedMoveset === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-3 border-t border-gray-200/50 dark:border-gray-700/50">
                            {/* EVs */}
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                <HiSparkles className="w-4 h-4 text-purple-400" />
                                EV Spread
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(moveset.evs).map(([stat, value]) => {
                                  if (value === 0) return null;
                                  return (
                                    <div
                                      key={stat}
                                      className="flex items-center justify-between px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-sm"
                                    >
                                      <span className="text-purple-700 dark:text-purple-300">{STAT_NAMES[stat]}</span>
                                      <span className="font-bold text-purple-800 dark:text-purple-200">{value}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Moves */}
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-2">
                                <FaFistRaised className="w-4 h-4 text-red-400" />
                                Moveset
                              </p>
                              <div className="grid grid-cols-2 gap-2">
                                {moveset.moves.map(move => (
                                  <div
                                    key={move}
                                    className="px-3 py-2 rounded text-sm text-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 font-medium"
                                  >
                                    {move}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Data Notice */}
            {!loading && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  * Data calculated based on tier placement, stats, and type matchups
                </p>
              </div>
            )}
          </div>
        </GlassContainer>
      </motion.div>

      {/* Teammates and Counters */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Teammates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlassContainer 
            variant="dark" 
            className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl h-full"
            animate={false}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
                    <MdCatchingPokemon className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                    Common Teammates
                  </h3>
                </div>
                {loading && <span className="text-xs text-gray-500 dark:text-gray-400 italic">Loading...</span>}
              </div>
              <div className="space-y-3">
                {(loading ? COMMON_TEAMMATES : teammates).map((teammate, index) => (
                  <motion.div
                    key={teammate.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PokemonListItem
                      name={teammate.name}
                      value={teammate.usage}
                      valueLabel="pair rate"
                      onClick={() => router.push(`/pokedex/${teammate.name.toLowerCase()}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassContainer>
        </motion.div>

        {/* Top Counters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <GlassContainer 
            variant="dark" 
            className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl h-full"
            animate={false}
          >
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center">
                  <MdCatchingPokemon className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Top Counters
                </h3>
              </div>
              <div className="space-y-3">
                {(loading ? COUNTERS : counters).map((counter, index) => (
                  <motion.div
                    key={counter.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PokemonListItem
                      name={counter.name}
                      value={counter.winRate}
                      valueLabel="win vs"
                      isCounter={true}
                      onClick={() => router.push(`/pokedex/${counter.name.toLowerCase()}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </GlassContainer>
        </motion.div>
      </div>

      {/* Speed Tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <GlassContainer 
          variant="dark" 
          className="backdrop-blur-xl bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 shadow-xl"
          animate={false}
        >
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 flex items-center justify-center">
                <MdCatchingPokemon className="w-5 h-5 text-yellow-400" />
              </div>
              <h3 className="text-sm font-medium uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                Speed Tiers
              </h3>
            </div>
            <div className="space-y-4">
              {pokemon.stats?.find(s => s.stat.name === 'speed') && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      className="group"
                      whileHover={{ scale: 1.03, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <div className="text-center p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <FaRunning className="w-4 h-4 text-blue-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Base Speed</p>
                        </div>
                        <p className="text-2xl font-bold">{pokemon.stats?.find(s => s.stat.name === 'speed')?.base_stat}</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="group"
                      whileHover={{ scale: 1.03, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <div className="text-center p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <FaStar className="w-4 h-4 text-green-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Max Speed</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {Math.floor((pokemon.stats?.find(s => s.stat.name === 'speed')?.base_stat || 0) * 2 + 99 + 31 + 63) * 1.1}
                        </p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="group"
                      whileHover={{ scale: 1.03, y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <div className="text-center p-4 bg-gradient-to-br from-white/5 to-white/10 dark:from-gray-800/50 dark:to-gray-800/30 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <FaExchangeAlt className="w-4 h-4 text-purple-400" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">Scarf Speed</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {Math.floor(Math.floor((pokemon.stats?.find(s => s.stat.name === 'speed')?.base_stat || 0) * 2 + 99 + 31 + 63) * 1.1 * 1.5)}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    Speed calculations assume Level 100, 31 IVs, 252 EVs, and positive nature
                  </p>
                </>
              )}
            </div>
          </div>
        </GlassContainer>
      </motion.div>
    </div>
  );
};

export default CompetitiveTab;