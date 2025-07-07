import React from 'react';
import { FadeIn, SlideUp, StaggeredChildren } from '../ui/animations';
import { BsPerson, BsController, BsGlobe, BsBarChart } from 'react-icons/bs';

const RegionInfo = ({ region, theme }) => {
  return (
    <div className={`py-20 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">About {region.name}</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {region.description}
            </p>
          </div>
        </FadeIn>

        <StaggeredChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Professor Card */}
          <SlideUp>
            <div className={`relative rounded-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-6 text-center shadow-lg hover:shadow-xl transition-shadow`}>
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center`}>
                <BsPerson className="text-3xl text-white" />
              </div>
              <h3 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Professor</h3>
              <p className="text-2xl font-bold">{region.professor}</p>
            </div>
          </SlideUp>

          {/* Generation Card */}
          <SlideUp delay={0.1}>
            <div className={`relative rounded-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-6 text-center shadow-lg hover:shadow-xl transition-shadow`}>
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center`}>
                <BsGlobe className="text-3xl text-white" />
              </div>
              <h3 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Generation</h3>
              <p className="text-4xl font-bold">{region.generation}</p>
            </div>
          </SlideUp>

          {/* Pokemon Range Card */}
          <SlideUp delay={0.2}>
            <div className={`relative rounded-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-6 text-center shadow-lg hover:shadow-xl transition-shadow`}>
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center`}>
                <BsBarChart className="text-3xl text-white" />
              </div>
              <h3 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Pokédex</h3>
              <p className="text-xl font-bold">{region.pokemonRange}</p>
            </div>
          </SlideUp>

          {/* Games Card */}
          <SlideUp delay={0.3}>
            <div className={`relative rounded-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-6 text-center shadow-lg hover:shadow-xl transition-shadow`}>
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${region.color} flex items-center justify-center`}>
                <BsController className="text-3xl text-white" />
              </div>
              <h3 className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Games</h3>
              <p className="text-2xl font-bold">{region.games.length}</p>
            </div>
          </SlideUp>
        </StaggeredChildren>

        {/* Region Features */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <FadeIn>
            <div className={`rounded-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-8`}>
              <h3 className="text-2xl font-bold mb-6">Region Features</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Cities</span>
                  <span className="text-2xl font-bold">{region.cities}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total Routes</span>
                  <span className="text-2xl font-bold">{region.routes}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">
                    {region.gymLeaders ? 'Gym Leaders' : 'Trial Captains'}
                  </span>
                  <span className="text-2xl font-bold">
                    {region.gymLeaders?.length || region.trialCaptains?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Legendary Pokémon</span>
                  <span className="text-2xl font-bold">{region.legendaries.length}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className={`rounded-2xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-white'
            } p-8`}>
              <h3 className="text-2xl font-bold mb-6">Available Games</h3>
              <div className="flex flex-wrap gap-3">
                {region.games.map((game) => (
                  <span
                    key={game}
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
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