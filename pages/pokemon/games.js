import React, { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from "../../components/ui/animations";
import { useTheme } from "../../context/themecontext";
import StyledBackButton from "../../components/ui/StyledBackButton";
import { BsCalendar, BsGlobe, BsController, BsArrowRight, BsPlayFill } from "react-icons/bs";
import { GiCardPickup } from "react-icons/gi";

// Comprehensive Pokemon games data with scraped image integration
const pokemonGames = [
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

export default function GamesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedGeneration, setSelectedGeneration] = useState(null);

  return (
    <div className="min-h-screen">
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
            <div 
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <GiCardPickup className="text-white text-6xl" />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-8">
          <FadeIn>
            <h1 className="text-7xl md:text-8xl font-black mb-6 tracking-tight">
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
              <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="font-bold">1996 - Present</span>
              </div>
              <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="font-bold">40+ Main Games</span>
              </div>
              <div className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full">
                <span className="font-bold">9 Regions</span>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Back Button */}
        <div className="absolute top-8 left-8 z-20">
          <StyledBackButton 
            text="Back to Pokémon Hub" 
            onClick={() => router.push('/pokemon')} 
          />
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Scroll to explore</span>
            <BsArrowRight className="rotate-90 text-2xl" />
          </div>
        </div>
      </div>

      {/* Games Timeline */}
      <div className="max-w-7xl mx-auto px-8 py-20">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Game Timeline</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Journey through the evolution of Pokémon games, from the iconic originals to the latest open-world adventures
            </p>
          </div>
        </FadeIn>

        {/* Generation Cards */}
        <StaggeredChildren className="space-y-16">
          {pokemonGames.map((generation, genIndex) => (
            <SlideUp key={generation.generation} delay={genIndex * 0.1}>
              <div className={`relative rounded-3xl overflow-hidden ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              } shadow-2xl border border-gray-200 dark:border-gray-700`}>
                {/* Generation Header */}
                <div className={`relative p-8 bg-gradient-to-r ${generation.color} text-white`}>
                  <div className="flex flex-wrap items-center justify-between">
                    <div>
                      <h3 className="text-4xl font-bold mb-2">Generation {generation.generation}</h3>
                      <p className="text-xl opacity-90">{generation.era}</p>
                      <Link 
                        href={`/pokemon/regions/${generation.region.toLowerCase()}`}
                        className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                      >
                        <BsGlobe />
                        <span>Explore {generation.region}</span>
                      </Link>
                    </div>
                    <div className="text-right">
                      <div className="text-6xl font-black opacity-20">
                        {generation.generation}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Games Grid */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {generation.games.map((game, gameIndex) => (
                      <CardHover key={game.name}>
                        <div className={`relative rounded-2xl overflow-hidden ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        } hover:shadow-xl transition-all group`}>
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
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                              
                              {/* Second Cover (if exists) */}
                              {(game.blueCover || game.silverCover || game.sapphireCover || game.pearlCover || game.shieldCover || game.violetCover || game.leafGreenCover || game.alphaSapphireCover) && (
                                <div className="flex-1 relative">
                                  <Image
                                    src={game.blueCover || game.silverCover || game.sapphireCover || game.pearlCover || game.shieldCover || game.violetCover || game.leafGreenCover || game.alphaSapphireCover}
                                    alt={game.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                            
                            {/* Year Badge */}
                            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full px-3 py-1">
                              <span className="text-white font-bold">{game.year}</span>
                            </div>

                            {/* Play Icon Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                              <BsPlayFill className="text-white text-6xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </div>

                          {/* Game Info */}
                          <div className="p-6">
                            <h4 className="text-2xl font-bold mb-2">{game.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                              <div className="flex items-center gap-1">
                                <BsController />
                                <span>{game.platform}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <BsCalendar />
                                <span>{game.year}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              {game.description}
                            </p>
                            
                            {/* Features */}
                            <div className="flex flex-wrap gap-2">
                              {game.features.slice(0, 3).map((feature, idx) => (
                                <span 
                                  key={idx}
                                  className={`text-xs px-3 py-1 rounded-full bg-gradient-to-r ${generation.color} text-white font-medium`}
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardHover>
                    ))}
                  </div>
                </div>
              </div>
            </SlideUp>
          ))}
        </StaggeredChildren>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}