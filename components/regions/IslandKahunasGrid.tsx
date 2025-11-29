import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BsStar,
  BsShieldFill,
  BsGeoAltFill,
  BsLightningFill,
  BsHexagonFill
} from 'react-icons/bs';
import { FaCrown } from 'react-icons/fa';
import {
  GiCrystalShine,
  GiStoneSphere,
  GiPalmTree,
  GiWaveStrike
} from 'react-icons/gi';
import {
  createGlassStyle,
  TYPE_GRADIENTS
} from '../ui/design-system/glass-constants';

interface IslandKahuna {
  name: string;
  island: string;
  islandColor: string;
  type: string;
  zCrystal: string;
  totemPokemon: string;
  totemPokemonId: number;
  signature: string;
  image?: string;
}

interface IslandKahunasGridProps {
  theme: 'light' | 'dark';
}

const IslandKahunasGrid: React.FC<IslandKahunasGridProps> = ({ theme }) => {
  const [selectedKahuna, setSelectedKahuna] = useState<number | null>(null);
  const [hoveredKahuna, setHoveredKahuna] = useState<number | null>(null);

  // Alola Island Kahunas data
  const kahunas: IslandKahuna[] = [
    {
      name: "Hala",
      island: "Melemele Island",
      islandColor: "from-yellow-400 to-amber-600",
      type: "Fighting",
      zCrystal: "Fightinium Z",
      totemPokemon: "Gumshoos/Raticate",
      totemPokemonId: 735,
      signature: "Crabrawler",
      image: "/images/scraped/trainers/hala.png"
    },
    {
      name: "Olivia",
      island: "Akala Island",
      islandColor: "from-pink-400 to-rose-600",
      type: "Rock",
      zCrystal: "Rockium Z",
      totemPokemon: "Salazzle/Marowak",
      totemPokemonId: 758,
      signature: "Lycanroc",
      image: "/images/scraped/trainers/olivia.png"
    },
    {
      name: "Nanu",
      island: "Ula'ula Island",
      islandColor: "from-red-500 to-stone-900",
      type: "Dark",
      zCrystal: "Darkinium Z",
      totemPokemon: "Mimikyu",
      totemPokemonId: 778,
      signature: "Persian",
      image: "/images/scraped/trainers/nanu.png"
    },
    {
      name: "Hapu",
      island: "Poni Island",
      islandColor: "from-amber-500 to-pink-600",
      type: "Ground",
      zCrystal: "Groundium Z",
      totemPokemon: "Kommo-o",
      totemPokemonId: 784,
      signature: "Mudsdale",
      image: "/images/scraped/trainers/hapu.png"
    }
  ];

  const getIslandIcon = (island: string) => {
    if (island.includes("Melemele")) return <GiPalmTree className="text-2xl" />;
    if (island.includes("Akala")) return <GiCrystalShine className="text-2xl" />;
    if (island.includes("Ula'ula")) return <GiStoneSphere className="text-2xl" />;
    if (island.includes("Poni")) return <GiWaveStrike className="text-2xl" />;
    return <BsGeoAltFill className="text-2xl" />;
  };

  const getTypeGradient = (type: string) => {
    const lowerType = type.toLowerCase();
    return TYPE_GRADIENTS[lowerType as keyof typeof TYPE_GRADIENTS] || 'from-stone-400 to-stone-600';
  };

  return (
    <div className="relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-pink-500 to-amber-500" />
      </div>

      <div className={createGlassStyle({ 
        blur: 'xl', 
        opacity: 'strong', 
        gradient: true, 
        rounded: 'xl',
        shadow: 'xl'
      })} style={{ padding: '2rem' }}>
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaCrown className="text-3xl text-yellow-500 animate-pulse" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              Island Kahunas
            </h2>
            <FaCrown className="text-3xl text-amber-500 animate-pulse" />
          </div>
          <p className="text-xl text-stone-600 dark:text-stone-400">
            The strongest trainers of each Alolan island, guardians of the Z-Crystals
          </p>
        </div>

        {/* Kahunas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kahunas.map((kahuna, index) => (
            <motion.div
              key={kahuna.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredKahuna(index)}
              onMouseLeave={() => setHoveredKahuna(null)}
              onClick={() => setSelectedKahuna(selectedKahuna === index ? null : index)}
              className="relative cursor-pointer"
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="h-full"
              >
                {/* Kahuna Card */}
                <div className="relative h-full rounded-3xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/90 via-amber-50/70 to-white/80 dark:from-stone-800/90 dark:via-amber-900/30 dark:to-stone-900/80 shadow-2xl border border-white/30 dark:border-stone-700/30">
                  {/* Island Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${kahuna.islandColor} opacity-20`} />
                  
                  {/* Kahuna Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className={`px-3 py-2 rounded-xl backdrop-blur-md bg-gradient-to-r ${kahuna.islandColor} text-white text-xs font-bold shadow-lg flex items-center gap-2`}>
                      <FaCrown className="text-yellow-300" />
                      <span>KAHUNA</span>
                    </div>
                  </div>

                  {/* Island Icon */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${kahuna.islandColor} flex items-center justify-center text-white shadow-lg`}>
                      {getIslandIcon(kahuna.island)}
                    </div>
                  </div>

                  {/* Trainer Image Section */}
                  <div className="relative h-48 bg-gradient-to-b from-transparent to-black/20">
                    {/* Hexagon Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="grid grid-cols-6 gap-1">
                        {Array.from({ length: 24 }).map((_, i) => (
                          <BsHexagonFill key={i} className="text-white/20" />
                        ))}
                      </div>
                    </div>
                    
                    {/* Trainer Silhouette/Image */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-40">
                      <div className={`w-full h-full bg-gradient-to-t ${kahuna.islandColor} rounded-t-full opacity-50`} />
                      {/* Add actual trainer image here if available */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-6xl text-white/80">
                          <BsShieldFill />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="relative p-6 bg-gradient-to-t from-white/90 to-white/70 dark:from-stone-900/90 dark:to-stone-900/70">
                    <h3 className="text-2xl font-bold text-center text-stone-800 dark:text-white mb-2">
                      {kahuna.name}
                    </h3>
                    
                    {/* Island Name */}
                    <div className="text-center mb-3">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${kahuna.islandColor} text-white shadow-md `}>
                        {getIslandIcon(kahuna.island)}
                        {kahuna.island}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div className="flex justify-center mb-4">
                      <span className={`px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${getTypeGradient(kahuna.type)} text-white shadow-lg`}>
                        {kahuna.type} Type Master
                      </span>
                    </div>

                    {/* Z-Crystal */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <GiCrystalShine className="text-amber-500 text-lg" />
                      <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                        {kahuna.zCrystal}
                      </span>
                    </div>

                    {/* Totem Pokemon */}
                    <div className="relative">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-100/50 to-pink-100/50 dark:from-amber-900/30 dark:to-pink-900/30">
                        <div>
                          <div className="text-xs text-stone-600 dark:text-stone-400">Totem Pokemon</div>
                          <div className="text-sm font-bold text-stone-800 dark:text-white">{kahuna.totemPokemon.split('/')[0]}</div>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-pink-400 p-1">
                          <Image
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${kahuna.totemPokemonId}.png`}
                            alt={kahuna.totemPokemon}
                            width={40}
                            height={40}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect - Additional Info */}
                    <AnimatePresence>
                      {hoveredKahuna === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3 pt-3 border-t border-stone-200/30 dark:border-stone-700/30"
                        >
                          <div className="text-center">
                            <span className="text-xs text-stone-600 dark:text-stone-400">Signature Pokemon</span>
                            <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                              {kahuna.signature}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-1/2 left-0 w-2 h-16 bg-gradient-to-b from-transparent via-yellow-400 to-transparent opacity-50 blur-sm" />
                  <div className="absolute top-1/2 right-0 w-2 h-16 bg-gradient-to-b from-transparent via-amber-400 to-transparent opacity-50 blur-sm" />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Island Trials Info */}
        <motion.div
          className="mt-8 p-6 rounded-xl backdrop-blur-md bg-gradient-to-r from-yellow-100/50 via-pink-100/50 to-amber-100/50 dark:from-yellow-900/20 dark:via-pink-900/20 dark:to-amber-900/20 border border-yellow-200/30 dark:border-yellow-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <BsLightningFill className="text-2xl text-yellow-500" />
            <h3 className="text-lg font-bold text-stone-800 dark:text-white">About Island Trials</h3>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-4">
            In the Alola region, instead of traditional Gyms, trainers undertake Island Trials. 
            Each trial is overseen by a Trial Captain and culminates in a battle against a powerful Totem Pokémon. 
            After completing all trials on an island, trainers face the Island Kahuna in a Grand Trial to earn a Z-Crystal.
          </p>
          
          {/* Z-Move Indicator */}
          <div className="flex items-center justify-center gap-4 p-3 rounded-xl bg-white/50 dark:bg-stone-800/50">
            <div className="flex items-center gap-2">
              <GiCrystalShine className="text-amber-500 text-xl animate-pulse" />
              <span className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                Z-Moves Unlocked
              </span>
            </div>
            <div className="h-4 w-px bg-stone-300 dark:bg-stone-600" />
            <div className="flex gap-2">
              {['Fighting', 'Rock', 'Dark', 'Ground'].map((type) => (
                <span 
                  key={type}
                  className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getTypeGradient(type)} text-white`}
                >
                  {type}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IslandKahunasGrid;