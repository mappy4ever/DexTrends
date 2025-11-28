import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NextPage } from 'next';

// Components
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { GlobalSearch } from '../components/home/GlobalSearch';
import { TouchTarget } from '../components/ui/TouchTarget';
import { ProgressiveImage } from '../components/ui/ProgressiveImage';

// Icons
import { Book, CardList, CrossedSwords, Bulb } from '../utils/icons';

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
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Logo - Responsive sizing for mobile */}
              <div className="mb-6 sm:mb-8 h-24 xs:h-28 sm:h-36 md:h-44 lg:h-48 flex items-center justify-center">
                <ProgressiveImage
                  src="/dextrendslogo.png"
                  alt="DexTrends"
                  className="h-full w-auto mx-auto"
                  imgClassName="filter brightness-90 contrast-110 object-contain"
                  priority={true}
                  aspectRatio="5/6"
                />
              </div>

              {/* Tagline - Better mobile sizing */}
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-stone-800 dark:text-white mb-3 sm:mb-4 px-4">
                Everything Pokémon in One Place
              </h1>
              <p className="text-sm xs:text-base sm:text-lg text-amber-600 dark:text-amber-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                Search across Pokédex, TCG cards, moves, items, and more
              </p>

              {/* Global Search */}
              <GlobalSearch />
            </motion.div>
          </section>

          {/* Quick Stats Bar - Responsive grid */}
          <section className="border-y border-stone-200 dark:border-stone-700 bg-white/60 dark:bg-stone-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-white leading-tight">1,025</p>
                  <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1">Pokémon</p>
                </div>
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-white leading-tight">150+</p>
                  <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1">TCG Sets</p>
                </div>
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-white leading-tight">15,000+</p>
                  <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1">Cards</p>
                </div>
                <div className="flex flex-col items-center justify-center py-2">
                  <p className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-white leading-tight">919</p>
                  <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-1">Moves</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Features - Mobile-optimized grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
            >
              {/* Pokédex */}
              <Link href="/pokedex" className="h-full touch-target group">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="bg-white dark:bg-stone-800/90 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-150 ease-out p-4 sm:p-5 md:p-6 cursor-pointer h-full flex flex-col min-h-[140px] border border-stone-100 dark:border-stone-700/50"
                >
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-150">
                      <Book className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-sm sm:text-base md:text-xl font-semibold text-amber-800 dark:text-white mb-1 sm:mb-2">Pokédex</h3>
                    <p className="text-amber-500 dark:text-amber-400 text-xs sm:text-sm hidden sm:block">
                      Browse all 1,025 Pokémon with stats
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* TCG Database */}
              <Link href="/tcgexpansions" className="h-full touch-target group">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="bg-white dark:bg-stone-800/90 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-150 ease-out p-4 sm:p-5 md:p-6 cursor-pointer h-full flex flex-col min-h-[140px] border border-stone-100 dark:border-stone-700/50"
                >
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-150">
                      <CardList className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-sm sm:text-base md:text-xl font-semibold text-amber-800 dark:text-white mb-1 sm:mb-2">TCG Cards</h3>
                    <p className="text-amber-500 dark:text-amber-400 text-xs sm:text-sm hidden sm:block">
                      Explore all TCG sets and cards
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* Battle Tools */}
              <Link href="/type-effectiveness" className="h-full touch-target group">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="bg-white dark:bg-stone-800/90 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-150 ease-out p-4 sm:p-5 md:p-6 cursor-pointer h-full flex flex-col min-h-[140px] border border-stone-100 dark:border-stone-700/50"
                >
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-150">
                      <CrossedSwords className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-sm sm:text-base md:text-xl font-semibold text-amber-800 dark:text-white mb-1 sm:mb-2">Battle</h3>
                    <p className="text-amber-500 dark:text-amber-400 text-xs sm:text-sm hidden sm:block">
                      Type calculator & team tools
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* Resources */}
              <Link href="/pokemon/moves" className="h-full touch-target group">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="bg-white dark:bg-stone-800/90 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-150 ease-out p-4 sm:p-5 md:p-6 cursor-pointer h-full flex flex-col min-h-[140px] border border-stone-100 dark:border-stone-700/50"
                >
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-150">
                      <Bulb className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-sm sm:text-base md:text-xl font-semibold text-amber-800 dark:text-white mb-1 sm:mb-2">Resources</h3>
                    <p className="text-amber-500 dark:text-amber-400 text-xs sm:text-sm hidden sm:block">
                      Complete database of moves, abilities, items, and more
                    </p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </section>

          {/* What's New Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 border-t border-stone-100 dark:border-stone-800">
            <h2 className="text-2xl font-semibold text-stone-800 dark:text-white mb-6">What's New</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {/* Latest Set */}
              <div className="bg-white dark:bg-stone-800/90 rounded-xl p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-150 border border-stone-100 dark:border-stone-700/50">
                <h3 className="font-semibold text-amber-800 dark:text-white mb-2">Latest TCG Set</h3>
                <p className="text-amber-500 dark:text-amber-400 mb-4 text-sm">Paldea Evolved - 279 cards</p>
                <Link href="/tcgexpansions/sv2" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium text-sm inline-flex items-center gap-1 transition-colors duration-150">
                  View Set <span className="text-xs">→</span>
                </Link>
              </div>

              {/* Popular Pokemon */}
              <div className="bg-white dark:bg-stone-800/90 rounded-xl p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-150 border border-stone-100 dark:border-stone-700/50">
                <h3 className="font-semibold text-amber-800 dark:text-white mb-3">Trending Pokémon</h3>
                <div className="space-y-2">
                  <Link href="/pokedex/6" className="block text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-400 text-sm transition-colors duration-150">
                    • Charizard
                  </Link>
                  <Link href="/pokedex/25" className="block text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-400 text-sm transition-colors duration-150">
                    • Pikachu
                  </Link>
                  <Link href="/pokedex/282" className="block text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-400 text-sm transition-colors duration-150">
                    • Gardevoir
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white dark:bg-stone-800/90 rounded-xl p-5 md:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-150 border border-stone-100 dark:border-stone-700/50">
                <h3 className="font-semibold text-amber-800 dark:text-white mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/pokemon/starters" className="block text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-400 text-sm transition-colors duration-150">
                    • Starter Pokémon
                  </Link>
                  <Link href="/pokemon/regions" className="block text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-400 text-sm transition-colors duration-150">
                    • Explore Regions
                  </Link>
                  <Link href="/fun" className="block text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-400 text-sm transition-colors duration-150">
                    • Mini Games
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-stone-100 dark:border-stone-800 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              <div className="text-center text-amber-500 dark:text-amber-400">
                <p className="mb-2 text-sm">© 2024 DexTrends. Not affiliated with Nintendo, Game Freak, or The Pokémon Company.</p>
                <p className="text-xs text-amber-400 dark:text-amber-500">
                  Data provided by <a href="https://pokeapi.co" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors duration-150" target="_blank" rel="noopener noreferrer">PokéAPI</a> and <a href="https://pokemontcg.io" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors duration-150" target="_blank" rel="noopener noreferrer">Pokémon TCG API</a>
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