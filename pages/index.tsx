import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';

// Components
import FullBleedWrapper from '../components/ui/FullBleedWrapper';
import { GlobalSearch } from '../components/home/GlobalSearch';
import { HeroLogo } from '../components/ui/DexTrendsLogo';
import { MobileLayout, MobileContainer, MobileSection } from '../components/mobile/MobileLayout';
import { useMobileUtils } from '../utils/mobileUtils';

// Icons
import { Book, CardList, CrossedSwords, Bulb } from '../utils/icons';

// Dynamically import mobile-specific components
const MobileSearchExperience = dynamic<any>(() => import('../components/mobile/MobileSearchExperience').then(mod => ({ default: mod.MobileSearchExperience })), {
  ssr: false
});

const HomePage: NextPage = () => {
  const { screenCategory } = useMobileUtils();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Detect mobile based on viewport width, not just user agent
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobileView(width < 768); // Use 768px as mobile breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      <Head>
        <title>DexTrends - Everything Pokémon in One Place</title>
        <meta name="description" content="The complete Pokémon resource: Pokédex, TCG database, battle tools, and more. Search across all Pokémon data instantly." />
        <meta name="keywords" content="Pokemon, Pokedex, TCG, Pokemon cards, battle calculator, type effectiveness" />
      </Head>

      {/* Mobile-First Layout */}
      {isMobileView ? (
        <MobileLayout
          hasBottomNav={false}
          hasHeader={false}
          backgroundColor="gradient"
          fullHeight={true}
        >
          <MobileContainer className="min-h-screen pb-8">
            {/* Mobile Search Overlay */}
            {showMobileSearch && (
              <MobileSearchExperience
                isOpen={showMobileSearch}
                onClose={() => setShowMobileSearch(false)}
                onSearch={(query: string) => {
                  // Handle search
                  setShowMobileSearch(false);
                }}
                placeholder="Search Pokémon, cards, moves..."
              />
            )}

            {/* Compact Mobile Hero */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="pt-12 pb-6 text-center"
            >
              {/* Logo - Smaller on mobile */}
              <div className="mb-4 flex justify-center scale-75">
                <HeroLogo />
              </div>

              {/* Compact Tagline */}
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Everything Pokémon
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 px-4">
                Pokédex, TCG cards, moves & more
              </p>

              {/* Mobile Search Button */}
              <button
                onClick={() => setShowMobileSearch(true)}
                className="w-full max-w-xs mx-auto px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-base">Search everything...</span>
              </button>
            </motion.section>

            {/* Mobile Stats Grid */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 dark:bg-gray-800/80 rounded-2xl shadow-md p-4 mb-6"
            >
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 rounded-xl">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">1,025</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Pokémon</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20 rounded-xl">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">150+</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">TCG Sets</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/20 rounded-xl">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">15,000+</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Cards</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-900/20 rounded-xl">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">919</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Moves</p>
                </div>
              </div>
            </motion.section>

            {/* Mobile Feature Cards - Vertical Stack */}
            <MobileSection title="Explore" defaultOpen={true}>
              <div className="space-y-4">
                {/* Pokédex Card */}
                <Link href="/pokedex">
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md active:shadow-sm transition-all"
                  >
                    <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Book className="w-7 h-7 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Pokédex</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        Browse all 1,025 Pokémon with stats & evolutions
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </Link>

                {/* TCG Database Card */}
                <Link href="/tcgsets">
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md active:shadow-sm transition-all"
                  >
                    <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CardList className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">TCG Database</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        Explore cards from all TCG sets
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </Link>

                {/* Battle Tools Card */}
                <Link href="/type-effectiveness">
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md active:shadow-sm transition-all"
                  >
                    <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CrossedSwords className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Battle Tools</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        Type calculator & team building
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </Link>

                {/* Resources Card */}
                <Link href="/pokemon/moves">
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md active:shadow-sm transition-all"
                  >
                    <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bulb className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Resources</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                        Moves, abilities, items & more
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </Link>
              </div>
            </MobileSection>

            {/* Quick Links Section */}
            <MobileSection title="Quick Access" defaultOpen={true} collapsible>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/pokemon/starters">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gradient-to-br from-red-50 to-transparent dark:from-red-900/20 rounded-xl text-center"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Starters</p>
                  </motion.div>
                </Link>
                <Link href="/pokemon/regions">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-900/20 rounded-xl text-center"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Regions</p>
                  </motion.div>
                </Link>
                <Link href="/trending">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-900/20 rounded-xl text-center"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Trending</p>
                  </motion.div>
                </Link>
                <Link href="/fun">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gradient-to-br from-green-50 to-transparent dark:from-green-900/20 rounded-xl text-center"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Games</p>
                  </motion.div>
                </Link>
              </div>
            </MobileSection>

            {/* Mobile Footer */}
            <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                <p className="mb-2">© 2024 DexTrends</p>
                <p>Not affiliated with Nintendo or Pokémon</p>
              </div>
            </footer>
          </MobileContainer>
        </MobileLayout>
      ) : (
        // Desktop Layout (existing code)
        <FullBleedWrapper gradient="pokedex">
          <div className="min-h-screen">
            {/* Hero Section */}
            <section className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 sm:pb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                {/* Official DexTrends Logo - Hero Size */}
                <div className="mb-6 flex justify-center">
                  <HeroLogo />
                </div>

                {/* Tagline */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-3">
                  Everything Pokémon in One Place
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                  Search across Pokédex, TCG cards, moves, items, and more with our unified search
                </p>

                {/* Global Search */}
                <GlobalSearch />
              </motion.div>
            </section>

            {/* Quick Stats Bar */}
            <section className="border-y border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">1,025</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pokémon</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">150+</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">TCG Sets</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">15,000+</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Cards</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">919</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Moves</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Main Features */}
            <section className="container mx-auto px-4 py-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {/* Pokédex */}
                <Link href="/pokedex">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer h-full"
                  >
                    <div className="flex flex-col items-center text-center">
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
                <Link href="/tcgsets">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer h-full"
                  >
                    <div className="flex flex-col items-center text-center">
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
                <Link href="/type-effectiveness">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer h-full"
                  >
                    <div className="flex flex-col items-center text-center">
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
                <Link href="/pokemon/moves">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer h-full"
                  >
                    <div className="flex flex-col items-center text-center">
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
            <section className="container mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">What's New</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Latest Set */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">Latest TCG Set</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Paldea Evolved - 279 cards</p>
                  <Link href="/tcgsets/sv2" className="text-purple-600 hover:text-purple-700 font-medium">
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
      )}
    </>
  );
};

// Tell layout to use full bleed
(HomePage as any).fullBleed = true;

export default HomePage;