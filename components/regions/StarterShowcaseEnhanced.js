import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TypeBadge } from '../ui/TypeBadge';
import { FadeIn, SlideUp, CardHover, Scale } from '../ui/animations';
import { BsArrowRight, BsController, BsCardList, BsInfoCircle } from 'react-icons/bs';
import { motion } from 'framer-motion';

const StarterShowcaseEnhanced = ({ region, theme }) => {
  const [selectedStarter, setSelectedStarter] = useState(0);
  const [showEvolutions, setShowEvolutions] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  // Professor data
  const professorData = {
    'kanto': { name: 'Professor Oak', image: '/images/scraped/professors/Kanto_Oak.png' },
    'johto': { name: 'Professor Elm', image: '/images/scraped/professors/HeartGold_SoulSilver_Professor_Elm.png' },
    'hoenn': { name: 'Professor Birch', image: '/images/scraped/professors/Omega_Ruby_Alpha_Sapphire_Professor_Birch.png' },
    'sinnoh': { name: 'Professor Rowan', image: '/images/scraped/professors/Rowan_DP.png' },
    'unova': { name: 'Professor Juniper', image: '/images/scraped/professors/Black_White_Juniper.png' },
    'kalos': { name: 'Professor Sycamore', image: '/images/scraped/professors/XY_Professor_Sycamore.png' },
    'alola': { name: 'Professor Kukui', image: '/images/scraped/professors/Sun_Moon_Professor_Kukui.png',
              secondary: { name: 'Professor Burnet', image: '/images/scraped/professors/Professor_Burnet.png' }},
    'galar': { name: 'Professor Magnolia', image: '/images/scraped/professors/Sword_Shield_Professor_Magnolia.png', 
              secondary: { name: 'Professor Sonia', image: '/images/scraped/professors/Sword_Shield_Sonia.png' }},
    'paldea': { name: 'Professor Sada', image: '/images/scraped/professors/800px-Scarlet_Sada.png',
                secondary: { name: 'Professor Turo', image: '/images/scraped/professors/Violet_Turo.png' }}
  };

  // Evolution data for starters with names
  const starterEvolutions = {
    // Kanto
    1: [{ id: 1, name: 'Bulbasaur', level: 1 }, { id: 2, name: 'Ivysaur', level: 16 }, { id: 3, name: 'Venusaur', level: 32 }],
    4: [{ id: 4, name: 'Charmander', level: 1 }, { id: 5, name: 'Charmeleon', level: 16 }, { id: 6, name: 'Charizard', level: 36 }],
    7: [{ id: 7, name: 'Squirtle', level: 1 }, { id: 8, name: 'Wartortle', level: 16 }, { id: 9, name: 'Blastoise', level: 36 }],
    // Johto
    152: [{ id: 152, name: 'Chikorita', level: 1 }, { id: 153, name: 'Bayleef', level: 16 }, { id: 154, name: 'Meganium', level: 32 }],
    155: [{ id: 155, name: 'Cyndaquil', level: 1 }, { id: 156, name: 'Quilava', level: 14 }, { id: 157, name: 'Typhlosion', level: 36 }],
    158: [{ id: 158, name: 'Totodile', level: 1 }, { id: 159, name: 'Croconaw', level: 18 }, { id: 160, name: 'Feraligatr', level: 30 }],
    // Hoenn
    252: [{ id: 252, name: 'Treecko', level: 1 }, { id: 253, name: 'Grovyle', level: 16 }, { id: 254, name: 'Sceptile', level: 36 }],
    255: [{ id: 255, name: 'Torchic', level: 1 }, { id: 256, name: 'Combusken', level: 16 }, { id: 257, name: 'Blaziken', level: 36 }],
    258: [{ id: 258, name: 'Mudkip', level: 1 }, { id: 259, name: 'Marshtomp', level: 16 }, { id: 260, name: 'Swampert', level: 36 }],
    // Sinnoh
    387: [{ id: 387, name: 'Turtwig', level: 1 }, { id: 388, name: 'Grotle', level: 18 }, { id: 389, name: 'Torterra', level: 32 }],
    390: [{ id: 390, name: 'Chimchar', level: 1 }, { id: 391, name: 'Monferno', level: 14 }, { id: 392, name: 'Infernape', level: 36 }],
    393: [{ id: 393, name: 'Piplup', level: 1 }, { id: 394, name: 'Prinplup', level: 16 }, { id: 395, name: 'Empoleon', level: 36 }],
    // Unova
    495: [{ id: 495, name: 'Snivy', level: 1 }, { id: 496, name: 'Servine', level: 17 }, { id: 497, name: 'Serperior', level: 36 }],
    498: [{ id: 498, name: 'Tepig', level: 1 }, { id: 499, name: 'Pignite', level: 17 }, { id: 500, name: 'Emboar', level: 36 }],
    501: [{ id: 501, name: 'Oshawott', level: 1 }, { id: 502, name: 'Dewott', level: 17 }, { id: 503, name: 'Samurott', level: 36 }],
    // Kalos
    650: [{ id: 650, name: 'Chespin', level: 1 }, { id: 651, name: 'Quilladin', level: 16 }, { id: 652, name: 'Chesnaught', level: 36 }],
    653: [{ id: 653, name: 'Fennekin', level: 1 }, { id: 654, name: 'Braixen', level: 16 }, { id: 655, name: 'Delphox', level: 36 }],
    656: [{ id: 656, name: 'Froakie', level: 1 }, { id: 657, name: 'Frogadier', level: 16 }, { id: 658, name: 'Greninja', level: 36 }],
    // Alola
    722: [{ id: 722, name: 'Rowlet', level: 1 }, { id: 723, name: 'Dartrix', level: 17 }, { id: 724, name: 'Decidueye', level: 34 }],
    725: [{ id: 725, name: 'Litten', level: 1 }, { id: 726, name: 'Torracat', level: 17 }, { id: 727, name: 'Incineroar', level: 34 }],
    728: [{ id: 728, name: 'Popplio', level: 1 }, { id: 729, name: 'Brionne', level: 17 }, { id: 730, name: 'Primarina', level: 34 }],
    // Galar
    810: [{ id: 810, name: 'Grookey', level: 1 }, { id: 811, name: 'Thwackey', level: 16 }, { id: 812, name: 'Rillaboom', level: 35 }],
    813: [{ id: 813, name: 'Scorbunny', level: 1 }, { id: 814, name: 'Raboot', level: 16 }, { id: 815, name: 'Cinderace', level: 35 }],
    816: [{ id: 816, name: 'Sobble', level: 1 }, { id: 817, name: 'Drizzile', level: 16 }, { id: 818, name: 'Inteleon', level: 35 }],
    // Paldea
    906: [{ id: 906, name: 'Sprigatito', level: 1 }, { id: 907, name: 'Floragato', level: 16 }, { id: 908, name: 'Meowscarada', level: 36 }],
    909: [{ id: 909, name: 'Fuecoco', level: 1 }, { id: 910, name: 'Crocalor', level: 16 }, { id: 911, name: 'Skeledirge', level: 36 }],
    912: [{ id: 912, name: 'Quaxly', level: 1 }, { id: 913, name: 'Quaxwell', level: 16 }, { id: 914, name: 'Quaquaval', level: 36 }]
  };

  // Starter stats and descriptions
  const starterInfo = {
    'Bulbasaur': { 
      description: 'A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.',
      stats: { hp: 45, attack: 49, defense: 49, spAtk: 65, spDef: 65, speed: 45 }
    },
    'Charmander': {
      description: 'The flame at the tip of its tail is a measure of its life. If healthy, its tail burns intensely.',
      stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 }
    },
    'Squirtle': {
      description: 'It shelters itself in its shell, then strikes back with spouts of water at every opportunity.',
      stats: { hp: 44, attack: 48, defense: 65, spAtk: 50, spDef: 64, speed: 43 }
    },
    'Chikorita': {
      description: 'It uses the leaf on its head to determine the temperature and humidity.',
      stats: { hp: 45, attack: 49, defense: 65, spAtk: 49, spDef: 65, speed: 45 }
    },
    'Cyndaquil': {
      description: 'It flares flames from its back to protect itself. The flames become vigorous if angered.',
      stats: { hp: 39, attack: 52, defense: 43, spAtk: 60, spDef: 50, speed: 65 }
    },
    'Totodile': {
      description: 'It has a habit of biting anything it sees. Be careful around this playful but strong jaw!',
      stats: { hp: 50, attack: 65, defense: 64, spAtk: 44, spDef: 48, speed: 43 }
    },
    'Treecko': {
      description: 'It quickly scales even vertical walls. It senses humidity with its tail to predict the weather.',
      stats: { hp: 40, attack: 45, defense: 35, spAtk: 65, spDef: 55, speed: 70 }
    },
    'Torchic': {
      description: 'It has a flame sac inside its belly that perpetually burns. It feels warm when hugged.',
      stats: { hp: 45, attack: 60, defense: 40, spAtk: 70, spDef: 50, speed: 45 }
    },
    'Mudkip': {
      description: 'Its large tail fin propels it through water with powerful acceleration.',
      stats: { hp: 50, attack: 70, defense: 50, spAtk: 50, spDef: 50, speed: 40 }
    }
  };

  const getTypeGradient = (types) => {
    const type = types[0];
    const gradients = {
      grass: 'from-green-400 to-green-600',
      fire: 'from-red-400 to-orange-600',
      water: 'from-blue-400 to-blue-600',
      flying: 'from-blue-300 to-indigo-400',
      poison: 'from-purple-400 to-purple-600',
    };
    return gradients[type] || 'from-gray-400 to-gray-600';
  };

  const handleCardFlip = (index) => {
    setFlippedCards(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Get evolution types based on Pokemon ID
  const getEvolutionTypes = (pokemonId, baseTypes) => {
    // Type data for evolutions
    const evolutionTypeData = {
      // Kanto
      3: ['grass', 'poison'], 6: ['fire', 'flying'], 9: ['water'],
      // Johto
      154: ['grass'], 157: ['fire'], 160: ['water'],
      // Hoenn
      254: ['grass'], 257: ['fire', 'fighting'], 260: ['water', 'ground'],
      // Sinnoh
      389: ['grass', 'ground'], 392: ['fire', 'fighting'], 395: ['water', 'steel'],
      // Unova
      497: ['grass'], 500: ['fire', 'fighting'], 503: ['water'],
      // Kalos
      652: ['grass', 'fighting'], 655: ['fire', 'psychic'], 658: ['water', 'dark'],
      // Alola
      724: ['grass', 'ghost'], 727: ['fire', 'dark'], 730: ['water', 'fairy'],
      // Galar
      812: ['grass'], 815: ['fire'], 818: ['water'],
      // Paldea
      908: ['grass', 'dark'], 911: ['fire', 'ghost'], 914: ['water', 'fighting']
    };
    
    return evolutionTypeData[pokemonId] || baseTypes;
  };

  const currentEvolutionLine = starterEvolutions[region.starterIds[selectedStarter]] || [];
  const professor = professorData[region.id];

  return (
    <div className={`py-20 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} relative overflow-hidden`}>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">
              Choose Your Partner
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
              {professor?.name} will give you one of these starter Pokémon
            </p>
          </div>
        </FadeIn>

        {/* Starter Selection with Professor */}
        <div className="flex items-start gap-24">
          {/* Secondary Professor on the left (for regions with two professors) */}
          {professor && professor.secondary && (
            <div className="hidden xl:block w-72 h-[600px] flex-shrink-0 -ml-20">
              <div className="relative w-full h-full">
                <Image
                  src={professor.secondary.image}
                  alt={professor.secondary.name}
                  layout="fill"
                  objectFit="contain"
                  className="drop-shadow-2xl"
                />
              </div>
            </div>
          )}
          
          {/* Starter Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 flex-1">
            {region.starterIds.map((id, index) => (
            <SlideUp key={id} delay={index * 0.1}>
              <div className="relative h-96 preserve-3d">
                <motion.div
                  className="relative w-full h-full preserve-3d"
                  animate={{ rotateY: flippedCards[index] ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Front of card */}
                  <div className={`absolute inset-0 backface-hidden rounded-2xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'
                  } ${selectedStarter === index ? 'ring-4 ring-blue-500 shadow-2xl' : 'shadow-lg'}`}>
                    {/* Type gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      getTypeGradient(region.starterTypes[index])
                    } opacity-5`} />

                    {/* Pokemon Image */}
                    <div 
                      className="relative h-64 p-8 cursor-pointer"
                      onClick={() => setSelectedStarter(index)}
                    >
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
                      <div className="text-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          #{String(id).padStart(3, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Flip indicator */}
                    <div className="absolute top-4 right-4">
                      <BsInfoCircle className="text-2xl text-gray-400" />
                    </div>
                  </div>

                  {/* Back of card */}
                  <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl overflow-hidden ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                  } p-6`}>
                    <h3 className="text-xl font-bold mb-4">{region.starters[index]} Stats</h3>
                    
                    {/* Stats */}
                    {starterInfo[region.starters[index]] && (
                      <>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {starterInfo[region.starters[index]].description}
                        </p>
                        
                        <div className="space-y-2">
                          {Object.entries(starterInfo[region.starters[index]].stats).map(([stat, value]) => (
                            <div key={stat} className="flex items-center">
                              <span className="text-sm font-medium w-16">{stat.toUpperCase()}</span>
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-2">
                                <div 
                                  className={`h-2 rounded-full bg-gradient-to-r ${region.color}`}
                                  style={{ width: `${(value / 100) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm ml-2 w-10 text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Flip back indicator */}
                    <button className="mt-6 text-sm text-pokemon-blue hover:underline">
                      Flip to front →
                    </button>
                  </div>
                </motion.div>
              </div>
            </SlideUp>
          ))}
          </div>
          
          {/* Professor on the right */}
          {professor && (
            <div className="hidden xl:block w-72 h-[600px] flex-shrink-0 -mr-20">
              <div className="relative w-full h-full">
                <Image
                  src={professor.image}
                  alt={professor.name}
                  layout="fill"
                  objectFit="contain"
                  className="drop-shadow-2xl"
                />
              </div>
            </div>
          )}
        </div>

        {/* Evolution Line Section */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowEvolutions(!showEvolutions)}
            className={`px-8 py-4 rounded-full bg-gradient-to-r ${region.color} 
            text-white font-semibold hover:scale-105 transition-transform text-lg`}
          >
            {showEvolutions ? 'Hide' : 'Show'} {region.starters[selectedStarter]} Evolution Line
          </button>
        </div>

        {/* Enhanced Evolution Display */}
        {showEvolutions && currentEvolutionLine.length > 0 && (
          <SlideUp>
            <div className={`relative rounded-3xl overflow-hidden ${
              theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
            } p-12 shadow-2xl`}>
              {/* Background decoration */}
              <div className={`absolute inset-0 bg-gradient-to-br ${region.color} opacity-10`} />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-20 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-green-500 to-cyan-500 rounded-full opacity-20 blur-3xl" />
              
              <div className="relative z-10">
                <h3 className="text-4xl font-black mb-12 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {region.starters[selectedStarter]} Evolution Journey
                </h3>
                
                <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap md:flex-nowrap">
                  {currentEvolutionLine.map((evo, index) => {
                    // Get types for this evolution stage
                    const evolutionTypes = getEvolutionTypes(evo.id, region.starterTypes[selectedStarter]);
                    
                    return (
                      <React.Fragment key={evo.id}>
                        <Scale delay={index * 0.2}>
                          <div 
                            className={`relative rounded-3xl overflow-hidden ${
                              theme === 'dark' ? 'bg-gray-800/90' : 'bg-white/90'
                            } backdrop-blur-sm p-8 transition-all duration-300`}
                          >
                            <Link href={`/pokedex/${evo.id}`} className="group block">
                              <motion.div 
                                className="relative w-48 h-48 md:w-56 md:h-56 mx-auto cursor-pointer"
                                whileHover={{ y: -10, scale: 1.1 }}
                              >
                                <Image
                                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`}
                                  alt={evo.name}
                                  layout="fill"
                                  objectFit="contain"
                                  className="drop-shadow-2xl"
                                />
                              </motion.div>
                            </Link>
                              
                              <div className="text-center mt-6">
                                <p className="text-2xl font-bold mb-2">{evo.name}</p>
                                <p className="text-base text-gray-500 dark:text-gray-400 mb-3">#{String(evo.id).padStart(3, '0')}</p>
                                
                                {/* Type badges */}
                                <div className="flex gap-2 justify-center mb-3">
                                  {evolutionTypes.map(type => (
                                    <TypeBadge key={type} type={type} size="lg" />
                                  ))}
                                </div>
                                
                                {/* Evolution level */}
                                {evo.level > 1 && (
                                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-sm shadow-lg">
                                    <span>Level {evo.level}</span>
                                  </div>
                                )}
                              </div>
                          </div>
                        </Scale>
                    
                        {index < currentEvolutionLine.length - 1 && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5 + index * 0.2 }}
                            className="hidden md:block"
                          >
                            <BsArrowRight className="text-5xl text-gray-400" />
                          </motion.div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
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

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default StarterShowcaseEnhanced;