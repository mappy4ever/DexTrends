import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TypeBadge } from '../ui/TypeBadge';
import { FadeIn, SlideUp, CardHover, Scale } from '../ui/animations/animations';
import { BsArrowRight, BsController, BsCardList } from 'react-icons/bs';

// Type definitions
interface RegionData {
  name: string;
  color: string;
  games: string[];
  starters: string[];
  starterIds: number[];
  starterTypes: string[][];
  [key: string]: any;
}

interface StarterShowcaseProps {
  region: RegionData;
  theme: 'light' | 'dark';
}

const StarterShowcase: React.FC<StarterShowcaseProps> = ({ region, theme }) => {
  const [selectedStarter, setSelectedStarter] = useState(0);
  const [showEvolutions, setShowEvolutions] = useState(false);

  // Evolution data for starters
  const starterEvolutions: Record<number, number[]> = {
    1: [1, 2, 3], // Bulbasaur line
    4: [4, 5, 6], // Charmander line
    7: [7, 8, 9], // Squirtle line
    152: [152, 153, 154], // Chikorita line
    155: [155, 156, 157], // Cyndaquil line
    158: [158, 159, 160], // Totodile line
    252: [252, 253, 254], // Treecko line
    255: [255, 256, 257], // Torchic line
    258: [258, 259, 260], // Mudkip line
    387: [387, 388, 389], // Turtwig line
    390: [390, 391, 392], // Chimchar line
    393: [393, 394, 395], // Piplup line
    495: [495, 496, 497], // Snivy line
    498: [498, 499, 500], // Tepig line
    501: [501, 502, 503], // Oshawott line
    650: [650, 651, 652], // Chespin line
    653: [653, 654, 655], // Fennekin line
    656: [656, 657, 658], // Froakie line
    722: [722, 723, 724], // Rowlet line
    725: [725, 726, 727], // Litten line
    728: [728, 729, 730], // Popplio line
    810: [810, 811, 812], // Grookey line
    813: [813, 814, 815], // Scorbunny line
    816: [816, 817, 818], // Sobble line
    906: [906, 907, 908], // Sprigatito line
    909: [909, 910, 911], // Fuecoco line
    912: [912, 913, 914], // Quaxly line
  };

  const evolutionNames: Record<number, string> = {
    // Kanto
    1: 'Bulbasaur', 2: 'Ivysaur', 3: 'Venusaur',
    4: 'Charmander', 5: 'Charmeleon', 6: 'Charizard',
    7: 'Squirtle', 8: 'Wartortle', 9: 'Blastoise',
    // Add more as needed...
  };

  const getTypeGradient = (types: string[]): string => {
    const type = types[0];
    const gradients: Record<string, string> = {
      grass: 'from-green-400 to-green-600',
      fire: 'from-red-400 to-orange-600',
      water: 'from-blue-400 to-blue-600',
      flying: 'from-blue-300 to-indigo-400',
      poison: 'from-purple-400 to-purple-600',
    };
    return gradients[type] || 'from-gray-400 to-gray-600';
  };

  const currentEvolutionLine = starterEvolutions[region.starterIds[selectedStarter]] || [];

  return (
    <div className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">
              Choose Your Partner
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Begin your journey with one of these starter Pokémon
            </p>
          </div>
        </FadeIn>

        {/* Starter Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {region.starterIds.map((id, index) => (
            <SlideUp key={id} delay={index * 0.1}>
              <CardHover>
                <div
                  onClick={() => {
                    setSelectedStarter(index);
                    setShowEvolutions(false);
                  }}
                  className={`relative cursor-pointer rounded-3xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  } ${selectedStarter === index ? 'ring-4 ring-pokemon-blue scale-105' : ''} 
                  transition-all duration-300`}
                >
                  {/* Type gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${
                    getTypeGradient(region.starterTypes[index])
                  } opacity-10`} />

                  {/* Pokemon Image */}
                  <div className="relative h-64 p-8">
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                      alt={region.starters[index]}
                      layout="fill"
                      objectFit="contain"
                      className="hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div className="relative p-6">
                    <h3 className="text-2xl font-bold mb-2">{region.starters[index]}</h3>
                    <div className="flex gap-2 mb-4">
                      {region.starterTypes[index].map(type => (
                        <TypeBadge key={type} type={type} size="md" />
                      ))}
                    </div>
                    
                    {/* Pokedex Number */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        #{String(id).padStart(3, '0')}
                      </span>
                      {selectedStarter === index && (
                        <span className="text-sm font-semibold text-pokemon-blue">
                          Selected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {selectedStarter === index && (
                    <div className="absolute top-4 right-4 w-8 h-8 bg-pokemon-blue rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </CardHover>
            </SlideUp>
          ))}
        </div>

        {/* Evolution Line Button */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowEvolutions(!showEvolutions)}
            className={`px-6 py-3 rounded-full bg-gradient-to-r ${region.color} 
            text-white font-semibold hover:scale-105 transition-transform`}
          >
            {showEvolutions ? 'Hide' : 'Show'} Evolution Line
          </button>
        </div>

        {/* Evolution Display */}
        {showEvolutions && (
          <SlideUp>
            <div className={`rounded-3xl overflow-hidden ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            } p-8`}>
              <h3 className="text-2xl font-bold mb-6 text-center">
                {region.starters[selectedStarter]} Evolution Line
              </h3>
              
              <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap md:flex-nowrap">
                {currentEvolutionLine.map((evoId, index) => (
                  <React.Fragment key={evoId}>
                    <Scale delay={index * 0.2}>
                      <Link href={`/pokedex/${evoId}`}>
                        <a className="group">
                          <div className={`relative rounded-2xl overflow-hidden ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-white'
                          } p-4 hover:shadow-xl transition-all duration-300`}>
                            <div className="relative w-32 h-32 md:w-40 md:h-40">
                              <Image
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evoId}.png`}
                                alt={evolutionNames[evoId] || `Pokemon #${evoId}`}
                                layout="fill"
                                objectFit="contain"
                                className="group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <p className="text-center mt-2 font-semibold">
                              {evolutionNames[evoId] || `Stage ${index + 1}`}
                            </p>
                            <p className="text-center text-sm text-gray-500">
                              #{String(evoId).padStart(3, '0')}
                            </p>
                          </div>
                        </a>
                      </Link>
                    </Scale>
                    
                    {index < currentEvolutionLine.length - 1 && (
                      <BsArrowRight className="text-3xl text-gray-400 hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </SlideUp>
        )}

        {/* Additional Info */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <FadeIn>
            <div className={`p-6 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            } flex items-center gap-4`}>
              <BsController className="text-4xl text-pokemon-blue" />
              <div>
                <h4 className="font-bold mb-1">Available in Games</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {region.games.join(', ')}
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className={`p-6 rounded-2xl ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            } flex items-center gap-4`}>
              <BsCardList className="text-4xl text-pokemon-red" />
              <div>
                <h4 className="font-bold mb-1">TCG Appearances</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Featured in multiple card sets across generations
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default StarterShowcase;