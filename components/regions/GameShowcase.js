import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getGameCoverArt, getGameLogo } from '../../utils/scrapedImageMapping';
import { FadeIn, SlideUp, CardHover, StaggeredChildren } from '../ui/animations';
import { BsController, BsArrowRight } from 'react-icons/bs';

const GameShowcase = ({ region, theme }) => {
  // Get the first possible path for each game
  const getGameCover = (gameName) => {
    const paths = getGameCoverArt(gameName);
    return paths[0];
  };

  return (
    <div className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Games in {region.name}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Experience the region across different generations
            </p>
          </div>
        </FadeIn>
        
        <StaggeredChildren className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {region.games.map((game, index) => (
            <SlideUp key={game} delay={index * 0.05}>
              <CardHover>
                <div className={`relative group cursor-pointer`}>
                  <div className={`relative h-80 rounded-xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  } shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
                    <Image
                      src={getGameCover(game)}
                      alt={`Pokémon ${game} cover`}
                      layout="fill"
                      objectFit="cover"
                      objectPosition="center"
                      className="group-hover:scale-105 transition-transform duration-500"
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
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                        <BsController className="text-5xl text-white mb-2 mx-auto" />
                        <p className="text-white font-bold text-lg">Play Now</p>
                      </div>
                    </div>
                    
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  
                  {/* Game title */}
                  <h3 className="mt-3 text-center font-bold text-lg">
                    Pokémon {game}
                  </h3>
                </div>
              </CardHover>
            </SlideUp>
          ))}
        </StaggeredChildren>

        {/* Generation info and link to all games */}
        <div className="mt-12 text-center space-y-6">
          <FadeIn>
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <span className="text-gray-600 dark:text-gray-400">Generation</span>
              <span className={`text-2xl font-bold bg-gradient-to-r ${region.color} bg-clip-text text-transparent`}>
                {region.generation}
              </span>
            </div>
          </FadeIn>
          
          <FadeIn>
            <Link 
              href="/pokemon/games"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-opacity"
            >
              <BsController />
              <span>View All Games</span>
              <BsArrowRight />
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
        }
        .game-cover-fallback::after {
          content: 'Pokémon';
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  );
};

export default GameShowcase;