import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import { NextPage } from 'next';
import { IoGameController, IoSparkles, IoTrendingUp, IoHeart } from 'react-icons/io5';

// Components
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { GlobalSearch } from '../components/home/GlobalSearch';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';
import { Container } from '../components/ui/Container';
import { cn } from '../utils/cn';
import { TYPOGRAPHY, TRANSITION, SPRING_PHYSICS } from '../components/ui/design-system/glass-constants';

// Icons
import { Book, CardList, CrossedSwords, Bulb } from '../utils/icons';

// ===========================================
// ANIMATED COUNTER COMPONENT
// ===========================================

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ value, suffix = '', duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

// ===========================================
// FEATURE CARD COMPONENT
// ===========================================

interface FeatureCardProps {
  href: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  badge?: string;
}

function FeatureCard({ href, icon, iconBg, title, description, badge }: FeatureCardProps) {
  return (
    <Link href={href} className="h-full touch-target group">
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={SPRING_PHYSICS.snappy}
        className={cn(
          'bg-white dark:bg-stone-800/90 rounded-xl',
          'shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]',
          'transition-shadow duration-150 ease-out',
          'p-4 sm:p-5 md:p-6 cursor-pointer h-full flex flex-col min-h-[140px]',
          'border border-stone-100 dark:border-stone-700/50',
          'relative overflow-hidden'
        )}
      >
        {badge && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
            {badge}
          </span>
        )}
        <div className="flex flex-col items-center text-center flex-1">
          <div className={cn(
            'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full',
            'flex items-center justify-center mb-3 sm:mb-4',
            'group-hover:scale-105 transition-transform duration-150',
            iconBg
          )}>
            {icon}
          </div>
          <h3 className="text-sm sm:text-base md:text-xl font-semibold text-stone-800 dark:text-white mb-1 sm:mb-2">
            {title}
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm hidden sm:block">
            {description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}

// ===========================================
// STATS DATA
// ===========================================

const STATS = [
  { value: 1025, label: 'Pokémon', suffix: '' },
  { value: 150, label: 'TCG Sets', suffix: '+' },
  { value: 15000, label: 'Cards', suffix: '+' },
  { value: 919, label: 'Moves', suffix: '' },
];

// ===========================================
// FEATURES DATA
// ===========================================

const FEATURES = [
  {
    href: '/pokedex',
    icon: <Book className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-600 dark:text-red-400" />,
    iconBg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20',
    title: 'Pokédex',
    description: 'Browse all 1,025 Pokémon with stats',
  },
  {
    href: '/tcgexpansions',
    icon: <CardList className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-amber-600 dark:text-amber-400" />,
    iconBg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20',
    title: 'TCG Cards',
    description: 'Explore all TCG sets and cards',
  },
  {
    href: '/type-effectiveness',
    icon: <CrossedSwords className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-600 dark:text-orange-400" />,
    iconBg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20',
    title: 'Battle Tools',
    description: 'Type calculator & team builder',
  },
  {
    href: '/pocketmode',
    icon: <IoGameController className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-pink-600 dark:text-pink-400" />,
    iconBg: 'bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/20',
    title: 'TCG Pocket',
    description: 'Pocket cards, decks & pack opening',
    badge: 'New',
  },
  {
    href: '/market',
    icon: <IoTrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-green-600 dark:text-green-400" />,
    iconBg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20',
    title: 'Market',
    description: 'Price trends & market analytics',
  },
  {
    href: '/favorites',
    icon: <IoHeart className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-rose-600 dark:text-rose-400" />,
    iconBg: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/20',
    title: 'Favorites',
    description: 'Your saved Pokémon & cards',
  },
  {
    href: '/pokemon/regions',
    icon: <Bulb className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />,
    iconBg: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20',
    title: 'Regions',
    description: 'Explore Kanto to Paldea',
  },
  {
    href: '/fun',
    icon: <IoSparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-cyan-600 dark:text-cyan-400" />,
    iconBg: 'bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/20',
    title: 'Fun',
    description: 'Quizzes, random & mini games',
  },
];

// ===========================================
// QUICK LINKS DATA
// ===========================================

const QUICK_LINKS = [
  { href: '/battle-simulator/damage-calc', label: 'Damage Calculator' },
  { href: '/team-builder/ev-optimizer', label: 'EV Optimizer' },
  { href: '/pokemon/starters', label: 'Starter Pokémon' },
  { href: '/trending', label: 'Trending Cards' },
];

// ===========================================
// MAIN COMPONENT
// ===========================================

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>DexTrends - Everything Pokémon in One Place</title>
        <meta name="description" content="The complete Pokémon resource: Pokédex, TCG database, battle tools, and more. Search across all Pokémon data instantly." />
        <meta name="keywords" content="Pokemon, Pokedex, TCG, Pokemon cards, battle calculator, type effectiveness" />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="min-h-screen">
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 sm:pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              {/* Logo */}
              <div className="mb-4 sm:mb-6 h-20 xs:h-24 sm:h-32 md:h-40 flex items-center justify-center">
                <ProgressiveImage
                  src="/dextrendslogo.png"
                  alt="DexTrends"
                  className="h-full w-auto mx-auto"
                  imgClassName="filter brightness-90 contrast-110 object-contain"
                  priority={true}
                  aspectRatio="5/6"
                />
              </div>

              {/* Tagline */}
              <h1 className={cn(TYPOGRAPHY.heading.h1, 'mb-2 sm:mb-3 px-4')}>
                Everything Pokémon in One Place
              </h1>
              <p className={cn(TYPOGRAPHY.body.base, 'text-amber-600 dark:text-amber-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4')}>
                Search across Pokédex, TCG cards, moves, items, and more
              </p>

              {/* Global Search */}
              <GlobalSearch />
            </motion.div>
          </section>

          {/* Animated Stats Bar - solid bg for iOS performance */}
          <section className="border-y border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
                {STATS.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex flex-col items-center justify-center py-1"
                  >
                    <p className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-white leading-tight">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-1 font-medium">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Main Features Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
            >
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <FeatureCard {...feature} />
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Quick Access Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
            <Container variant="outline" className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className={cn(TYPOGRAPHY.heading.h5, 'mb-1')}>Quick Access</h2>
                  <p className="text-sm text-stone-500 dark:text-stone-400">Jump to popular tools</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'px-4 py-2.5 rounded-full text-sm font-medium min-h-[44px] flex items-center touch-manipulation',
                        'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300',
                        'hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300',
                        'active:bg-amber-200 dark:active:bg-amber-900/50',
                        TRANSITION.fast
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </Container>
          </section>

          {/* What's New Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 border-t border-stone-100 dark:border-stone-800">
            <h2 className={cn(TYPOGRAPHY.heading.h3, 'mb-6')}>What's New</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Featured Pokemon */}
              <Container variant="default" hover className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔥</span>
                  <h3 className={cn(TYPOGRAPHY.heading.h5)}>Trending</h3>
                </div>
                <div className="space-y-2">
                  {['Charizard', 'Pikachu', 'Gardevoir', 'Lucario'].map((name, i) => (
                    <Link
                      key={name}
                      href={`/pokedex/${[6, 25, 282, 448][i]}`}
                      className="flex items-center justify-between text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                      <span>#{i + 1} {name}</span>
                      <span className="text-xs text-green-600 dark:text-green-400">↑</span>
                    </Link>
                  ))}
                </div>
              </Container>

              {/* Latest TCG */}
              <Container variant="default" hover className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🃏</span>
                  <h3 className={cn(TYPOGRAPHY.heading.h5)}>Latest Sets</h3>
                </div>
                <div className="space-y-2">
                  <Link href="/tcgexpansions" className="block text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Scarlet & Violet Series
                  </Link>
                  <Link href="/pocketmode/expansions" className="block text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    TCG Pocket: Genetic Apex
                  </Link>
                  <Link href="/tcgexpansions" className="text-amber-600 dark:text-amber-400 text-sm font-medium inline-flex items-center gap-1 mt-2">
                    Browse All Sets →
                  </Link>
                </div>
              </Container>

              {/* Quick Links */}
              <Container variant="default" hover className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚡</span>
                  <h3 className={cn(TYPOGRAPHY.heading.h5)}>Explore</h3>
                </div>
                <div className="space-y-2">
                  <Link href="/pokemon/starters" className="block text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Starter Pokémon
                  </Link>
                  <Link href="/pokemon/games" className="block text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Pokémon Games
                  </Link>
                  <Link href="/battle-simulator" className="block text-sm text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                    Battle Simulator
                  </Link>
                </div>
              </Container>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-stone-100 dark:border-stone-800 mt-8 md:mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              <div className="text-center text-stone-500 dark:text-stone-400">
                <p className="mb-2 text-sm">© 2024 DexTrends. Not affiliated with Nintendo, Game Freak, or The Pokémon Company.</p>
                <p className="text-xs">
                  Data provided by{' '}
                  <a href="https://pokeapi.co" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 transition-colors" target="_blank" rel="noopener noreferrer">
                    PokéAPI
                  </a>{' '}
                  and{' '}
                  <a href="https://pokemontcg.io" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 transition-colors" target="_blank" rel="noopener noreferrer">
                    Pokémon TCG API
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

// Tell layout to use full bleed
(HomePage as any).fullBleed = true;

export default HomePage;
