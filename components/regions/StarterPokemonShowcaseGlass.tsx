import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { TypeBadge } from '../ui/TypeBadge';
import { 
  BsArrowRight,
  BsStars,
  BsGenderMale,
  BsGenderFemale,
  BsRulers,
  BsSpeedometer,
  BsTrophy,
  BsLightning,
  BsShield,
  BsHeart,
  BsChevronRight
} from 'react-icons/bs';
import { GiWeight, GiMuscleUp } from 'react-icons/gi';

interface StarterPokemonShowcaseProps {
  region: string;
  starters: string[];
  theme: string;
}

// Get starter ID from name
const getStarterId = (name: string): number => {
  const starterIds: Record<string, number> = {
    'Bulbasaur': 1, 'Charmander': 4, 'Squirtle': 7,
    'Chikorita': 152, 'Cyndaquil': 155, 'Totodile': 158,
    'Treecko': 252, 'Torchic': 255, 'Mudkip': 258,
    'Turtwig': 387, 'Chimchar': 390, 'Piplup': 393,
    'Snivy': 495, 'Tepig': 498, 'Oshawott': 501,
    'Chespin': 650, 'Fennekin': 653, 'Froakie': 656,
    'Rowlet': 722, 'Litten': 725, 'Popplio': 728,
    'Grookey': 810, 'Scorbunny': 813, 'Sobble': 816,
    'Sprigatito': 906, 'Fuecoco': 909, 'Quaxly': 912
  };
  return starterIds[name] || 1;
};

// Get evolution data
const getEvolutionData = (starter: string) => {
  const evolutions: Record<string, Array<{ name: string; id: number; level: number }>> = {
    'Bulbasaur': [
      { name: 'Bulbasaur', id: 1, level: 1 },
      { name: 'Ivysaur', id: 2, level: 16 },
      { name: 'Venusaur', id: 3, level: 32 }
    ],
    'Charmander': [
      { name: 'Charmander', id: 4, level: 1 },
      { name: 'Charmeleon', id: 5, level: 16 },
      { name: 'Charizard', id: 6, level: 36 }
    ],
    'Squirtle': [
      { name: 'Squirtle', id: 7, level: 1 },
      { name: 'Wartortle', id: 8, level: 16 },
      { name: 'Blastoise', id: 9, level: 36 }
    ],
    'Chikorita': [
      { name: 'Chikorita', id: 152, level: 1 },
      { name: 'Bayleef', id: 153, level: 16 },
      { name: 'Meganium', id: 154, level: 32 }
    ],
    'Cyndaquil': [
      { name: 'Cyndaquil', id: 155, level: 1 },
      { name: 'Quilava', id: 156, level: 14 },
      { name: 'Typhlosion', id: 157, level: 36 }
    ],
    'Totodile': [
      { name: 'Totodile', id: 158, level: 1 },
      { name: 'Croconaw', id: 159, level: 18 },
      { name: 'Feraligatr', id: 160, level: 30 }
    ]
  };
  return evolutions[starter] || [];
};

// Get type colors
const getTypeGradient = (starter: string): string => {
  const typeGradients: Record<string, string> = {
    'Bulbasaur': 'from-green-400 to-emerald-500',
    'Charmander': 'from-red-400 to-orange-500',
    'Squirtle': 'from-amber-400 to-cyan-500',
    'Chikorita': 'from-green-400 to-lime-500',
    'Cyndaquil': 'from-orange-400 to-red-500',
    'Totodile': 'from-amber-400 to-amber-500',
    'Treecko': 'from-green-400 to-emerald-500',
    'Torchic': 'from-red-400 to-orange-500',
    'Mudkip': 'from-amber-400 to-cyan-500',
    'Turtwig': 'from-green-400 to-lime-500',
    'Chimchar': 'from-orange-400 to-red-500',
    'Piplup': 'from-amber-400 to-sky-500',
    'Snivy': 'from-green-400 to-emerald-500',
    'Tepig': 'from-red-400 to-orange-500',
    'Oshawott': 'from-amber-400 to-cyan-500',
    'Chespin': 'from-green-400 to-lime-500',
    'Fennekin': 'from-red-400 to-yellow-500',
    'Froakie': 'from-amber-400 to-amber-500',
    'Rowlet': 'from-green-400 to-teal-500',
    'Litten': 'from-red-400 to-stone-600',
    'Popplio': 'from-amber-400 to-pink-400',
    'Grookey': 'from-green-400 to-lime-500',
    'Scorbunny': 'from-orange-400 to-red-500',
    'Sobble': 'from-amber-400 to-cyan-500',
    'Sprigatito': 'from-green-400 to-lime-500',
    'Fuecoco': 'from-red-400 to-orange-500',
    'Quaxly': 'from-amber-400 to-cyan-500'
  };
  return typeGradients[starter] || 'from-stone-400 to-stone-500';
};

