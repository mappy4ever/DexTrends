import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FadeIn, SlideUp } from "../../components/ui/animations";
import { useTheme } from "../../context/UnifiedAppContext";
import { BsGlobeEuropeAfrica } from "react-icons/bs";
import { FullBleedWrapper } from "../../components/ui/FullBleedWrapper";

// Region data with actual map images
const regions = [
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
const getGenerationColor = (generation) => {
  const colors = {
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

// Region Tile Component with consistent styling
const RegionTile = ({ region }) => {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    // Add zoom class to body for page transition
    document.body.classList.add('region-zoom-transition');
    
    // Navigate immediately - let Next.js handle the transition
    router.push(`/pokemon/regions/${region.id}`);
  };

  return (
    <Link href={`/pokemon/regions/${region.id}`}>
      <div
        className="relative h-40 md:h-48 overflow-hidden cursor-pointer transform transition-all duration-700 hover:scale-105 hover:z-10"
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
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
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

        {/* Region Content */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <h2 style={{
            fontSize: 'clamp(3rem, 6vw, 5rem)',
            fontWeight: '900',
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: isHovered ? '0.1em' : '0.05em',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            transition: 'all 0.5s'
          }}>
            {region.name}
          </h2>
        </div>

        {/* Subtle Border Effect on Hover */}
        <div className="absolute inset-x-0 bottom-0 h-1 transition-all duration-500" style={{
          backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0)'
        }} />
      </div>
    </Link>
  );
};

export default function RegionsPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const [scrollY, setScrollY] = useState(0);

  // Clean up transition class on component mount
  useEffect(() => {
    document.body.classList.remove('region-zoom-transition');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax effect calculation
  const parallaxOffset = scrollY * 0.5;

  return (
    <>
      <Head>
        <title>Pokémon Regions | DexTrends</title>
        <meta name="description" content="Explore all Pokémon regions from Kanto to Paldea. Discover the unique features, Pokémon, and stories of each region." />
        <meta name="keywords" content="Pokemon regions, Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea" />
      </Head>

      {/* Hero Section with Parallax - Exact copy from RegionHero */}
      <div style={{ 
        position: 'relative', 
        height: '100vh',
        overflow: 'hidden',
        background: '#16213e',
        marginTop: '-80px',
        paddingTop: '80px',
        marginBottom: '0'
      }}>
        {/* Map Background Container */}
        <div style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: `translateY(${parallaxOffset}px)`,
          transition: 'transform 0.1s ease-out'
        }}>
          {/* Arceus Map Image */}
          <img 
            src="/images/scraped/maps/arcius.png"
            alt="Arceus Pokemon Map"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120%',
              height: '120%',
              objectFit: 'cover',
              filter: 'brightness(0.8) contrast(1.1)',
              borderRadius: '0 0 100px 100px',
              maskImage: 'radial-gradient(ellipse 100% 100% at center center, black 50%, transparent 90%)',
              WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at center center, black 50%, transparent 90%)'
            }}
          />
          
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
          justifyContent: 'flex-end',
          padding: '2rem',
          paddingBottom: '4rem'
        }}>
          {/* Tagline */}
          <p style={{
            fontSize: '1.75rem',
            color: 'rgba(255, 255, 255, 0.7)',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
            maxWidth: '800px',
            textAlign: 'center',
            fontWeight: '400',
            letterSpacing: '0.05em'
          }}>
            Explore diverse regions in the world of Pokémon
          </p>
        </div>
      </div>

      <div className="relative" style={{ marginTop: '0' }}>
        <div className="absolute inset-0 bg-black" style={{ zIndex: -1 }} />

        {/* Regions Grid - Full Width */}
        <div className="relative z-10 w-full">
          <div>
            {regions.map((region, index) => (
              <div key={region.id}>
                {/* Generation Separator Bar */}
                <div className="relative w-full h-8 flex items-center justify-between px-8 border-y overflow-visible" style={{
                  background: 'rgba(55, 65, 81, 0.8)',
                  borderColor: 'rgba(75, 85, 99, 0.5)',
                  backdropFilter: 'blur(4px)'
                }}>
                  <span style={{
                    color: 'rgba(209, 213, 219, 1)',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em'
                  }}>
                    Generation {region.generation}
                  </span>
                  
                  {/* Starters Section */}
                  <div className="flex items-center gap-3">
                    <span style={{
                      color: 'rgba(209, 213, 219, 1)',
                      fontSize: '0.8125rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      Starters:
                    </span>
                    <div className="flex gap-2 relative">
                      {region.starterIds && region.starterIds.map((id) => (
                        <img
                          key={id}
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                          alt={`Starter ${id}`}
                          style={{
                            width: '48px',
                            height: '48px',
                            imageRendering: 'pixelated',
                            position: 'relative',
                            top: '-2px'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Region Tile */}
                <RegionTile region={region} />
              </div>
            ))}
          </div>
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
          transform: scale(2) !important;
          transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
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
    </>
  );
}