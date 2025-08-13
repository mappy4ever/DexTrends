import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfessorImage } from '../../utils/scrapedImageMapping';
// Using direct PokeAPI URLs for Pokémon images
import { FadeIn, SlideUp } from '../ui/animations/animations';
import { GlassContainer } from '../ui/design-system';
import { 
  BsBook, 
  BsTrophy, 
  BsGeoAlt, 
  BsStar, 
  BsLightbulb,
  BsPersonBadge,
  BsCalendarEvent,
  BsJournalBookmark,
  BsHeart,
  BsChatQuote,
  BsChevronLeft,
  BsChevronRight,
  BsSearch,
  BsArrowRight
} from 'react-icons/bs';
import { GiPokecog } from 'react-icons/gi';

// Types
interface StarterPokemon {
  name: string;
  id: number;
}

interface StarterSet {
  grass: StarterPokemon;
  fire: StarterPokemon;
  water: StarterPokemon;
}

interface ProfessorData {
  fullName: string;
  age: string;
  hometown: string;
  specialization: string;
  labLocation: string;
  achievements: string[];
  biography: string;
  signature: string;
  personality: string;
  famousQuote: string;
  research: string[];
  starterPokemon: StarterSet;
  assistants: string[];
  inventions: string[];
  mediaAppearances: string;
}

interface VersionInfo {
  version: string;
  color: string;
}

interface Region {
  id: string;
  name: string;
}

interface ProfessorShowcaseProps {
  region: Region;
  professor: string;
  theme: 'light' | 'dark';
}