const StarterPokemonShowcaseGlass: React.FC<StarterPokemonShowcaseProps> = ({ region, starters, theme }) => {
  const [selectedStarter, setSelectedStarter] = useState<number>(0);
  const [showEvolution, setShowEvolution] = useState<boolean>(false);
  const router = useRouter();

  return (
    <div className="relative py-16 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 dark:from-stone-900 dark:via-amber-900/20 dark:to-stone-900" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header with glass effect */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-block backdrop-blur-xl bg-white/70 dark:bg-stone-800/70 rounded-3xl px-8 py-6 shadow-2xl border border-white/30 dark:border-stone-700/30">
            <h2 className="text-4xl font-black mb-2 bg-gradient-to-r from-stone-800 to-stone-600 dark:from-white dark:to-stone-300 bg-clip-text text-transparent">
              Choose Your Partner
            </h2>
            <p className="text-lg text-stone-600 dark:text-stone-400">
              Begin your {region} journey with one of these amazing Pokémon
            </p>
          </div>
        </motion.div>

        {/* Starter Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {starters.map((starter, index) => {
            const starterId = getStarterId(starter);
            const gradient = getTypeGradient(starter);
            const evolutions = getEvolutionData(starter);
            const isSelected = selectedStarter === index;

            return (
              <motion.div
                key={starter}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                <div 
                  className={`relative h-full backdrop-blur-xl bg-white/90 dark:bg-stone-800/90 rounded-3xl border-2 shadow-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'border-amber-400/50 shadow-amber-400/20' 
                      : 'border-white/30 dark:border-stone-700/30 hover:border-white/50'
                  }`}
                  onClick={() => setSelectedStarter(index)}
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10`} />
                  
                  {/* Top section with Pokemon */}
                  <div className="relative p-6">
                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center"
                      >
                        <BsStars className="text-white" />
                      </motion.div>
                    )}

                    {/* Pokemon Image with glass orb */}
                    <div className="relative w-48 h-48 mx-auto mb-4">
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${starterId}.png`}
                        alt={starter}
                        fill
                        className="object-contain drop-shadow-2xl relative z-10"
                      />
                    </div>

                    {/* Name and Number */}
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-black text-stone-800 dark:text-white">{starter}</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400">#{String(starterId).padStart(3, '0')}</p>
                    </div>

                    {/* Type badges with glass effect */}
                    <div className="flex justify-center gap-2 mb-4">
                      <span className="px-4 py-2 rounded-full backdrop-blur-md bg-white/50 dark:bg-stone-700/50 border border-white/30 text-sm font-semibold">
                        {index === 0 ? 'Grass' : index === 1 ? 'Fire' : 'Water'}
                      </span>
                    </div>

                    {/* Stats preview */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-stone-700/30 rounded-lg p-2">
                        <BsHeart className="mx-auto text-red-400 mb-1" />
                        <p className="text-xs text-stone-600 dark:text-stone-400">Balanced</p>
                      </div>
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-stone-700/30 rounded-lg p-2">
                        <BsShield className="mx-auto text-amber-400 mb-1" />
                        <p className="text-xs text-stone-600 dark:text-stone-400">Hardy</p>
                      </div>
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-stone-700/30 rounded-lg p-2">
                        <BsLightning className="mx-auto text-yellow-400 mb-1" />
                        <p className="text-xs text-stone-600 dark:text-stone-400">Loyal</p>
                      </div>
                    </div>
                  </div>

                  {/* Evolution Chain Preview */}
                  <div className="relative border-t border-white/20 dark:border-stone-700/20 p-4 bg-gradient-to-b from-transparent to-white/10 dark:to-stone-800/10">
                    <p className="text-xs text-center text-stone-500 dark:text-stone-400 mb-3">Evolution Chain</p>
                    <div className="flex items-center justify-center gap-1">
                      {evolutions.map((evo, i) => (
                        <React.Fragment key={evo.id}>
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-white/30 dark:bg-stone-700/30 backdrop-blur-sm p-1">
                              <img
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                                alt={evo.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>
                          {i < evolutions.length - 1 && (
                            <BsChevronRight className="text-stone-400 text-xs" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Hover effect shimmer */}
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1500" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Starter Details */}
        <AnimatePresence mode="wait">
          {selectedStarter !== null && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mt-8"
            >
              <div className="backdrop-blur-xl bg-white/80 dark:bg-stone-800/80 rounded-3xl border border-white/30 dark:border-stone-700/30 shadow-2xl p-8">
                <h3 className="text-2xl font-bold text-center mb-6 text-stone-800 dark:text-white">
                  {starters[selectedStarter]} - Your Perfect Partner
                </h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Evolution Details */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-stone-700 dark:text-stone-300">Full Evolution Line</h4>
                    <div className="space-y-4">
                      {getEvolutionData(starters[selectedStarter]).map((evo, i) => (
                        <div key={evo.id} className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-2xl bg-white/50 dark:bg-stone-700/50 backdrop-blur-sm p-2">
                            <img
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png`}
                              alt={evo.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-stone-800 dark:text-white">{evo.name}</p>
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                              {i === 0 ? 'Base Form' : `Evolves at Lv.${evo.level}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-stone-700 dark:text-stone-300">Characteristics</h4>
                    <div className="space-y-3">
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-stone-700/30 rounded-xl p-4">
                        <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">Personality</p>
                        <p className="font-semibold">
                          {selectedStarter === 0 ? 'Calm and Reliable' : 
                           selectedStarter === 1 ? 'Brave and Passionate' : 
                           'Playful and Adaptable'}
                        </p>
                      </div>
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-stone-700/30 rounded-xl p-4">
                        <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">Best For</p>
                        <p className="font-semibold">
                          {selectedStarter === 0 ? 'Strategic Trainers' : 
                           selectedStarter === 1 ? 'Offensive Players' : 
                           'Balanced Teams'}
                        </p>
                      </div>
                      <div className="backdrop-blur-sm bg-white/30 dark:bg-stone-700/30 rounded-xl p-4">
                        <p className="text-sm text-stone-600 dark:text-stone-400 mb-1">Famous Trainers</p>
                        <p className="font-semibold">
                          {selectedStarter === 0 ? 'Professor Oak\'s Choice' : 
                           selectedStarter === 1 ? 'Champion\'s Favorite' : 
                           'Elite Four Pick'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push(`/pokedex/${getStarterId(starters[selectedStarter])}`)}
                    className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-400 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    View Full Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StarterPokemonShowcaseGlass;