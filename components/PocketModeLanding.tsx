import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BsCardList, BsGrid, BsPlay } from 'react-icons/bs';
import { FiShoppingBag, FiZap, FiTrendingUp } from 'react-icons/fi';
import { GiCardPickup, GiCardDraw } from 'react-icons/gi';

interface Feature {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge: string;
}

interface Highlight {
  label: string;
  icon: string;
}

const PocketModeLanding: React.FC = () => {
  const features: Feature[] = [
    {
      href: '/pocketmode',
      title: 'Browse Cards',
      description: 'Explore all Pokémon TCG Pocket cards with detailed stats and beautiful artwork.',
      icon: <BsCardList className="w-8 h-8" />,
      color: 'bg-blue-500',
      badge: 'Core'
    },
    {
      href: '/pocketmode/decks',
      title: 'Top Decks',
      description: 'Discover winning deck strategies and meta builds from top players.',
      icon: <BsGrid className="w-8 h-8" />,
      color: 'bg-green-500',
      badge: 'Popular'
    },
    {
      href: '/pocketmode/deckbuilder',
      title: 'Deck Builder',
      description: 'Create and test your own custom decks with our interactive builder.',
      icon: <GiCardDraw className="w-8 h-8" />,
      color: 'bg-purple-500',
      badge: 'Tools'
    },
    {
      href: '/pocketmode/expansions',
      title: 'Booster Packs',
      description: 'Experience the thrill of opening virtual booster packs.',
      icon: <FiShoppingBag className="w-8 h-8" />,
      color: 'bg-orange-500',
      badge: 'Fun'
    }
  ];

  const highlights: Highlight[] = [
    { label: 'Mobile Optimized', icon: '📱' },
    { label: 'Streamlined Rules', icon: '⚡' },
    { label: 'Quick Battles', icon: '🎯' },
    { label: 'Exclusive Cards', icon: '✨' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-full mb-6 shadow-lg">
            <GiCardPickup className="w-6 h-6 text-purple-600" />
            <span className="font-medium text-gray-900 dark:text-white">Pokémon TCG Pocket</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-pokemon font-black text-gray-900 dark:text-white mb-6">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Pocket Mode
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Experience the streamlined mobile version of Pokémon TCG. Simplified rules, 
            exclusive cards, and quick battles designed for on-the-go gaming.
          </p>

          {/* Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {highlights.map((highlight, index) => (
              <div key={index} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <span className="mr-2">{highlight.icon}</span>
                <span className="font-medium text-gray-900 dark:text-white">{highlight.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer relative overflow-hidden">
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  {feature.badge}
                </div>
                
                <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {feature.description}
                </p>
                
                <div className="flex items-center text-purple-600 font-medium group-hover:text-purple-700 transition-colors text-sm">
                  Explore <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Key Differences Section */}
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            🎮 What Makes Pocket Different?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiZap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Streamlined Gameplay
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Simplified rules and mechanics designed for quick, engaging battles on mobile devices.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BsPlay className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Faster Matches
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Games designed to finish in 5-10 minutes, perfect for mobile gaming sessions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <GiCardPickup className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Exclusive Cards
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Unique cards and artwork created specifically for the Pocket format.
              </p>
            </div>
          </div>
        </div>

        {/* Popular Decks Preview */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl p-8 text-white mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">🏆 Explore Meta Decks</h2>
            <p className="text-purple-100 max-w-2xl mx-auto">
              Discover the most successful deck builds in Pocket format. Learn from top players 
              and adapt strategies to your playstyle.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/pocketmode/decks">
              <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                View Top Decks
              </button>
            </Link>
            <Link href="/pocketmode/deckbuilder">
              <button className="bg-white text-purple-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105">
                Build Your Own
              </button>
            </Link>
          </div>
        </div>

        {/* Pack Opening Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            🎁 Ready to Open Some Packs?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the excitement of opening booster packs with realistic animations 
            and discover rare cards from different expansions.
          </p>
          
          <Link href="/pocketmode/expansions">
            <button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              🎲 Open Booster Packs
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PocketModeLanding;