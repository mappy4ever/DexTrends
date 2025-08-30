import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { NextPage } from 'next';
import { HeroLogo } from '@/components/ui/DexTrendsLogo';
import { GlobalSearch } from '@/components/home/GlobalSearch';
import { AdaptiveModal, useAdaptiveModal } from '@/components/unified/AdaptiveModal';
import { Book, CardList, CrossedSwords, Bulb } from '@/utils/icons';
import { cn } from '@/utils/cn';
import hapticFeedback from '@/utils/hapticFeedback';

/**
 * Unified Homepage - Production-ready responsive design
 * 
 * Features:
 * - One codebase for all devices
 * - Intelligent responsive layout
 * - No conditional rendering
 * - Touch-optimized interactions
 * - Smooth animations
 */

interface FeatureCard {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  stats?: string;
}

const features: FeatureCard[] = [
  {
    href: '/pokedex',
    title: 'Pokédex',
    description: 'Browse all 1,025 Pokémon with complete stats, abilities, and evolutions',
    icon: Book,
    color: 'red',
    stats: '1,025 Pokémon'
  },
  {
    href: '/tcg-sets',
    title: 'TCG Database',
    description: 'Explore cards from all Pokémon TCG sets with images and details',
    icon: CardList,
    color: 'blue',
    stats: '15,000+ Cards'
  },
  {
    href: '/type-effectiveness',
    title: 'Battle Tools',
    description: 'Type calculator, damage calculator, and team building tools',
    icon: CrossedSwords,
    color: 'orange',
    stats: 'Battle Ready'
  },
  {
    href: '/pokemon/moves',
    title: 'Resources',
    description: 'Complete database of moves, abilities, items, and more',
    icon: Bulb,
    color: 'purple',
    stats: '919 Moves'
  }
];

const quickLinks = [
  { href: '/pokemon/starters', label: 'Starters', color: 'red' },
  { href: '/pokemon/regions', label: 'Regions', color: 'blue' },
  { href: '/trending', label: 'Trending', color: 'purple' },
  { href: '/fun', label: 'Games', color: 'green' }
];

const stats = [
  { value: '1,025', label: 'Pokémon' },
  { value: '150+', label: 'TCG Sets' },
  { value: '15,000+', label: 'Cards' },
  { value: '919', label: 'Moves' }
];

