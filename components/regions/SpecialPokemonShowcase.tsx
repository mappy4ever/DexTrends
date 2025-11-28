import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, SlideUp, CardHover } from "../ui/animations/animations";
import { TypeBadge } from '../ui/TypeBadge';
import { BsArrowRepeat } from 'react-icons/bs';
import { GiCrown } from 'react-icons/gi';

// Types
interface Pokemon {
  name: string;
  id: number;
  types: string[];
  isLegendary?: boolean;
}

interface Legendary extends Pokemon {
  title: string;
  location: string;
  isVariant?: boolean;
}

interface RegionalVariantData {
  title: string;
  description: string;
  variants: Pokemon[];
}

interface LegendaryData {
  title: string;
  description: string;
  legendaries: Legendary[];
}

interface Region {
  id: string;
  name: string;
}

interface SpecialPokemonShowcaseProps {
  region: Region;
  theme: 'light' | 'dark';
}

const SpecialPokemonShowcase: React.FC<SpecialPokemonShowcaseProps> = ({ region, theme }) => {
  const router = useRouter();
  
  // Check if region has variants - safe to use optional chaining here
  const hasVariants = region?.id && ['alola', 'galar', 'paldea', 'hisui'].includes(region.id.toLowerCase());
  
  // Initialize activeTab based on whether region has variants
  const [activeTab, setActiveTab] = useState(hasVariants ? 'variants' : 'legendaries');

  // Safety check for region prop - AFTER hooks
  if (!region || !region.id) {
    return null;
  }

  // Regional variant data
  const regionalVariantsData: { [key: string]: RegionalVariantData } = {
    alola: {
      title: 'Alolan Forms',
      description: 'Pokémon that adapted to Alola\'s tropical island environment',
      variants: [
        { name: 'Rattata', id: 10091, types: ['dark', 'normal'] },
        { name: 'Raticate', id: 10092, types: ['dark', 'normal'] },
        { name: 'Raichu', id: 10100, types: ['electric', 'psychic'] },
        { name: 'Sandshrew', id: 10101, types: ['ice', 'steel'] },
        { name: 'Sandslash', id: 10102, types: ['ice', 'steel'] },
        { name: 'Vulpix', id: 10103, types: ['ice'] },
        { name: 'Ninetales', id: 10104, types: ['ice', 'fairy'] },
        { name: 'Diglett', id: 10105, types: ['ground', 'steel'] },
        { name: 'Dugtrio', id: 10106, types: ['ground', 'steel'] },
        { name: 'Meowth', id: 10107, types: ['dark'] },
        { name: 'Persian', id: 10108, types: ['dark'] },
        { name: 'Geodude', id: 10109, types: ['rock', 'electric'] },
        { name: 'Graveler', id: 10110, types: ['rock', 'electric'] },
        { name: 'Golem', id: 10111, types: ['rock', 'electric'] },
        { name: 'Grimer', id: 10112, types: ['poison', 'dark'] },
        { name: 'Muk', id: 10113, types: ['poison', 'dark'] },
        { name: 'Exeggutor', id: 10114, types: ['grass', 'dragon'] },
        { name: 'Marowak', id: 10115, types: ['fire', 'ghost'] }
      ]
    },
    galar: {
      title: 'Galarian Forms',
      description: 'Pokémon that evolved differently in Galar\'s unique environment',
      variants: [
        { name: 'Meowth', id: 10161, types: ['steel'] },
        { name: 'Ponyta', id: 10162, types: ['psychic'] },
        { name: 'Rapidash', id: 10163, types: ['psychic', 'fairy'] },
        { name: 'Slowpoke', id: 10164, types: ['psychic'] },
        { name: 'Slowbro', id: 10165, types: ['poison', 'psychic'] },
        { name: 'Farfetch\'d', id: 10166, types: ['fighting'] },
        { name: 'Weezing', id: 10167, types: ['poison', 'fairy'] },
        { name: 'Mr. Mime', id: 10168, types: ['ice', 'psychic'] },
        { name: 'Articuno', id: 10169, types: ['psychic', 'flying'], isLegendary: true },
        { name: 'Zapdos', id: 10170, types: ['fighting', 'flying'], isLegendary: true },
        { name: 'Moltres', id: 10171, types: ['dark', 'flying'], isLegendary: true },
        { name: 'Slowking', id: 10172, types: ['poison', 'psychic'] },
        { name: 'Corsola', id: 10173, types: ['ghost'] },
        { name: 'Zigzagoon', id: 10174, types: ['dark', 'normal'] },
        { name: 'Linoone', id: 10175, types: ['dark', 'normal'] },
        { name: 'Darumaka', id: 10176, types: ['ice'] },
        { name: 'Darmanitan', id: 10177, types: ['ice'] },
        { name: 'Yamask', id: 10178, types: ['ground', 'ghost'] },
        { name: 'Stunfisk', id: 10179, types: ['ground', 'steel'] }
      ]
    },
    paldea: {
      title: 'Paldean Forms',
      description: 'Pokémon that adapted to Paldea\'s diverse ecosystems',
      variants: [
        { name: 'Tauros (Combat)', id: 10250, types: ['fighting'] },
        { name: 'Tauros (Blaze)', id: 10251, types: ['fighting', 'fire'] },
        { name: 'Tauros (Aqua)', id: 10252, types: ['fighting', 'water'] },
        { name: 'Wooper', id: 10253, types: ['poison', 'ground'] }
      ]
    }
  };

  // Legendary data
  const legendaryData: { [key: string]: LegendaryData } = {
    kanto: {
      title: 'Legendary Pokémon',
      description: 'The legendary and mythical Pokémon of Kanto',
      legendaries: [
        { name: 'Articuno', id: 144, types: ['ice', 'flying'], title: 'Freeze Pokémon', location: 'Seafoam Islands' },
        { name: 'Zapdos', id: 145, types: ['electric', 'flying'], title: 'Electric Pokémon', location: 'Power Plant' },
        { name: 'Moltres', id: 146, types: ['fire', 'flying'], title: 'Flame Pokémon', location: 'Victory Road' },
        { name: 'Mewtwo', id: 150, types: ['psychic'], title: 'Genetic Pokémon', location: 'Cerulean Cave' },
        { name: 'Mew', id: 151, types: ['psychic'], title: 'New Species Pokémon', location: 'Event Only' }
      ]
    },
    johto: {
      title: 'Legendary Pokémon',
      description: 'The legendary and mythical Pokémon of Johto',
      legendaries: [
        { name: 'Raikou', id: 243, types: ['electric'], title: 'Thunder Pokémon', location: 'Roaming' },
        { name: 'Entei', id: 244, types: ['fire'], title: 'Volcano Pokémon', location: 'Roaming' },
        { name: 'Suicune', id: 245, types: ['water'], title: 'Aurora Pokémon', location: 'Roaming' },
        { name: 'Lugia', id: 249, types: ['psychic', 'flying'], title: 'Diving Pokémon', location: 'Whirl Islands' },
        { name: 'Ho-Oh', id: 250, types: ['fire', 'flying'], title: 'Rainbow Pokémon', location: 'Tin Tower' },
        { name: 'Celebi', id: 251, types: ['psychic', 'grass'], title: 'Time Travel Pokémon', location: 'Event Only' }
      ]
    },
    hoenn: {
      title: 'Legendary Pokémon',
      description: 'The legendary and mythical Pokémon of Hoenn',
      legendaries: [
        { name: 'Regirock', id: 377, types: ['rock'], title: 'Rock Peak Pokémon', location: 'Desert Ruins' },
        { name: 'Regice', id: 378, types: ['ice'], title: 'Iceberg Pokémon', location: 'Island Cave' },
        { name: 'Registeel', id: 379, types: ['steel'], title: 'Iron Pokémon', location: 'Ancient Tomb' },
        { name: 'Latias', id: 380, types: ['dragon', 'psychic'], title: 'Eon Pokémon', location: 'Roaming' },
        { name: 'Latios', id: 381, types: ['dragon', 'psychic'], title: 'Eon Pokémon', location: 'Roaming' },
        { name: 'Kyogre', id: 382, types: ['water'], title: 'Sea Basin Pokémon', location: 'Cave of Origin' },
        { name: 'Groudon', id: 383, types: ['ground'], title: 'Continent Pokémon', location: 'Cave of Origin' },
        { name: 'Rayquaza', id: 384, types: ['dragon', 'flying'], title: 'Sky High Pokémon', location: 'Sky Pillar' },
        { name: 'Jirachi', id: 385, types: ['steel', 'psychic'], title: 'Wish Pokémon', location: 'Event Only' },
        { name: 'Deoxys', id: 386, types: ['psychic'], title: 'DNA Pokémon', location: 'Event Only' }
      ]
    },
    sinnoh: {
      title: 'Legendary Pokémon',
      description: 'The legendary and mythical Pokémon of Sinnoh',
      legendaries: [
        { name: 'Uxie', id: 480, types: ['psychic'], title: 'Knowledge Pokémon', location: 'Lake Acuity' },
        { name: 'Mesprit', id: 481, types: ['psychic'], title: 'Emotion Pokémon', location: 'Lake Verity' },
        { name: 'Azelf', id: 482, types: ['psychic'], title: 'Willpower Pokémon', location: 'Lake Valor' },
        { name: 'Dialga', id: 483, types: ['steel', 'dragon'], title: 'Temporal Pokémon', location: 'Spear Pillar' },
        { name: 'Palkia', id: 484, types: ['water', 'dragon'], title: 'Spatial Pokémon', location: 'Spear Pillar' },
        { name: 'Heatran', id: 485, types: ['fire', 'steel'], title: 'Lava Dome Pokémon', location: 'Stark Mountain' },
        { name: 'Regigigas', id: 486, types: ['normal'], title: 'Colossal Pokémon', location: 'Snowpoint Temple' },
        { name: 'Giratina', id: 487, types: ['ghost', 'dragon'], title: 'Renegade Pokémon', location: 'Distortion World' },
        { name: 'Cresselia', id: 488, types: ['psychic'], title: 'Lunar Pokémon', location: 'Fullmoon Island' },
        { name: 'Darkrai', id: 491, types: ['dark'], title: 'Pitch-Black Pokémon', location: 'Event Only' },
        { name: 'Shaymin', id: 492, types: ['grass'], title: 'Gratitude Pokémon', location: 'Event Only' },
        { name: 'Arceus', id: 493, types: ['normal'], title: 'Alpha Pokémon', location: 'Event Only' }
      ]
    },
    unova: {
      title: 'Legendary Pokémon',
      description: 'The legendary and mythical Pokémon of Unova',
      legendaries: [
        { name: 'Cobalion', id: 638, types: ['steel', 'fighting'], title: 'Iron Will Pokémon', location: 'Mistralton Cave' },
        { name: 'Terrakion', id: 639, types: ['rock', 'fighting'], title: 'Cavern Pokémon', location: 'Victory Road' },
        { name: 'Virizion', id: 640, types: ['grass', 'fighting'], title: 'Grassland Pokémon', location: 'Pinwheel Forest' },
        { name: 'Tornadus', id: 641, types: ['flying'], title: 'Cyclone Pokémon', location: 'Roaming' },
        { name: 'Thundurus', id: 642, types: ['electric', 'flying'], title: 'Bolt Strike Pokémon', location: 'Roaming' },
        { name: 'Reshiram', id: 643, types: ['dragon', 'fire'], title: 'Vast White Pokémon', location: 'N\'s Castle' },
        { name: 'Zekrom', id: 644, types: ['dragon', 'electric'], title: 'Deep Black Pokémon', location: 'N\'s Castle' },
        { name: 'Landorus', id: 645, types: ['ground', 'flying'], title: 'Abundance Pokémon', location: 'Abundant Shrine' },
        { name: 'Kyurem', id: 646, types: ['dragon', 'ice'], title: 'Boundary Pokémon', location: 'Giant Chasm' },
        { name: 'Keldeo', id: 647, types: ['water', 'fighting'], title: 'Colt Pokémon', location: 'Event Only' },
        { name: 'Meloetta', id: 648, types: ['normal', 'psychic'], title: 'Melody Pokémon', location: 'Event Only' },
        { name: 'Genesect', id: 649, types: ['bug', 'steel'], title: 'Paleozoic Pokémon', location: 'Event Only' }
      ]
    },
    kalos: {
      title: 'Legendary Pokémon',
      description: 'The legendary and mythical Pokémon of Kalos',
      legendaries: [
        { name: 'Xerneas', id: 716, types: ['fairy'], title: 'Life Pokémon', location: 'Team Flare Secret HQ' },
        { name: 'Yveltal', id: 717, types: ['dark', 'flying'], title: 'Destruction Pokémon', location: 'Team Flare Secret HQ' },
        { name: 'Zygarde', id: 718, types: ['dragon', 'ground'], title: 'Order Pokémon', location: 'Terminus Cave' },
        { name: 'Diancie', id: 719, types: ['rock', 'fairy'], title: 'Jewel Pokémon', location: 'Event Only' },
        { name: 'Hoopa', id: 720, types: ['psychic', 'ghost'], title: 'Mischief Pokémon', location: 'Event Only' },
        { name: 'Volcanion', id: 721, types: ['fire', 'water'], title: 'Steam Pokémon', location: 'Event Only' }
      ]
    },
    alola: {
      title: 'Legendary Pokémon',
      description: 'The legendary and mythical Pokémon of Alola',
      legendaries: [
        { name: 'Type: Null', id: 772, types: ['normal'], title: 'Synthetic Pokémon', location: 'Aether Paradise' },
        { name: 'Silvally', id: 773, types: ['normal'], title: 'Synthetic Pokémon', location: 'Evolve Type: Null' },
        { name: 'Tapu Koko', id: 785, types: ['electric', 'fairy'], title: 'Land Spirit Pokémon', location: 'Ruins of Conflict' },
        { name: 'Tapu Lele', id: 786, types: ['psychic', 'fairy'], title: 'Land Spirit Pokémon', location: 'Ruins of Life' },
        { name: 'Tapu Bulu', id: 787, types: ['grass', 'fairy'], title: 'Land Spirit Pokémon', location: 'Ruins of Abundance' },
        { name: 'Tapu Fini', id: 788, types: ['water', 'fairy'], title: 'Land Spirit Pokémon', location: 'Ruins of Hope' },
        { name: 'Cosmog', id: 789, types: ['psychic'], title: 'Nebula Pokémon', location: 'Lake of the Sunne/Moone' },
        { name: 'Cosmoem', id: 790, types: ['psychic'], title: 'Protostar Pokémon', location: 'Evolve Cosmog' },
        { name: 'Solgaleo', id: 791, types: ['psychic', 'steel'], title: 'Sunne Pokémon', location: 'Altar of the Sunne' },
        { name: 'Lunala', id: 792, types: ['psychic', 'ghost'], title: 'Moone Pokémon', location: 'Altar of the Moone' },
        { name: 'Necrozma', id: 800, types: ['psychic'], title: 'Prism Pokémon', location: 'Ten Carat Hill' },
        { name: 'Magearna', id: 801, types: ['steel', 'fairy'], title: 'Artificial Pokémon', location: 'Event Only' },
        { name: 'Marshadow', id: 802, types: ['fighting', 'ghost'], title: 'Gloomdweller Pokémon', location: 'Event Only' },
        { name: 'Zeraora', id: 807, types: ['electric'], title: 'Thunderclap Pokémon', location: 'Event Only' }
      ]
    },
    galar: {
      title: 'Legendary Pokémon',
      description: 'The legendary and mythical Pokémon of Galar',
      legendaries: [
        { name: 'Articuno (Galarian)', id: 10169, types: ['psychic', 'flying'], title: 'Cruel Pokémon', location: 'Crown Tundra', isVariant: true },
        { name: 'Zapdos (Galarian)', id: 10170, types: ['fighting', 'flying'], title: 'Strong Legs Pokémon', location: 'Wild Area', isVariant: true },
        { name: 'Moltres (Galarian)', id: 10171, types: ['dark', 'flying'], title: 'Malevolent Pokémon', location: 'Isle of Armor', isVariant: true },
        { name: 'Zacian', id: 888, types: ['fairy'], title: 'Warrior Pokémon', location: 'Energy Plant' },
        { name: 'Zamazenta', id: 889, types: ['fighting'], title: 'Warrior Pokémon', location: 'Energy Plant' },
        { name: 'Eternatus', id: 890, types: ['poison', 'dragon'], title: 'Gigantic Pokémon', location: 'Energy Plant Core' },
        { name: 'Kubfu', id: 891, types: ['fighting'], title: 'Wushu Pokémon', location: 'Master Dojo' },
        { name: 'Urshifu', id: 892, types: ['fighting', 'dark'], title: 'Wushu Pokémon', location: 'Evolve Kubfu' },
        { name: 'Zarude', id: 893, types: ['dark', 'grass'], title: 'Rogue Monkey Pokémon', location: 'Event Only' },
        { name: 'Regieleki', id: 894, types: ['electric'], title: 'Electron Pokémon', location: 'Split-Decision Ruins' },
        { name: 'Regidrago', id: 895, types: ['dragon'], title: 'Dragon Orb Pokémon', location: 'Split-Decision Ruins' },
        { name: 'Glastrier', id: 896, types: ['ice'], title: 'Wild Horse Pokémon', location: 'Crown Tundra' },
        { name: 'Spectrier', id: 897, types: ['ghost'], title: 'Swift Horse Pokémon', location: 'Crown Tundra' },
        { name: 'Calyrex', id: 898, types: ['psychic', 'grass'], title: 'King Pokémon', location: 'Crown Shrine' }
      ]
    },
    paldea: {
      title: 'Legendary Pokémon',
      description: 'The legendary and mythical Pokémon of Paldea',
      legendaries: [
        { name: 'Wo-Chien', id: 1001, types: ['dark', 'grass'], title: 'Ruinous Pokémon', location: 'Grasswither Shrine' },
        { name: 'Chien-Pao', id: 1002, types: ['dark', 'ice'], title: 'Ruinous Pokémon', location: 'Icerend Shrine' },
        { name: 'Ting-Lu', id: 1003, types: ['dark', 'ground'], title: 'Ruinous Pokémon', location: 'Groundblight Shrine' },
        { name: 'Chi-Yu', id: 1004, types: ['dark', 'fire'], title: 'Ruinous Pokémon', location: 'Firescourge Shrine' },
        { name: 'Koraidon', id: 1007, types: ['fighting', 'dragon'], title: 'Winged King Pokémon', location: 'Poco Path Lighthouse' },
        { name: 'Miraidon', id: 1008, types: ['electric', 'dragon'], title: 'Iron Serpent Pokémon', location: 'Poco Path Lighthouse' }
      ]
    }
  };

  const regionVariants = regionalVariantsData[region.id.toLowerCase()];
  const regionLegendaries = legendaryData[region.id.toLowerCase()];

  // Navigate to Pokédex page
  const handlePokemonClick = (pokemonId: number) => {
    router.push(`/pokedex/${pokemonId}`);
  };

  // Get the active data
  const activeData = activeTab === 'variants' ? regionVariants : regionLegendaries;
  const pokemonList = activeTab === 'variants' 
    ? (activeData as RegionalVariantData | undefined)?.variants 
    : (activeData as LegendaryData | undefined)?.legendaries;

  // Return null if no data available
  if (!activeData || !pokemonList || pokemonList.length === 0) {
    return null;
  }

  return (
    <div className={`py-16 ${theme === 'dark' ? 'bg-stone-900' : 'bg-stone-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Special Pokémon</h2>
            <p className="text-xl text-stone-600 dark:text-stone-400">
              Unique and legendary Pokémon of {region.name}
            </p>
          </div>
        </FadeIn>

        {/* Tabs */}
        {hasVariants && regionVariants && regionLegendaries && (
          <div className="flex justify-center mb-12">
            <div className={`flex rounded-full p-1 ${theme === 'dark' ? 'bg-stone-800' : 'bg-stone-200'}`}>
              <button
                onClick={() => setActiveTab('variants')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'variants'
                    ? `${theme === 'dark' ? 'bg-amber-600 text-white' : 'bg-white text-amber-600'} shadow-lg`
                    : `${theme === 'dark' ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`
                }`}
              >
                <BsArrowRepeat />
                Regional Variants
              </button>
              <button
                onClick={() => setActiveTab('legendaries')}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'legendaries'
                    ? `${theme === 'dark' ? 'bg-amber-600 text-white' : 'bg-white text-amber-600'} shadow-lg`
                    : `${theme === 'dark' ? 'text-stone-300 hover:text-white' : 'text-stone-600 hover:text-stone-900'}`
                }`}
              >
                <GiCrown />
                Legendary Pokémon
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Section Title */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 flex items-center justify-center gap-3">
                {activeTab === 'variants' ? <BsArrowRepeat className="text-amber-500" /> : <GiCrown className="text-yellow-500" />}
                {activeData?.title}
              </h3>
              <p className="text-stone-600 dark:text-stone-400">
                {activeData?.description}
              </p>
            </div>

            {/* Pokemon Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {pokemonList?.map((pokemon, index) => {
                // Validate pokemon object
                if (!pokemon || !pokemon.id || !pokemon.name || !pokemon.types) {
                  return null;
                }
                
                return (
                  <SlideUp key={pokemon.id} delay={index * 0.05}>
                    <CardHover>
                    <motion.div
                      className={`relative rounded-xl overflow-hidden cursor-pointer group ${
                        theme === 'dark' ? 'bg-stone-800' : 'bg-white'
                      } shadow-md hover:shadow-xl transition-all duration-300 border ${
                        theme === 'dark' ? 'border-stone-700' : 'border-stone-200'
                      }`}
                      onClick={() => handlePokemonClick(pokemon.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Pokemon Image */}
                      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800">
                        <Image
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                          alt={pokemon.name}
                          fill
                          className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />
                        
                        {/* Badge for dual category Pokemon */}
                        {((activeTab === 'variants' && pokemon.isLegendary) || (activeTab === 'legendaries' && (pokemon as any).isVariant)) && (
                          <div className="absolute top-2 left-2">
                            <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              theme === 'dark' ? 'bg-amber-900/90 text-amber-200' : 'bg-amber-100 text-amber-800'
                            } backdrop-blur-sm flex items-center gap-1`}>
                              {activeTab === 'variants' ? (
                                <>
                                  <GiCrown className="text-xs" />
                                  <span>Legendary</span>
                                </>
                              ) : (
                                <>
                                  <BsArrowRepeat className="text-xs" />
                                  <span>Variant</span>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pokemon Info */}
                      <div className="p-3">
                        <div className="text-center mb-2">
                          <h3 className="font-bold text-sm mb-1">{pokemon.name}</h3>
                          {activeTab === 'legendaries' && (
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              {(pokemon as Legendary).title}
                            </p>
                          )}
                        </div>

                        {/* Types */}
                        <div className="flex justify-center gap-1 mb-2">
                          {pokemon.types?.map((type) => type && (
                            <TypeBadge key={type} type={type} size="xs" />
                          ))}
                        </div>

                        {/* Location for legendaries */}
                        {activeTab === 'legendaries' && (
                          <div className="text-center">
                            <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
                              {(pokemon as Legendary).location}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <p className="text-white text-xs text-center px-2">
                          Click to view in Pokédex
                        </p>
                      </div>
                    </motion.div>
                  </CardHover>
                </SlideUp>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SpecialPokemonShowcase;