const ProfessorShowcase: React.FC<ProfessorShowcaseProps> = ({ region, professor, theme }) => {
  // State for handling dual professors (Sada/Turo)
  const [selectedProfessor, setSelectedProfessor] = useState(0);

  // Check if this region has dual professors
  const isDualProfessor = professor === 'Professor Sada/Turo' || professor === 'Professor Magnolia/Sonia';
  const professorOptions = isDualProfessor ? 
    (professor === 'Professor Sada/Turo' ? ['Professor Sada', 'Professor Turo'] : ['Professor Magnolia', 'Professor Sonia']) 
    : [professor];
  const currentProfessor = professorOptions[selectedProfessor];

  // Version mapping for dual professors
  const versionInfo: { [key: string]: VersionInfo } = {
    'Professor Sada': { version: 'Scarlet', color: 'from-red-500 to-orange-500' },
    'Professor Turo': { version: 'Violet', color: 'from-purple-500 to-indigo-500' }
  };

  // Comprehensive professor data
  const professorData: { [key: string]: ProfessorData } = {
    'Professor Oak': {
      fullName: 'Professor Samuel Oak',
      age: '60-65',
      hometown: 'Pallet Town',
      specialization: 'Pokémon-Human Relationships',
      labLocation: 'Pallet Town, Kanto',
      achievements: [
        'Created the first Pokédex',
        'Former Pokémon League Champion',
        'Renowned Pokémon poet',
        'Discovered over 150 Pokémon species'
      ],
      biography: `Professor Oak is one of the most renowned Pokémon researchers in the world. As a young man, he was a formidable Pokémon trainer and even served as the Champion of the Indigo League. After retiring from battling, he dedicated his life to studying Pokémon and their relationships with humans.

He is famous for creating the Pokédex, a revolutionary device that automatically records data on Pokémon encountered by trainers. His research focuses on understanding the bonds between Pokémon and their trainers, and he has published numerous papers on Pokémon behavior and evolution.

Professor Oak is also known for his poetry about Pokémon, often incorporating his observations into haiku and other forms of verse. He runs a large laboratory in Pallet Town where he cares for the Pokémon of traveling trainers and conducts his research.`,
      signature: 'Giving trainers their first Pokémon and Pokédex',
      personality: 'Wise, patient, occasionally forgetful (especially about his grandson\'s name)',
      famousQuote: "The world of Pokémon awaits! Let's go!",
      research: [
        'Pokémon habitat and distribution',
        'Evolution triggers and conditions',
        'Trainer-Pokémon bond strengthening',
        'Regional Pokémon variations'
      ],
      starterPokemon: {
        grass: { name: 'Bulbasaur', id: 1 },
        fire: { name: 'Charmander', id: 4 },
        water: { name: 'Squirtle', id: 7 }
      },
      assistants: ['Tracey Sketchit', 'Gary Oak (grandson)'],
      inventions: ['Pokédex', 'PC Storage System (with Bill)'],
      mediaAppearances: 'Regular radio show host on Professor Oak\'s Pokémon Talk'
    },
    'Professor Elm': {
      fullName: 'Professor Elm',
      age: '30-35',
      hometown: 'New Bark Town',
      specialization: 'Pokémon Breeding and Evolution',
      labLocation: 'New Bark Town, Johto',
      achievements: [
        'Discovered Pokémon Eggs',
        'Pioneer in breeding research',
        'Published groundbreaking evolution studies',
        'Former student of Professor Oak'
      ],
      biography: `Professor Elm is a young but brilliant researcher who studied under Professor Oak. His groundbreaking discovery of Pokémon Eggs revolutionized the understanding of Pokémon reproduction and led to the establishment of Pokémon Day Care centers worldwide.

Despite his scientific brilliance, Elm is known to be somewhat absent-minded and easily flustered. He often becomes so absorbed in his research that he forgets about everything else, including meals and appointments. His laboratory in New Bark Town is often cluttered with research papers and equipment.

His research has provided invaluable insights into baby Pokémon, egg groups, and the conditions required for Pokémon breeding. He continues to study evolution patterns and has made significant contributions to understanding pre-evolutions.`,
      signature: 'Discovering Pokémon Eggs and breeding mechanics',
      personality: 'Enthusiastic, scatter-brained, dedicated, easily excited by discoveries',
      famousQuote: "Incredible! I've never seen a Pokémon Egg hatch before!",
      research: [
        'Pokémon Egg discovery and hatching',
        'Baby Pokémon and pre-evolutions',
        'Breeding compatibility',
        'Evolution through friendship'
      ],
      starterPokemon: {
        grass: { name: 'Chikorita', id: 152 },
        fire: { name: 'Cyndaquil', id: 155 },
        water: { name: 'Totodile', id: 158 }
      },
      assistants: ['Lab assistants', 'Ethan/Lyra (protégés)'],
      inventions: ['Improved Pokédex', 'Egg Incubator prototype'],
      mediaAppearances: 'Frequently cited in breeding journals'
    },
    'Professor Birch': {
      fullName: 'Professor Birch',
      age: '40-45',
      hometown: 'Littleroot Town',
      specialization: 'Pokémon Habitats and Field Research',
      labLocation: 'Littleroot Town, Hoenn',
      achievements: [
        'Leading field researcher',
        'Documented numerous Pokémon in natural habitats',
        'Established field research methodologies',
        'Discovered habitat-based evolution factors'
      ],
      biography: `Professor Birch is renowned for his hands-on approach to Pokémon research. Unlike many professors who primarily work in laboratories, Birch spends most of his time in the field, observing Pokémon in their natural habitats. This approach has sometimes led to dangerous situations, including being chased by wild Pokémon.

His field research has provided unprecedented insights into Pokémon behavior, migration patterns, and habitat preferences. He believes that to truly understand Pokémon, one must observe them in the wild rather than in controlled environments.

Birch is also the father of Brendan/May, who becomes a rival to new trainers. He takes pride in his child's accomplishments and often speaks highly of their progress as a trainer.`,
      signature: 'Field research and habitat studies',
      personality: 'Adventurous, outdoorsy, brave (sometimes recklessly so), fatherly',
      famousQuote: "You never know what you'll encounter in tall grass!",
      research: [
        'Wild Pokémon behavior patterns',
        'Habitat preferences by type',
        'Environmental factors in evolution',
        'Pokémon migration studies'
      ],
      starterPokemon: {
        grass: { name: 'Treecko', id: 252 },
        fire: { name: 'Torchic', id: 255 },
        water: { name: 'Mudkip', id: 258 }
      },
      assistants: ['Brendan/May (child)', 'Field research team'],
      inventions: ['Field research equipment', 'Portable habitat analyzer'],
      mediaAppearances: 'Nature documentary host'
    },
    'Professor Rowan': {
      fullName: 'Professor Rowan',
      age: '60-70',
      hometown: 'Sandgem Town',
      specialization: 'Pokémon Evolution',
      labLocation: 'Sandgem Town, Sinnoh',
      achievements: [
        'World\'s leading evolution expert',
        'Mentor to Professor Sycamore',
        'Published definitive evolution encyclopedia',
        'Discovered 90% of Sinnoh evolutions'
      ],
      biography: `Professor Rowan is the most senior and perhaps most respected of all regional professors. His stern demeanor and no-nonsense approach to research have earned him both fear and respect from aspiring trainers and fellow researchers alike.

With over 40 years dedicated to studying Pokémon evolution, Rowan has become the world's foremost authority on the subject. His research has identified numerous evolution methods, including location-based evolutions, item-induced evolutions, and time-based evolutions.

Despite his intimidating presence, Rowan deeply cares about Pokémon and trainers. He believes in tough love and pushes trainers to reach their full potential. He was also the mentor to Professor Sycamore, passing on his knowledge to the next generation.`,
      signature: 'Evolution research and stern guidance',
      personality: 'Stern, authoritative, caring beneath the surface, perfectionist',
      famousQuote: "If you\'ve got a Pokémon with you, you\'re a Pokémon Trainer!",
      research: [
        'Evolution methods and triggers',
        'Sinnoh-specific evolutions',
        'Ancient Pokémon evolution',
        'Evolution stone properties'
      ],
      starterPokemon: {
        grass: { name: 'Turtwig', id: 387 },
        fire: { name: 'Chimchar', id: 390 },
        water: { name: 'Piplup', id: 393 }
      },
      assistants: ['Dawn/Lucas', 'Lab researchers'],
      inventions: ['Evolution tracker', 'Advanced Pokédex'],
      mediaAppearances: 'Academic journal editor'
    },
    'Professor Juniper': {
      fullName: 'Professor Aurea Juniper',
      age: '30-35',
      hometown: 'Nuvema Town',
      specialization: 'Pokémon Origins',
      labLocation: 'Nuvema Town, Unova',
      achievements: [
        'First female regional professor',
        'Discovered numerous Unova species',
        'Origins research pioneer',
        'Published theory on Pokémon origins'
      ],
      biography: `Professor Juniper made history as the first female professor to head a regional research laboratory. Her groundbreaking work focuses on the origins of Pokémon and their distribution patterns across regions.

Her research led to the discovery that Unova has a largely unique ecosystem with Pokémon species not found in other regions. This finding revolutionized the understanding of Pokémon biogeography and evolution.

Juniper is known for her friendly and approachable demeanor, making her popular among new trainers. She maintains close relationships with her father, Cedric Juniper, who assists in her research, particularly in field studies.`,
      signature: 'Pokémon origins and regional distribution research',
      personality: 'Friendly, encouraging, curious, methodical',
      famousQuote: "The world of Pokémon is deep and infinite!",
      research: [
        'Pokémon origin theories',
        'Regional species distribution',
        'Unova-exclusive Pokémon',
        'Legendary Pokémon mythology'
      ],
      starterPokemon: {
        grass: { name: 'Snivy', id: 495 },
        fire: { name: 'Tepig', id: 498 },
        water: { name: 'Oshawott', id: 501 }
      },
      assistants: ['Cedric Juniper (father)', 'Fennel (friend)', 'Bianca'],
      inventions: ['C-Gear', 'Improved Pokédex with habitat data'],
      mediaAppearances: 'TED talk speaker on Pokémon origins'
    },
    'Professor Sycamore': {
      fullName: 'Professor Augustine Sycamore',
      age: '35-40',
      hometown: 'Lumiose City',
      specialization: 'Mega Evolution',
      labLocation: 'Lumiose City, Kalos',
      achievements: [
        'Discovered Mega Evolution',
        'Student of Professor Rowan',
        'Published Mega Evolution thesis',
        'Identified all Kalos Mega Stones'
      ],
      biography: `Professor Augustine Sycamore is perhaps the most charismatic of all regional professors. His research into Mega Evolution has revolutionized Pokémon battling and understanding of temporary evolution forms.

As a former student of the stern Professor Rowan, Augustine Sycamore developed a contrasting personality - warm, flirtatious, and enthusiastic. His laboratory in Lumiose City is known for its welcoming atmosphere and cutting-edge technology.

Sycamore's discovery of Mega Evolution came from studying ancient texts and artifacts in Kalos. His research showed that certain Pokémon could temporarily evolve beyond their final forms using Mega Stones and a strong bond with their trainers.`,
      signature: 'Mega Evolution research and Kalos charm',
      personality: 'Charismatic, stylish, passionate about research, somewhat flirtatious',
      famousQuote: "To understand Mega Evolution, you must understand the bond between Pokémon and Trainer!",
      research: [
        'Mega Evolution mechanics',
        'Mega Stone locations',
        'Bond phenomenon',
        'Fairy-type classification'
      ],
      starterPokemon: {
        grass: { name: 'Chespin', id: 650 },
        fire: { name: 'Fennekin', id: 653 },
        water: { name: 'Froakie', id: 656 }
      },
      assistants: ['Sina', 'Dexio', 'Sophie', 'Cosette'],
      inventions: ['Mega Ring technology', 'Holo Caster integration'],
      mediaAppearances: 'Fashion magazine features, research documentaries'
    },
    'Professor Kukui': {
      fullName: 'Professor Kukui',
      age: '30-35',
      hometown: 'Hau\'oli City',
      specialization: 'Pokémon Moves',
      labLocation: 'Route 1, Alola',
      achievements: [
        'Founded Alola Pokémon League',
        'Move research expert',
        'Pro wrestler as "Masked Royal"',
        'Z-Move researcher'
      ],
      biography: `Professor Kukui is unique among professors for his dual life as both a researcher and a professional Battle Royal wrestler under the masked identity of "The Masked Royal." His research focuses on Pokémon moves and their effects.

Kukui's passion for Pokémon battling led him to establish the first Pokémon League in the Alola region, bringing the traditional League structure to the island region. His hands-on approach to research often involves taking attacks from Pokémon directly to study their effects.

Living with his wife Professor Burnet, Kukui embodies the laid-back Alolan lifestyle while maintaining scientific rigor. His research on Z-Moves has been instrumental in understanding these powerful techniques unique to Alola.`,
      signature: 'Move research and establishing Alola League',
      personality: 'Laid-back, enthusiastic, brave, secretly dramatic',
      famousQuote: "The strongest moves are the ones that come from the heart, yeah!",
      research: [
        'Pokémon move mechanics',
        'Z-Move properties',
        'Move effectiveness',
        'Battle Royal strategies'
      ],
      starterPokemon: {
        grass: { name: 'Rowlet', id: 722 },
        fire: { name: 'Litten', id: 725 },
        water: { name: 'Popplio', id: 728 }
      },
      assistants: ['Professor Burnet (wife)', 'Lillie (student)'],
      inventions: ['Z-Power Ring improvements', 'Move analyzer'],
      mediaAppearances: 'Battle Royal champion (as Masked Royal)'
    },
    'Professor Magnolia': {
      fullName: 'Professor Magnolia',
      age: '70-80',
      hometown: 'Wedgehurst',
      specialization: 'Dynamax Phenomenon',
      labLocation: 'Route 2, Galar',
      achievements: [
        'Discovered Dynamax phenomenon',
        'Wishing Star researcher',
        'Grandmother and mentor to Sonia',
        'Published Dynamax energy theory'
      ],
      biography: `Professor Magnolia is the eldest active regional professor and the leading authority on the Dynamax phenomenon unique to the Galar region. Her decades of research into Wishing Stars and power spots led to the understanding and harnessing of Dynamax energy.

Despite her advanced age, Magnolia remains sharp and dedicated to her research. She lives a quiet life in her countryside laboratory, where she continues to study the mysterious energy that allows Pokémon to grow to enormous sizes.

She is also a loving grandmother to Sonia, whom she mentored and eventually passed the professor title to. Her wisdom and experience make her a respected figure in the scientific community.`,
      signature: 'Dynamax research and Wishing Star studies',
      personality: 'Wise, patient, grandmotherly, intellectually curious',
      famousQuote: "The Dynamax phenomenon... such a thing occurs only in Galar!",
      research: [
        'Dynamax energy properties',
        'Power spot locations',
        'Wishing Star composition',
        'Gigantamax factors'
      ],
      starterPokemon: {
        grass: { name: 'Grookey', id: 810 },
        fire: { name: 'Scorbunny', id: 813 },
        water: { name: 'Sobble', id: 816 }
      },
      assistants: ['Sonia (granddaughter and successor)'],
      inventions: ['Dynamax Band', 'Power spot detector'],
      mediaAppearances: 'Academic lifetime achievement awards'
    },
    'Professor Sonia': {
      fullName: 'Professor Sonia',
      age: '25-30',
      hometown: 'Wedgehurst',
      specialization: 'Dynamax Energy and Galar History',
      labLocation: 'Wedgehurst, Galar',
      achievements: [
        'Successor to Professor Magnolia',
        'Dynamax researcher',
        'Galar region historian',
        'Legendary Pokémon expert'
      ],
      biography: `Professor Sonia is the granddaughter and successor of Professor Magnolia. Initially working as an assistant, she gradually took over the professor role as Magnolia stepped back from active research. Sonia's passionate and energetic approach contrasts with her grandmother's quiet wisdom.

Her research focuses on the history of Galar and the Dynamax phenomenon. She has a particular interest in legendary Pokémon and their connection to Galar's past. Sonia is known for her fieldwork, often traveling across the region to investigate historical sites and gather data.

As the new generation of Pokémon professors, Sonia represents a more hands-on, adventurous approach to research, often working directly with trainers in the field rather than staying in the laboratory.`,
      signature: 'Galar history research and legendary Pokémon studies',
      personality: 'Energetic, curious, adventurous, caring',
      famousQuote: "There's so much we still don't know about Galar's history!",
      research: [
        'Dynamax energy origins',
        'Galar region history',
        'Legendary Pokémon lore',
        'Ancient Pokémon battles'
      ],
      starterPokemon: {
        grass: { name: 'Grookey', id: 810 },
        fire: { name: 'Scorbunny', id: 813 },
        water: { name: 'Sobble', id: 816 }
      },
      assistants: ['Professor Magnolia (grandmother and mentor)'],
      inventions: ['Historical research database', 'Dynamax energy tracker'],
      mediaAppearances: 'Galar Historical Society publications'
    },
    'Professor Sada': {
      fullName: 'Professor Sada',
      age: '35-40',
      hometown: 'Unknown',
      specialization: 'Ancient Paradox Pokémon',
      labLocation: 'Area Zero Research Station, Paldea',
      achievements: [
        'Discovered Paradox Pokémon',
        'Time machine inventor',
        'Area Zero explorer',
        'Ancient Pokémon researcher'
      ],
      biography: `Professor Sada is one of two professors in Paldea, representing the Scarlet version. Her research focuses on ancient Paradox Pokémon from the distant past. Her obsession with bringing these prehistoric Pokémon to the present led to groundbreaking but controversial research.

Working in the mysterious Area Zero, Sada developed technology capable of bringing Pokémon from different time periods into the present. Her research station deep within the Great Crater of Paldea became her life's work.

Her dedication to her research was absolute, leading to both incredible discoveries and personal sacrifices. The full extent of her research and its implications continue to impact the Paldea region.`,
      signature: 'Ancient Paradox Pokémon and time research',
      personality: 'Driven, brilliant, obsessive, pioneering',
      famousQuote: "The ancient past holds the key to Pokémon's true power!",
      research: [
        'Paradox Pokémon from the past',
        'Time manipulation technology',
        'Area Zero phenomena',
        'Ancient Pokémon restoration'
      ],
      starterPokemon: {
        grass: { name: 'Sprigatito', id: 906 },
        fire: { name: 'Fuecoco', id: 909 },
        water: { name: 'Quaxly', id: 912 }
      },
      assistants: ['Arven (son)', 'AI Professor'],
      inventions: ['Time machine', 'Paradox Pokémon containment'],
      mediaAppearances: 'Classified research documents'
    },
    'Professor Turo': {
      fullName: 'Professor Turo',
      age: '35-40',
      hometown: 'Unknown',
      specialization: 'Future Paradox Pokémon',
      labLocation: 'Area Zero Research Station, Paldea',
      achievements: [
        'Discovered Paradox Pokémon',
        'Time machine inventor',
        'Area Zero explorer',
        'Future Pokémon researcher'
      ],
      biography: `Professor Turo is one of two professors in Paldea, representing the Violet version. His research focuses on futuristic Paradox Pokémon from the distant future. His vision of bringing advanced Pokémon forms to the present drove his groundbreaking research.

Like his counterpart Sada, Turo worked in the depths of Area Zero, developing technology to breach temporal barriers. His research station became a gateway to the future, bringing mechanical and evolved forms of Pokémon into the present day.

His unwavering commitment to his research vision led to both remarkable scientific achievements and personal costs. The legacy of his work continues to shape the understanding of Pokémon evolution and technology.`,
      signature: 'Future Paradox Pokémon and time research',
      personality: 'Visionary, determined, futuristic thinking, isolated',
      famousQuote: "The future evolution of Pokémon surpasses our wildest dreams!",
      research: [
        'Paradox Pokémon from the future',
        'Temporal manipulation',
        'Mechanical Pokémon forms',
        'Evolution acceleration'
      ],
      starterPokemon: {
        grass: { name: 'Sprigatito', id: 906 },
        fire: { name: 'Fuecoco', id: 909 },
        water: { name: 'Quaxly', id: 912 }
      },
      assistants: ['Arven (son)', 'AI Professor'],
      inventions: ['Time machine', 'Future tech integration'],
      mediaAppearances: 'Classified research documents'
    }
  };

  const professorInfo = professorData[currentProfessor] || {} as ProfessorData;

  return (
    <div className="relative py-16 overflow-hidden">
      {/* Section Header */}
      <FadeIn>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-8 mb-6">
            {isDualProfessor && (
              <button
                onClick={() => setSelectedProfessor((prev) => prev === 0 ? 1 : 0)}
                className={`p-4 rounded-full transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                } shadow-lg hover:shadow-xl hover:scale-110`}
                aria-label="Switch professor version"
              >
                <BsChevronLeft className="w-7 h-7" />
              </button>
            )}
            
            <div className="flex flex-col items-center">
              <h2 className="text-4xl font-bold mb-2">Meet the Professor</h2>
              {isDualProfessor && versionInfo[currentProfessor] && (
                <div className={`px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${
                  versionInfo[currentProfessor].color
                } shadow-lg`}>
                  {versionInfo[currentProfessor].version} Exclusive
                </div>
              )}
            </div>
            
            {isDualProfessor && (
              <button
                onClick={() => setSelectedProfessor((prev) => prev === 0 ? 1 : 0)}
                className={`p-4 rounded-full transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                } shadow-lg hover:shadow-xl hover:scale-110`}
                aria-label="Switch professor version"
              >
                <BsChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {region.name}'s Leading Pokémon Researcher
          </p>
        </div>
      </FadeIn>

      {/* Two-Column Layout: Professor Image Left, Info Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentProfessor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-12 items-start"
          >
          {/* Left Column - Professor Image */}
          <SlideUp>
            <div className="relative">
              {/* Extra Large Professor Image with Transparent Background */}
              <div className="flex justify-center lg:justify-start mb-8">
                <div className="relative w-96 h-96 sm:w-[28rem] sm:h-[28rem] lg:w-[32rem] lg:h-[32rem] xl:w-[36rem] xl:h-[36rem]">
                  <Image
                    src={getProfessorImage(currentProfessor)}
                    alt={currentProfessor}
                    fill
                    className="object-contain opacity-90 filter drop-shadow-lg"
                    priority
                  />
                  {/* Enhanced glow effect for larger image */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-blue-400/20 rounded-full blur-3xl -z-10"></div>
                </div>
              </div>

              {/* Professor Name and Specialization - Below Image */}
              <FadeIn delay={0.3}>
                <div className="text-center">
                  <h3 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                    {currentProfessor}
                  </h3>
                  <p className="text-lg lg:text-xl text-blue-600 dark:text-blue-400 font-medium mb-6">
                    {professorInfo.specialization}
                  </p>
                  
                  {/* Quick Info moved here */}
                  <div className={`mt-8 p-6 rounded-xl text-left ${
                    theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
                  } shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <BsPersonBadge className="text-purple-500" />
                      Quick Info
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Laboratory</p>
                        <p className="font-semibold">{professorInfo.labLocation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Age</p>
                        <p className="font-semibold">{professorInfo.age || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Known For</p>
                        <p className="font-semibold">{professorInfo.signature}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </SlideUp>

          {/* Right Column - Professor Information */}
          <div className="space-y-6">
            {/* Starter Pokémon Showcase */}
            {professorInfo.starterPokemon && (
              <SlideUp delay={0.05}>
                <GlassContainer variant="dark" blur="lg" rounded="2xl" padding="md" hover gradient>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <GiPokecog className="text-purple-500" />
                    Starter Pokémon Given
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(professorInfo.starterPokemon).map(([type, pokemon]) => (
                      <Link 
                        key={pokemon.id} 
                        href={`/pokemon/${pokemon.id}`}
                        className="group"
                      >
                        <div className="relative transform transition-all duration-300 hover:scale-110 hover:-translate-y-2">
                          {/* Glass Card for Each Starter */}
                          <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-gradient-to-br from-white/80 to-white/60 dark:from-gray-800/80 dark:to-gray-900/60 shadow-lg group-hover:shadow-2xl border border-white/30 dark:border-gray-700/30">
                            {/* Type-based Gradient Background */}
                            <div className={`absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity bg-gradient-to-br ${
                              type === 'grass' ? 'from-green-400 to-emerald-600' :
                              type === 'fire' ? 'from-orange-400 to-red-600' :
                              'from-blue-400 to-cyan-600'
                            }`} />
                            
                            {/* Pokémon Image */}
                            <div className="relative p-4">
                              <div className="relative w-24 h-24 mx-auto">
                                <Image
                                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                                  alt={pokemon.name}
                                  fill
                                  className="object-contain drop-shadow-lg"
                                />
                              </div>
                            </div>
                            
                            {/* Info Panel */}
                            <div className="p-3 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                              <p className="text-sm font-bold text-center text-gray-800 dark:text-white">
                                {pokemon.name}
                              </p>
                              <p className="text-xs text-center text-gray-600 dark:text-gray-400 capitalize">
                                {type} Type
                              </p>
                              
                              {/* Hover Indicator */}
                              <div className="flex items-center justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">View</span>
                                <BsArrowRight className="text-xs text-purple-600 dark:text-purple-400" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Floating Pokédex Number */}
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
                            #{pokemon.id}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </GlassContainer>
              </SlideUp>
            )}
            {/* Biography */}
            <SlideUp delay={0.1}>
              <div className={`p-6 rounded-xl ${
                theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
              } shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BsBook className="text-blue-500" />
                  Biography
                </h4>
                <div className="text-gray-600 dark:text-gray-300">
                  <p className="leading-relaxed text-sm">
                    {professorInfo.biography}
                  </p>
                </div>
              </div>
            </SlideUp>

            {/* Achievements */}
            <SlideUp delay={0.3}>
              <div className={`p-6 rounded-xl ${
                theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
              } shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BsTrophy className="text-yellow-500" />
                  Major Achievements
                </h4>
                <ul className="space-y-2">
                  {professorInfo.achievements?.map((achievement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <BsStar className="text-yellow-500 mt-0.5 flex-shrink-0 text-sm" />
                      <span className="text-gray-600 dark:text-gray-300 text-sm">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </SlideUp>

            {/* Research Areas */}
            <SlideUp delay={0.4}>
              <div className={`p-6 rounded-xl ${
                theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
              } shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BsJournalBookmark className="text-green-500" />
                  Research Focus
                </h4>
                <div className="space-y-3">
                  {professorInfo.research?.map((area, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg flex items-center gap-3 ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}
                    >
                      <BsSearch className="text-blue-500 flex-shrink-0" />
                      <p className="text-sm font-medium">{area}</p>
                    </div>
                  ))}
                </div>
              </div>
            </SlideUp>

            {/* Famous Quote */}
            {professorInfo.famousQuote && (
              <SlideUp delay={0.5}>
                <div className={`p-6 rounded-xl ${
                  theme === 'dark' ? 'bg-gray-800/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'
                } shadow-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BsChatQuote className="text-indigo-500" />
                    Famous Quote
                  </h4>
                  <blockquote className="text-gray-600 dark:text-gray-300">
                    <p className="italic text-lg leading-relaxed">
                      "{professorInfo.famousQuote}"
                    </p>
                  </blockquote>
                </div>
              </SlideUp>
            )}

          </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfessorShowcase;