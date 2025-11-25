import React, { useState, useEffect } from "react";
import { NextPage } from 'next';
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from "../../context/UnifiedAppContext";
// Glass styles replaced with Tailwind classes
import Button from '../../components/ui/Button';
import { EmptyStateGlass, LoadingStateGlass, UnifiedSearchBar } from '../../components/ui/glass-components';
import { FiMapPin, FiChevronLeft, FiGlobe, FiMap } from 'react-icons/fi';
import { useSmoothParallax } from "../../hooks/useSmoothParallax";
import FullBleedWrapper from "../../components/ui/FullBleedWrapper";

// Type definitions
interface Region {
  id: string;
  name: string;
  generation: number;
  description: string;
  mapImage: string;
  color: string;
  starters: string;
  starterIds: number[];
  icon: string;
}

interface RegionTileProps {
  region: Region;
}

// Region data with actual map images
const regions: Region[] = [
  {
    id: "kanto",
    name: "Kanto",
    generation: 1,
    description: "The region where it all began. Home to the original 151 Pokémon.",
    mapImage: "/images/scraped/maps/PE_Kanto_Map.png",
    color: "from-red-600/80 to-blue-600/80",
    starters: "Bulbasaur • Charmander • Squirtle",
    starterIds: [1, 4, 7],
    icon: "🔴"
  },
  {
    id: "johto", 
    name: "Johto",
    generation: 2,
    description: "A region steeped in history and tradition, connected to Kanto.",
    mapImage: "/images/scraped/maps/JohtoMap.png",
    color: "from-yellow-600/80 to-orange-600/80",
    starters: "Chikorita • Cyndaquil • Totodile",
    starterIds: [152, 155, 158],
    icon: "🟡"
  },
  {
    id: "hoenn",
    name: "Hoenn", 
    generation: 3,
    description: "A tropical region with diverse ecosystems and weather phenomena.",
    mapImage: "/images/scraped/maps/Hoenn_ORAS.png",
    color: "from-emerald-600/80 to-blue-600/80",
    starters: "Treecko • Torchic • Mudkip",
    starterIds: [252, 255, 258],
    icon: "🟢"
  },
  {
    id: "sinnoh",
    name: "Sinnoh",
    generation: 4, 
    description: "A region rich in mythology, featuring Mt. Coronet at its center.",
    mapImage: "/images/scraped/maps/Sinnoh_BDSP_artwork.png",
    color: "from-indigo-600/80 to-purple-600/80",
    starters: "Turtwig • Chimchar • Piplup",
    starterIds: [387, 390, 393],
    icon: "🔵"
  },
  {
    id: "unova",
    name: "Unova",
    generation: 5,
    description: "A diverse region inspired by New York, featuring only new Pokémon initially.", 
    mapImage: "/images/scraped/maps/Unova_B2W2_alt.png",
    color: "from-gray-700/80 to-slate-700/80",
    starters: "Snivy • Tepig • Oshawott",
    starterIds: [495, 498, 501],
    icon: "⚫"
  },
  {
    id: "kalos",
    name: "Kalos",
    generation: 6,
    description: "A beautiful region inspired by France, introducing Mega Evolution.",
    mapImage: "/images/scraped/maps/Kalos_map.png",
    color: "from-pink-600/80 to-purple-600/80",
    starters: "Chespin • Fennekin • Froakie",
    starterIds: [650, 653, 656],
    icon: "🩷"
  },
  {
    id: "alola",
    name: "Alola",
    generation: 7,
    description: "A tropical paradise made up of four natural islands.",
    mapImage: "/images/scraped/maps/Alola_USUM_artwork.png",
    color: "from-orange-600/80 to-red-600/80",
    starters: "Rowlet • Litten • Popplio",
    starterIds: [722, 725, 728],
    icon: "🧡"
  },
  {
    id: "galar",
    name: "Galar", 
    generation: 8,
    description: "An industrial region inspired by Great Britain with Dynamax battles.",
    mapImage: "/images/scraped/maps/Galar_artwork.png",
    color: "from-blue-700/80 to-indigo-700/80",
    starters: "Grookey • Scorbunny • Sobble",
    starterIds: [810, 813, 816],
    icon: "💙"
  },
  {
    id: "paldea",
    name: "Paldea",
    generation: 9,
    description: "An open-world region inspired by Spain with three storylines to explore.",
    mapImage: "/images/scraped/maps/Paldea_artwork.png",
    color: "from-violet-600/80 to-purple-600/80",
    starters: "Sprigatito • Fuecoco • Quaxly",
    starterIds: [906, 909, 912],
    icon: "💜"
  }
];

