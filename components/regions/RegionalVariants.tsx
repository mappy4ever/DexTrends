import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn, SlideUp, CardHover } from '../ui/animations/animations';
import { TypeBadge } from '../ui/TypeBadge';
import { 
  BsArrowRepeat,
  BsGeoAlt,
  BsSnow,
  BsSun,
  BsCloudRain,
  BsLightning,
  BsExclamation,
  BsChevronRight,
  BsInfoCircle
} from 'react-icons/bs';
import { GiMushroom, GiCrystalGrowth, GiSnowflake2 } from 'react-icons/gi';

// Type definitions
interface Variant {
  name: string;
  originalTypes: string[];
  variantTypes: string[];
  category: string;
  description: string;
  originalImage: string;
  variantImage: string;
  ability: string;
  changes: string[];
  evolution?: string;
  breeds?: string[];
}

interface RegionVariantData {
  title: string;
  description: string;
  icon: React.ReactElement;
  categories: string[];
  variants: Variant[];
}

interface RegionalVariantsProps {
  region: {
    id: string;
    name?: string;
  };
  theme: string;
}

const RegionalVariants: React.FC<RegionalVariantsProps> = ({ region, theme }) => {
  const router = useRouter();

  // Regional variant data by region
  const regionalVariantsData: Record<string, RegionVariantData> = {
    alola: {
      title: 'Alolan Forms',
      description: 'Pokémon that adapted to Alola\'s tropical island environment',
      icon: <BsSun className="text-yellow-500" />,
      categories: ['ice', 'dark', 'all'],
      variants: [
        {
          name: 'Rattata',
          originalTypes: ['normal'],
          variantTypes: ['dark', 'normal'],
          category: 'dark',
          description: 'Became nocturnal to avoid Yungoos, developing Dark-type abilities.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10091.png',
          ability: 'Gluttony / Hustle',
          changes: ['Nocturnal lifestyle', 'Fatter and darker fur', 'Lives in urban areas']
        },
        {
          name: 'Raichu',
          originalTypes: ['electric'],
          variantTypes: ['electric', 'psychic'],
          category: 'psychic',
          description: 'Gained Psychic powers by eating too many sweet pancakes, rides its tail like a surfboard.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10100.png',
          ability: 'Surge Surfer',
          changes: ['Surfs on its tail', 'Psychic abilities from diet', 'Rounder and cuter appearance']
        },
        {
          name: 'Sandshrew',
          originalTypes: ['ground'],
          variantTypes: ['ice', 'steel'],
          category: 'ice',
          description: 'Moved to snowy mountains to escape desert heat, developing an icy shell.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/27.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10101.png',
          ability: 'Snow Cloak',
          changes: ['Ice-covered body', 'Lives on snowy mountains', 'Steel-hard ice shell']
        },
        {
          name: 'Vulpix',
          originalTypes: ['fire'],
          variantTypes: ['ice'],
          category: 'ice',
          description: 'Migrated to snowy mountains and adapted to the cold, becoming Ice-type.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10103.png',
          ability: 'Snow Cloak / Snow Warning',
          changes: ['White fur', 'Breathes -58°F air', 'Ice crystals in fur']
        },
        {
          name: 'Ninetales',
          originalTypes: ['fire'],
          variantTypes: ['ice', 'fairy'],
          category: 'ice',
          description: 'Revered as a deity in Alola, gained Fairy-type and ice powers.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10104.png',
          ability: 'Snow Cloak / Snow Warning',
          changes: ['Mystical appearance', 'Creates ice crystals', 'Fairy-type addition']
        },
        {
          name: 'Diglett',
          originalTypes: ['ground'],
          variantTypes: ['ground', 'steel'],
          category: 'ground',
          description: 'Developed metallic whiskers due to volcanic environment.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/50.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10105.png',
          ability: 'Sand Veil / Tangling Hair',
          changes: ['Golden hair whiskers', 'Steel-type added', 'Hair acts as sensor']
        },
        {
          name: 'Meowth',
          originalTypes: ['normal'],
          variantTypes: ['dark'],
          category: 'dark',
          description: 'Bred by Alolan royalty, became prideful and selfish.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10107.png',
          ability: 'Pickup / Technician',
          changes: ['Gray fur', 'More cunning', 'Royal background']
        },
        {
          name: 'Geodude',
          originalTypes: ['rock', 'ground'],
          variantTypes: ['rock', 'electric'],
          category: 'electric',
          description: 'Magnetic minerals in body allow it to fire electric attacks.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10109.png',
          ability: 'Magnet Pull / Sturdy',
          changes: ['Magnetic body', 'Electric eyebrows', 'Can float magnetically']
        },
        {
          name: 'Grimer',
          originalTypes: ['poison'],
          variantTypes: ['poison', 'dark'],
          category: 'dark',
          description: 'Fed on garbage, developed crystallized toxins that look like teeth.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/88.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10112.png',
          ability: 'Poison Touch / Gluttony',
          changes: ['Colorful appearance', 'Crystal "teeth"', 'Constantly hungry']
        },
        {
          name: 'Exeggutor',
          originalTypes: ['grass', 'psychic'],
          variantTypes: ['grass', 'dragon'],
          category: 'dragon',
          description: 'Year-round sun awakened its dormant draconic powers, grew extremely tall.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/103.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10114.png',
          ability: 'Frisk / Harvest',
          changes: ['35 feet tall', 'Dragon-type', 'Fourth head on tail']
        },
        {
          name: 'Marowak',
          originalTypes: ['ground'],
          variantTypes: ['fire', 'ghost'],
          category: 'fire',
          description: 'Overcame grief through Alolan rituals, bone burns with spiritual fire.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/105.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10115.png',
          ability: 'Cursed Body / Lightning Rod',
          changes: ['Fire dancer', 'Spiritual flames', 'Ghost-type added']
        }
      ]
    },
    galar: {
      title: 'Galarian Forms',
      description: 'Pokémon that evolved differently in Galar\'s unique environment',
      icon: <BsCloudRain className="text-stone-500" />,
      categories: ['fighting', 'poison', 'psychic', 'all'],
      variants: [
        {
          name: 'Meowth',
          originalTypes: ['normal'],
          variantTypes: ['steel'],
          category: 'steel',
          description: 'Living with savage Viking-like people made them tough Steel-types.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10161.png',
          ability: 'Pickup / Tough Claws',
          changes: ['Scruffy appearance', 'Steel beard', 'Viking heritage'],
          evolution: 'Perrserker (new evolution)'
        },
        {
          name: 'Ponyta',
          originalTypes: ['fire'],
          variantTypes: ['psychic'],
          category: 'psychic',
          description: 'Absorbed life energy of the Glimwood Tangle forest, becoming Psychic-type.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/77.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10162.png',
          ability: 'Run Away / Pastel Veil',
          changes: ['Fluffy mane', 'Healing powers', 'Fairy tale appearance']
        },
        {
          name: 'Rapidash',
          originalTypes: ['fire'],
          variantTypes: ['psychic', 'fairy'],
          category: 'psychic',
          description: 'Gained Fairy-type through exposure to Glimwood Tangle energy.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/78.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10163.png',
          ability: 'Run Away / Pastel Veil',
          changes: ['Unicorn-like', 'Psychic powers', 'Healing abilities']
        },
        {
          name: 'Slowpoke',
          originalTypes: ['water', 'psychic'],
          variantTypes: ['psychic'],
          category: 'psychic',
          description: 'Diet of Galarica seeds made them lose Water-type but gain unique abilities.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/79.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10164.png',
          ability: 'Gluttony / Own Tempo',
          changes: ['Yellow marks', 'Spicy seed diet', 'Different evolutions']
        },
        {
          name: 'Farfetch\'d',
          originalTypes: ['normal', 'flying'],
          variantTypes: ['fighting'],
          category: 'fighting',
          description: 'Evolved to be more combative, carries a huge leek as a weapon.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/83.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10166.png',
          ability: 'Steadfast',
          changes: ['Darker colors', 'Larger leek', 'More aggressive'],
          evolution: 'Sirfetch\'d (new evolution)'
        },
        {
          name: 'Weezing',
          originalTypes: ['poison'],
          variantTypes: ['poison', 'fairy'],
          category: 'poison',
          description: 'Adapted to consume polluted air and expel clean air, gaining Fairy-type.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/110.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10167.png',
          ability: 'Levitate / Neutralizing Gas',
          changes: ['Top hat smokestacks', 'Air purifier', 'Gentleman appearance']
        },
        {
          name: 'Mr. Mime',
          originalTypes: ['psychic', 'fairy'],
          variantTypes: ['ice', 'psychic'],
          category: 'ice',
          description: 'Adapted to cold climate, tap dances to create ice barriers.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/122.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10168.png',
          ability: 'Vital Spirit / Screen Cleaner',
          changes: ['Ice shoes', 'Tap dancer', 'Cold adaptation'],
          evolution: 'Mr. Rime (new evolution)'
        },
        {
          name: 'Articuno',
          originalTypes: ['ice', 'flying'],
          variantTypes: ['psychic', 'flying'],
          category: 'psychic',
          description: 'Uses psychic power to freeze opponents with a cold stare.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10169.png',
          ability: 'Competitive',
          changes: ['Purple plumage', 'Psychic powers', 'Cruel demeanor']
        },
        {
          name: 'Zapdos',
          originalTypes: ['electric', 'flying'],
          variantTypes: ['fighting', 'flying'],
          category: 'fighting',
          description: 'Lost ability to fly well, but legs became incredibly strong.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10170.png',
          ability: 'Defiant',
          changes: ['Powerful legs', 'Running bird', 'Fighting style']
        },
        {
          name: 'Moltres',
          originalTypes: ['fire', 'flying'],
          variantTypes: ['dark', 'flying'],
          category: 'dark',
          description: 'Aura of sinister flames, said to have exhausted its fire energy.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10171.png',
          ability: 'Berserk',
          changes: ['Dark flames', 'Sinister aura', 'Energy drained']
        },
        {
          name: 'Corsola',
          originalTypes: ['water', 'rock'],
          variantTypes: ['ghost'],
          category: 'ghost',
          description: 'Ancient Corsola that died due to sudden climate change, became Ghost-type.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/222.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10173.png',
          ability: 'Weak Armor',
          changes: ['Bleached white', 'Ghostly', 'Climate victim'],
          evolution: 'Cursola (new evolution)'
        },
        {
          name: 'Zigzagoon',
          originalTypes: ['normal'],
          variantTypes: ['dark', 'normal'],
          category: 'dark',
          description: 'The original Zigzagoon, other regions have the variant form.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/263.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10174.png',
          ability: 'Pickup / Gluttony',
          changes: ['Black and white', 'Restless nature', 'Original form'],
          evolution: 'Obstagoon (new evolution)'
        },
        {
          name: 'Linoone',
          originalTypes: ['normal'],
          variantTypes: ['dark', 'normal'],
          category: 'dark',
          description: 'Can reach 60 mph, very aggressive and competitive.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/264.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10175.png',
          ability: 'Pickup / Gluttony',
          changes: ['Aggressive', 'Fast runner', 'Competitive nature'],
          evolution: 'Obstagoon (new evolution)'
        },
        {
          name: 'Darumaka',
          originalTypes: ['fire'],
          variantTypes: ['ice'],
          category: 'ice',
          description: 'Adapted to cold climates, ice sac replaced fire sac.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/554.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10176.png',
          ability: 'Hustle',
          changes: ['Snowball shape', 'Ice type', 'Cold adaptation']
        },
        {
          name: 'Darmanitan',
          originalTypes: ['fire'],
          variantTypes: ['ice'],
          category: 'ice',
          description: 'Zen Mode transforms it into Ice/Fire type snowman.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/555.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10177.png',
          ability: 'Gorilla Tactics / Zen Mode',
          changes: ['Snowman form', 'Ice/Fire Zen Mode', 'Different ability']
        },
        {
          name: 'Yamask',
          originalTypes: ['ghost'],
          variantTypes: ['ground', 'ghost'],
          category: 'ghost',
          description: 'Carries ancient clay slab instead of mask, has memories of ancient painting.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/562.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10178.png',
          ability: 'Wandering Spirit',
          changes: ['Clay tablet', 'Rune tail', 'Different origin'],
          evolution: 'Runerigus (new evolution)'
        },
        {
          name: 'Stunfisk',
          originalTypes: ['ground', 'electric'],
          variantTypes: ['ground', 'steel'],
          category: 'ground',
          description: 'Lives in mud with high iron content, developed Steel-type.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/618.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10180.png',
          ability: 'Mimicry',
          changes: ['Bear trap design', 'Steel type', 'Stronger jaw']
        }
      ]
    },
    paldea: {
      title: 'Paldean Forms',
      description: 'Ancient and unique variants found only in Paldea',
      icon: <GiCrystalGrowth className="text-amber-500" />,
      categories: ['fighting', 'poison', 'ground', 'all'],
      variants: [
        {
          name: 'Wooper',
          originalTypes: ['water', 'ground'],
          variantTypes: ['poison', 'ground'],
          category: 'poison',
          description: 'Lives on land, covered in poisonous film for protection.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/194.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10253.png',
          ability: 'Poison Point / Water Absorb',
          changes: ['Brown coloration', 'Poisonous mucus', 'Land dweller'],
          evolution: 'Clodsire (new evolution)'
        },
        {
          name: 'Tauros',
          originalTypes: ['normal'],
          variantTypes: ['fighting'], // Combat Breed
          category: 'fighting',
          description: 'Three breeds exist in Paldea with different types and temperaments.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/128.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10250.png',
          ability: 'Intimidate / Anger Point',
          changes: ['Black fur', 'More aggressive', 'Combat specialist'],
          breeds: ['Combat (Fighting)', 'Blaze (Fighting/Fire)', 'Aqua (Fighting/Water)']
        }
      ]
    },
    hisui: {
      title: 'Hisuian Forms',
      description: 'Ancient forms from the Hisui region (ancient Sinnoh)',
      icon: <GiSnowflake2 className="text-amber-400" />,
      categories: ['ghost', 'fighting', 'ice', 'all'],
      variants: [
        {
          name: 'Growlithe',
          originalTypes: ['fire'],
          variantTypes: ['fire', 'rock'],
          category: 'fire',
          description: 'Adapted to Hisui\'s volcanic environment, gained Rock-type.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10229.png',
          ability: 'Intimidate / Flash Fire',
          changes: ['Longer fur', 'Rock horn', 'Guardian nature']
        },
        {
          name: 'Arcanine',
          originalTypes: ['fire'],
          variantTypes: ['fire', 'rock'],
          category: 'fire',
          description: 'Revered as guardian deity, has rock-hard horn.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10230.png',
          ability: 'Intimidate / Flash Fire',
          changes: ['Majestic mane', 'Stone armor', 'Legendary status']
        },
        {
          name: 'Voltorb',
          originalTypes: ['electric'],
          variantTypes: ['electric', 'grass'],
          category: 'electric',
          description: 'Resembles ancient Poké Balls made from Apricorns.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/100.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10231.png',
          ability: 'Soundproof / Static',
          changes: ['Wood grain pattern', 'Grass type', 'Happy expression']
        },
        {
          name: 'Typhlosion',
          originalTypes: ['fire'],
          variantTypes: ['fire', 'ghost'],
          category: 'ghost',
          description: 'Said to purify lost souls with its flames, gained Ghost-type.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/157.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10233.png',
          ability: 'Blaze / Flash Fire',
          changes: ['Purple flames', 'Serene expression', 'Soul guide']
        },
        {
          name: 'Qwilfish',
          originalTypes: ['water', 'poison'],
          variantTypes: ['dark', 'poison'],
          category: 'dark',
          description: 'Adapted to toxic seas, became more aggressive.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/211.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10234.png',
          ability: 'Poison Point / Swift Swim',
          changes: ['Darker colors', 'Larger spines', 'Dark type'],
          evolution: 'Overqwil (new evolution)'
        },
        {
          name: 'Sneasel',
          originalTypes: ['dark', 'ice'],
          variantTypes: ['fighting', 'poison'],
          category: 'fighting',
          description: 'Lives in mountainous regions, developed different typing.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/215.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10235.png',
          ability: 'Inner Focus / Poison Touch',
          changes: ['Purple claws', 'Fighting stance', 'Poison claws'],
          evolution: 'Sneasler (new evolution)'
        },
        {
          name: 'Samurott',
          originalTypes: ['water'],
          variantTypes: ['water', 'dark'],
          category: 'water',
          description: 'Became more ruthless in battle, gained Dark-type.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/503.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10236.png',
          ability: 'Torrent / Shell Armor',
          changes: ['Darker armor', 'More aggressive', 'Ruthless fighter']
        },
        {
          name: 'Lilligant',
          originalTypes: ['grass'],
          variantTypes: ['grass', 'fighting'],
          category: 'fighting',
          description: 'Developed powerful legs for mountain climbing.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/549.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10237.png',
          ability: 'Chlorophyll / Hustle',
          changes: ['Stronger legs', 'Fighting style', 'Mountain dweller']
        },
        {
          name: 'Zorua',
          originalTypes: ['dark'],
          variantTypes: ['normal', 'ghost'],
          category: 'ghost',
          description: 'Reborn from spite after being driven from other lands.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/570.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10238.png',
          ability: 'Illusion',
          changes: ['White fur', 'Red markings', 'Vengeful spirit']
        },
        {
          name: 'Zoroark',
          originalTypes: ['dark'],
          variantTypes: ['normal', 'ghost'],
          category: 'ghost',
          description: 'Projects terrifying illusions from its bitter malice.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/571.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10239.png',
          ability: 'Illusion',
          changes: ['Ethereal mane', 'Bloodshot eyes', 'Spiteful illusions']
        },
        {
          name: 'Braviary',
          originalTypes: ['normal', 'flying'],
          variantTypes: ['psychic', 'flying'],
          category: 'psychic',
          description: 'Migrates from north in winter, gained psychic powers.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/628.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10240.png',
          ability: 'Keen Eye / Sheer Force',
          changes: ['Psychic powers', 'Mystical appearance', 'Winter migrant']
        },
        {
          name: 'Sliggoo',
          originalTypes: ['dragon'],
          variantTypes: ['steel', 'dragon'],
          category: 'dragon',
          description: 'Shell became metallic from iron in water.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/705.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10241.png',
          ability: 'Sap Sipper / Shell Armor',
          changes: ['Metal shell', 'Steel type', 'Snail form']
        },
        {
          name: 'Goodra',
          originalTypes: ['dragon'],
          variantTypes: ['steel', 'dragon'],
          category: 'dragon',
          description: 'Lives in shell, became Steel-type from metallic shell.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/706.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10242.png',
          ability: 'Sap Sipper / Shell Armor',
          changes: ['Snail shell', 'Steel/Dragon', 'Different stance']
        },
        {
          name: 'Avalugg',
          originalTypes: ['ice'],
          variantTypes: ['ice', 'rock'],
          category: 'ice',
          description: 'Jaw became stronger from minerals, gained Rock-type.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/713.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10243.png',
          ability: 'Strong Jaw / Ice Body',
          changes: ['Rock jaw', 'Mineral deposits', 'Stronger bite']
        },
        {
          name: 'Decidueye',
          originalTypes: ['grass', 'ghost'],
          variantTypes: ['grass', 'fighting'],
          category: 'fighting',
          description: 'Adapted to harsh climate, became close-combat fighter.',
          originalImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/724.png',
          variantImage: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10244.png',
          ability: 'Overgrow / Scrappy',
          changes: ['Red plumage', 'Fighting style', 'Bulkier build']
        }
      ]
    }
  };

  // Get variants for current region
  const getRegionalVariants = () => {
    const regionName = region.id.toLowerCase();
    return regionalVariantsData[regionName] || null;
  };

  const variantData = getRegionalVariants();

  if (!variantData || !variantData.variants || variantData.variants.length === 0) {
    return null;
  }

  // Show all variants (no filtering)
  const filteredVariants = variantData.variants;

  return (
    <div className={`py-16 ${theme === 'dark' ? 'bg-stone-800' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
              <BsArrowRepeat className="text-amber-500" />
              {variantData.title}
            </h2>
            <p className="text-xl text-stone-600 dark:text-stone-300 max-w-3xl mx-auto">
              {variantData.description}
            </p>
          </div>
        </FadeIn>


        {/* Simplified Variants Grid - Pokédex Style */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredVariants.map((variant, index) => {
            // Map variant names to their base Pokemon IDs for proper navigation
            const pokemonIdMap: Record<string, string> = {
              // Alolan Forms
              'Rattata': '19',
              'Raticate': '20',
              'Raichu': '26',
              'Sandshrew': '27',
              'Sandslash': '28',
              'Vulpix': '37',
              'Ninetales': '38',
              'Diglett': '50',
              'Dugtrio': '51',
              'Meowth': '52',
              'Persian': '53',
              'Geodude': '74',
              'Graveler': '75',
              'Golem': '76',
              'Grimer': '88',
              'Muk': '89',
              'Exeggutor': '103',
              'Marowak': '105',
              // Galarian Forms
              'Ponyta': '77',
              'Rapidash': '78',
              'Slowpoke': '79',
              'Slowbro': '80',
              "Farfetch'd": '83',
              'Weezing': '110',
              'Mr. Mime': '122',
              'Articuno': '144',
              'Zapdos': '145',
              'Moltres': '146',
              'Slowking': '199',
              'Corsola': '222',
              'Zigzagoon': '263',
              'Linoone': '264',
              'Darumaka': '554',
              'Darmanitan': '555',
              'Yamask': '562',
              'Stunfisk': '618',
              // Hisuian Forms
              'Growlithe': '58',
              'Arcanine': '59',
              'Voltorb': '100',
              'Electrode': '101',
              'Typhlosion': '157',
              'Qwilfish': '211',
              'Sneasel': '215',
              'Sliggoo': '705',
              'Goodra': '706',
              'Avalugg': '713',
              'Decidueye': '724',
              'Braviary': '628',
              'Lilligant': '549',
              'Zorua': '570',
              'Zoroark': '571',
              'Samurott': '503',
              // Paldean Forms
              'Wooper': '194',
              'Tauros': '128',
            };
            
            const basePokemonId = pokemonIdMap[variant.name];
            const regionName = region.id.charAt(0).toUpperCase() + region.id.slice(1);
            
            return (
              <SlideUp key={variant.name} delay={index * 0.05}>
                <CardHover>
                  <div 
                    className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 ${
                      theme === 'dark' ? 'bg-stone-800' : 'bg-white'
                    } shadow-md hover:shadow-xl`}
                    onClick={() => {
                      if (basePokemonId) {
                        // Navigate to base Pokemon with form parameter
                        router.push(`/pokedex/${basePokemonId}?form=${regionName}`);
                      }
                    }}
                  >
                    {/* Pokemon Image */}
                    <div className="relative h-32 w-full flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800">
                      <Image
                        src={variant.variantImage}
                        alt={`${variantData.title.replace(' Forms', '')} ${variant.name}`}
                        width={80}
                        height={80}
                        className="object-contain drop-shadow-lg hover:scale-110 transition-transform"
                      />
                      {/* Regional Form Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${
                          region.id === 'alola' ? 'from-orange-500 to-yellow-500' :
                          region.id === 'galar' ? 'from-stone-600 to-amber-600' :
                          region.id === 'paldea' ? 'from-red-500 to-amber-500' :
                          region.id === 'hisui' ? 'from-amber-500 to-teal-500' :
                          'from-stone-500 to-stone-600'
                        }`}>
                          {region.id === 'alola' ? 'A' : 
                           region.id === 'galar' ? 'G' : 
                           region.id === 'paldea' ? 'P' : 
                           region.id === 'hisui' ? 'H' : 'R'}
                        </span>
                      </div>
                    </div>

                    {/* Pokemon Info */}
                    <div className="p-3">
                      <h3 className="text-sm font-bold text-center mb-2 line-clamp-1">
                        {variant.name}
                      </h3>
                      
                      {/* Types */}
                      <div className="flex justify-center gap-1 mb-2">
                        {variant.variantTypes.map((type) => (
                          <TypeBadge key={type} type={type} size="xs" />
                        ))}
                      </div>

                      {/* Quick Description */}
                      <p className="text-xs text-stone-600 dark:text-stone-300 text-center line-clamp-2">
                        {variant.description}
                      </p>
                    </div>

                    {/* Click Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity">
                      <div className="bg-white/90 rounded-full p-2">
                        <BsChevronRight className="w-4 h-4 text-stone-700" />
                      </div>
                    </div>
                  </div>
                </CardHover>
              </SlideUp>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default RegionalVariants;