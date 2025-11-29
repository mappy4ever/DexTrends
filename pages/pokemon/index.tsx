import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Container } from '../../components/ui/Container';
import { cn } from '../../utils/cn';
import { FaBook, FaGamepad, FaDice, FaListAlt, FaFlask, FaMagic, FaGlobe, FaPaw } from 'react-icons/fa';

const POKEMON_SECTIONS = [
  {
    title: 'Pokédex',
    description: 'Browse all 1000+ Pokémon with detailed stats, moves, and evolution chains',
    href: '/pokedex',
    icon: <FaBook className="w-6 h-6" />,
    color: 'from-red-500 to-orange-500',
  },
  {
    title: 'Moves',
    description: 'Explore the complete database of Pokémon moves and their effects',
    href: '/pokemon/moves-unified',
    icon: <FaMagic className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Abilities',
    description: 'Learn about every ability and which Pokémon can have them',
    href: '/pokemon/abilities-unified',
    icon: <FaFlask className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Items',
    description: 'Discover all the items available in the Pokémon games',
    href: '/pokemon/items-unified',
    icon: <FaListAlt className="w-6 h-6" />,
    color: 'from-amber-500 to-yellow-500',
  },
  {
    title: 'Games',
    description: 'Information about all main series Pokémon games',
    href: '/pokemon/games',
    icon: <FaGamepad className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500',
  },
  {
    title: 'Regions',
    description: 'Explore the different regions of the Pokémon world',
    href: '/pokemon/regions',
    icon: <FaGlobe className="w-6 h-6" />,
    color: 'from-teal-500 to-cyan-500',
  },
  {
    title: 'Starters',
    description: 'Meet all the starter Pokémon from every generation',
    href: '/pokemon/starters',
    icon: <FaPaw className="w-6 h-6" />,
    color: 'from-rose-500 to-red-500',
  },
  {
    title: 'Fun',
    description: 'Mini-games and fun Pokémon activities',
    href: '/fun',
    icon: <FaDice className="w-6 h-6" />,
    color: 'from-indigo-500 to-purple-500',
  },
];

const PokemonIndexPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Pokémon Database | DexTrends</title>
        <meta name="description" content="Explore the complete Pokémon database - Pokédex, moves, abilities, items, games, and more." />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-white to-stone-50 dark:from-stone-900 dark:to-black py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 dark:text-white mb-4">
              Pokémon Database
            </h1>
            <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
              Your comprehensive resource for all things Pokémon. Explore detailed information on every Pokémon, move, ability, and more.
            </p>
          </motion.div>

          {/* Sections Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {POKEMON_SECTIONS.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={section.href}>
                  <Container
                    variant="elevated"
                    className={cn(
                      'h-full p-6 cursor-pointer group',
                      'hover:scale-[1.02] transition-all duration-200',
                      'hover:shadow-lg'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                      'bg-gradient-to-br text-white',
                      section.color
                    )}>
                      {section.icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {section.title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                      {section.description}
                    </p>
                  </Container>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Featured Section - Pokédex CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Link href="/pokedex">
              <Container
                variant="gradient"
                className="p-8 cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
                      Start Exploring the Pokédex
                    </h2>
                    <p className="text-stone-600 dark:text-stone-400">
                      Browse through 1000+ Pokémon with comprehensive stats, evolution chains, competitive analysis, and more.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors">
                      Open Pokédex
                      <span className="text-lg">→</span>
                    </span>
                  </div>
                </div>
              </Container>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default PokemonIndexPage;
