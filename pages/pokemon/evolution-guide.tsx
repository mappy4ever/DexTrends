import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';
import {
  FiChevronLeft, FiChevronDown, FiSearch, FiX, FiZap, FiInfo,
  FiTrendingUp, FiStar, FiHeart, FiRefreshCw, FiSun, FiMapPin,
  FiPackage, FiUsers, FiDatabase, FiShuffle
} from 'react-icons/fi';

interface EvolutionMethod {
  key: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  examples: Array<{
    from: string;
    to: string;
    fromId: number;
    toId: number;
    condition: string;
  }>;
  tips: string[];
}

const EVOLUTION_METHODS: EvolutionMethod[] = [
  {
    key: 'level',
    name: 'Level Up',
    icon: <FiTrendingUp className="w-5 h-5" />,
    color: 'from-blue-500 to-cyan-500',
    description: 'The most common evolution method. Pokemon evolve when they reach a certain level.',
    examples: [
      { from: 'Charmander', to: 'Charmeleon', fromId: 4, toId: 5, condition: 'Level 16' },
      { from: 'Pidgey', to: 'Pidgeotto', fromId: 16, toId: 17, condition: 'Level 18' },
      { from: 'Magikarp', to: 'Gyarados', fromId: 129, toId: 130, condition: 'Level 20' },
    ],
    tips: [
      'Use Rare Candy or EXP Candy to level up quickly',
      'Battle trainers and wild Pokemon for experience',
      'Lucky Egg boosts experience gain by 50%'
    ]
  },
  {
    key: 'stone',
    name: 'Evolution Stone',
    icon: <FiStar className="w-5 h-5" />,
    color: 'from-purple-500 to-pink-500',
    description: 'Some Pokemon require special stones to evolve. These can be found or purchased.',
    examples: [
      { from: 'Pikachu', to: 'Raichu', fromId: 25, toId: 26, condition: 'Thunder Stone' },
      { from: 'Eevee', to: 'Vaporeon', fromId: 133, toId: 134, condition: 'Water Stone' },
      { from: 'Vulpix', to: 'Ninetales', fromId: 37, toId: 38, condition: 'Fire Stone' },
    ],
    tips: [
      'Fire Stone, Water Stone, Thunder Stone, Leaf Stone are common',
      'Moon Stone, Sun Stone, Shiny Stone, Dusk Stone, Dawn Stone exist',
      'Ice Stone was introduced in Generation VII'
    ]
  },
  {
    key: 'friendship',
    name: 'Friendship',
    icon: <FiHeart className="w-5 h-5" />,
    color: 'from-pink-500 to-rose-500',
    description: 'Pokemon evolve when they have high friendship with their trainer.',
    examples: [
      { from: 'Pichu', to: 'Pikachu', fromId: 172, toId: 25, condition: 'High Friendship' },
      { from: 'Eevee', to: 'Espeon', fromId: 133, toId: 196, condition: 'High Friendship (Day)' },
      { from: 'Golbat', to: 'Crobat', fromId: 42, toId: 169, condition: 'High Friendship' },
    ],
    tips: [
      'Walk with your Pokemon to increase friendship',
      'Give vitamins and berries',
      'Keep Pokemon in your party and avoid fainting',
      'Soothe Bell doubles friendship gain'
    ]
  },
  {
    key: 'trade',
    name: 'Trade',
    icon: <FiRefreshCw className="w-5 h-5" />,
    color: 'from-amber-500 to-orange-500',
    description: 'Some Pokemon only evolve when traded to another player.',
    examples: [
      { from: 'Kadabra', to: 'Alakazam', fromId: 64, toId: 65, condition: 'Trade' },
      { from: 'Machoke', to: 'Machamp', fromId: 67, toId: 68, condition: 'Trade' },
      { from: 'Haunter', to: 'Gengar', fromId: 93, toId: 94, condition: 'Trade' },
    ],
    tips: [
      'Some trade evolutions require holding an item',
      'Trade with a friend and trade back to get your evolved Pokemon',
      'Link Cable item can substitute trading in some games'
    ]
  },
  {
    key: 'time',
    name: 'Time of Day',
    icon: <FiSun className="w-5 h-5" />,
    color: 'from-yellow-500 to-amber-500',
    description: 'Certain Pokemon evolve only during specific times of day.',
    examples: [
      { from: 'Eevee', to: 'Espeon', fromId: 133, toId: 196, condition: 'Day + High Friendship' },
      { from: 'Eevee', to: 'Umbreon', fromId: 133, toId: 197, condition: 'Night + High Friendship' },
      { from: 'Rockruff', to: 'Lycanroc', fromId: 744, toId: 745, condition: 'Day / Night / Dusk' },
    ],
    tips: [
      'Day is typically 6:00 AM to 6:00 PM',
      'Night is 6:00 PM to 6:00 AM',
      'Some games have dusk (5:00 PM to 5:59 PM) as a special time'
    ]
  },
  {
    key: 'location',
    name: 'Location',
    icon: <FiMapPin className="w-5 h-5" />,
    color: 'from-emerald-500 to-teal-500',
    description: 'Some Pokemon evolve in specific locations or near special objects.',
    examples: [
      { from: 'Magneton', to: 'Magnezone', fromId: 82, toId: 462, condition: 'Magnetic Field / Thunder Stone' },
      { from: 'Eevee', to: 'Leafeon', fromId: 133, toId: 470, condition: 'Near Moss Rock / Leaf Stone' },
      { from: 'Eevee', to: 'Glaceon', fromId: 133, toId: 471, condition: 'Near Ice Rock / Ice Stone' },
    ],
    tips: [
      'Location requirements vary by game',
      'Later games often substitute items for location requirements',
      'Check in-game hints or guides for specific locations'
    ]
  },
  {
    key: 'item',
    name: 'Held Item',
    icon: <FiPackage className="w-5 h-5" />,
    color: 'from-indigo-500 to-blue-500',
    description: 'Pokemon evolve while holding specific items, usually combined with leveling or trading.',
    examples: [
      { from: 'Slowpoke', to: 'Slowking', fromId: 79, toId: 199, condition: 'Trade + King\'s Rock' },
      { from: 'Onix', to: 'Steelix', fromId: 95, toId: 208, condition: 'Trade + Metal Coat' },
      { from: 'Rhydon', to: 'Rhyperior', fromId: 112, toId: 464, condition: 'Trade + Protector' },
    ],
    tips: [
      'Items are often found in late-game areas',
      'Some items have a chance to be held by wild Pokemon',
      'Battle Tower/Frontier often sells evolution items'
    ]
  },
  {
    key: 'gender',
    name: 'Gender-Specific',
    icon: <FiUsers className="w-5 h-5" />,
    color: 'from-rose-500 to-pink-500',
    description: 'Some Pokemon have different evolutions based on their gender.',
    examples: [
      { from: 'Kirlia', to: 'Gallade', fromId: 281, toId: 475, condition: 'Male + Dawn Stone' },
      { from: 'Snorunt', to: 'Froslass', fromId: 361, toId: 478, condition: 'Female + Dawn Stone' },
      { from: 'Burmy', to: 'Mothim', fromId: 412, toId: 414, condition: 'Male, Level 20' },
    ],
    tips: [
      'Breeding can help get the desired gender',
      'Gender ratio varies by species',
      'Some Pokemon are gender-locked (always male or female)'
    ]
  },
  {
    key: 'move',
    name: 'Special Moves',
    icon: <FiDatabase className="w-5 h-5" />,
    color: 'from-violet-500 to-purple-500',
    description: 'Pokemon evolve when they know a specific move and level up.',
    examples: [
      { from: 'Piloswine', to: 'Mamoswine', fromId: 221, toId: 473, condition: 'Know Ancient Power' },
      { from: 'Lickitung', to: 'Lickilicky', fromId: 108, toId: 463, condition: 'Know Rollout' },
      { from: 'Tangela', to: 'Tangrowth', fromId: 114, toId: 465, condition: 'Know Ancient Power' },
    ],
    tips: [
      'Move Reminder can help teach forgotten moves',
      'Some moves are learned by leveling, TMs, or breeding',
      'Check the Pokemon\'s learnset for when moves are available'
    ]
  },
  {
    key: 'unique',
    name: 'Unique Methods',
    icon: <FiShuffle className="w-5 h-5" />,
    color: 'from-red-500 to-orange-500',
    description: 'Some Pokemon have completely unique evolution methods.',
    examples: [
      { from: 'Inkay', to: 'Malamar', fromId: 686, toId: 687, condition: 'Level 30+ upside down' },
      { from: 'Pancham', to: 'Pangoro', fromId: 674, toId: 675, condition: 'Level 32+ with Dark-type' },
      { from: 'Sliggoo', to: 'Goodra', fromId: 705, toId: 706, condition: 'Level 50+ while raining' },
    ],
    tips: [
      'Check guides for the specific game you\'re playing',
      'Some methods were simplified in later games',
      'Unique methods often reference the Pokemon\'s lore'
    ]
  },
];

