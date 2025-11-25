import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { NextPage } from "next";
import { motion } from 'framer-motion';
import { useTheme } from "../../context/UnifiedAppContext";
// Glass styles replaced with Tailwind classes
import Button from '../../components/ui/Button';
import { EmptyStateGlass, LoadingStateGlass, UnifiedSearchBar } from '../../components/ui/glass-components';
import { BsCalendar, BsGlobe, BsController, BsArrowRight, BsPlayFill } from "react-icons/bs";
import { GiCardPickup } from "react-icons/gi";
import { FiChevronLeft, FiFilter, FiChevronDown } from "react-icons/fi";
import { cn } from "../../utils/cn";
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';

// Interfaces
interface Game {
  name: string;
  year: string;
  platform: string;
  cover: string;
  blueCover?: string;
  leafGreenCover?: string;
  silverCover?: string;
  crystalCover?: string;
  sapphireCover?: string;
  alphaSapphireCover?: string;
  emeraldCover?: string;
  platinumCover?: string;
  whiteCover?: string;
  white2Cover?: string;
  yCover?: string;
  moonCover?: string;
  ultraMoonCover?: string;
  shieldCover?: string;
  shinyCover?: string;
  pearlCover?: string;
  soulSilverCover?: string;
  violetCover?: string;
  description: string;
  features: string[];
}

interface Generation {
  generation: number;
  era: string;
  color: string;
  region: string;
  games: Game[];
}

