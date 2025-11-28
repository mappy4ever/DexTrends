import React, { useState, useEffect } from "react";
import { NextPage } from 'next';
import { useRouter } from "next/router";
import Head from "next/head";
import { motion } from 'framer-motion';
import { useTheme } from "../../context/UnifiedAppContext";
import { useSmoothParallax } from "../../hooks/useSmoothParallax";
import EnhancedStarterSelector from "../../components/ui/EnhancedStarterSelector";
import { Container } from "../../components/ui/Container";
import { createGlassStyle } from '../../components/ui/design-system/glass-constants';
import { GradientButton, CircularButton } from '../../components/ui/design-system';
import { FiChevronLeft, FiMapPin, FiBook, FiLayers, FiSmartphone } from 'react-icons/fi';
import { cn } from "../../utils/cn";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";
import logger from "../../utils/logger";

// Region data for starter selector
const regions = [
  {
    id: "kanto",
    name: "Kanto",
    generation: 1,
    color: "from-red-500 to-amber-500",
    gradient: "from-red-500/20 to-amber-500/20",
    starters: "Bulbasaur • Charmander • Squirtle",
    starterIds: [1, 4, 7],
    games: "Red • Blue • Yellow • FireRed • LeafGreen",
    description: "Where it all began - the original 151 Pokémon"
  },
  {
    id: "johto", 
    name: "Johto",
    generation: 2,
    color: "from-yellow-500 to-orange-500",
    gradient: "from-yellow-500/20 to-orange-500/20",
    starters: "Chikorita • Cyndaquil • Totodile",
    starterIds: [152, 155, 158],
    games: "Gold • Silver • Crystal • HeartGold • SoulSilver",
    description: "A region steeped in history and tradition"
  },
  {
    id: "hoenn",
    name: "Hoenn", 
    generation: 3,
    color: "from-emerald-500 to-amber-500",
    gradient: "from-emerald-500/20 to-amber-500/20",
    starters: "Treecko • Torchic • Mudkip",
    starterIds: [252, 255, 258],
    games: "Ruby • Sapphire • Emerald • Omega Ruby • Alpha Sapphire",
    description: "Tropical paradise with diverse ecosystems"
  },
  {
    id: "sinnoh",
    name: "Sinnoh",
    generation: 4,
    color: "from-amber-500 to-purple-500",
    gradient: "from-amber-500/20 to-purple-500/20",
    starters: "Turtwig • Chimchar • Piplup",
    starterIds: [387, 390, 393],
    games: "Diamond • Pearl • Platinum • Brilliant Diamond • Shining Pearl",
    description: "A region rich in mythology and legend"
  },
  {
    id: "unova",
    name: "Unova",
    generation: 5,
    color: "from-stone-600 to-stone-600",
    gradient: "from-stone-600/20 to-stone-600/20",
    starters: "Snivy • Tepig • Oshawott",
    starterIds: [495, 498, 501],
    games: "Black • White • Black 2 • White 2",
    description: "A diverse region inspired by New York"
  },
  {
    id: "kalos",
    name: "Kalos",
    generation: 6,
    color: "from-pink-500 to-amber-500",
    gradient: "from-pink-500/20 to-amber-500/20",
    starters: "Chespin • Fennekin • Froakie",
    starterIds: [650, 653, 656],
    games: "X • Y",
    description: "Beautiful region inspired by France"
  },
  {
    id: "alola",
    name: "Alola",
    generation: 7,
    color: "from-orange-500 to-pink-500",
    gradient: "from-orange-500/20 to-pink-500/20",
    starters: "Rowlet • Litten • Popplio",
    starterIds: [722, 725, 728],
    games: "Sun • Moon • Ultra Sun • Ultra Moon",
    description: "Tropical islands with unique traditions"
  },
  {
    id: "galar",
    name: "Galar", 
    generation: 8,
    color: "from-amber-600 to-amber-600",
    gradient: "from-amber-600/20 to-amber-600/20",
    starters: "Grookey • Scorbunny • Sobble",
    starterIds: [810, 813, 816],
    games: "Sword • Shield",
    description: "Industrial region inspired by Great Britain"
  },
  {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    color: "from-violet-500 to-amber-600",
    gradient: "from-violet-500/20 to-amber-600/20",
    starters: "Sprigatito • Fuecoco • Quaxly",
    starterIds: [906, 909, 912],
    games: "Scarlet • Violet",
    description: "Open-world region inspired by Spain"
  }
];

