import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getEliteFourImage, getChampionImage } from '../../utils/scrapedImageMapping';
import { TypeGradientBadge } from '../ui/design-system/TypeGradientBadge';
import { typeEffectiveness } from '../../utils/pokemonutils';
import { BsTrophy, BsShieldFill, BsStar } from 'react-icons/bs';

interface EliteFourMember {
  name: string;
  type: string;
  signature?: string;
}

interface Champion {
  name: string;
  signature?: string;
}

interface Region {
  id: string;
}

interface EliteFourGridProps {
  region: Region;
  eliteFour: EliteFourMember[];
  champion: Champion | null;
  theme: string;
}

interface MemberData {
  quote: string;
  strategy: string;
  team: Array<{
    name: string;
    id: number;
    level: number;
    types: string[];
  }>;
}

const EliteFourGrid: React.FC<EliteFourGridProps> = ({ region, eliteFour, champion, theme }) => {
  const [revealChampion, setRevealChampion] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  
  const handleCardFlip = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Elite Four data
  const eliteFourData: Record<string, MemberData> = {
    'Lorelei': {
      quote: "Your Pokémon will be at my mercy when they are frozen solid!",
      strategy: "Freezing tactics with Ice-type precision",
      team: [
        { name: 'Dewgong', id: 87, level: 52, types: ['water', 'ice'] },
        { name: 'Cloyster', id: 91, level: 51, types: ['water', 'ice'] },
        { name: 'Slowbro', id: 80, level: 52, types: ['water', 'psychic'] },
        { name: 'Jynx', id: 124, level: 54, types: ['ice', 'psychic'] },
        { name: 'Lapras', id: 131, level: 54, types: ['water', 'ice'] }
      ]
    },
    'Bruno': {
      quote: "We will grind you down with our superior power!",
      strategy: "Raw fighting power and physical dominance",
      team: [
        { name: 'Onix', id: 95, level: 51, types: ['rock', 'ground'] },
        { name: 'Hitmonchan', id: 107, level: 53, types: ['fighting'] },
        { name: 'Hitmonlee', id: 106, level: 53, types: ['fighting'] },
        { name: 'Onix', id: 95, level: 54, types: ['rock', 'ground'] },
        { name: 'Machamp', id: 68, level: 56, types: ['fighting'] }
      ]
    },
    'Agatha': {
      quote: "I'll show you how a real Trainer battles!",
      strategy: "Ghostly tricks and status conditions",
      team: [
        { name: 'Gengar', id: 94, level: 54, types: ['ghost', 'poison'] },
        { name: 'Golbat', id: 42, level: 54, types: ['poison', 'flying'] },
        { name: 'Haunter', id: 93, level: 53, types: ['ghost', 'poison'] },
        { name: 'Arbok', id: 24, level: 56, types: ['poison'] },
        { name: 'Gengar', id: 94, level: 58, types: ['ghost', 'poison'] }
      ]
    },
    'Lance': {
      quote: "You still need more training. Come back when you get stronger!",
      strategy: "Dragon supremacy and overwhelming force",
      team: [
        { name: 'Gyarados', id: 130, level: 56, types: ['water', 'flying'] },
        { name: 'Dragonair', id: 148, level: 54, types: ['dragon'] },
        { name: 'Dragonair', id: 148, level: 54, types: ['dragon'] },
        { name: 'Aerodactyl', id: 142, level: 58, types: ['rock', 'flying'] },
        { name: 'Dragonite', id: 149, level: 60, types: ['dragon', 'flying'] }
      ]
    },
    // Paldea Elite Four
    'Rika': {
      quote: "I'd say I'll go easy on you, but... I'd be lying!",
      strategy: "Ground-type domination with seismic power",
      team: [
        { name: 'Whiscash', id: 340, level: 57, types: ['water', 'ground'] },
        { name: 'Camerupt', id: 323, level: 57, types: ['fire', 'ground'] },
        { name: 'Donphan', id: 232, level: 57, types: ['ground'] },
        { name: 'Dugtrio', id: 51, level: 57, types: ['ground'] },
        { name: 'Clodsire', id: 980, level: 58, types: ['poison', 'ground'] }
      ]
    },
    'Poppy': {
      quote: "Yay! A new friend to play with!",
      strategy: "Steel-type fortress with unbreakable defense",
      team: [
        { name: 'Copperajah', id: 879, level: 58, types: ['steel'] },
        { name: 'Corviknight', id: 823, level: 58, types: ['flying', 'steel'] },
        { name: 'Bronzong', id: 437, level: 58, types: ['steel', 'psychic'] },
        { name: 'Magnezone', id: 462, level: 58, types: ['electric', 'steel'] },
        { name: 'Tinkaton', id: 959, level: 59, types: ['fairy', 'steel'] }
      ]
    },
    'Larry': {
      quote: "I'm Larry. I'm a Gym Leader and Elite Four member. Two jobs...",
      strategy: "Normal and Flying mastery with aerial supremacy",
      team: [
        { name: 'Tropius', id: 357, level: 59, types: ['grass', 'flying'] },
        { name: 'Staraptor', id: 398, level: 59, types: ['normal', 'flying'] },
        { name: 'Altaria', id: 334, level: 59, types: ['dragon', 'flying'] },
        { name: 'Oricorio', id: 741, level: 59, types: ['electric', 'flying'] },
        { name: 'Flamigo', id: 973, level: 60, types: ['flying', 'fighting'] }
      ]
    },
    'Hassel': {
      quote: "Dragons give life their all in every moment!",
      strategy: "Dragon mastery with overwhelming power",
      team: [
        { name: 'Noivern', id: 715, level: 60, types: ['flying', 'dragon'] },
        { name: 'Dragalge', id: 691, level: 60, types: ['poison', 'dragon'] },
        { name: 'Haxorus', id: 612, level: 60, types: ['dragon'] },
        { name: 'Flapple', id: 841, level: 60, types: ['grass', 'dragon'] },
        { name: 'Baxcalibur', id: 998, level: 61, types: ['dragon', 'ice'] }
      ]
    },
    // Johto Elite Four
    'Will': {
      quote: "I have trained all around the world, making my psychic Pokémon powerful.",
      strategy: "Psychic manipulation and mind games",
      team: [
        { name: 'Xatu', id: 178, level: 40, types: ['psychic', 'flying'] },
        { name: 'Jynx', id: 124, level: 41, types: ['ice', 'psychic'] },
        { name: 'Exeggutor', id: 103, level: 41, types: ['grass', 'psychic'] },
        { name: 'Slowbro', id: 80, level: 41, types: ['water', 'psychic'] },
        { name: 'Xatu', id: 178, level: 42, types: ['psychic', 'flying'] }
      ]
    },
    'Karen': {
      quote: "Strong Pokémon. Weak Pokémon. That is only the selfish perception of people.",
      strategy: "Dark-type mastery with unpredictable tactics",
      team: [
        { name: 'Umbreon', id: 197, level: 42, types: ['dark'] },
        { name: 'Vileplume', id: 45, level: 42, types: ['grass', 'poison'] },
        { name: 'Gengar', id: 94, level: 45, types: ['ghost', 'poison'] },
        { name: 'Murkrow', id: 198, level: 44, types: ['dark', 'flying'] },
        { name: 'Houndoom', id: 229, level: 47, types: ['dark', 'fire'] }
      ]
    },
    // Hoenn Elite Four
    'Sidney': {
      quote: "I like that look you're giving me. I guess you'll give me a good match.",
      strategy: "Dark-type offensive pressure",
      team: [
        { name: 'Mightyena', id: 262, level: 46, types: ['dark'] },
        { name: 'Shiftry', id: 275, level: 48, types: ['grass', 'dark'] },
        { name: 'Cacturne', id: 332, level: 46, types: ['grass', 'dark'] },
        { name: 'Sharpedo', id: 319, level: 48, types: ['water', 'dark'] },
        { name: 'Absol', id: 359, level: 49, types: ['dark'] }
      ]
    },
    'Phoebe': {
      quote: "I did my training on Mt. Pyre. While I trained there, I gained the ability to commune with Ghost-type Pokémon.",
      strategy: "Ghost-type tricks and status effects",
      team: [
        { name: 'Dusclops', id: 356, level: 48, types: ['ghost'] },
        { name: 'Banette', id: 354, level: 49, types: ['ghost'] },
        { name: 'Sableye', id: 302, level: 50, types: ['dark', 'ghost'] },
        { name: 'Banette', id: 354, level: 49, types: ['ghost'] },
        { name: 'Dusclops', id: 356, level: 51, types: ['ghost'] }
      ]
    },
    'Glacia': {
      quote: "I've traveled from afar to Hoenn so that I may hone my ice skills.",
      strategy: "Ice-type freezing tactics",
      team: [
        { name: 'Sealeo', id: 364, level: 50, types: ['ice', 'water'] },
        { name: 'Glalie', id: 362, level: 50, types: ['ice'] },
        { name: 'Sealeo', id: 364, level: 52, types: ['ice', 'water'] },
        { name: 'Glalie', id: 362, level: 52, types: ['ice'] },
        { name: 'Walrein', id: 365, level: 53, types: ['ice', 'water'] }
      ]
    },
    'Drake': {
      quote: "I am the last of the Pokémon League Elite Four. I am Drake the Dragon master!",
      strategy: "Dragon-type overwhelming power",
      team: [
        { name: 'Shelgon', id: 372, level: 52, types: ['dragon'] },
        { name: 'Altaria', id: 334, level: 54, types: ['dragon', 'flying'] },
        { name: 'Flygon', id: 330, level: 53, types: ['ground', 'dragon'] },
        { name: 'Flygon', id: 330, level: 53, types: ['ground', 'dragon'] },
        { name: 'Salamence', id: 373, level: 55, types: ['dragon', 'flying'] }
      ]
    },
    // Sinnoh Elite Four
    'Aaron': {
      quote: "I'll show you that Bug-type Pokémon are not to be underestimated!",
      strategy: "Bug-type speed and precision",
      team: [
        { name: 'Dustox', id: 269, level: 53, types: ['bug', 'poison'] },
        { name: 'Beautifly', id: 267, level: 53, types: ['bug', 'flying'] },
        { name: 'Vespiquen', id: 416, level: 54, types: ['bug', 'flying'] },
        { name: 'Heracross', id: 214, level: 54, types: ['bug', 'fighting'] },
        { name: 'Drapion', id: 452, level: 57, types: ['poison', 'dark'] }
      ]
    },
    'Bertha': {
      quote: "You're quite the adorable Trainer, but you've got a spine.",
      strategy: "Ground-type defensive fortress",
      team: [
        { name: 'Quagsire', id: 195, level: 55, types: ['water', 'ground'] },
        { name: 'Sudowoodo', id: 185, level: 56, types: ['rock'] },
        { name: 'Golem', id: 76, level: 56, types: ['rock', 'ground'] },
        { name: 'Whiscash', id: 340, level: 55, types: ['water', 'ground'] },
        { name: 'Hippowdon', id: 450, level: 59, types: ['ground'] }
      ]
    },
    'Flint': {
      quote: "You're facing a Fire-type Elite Four member. Let me see your burning spirit!",
      strategy: "Fire-type blazing offense",
      team: [
        { name: 'Rapidash', id: 78, level: 58, types: ['fire'] },
        { name: 'Steelix', id: 208, level: 57, types: ['steel', 'ground'] },
        { name: 'Drifblim', id: 426, level: 58, types: ['ghost', 'flying'] },
        { name: 'Lopunny', id: 428, level: 57, types: ['normal'] },
        { name: 'Infernape', id: 392, level: 61, types: ['fire', 'fighting'] }
      ]
    },
    'Lucian': {
      quote: "I have a reputation of being the strongest of the Elite Four.",
      strategy: "Psychic-type tactical supremacy",
      team: [
        { name: 'Mr. Mime', id: 122, level: 59, types: ['psychic', 'fairy'] },
        { name: 'Girafarig', id: 203, level: 59, types: ['normal', 'psychic'] },
        { name: 'Medicham', id: 308, level: 60, types: ['fighting', 'psychic'] },
        { name: 'Alakazam', id: 65, level: 60, types: ['psychic'] },
        { name: 'Bronzong', id: 437, level: 63, types: ['steel', 'psychic'] }
      ]
    },
    // Unova Elite Four
    'Shauntal': {
      quote: "Chandelure's flames can burn away spirits. Your Pokémon are in for a fright!",
      strategy: "Ghost-type spirit manipulation",
      team: [
        { name: 'Cofagrigus', id: 563, level: 48, types: ['ghost'] },
        { name: 'Jellicent', id: 593, level: 48, types: ['water', 'ghost'] },
        { name: 'Golurk', id: 623, level: 48, types: ['ground', 'ghost'] },
        { name: 'Chandelure', id: 609, level: 50, types: ['ghost', 'fire'] }
      ]
    },
    'Grimsley': {
      quote: "Life is a serious battle, and you have to use the tools you're given.",
      strategy: "Dark-type tactical gambling",
      team: [
        { name: 'Liepard', id: 510, level: 48, types: ['dark'] },
        { name: 'Krookodile', id: 553, level: 48, types: ['ground', 'dark'] },
        { name: 'Scrafty', id: 560, level: 48, types: ['dark', 'fighting'] },
        { name: 'Bisharp', id: 625, level: 50, types: ['dark', 'steel'] }
      ]
    },
    'Caitlin': {
      quote: "I am Caitlin of the Elite Four. You appear to possess a combination of strength and kindness.",
      strategy: "Psychic-type elegant control",
      team: [
        { name: 'Reuniclus', id: 579, level: 48, types: ['psychic'] },
        { name: 'Musharna', id: 518, level: 48, types: ['psychic'] },
        { name: 'Sigilyph', id: 561, level: 48, types: ['psychic', 'flying'] },
        { name: 'Gothitelle', id: 576, level: 50, types: ['psychic'] }
      ]
    },
    'Marshal': {
      quote: "In order to master the art of fighting, I've kept training.",
      strategy: "Fighting-type martial arts mastery",
      team: [
        { name: 'Throh', id: 538, level: 48, types: ['fighting'] },
        { name: 'Sawk', id: 539, level: 48, types: ['fighting'] },
        { name: 'Mienshao', id: 620, level: 48, types: ['fighting'] },
        { name: 'Conkeldurr', id: 534, level: 50, types: ['fighting'] }
      ]
    },
    // Kalos Elite Four
    'Malva': {
      quote: "I feel like my heart might just burst into flames!",
      strategy: "Fire-type passionate offense",
      team: [
        { name: 'Pyroar', id: 668, level: 63, types: ['fire', 'normal'] },
        { name: 'Torkoal', id: 324, level: 63, types: ['fire'] },
        { name: 'Chandelure', id: 609, level: 63, types: ['ghost', 'fire'] },
        { name: 'Talonflame', id: 663, level: 65, types: ['fire', 'flying'] }
      ]
    },
    'Siebold': {
      quote: "Cooking is the type of art that disappears as soon as it is completed.",
      strategy: "Water-type artistic flow",
      team: [
        { name: 'Clawitzer', id: 693, level: 63, types: ['water'] },
        { name: 'Gyarados', id: 130, level: 63, types: ['water', 'flying'] },
        { name: 'Starmie', id: 121, level: 63, types: ['water', 'psychic'] },
        { name: 'Barbaracle', id: 689, level: 65, types: ['rock', 'water'] }
      ]
    },
    'Wikstrom': {
      quote: "En garde! Now begins a time-honored battle between knight and dragon!",
      strategy: "Steel-type honorable defense",
      team: [
        { name: 'Klefki', id: 707, level: 63, types: ['steel', 'fairy'] },
        { name: 'Probopass', id: 476, level: 63, types: ['rock', 'steel'] },
        { name: 'Scizor', id: 212, level: 63, types: ['bug', 'steel'] },
        { name: 'Aegislash', id: 681, level: 65, types: ['steel', 'ghost'] }
      ]
    },
    'Drasna': {
      quote: "Oh, dear me. That sure was a quick victory.",
      strategy: "Dragon-type overwhelming force",
      team: [
        { name: 'Dragalge', id: 691, level: 63, types: ['poison', 'dragon'] },
        { name: 'Druddigon', id: 621, level: 63, types: ['dragon'] },
        { name: 'Altaria', id: 334, level: 63, types: ['dragon', 'flying'] },
        { name: 'Noivern', id: 715, level: 65, types: ['flying', 'dragon'] }
      ]
    },
    // Alola Elite Four
    'Molayne': {
      quote: "I gave the captain position to my cousin Sophocles, but I'm confident in my ability.",
      strategy: "Steel-type technical precision",
      team: [
        { name: 'Klefki', id: 707, level: 54, types: ['steel', 'fairy'] },
        { name: 'Bisharp', id: 625, level: 54, types: ['dark', 'steel'] },
        { name: 'Magnezone', id: 462, level: 54, types: ['electric', 'steel'] },
        { name: 'Metagross', id: 376, level: 54, types: ['steel', 'psychic'] },
        { name: 'Dugtrio', id: 51, level: 55, types: ['ground', 'steel'] }
      ]
    },
    'Olivia': {
      quote: "I don't see the same look in your eyes that a champion should have!",
      strategy: "Rock-type crushing power",
      team: [
        { name: 'Relicanth', id: 369, level: 54, types: ['water', 'rock'] },
        { name: 'Carbink', id: 703, level: 54, types: ['rock', 'fairy'] },
        { name: 'Golem', id: 76, level: 54, types: ['rock', 'electric'] },
        { name: 'Probopass', id: 476, level: 54, types: ['rock', 'steel'] },
        { name: 'Lycanroc', id: 745, level: 55, types: ['rock'] }
      ]
    },
    'Acerola': {
      quote: "I'm Acerola! The ghost type user of the Elite Four!",
      strategy: "Ghost-type mysterious tactics",
      team: [
        { name: 'Sableye', id: 302, level: 54, types: ['dark', 'ghost'] },
        { name: 'Dhelmise', id: 781, level: 54, types: ['ghost', 'grass'] },
        { name: 'Froslass', id: 478, level: 54, types: ['ice', 'ghost'] },
        { name: 'Palossand', id: 770, level: 54, types: ['ghost', 'ground'] },
        { name: 'Drifblim', id: 426, level: 55, types: ['ghost', 'flying'] }
      ]
    },
    'Kahili': {
      quote: "So you've made it to me! I've been waiting for a serious battle!",
      strategy: "Flying-type aerial dominance",
      team: [
        { name: 'Braviary', id: 628, level: 54, types: ['normal', 'flying'] },
        { name: 'Hawlucha', id: 701, level: 54, types: ['fighting', 'flying'] },
        { name: 'Oricorio', id: 741, level: 54, types: ['fire', 'flying'] },
        { name: 'Mandibuzz', id: 630, level: 54, types: ['dark', 'flying'] },
        { name: 'Toucannon', id: 733, level: 55, types: ['normal', 'flying'] }
      ]
    },
    // Galar Elite Four (uses gym leaders in Elite Four style battles)
    'Bea': {
      quote: "Your strength is impressive. Let's see how you handle my full power!",
      strategy: "Fighting-type martial arts mastery",
      team: [
        { name: 'Hawlucha', id: 701, level: 52, types: ['fighting', 'flying'] },
        { name: 'Grapploct', id: 853, level: 52, types: ['fighting'] },
        { name: 'Sirfetchd', id: 865, level: 53, types: ['fighting'] },
        { name: 'Falinks', id: 870, level: 53, types: ['fighting'] },
        { name: 'Machamp', id: 68, level: 54, types: ['fighting'] }
      ]
    },
    'Allister': {
      quote: "I can see things others cannot... even the spirits of your Pokémon.",
      strategy: "Ghost-type supernatural tactics",
      team: [
        { name: 'Dusknoir', id: 477, level: 52, types: ['ghost'] },
        { name: 'Chandelure', id: 609, level: 52, types: ['ghost', 'fire'] },
        { name: 'Polteageist', id: 855, level: 53, types: ['ghost'] },
        { name: 'Cursola', id: 864, level: 53, types: ['ghost'] },
        { name: 'Gengar', id: 94, level: 54, types: ['ghost', 'poison'] }
      ]
    },
    'Raihan': {
      quote: "I'm going to defeat the Champion and become the strongest!",
      strategy: "Dragon-type weather control",
      team: [
        { name: 'Flygon', id: 330, level: 53, types: ['ground', 'dragon'] },
        { name: 'Goodra', id: 706, level: 54, types: ['dragon'] },
        { name: 'Turtonator', id: 776, level: 54, types: ['fire', 'dragon'] },
        { name: 'Duraludon', id: 884, level: 55, types: ['steel', 'dragon'] }
      ]
    }
  };

  const championData: Record<string, MemberData> = {
    // Kanto
    'Blue': {
      quote: "Smell ya later!",
      strategy: "Balanced team with no weaknesses",
      team: [
        { name: 'Pidgeot', id: 18, level: 59, types: ['normal', 'flying'] },
        { name: 'Alakazam', id: 65, level: 57, types: ['psychic'] },
        { name: 'Rhydon', id: 112, level: 59, types: ['ground', 'rock'] },
        { name: 'Exeggutor', id: 103, level: 59, types: ['grass', 'psychic'] },
        { name: 'Gyarados', id: 130, level: 59, types: ['water', 'flying'] },
        { name: 'Charizard', id: 6, level: 61, types: ['fire', 'flying'] }
      ]
    },
    'Red': {
      quote: "...",
      strategy: "Legendary team from Mt. Silver",
      team: [
        { name: 'Pikachu', id: 25, level: 81, types: ['electric'] },
        { name: 'Espeon', id: 196, level: 73, types: ['psychic'] },
        { name: 'Snorlax', id: 143, level: 75, types: ['normal'] },
        { name: 'Venusaur', id: 3, level: 77, types: ['grass', 'poison'] },
        { name: 'Charizard', id: 6, level: 77, types: ['fire', 'flying'] },
        { name: 'Blastoise', id: 9, level: 77, types: ['water'] }
      ]
    },
    // Johto
    'Lance': {
      quote: "I've been waiting for you. I knew that you, with your skills, would eventually reach me here.",
      strategy: "Dragon mastery with fierce offense",
      team: [
        { name: 'Gyarados', id: 130, level: 44, types: ['water', 'flying'] },
        { name: 'Dragonite', id: 149, level: 47, types: ['dragon', 'flying'] },
        { name: 'Dragonite', id: 149, level: 47, types: ['dragon', 'flying'] },
        { name: 'Aerodactyl', id: 142, level: 46, types: ['rock', 'flying'] },
        { name: 'Charizard', id: 6, level: 46, types: ['fire', 'flying'] },
        { name: 'Dragonite', id: 149, level: 50, types: ['dragon', 'flying'] }
      ]
    },
    // Hoenn
    'Steven': {
      quote: "Tell me... What have you seen on your journey with your Pokémon? What have you felt, meeting so many other Trainers?",
      strategy: "Steel-type mastery with strategic balance",
      team: [
        { name: 'Skarmory', id: 227, level: 57, types: ['steel', 'flying'] },
        { name: 'Claydol', id: 344, level: 55, types: ['ground', 'psychic'] },
        { name: 'Aggron', id: 306, level: 56, types: ['steel', 'rock'] },
        { name: 'Cradily', id: 346, level: 56, types: ['rock', 'grass'] },
        { name: 'Armaldo', id: 348, level: 56, types: ['rock', 'bug'] },
        { name: 'Metagross', id: 376, level: 58, types: ['steel', 'psychic'] }
      ]
    },
    'Wallace': {
      quote: "There's something about you... A difference in your demeanor. I think I sense that in you.",
      strategy: "Water-type elegance with tactical control",
      team: [
        { name: 'Wailord', id: 321, level: 57, types: ['water'] },
        { name: 'Tentacruel', id: 73, level: 55, types: ['water', 'poison'] },
        { name: 'Ludicolo', id: 272, level: 56, types: ['water', 'grass'] },
        { name: 'Whiscash', id: 340, level: 56, types: ['water', 'ground'] },
        { name: 'Gyarados', id: 130, level: 56, types: ['water', 'flying'] },
        { name: 'Milotic', id: 350, level: 58, types: ['water'] }
      ]
    },
    // Sinnoh
    'Cynthia': {
      quote: "I won't lose to anyone! I'll fight you with everything I have!",
      strategy: "Perfect balance with no weaknesses",
      team: [
        { name: 'Spiritomb', id: 442, level: 61, types: ['ghost', 'dark'] },
        { name: 'Roserade', id: 407, level: 60, types: ['grass', 'poison'] },
        { name: 'Togekiss', id: 468, level: 60, types: ['fairy', 'flying'] },
        { name: 'Lucario', id: 448, level: 60, types: ['fighting', 'steel'] },
        { name: 'Milotic', id: 350, level: 58, types: ['water'] },
        { name: 'Garchomp', id: 445, level: 62, types: ['dragon', 'ground'] }
      ]
    },
    // Unova
    'Alder': {
      quote: "It's more important to be with the Pokémon you love than to be the strongest Trainer.",
      strategy: "Diverse team with unconventional choices",
      team: [
        { name: 'Accelgor', id: 617, level: 75, types: ['bug'] },
        { name: 'Bouffalant', id: 626, level: 75, types: ['normal'] },
        { name: 'Druddigon', id: 621, level: 75, types: ['dragon'] },
        { name: 'Vanilluxe', id: 584, level: 75, types: ['ice'] },
        { name: 'Escavalier', id: 589, level: 75, types: ['bug', 'steel'] },
        { name: 'Volcarona', id: 637, level: 77, types: ['bug', 'fire'] }
      ]
    },
    'Iris': {
      quote: "Know what? I really look forward to having serious battles with strong Trainers!",
      strategy: "Dragon mastery with raw power",
      team: [
        { name: 'Hydreigon', id: 635, level: 57, types: ['dark', 'dragon'] },
        { name: 'Druddigon', id: 621, level: 57, types: ['dragon'] },
        { name: 'Aggron', id: 306, level: 57, types: ['steel', 'rock'] },
        { name: 'Archeops', id: 567, level: 57, types: ['rock', 'flying'] },
        { name: 'Lapras', id: 131, level: 57, types: ['water', 'ice'] },
        { name: 'Haxorus', id: 612, level: 59, types: ['dragon'] }
      ]
    },
    // Kalos
    'Diantha': {
      quote: "Witnessing the noble spirits of you and your Pokémon in battle has really touched my heart.",
      strategy: "Graceful strategy with Mega Evolution",
      team: [
        { name: 'Hawlucha', id: 701, level: 64, types: ['fighting', 'flying'] },
        { name: 'Tyrantrum', id: 697, level: 65, types: ['rock', 'dragon'] },
        { name: 'Aurorus', id: 699, level: 65, types: ['rock', 'ice'] },
        { name: 'Gourgeist', id: 711, level: 65, types: ['ghost', 'grass'] },
        { name: 'Goodra', id: 706, level: 66, types: ['dragon'] },
        { name: 'Gardevoir', id: 282, level: 68, types: ['psychic', 'fairy'] }
      ]
    },
    // Alola
    'Kukui': {
      quote: "I wanted to battle against you when you were at full power!",
      strategy: "Full-power offensive with diverse types",
      team: [
        { name: 'Lycanroc', id: 745, level: 57, types: ['rock'] },
        { name: 'Snorlax', id: 143, level: 56, types: ['normal'] },
        { name: 'Braviary', id: 628, level: 56, types: ['normal', 'flying'] },
        { name: 'Magnezone', id: 462, level: 56, types: ['electric', 'steel'] },
        { name: 'Decidueye', id: 724, level: 58, types: ['grass', 'ghost'] },
        { name: 'Incineroar', id: 727, level: 58, types: ['fire', 'dark'] }
      ]
    },
    'Hau': {
      quote: "I want to be strong like you and Grandpa!",
      strategy: "Joyful battling with Alolan spirit",
      team: [
        { name: 'Raichu', id: 26, level: 63, types: ['electric', 'psychic'] },
        { name: 'Tauros', id: 128, level: 63, types: ['normal'] },
        { name: 'Crabominable', id: 740, level: 63, types: ['fighting', 'ice'] },
        { name: 'Noivern', id: 715, level: 63, types: ['flying', 'dragon'] },
        { name: 'Decidueye', id: 724, level: 63, types: ['grass', 'ghost'] },
        { name: 'Primarina', id: 730, level: 63, types: ['water', 'fairy'] }
      ]
    },
    // Galar
    'Leon': {
      quote: "Let's have the greatest battle ever!",
      strategy: "Unbeatable champion with Gigantamax power",
      team: [
        { name: 'Aegislash', id: 681, level: 62, types: ['steel', 'ghost'] },
        { name: 'Dragapult', id: 887, level: 62, types: ['dragon', 'ghost'] },
        { name: 'Haxorus', id: 612, level: 63, types: ['dragon'] },
        { name: 'Seismitoad', id: 537, level: 64, types: ['water', 'ground'] },
        { name: 'Rhyperior', id: 464, level: 64, types: ['ground', 'rock'] },
        { name: 'Charizard', id: 6, level: 65, types: ['fire', 'flying'] }
      ]
    },
    // Paldea
    'Geeta': {
      quote: "I am the Top Champion, and I'm about to show you what that means!",
      strategy: "Diverse team with strategic coverage",
      team: [
        { name: 'Espathra', id: 956, level: 61, types: ['psychic'] },
        { name: 'Avalugg', id: 713, level: 61, types: ['ice'] },
        { name: 'Gogoat', id: 673, level: 61, types: ['grass'] },
        { name: 'Veluza', id: 976, level: 61, types: ['water', 'psychic'] },
        { name: 'Kingambit', id: 983, level: 61, types: ['dark', 'steel'] },
        { name: 'Glimmora', id: 970, level: 62, types: ['rock', 'poison'] }
      ]
    },
    'Nemona': {
      quote: "Let's have the best battle ever!",
      strategy: "Aggressive offense with varied types",
      team: [
        { name: 'Lycanroc', id: 745, level: 65, types: ['rock'] },
        { name: 'Goodra', id: 706, level: 65, types: ['dragon'] },
        { name: 'Pawmot', id: 922, level: 65, types: ['electric', 'fighting'] },
        { name: 'Dudunsparce', id: 982, level: 65, types: ['normal'] },
        { name: 'Orthworm', id: 968, level: 65, types: ['steel'] },
        { name: 'Meowscarada', id: 908, level: 66, types: ['grass', 'dark'] }
      ]
    }
  };

  return (
    <div className="space-y-12">
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .will-change-transform { will-change: transform; }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 15s linear infinite;
        }
      `}</style>
      
      {/* Elite Four Grid */}
      <div className="grid grid-cols-1 min-420:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 min-420:gap-6 md:gap-8">
        {eliteFour.map((member, index) => {
          const memberData = eliteFourData[member.name];
          const weaknesses = (typeEffectiveness as any)[member.type]?.weakTo || [];
          
          return (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative h-[580px] cursor-pointer perspective-1000 transform hover:-translate-y-2 transition-transform duration-300"
              onClick={() => handleCardFlip(index)}
            >
              <div className={`relative w-full h-full transition-all duration-700 transform-style-preserve-3d ${
                flippedCards.has(index) ? 'rotate-y-180' : ''
              }`}>
                {/* Front of card - Enhanced Elite Four Design */}
                <div className="absolute inset-0 backface-hidden will-change-transform">
                  <div className={`relative h-full rounded-3xl overflow-hidden border border-gray-200/50 bg-gradient-to-br ${
                  member.type === 'ice' ? 'from-white to-cyan-50/70' :
                  member.type === 'fighting' ? 'from-white to-red-50/70' :
                  member.type === 'poison' ? 'from-white to-purple-50/70' :
                  member.type === 'ground' ? 'from-white to-amber-50/70' :
                  member.type === 'flying' ? 'from-white to-purple-100/70' :
                  member.type === 'psychic' ? 'from-white to-pink-50/70' :
                  member.type === 'bug' ? 'from-white to-lime-50/70' :
                  member.type === 'rock' ? 'from-white to-stone-50/70' :
                  member.type === 'ghost' ? 'from-white to-indigo-50/70' :
                  member.type === 'dragon' ? 'from-white to-purple-50/70' :
                  member.type === 'dark' ? 'from-white to-gray-100/70' :
                  member.type === 'steel' ? 'from-white to-slate-50/70' :
                  member.type === 'fire' ? 'from-white to-orange-50/70' :
                  member.type === 'water' ? 'from-white to-blue-50/70' :
                  member.type === 'grass' ? 'from-white to-green-50/70' :
                  member.type === 'electric' ? 'from-white to-yellow-50/70' :
                  member.type === 'fairy' ? 'from-white to-pink-50/70' :
                  member.type === 'normal' ? 'from-white to-gray-50/70' :
                  'from-white to-gray-50/70'
                }`} style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}>
                    {/* Subtle type-colored shimmer */}
                    <div className={`absolute inset-0 opacity-20 ${
                      member.type === 'ice' ? 'bg-gradient-to-br from-cyan-500/20 via-transparent to-blue-500/20' :
                      member.type === 'fighting' ? 'bg-gradient-to-br from-red-500/20 via-transparent to-orange-500/20' :
                      member.type === 'poison' ? 'bg-gradient-to-br from-purple-500/20 via-transparent to-pink-500/20' :
                      member.type === 'dragon' ? 'bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20' :
                      member.type === 'ghost' ? 'bg-gradient-to-br from-purple-600/20 via-transparent to-indigo-600/20' :
                      member.type === 'psychic' ? 'bg-gradient-to-br from-pink-500/20 via-transparent to-purple-500/20' :
                      'bg-gradient-to-br from-gray-500/20 via-transparent to-gray-600/20'
                    }`} />
                    {/* Elite Four Name at top - with gold gradient */}
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 text-center">
                      <div className="bg-white/70 backdrop-blur-md rounded-full px-6 py-2 shadow-2xl border-2 border-white/50">
                        <h2 className="elite-four-name text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-500 tracking-tight uppercase whitespace-nowrap">
                          {member.name}
                        </h2>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-800 font-semibold">
                          {member.type.charAt(0).toUpperCase() + member.type.slice(1)} Master
                        </p>
                        <p className="text-xs text-gray-700 font-medium">
                          Elite Four
                        </p>
                      </div>
                    </div>
                    
                    {/* Circular portrait container - Elite style with gold accents */}
                    <div className="absolute top-36 left-1/2 transform -translate-x-1/2">
                      {/* Type-colored circular glow behind portrait */}
                      <div 
                        className="absolute -top-8 -left-8 w-72 h-72 rounded-full opacity-25"
                        style={{
                          background: `radial-gradient(circle, ${
                            member.type === 'ice' ? '#06b6d4' :
                            member.type === 'fighting' ? '#ef4444' :
                            member.type === 'poison' ? '#a855f7' :
                            member.type === 'dragon' ? '#6366f1' :
                            member.type === 'ghost' ? '#7c3aed' :
                            member.type === 'psychic' ? '#ec4899' :
                            member.type === 'ground' ? '#f59e0b' :
                            member.type === 'flying' ? '#a78bfa' :
                            member.type === 'rock' ? '#92400e' :
                            member.type === 'steel' ? '#6b7280' :
                            member.type === 'fire' ? '#f97316' :
                            member.type === 'water' ? '#3b82f6' :
                            member.type === 'grass' ? '#22c55e' :
                            member.type === 'electric' ? '#eab308' :
                            '#9ca3af'
                          } 0%, transparent 70%)`,
                          filter: 'blur(40px)'
                        }}
                      />
                      <div className="relative w-60 h-60">
                        {/* Glass-style circle matching gym leaders */}
                        <div className="absolute inset-0 rounded-full bg-white/70 backdrop-blur-md shadow-2xl border-2 border-white/50 overflow-hidden">
                          {/* Elite Four image */}
                          <div className="absolute inset-0 flex items-center justify-center p-2">
                            <img
                              src={getEliteFourImage(member.name, 1)}
                              alt={member.name}
                              className="w-full h-full object-contain filter drop-shadow-2xl"
                              style={{ maxWidth: '90%', maxHeight: '90%', filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))' }}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-trainer.png'; }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Type and Rank Badges - bottom left, stacked */}
                    <div className="absolute bottom-5 left-5 z-40">
                      <div className="flex flex-col items-center gap-2">
                        {/* Type Badge on top */}
                        <div>
                          <TypeGradientBadge type={member.type} size="xs" gradient={true} />
                        </div>
                        {/* Elite Rank Badge below */}
                        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg px-3 py-2 shadow-lg border border-gray-700">
                          <div className="flex items-center gap-2">
                            <BsShieldFill className="text-yellow-400 text-base" />
                            <div>
                              <p className="text-white font-bold text-sm">Elite {index + 1}</p>
                              <p className="text-gray-400 text-xs">Rank</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ace Pokemon - watermark style bottom right (matching gym leaders) */}
                    {memberData && memberData.team && memberData.team.length > 0 && (() => {
                      // Find the ace Pokemon (highest level)
                      const ace = memberData.team.reduce((best, pokemon) => 
                        pokemon.level > best.level ? pokemon : best, 
                        memberData.team[0]
                      );
                      
                      return (
                        <div className="absolute bottom-2 -right-8 z-20">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${ace.id}.png`}
                            alt={ace.name}
                            className="w-48 h-48 object-contain opacity-30"
                            loading="lazy"
                            style={{ mixBlendMode: 'multiply' }}
                          />
                        </div>
                      );
                    })()}
                    
                    {/* Flip indicator - positioned below name to avoid overlap, matching gym leaders */}
                    <div className="absolute top-20 right-5 z-40">
                      <div className="w-10 h-10 bg-white/70 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border border-white/50">
                        <span className="text-gray-700 font-bold text-2xl flex items-center justify-center">›</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Back of card - All details */}
                <div className="absolute inset-0 rotate-y-180 backface-hidden">
                  <div className="relative h-full bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl overflow-hidden border border-gray-200/50 p-6" style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}>
                    {/* Glass morphism overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-purple-500/5 rounded-3xl" />
                    
                    <div className="relative z-10 h-full flex flex-col">
                      {/* Header */}
                      <div className="text-center mb-3">
                        <h3 className="elite-four-name text-2xl font-bold text-white">{member.name}</h3>
                        <p className="text-xs text-purple-200">Elite Four • {member.type.charAt(0).toUpperCase() + member.type.slice(1)} Master</p>
                      </div>
                      
                      {/* Quote */}
                      {memberData && (
                        <div className="mb-3 px-2">
                          <p className="text-xs italic text-purple-100 text-center">
                            "{memberData.quote}"
                          </p>
                        </div>
                      )}
                      
                      {/* Full Team Display with Names */}
                      {memberData && (
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-purple-200 text-center mb-2">
                            Team
                          </p>
                          <div className="grid grid-cols-3 gap-1.5">
                            {/* Show all 6 slots, fill with team or empty */}
                            {Array.from({ length: 6 }).map((_, idx) => {
                              const pokemon = memberData.team[idx];
                              const isAce = pokemon && pokemon.level === Math.max(...memberData.team.map(p => p.level));
                              
                              if (!pokemon) {
                                // Empty slot with pokeball icon
                                return (
                                  <div key={`empty-${idx}`} className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 border border-purple-400/20">
                                    <div className="w-10 h-10 mx-auto flex items-center justify-center">
                                      <svg className="w-8 h-8 opacity-30" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="50" cy="50" r="45" stroke="#C084FC" strokeWidth="4"/>
                                        <path d="M5 50h90" stroke="#C084FC" strokeWidth="4"/>
                                        <circle cx="50" cy="50" r="12" fill="#F3E8FF" stroke="#C084FC" strokeWidth="4"/>
                                        <circle cx="50" cy="50" r="6" fill="#C084FC"/>
                                      </svg>
                                    </div>
                                    <p className="text-[10px] text-center text-purple-300/40">
                                      Empty
                                    </p>
                                  </div>
                                );
                              }
                              return (
                                <div key={idx} className={`rounded-lg p-1.5 ${
                                  isAce 
                                    ? 'bg-gradient-to-br from-yellow-600/30 to-purple-800/30 border border-yellow-500/40' 
                                    : 'bg-purple-800/30 backdrop-blur-sm'
                                }`}>
                                  <img
                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                                    alt={pokemon.name}
                                    className="w-10 h-10 mx-auto object-contain"
                                  />
                                  <p className="text-[10px] text-center text-purple-100 font-medium truncate px-1">
                                    {pokemon.name}
                                  </p>
                                  <p className="text-[9px] text-center text-purple-200">
                                    Lv.{pokemon.level}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Strategy */}
                      {memberData && (
                        <div className="mt-3 text-center py-2 px-3 rounded-lg bg-purple-800/30 backdrop-blur-sm border border-purple-400/30">
                          <p className="text-[10px] font-semibold text-purple-200 mb-0.5">
                            Battle Strategy
                          </p>
                          <p className="text-xs text-purple-100">
                            {memberData.strategy}
                          </p>
                        </div>
                      )}
                      
                      {/* Weaknesses */}
                      <div className="text-center mt-3">
                        <p className="text-[10px] font-semibold text-purple-200 mb-1">
                          Weak Against
                        </p>
                        <div className="flex justify-center flex-wrap gap-1">
                          {weaknesses.slice(0, 3).map((type: string) => (
                            <TypeGradientBadge key={type} type={type} size="xs" gradient={true} />
                          ))}
                        </div>
                      </div>
                      
                      {/* Flip back indicator */}
                      <div className="mt-2 text-center">
                        <p className="text-[10px] text-purple-400 animate-pulse">
                          Click to flip back
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Champion Section */}
      {champion && (
        <div className="mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="relative"
          >
            <div className="relative">
                {/* Champion Card - Horizontal Layout for Maximum Impact */}
                <div className="relative h-[550px] bg-gradient-to-br from-white via-yellow-50/40 to-white rounded-3xl overflow-hidden border border-gray-200/50" style={{ boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25), 0 10px 25px -5px rgba(0, 0, 0, 0.15)' }}>
                  {/* Animated golden shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s ease-in-out infinite' }} />
                  <div className="flex h-full">
                    {/* Left side - Champion Portrait */}
                    <div className="relative w-1/3 flex flex-col items-center justify-center">
                      {/* Golden aura effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-transparent" />
                      
                      {/* Champion portrait circle */}
                      <div className="relative z-10">
                        <div className="relative w-72 h-72">
                          {/* Rotating golden ring */}
                          <div className="absolute inset-0 rounded-full border-4 border-yellow-500/30 animate-spin-slow" />
                          <div className="absolute inset-2 rounded-full border-4 border-yellow-400/20 animate-spin-slow-reverse" />
                          
                          {/* Glass circle with champion image */}
                          <div className="absolute inset-4 rounded-full bg-white/70 backdrop-blur-md shadow-2xl border-2 border-white/50 overflow-hidden">
                            <img
                              src={getChampionImage(champion.name, 1)}
                              alt={champion.name}
                              className="w-full h-full object-contain"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder-trainer.png'; }}
                            />
                          </div>
                        </div>
                        
                        {/* Champion Name and Title under portrait */}
                        <div className="mt-6 text-center">
                          <div className="bg-white/70 backdrop-blur-md rounded-full px-8 py-3 shadow-2xl border-2 border-white/50 inline-block">
                            <h3 className="champion-name text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-600">
                              {champion.name}
                            </h3>
                          </div>
                          <p className="text-base text-gray-700 font-medium mt-2">
                            Pokémon League Champion
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Champion Info */}
                    <div className="relative flex-1 p-10 flex flex-col">
                      {/* Top - Champion Team */}
                      {championData[champion.name] && (
                        <div className="flex-1 flex items-center">
                          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg w-full">
                            <p className="text-sm font-bold text-gray-600 mb-4 text-center uppercase tracking-wider">
                              Champion's Elite Team
                            </p>
                            <div className="grid grid-cols-6 gap-4">
                              {championData[champion.name].team.map((pokemon, idx) => (
                                <Link key={idx} href={`/pokedex/${pokemon.id}`}>
                                  <div className="text-center group cursor-pointer">
                                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50 shadow-md group-hover:border-yellow-400 group-hover:shadow-xl transition-all">
                                      <img
                                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                                        alt={pokemon.name}
                                        className="w-24 h-24 mx-auto object-contain filter drop-shadow-lg group-hover:scale-110 transition-transform"
                                      />
                                      <p className="text-xs text-gray-800 mt-2 font-bold group-hover:text-yellow-600">
                                        {pokemon.name}
                                      </p>
                                      <p className="text-xs text-gray-600 font-semibold">
                                        Lv.{pokemon.level}
                                      </p>
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Middle - Battle Strategy */}
                      {championData[champion.name] && (
                        <div className="mt-6">
                          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-lg">
                            <p className="text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider text-center">Battle Strategy</p>
                            <p className="text-sm text-gray-700 text-center">
                              {championData[champion.name].strategy}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Bottom - Quote */}
                      {championData[champion.name] && (
                        <div className="mt-6">
                          <p className="text-lg italic text-gray-600 text-center">
                            "{championData[champion.name].quote}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

export default EliteFourGrid;