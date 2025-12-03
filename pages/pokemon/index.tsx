import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import {
  FaBook, FaGamepad, FaDice, FaListAlt, FaFlask, FaMagic, FaGlobe, FaPaw,
  FaBalanceScale, FaDna, FaAppleAlt, FaStar, FaCalculator, FaRandom,
  FaChevronRight, FaDatabase, FaTools, FaCompass, FaFire, FaTint, FaLeaf
} from 'react-icons/fa';

// Section categories for better organization
const SECTION_CATEGORIES = [
  {
    id: 'database',
    title: 'Database',
    subtitle: 'Explore comprehensive data',
    icon: <FaDatabase className="w-4 h-4" />,
    color: 'from-blue-500 to-indigo-600',
    sections: [
      {
        title: 'Pokédex',
        description: 'All 1000+ Pokémon with stats, evolutions & more',
        href: '/pokedex',
        icon: <FaBook className="w-5 h-5" />,
        gradient: 'from-red-500 to-orange-500',
        featured: true,
      },
      {
        title: 'Moves',
        description: 'Complete move database with effects',
        href: '/pokemon/moves-unified',
        icon: <FaMagic className="w-5 h-5" />,
        gradient: 'from-blue-500 to-cyan-500',
      },
      {
        title: 'Abilities',
        description: 'Every ability and its effects',
        href: '/pokemon/abilities-unified',
        icon: <FaFlask className="w-5 h-5" />,
        gradient: 'from-purple-500 to-pink-500',
      },
      {
        title: 'Items',
        description: 'All items from every game',
        href: '/pokemon/items-unified',
        icon: <FaListAlt className="w-5 h-5" />,
        gradient: 'from-amber-500 to-yellow-500',
      },
      {
        title: 'Natures',
        description: 'All 25 natures & stat effects',
        href: '/pokemon/natures',
        icon: <FaDna className="w-5 h-5" />,
        gradient: 'from-pink-500 to-rose-500',
      },
      {
        title: 'Berries',
        description: 'Berry effects & growth times',
        href: '/pokemon/berries',
        icon: <FaAppleAlt className="w-5 h-5" />,
        gradient: 'from-red-400 to-pink-500',
      },
    ]
  },
  {
    id: 'tools',
    title: 'Tools',
    subtitle: 'Helpful utilities & calculators',
    icon: <FaTools className="w-4 h-4" />,
    color: 'from-emerald-500 to-teal-600',
    sections: [
      {
        title: 'Compare',
        description: 'Side-by-side stat comparison',
        href: '/pokemon/compare',
        icon: <FaBalanceScale className="w-5 h-5" />,
        gradient: 'from-indigo-500 to-blue-500',
        isNew: true,
      },
      {
        title: 'IV Calculator',
        description: 'Calculate hidden IVs',
        href: '/pokemon/iv-calculator',
        icon: <FaCalculator className="w-5 h-5" />,
        gradient: 'from-cyan-500 to-blue-500',
        isNew: true,
      },
      {
        title: 'Evolution Guide',
        description: 'All evolution methods explained',
        href: '/pokemon/evolution-guide',
        icon: <FaRandom className="w-5 h-5" />,
        gradient: 'from-green-400 to-emerald-500',
        isNew: true,
      },
      {
        title: 'Shiny Gallery',
        description: 'Browse shiny variations',
        href: '/pokemon/shiny',
        icon: <FaStar className="w-5 h-5" />,
        gradient: 'from-amber-400 to-yellow-500',
        isNew: true,
      },
    ]
  },
  {
    id: 'explore',
    title: 'Explore',
    subtitle: 'Discover the Pokémon world',
    icon: <FaCompass className="w-4 h-4" />,
    color: 'from-rose-500 to-pink-600',
    sections: [
      {
        title: 'Regions',
        description: 'All 9 regions with gym leaders & more',
        href: '/pokemon/regions',
        icon: <FaGlobe className="w-5 h-5" />,
        gradient: 'from-teal-500 to-cyan-500',
      },
      {
        title: 'Starters',
        description: 'Every starter from every gen',
        href: '/pokemon/starters',
        icon: <FaPaw className="w-5 h-5" />,
        gradient: 'from-rose-500 to-red-500',
      },
      {
        title: 'Games',
        description: 'Main series game info',
        href: '/pokemon/games',
        icon: <FaGamepad className="w-5 h-5" />,
        gradient: 'from-green-500 to-emerald-500',
      },
      {
        title: 'Fun',
        description: 'Mini-games & activities',
        href: '/fun',
        icon: <FaDice className="w-5 h-5" />,
        gradient: 'from-indigo-500 to-purple-500',
      },
    ]
  },
];

