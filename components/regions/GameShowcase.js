import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGameCoverArt, getGameLogo } from '../../utils/scrapedImageMapping';
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from '../ui/animations/animations';
import { BsArrowRight, BsStarFill, BsGeoAlt } from 'react-icons/bs';
import { FaGamepad } from 'react-icons/fa';

const GameShowcase = ({ region, theme }) => {
  // Get the first possible path for each game
  const getGameCover = (gameName) => {
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
        
        <StaggeredChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {region.games.map((game, index) => (
            <SlideUp key={game} delay={index * 0.05}>
              <Link href={`/pokemon/games/${game.toLowerCase().replace(/\s+/g, '-')}`} className="block group">
                <CardHover>
                    <div className={`relative transform transition-all duration-300 hover:-translate-y-2`}>
                      {/* Card container with border */}
                      <div className={`relative h-80 rounded-2xl overflow-hidden ${
                        theme === 'dark' 
                          ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-700' 
                          : 'bg-gradient-to-br from-white via-gray-50 to-gray-100'
                      } shadow-xl group-hover:shadow-2xl transition-all duration-300 border-2 ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                      } group-hover:border-transparent`}>
                        
                        {/* Animated gradient border on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 -z-10" />
                        
                        {/* Game cover image */}
                        <div className="relative h-60 overflow-hidden">
                          <Image
                            src={getGameCover(game)}
                            alt={`Pokémon ${game} cover`}
                            layout="fill"
                            objectFit="cover"
                            objectPosition="center"
                            className="group-hover:scale-110 transition-transform duration-700 ease-out"
                            onError={(e) => {
                              const paths = getGameCoverArt(game);
                              const currentIndex = paths.findIndex(p => e.target.src.includes(p));
                              if (currentIndex < paths.length - 1) {
                                e.target.src = paths[currentIndex + 1];
                              } else {
                                // Fallback to placeholder
                                e.target.style.display = 'none';
                                e.target.parentElement.classList.add('game-cover-fallback');
                              }
                            }}
                          />
                          
                          {/* Subtle gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                        </div>
                        
                        {/* Game info section */}
                        <div className={`absolute bottom-0 left-0 right-0 p-4 ${
                          theme === 'dark' 
                            ? 'bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent' 
                            : 'bg-gradient-to-t from-white via-white/95 to-transparent'
                        }`}>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-blue-500 transition-colors">
                            Pokémon {game}
                          </h3>
                          
                          {/* Hover overlay with explore button */}
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <button className="flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-600">
                              <span>Explore More</span>
                              <BsArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex items-center gap-1">
                            {[...Array(3)].map((_, i) => (
                              <BsStarFill key={i} className="text-yellow-400 text-xs" />
                            ))}
                          </div>
                        </div>
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
        .game-cover-fallback {
          display: flex !important;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }
        .game-cover-fallback::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          );
        }
        .game-cover-fallback::after {
          content: 'Pokémon';
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

export default GameShowcase;