// Comprehensive Pokemon games data with scraped image integration
const pokemonGames: Generation[] = [
  {
    generation: 1,
    era: "Classic Era",
    color: "from-red-500 to-blue-500",
    region: "Kanto",
    games: [
      {
        name: "Red & Blue",
        year: "1996",
        platform: "Game Boy",
        cover: "/images/scraped/games/covers/red-en-boxart.png",
        blueCover: "/images/scraped/games/covers/blue-en-boxart.png",
        description: "The legendary games that started it all",
        features: ["151 Original Pokémon", "Trading System", "Gym Battles"]
      },
      {
        name: "Yellow",
        year: "1998", 
        platform: "Game Boy",
        cover: "/images/scraped/games/covers/yellow-en-boxart.png",
        description: "Special Pikachu Edition",
        features: ["Pikachu Partner", "Team Rocket", "Enhanced Story"]
      },
      {
        name: "FireRed & LeafGreen",
        year: "2004",
        platform: "Game Boy Advance", 
        cover: "/images/scraped/games/covers/firered-en-boxart.png",
        leafGreenCover: "/images/scraped/games/covers/leafgreen-en-boxart.png",
        description: "Kanto reimagined with modern graphics",
        features: ["Updated Graphics", "Sevii Islands", "Wireless Trading"]
      }
    ]
  },
  {
    generation: 2,
    era: "Golden Era",
    color: "from-yellow-500 to-gray-400",
    region: "Johto",
    games: [
      {
        name: "Gold & Silver",
        year: "1999",
        platform: "Game Boy Color",
        cover: "/images/scraped/games/covers/gold-en-boxart.png",
        silverCover: "/images/scraped/games/covers/silver-en-boxart.png",
        description: "Day & night cycle with 100 new Pokémon",
        features: ["Day/Night Cycle", "Breeding", "Two Regions"]
      },
      {
        name: "Crystal",
        year: "2000",
        platform: "Game Boy Color",
        cover: "/images/scraped/games/covers/crystal-en-boxart.png",
        description: "Enhanced version with animated sprites",
        features: ["Animated Sprites", "Female Protagonist", "Suicune Story"]
      }
    ]
  },
  {
    generation: 3,
    era: "Advanced Era",
    color: "from-emerald-500 to-blue-600",
    region: "Hoenn",
    games: [
      {
        name: "Ruby & Sapphire",
        year: "2002",
        platform: "Game Boy Advance",
        cover: "/images/scraped/games/covers/ruby-en-boxart.png",
        sapphireCover: "/images/scraped/games/covers/sapphire-en-boxart.png",
        description: "Tropical adventures with abilities & double battles",
        features: ["Abilities", "Double Battles", "Secret Bases"]
      },
      {
        name: "Emerald",
        year: "2004",
        platform: "Game Boy Advance",
        cover: "/images/scraped/games/covers/emerald-en-boxart.png",
        description: "The ultimate Hoenn experience",
        features: ["Battle Frontier", "Both Evil Teams", "Rayquaza"]
      },
      {
        name: "Omega Ruby & Alpha Sapphire",
        year: "2014",
        platform: "Nintendo 3DS",
        cover: "/images/scraped/games/covers/omega-ruby-en-boxart.png",
        alphaSapphireCover: "/images/scraped/games/covers/alpha-sapphire-en-boxart.png",
        description: "Hoenn remade with Mega Evolution",
        features: ["Mega Evolution", "3D Graphics", "DexNav"]
      }
    ]
  },
  {
    generation: 4,
    era: "Diamond Era",
    color: "from-indigo-500 to-purple-600",
    region: "Sinnoh",
    games: [
      {
        name: "Diamond & Pearl",
        year: "2006",
        platform: "Nintendo DS",
        cover: "/images/scraped/games/covers/diamond-en-boxart.png",
        pearlCover: "/images/scraped/games/covers/pearl-en-boxart.png",
        description: "Dual-screen adventures in Sinnoh",
        features: ["Touch Screen", "WiFi Trading", "Underground"]
      },
      {
        name: "Platinum",
        year: "2008",
        platform: "Nintendo DS",
        cover: "/images/scraped/games/covers/platinum-en-boxart.png",
        description: "Enhanced Sinnoh with Distortion World",
        features: ["Distortion World", "Battle Frontier", "Enhanced Story"]
      }
    ]
  },
  {
    generation: 8,
    era: "Modern Era",
    color: "from-purple-600 to-red-600",
    region: "Galar",
    games: [
      {
        name: "Sword & Shield",
        year: "2019",
        platform: "Nintendo Switch",
        cover: "/images/scraped/games/covers/sword-en-boxart.png",
        shieldCover: "/images/scraped/games/covers/shield-en-boxart.png",
        description: "Console Pokémon with Dynamax",
        features: ["Dynamax", "Wild Area", "Max Raid Battles"]
      }
    ]
  },
  {
    generation: 9,
    era: "Open World Era",
    color: "from-red-500 to-violet-600",
    region: "Paldea",
    games: [
      {
        name: "Scarlet & Violet",
        year: "2022",
        platform: "Nintendo Switch",
        cover: "/images/scraped/games/covers/scarlet-en-boxart.png",
        violetCover: "/images/scraped/games/covers/violet-en-boxart.png",
        description: "Open world Pokémon adventure",
        features: ["Open World", "Three Stories", "Terastallization"]
      }
    ]
  }
];

