import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { NextPage } from 'next';
import { FiArrowRight, FiMap, FiGrid, FiLayers, FiTrendingUp } from 'react-icons/fi';

// Components
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { GlobalSearch } from '../components/home/GlobalSearch';
import { Container } from '../components/ui/Container';
import { cn } from '../utils/cn';
import { TRANSITION } from '../components/ui/design-system/glass-constants';
import { useHomepageData } from '../hooks/useHomepageData';

// ===========================================
// TYPE COLORS - Hex values for consistency with Pokedex
// ===========================================
const TYPE_COLORS_HEX: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

// Helper to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// ===========================================
// SKELETON COMPONENTS
// ===========================================
function PokemonSkeleton() {
  return (
    <div className="animate-pulse bg-stone-100 dark:bg-stone-800 rounded-2xl p-4 aspect-square">
      <div className="w-16 h-16 bg-stone-200 dark:bg-stone-700 rounded-full mx-auto mb-3" />
      <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-16 mx-auto mb-2" />
      <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded w-10 mx-auto" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2.5/3.5] bg-stone-200 dark:bg-stone-700 rounded-lg mb-2" />
      <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-1" />
      <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
    </div>
  );
}

function SetSkeleton() {
  return (
    <div className="animate-pulse flex items-center gap-3 p-4 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
      <div className="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-lg" />
      <div className="flex-1">
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-28 mb-2" />
        <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-20" />
      </div>
    </div>
  );
}

// ===========================================
// NAVIGATION CARDS - Cohesive amber/stone palette
// ===========================================
const NAV_SECTIONS = [
  {
    href: '/pokedex',
    icon: FiGrid,
    title: 'Pokédex',
    description: 'All 1,025 Pokémon with stats and moves',
    color: 'bg-gradient-to-br from-stone-700 to-stone-900 dark:from-stone-600 dark:to-stone-800',
  },
  {
    href: '/tcgexpansions',
    icon: FiLayers,
    title: 'TCG Database',
    description: 'Every card from every set',
    color: 'bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-600 dark:to-amber-800',
  },
  {
    href: '/market',
    icon: FiTrendingUp,
    title: 'Price Tracker',
    description: 'Live prices from TCGPlayer & CardMarket',
    color: 'bg-gradient-to-br from-stone-600 to-stone-800 dark:from-stone-500 dark:to-stone-700',
  },
  {
    href: '/pokemon/regions',
    icon: FiMap,
    title: 'Regions',
    description: 'Explore Kanto to Paldea',
    color: 'bg-gradient-to-br from-amber-600 to-orange-700 dark:from-amber-700 dark:to-orange-800',
  },
];