const UnifiedHomePage: NextPage = () => {
  const [showSearch, setShowSearch] = useState(false);
  const searchModal = useAdaptiveModal();
  const { cardTap } = hapticFeedback;

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; icon: string; gradient: string }> = {
      red: {
        bg: 'bg-red-100 dark:bg-red-900/20',
        icon: 'text-red-600 dark:text-red-400',
        gradient: 'from-red-50 to-transparent dark:from-red-900/20'
      },
      blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        icon: 'text-blue-600 dark:text-blue-400',
        gradient: 'from-blue-50 to-transparent dark:from-blue-900/20'
      },
      orange: {
        bg: 'bg-orange-100 dark:bg-orange-900/20',
        icon: 'text-orange-600 dark:text-orange-400',
        gradient: 'from-orange-50 to-transparent dark:from-orange-900/20'
      },
      purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/20',
        icon: 'text-purple-600 dark:text-purple-400',
        gradient: 'from-purple-50 to-transparent dark:from-purple-900/20'
      },
      green: {
        bg: 'bg-green-100 dark:bg-green-900/20',
        icon: 'text-green-600 dark:text-green-400',
        gradient: 'from-green-50 to-transparent dark:from-green-900/20'
      }
    };
    return colors[color] || colors.blue;
  };

  const handleCardClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      cardTap();
    }
  };

  return (
    <>
      <Head>
        <title>DexTrends - Everything Pokémon in One Place</title>
        <meta name="description" content="The complete Pokémon resource: Pokédex, TCG database, battle tools, and more. Search across all Pokémon data instantly." />
        <meta name="keywords" content="Pokemon, Pokedex, TCG, Pokemon cards, battle calculator, type effectiveness" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section - Responsive sizing */}
        <section className="container mx-auto px-4 pt-8 sm:pt-12 pb-6 sm:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo - Scales based on viewport */}
            <div className="mb-4 sm:mb-6 flex justify-center transform scale-75 sm:scale-100">
              <HeroLogo />
            </div>

            {/* Tagline - Responsive text sizing */}
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
              Everything Pokémon in One Place
            </h1>
            <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
              Search across Pokédex, TCG cards, moves, items, and more
            </p>

            {/* Search - Mobile button or desktop bar */}
            <div className="hidden sm:block">
              <GlobalSearch />
            </div>
            
            {/* Mobile search button */}
            <div className="sm:hidden px-4">
              <button
                onClick={() => searchModal.open()}
                className="w-full max-w-xs mx-auto px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400 hover:shadow-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-base">Search everything...</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Stats Bar - Responsive grid */}
        <section className="border-y border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Features - Responsive grid */}
        <section className="container mx-auto px-4 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {features.map((feature, index) => {
              const colors = getColorClasses(feature.color);
              const Icon = feature.icon;
              
              return (
                <Link key={feature.href} href={feature.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCardClick}
                    className={cn(
                      'bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl',
                      'transition-all duration-300 cursor-pointer h-full',
                      'p-4 sm:p-6'
                    )}
                  >
                    {/* Mobile: Horizontal layout, Desktop: Vertical centered */}
                    <div className="flex sm:flex-col sm:items-center sm:text-center">
                      {/* Icon */}
                      <div className={cn(
                        'w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-full',
                        'flex items-center justify-center flex-shrink-0',
                        'mb-0 sm:mb-4 mr-4 sm:mr-0',
                        colors.bg
                      )}>
                        <Icon className={cn('w-7 h-7 sm:w-8 sm:h-8', colors.icon)} />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 text-left sm:text-center">
                        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-none">
                          {feature.description}
                        </p>
                        {feature.stats && (
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-500 mt-2 hidden sm:block">
                            {feature.stats}
                          </p>
                        )}
                      </div>
                      
                      {/* Mobile chevron */}
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </motion.div>
        </section>

        {/* Quick Links - Responsive grid */}
        <section className="container mx-auto px-4 pb-8 sm:pb-12">
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            Quick Access
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {quickLinks.map((link, index) => {
              const colors = getColorClasses(link.color);
              
              return (
                <Link key={link.href} href={link.href}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCardClick}
                    className={cn(
                      'p-3 sm:p-4 rounded-xl text-center cursor-pointer',
                      'bg-gradient-to-br transition-all hover:shadow-md',
                      colors.gradient
                    )}
                  >
                    <p className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                      {link.label}
                    </p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* What's New Section - Hidden on mobile for simplicity */}
        <section className="hidden sm:block container mx-auto px-4 py-12 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What's New</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Latest TCG Set</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Temporal Forces now available with 200+ new cards
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Pokédex Update</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Added Paldea region Pokémon and paradox forms
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">New Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Team builder and battle simulator now available
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 pb-6">
            <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <p className="mb-2">© 2024 DexTrends</p>
              <p>Not affiliated with Nintendo, Game Freak, or The Pokémon Company</p>
            </div>
          </div>
        </footer>

        {/* Search Modal for Mobile */}
        <AdaptiveModal
          isOpen={searchModal.isOpen}
          onClose={searchModal.close}
          title="Search Everything"
          size="lg"
        >
          <div className="p-4">
            <GlobalSearch />
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {['Pikachu', 'Charizard', 'Mewtwo', 'Legendary', 'Starter'].map(term => (
                  <button
                    key={term}
                    onClick={() => {
                      // Handle search
                      searchModal.close();
                    }}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AdaptiveModal>
      </div>
    </>
  );
};

export default UnifiedHomePage;