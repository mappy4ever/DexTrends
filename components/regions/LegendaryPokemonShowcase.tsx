import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
// Using direct PokeAPI URLs for Pokémon images
import { GlassContainer } from '../ui/GlassContainer';
import { FadeIn, SlideUp } from '../ui/animations/animations';
import { 
  BsStarFill, 
  BsLightningFill,
  BsChevronRight,
  BsShieldFill,
  BsGem
} from 'react-icons/bs';
import { GiCrystalShine, GiDragonHead, GiBirdClaw } from 'react-icons/gi';
import { FaFeather } from 'react-icons/fa';

interface LegendaryPokemonShowcaseProps {
  region: {
    name: string;
    color: string;
  };
  legendaries: string[];
  legendaryIds: number[];
  theme: 'light' | 'dark';
}

const LegendaryPokemonShowcase: React.FC<LegendaryPokemonShowcaseProps> = ({ 
  region, 
  legendaries, 
  legendaryIds,
  theme 
}) => {
  const [selectedLegendary, setSelectedLegendary] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Type-based gradients for legendary Pokémon
  const getLegendaryGradient = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('articuno')) return 'from-cyan-400 to-blue-600';
    if (lowerName.includes('zapdos')) return 'from-yellow-400 to-orange-600';
    if (lowerName.includes('moltres')) return 'from-orange-500 to-red-600';
    if (lowerName.includes('mewtwo')) return 'from-purple-500 to-pink-600';
    if (lowerName.includes('mew')) return 'from-pink-400 to-purple-500';
    if (lowerName.includes('lugia')) return 'from-blue-400 to-indigo-600';
    if (lowerName.includes('ho-oh')) return 'from-red-500 to-yellow-500';
    if (lowerName.includes('celebi')) return 'from-green-400 to-emerald-600';
    if (lowerName.includes('kyogre')) return 'from-blue-600 to-cyan-700';
    if (lowerName.includes('groudon')) return 'from-red-600 to-orange-700';
    if (lowerName.includes('rayquaza')) return 'from-emerald-500 to-green-700';
    if (lowerName.includes('dialga')) return 'from-blue-500 to-indigo-700';
    if (lowerName.includes('palkia')) return 'from-purple-500 to-pink-700';
    if (lowerName.includes('giratina')) return 'from-gray-600 to-purple-800';
    if (lowerName.includes('reshiram')) return 'from-gray-100 to-blue-300';
    if (lowerName.includes('zekrom')) return 'from-gray-800 to-blue-900';
    if (lowerName.includes('kyurem')) return 'from-gray-400 to-cyan-600';
    if (lowerName.includes('xerneas')) return 'from-blue-400 to-purple-600';
    if (lowerName.includes('yveltal')) return 'from-red-700 to-gray-900';
    if (lowerName.includes('zygarde')) return 'from-green-500 to-gray-700';
    if (lowerName.includes('solgaleo')) return 'from-yellow-400 to-orange-600';
    if (lowerName.includes('lunala')) return 'from-purple-600 to-blue-800';
    if (lowerName.includes('necrozma')) return 'from-black to-purple-900';
    if (lowerName.includes('zacian')) return 'from-cyan-400 to-blue-600';
    if (lowerName.includes('zamazenta')) return 'from-red-500 to-pink-600';
    if (lowerName.includes('eternatus')) return 'from-purple-700 to-red-900';
    if (lowerName.includes('koraidon')) return 'from-red-600 to-orange-700';
    if (lowerName.includes('miraidon')) return 'from-purple-600 to-blue-700';
    // Legendary birds/beasts/etc
    if (lowerName.includes('raikou')) return 'from-yellow-500 to-purple-600';
    if (lowerName.includes('entei')) return 'from-orange-600 to-red-700';
    if (lowerName.includes('suicune')) return 'from-cyan-500 to-blue-700';
    return 'from-purple-500 to-indigo-600'; // Default legendary gradient
  };

  const getLegendaryIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('dragon') || lowerName.includes('rayquaza') || lowerName.includes('dialga')) {
      return <GiDragonHead className="text-2xl" />;
    }
    if (lowerName.includes('bird') || lowerName.includes('lugia') || lowerName.includes('ho-oh')) {
      return <FaFeather className="text-2xl" />;
    }
    if (lowerName.includes('crystal') || lowerName.includes('necrozma')) {
      return <GiCrystalShine className="text-2xl" />;
    }
    return <BsStarFill className="text-xl" />;
  };

  if (!legendaries || legendaries.length === 0) return null;

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 opacity-10">
        <div className={`absolute inset-0 bg-gradient-to-br ${region.color} animate-pulse`} />
      </div>

      <GlassContainer 
        variant="dark" 
        blur="xl" 
        rounded="3xl" 
        padding="lg"
        className="relative"
      >
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BsShieldFill className="text-3xl text-purple-500" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Legendary Pokémon
              </h2>
              <BsShieldFill className="text-3xl text-pink-500" />
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              The mythical guardians and legendary beings of {region.name}
            </p>
          </div>
        </FadeIn>

        {/* Main Legendary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 px-2 sm:px-0">
          {legendaries.map((legendary, index) => {
            const pokemonId = legendaryIds[index];
            const isHovered = hoveredIndex === index;
            const gradient = getLegendaryGradient(legendary);

            return (
              <SlideUp key={pokemonId} delay={index * 0.05}>
                <Link href={`/pokemon/${pokemonId}`}>
                  <motion.div
                    className="relative group cursor-pointer"
                    onHoverStart={() => setHoveredIndex(index)}
                    onHoverEnd={() => setHoveredIndex(null)}
                    whileHover={{ scale: 1.05, y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {/* Legendary Card */}
                    <div className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/90 via-white/70 to-white/80 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-900/80 shadow-2xl border border-white/30 dark:border-gray-700/30">
                      {/* Animated Gradient Background */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                      
                      {/* Subtle Glow Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-5`} />
                      </div>

                      {/* Legendary Icon Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform duration-300`}>
                          {getLegendaryIcon(legendary)}
                        </div>
                      </div>

                      {/* Pokédex Number Badge */}
                      <div className="absolute top-4 right-4 z-10">
                        <div className="px-3 py-1 rounded-full backdrop-blur-md bg-black/20 dark:bg-white/20 text-white dark:text-gray-200 text-sm font-bold shadow-lg">
                          #{pokemonId}
                        </div>
                      </div>

                      {/* Pokémon Image Container */}
                      <div className="relative pt-16 sm:pt-20 pb-2 sm:pb-4 px-2 sm:px-4">
                        <motion.div 
                          className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto"
                          animate={isHovered ? { 
                            scale: 1.05
                          } : {}}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                          {/* Glow Effect */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />
                          
                          {/* Pokémon Image */}
                          <Image
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
                            alt={legendary}
                            fill
                            className="object-contain drop-shadow-2xl relative z-10"
                            priority={index < 4}
                          />
                        </motion.div>
                      </div>

                      {/* Info Panel */}
                      <div className="relative p-2 sm:p-4 bg-gradient-to-t from-white/80 to-transparent dark:from-gray-900/80">
                        <h3 className="text-sm sm:text-base md:text-xl font-bold text-center text-gray-800 dark:text-white mb-1 sm:mb-2 truncate">
                          {legendary}
                        </h3>
                        
                        {/* Stats Preview - Hidden on small screens */}
                        <div className="hidden sm:flex items-center justify-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                          <div className="flex items-center gap-1">
                            <BsLightningFill className="text-yellow-500 text-xs sm:text-sm" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Legendary</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BsGem className="text-purple-500 text-xs sm:text-sm" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">Rare</span>
                          </div>
                        </div>

                        {/* View Details Button */}
                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            View Details
                          </span>
                          <BsChevronRight className="text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* Legendary Aura Effect */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-700`} />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </SlideUp>
            );
          })}
        </div>

        {/* Legendary Trio/Duo Groups (if applicable) */}
        {region.name === 'Kanto' && (
          <div className="mt-12 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/30 dark:border-purple-700/30">
            <h3 className="text-lg font-bold mb-4 text-center text-purple-700 dark:text-purple-300">
              Legendary Groups
            </h3>
            <div className="grid grid-cols-1 min-420:grid-cols-2 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <BsStarFill className="text-yellow-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Legendary Birds:</strong> Articuno, Zapdos, Moltres
                </span>
              </div>
              <div className="flex items-center gap-3">
                <BsStarFill className="text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Genetic Duo:</strong> Mewtwo & Mew
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Call to Action */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link 
            href={`/pokemon/legendary`}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <BsShieldFill className="text-xl" />
            <span>Explore All Legendary Pokémon</span>
            <BsChevronRight className="text-xl" />
          </Link>
        </motion.div>
      </GlassContainer>

    </div>
  );
};

export default LegendaryPokemonShowcase;