const StartersPage: NextPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedRegion, setSelectedRegion] = useState<string>('kanto');
  const [isLoading, setIsLoading] = useState(false);
  const parallaxOffset = useSmoothParallax(0.5);

  // Handle starter selection
  const handleStarterSelect = (pokemon: any) => {
    // This can be used for other actions like saving favorite starter
    // For now, the navigation happens from within the expanded card
    logger.debug('Selected starter:', { pokemonName: pokemon.name });
  };

  // Get current region data
  const currentRegion = regions.find(r => r.id === selectedRegion) || regions[0];

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Starter Pokemon - Choose Your Partner | DexTrends</title>
        <meta name="description" content="Choose your starter Pokemon from all regions. Compare stats, abilities, and evolution chains to find your perfect partner." />
        <meta name="keywords" content="Pokemon starters, starter Pokemon, Bulbasaur, Charmander, Squirtle, Pokemon partners" />
      </Head>

      <div className="min-h-screen">
        {/* Hero Section with Pokeball Starter Image */}
        <div style={{ 
          position: 'relative', 
          height: '70vh',
          marginTop: '-80px',
          paddingTop: '80px',
          overflow: 'hidden',
          background: 'linear-gradient(to bottom right, #1e293b, #334155, #1e293b)'
        }}>
          {/* Pokeball Background Container */}
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: `translate3d(0, ${parallaxOffset * -0.5}px, 0)`,
            willChange: 'transform'
          }}>
            {/* Starter Pokemon Circles Image */}
            <img 
              src="/images/starter-pokemon-circles.png"
              alt="Choose Your Starter Pokemon"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: 'auto',
                minHeight: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                filter: 'brightness(1.05) contrast(1.1)',
                opacity: 0.95
              }}
            />
            
            {/* Subtle Gradient Overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.1) 70%, rgba(0, 0, 0, 0.3) 100%)',
              pointerEvents: 'none'
            }} />
          </div>

          {/* Content Container */}
          <div style={{
            position: 'relative',
            zIndex: 10,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}>
            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white text-center mb-4"
                style={{ textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)' }}>
              Choose Your Starter
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/90 text-center max-w-2xl"
               style={{ textShadow: '1px 1px 4px rgba(0, 0, 0, 0.8)' }}>
              Begin your journey with the perfect partner Pokemon
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative bg-gradient-to-b from-transparent to-stone-50/50 dark:from-transparent dark:to-stone-900/50">
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            
            {/* Empty space for moved content */}
            
            {/* Starter Pokemon Display with Glass Morphism */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`${createGlassStyle({
                blur: '2xl',
                opacity: 'strong',
                gradient: true,
                border: 'strong',
                shadow: 'glow',
                rounded: 'xl',
              })} p-8 rounded-3xl`}
            >
              {/* Header with Region Selection moved here */}
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                    Choose Your Starter
                  </span>
                </h2>
                
                {/* Generation Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => setSelectedRegion(region.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl font-medium transition-all duration-200 transform",
                        selectedRegion === region.id
                          ? "scale-105 hover:scale-105"
                          : "hover:scale-[1.02]"
                      )}
                      style={{
                        background: selectedRegion === region.id
                          ? 'linear-gradient(135deg, #d97706 0%, #ec4899 100%)'
                          : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        border: selectedRegion === region.id
                          ? '2px solid rgba(217, 119, 6, 0.3)'
                          : '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: selectedRegion === region.id
                          ? '0 4px 16px rgba(217, 119, 6, 0.2)'
                          : '0 2px 8px rgba(0, 0, 0, 0.05)',
                        color: selectedRegion === region.id ? 'white' : '#57534e'
                      }}
                    >
                      <span className="text-sm font-semibold">
                        Gen {region.generation}
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Region Info */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-200 mb-2">
                    {currentRegion.name} Region
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 text-sm mb-3">
                    {currentRegion.description}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {currentRegion.starters.split(' • ').map((starter, idx) => (
                      <span
                        key={starter}
                        className="px-3 py-1 rounded-full bg-white/80 text-xs font-semibold text-stone-700"
                      >
                        {starter}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <EnhancedStarterSelector
                region={currentRegion.id}
                regionName={currentRegion.name}
                starterIds={currentRegion.starterIds}
                starterNames={currentRegion.starters.split(' • ')}
                color={currentRegion.color}
                showComparison={false}
                onSelectStarter={handleStarterSelect}
              />
            </motion.div>

            {/* Enhanced Quick Links with Glass Morphism */}
            <motion.div 
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/pokedex')}
                className={`${createGlassStyle({
                  blur: 'xl',
                  opacity: 'medium',
                  gradient: true,
                  border: 'medium',
                  shadow: 'lg',
                  rounded: 'xl',
                  hover: 'lift',
                })} p-6 rounded-2xl cursor-pointer group transition-all duration-150`}
              >
                <FiBook className="w-8 h-8 mb-3 text-amber-500 group-hover:text-amber-600 transition-colors duration-150" />
                <h4 className="font-bold text-stone-800 dark:text-white mb-1">Pokedex</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">Browse all Pokemon</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/pokemon/regions')}
                className={`${createGlassStyle({
                  blur: 'xl',
                  opacity: 'medium',
                  gradient: true,
                  border: 'medium',
                  shadow: 'lg',
                  rounded: 'xl',
                  hover: 'lift',
                })} p-6 rounded-2xl cursor-pointer group transition-all duration-150`}
              >
                <FiMapPin className="w-8 h-8 mb-3 text-amber-500 group-hover:text-amber-600 transition-colors duration-150" />
                <h4 className="font-bold text-stone-800 dark:text-white mb-1">Regions</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">Explore worlds</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/tcgexpansions')}
                className={`${createGlassStyle({
                  blur: 'xl',
                  opacity: 'medium',
                  gradient: true,
                  border: 'medium',
                  shadow: 'lg',
                  rounded: 'xl',
                  hover: 'lift',
                })} p-6 rounded-2xl cursor-pointer group transition-all duration-150`}
              >
                <FiLayers className="w-8 h-8 mb-3 text-pink-500 group-hover:text-pink-600 transition-colors duration-150" />
                <h4 className="font-bold text-stone-800 dark:text-white mb-1">TCG Sets</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">Card collections</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/pocketmode')}
                className={`${createGlassStyle({
                  blur: 'xl',
                  opacity: 'medium',
                  gradient: true,
                  border: 'medium',
                  shadow: 'lg',
                  rounded: 'xl',
                  hover: 'lift',
                })} p-6 rounded-2xl cursor-pointer group transition-all duration-150`}
              >
                <FiSmartphone className="w-8 h-8 mb-3 text-green-500 group-hover:text-green-600 transition-colors duration-150" />
                <h4 className="font-bold text-stone-800 dark:text-white mb-1">TCG Pocket</h4>
                <p className="text-xs text-stone-600 dark:text-stone-400">Mobile game cards</p>
              </motion.div>
            </motion.div>

            {/* Fun Facts Section */}
            <Container
              variant="gradient"
              rounded="xl"
              padding="lg"
              gradient="purple"
              className="mt-12"
            >
              <h3 className="text-3xl font-bold text-center mb-8">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
                  Did You Know?
                </span>
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Container variant="outline" rounded="xl" padding="md" className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-3">
                    27
                  </div>
                  <p className="text-sm text-stone-700 dark:text-stone-300 font-medium">
                    Total starter Pokemon across all generations
                  </p>
                </Container>
                
                <Container variant="outline" rounded="xl" padding="md" className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-3">
                    3
                  </div>
                  <p className="text-sm text-stone-700 dark:text-stone-300 font-medium">
                    Starters in each generation - always Grass, Fire, and Water
                  </p>
                </Container>
                
                <Container variant="outline" rounded="xl" padding="md" className="text-center">
                  <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent mb-3">
                    87.5%
                  </div>
                  <p className="text-sm text-stone-700 dark:text-stone-300 font-medium">
                    Male gender ratio for all starter Pokemon
                  </p>
                </Container>
              </div>
            </Container>
          </div>
        </div>
      </div>
    </FullBleedWrapper>
  );
};

export default StartersPage;