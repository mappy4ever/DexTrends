import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BsCalendar, BsController, BsGlobe } from 'react-icons/bs';
import { FaGamepad } from 'react-icons/fa';

const GameTimeline = ({ games, theme }) => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [hoveredGame, setHoveredGame] = useState(null);

  // Flatten all games and sort by release date
  const allGames = [];
  games.mainSeries.forEach(gen => {
    gen.games.forEach(game => {
      allGames.push({
        ...game,
        generation: gen.generation,
        type: 'main'
      });
    });
  });

  // Add major spinoffs to timeline
  const majorSpinoffs = [
    {
      id: 'stadium',
      names: ['Pokémon Stadium'],
      releaseDate: '1999-04-30',
      platform: 'Nintendo 64',
      type: 'spinoff',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'colosseum',
      names: ['Pokémon Colosseum'],
      releaseDate: '2003-11-21',
      platform: 'GameCube',
      type: 'spinoff',
      color: 'from-gray-700 to-purple-700'
    },
    {
      id: 'go',
      names: ['Pokémon GO'],
      releaseDate: '2016-07-06',
      platform: 'Mobile',
      type: 'spinoff',
      color: 'from-blue-400 to-yellow-400'
    },
    {
      id: 'unite',
      names: ['Pokémon UNITE'],
      releaseDate: '2021-07-21',
      platform: 'Switch/Mobile',
      type: 'spinoff',
      color: 'from-purple-600 to-orange-500'
    }
  ];

  allGames.push(...majorSpinoffs);

  // Sort by date
  allGames.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));

  // Group games by year
  const gamesByYear = {};
  allGames.forEach(game => {
    const year = new Date(game.releaseDate).getFullYear();
    if (!gamesByYear[year]) {
      gamesByYear[year] = [];
    }
    gamesByYear[year].push(game);
  });

  const years = Object.keys(gamesByYear).sort();
  const startYear = parseInt(years[0]);
  const endYear = parseInt(years[years.length - 1]);
  const totalYears = endYear - startYear + 1;

  // Color scale for timeline
  const getYearColor = (year) => {
    const progress = (year - startYear) / totalYears;
    if (progress < 0.2) return 'from-red-500 to-red-600';
    if (progress < 0.4) return 'from-blue-500 to-blue-600';
    if (progress < 0.6) return 'from-yellow-500 to-yellow-600';
    if (progress < 0.8) return 'from-green-500 to-green-600';
    return 'from-purple-500 to-purple-600';
  };

  return (
    <div className="relative py-8">
      {/* Year selector */}
      <div className="mb-8 overflow-x-auto pb-4">
        <div className="flex gap-2 min-w-max px-4">
          {years.map(year => (
            <motion.button
              key={year}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedYear(year === selectedYear ? null : year)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                selectedYear === year
                  ? 'bg-gradient-to-r from-pokemon-red to-pokemon-blue text-white'
                  : theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {year}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-pokemon-red via-pokemon-yellow to-pokemon-blue"></div>

        {/* Games */}
        <div className="space-y-8">
          {years.map((year, yearIndex) => {
            const yearGames = gamesByYear[year];
            const isExpanded = selectedYear === null || selectedYear === year;

            return (
              <motion.div
                key={year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isExpanded ? 1 : 0.3,
                  x: 0,
                  scale: isExpanded ? 1 : 0.95
                }}
                transition={{ duration: 0.3, delay: yearIndex * 0.05 }}
                className="relative"
              >
                {/* Year marker */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`relative z-10 w-16 h-16 rounded-full bg-gradient-to-br ${getYearColor(parseInt(year))} flex items-center justify-center text-white font-bold shadow-lg`}>
                    {year.slice(-2)}
                  </div>
                  <h3 className="text-2xl font-bold">{year}</h3>
                  <span className="text-sm text-gray-500">
                    {yearGames.length} release{yearGames.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Games for this year */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="ml-20 space-y-4"
                  >
                    {yearGames.map((game, gameIndex) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: gameIndex * 0.1 }}
                        onMouseEnter={() => setHoveredGame(game.id)}
                        onMouseLeave={() => setHoveredGame(null)}
                        className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                          theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                        } shadow-lg ${hoveredGame === game.id ? 'scale-105 shadow-2xl' : ''}`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-10`}></div>
                        
                        <div className="relative p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold mb-2">
                                {game.names.join(' & ')}
                              </h4>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <BsController />
                                  <span>{game.platform}</span>
                                </div>
                                {game.region && (
                                  <div className="flex items-center gap-1">
                                    <BsGlobe />
                                    <span>{game.region}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <BsCalendar />
                                  <span>{new Date(game.releaseDate).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {game.description && hoveredGame === game.id && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-3 text-sm text-gray-600 dark:text-gray-400"
                                >
                                  {game.description}
                                </motion.p>
                              )}
                            </div>

                            {/* Type indicator */}
                            <div className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${
                              game.type === 'main'
                                ? 'bg-pokemon-red text-white'
                                : 'bg-pokemon-purple text-white'
                            }`}>
                              {game.type === 'main' ? `Gen ${game.generation}` : 'Spin-off'}
                            </div>
                          </div>

                          {/* Features for main games */}
                          {game.features && hoveredGame === game.id && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600"
                            >
                              <div className="flex flex-wrap gap-2">
                                {game.features.slice(0, 3).map((feature, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded-full text-xs"
                                  >
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Timeline statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`mt-12 p-6 rounded-2xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}
      >
        <h3 className="text-xl font-bold mb-4 text-center">Timeline Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-pokemon-red">{totalYears}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Years of Pokémon</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pokemon-blue">{allGames.filter(g => g.type === 'main').length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Main Games</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pokemon-yellow">{allGames.filter(g => g.type === 'spinoff').length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Major Spin-offs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pokemon-green">{Object.keys(gamesByYear).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Release Years</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameTimeline;