import React from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NextPage } from 'next';

// Components
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { GlobalSearch } from '../components/home/GlobalSearch';

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
          <section className="max-w-7xl mx-auto px-4 md:px-6 pt-12 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              {/* Logo */}
              <div className="mb-8">
                <Image
                  src="/images/dextrends-vertical-logo.png"
                  alt="DexTrends"
                  width={300}
                  height={360}
                  className="h-32 sm:h-40 md:h-48 w-auto mx-auto filter brightness-90 contrast-110"
                  priority
                />
              </div>

              {/* Tagline */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
                Everything Pokémon in One Place
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                Search across Pokédex, TCG cards, moves, items, and more with our unified search
              </p>

              {/* Global Search */}
              <GlobalSearch />
            </motion.div>
          </section>

          {/* Quick Stats Bar */}
          <section className="border-y border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">1,025</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pokémon</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">150+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">TCG Sets</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">15,000+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Cards</p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-gray-800 dark:text-white leading-tight">919</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Moves</p>
                </div>
              </div>
            </div>
          </section>

          {/* Main Features */}
          <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {/* Pokédex */}
              <Link href="/pokedex" className="h-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer h-full flex flex-col"
                >
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                      <Book className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Pokédex</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Browse all 1,025 Pokémon with complete stats, abilities, and evolutions
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* TCG Database */}
              <Link href="/tcgexpansions" className="h-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer h-full flex flex-col"
                >
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                      <CardList className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">TCG Database</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Explore cards from all Pokémon TCG sets with images and details
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* Battle Tools */}
              <Link href="/type-effectiveness" className="h-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer h-full flex flex-col"
                >
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mb-4">
                      <CrossedSwords className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Battle Tools</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Type calculator, damage calculator, and team building tools
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* Resources */}
              <Link href="/pokemon/moves" className="h-full">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 p-6 cursor-pointer h-full flex flex-col"
                >
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                      <Bulb className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Resources</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Complete database of moves, abilities, items, and more
                    </p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </section>

          {/* What's New Section */}
          <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">What's New</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Latest Set */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">Latest TCG Set</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Paldea Evolved - 279 cards</p>
                <Link href="/tcgexpansions/sv2" className="text-purple-600 hover:text-purple-700 font-medium">
                  View Set →
                </Link>
              </div>

              {/* Popular Pokemon */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">Trending Pokémon</h3>
                <div className="space-y-2">
                  <Link href="/pokedex/6" className="block text-gray-600 dark:text-gray-400 hover:text-purple-600">
                    • Charizard
                  </Link>
                  <Link href="/pokedex/25" className="block text-gray-600 dark:text-gray-400 hover:text-purple-600">
                    • Pikachu
                  </Link>
                  <Link href="/pokedex/282" className="block text-gray-600 dark:text-gray-400 hover:text-purple-600">
                    • Gardevoir
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/pokemon/starters" className="block text-gray-600 dark:text-gray-400 hover:text-purple-600">
                    • Starter Pokémon
                  </Link>
                  <Link href="/pokemon/regions" className="block text-gray-600 dark:text-gray-400 hover:text-purple-600">
                    • Explore Regions
                  </Link>
                  <Link href="/fun" className="block text-gray-600 dark:text-gray-400 hover:text-purple-600">
                    • Mini Games
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center text-gray-600 dark:text-gray-400">
                <p className="mb-2">© 2024 DexTrends. Not affiliated with Nintendo, Game Freak, or The Pokémon Company.</p>
                <p className="text-sm">
                  Data provided by <a href="https://pokeapi.co" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">PokéAPI</a> and <a href="https://pokemontcg.io" className="text-purple-600 hover:underline" target="_blank" rel="noopener noreferrer">Pokémon TCG API</a>
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