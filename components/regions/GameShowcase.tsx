import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGameCoverArt, getGameLogo } from '../../utils/scrapedImageMapping';
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from '../ui/animations/animations';
import { BsArrowRight, BsStarFill, BsGeoAlt } from 'react-icons/bs';
import { FaGamepad } from 'react-icons/fa';

// Type definitions
interface RegionData {
  name: string;
  generation: string | number;
  games: string[];
  color: string;
  id?: string;
  description?: string;
  professor?: string;
  pokemonRange?: string;
}

interface GameShowcaseProps {
  region: RegionData;
  theme: 'light' | 'dark';
}

const GameShowcase: React.FC<GameShowcaseProps> = ({ region, theme }) => {
  // Get the first possible path for each game
  const getGameCover = (gameName: string): string => {
    const paths = getGameCoverArt(gameName);
    return paths[0];
  };

  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeIn>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              Games in {region.name}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Experience the {region.name} region across different generations
            </p>
          </div>
        </FadeIn>
        
        {/* Enhanced Glass Morphism Game Grid */}
        <StaggeredChildren className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {region.games.map((game, index) => (
            <SlideUp key={game} delay={index * 0.05}>
              <Link href={`/pokemon/games/${game.toLowerCase().replace(/\s+/g, '-')}`} className="block group">
                <CardHover>
                  <div className="relative transform transition-all duration-500 hover:-translate-y-3 hover:rotate-1">
                    {/* Liquid Glass Card Container */}
                    <div className={`
                      relative rounded-3xl overflow-hidden
                      backdrop-blur-xl
                      ${
                        theme === 'dark' 
                          ? 'bg-gradient-to-br from-gray-800/90 via-purple-900/30 to-gray-900/90' 
                          : 'bg-gradient-to-br from-white/90 via-purple-100/40 to-white/80'
                      }
                      shadow-[0_8px_32px_rgba(139,92,246,0.15)]
                      group-hover:shadow-[0_16px_48px_rgba(139,92,246,0.25)]
                      transition-all duration-500
                      border border-white/20
                      group-hover:border-purple-400/40
                    `}>
                      
                      {/* Animated Gradient Border Glow */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="absolute inset-[-2px] rounded-3xl bg-gradient-to-r from-pink-400/30 via-purple-400/30 to-blue-400/30 blur-xl" />
                      </div>
                      
                      {/* Large Game Cover Display */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-purple-200/20 to-pink-200/20">
                        <Image
                          src={getGameCover(game)}
                          alt={`Pokémon ${game} cover`}
                          fill
                          className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          priority={index < 4}
                          onError={(e) => {
                            const paths = getGameCoverArt(game);
                            const target = e.target as HTMLImageElement;
                            const currentIndex = paths.findIndex(p => target.src.includes(p));
                            if (currentIndex < paths.length - 1) {
                              target.src = paths[currentIndex + 1];
                            } else {
                              // Enhanced fallback with gradient
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.classList.add('game-cover-fallback-enhanced');
                              }
                            }
                          }}
                        />
                        
                        {/* Soft Glass Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/10 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        
                        {/* Floating Version Badge */}
                        <div className="absolute top-4 left-4 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 px-3 py-1.5 rounded-full shadow-lg transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
                          <span className="text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Gen {region.generation}
                          </span>
                        </div>
                        
                        {/* Interactive Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-20 h-20 rounded-full backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 flex items-center justify-center shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-100">
                            <BsArrowRight className="text-3xl text-purple-600 dark:text-purple-400 translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Glass Info Panel */}
                      <div className="relative p-5">
                        {/* Glass Divider */}
                        <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
                        
                        {/* Title with Gradient */}
                        <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                          Pokémon {game}
                        </h3>
                        
                        {/* Release Info Pills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/30">
                            {region.name}
                          </span>
                          {game.includes('&') && game.split(' & ').map((version, idx) => (
                            <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-pink-100/50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200/30">
                              {version}
                            </span>
                          ))}
                        </div>
                        
                        {/* Interactive Elements */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <BsStarFill key={i} className={`text-xs ${
                                i < 4 ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                              }`} />
                            ))}
                          </div>
                          
                          {/* Play Now Text */}
                          <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1">
                            Play
                            <BsArrowRight className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                      
                      {/* Bottom Glass Edge Effect */}
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                    </div>
                  </div>
                </CardHover>
              </Link>
            </SlideUp>
          ))}
        </StaggeredChildren>

        {/* Generation info and link to all games */}
        <div className="mt-16 text-center space-y-8">
          <FadeIn>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Generation badge */}
              <div className={`relative group`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${region.color} rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
                <div className={`relative inline-flex items-center gap-3 px-8 py-4 rounded-full ${
                  theme === 'dark' 
                    ? 'bg-gray-800/80 backdrop-blur-sm border border-gray-700' 
                    : 'bg-white/80 backdrop-blur-sm border border-gray-200'
                } shadow-lg`}>
                  <FaGamepad className={`text-2xl bg-gradient-to-r ${region.color} bg-clip-text text-transparent`} />
                  <div className="text-left">
                    <span className="text-sm text-gray-600 dark:text-gray-400 block">Generation</span>
                    <span className={`text-3xl font-bold bg-gradient-to-r ${region.color} bg-clip-text text-transparent`}>
                      {region.generation}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Stats or fun fact */}
              <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
                theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'
              }`}>
                <BsStarFill className="text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {region.games.length} Games Released
                </span>
              </div>
            </div>
          </FadeIn>
          
          <FadeIn>
            <Link href="/pokemon/games" className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <FaGamepad className="relative z-10 text-xl" />
                <span className="relative z-10">Explore All Pokémon Games</span>
                <BsArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          </FadeIn>
        </div>
      </div>

      <style jsx>{`
        .game-cover-fallback-enhanced {
          display: flex !important;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, 
            rgba(196, 181, 253, 0.3) 0%, 
            rgba(244, 114, 182, 0.3) 50%, 
            rgba(147, 197, 253, 0.3) 100%);
          position: relative;
          overflow: hidden;
        }
        .game-cover-fallback-enhanced::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(255,255,255,0.1) 20px,
            rgba(255,255,255,0.1) 40px
          );
          animation: slide 20s linear infinite;
        }
        .game-cover-fallback-enhanced::after {
          content: 'Pokémon';
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 2rem;
          font-weight: bold;
          position: relative;
          z-index: 1;
        }
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(40px); }
        }
      `}</style>
    </div>
  );
};

export default GameShowcase;