// ===========================================
// MAIN COMPONENT
// ===========================================
const HomePage: NextPage = () => {
  const { featuredPokemon, featuredCards, latestSets, latestPocketSets, loading } = useHomepageData();

  return (
    <>
      <Head>
        <title>DexTrends - Pokémon Database & TCG Price Tracker</title>
        <meta name="description" content="Complete Pokémon database with all 1,025 species. TCG card database with live prices from TCGPlayer and CardMarket. Your ultimate Pokémon resource." />
        <meta property="og:title" content="DexTrends - Pokémon Database & TCG Price Tracker" />
        <meta property="og:description" content="Complete Pokémon database and TCG card tracker with live market prices." />
        <meta property="og:type" content="website" />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 lg:pt-16 pb-10 sm:pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Logo - Larger, clearer */}
              <div className="mb-5 flex items-center justify-center">
                <Image
                  src="/dextrendslogo.png"
                  alt="DexTrends"
                  width={280}
                  height={70}
                  className="h-14 sm:h-16 md:h-20 w-auto"
                  priority
                  unoptimized
                />
              </div>

              {/* Tagline */}
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-stone-700 dark:text-stone-200 mb-2">
                Pokémon Database & TCG Price Tracker
              </h1>
              <p className="text-stone-500 dark:text-stone-400 mb-8 text-sm sm:text-base">
                Search 1,025 Pokémon and 15,000+ cards with live market prices
              </p>

              {/* Search */}
              <div className="max-w-xl mx-auto">
                <GlobalSearch />
              </div>
            </motion.div>
          </section>

          {/* Navigation Cards */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {NAV_SECTIONS.map((section, index) => (
                <motion.div
                  key={section.href}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Link href={section.href} className="block group h-full">
                    <div className={cn(
                      'relative overflow-hidden rounded-xl p-4 h-full min-h-[100px]',
                      section.color,
                      'shadow-sm hover:shadow-md transition-shadow duration-200'
                    )}>
                      <section.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-2" style={{ color: 'white' }} />
                      <h3 className="font-semibold text-sm sm:text-base mb-0.5" style={{ color: 'white' }}>
                        {section.title}
                      </h3>
                      <p className="text-xs leading-snug hidden sm:block" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {section.description}
                      </p>
                      <FiArrowRight className="absolute bottom-3 right-3 w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: 'white' }} />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Featured Pokémon */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-semibold text-stone-800 dark:text-white">
                Featured Pokémon
              </h2>
              <Link
                href="/pokedex"
                className={cn(
                  'text-sm font-medium text-amber-600 dark:text-amber-400',
                  'flex items-center gap-1 hover:gap-2',
                  TRANSITION.fast
                )}
              >
                View all <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <PokemonSkeleton key={i} />)
              ) : (
                featuredPokemon.map((pokemon, index) => {
                  const type1 = pokemon.types[0];
                  const type2 = pokemon.types[1];
                  const type1Color = TYPE_COLORS_HEX[type1] || '#A8A878';
                  const type2Color = type2 ? TYPE_COLORS_HEX[type2] : type1Color;
                  const isDualType = type2 && type1 !== type2;

                  const bgStyle = isDualType
                    ? {
                        background: `linear-gradient(135deg, ${hexToRgba(type1Color, 0.25)} 0%, ${hexToRgba(type1Color, 0.25)} 50%, ${hexToRgba(type2Color, 0.25)} 50%, ${hexToRgba(type2Color, 0.25)} 100%)`
                      }
                    : {
                        background: hexToRgba(type1Color, 0.25)
                      };

                  return (
                    <motion.div
                      key={pokemon.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/pokedex/${pokemon.id}`} className="block group">
                        <div
                          className={cn(
                            'relative rounded-xl overflow-hidden aspect-[4/5]',
                            'bg-white dark:bg-stone-800',
                            'border border-stone-200 dark:border-stone-700',
                            'hover:shadow-lg hover:border-stone-300 dark:hover:border-stone-600',
                            'transition-all duration-200'
                          )}
                        >
                          {/* Type color overlay */}
                          <div className="absolute inset-0" style={bgStyle} />

                          {/* Content */}
                          <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                            <Image
                              src={pokemon.sprite}
                              alt={pokemon.name}
                              width={88}
                              height={88}
                              className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md group-hover:scale-110 transition-transform"
                            />
                            <p className="text-stone-800 dark:text-white font-semibold text-center text-xs sm:text-sm mt-1 truncate w-full capitalize">
                              {pokemon.name}
                            </p>
                            <p className="text-stone-500 dark:text-stone-400 text-center text-xs font-medium">
                              #{String(pokemon.id).padStart(3, '0')}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })
              )}
            </div>
          </section>

          {/* TCG Cards */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-semibold text-stone-800 dark:text-white">
                TCG Cards
              </h2>
              <Link
                href="/tcgexpansions"
                className={cn(
                  'text-sm font-medium text-amber-600 dark:text-amber-400',
                  'flex items-center gap-1 hover:gap-2',
                  TRANSITION.fast
                )}
              >
                Browse all <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
              ) : featuredCards.length > 0 ? (
                featuredCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/tcg-cards/${card.id}`} className="block group">
                      <div className="relative">
                        <Image
                          src={card.image}
                          alt={card.name}
                          width={180}
                          height={250}
                          className="w-full rounded-lg shadow group-hover:shadow-lg group-hover:scale-[1.02] transition-all"
                        />
                        {card.price && (
                          <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/75 backdrop-blur-sm rounded px-2 py-1">
                            <p className="text-white font-semibold text-xs text-center">
                              ${card.price.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                      <p className="text-stone-700 dark:text-stone-300 text-xs font-medium mt-2 truncate">
                        {card.name}
                      </p>
                    </Link>
                  </motion.div>
                ))
              ) : (
                // Fallback: Show placeholder cards linking to TCG expansions
                Array.from({ length: 6 }).map((_, i) => (
                  <Link key={i} href="/tcgexpansions" className="block group">
                    <div className="aspect-[2.5/3.5] bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800 rounded-lg flex items-center justify-center">
                      <FiLayers className="w-8 h-8 text-stone-400 dark:text-stone-500" />
                    </div>
                    <p className="text-stone-500 text-xs mt-2 text-center">Browse cards</p>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Latest TCG Sets */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-semibold text-stone-800 dark:text-white">
                Latest TCG Sets
              </h2>
              <Link
                href="/tcgexpansions"
                className={cn(
                  'text-sm font-medium text-amber-600 dark:text-amber-400',
                  'flex items-center gap-1 hover:gap-2',
                  TRANSITION.fast
                )}
              >
                All sets <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SetSkeleton key={i} />)
              ) : latestSets.length > 0 ? (
                latestSets.map((set, index) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/tcgexpansions/${set.id}`} className="block group">
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                        {set.logo ? (
                          <Image
                            src={set.logo}
                            alt={set.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-contain"
                            unoptimized
                          />
                        ) : set.symbol ? (
                          <Image
                            src={set.symbol}
                            alt={set.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 bg-stone-100 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                            <FiLayers className="w-5 h-5 text-stone-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-800 dark:text-white text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {set.name}
                          </p>
                          <p className="text-stone-500 dark:text-stone-400 text-xs">
                            {set.cardCount} cards
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                // Fallback
                Array.from({ length: 3 }).map((_, i) => (
                  <Link key={i} href="/tcgexpansions" className="block">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                      <div className="w-10 h-10 bg-stone-100 dark:bg-stone-700 rounded-lg flex items-center justify-center">
                        <FiLayers className="w-5 h-5 text-stone-400" />
                      </div>
                      <div>
                        <p className="font-medium text-stone-600 dark:text-stone-300 text-sm">Browse sets</p>
                        <p className="text-stone-400 text-xs">View all expansions</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* TCG Pocket Sets */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-semibold text-stone-800 dark:text-white">
                TCG Pocket Sets
              </h2>
              <Link
                href="/pocketmode"
                className={cn(
                  'text-sm font-medium text-amber-600 dark:text-amber-400',
                  'flex items-center gap-1 hover:gap-2',
                  TRANSITION.fast
                )}
              >
                View all <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SetSkeleton key={i} />)
              ) : latestPocketSets.length > 0 ? (
                latestPocketSets.map((set, index) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/pocketmode/sets/${set.id}`} className="block group">
                      <div className="flex items-center gap-3 p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                        {set.logo ? (
                          <Image
                            src={set.logo}
                            alt={set.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-contain"
                            unoptimized
                          />
                        ) : set.symbol ? (
                          <Image
                            src={set.symbol}
                            alt={set.name}
                            width={40}
                            height={40}
                            className="w-10 h-10 object-contain"
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">P</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-800 dark:text-white text-sm truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {set.name}
                          </p>
                          <p className="text-stone-500 dark:text-stone-400 text-xs">
                            {set.cardCount} cards
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                // Fallback
                Array.from({ length: 3 }).map((_, i) => (
                  <Link key={i} href="/pocketmode" className="block">
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-bold">P</span>
                      </div>
                      <div>
                        <p className="font-medium text-stone-600 dark:text-stone-300 text-sm">Browse Pocket</p>
                        <p className="text-stone-400 text-xs">View all Pocket sets</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* More Features */}
          <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
            <h2 className="text-lg sm:text-xl font-semibold text-stone-800 dark:text-white mb-5 text-center">
              More to Explore
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: '/pocketmode', label: 'TCG Pocket', sub: 'Mobile game', color: TYPE_COLORS_HEX.psychic },
                { href: '/type-effectiveness', label: 'Type Chart', sub: 'Battle matchups', color: TYPE_COLORS_HEX.fighting },
                { href: '/favorites', label: 'Collections', sub: 'Your favorites', color: TYPE_COLORS_HEX.fairy },
                { href: '/trending', label: 'Trending', sub: 'Popular cards', color: TYPE_COLORS_HEX.electric },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block p-4 rounded-xl text-center relative overflow-hidden',
                    'bg-white dark:bg-stone-800',
                    'border border-stone-200 dark:border-stone-700',
                    'hover:shadow-md hover:border-stone-300 dark:hover:border-stone-600',
                    'transition-all duration-200'
                  )}
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: hexToRgba(item.color, 0.15) }}
                  />
                  <div className="relative z-10">
                    <p className="font-semibold text-stone-800 dark:text-white text-sm">
                      {item.label}
                    </p>
                    <p className="text-stone-500 dark:text-stone-400 text-xs mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-stone-200 dark:border-stone-800">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-stone-500 dark:text-stone-400 text-xs">
                <p className="mb-1">
                  Not affiliated with Nintendo, Game Freak, or The Pokémon Company.
                </p>
                <p>
                  Data from{' '}
                  <a href="https://pokeapi.co" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    PokéAPI
                  </a>
                  {' '}and{' '}
                  <a href="https://tcgdex.dev" className="text-amber-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    TCGDex
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </FullBleedWrapper>
    </>
  );
};

(HomePage as any).fullBleed = true;

export default HomePage;