const GamesPage: NextPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedEra, setSelectedEra] = useState("");
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  // Filter games based on search and filters
  const filteredGames = pokemonGames.filter(generation => {
    const hasMatchingGames = generation.games.some(game => {
      const matchesSearch = searchTerm === "" || 
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPlatform = selectedPlatform === "" || game.platform === selectedPlatform;
      
      return matchesSearch && matchesPlatform;
    });
    
    const matchesEra = selectedEra === "" || generation.era === selectedEra;
    const matchesGeneration = selectedGeneration === null || generation.generation === selectedGeneration;
    
    return hasMatchingGames && matchesEra && matchesGeneration;
  });
  
  // Get unique platforms and eras for filters
  const platforms = [...new Set(pokemonGames.flatMap(gen => gen.games.map(game => game.platform)))];
  const eras = [...new Set(pokemonGames.map(gen => gen.era))];

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Pokémon Games | DexTrends</title>
        <meta name="description" content="Explore the complete history of Pokémon games from Red & Blue to Scarlet & Violet" />
      </Head>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-400 via-blue-500 to-purple-600">
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        
        {/* Floating Game Covers */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div 
              key={i}
              className="absolute"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -20, 0],
                rotate: [0, 10, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            >
              <GiCardPickup className="text-white text-6xl" />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-yellow-300 to-red-400 bg-clip-text text-transparent">
                POKÉMON
              </span>
              <br />
              <span className="text-white">GAMES</span>
            </h1>
            <p className="text-2xl md:text-3xl mb-8 opacity-90">
              25+ Years of Adventures Across 9 Generations
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { label: "1996 - Present", delay: 0.2 },
                { label: "40+ Main Games", delay: 0.4 },
                { label: "9 Regions", delay: 0.6 }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: item.delay, duration: 0.5 }}
                >
                  <span className="font-bold">{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        <div className="absolute top-8 left-8 z-20">
          <Button rounded="full"
            onClick={() => router.push('/pokemon')}
            variant="ghost"
            size="lg"
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
            aria-label="Back to Pokémon Hub"
            icon={<FiChevronLeft />}
            iconPosition="left"
          />
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Scroll to explore</span>
            <BsArrowRight className="rotate-90 text-2xl" />
          </div>
        </motion.div>
      </div>

      {/* Search and Filters Section */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <motion.div
          className={cn(
            "p-8 rounded-3xl mb-12",
            "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
          )}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Discover Pokémon Games</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Search and filter through the complete collection of Pokémon games
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="mb-6">
            <UnifiedSearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search games, platforms, or features..."
              className="max-w-2xl mx-auto"
            />
          </div>
          
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-4 justify-center">
            {/* Platform Filter */}
            <div className="relative">
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className={cn(
                  "px-4 py-2 rounded-full appearance-none cursor-pointer",
                  "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                )}
              >
                <option value="">All Platforms</option>
                {platforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            
            {/* Era Filter */}
            <div className="relative">
              <select
                value={selectedEra}
                onChange={(e) => setSelectedEra(e.target.value)}
                className={cn(
                  "px-4 py-2 rounded-full appearance-none cursor-pointer",
                  "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                )}
              >
                <option value="">All Eras</option>
                {eras.map(era => (
                  <option key={era} value={era}>{era}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            
            {/* Generation Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGeneration(null)}
                className={cn(
                  "px-4 py-2 rounded-full font-medium transition-all duration-200",
                  selectedGeneration === null
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                )}
              >
                All Gens
              </button>
              {[1, 2, 3, 4, 8, 9].map(gen => (
                <button
                  key={gen}
                  onClick={() => setSelectedGeneration(selectedGeneration === gen ? null : gen)}
                  className={cn(
                    "px-3 py-2 rounded-full font-medium transition-all duration-200",
                    selectedGeneration === gen
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                      : "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                  )}
                >
                  Gen {gen}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Games Timeline */}
      <div className="max-w-7xl mx-auto px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Game Timeline</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Journey through the evolution of Pokémon games, from the iconic originals to the latest open-world adventures
            </p>
          </div>
        </motion.div>

        {/* Generation Cards */}
        {filteredGames.length === 0 ? (
          <EmptyStateGlass
            type="search"
            title="No games found"
            message="Try adjusting your search or filter criteria"
            actionButton={{
              text: "Clear Filters",
              onClick: () => {
                setSearchTerm("");
                setSelectedPlatform("");
                setSelectedEra("");
                setSelectedGeneration(null);
              }
            }}
          />
        ) : (
          <motion.div 
            className="space-y-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredGames.map((generation, genIndex) => (
              <motion.div 
                key={generation.generation} 
                variants={itemVariants}
                className={cn(
                  "relative rounded-3xl overflow-hidden shadow-2xl",
                  "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                )}
              >
                {/* Generation Header */}
                <div className={`relative p-8 bg-gradient-to-r ${generation.color} text-white`}>
                  <div className="flex flex-wrap items-center justify-between">
                    <div>
                      <motion.h3 
                        className="text-4xl font-bold mb-2"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: genIndex * 0.1 + 0.2 }}
                      >
                        Generation {generation.generation}
                      </motion.h3>
                      <motion.p 
                        className="text-xl opacity-90"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: genIndex * 0.1 + 0.3 }}
                      >
                        {generation.era}
                      </motion.p>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: genIndex * 0.1 + 0.4 }}
                      >
                        <Button gradient={true}
                          onClick={() => router.push(`/pokemon/regions/${generation.region.toLowerCase()}`)}
                          variant="secondary"
                          size="md"
                          className="mt-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/30"
                        >
                          <BsGlobe className="mr-2" />
                          Explore {generation.region}
                        </Button>
                      </motion.div>
                    </div>
                    <div className="text-right">
                      <motion.div 
                        className="text-6xl font-black opacity-20"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 0.2, scale: 1 }}
                        transition={{ delay: genIndex * 0.1 + 0.5 }}
                      >
                        {generation.generation}
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Games Grid */}
                <div className="p-8">
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {generation.games.filter(game => {
                      const matchesSearch = searchTerm === "" || 
                        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        game.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        game.description.toLowerCase().includes(searchTerm.toLowerCase());
                      
                      const matchesPlatform = selectedPlatform === "" || game.platform === selectedPlatform;
                      
                      return matchesSearch && matchesPlatform;
                    }).map((game, gameIndex) => (
                      <motion.div 
                        key={game.name}
                        variants={itemVariants}
                        whileHover={{ 
                          scale: 1.03,
                          transition: { duration: 0.2 }
                        }}
                        className={cn(
                          "relative rounded-2xl overflow-hidden group cursor-pointer",
                          "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                        )}
                      >
                        {/* Game Cover */}
                        <div className="relative h-80 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
                          <div className="flex h-full">
                            {/* Main Cover */}
                            <div className="flex-1 relative">
                              <Image
                                src={game.cover}
                                alt={game.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                            
                            {/* Second Cover (if exists) */}
                            {(game.blueCover || game.silverCover || game.sapphireCover || game.pearlCover || game.shieldCover || game.violetCover || game.leafGreenCover || game.alphaSapphireCover) && (
                              <div className="flex-1 relative">
                                <Image
                                  src={game.blueCover || game.silverCover || game.sapphireCover || game.pearlCover || game.shieldCover || game.violetCover || game.leafGreenCover || game.alphaSapphireCover || ''}
                                  alt={game.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* Year Badge */}
                          <motion.div 
                            className={cn(
                              "absolute top-4 right-4 rounded-full px-3 py-1",
                              "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"
                            )}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: gameIndex * 0.1 }}
                          >
                            <span className="text-white font-bold text-sm">{game.year}</span>
                          </motion.div>

                          {/* Play Icon Overlay */}
                          <motion.div 
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center"
                            whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
                          >
                            <motion.div
                              initial={{ opacity: 0, scale: 0.5 }}
                              whileHover={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <BsPlayFill className="text-white text-6xl" />
                            </motion.div>
                          </motion.div>
                        </div>

                        {/* Game Info */}
                        <div className="p-6">
                          <motion.h4 
                            className="text-2xl font-bold mb-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: gameIndex * 0.1 + 0.2 }}
                          >
                            {game.name}
                          </motion.h4>
                          <motion.div 
                            className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: gameIndex * 0.1 + 0.3 }}
                          >
                            <div className="flex items-center gap-1">
                              <BsController />
                              <span>{game.platform}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <BsCalendar />
                              <span>{game.year}</span>
                            </div>
                          </motion.div>
                          <motion.p 
                            className="text-gray-600 dark:text-gray-400 mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: gameIndex * 0.1 + 0.4 }}
                          >
                            {game.description}
                          </motion.p>
                          
                          {/* Features */}
                          <motion.div 
                            className="flex flex-wrap gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: gameIndex * 0.1 + 0.5 }}
                          >
                            {game.features.slice(0, 3).map((feature, idx) => (
                              <motion.span 
                                key={idx}
                                className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${generation.color} text-white font-medium`}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: gameIndex * 0.1 + 0.6 + (idx * 0.1) }}
                                whileHover={{ scale: 1.05 }}
                              >
                                {feature}
                              </motion.span>
                            ))}
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

    </FullBleedWrapper>
  );
};

export default GamesPage;