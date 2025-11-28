import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
// Using direct PokeAPI URLs for Pokémon images
import { Container } from '../ui/Container';
import { FadeIn, SlideUp } from '../ui/animations/animations';
import { 
  BsArrowRepeat,
  BsGeoAltFill,
  BsChevronRight,
  BsSnow,
  BsFire,
  BsLightning
} from 'react-icons/bs';
import { GiPalmTree, GiMountains, GiCrystalShine } from 'react-icons/gi';

interface RegionalForm {
  originalId: number;
  regionalId: number;
  originalName: string;
  regionalName: string;
  originalType: string[];
  regionalType: string[];
  description: string;
}

interface RegionalFormsGalleryProps {
  region: {
    name: string;
    id: string;
  };
  theme: 'light' | 'dark';
}

const RegionalFormsGallery: React.FC<RegionalFormsGalleryProps> = ({ region, theme }) => {
  const [selectedForm, setSelectedForm] = useState<number | null>(null);
  const [showOriginal, setShowOriginal] = useState<{ [key: number]: boolean }>({});

  // Regional forms data by region
  const regionalFormsData: { [key: string]: RegionalForm[] } = {
    alola: [
      {
        originalId: 19,
        regionalId: 10019,
        originalName: 'Rattata',
        regionalName: 'Alolan Rattata',
        originalType: ['Normal'],
        regionalType: ['Dark', 'Normal'],
        description: 'Became nocturnal to avoid Yungoos'
      },
      {
        originalId: 26,
        regionalId: 10026,
        originalName: 'Raichu',
        regionalName: 'Alolan Raichu',
        originalType: ['Electric'],
        regionalType: ['Electric', 'Psychic'],
        description: 'Surfs on its tail using psychic power'
      },
      {
        originalId: 27,
        regionalId: 10027,
        originalName: 'Sandshrew',
        regionalName: 'Alolan Sandshrew',
        originalType: ['Ground'],
        regionalType: ['Ice', 'Steel'],
        description: 'Adapted to icy mountain peaks'
      },
      {
        originalId: 37,
        regionalId: 10037,
        originalName: 'Vulpix',
        regionalName: 'Alolan Vulpix',
        originalType: ['Fire'],
        regionalType: ['Ice'],
        description: 'Migrated to snowy mountains'
      },
      {
        originalId: 38,
        regionalId: 10038,
        originalName: 'Ninetales',
        regionalName: 'Alolan Ninetales',
        originalType: ['Fire'],
        regionalType: ['Ice', 'Fairy'],
        description: 'Revered as a sacred messenger'
      },
      {
        originalId: 50,
        regionalId: 10050,
        originalName: 'Diglett',
        regionalName: 'Alolan Diglett',
        originalType: ['Ground'],
        regionalType: ['Ground', 'Steel'],
        description: 'Developed metallic whiskers'
      },
      {
        originalId: 52,
        regionalId: 10052,
        originalName: 'Meowth',
        regionalName: 'Alolan Meowth',
        originalType: ['Normal'],
        regionalType: ['Dark'],
        description: 'Bred by Alolan royalty'
      },
      {
        originalId: 74,
        regionalId: 10074,
        originalName: 'Geodude',
        regionalName: 'Alolan Geodude',
        originalType: ['Rock', 'Ground'],
        regionalType: ['Rock', 'Electric'],
        description: 'Magnetized by volcanic activity'
      },
      {
        originalId: 88,
        regionalId: 10088,
        originalName: 'Grimer',
        regionalName: 'Alolan Grimer',
        originalType: ['Poison'],
        regionalType: ['Poison', 'Dark'],
        description: 'Feeds on garbage, crystals formed from toxins'
      },
      {
        originalId: 103,
        regionalId: 10103,
        originalName: 'Exeggutor',
        regionalName: 'Alolan Exeggutor',
        originalType: ['Grass', 'Psychic'],
        regionalType: ['Grass', 'Dragon'],
        description: 'Grew tall in abundant sunshine'
      },
      {
        originalId: 105,
        regionalId: 10105,
        originalName: 'Marowak',
        regionalName: 'Alolan Marowak',
        originalType: ['Ground'],
        regionalType: ['Fire', 'Ghost'],
        description: 'Developed to mourn fallen companions'
      }
    ],
    galar: [
      {
        originalId: 52,
        regionalId: 10052,
        originalName: 'Meowth',
        regionalName: 'Galarian Meowth',
        originalType: ['Normal'],
        regionalType: ['Steel'],
        description: 'Toughened by harsh seafaring life'
      },
      {
        originalId: 77,
        regionalId: 10077,
        originalName: 'Ponyta',
        regionalName: 'Galarian Ponyta',
        originalType: ['Fire'],
        regionalType: ['Psychic'],
        description: 'Exposed to life energy of forest'
      },
      {
        originalId: 78,
        regionalId: 10078,
        originalName: 'Rapidash',
        regionalName: 'Galarian Rapidash',
        originalType: ['Fire'],
        regionalType: ['Psychic', 'Fairy'],
        description: 'Became the Unique Horn Pokémon'
      },
      {
        originalId: 79,
        regionalId: 10079,
        originalName: 'Slowpoke',
        regionalName: 'Galarian Slowpoke',
        originalType: ['Water', 'Psychic'],
        regionalType: ['Psychic'],
        description: 'Diet of Galarica seeds altered it'
      },
      {
        originalId: 83,
        regionalId: 10083,
        originalName: "Farfetch'd",
        regionalName: "Galarian Farfetch'd",
        originalType: ['Normal', 'Flying'],
        regionalType: ['Fighting'],
        description: 'Evolved thicker, stronger leeks'
      },
      {
        originalId: 110,
        regionalId: 10110,
        originalName: 'Weezing',
        regionalName: 'Galarian Weezing',
        originalType: ['Poison'],
        regionalType: ['Poison', 'Fairy'],
        description: 'Purifies air through top hats'
      },
      {
        originalId: 122,
        regionalId: 10122,
        originalName: 'Mr. Mime',
        regionalName: 'Galarian Mr. Mime',
        originalType: ['Psychic', 'Fairy'],
        regionalType: ['Ice', 'Psychic'],
        description: 'Tap dances on ice barriers'
      },
      {
        originalId: 144,
        regionalId: 10144,
        originalName: 'Articuno',
        regionalName: 'Galarian Articuno',
        originalType: ['Ice', 'Flying'],
        regionalType: ['Psychic', 'Flying'],
        description: 'Uses psychic power to freeze'
      },
      {
        originalId: 145,
        regionalId: 10145,
        originalName: 'Zapdos',
        regionalName: 'Galarian Zapdos',
        originalType: ['Electric', 'Flying'],
        regionalType: ['Fighting', 'Flying'],
        description: 'Lost flight for powerful legs'
      },
      {
        originalId: 146,
        regionalId: 10146,
        originalName: 'Moltres',
        regionalName: 'Galarian Moltres',
        originalType: ['Fire', 'Flying'],
        regionalType: ['Dark', 'Flying'],
        description: 'Aura saps life force of foes'
      },
      {
        originalId: 222,
        regionalId: 10222,
        originalName: 'Corsola',
        regionalName: 'Galarian Corsola',
        originalType: ['Water', 'Rock'],
        regionalType: ['Ghost'],
        description: 'Ancient corsola killed by climate change'
      },
      {
        originalId: 263,
        regionalId: 10263,
        originalName: 'Zigzagoon',
        regionalName: 'Galarian Zigzagoon',
        originalType: ['Normal'],
        regionalType: ['Dark', 'Normal'],
        description: 'The original form, restless and combative'
      }
    ],
    paldea: [
      {
        originalId: 128,
        regionalId: 10128,
        originalName: 'Tauros',
        regionalName: 'Paldean Tauros (Combat)',
        originalType: ['Normal'],
        regionalType: ['Fighting'],
        description: 'Developed powerful fighting spirit'
      },
      {
        originalId: 128,
        regionalId: 10129,
        originalName: 'Tauros',
        regionalName: 'Paldean Tauros (Blaze)',
        originalType: ['Normal'],
        regionalType: ['Fighting', 'Fire'],
        description: 'Breathes scorching flames'
      },
      {
        originalId: 128,
        regionalId: 10130,
        originalName: 'Tauros',
        regionalName: 'Paldean Tauros (Aqua)',
        originalType: ['Normal'],
        regionalType: ['Fighting', 'Water'],
        description: 'Sprays high-pressure water'
      },
      {
        originalId: 194,
        regionalId: 10194,
        originalName: 'Wooper',
        regionalName: 'Paldean Wooper',
        originalType: ['Water', 'Ground'],
        regionalType: ['Poison', 'Ground'],
        description: 'Lives in bogs, covered in toxic film'
      }
    ]
  };

  const forms = regionalFormsData[region.id] || [];

  if (forms.length === 0) return null;

  const getTypeGradient = (types: string[]) => {
    const type = types[0].toLowerCase();
    const typeGradients: { [key: string]: string } = {
      fire: 'from-orange-400 to-red-600',
      water: 'from-amber-400 to-amber-600',
      grass: 'from-green-400 to-green-600',
      electric: 'from-yellow-300 to-yellow-500',
      psychic: 'from-pink-400 to-pink-600',
      ice: 'from-cyan-300 to-amber-400',
      dragon: 'from-amber-600 to-purple-800',
      dark: 'from-stone-700 to-stone-900',
      fairy: 'from-pink-300 to-pink-500',
      normal: 'from-stone-400 to-stone-600',
      fighting: 'from-red-700 to-red-900',
      flying: 'from-amber-300 to-amber-400',
      poison: 'from-amber-500 to-amber-700',
      ground: 'from-yellow-600 to-orange-700',
      rock: 'from-yellow-700 to-yellow-900',
      bug: 'from-green-500 to-green-700',
      ghost: 'from-amber-600 to-amber-900',
      steel: 'from-stone-500 to-stone-700'
    };
    return typeGradients[type] || 'from-stone-400 to-stone-600';
  };

  return (
    <div className="relative">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-pink-500 to-blue-500 animate-pulse" />
      </div>

      <Container 
        variant="default" 
        blur="xl" 
        rounded="3xl" 
        padding="lg"
        className="relative"
      >
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BsArrowRepeat className="text-3xl text-amber-500 animate-spin-slow" />
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-pink-600 bg-clip-text text-transparent">
                Regional Forms
              </h2>
              <GiPalmTree className="text-3xl text-green-500" />
            </div>
            <p className="text-xl text-stone-600 dark:text-stone-400">
              Unique adaptations found only in {region.name}
            </p>
          </div>
        </FadeIn>

        {/* Regional Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((form, index) => {
            const isFlipped = showOriginal[index];
            
            return (
              <SlideUp key={index} delay={index * 0.05}>
                <motion.div
                  className="relative h-full"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* Flip Card Container */}
                  <div className="relative h-full preserve-3d" style={{ transformStyle: 'preserve-3d' }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={isFlipped ? 'original' : 'regional'}
                        className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/90 via-amber-50/70 to-white/80 dark:from-stone-800/90 dark:via-amber-900/30 dark:to-stone-900/80 shadow-xl border border-white/30 dark:border-stone-700/30 h-full"
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/* Type Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${
                          isFlipped ? getTypeGradient(form.originalType) : getTypeGradient(form.regionalType)
                        } opacity-15`} />

                        {/* Form Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <div className={`px-3 py-1.5 rounded-full backdrop-blur-md ${
                            isFlipped 
                              ? 'bg-stone-900/70 text-white' 
                              : 'bg-gradient-to-r from-amber-600/80 to-pink-600/80 text-white'
                          } text-xs font-bold shadow-lg`}>
                            {isFlipped ? 'Original' : region.name}
                          </div>
                        </div>

                        {/* Flip Button */}
                        <button
                          onClick={() => setShowOriginal({ ...showOriginal, [index]: !isFlipped })}
                          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <BsArrowRepeat className="text-amber-600 dark:text-amber-400 text-lg" />
                        </button>

                        {/* Pokémon Image */}
                        <div className="relative pt-16 pb-4">
                          <Link href={`/pokemon/${isFlipped ? form.originalId : form.regionalId}`}>
                            <div className="relative w-32 h-32 mx-auto cursor-pointer group">
                              <Image
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${isFlipped ? form.originalId : form.regionalId}.png`}
                                alt={isFlipped ? form.originalName : form.regionalName}
                                fill
                                className="object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          </Link>
                        </div>

                        {/* Info Panel */}
                        <div className="p-5 pt-2">
                          <h3 className="text-lg font-bold text-center text-stone-800 dark:text-white mb-2">
                            {isFlipped ? form.originalName : form.regionalName}
                          </h3>
                          
                          {/* Type Pills */}
                          <div className="flex justify-center gap-2 mb-3">
                            {(isFlipped ? form.originalType : form.regionalType).map((type) => (
                              <span 
                                key={type}
                                className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-gradient-to-r ${
                                  getTypeGradient([type])
                                } text-white shadow-md`}
                              >
                                {type}
                              </span>
                            ))}
                          </div>

                          {/* Description */}
                          {!isFlipped && (
                            <p className="text-xs text-center text-stone-600 dark:text-stone-400 leading-relaxed">
                              {form.description}
                            </p>
                          )}

                          {/* View Details Link */}
                          <Link 
                            href={`/pokemon/${isFlipped ? form.originalId : form.regionalId}`}
                            className="flex items-center justify-center gap-1 mt-3 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-purple-300 transition-colors"
                          >
                            <span className="text-sm font-medium">View Details</span>
                            <BsChevronRight className="text-sm" />
                          </Link>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </SlideUp>
            );
          })}
        </div>

        {/* Regional Adaptation Info */}
        <motion.div 
          className="mt-10 p-6 rounded-2xl backdrop-blur-md bg-gradient-to-r from-amber-100/50 via-pink-100/50 to-blue-100/50 dark:from-amber-900/20 dark:via-pink-900/20 dark:to-blue-900/20 border border-purple-200/30 dark:border-amber-700/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <GiMountains className="text-2xl text-amber-600 dark:text-amber-400" />
            <h3 className="font-bold text-stone-800 dark:text-white">About Regional Forms</h3>
          </div>
          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
            Regional forms are Pokémon that have adapted to the unique environment of {region.name}. 
            These variants have different types, abilities, and appearances from their original forms, 
            showcasing the incredible diversity of Pokémon evolution across different regions.
          </p>
        </motion.div>
      </Container>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default RegionalFormsGallery;