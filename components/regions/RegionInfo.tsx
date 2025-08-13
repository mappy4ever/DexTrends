import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FadeIn, SlideUp, StaggeredChildren } from '../ui/animations/animations';
import { 
  BsPerson, 
  BsController, 
  BsGlobe, 
  BsBarChart,
  BsMap,
  BsSignpost,
  BsStar,
  BsGem
} from 'react-icons/bs';

// Type definitions
interface Leader {
  name: string;
  badge?: string;
  type?: string[];
  location?: string;
}

interface RegionData {
  name: string;
  description: string;
  professor: string;
  generation: string | number;
  pokemonRange: string;
  games: string[];
  color: string;
  cities: number;
  routes: number;
  gymLeaders?: Leader[];
  trialCaptains?: Leader[];
  islandKahunas?: Leader[];
  legendaries: { id: number; name: string }[];
  starterIds?: number[];
  starters?: string[];
  starterTypes?: string[][];
}

interface RegionInfoProps {
  region: RegionData;
  theme: 'light' | 'dark';
}

// Glass orb component for stats
const GlassOrb: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  delay?: number;
  size?: 'sm' | 'md' | 'lg';
}> = ({ icon, label, value, color, delay = 0, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-40 h-40',
    lg: 'w-48 h-48'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 170,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.05,
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={`relative ${sizeClasses[size]} group cursor-pointer`}
    >
      {/* Outer glass orb */}
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${color} opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-300`} />
      
      {/* Main glass orb */}
      <div className="relative w-full h-full rounded-full backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 border border-white/60 dark:border-gray-700/60 shadow-2xl overflow-hidden">
        {/* Inner gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
        
        {/* Shimmer effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>
        
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-4">
          <div className={`text-3xl mb-2 bg-gradient-to-br ${color} bg-clip-text text-transparent drop-shadow-sm`}>
            {icon}
          </div>
          <div className="text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider mb-1 drop-shadow-sm">
            {label}
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white text-center drop-shadow-sm">
            {value}
          </div>
        </div>
        
        {/* Glass reflection */}
        <div className="absolute top-2 left-2 right-2 h-1/3 bg-gradient-to-b from-white/40 to-transparent rounded-full blur-sm" />
      </div>
    </motion.div>
  );
};

const RegionInfo: React.FC<RegionInfoProps> = ({ region, theme }) => {
  // Color mapping for generation-based gradients
  const generationColors: Record<number, string> = {
    1: 'from-red-400 to-blue-400',
    2: 'from-yellow-400 to-orange-400',
    3: 'from-emerald-400 to-teal-400',
    4: 'from-indigo-400 to-purple-400',
    5: 'from-gray-500 to-slate-600',
    6: 'from-pink-400 to-rose-400',
    7: 'from-orange-400 to-amber-400',
    8: 'from-purple-400 to-violet-400',
    9: 'from-violet-400 to-fuchsia-400'
  };

  const genColor = generationColors[Number(region.generation)] || 'from-gray-400 to-gray-500';

  return (
    <div className="relative py-16 overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section with glass effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl px-8 py-6 shadow-2xl border border-white/30 dark:border-gray-700/30">
            <h2 className="text-5xl font-black mb-3 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {region.name} Region
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
              {region.description}
            </p>
          </div>
        </motion.div>

        {/* Glass Orbs Grid */}
        <div className="flex flex-wrap justify-center items-center gap-8 mb-16">
          {/* Professor Orb */}
          <GlassOrb
            icon={<BsPerson />}
            label="Professor"
            value={region.professor.replace('Professor ', '')}
            color="from-purple-400 to-pink-400"
            delay={0}
          />

          {/* Generation Orb - Larger */}
          <GlassOrb
            icon={<BsGlobe />}
            label="Generation"
            value={`Gen ${region.generation}`}
            color={genColor}
            delay={0.1}
            size="lg"
          />

          {/* Pokédex Orb */}
          <GlassOrb
            icon={<BsBarChart />}
            label="Pokédex"
            value={region.pokemonRange}
            color="from-blue-400 to-cyan-400"
            delay={0.2}
          />

          {/* Cities Orb */}
          <GlassOrb
            icon={<BsMap />}
            label="Cities"
            value={region.cities}
            color="from-green-400 to-emerald-400"
            delay={0.3}
            size="sm"
          />

          {/* Routes Orb */}
          <GlassOrb
            icon={<BsSignpost />}
            label="Routes"
            value={region.routes}
            color="from-amber-400 to-orange-400"
            delay={0.4}
            size="sm"
          />

          {/* Legendaries Orb */}
          <GlassOrb
            icon={<BsStar />}
            label="Legendaries"
            value={region.legendaries.length}
            color="from-yellow-400 to-gold-400"
            delay={0.5}
          />
        </div>

        {/* Games Section with Glass Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
            Available Games
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {region.games.map((game, index) => (
              <Link
                key={game}
                href={`/pokemon/games/${game.toLowerCase().replace(/\s+/g, '-')}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 0.7 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="relative group cursor-pointer"
                >
                  <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl px-6 py-3 shadow-lg border border-white/30 dark:border-gray-700/30 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${genColor} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                    <div className="relative flex items-center gap-2">
                      <BsController className="text-lg text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                      <span className="font-semibold text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{game}</span>
                    </div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Starters Preview Section */}
        {region.starterIds && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
              Starter Pokémon
            </h3>
            <div className="flex justify-center gap-8">
              {region.starterIds.map((id, index) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5,
                    delay: 0.9 + index * 0.1,
                    type: "spring"
                  }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="relative group"
                >
                  <div className="w-32 h-32 rounded-full backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/30 dark:border-gray-700/30 shadow-xl overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      index === 0 ? 'from-green-400/20 to-emerald-400/20' :
                      index === 1 ? 'from-red-400/20 to-orange-400/20' :
                      'from-blue-400/20 to-cyan-400/20'
                    }`} />
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                      alt={region.starters?.[index] || ''}
                      className="w-full h-full object-contain p-4"
                    />
                    {/* Glass reflection */}
                    <div className="absolute top-2 left-2 right-2 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-full blur-sm" />
                  </div>
                  <p className="text-center mt-2 font-semibold text-gray-700 dark:text-gray-300">
                    {region.starters?.[index]}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Legendary Pokémon Glass Gallery */}
        {region.legendaries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-800 dark:text-white">
              Legendary Pokémon
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {region.legendaries.map((legendary, index) => (
                <motion.div
                  key={legendary.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.4,
                    delay: 1.1 + index * 0.05,
                    type: "spring"
                  }}
                  whileHover={{ scale: 1.05, y: -3 }}
                  className="relative group"
                >
                  <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-50/80 via-white/80 to-amber-50/80 dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80 rounded-2xl p-4 shadow-xl border border-yellow-200/30 dark:border-yellow-700/30 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-amber-400/10" />
                    <div className="relative flex items-center gap-3">
                      <BsGem className="text-xl text-yellow-600 dark:text-yellow-400" />
                      <span className="font-bold text-gray-800 dark:text-white">{legendary.name}</span>
                    </div>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RegionInfo;