const EEVEE_EVOLUTIONS = [
  { name: 'Vaporeon', type: 'water', method: 'Water Stone', id: 134, color: 'from-blue-400 to-cyan-400' },
  { name: 'Jolteon', type: 'electric', method: 'Thunder Stone', id: 135, color: 'from-yellow-400 to-amber-400' },
  { name: 'Flareon', type: 'fire', method: 'Fire Stone', id: 136, color: 'from-orange-400 to-red-400' },
  { name: 'Espeon', type: 'psychic', method: 'Friendship (Day)', id: 196, color: 'from-pink-400 to-purple-400' },
  { name: 'Umbreon', type: 'dark', method: 'Friendship (Night)', id: 197, color: 'from-indigo-400 to-stone-600' },
  { name: 'Leafeon', type: 'grass', method: 'Leaf Stone', id: 470, color: 'from-green-400 to-emerald-400' },
  { name: 'Glaceon', type: 'ice', method: 'Ice Stone', id: 471, color: 'from-cyan-400 to-blue-400' },
  { name: 'Sylveon', type: 'fairy', method: 'Fairy Move', id: 700, color: 'from-pink-400 to-rose-400' },
];

const EvolutionGuidePage: NextPage = () => {
  const router = useRouter();
  const [expandedMethod, setExpandedMethod] = useState<string | null>('level');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickTips, setShowQuickTips] = useState(false);

  const filteredMethods = useMemo(() =>
    EVOLUTION_METHODS.filter(method =>
      method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.examples.some(ex =>
        ex.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.to.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ),
    [searchQuery]
  );

  const stats = useMemo(() => ({
    methods: EVOLUTION_METHODS.length,
    eeveelutions: EEVEE_EVOLUTIONS.length,
    examples: EVOLUTION_METHODS.reduce((sum, m) => sum + m.examples.length, 0),
  }), []);

  return (
    <>
      <Head>
        <title>Pokémon Evolution Guide | DexTrends</title>
        <meta name="description" content="Complete guide to Pokemon evolution methods - level up, stones, trading, friendship, and more." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-white to-blue-50 dark:from-stone-950 dark:via-stone-900 dark:to-cyan-950">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 dark:opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-400 rounded-full blur-3xl" />
            <div className="absolute top-20 right-20 w-48 h-48 bg-blue-400 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-indigo-400 rounded-full blur-3xl" />
          </div>

          <div className="relative container mx-auto px-4 pt-6 pb-4">
            <button
              onClick={() => router.push('/pokemon')}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-colors mb-4"
            >
              <FiChevronLeft className="w-4 h-4" />
              Pokémon Hub
            </button>

            <div className="text-center mb-6">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl md:text-5xl font-black mb-3"
              >
                <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Evolution Guide
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-stone-600 dark:text-stone-400 max-w-2xl mx-auto"
              >
                Master every evolution method in Pokémon
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex justify-center gap-4 sm:gap-8 mb-4"
            >
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">{stats.methods}</div>
                <div className="text-xs sm:text-sm text-stone-500">Methods</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">{stats.eeveelutions}</div>
                <div className="text-xs sm:text-sm text-stone-500">Eeveelutions</div>
              </div>
              <div className="w-px bg-stone-300 dark:bg-stone-600" />
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{stats.examples}</div>
                <div className="text-xs sm:text-sm text-stone-500">Examples</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Eevee Showcase */}
        <div className="container mx-auto px-4 py-4">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-800">
            <h3 className="font-bold text-stone-900 dark:text-white mb-3 flex items-center gap-2">
              <FiStar className="text-amber-500" />
              Eevee: The Evolution Pokémon
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {/* Eevee */}
              <div className="flex-shrink-0 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-stone-700 rounded-xl flex items-center justify-center mb-1">
                  <img
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png"
                    alt="Eevee"
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-stone-900 dark:text-white">Eevee</span>
              </div>

              <div className="flex items-center text-stone-400 text-xl sm:text-2xl">→</div>

              {EEVEE_EVOLUTIONS.map(evo => (
                <Link key={evo.name} href={`/pokedex/${evo.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -4 }}
                    className="flex-shrink-0 text-center cursor-pointer"
                  >
                    <div className={cn(
                      'w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center mb-1',
                      'bg-gradient-to-br opacity-90 hover:opacity-100 transition-opacity',
                      evo.color
                    )}>
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                        alt={evo.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                      />
                    </div>
                    <span className="text-[10px] sm:text-xs font-medium text-stone-900 dark:text-white block">
                      {evo.name}
                    </span>
                    <span className="text-[8px] sm:text-[10px] text-stone-500 dark:text-stone-400">
                      {evo.method}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="sticky top-14 md:top-16 z-30 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl border-b border-stone-200 dark:border-stone-700">
          <div className="container mx-auto px-4 py-3">
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search evolution methods or Pokémon..."
                className={cn(
                  "w-full pl-10 pr-10 py-2.5 rounded-xl",
                  "bg-stone-100 dark:bg-stone-800",
                  "border border-stone-200 dark:border-stone-700",
                  "focus:ring-2 focus:ring-cyan-500 focus:border-transparent",
                  "text-stone-900 dark:text-white placeholder-stone-400",
                  "transition-all text-sm"
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Tips Toggle */}
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => setShowQuickTips(!showQuickTips)}
            className="flex items-center gap-2 text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
          >
            <FiInfo className="w-4 h-4" />
            {showQuickTips ? 'Hide' : 'Show'} Quick Tips
          </button>

          <AnimatePresence>
            {showQuickTips && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {[
                    { title: 'Cancel Evolution', desc: 'Press B during animation to cancel. Some Pokemon learn moves earlier when unevolved.' },
                    { title: 'Everstone', desc: 'Pokemon holding an Everstone won\'t evolve. Useful for breeding natures.' },
                    { title: 'Regional Variants', desc: 'Some Pokemon have regional forms with different evolution methods.' },
                    { title: 'Mega/Dynamax', desc: 'These are temporary battle transformations, not permanent evolutions.' },
                  ].map((tip, i) => (
                    <div key={i} className="bg-white dark:bg-stone-800 rounded-xl p-3 border border-stone-200 dark:border-stone-700">
                      <h4 className="font-semibold text-stone-900 dark:text-white text-sm mb-1">{tip.title}</h4>
                      <p className="text-xs text-stone-600 dark:text-stone-400">{tip.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Count */}
        <div className="container mx-auto px-4 pb-2">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Showing <span className="font-semibold text-stone-700 dark:text-stone-200">{filteredMethods.length}</span> evolution methods
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Evolution Methods */}
        <div className="container mx-auto px-4 pb-8">
          {filteredMethods.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                <FiSearch className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-2">No methods found</h3>
              <p className="text-stone-500 dark:text-stone-400">Try a different search term</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMethods.map((method, index) => (
                <motion.div
                  key={method.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.2) }}
                  className={cn(
                    "bg-white dark:bg-stone-800 rounded-xl overflow-hidden",
                    "border border-stone-200 dark:border-stone-700",
                    expandedMethod === method.key && "ring-2 ring-cyan-500"
                  )}
                >
                  {/* Method Header */}
                  <button
                    onClick={() => setExpandedMethod(expandedMethod === method.key ? null : method.key)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br",
                      method.color
                    )}>
                      {method.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-bold text-stone-900 dark:text-white">
                        {method.name}
                      </h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-1">
                        {method.description}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedMethod === method.key ? 180 : 0 }}
                      className="text-stone-400"
                    >
                      <FiChevronDown className="w-5 h-5" />
                    </motion.div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {expandedMethod === method.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-4 border-t border-stone-100 dark:border-stone-700 pt-4">
                          {/* Examples */}
                          <div>
                            <h4 className="text-sm font-semibold text-stone-900 dark:text-white mb-3">Examples</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {method.examples.map((ex, i) => (
                                <div key={i} className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3">
                                  <div className="flex items-center gap-2 justify-center mb-2">
                                    <Link href={`/pokedex/${ex.fromId}`} className="text-center hover:scale-110 transition-transform">
                                      <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ex.fromId}.png`}
                                        alt={ex.from}
                                        className="w-12 h-12 mx-auto"
                                      />
                                      <span className="text-xs text-stone-700 dark:text-stone-300">{ex.from}</span>
                                    </Link>
                                    <span className="text-stone-400 dark:text-stone-500">→</span>
                                    <Link href={`/pokedex/${ex.toId}`} className="text-center hover:scale-110 transition-transform">
                                      <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ex.toId}.png`}
                                        alt={ex.to}
                                        className="w-12 h-12 mx-auto"
                                      />
                                      <span className="text-xs text-stone-700 dark:text-stone-300">{ex.to}</span>
                                    </Link>
                                  </div>
                                  <p className="text-xs text-center text-cyan-600 dark:text-cyan-400 font-medium">
                                    {ex.condition}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Tips */}
                          <div>
                            <h4 className="text-sm font-semibold text-stone-900 dark:text-white mb-2">Tips</h4>
                            <ul className="space-y-1">
                              {method.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                                  <FiZap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Full bleed layout
(EvolutionGuidePage as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default EvolutionGuidePage;