// Get generation color
const getGenerationColor = (generation: number): string => {
  const colors: Record<number, string> = {
    1: 'rgba(239, 68, 68, 1)',    // red-500
    2: 'rgba(245, 158, 11, 1)',   // amber-500
    3: 'rgba(34, 197, 94, 1)',    // green-500
    4: 'rgba(99, 102, 241, 1)',   // indigo-500
    5: 'rgba(107, 114, 128, 1)',  // gray-500
    6: 'rgba(236, 72, 153, 1)',   // pink-500
    7: 'rgba(251, 146, 60, 1)',   // orange-500
    8: 'rgba(147, 51, 234, 1)',   // purple-600
    9: 'rgba(168, 85, 247, 1)'    // purple-500
  };
  return colors[generation] || 'rgba(156, 163, 175, 1)';
};

// Enhanced Region Tile Component with Glass Morphism
const RegionTile: React.FC<RegionTileProps> = ({ region }) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    // Add zoom class to body for page transition (SSR safe)
    if (typeof document !== 'undefined') {
      document.body.classList.add('region-zoom-transition');
    }
    
    // Navigate immediately - let Next.js handle the transition
    router.push(`/pokemon/regions/${region.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: region.generation * 0.1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href={`/pokemon/regions/${region.id}`}>
        <div
          className={`relative h-40 md:h-48 overflow-hidden cursor-pointer transform transition-all duration-700 hover:z-10 ${"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleClick}
        >
        {/* Map Background Image */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 transition-all duration-700 region-map-image"
            style={{
              filter: isHovered 
                ? 'grayscale(0%) brightness(1.2) contrast(1.1) saturate(1.3)' 
                : 'grayscale(100%) brightness(1) contrast(1) saturate(1)',
              transform: isHovered ? 'scale(1.15)' : 'scale(1.05)',
              transformOrigin: 'center'
            }}
          >
            <Image
              src={region.mapImage}
              alt={`${region.name} Map`}
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
          {/* Dark overlay for text visibility */}
          <div className="absolute inset-0 transition-colors duration-700" style={{
            backgroundColor: isHovered ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.5)'
          }} />
        </div>

        {/* Enhanced Region Content with Glass Overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <motion.div
            className={`${"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"} px-8 py-4 rounded-2xl`}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-wider"
                style={{
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.5s'
                }}>
              {region.name}
            </h2>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-center"
              >
                <p className="text-white/90 text-sm font-medium">Generation {region.generation}</p>
                <p className="text-white/80 text-xs mt-1">{region.starters}</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Subtle Border Effect on Hover */}
        <div className="absolute inset-x-0 bottom-0 h-1 transition-all duration-500" style={{
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0)'
        }} />
        </div>
      </Link>
    </motion.div>
  );
};

