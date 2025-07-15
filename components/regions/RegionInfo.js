import React from 'react';
import { FadeIn, SlideUp, StaggeredChildren } from '../ui/animations/animations';
import { BsPerson, BsController, BsGlobe, BsBarChart } from 'react-icons/bs';

const RegionInfo = ({ region, theme }) => {
  return (
    <div className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-3">About {region.name}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {region.description}
            </p>
          </div>
        </FadeIn>

        <StaggeredChildren className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Professor Card */}
          <SlideUp>
            <div className={`relative rounded-xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-5 text-center shadow-md hover:shadow-lg transition-all border ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center`}>
                <BsPerson className="text-2xl text-white" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Professor</h3>
              <p className="text-lg font-bold">{region.professor}</p>
            </div>
          </SlideUp>

          {/* Generation Card */}
          <SlideUp delay={0.1}>
            <div className={`relative rounded-xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-5 text-center shadow-md hover:shadow-lg transition-all border ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center`}>
                <BsGlobe className="text-2xl text-white" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 text-center">Generation</h3>
              <p className="text-3xl font-bold text-center">{region.generation}</p>
            </div>
          </SlideUp>

          {/* Pokemon Range Card */}
          <SlideUp delay={0.2}>
            <div className={`relative rounded-xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-5 text-center shadow-md hover:shadow-lg transition-all border ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center`}>
                <BsBarChart className="text-2xl text-white" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pokédex</h3>
              <p className="text-base font-bold">{region.pokemonRange}</p>
            </div>
          </SlideUp>

          {/* Games Card */}
          <SlideUp delay={0.3}>
            <div className={`relative rounded-xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-5 text-center shadow-md hover:shadow-lg transition-all border ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center`}>
                <BsController className="text-2xl text-white" />
              </div>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Games</h3>
              <p className="text-xl font-bold">{region.games.length}</p>
            </div>
          </SlideUp>
        </StaggeredChildren>

        {/* Region Features */}
        <div className="grid md:grid-cols-2 gap-6">
          <FadeIn>
            <div className={`rounded-xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-6 shadow-md border ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h3 className="text-xl font-bold mb-4">Region Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Total Cities</span>
                  <span className="text-lg font-bold">{region.cities}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Total Routes</span>
                  <span className="text-lg font-bold">{region.routes}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    {region.gymLeaders ? 'Gym Leaders' : region.trialCaptains ? 'Trial Captains' : 'Leaders'}
                  </span>
                  <span className="text-lg font-bold">
                    {region.gymLeaders?.length || region.trialCaptains?.length || 0}
                  </span>
                </div>
                {region.islandKahunas && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Island Kahunas</span>
                    <span className="text-lg font-bold">{region.islandKahunas.length}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Legendary Pokémon</span>
                  <span className="text-lg font-bold">{region.legendaries.length}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className={`rounded-xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-6 shadow-md border ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h3 className="text-xl font-bold mb-4">Available Games</h3>
              <div className="flex flex-wrap gap-2">
                {region.games.map((game) => (
                  <span
                    key={game}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                      theme === 'dark' 
                        ? 'bg-gray-600 text-gray-200' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Pokémon {game}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default RegionInfo;