// Quick stats for the hero section
const QUICK_STATS = [
  { label: 'Pokémon', value: '1025+', icon: <FaBook className="w-4 h-4" /> },
  { label: 'Moves', value: '900+', icon: <FaMagic className="w-4 h-4" /> },
  { label: 'Abilities', value: '300+', icon: <FaFlask className="w-4 h-4" /> },
  { label: 'Regions', value: '9', icon: <FaGlobe className="w-4 h-4" /> },
];

// Featured Pokemon for visual appeal
const FEATURED_POKEMON = [
  { id: 6, name: 'Charizard' },
  { id: 9, name: 'Blastoise' },
  { id: 3, name: 'Venusaur' },
  { id: 25, name: 'Pikachu' },
  { id: 150, name: 'Mewtwo' },
];

const PokemonIndexPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Pokémon Database | DexTrends</title>
        <meta name="description" content="Explore the complete Pokémon database - Pokédex, moves, abilities, items, regions, and more. Your ultimate resource for all things Pokémon." />
      </Head>

      <div className="min-h-screen bg-white dark:bg-stone-900">
        {/* Hero Section */}
        <header className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-amber-500/10 to-blue-500/10 dark:from-red-500/5 dark:via-amber-500/5 dark:to-blue-500/5" />

          {/* Decorative Pokemon silhouettes */}
          <div className="absolute inset-0 overflow-hidden opacity-5 dark:opacity-[0.03]">
            <div className="absolute -right-20 -top-20 w-80 h-80">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png"
                alt=""
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64">
              <Image
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png"
                alt=""
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 pt-8 pb-12 sm:pt-12 sm:pb-16">
            {/* Main title */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 dark:text-white mb-4">
                Pokémon Database
              </h1>
              <p className="text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
                Your complete resource for everything Pokémon. Explore detailed stats, moves, abilities, and more.
              </p>
            </motion.div>

            {/* Quick stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex justify-center"
            >
              <div className="inline-flex flex-wrap justify-center gap-3 sm:gap-6 bg-white/80 dark:bg-stone-800/80 backdrop-blur-sm rounded-2xl px-4 sm:px-8 py-4 shadow-lg border border-stone-200/50 dark:border-stone-700/50">
                {QUICK_STATS.map((stat, i) => (
                  <div key={stat.label} className="flex items-center gap-2 px-3">
                    <div className="text-amber-500">{stat.icon}</div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">{stat.value}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{stat.label}</p>
                    </div>
                    {i < QUICK_STATS.length - 1 && (
                      <div className="hidden sm:block w-px h-8 bg-stone-200 dark:bg-stone-700 ml-3" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
          {/* Featured Pokédex Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/pokedex">
              <div className={cn(
                "relative overflow-hidden rounded-3xl",
                "bg-gradient-to-br from-red-500 to-orange-600",
                "p-6 sm:p-8",
                "cursor-pointer group",
                "hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-300"
              )}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute right-0 top-0 w-64 h-64 rounded-full bg-white blur-3xl" />
                  <div className="absolute left-1/2 bottom-0 w-48 h-48 rounded-full bg-white blur-3xl" />
                </div>

                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                  {/* Featured Pokemon sprites */}
                  <div className="flex -space-x-4 sm:-space-x-6">
                    {FEATURED_POKEMON.slice(0, 3).map((pokemon, i) => (
                      <div
                        key={pokemon.id}
                        className={cn(
                          "relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm",
                          "border-2 border-white/30",
                          "flex items-center justify-center",
                          "transform transition-transform group-hover:scale-105",
                          i === 0 && "z-30",
                          i === 1 && "z-20",
                          i === 2 && "z-10"
                        )}
                        style={{ transitionDelay: `${i * 50}ms` }}
                      >
                        <Image
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                          alt={pokemon.name}
                          width={80}
                          height={80}
                          className="w-16 h-16 sm:w-24 sm:h-24 object-contain drop-shadow-lg"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Text content */}
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      Explore the Pokédex
                    </h2>
                    <p className="text-white/80 mb-4 max-w-md">
                      Browse all 1025+ Pokémon with comprehensive stats, evolution chains, competitive analysis, and trading cards.
                    </p>
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-red-600 font-semibold rounded-xl group-hover:bg-white/90 transition-colors">
                      Open Pokédex
                      <FaChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.section>

          {/* Section Categories */}
          {SECTION_CATEGORIES.map((category, categoryIndex) => (
            <motion.section
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + categoryIndex * 0.1 }}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={cn(
                  "p-2 rounded-lg bg-gradient-to-br text-white",
                  category.color
                )}>
                  {category.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                    {category.title}
                  </h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">
                    {category.subtitle}
                  </p>
                </div>
              </div>

              {/* Section Cards Grid */}
              <div className={cn(
                "grid gap-3",
                category.sections.length <= 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-2 sm:grid-cols-4"
              )}>
                {category.sections.map((section, sectionIndex) => (
                  <Link key={section.title} href={section.href}>
                    <div className={cn(
                      "relative h-full p-4 sm:p-5 rounded-2xl",
                      "bg-white dark:bg-stone-800",
                      "border border-stone-200 dark:border-stone-700",
                      "hover:border-stone-300 dark:hover:border-stone-600",
                      "hover:shadow-lg hover:scale-[1.02]",
                      "transition-all duration-200",
                      "cursor-pointer group"
                    )}>
                      {/* NEW badge */}
                      {'isNew' in section && section.isNew && (
                        <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full">
                          NEW
                        </span>
                      )}

                      {/* Icon */}
                      <div className={cn(
                        "w-10 h-10 sm:w-11 sm:h-11 rounded-xl mb-3",
                        "bg-gradient-to-br text-white",
                        "flex items-center justify-center",
                        "group-hover:scale-110 transition-transform",
                        section.gradient
                      )}>
                        {section.icon}
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-stone-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {section.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 line-clamp-2">
                        {section.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.section>
          ))}

          {/* Type Quick Access */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="pt-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">
                Browse by Type
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Jump straight to Pokémon of your favorite type
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {[
                { name: 'fire', color: 'bg-orange-500', icon: <FaFire /> },
                { name: 'water', color: 'bg-blue-500', icon: <FaTint /> },
                { name: 'grass', color: 'bg-green-500', icon: <FaLeaf /> },
                { name: 'electric', color: 'bg-yellow-400' },
                { name: 'psychic', color: 'bg-pink-500' },
                { name: 'dragon', color: 'bg-indigo-600' },
                { name: 'dark', color: 'bg-stone-700' },
                { name: 'fairy', color: 'bg-pink-400' },
                { name: 'fighting', color: 'bg-red-600' },
                { name: 'ghost', color: 'bg-purple-600' },
                { name: 'steel', color: 'bg-slate-400' },
                { name: 'ice', color: 'bg-cyan-400' },
              ].map((type) => (
                <Link key={type.name} href={`/pokedex?type=${type.name}`}>
                  <button className={cn(
                    "px-4 py-2 rounded-full text-white text-sm font-medium capitalize",
                    "hover:scale-105 hover:shadow-lg transition-all",
                    "touch-manipulation",
                    type.color
                  )}>
                    {type.name}
                  </button>
                </Link>
              ))}
            </div>
          </motion.section>

          {/* Footer CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="pt-8 pb-4"
          >
            <div className="text-center bg-gradient-to-r from-stone-100 to-stone-50 dark:from-stone-800 dark:to-stone-850 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-3">
                Ready to catch 'em all?
              </h2>
              <p className="text-stone-600 dark:text-stone-400 mb-6 max-w-md mx-auto">
                Start exploring our comprehensive database with detailed information on every Pokémon ever released.
              </p>
              <Link href="/pokedex">
                <button className={cn(
                  "px-8 py-3 rounded-xl font-semibold text-white",
                  "bg-gradient-to-r from-red-500 to-orange-500",
                  "hover:from-red-600 hover:to-orange-600",
                  "hover:shadow-lg hover:scale-105",
                  "transition-all duration-200",
                  "touch-manipulation"
                )}>
                  Start Exploring
                </button>
              </Link>
            </div>
          </motion.section>
        </main>
      </div>
    </>
  );
};

// Full bleed layout
(PokemonIndexPage as NextPage & { fullBleed?: boolean }).fullBleed = true;

export default PokemonIndexPage;