const RegionsPage: NextPage = () => {
  const { theme } = useTheme();
  const router = useRouter();
  
  // Use smooth parallax hook for jitter-free scrolling
  const parallaxOffset = useSmoothParallax(0.5); // Increased parallax factor for more noticeable effect

  // Clean up transition class on component mount (SSR safe)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('region-zoom-transition');
    }
  }, []);

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Pokémon Regions | DexTrends</title>
        <meta name="description" content="Explore all Pokémon regions from Kanto to Paldea. Discover the unique features, Pokémon, and stories of each region." />
        <meta name="keywords" content="Pokemon regions, Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea" />
      </Head>

      {/* Hero Section with Parallax */}
      <div style={{ 
        position: 'relative', 
        height: '100vh',
        marginTop: '-80px',
        paddingTop: '80px',
        overflow: 'hidden',
        background: 'linear-gradient(to bottom right, #4B5563, #6B46C1, #4B5563)'
      }}>
        {/* Map Background Container */}
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `translate3d(0, ${parallaxOffset * -0.5}px, 0)`,
          willChange: 'transform'
        }}>
          {/* Arceus Map Image */}
          <img 
            src="/images/scraped/maps/arcius.png"
            alt="Arceus Pokemon Map"
            style={{
              position: 'absolute',
              top: '45%',
              left: '50%',
              transform: 'translate(-50%, -50%) scale(1.3)',
              minWidth: '130%',
              minHeight: '130%',
              width: 'auto',
              height: 'auto',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: 'brightness(0.8) contrast(1.1)'
            }}
          />
          
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: 0,
            right: 0,
            bottom: '-50px',
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(26, 26, 46, 0.3) 60%, rgba(26, 26, 46, 0.8) 100%)',
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
          {/* Enhanced Title with Glass Background */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`${"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"} p-8 md:p-12 rounded-3xl`}
          >
            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-wider text-center mb-4"
                style={{ textShadow: '3px 3px 6px rgba(0, 0, 0, 0.8)' }}>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                Pokemon Regions
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 text-center font-medium"
               style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}>
              Explore diverse regions in the world of Pokémon
            </p>
            
            <div className="flex justify-center gap-4 mt-6">
              <Button gradient={true}
                onClick={() => {
                  if (typeof document !== 'undefined') {
                    document.getElementById('regions-grid')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                variant="primary"
                className="px-6 py-3"
              >
                <FiMap className="w-5 h-5 mr-2" />
                Explore All Regions
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative" style={{ marginTop: '0', zIndex: 1 }}>
        {/* Back Button */}
        <div className="container mx-auto px-4 py-6">
          <Button
            onClick={() => router.push('/pokemon')}
            variant="secondary"
            size="md"
            className="hover:scale-105 transition-transform"
          >
            <FiChevronLeft className="w-5 h-5" />
            Back to Pokemon Hub
          </Button>
        </div>

        {/* Regions Grid - Full Width */}
        <div id="regions-grid" className="relative w-full">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {regions.map((region, index) => (
              <div key={region.id}>
                {/* Enhanced Generation Separator with Glass Style */}
                <motion.div 
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative w-full h-12 flex items-center px-8 ${"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{region.icon}</span>
                    <span className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Generation {region.generation}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                      {region.name} Region
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-gray-400">{region.starters}</span>
                  </div>
                </motion.div>
                
                {/* Region Tile */}
                <RegionTile region={region} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`${"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"} p-8 rounded-3xl`}
          >
            <h2 className="text-3xl font-bold text-center mb-8">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Regional Statistics
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"} p-6 rounded-2xl text-center`}
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent mb-2">
                  9
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Regions</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"} p-6 rounded-2xl text-center`}
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-pink-400 bg-clip-text text-transparent mb-2">
                  1000+
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pokemon</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${"bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20"} p-6 rounded-2xl text-center`}
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                  27
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Starter Pokemon</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(12deg); }
          100% { transform: translateX(300%) skewX(12deg); }
        }
        .animate-shine {
          animation: shine 1s ease-in-out;
        }

        /* Smooth page transition zoom effect */
        .region-zoom-transition {
          overflow: hidden;
        }
        
        .region-zoom-transition .region-map-image {
          transform: scale(3) !important;
          transition: transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
        }

        /* Next.js page transition */
        .page-transition-enter {
          opacity: 0;
          transform: scale(1.1);
        }
        
        .page-transition-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
        
        .page-transition-exit {
          opacity: 1;
          transform: scale(1);
        }
        
        .page-transition-exit-active {
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }
      `}</style>
    </FullBleedWrapper>
  );
};

export default RegionsPage;