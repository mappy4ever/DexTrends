import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { NextPage } from 'next';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '../../components/ui/Container';
import { PageHeader } from '../../components/ui/BreadcrumbNavigation';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import { cn } from '../../utils/cn';
import {
  FaLevelUpAlt, FaGem, FaUserFriends, FaExchangeAlt, FaMoon, FaSun,
  FaMapMarkerAlt, FaCrown, FaHeart, FaQuestion, FaBolt, FaSearch,
  FaVenusMars, FaRandom, FaShieldAlt, FaMagic
} from 'react-icons/fa';

interface EvolutionMethod {
  name: string;
  icon: React.ReactNode;
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
    name: 'Level Up',
    icon: <FaLevelUpAlt className="w-5 h-5" />,
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
    name: 'Evolution Stone',
    icon: <FaGem className="w-5 h-5" />,
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
    name: 'Friendship',
    icon: <FaHeart className="w-5 h-5" />,
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
    name: 'Trade',
    icon: <FaExchangeAlt className="w-5 h-5" />,
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
    name: 'Time of Day',
    icon: <FaSun className="w-5 h-5" />,
    description: 'Certain Pokemon evolve only during specific times of day.',
    examples: [
      { from: 'Eevee', to: 'Espeon', fromId: 133, toId: 196, condition: 'Day + High Friendship' },
      { from: 'Eevee', to: 'Umbreon', fromId: 133, toId: 197, condition: 'Night + High Friendship' },
      { from: 'Rockruff', to: 'Lycanroc (Midday)', fromId: 744, toId: 745, condition: 'Day' },
    ],
    tips: [
      'Day is typically 6:00 AM to 6:00 PM',
      'Night is 6:00 PM to 6:00 AM',
      'Some games have dusk (5:00 PM to 5:59 PM) as a special time'
    ]
  },
  {
    name: 'Location',
    icon: <FaMapMarkerAlt className="w-5 h-5" />,
    description: 'Some Pokemon evolve in specific locations or near special objects.',
    examples: [
      { from: 'Magneton', to: 'Magnezone', fromId: 82, toId: 462, condition: 'Level up at Mt. Coronet / Magnetic Field' },
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
    name: 'Held Item',
    icon: <FaShieldAlt className="w-5 h-5" />,
    description: 'Pokemon evolve while holding specific items, usually combined with leveling or trading.',
    examples: [
      { from: 'Slowpoke', to: 'Slowking', fromId: 79, toId: 199, condition: 'Trade holding King\'s Rock' },
      { from: 'Onix', to: 'Steelix', fromId: 95, toId: 208, condition: 'Trade holding Metal Coat' },
      { from: 'Rhydon', to: 'Rhyperior', fromId: 112, toId: 464, condition: 'Trade holding Protector' },
    ],
    tips: [
      'Items are often found in late-game areas',
      'Some items have a chance to be held by wild Pokemon',
      'Battle Tower/Frontier often sells evolution items'
    ]
  },
  {
    name: 'Gender-Specific',
    icon: <FaVenusMars className="w-5 h-5" />,
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
    name: 'Special Moves',
    icon: <FaMagic className="w-5 h-5" />,
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
    name: 'Unique Methods',
    icon: <FaRandom className="w-5 h-5" />,
    description: 'Some Pokemon have completely unique evolution methods.',
    examples: [
      { from: 'Inkay', to: 'Malamar', fromId: 686, toId: 687, condition: 'Level 30+ with console upside down' },
      { from: 'Pancham', to: 'Pangoro', fromId: 674, toId: 675, condition: 'Level 32+ with Dark-type in party' },
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
  { name: 'Vaporeon', type: 'water', method: 'Water Stone', id: 134 },
  { name: 'Jolteon', type: 'electric', method: 'Thunder Stone', id: 135 },
  { name: 'Flareon', type: 'fire', method: 'Fire Stone', id: 136 },
  { name: 'Espeon', type: 'psychic', method: 'High Friendship (Day)', id: 196 },
  { name: 'Umbreon', type: 'dark', method: 'High Friendship (Night)', id: 197 },
  { name: 'Leafeon', type: 'grass', method: 'Leaf Stone / Moss Rock', id: 470 },
  { name: 'Glaceon', type: 'ice', method: 'Ice Stone / Ice Rock', id: 471 },
  { name: 'Sylveon', type: 'fairy', method: 'High Friendship + Fairy move', id: 700 },
];

/**
 * Evolution Guide Page
 *
 * Features:
 * - Comprehensive evolution method guide
 * - Visual examples with sprites
 * - Tips for each method
 * - Eevee evolution showcase
 */
const EvolutionGuidePage: NextPage = () => {
  const [expandedMethod, setExpandedMethod] = useState<string | null>('Level Up');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMethods = EVOLUTION_METHODS.filter(method =>
    method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    method.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    method.examples.some(ex =>
      ex.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.to.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Pokemon Evolution Guide | DexTrends</title>
        <meta name="description" content="Complete guide to Pokemon evolution methods - level up, stones, trading, friendship, and more." />
      </Head>

      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Evolution Guide"
          description="Master all Pokemon evolution methods"
          breadcrumbs={[
            { title: 'Home', href: '/', icon: '🏠', isActive: false },
            { title: 'Pokemon', href: '/pokemon', icon: '📖', isActive: false },
            { title: 'Evolution Guide', href: '/pokemon/evolution-guide', icon: '🔄', isActive: true },
          ]}
        />
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Eevee Showcase */}
        <Container variant="gradient" className="p-4 sm:p-6 mb-6">
          <h3 className="font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
            <FaCrown className="text-amber-500" />
            Eevee: The Evolution Pokemon
          </h3>
          <p className="text-sm text-stone-600 dark:text-stone-400 mb-4">
            Eevee has the most branching evolutions of any Pokemon, showcasing many different evolution methods.
          </p>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {/* Eevee */}
            <div className="flex-shrink-0 text-center">
              <div className="w-20 h-20 bg-white dark:bg-stone-700 rounded-xl flex items-center justify-center mb-2">
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png"
                  alt="Eevee"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <span className="text-xs font-medium text-stone-800 dark:text-white">Eevee</span>
            </div>

            <div className="flex items-center text-stone-300 dark:text-stone-600 text-2xl">→</div>

            {/* Eeveelutions */}
            {EEVEE_EVOLUTIONS.map(evo => (
              <Link key={evo.name} href={`/pokedex/${evo.id}`}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="flex-shrink-0 text-center cursor-pointer"
                >
                  <div className={cn(
                    'w-20 h-20 rounded-xl flex items-center justify-center mb-2',
                    'bg-white dark:bg-stone-700 hover:shadow-lg transition-shadow'
                  )}>
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                      alt={evo.name}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <span className="text-xs font-medium text-stone-800 dark:text-white block">
                    {evo.name}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400">
                    {evo.method}
                  </span>
                </motion.div>
              </Link>
            ))}
          </div>
        </Container>

        {/* Search */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search evolution methods or Pokemon..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
        </div>

        {/* Evolution Methods */}
        <div className="space-y-4">
          {filteredMethods.map((method, index) => (
            <motion.div
              key={method.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Container variant="elevated" className="overflow-hidden">
                {/* Method Header */}
                <button
                  onClick={() => setExpandedMethod(
                    expandedMethod === method.name ? null : method.name
                  )}
                  className="w-full p-4 sm:p-6 flex items-center gap-4 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white">
                    {method.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-stone-800 dark:text-white">
                      {method.name}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 line-clamp-1">
                      {method.description}
                    </p>
                  </div>
                  <motion.div
                    animate={{ rotate: expandedMethod === method.name ? 180 : 0 }}
                    className="text-stone-400"
                  >
                    ▼
                  </motion.div>
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedMethod === method.name && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4">
                        {/* Full Description */}
                        <p className="text-stone-600 dark:text-stone-400">
                          {method.description}
                        </p>

                        {/* Examples */}
                        <div>
                          <h4 className="font-semibold text-stone-800 dark:text-white mb-3">
                            Examples
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {method.examples.map((ex, i) => (
                              <div
                                key={i}
                                className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-3"
                              >
                                <div className="flex items-center gap-2 justify-center mb-2">
                                  <Link href={`/pokedex/${ex.fromId}`}>
                                    <div className="text-center hover:scale-110 transition-transform">
                                      <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ex.fromId}.png`}
                                        alt={ex.from}
                                        className="w-12 h-12 mx-auto"
                                      />
                                      <span className="text-xs text-stone-600 dark:text-stone-400">
                                        {ex.from}
                                      </span>
                                    </div>
                                  </Link>
                                  <span className="text-stone-400">→</span>
                                  <Link href={`/pokedex/${ex.toId}`}>
                                    <div className="text-center hover:scale-110 transition-transform">
                                      <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${ex.toId}.png`}
                                        alt={ex.to}
                                        className="w-12 h-12 mx-auto"
                                      />
                                      <span className="text-xs text-stone-600 dark:text-stone-400">
                                        {ex.to}
                                      </span>
                                    </div>
                                  </Link>
                                </div>
                                <p className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium">
                                  {ex.condition}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tips */}
                        <div>
                          <h4 className="font-semibold text-stone-800 dark:text-white mb-2">
                            Tips
                          </h4>
                          <ul className="space-y-1">
                            {method.tips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
                                <span className="text-amber-500 mt-1">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Container>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredMethods.length === 0 && (
          <Container variant="elevated" className="p-8 text-center">
            <FaSearch className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-800 dark:text-white mb-2">
              No evolution methods found
            </h3>
            <p className="text-stone-500 dark:text-stone-400">
              Try a different search term
            </p>
          </Container>
        )}

        {/* Quick Tips */}
        <Container variant="elevated" className="p-4 sm:p-6 mt-6">
          <h3 className="font-bold text-stone-800 dark:text-white mb-4 flex items-center gap-2">
            <FaBolt className="text-yellow-500" />
            Quick Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-stone-800 dark:text-white mb-2">
                Cancel Evolution
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Press B during evolution animation to cancel. Some Pokemon benefit from staying unevolved longer to learn moves earlier.
              </p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-stone-800 dark:text-white mb-2">
                Everstone
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Pokemon holding an Everstone won't evolve. Useful for keeping a pre-evolution or for breeding natures.
              </p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-stone-800 dark:text-white mb-2">
                Regional Variants
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Some Pokemon have regional forms that evolve differently. Check the specific region's requirements.
              </p>
            </div>
            <div className="bg-stone-50 dark:bg-stone-700/50 rounded-xl p-4">
              <h4 className="font-semibold text-stone-800 dark:text-white mb-2">
                Mega Evolution & Dynamax
              </h4>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                These are temporary battle transformations, not permanent evolutions. They require special items.
              </p>
            </div>
          </div>
        </Container>
      </div>
    </FullBleedWrapper>
  );
};

export default EvolutionGuidePage;
