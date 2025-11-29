import { 
  FaShieldAlt, 
  FaHeart, 
  FaBrain, 
  FaBalanceScale, 
  FaStar
} from 'react-icons/fa';
import { GiSwordWound, GiSparkles, GiShield } from 'react-icons/gi';
import { MdCatchingPokemon } from 'react-icons/md';
import type { FormatInfo, TierInfo, RoleInfo } from './types';

// Format descriptions
export const FORMAT_INFO: Record<string, FormatInfo> = {
  standard: {
    name: 'Standard Formats',
    description: 'Current generation competitive formats',
    icon: MdCatchingPokemon,
    color: 'from-blue-500 to-purple-600'
  },
  nationalDex: {
    name: 'National Dex',
    description: 'All Pokémon and mechanics from every generation',
    icon: MdCatchingPokemon,
    color: 'from-teal-500 to-blue-600'
  },
  otherFormats: {
    name: 'Other Formats',
    description: 'Special rulesets and alternative formats',
    icon: MdCatchingPokemon,
    color: 'from-orange-500 to-pink-600'
  }
};

// Complete tier descriptions including all formats
export const TIER_INFO: Record<string, TierInfo> = {
  // Anything Goes
  'AG': {
    description: 'Anything Goes - No restrictions, all Pokemon and strategies allowed',
    color: 'from-black to-stone-800'
  },
  
  // Singles Tiers
  'Uber': { 
    description: 'Most powerful Pokémon, often legendary/mythical. Banned from standard play',
    color: 'from-purple-600 to-pink-600'
  },
  'OU': { 
    description: 'OverUsed - Top tier competitive Pokémon seen in most teams',
    color: 'from-blue-600 to-purple-600'
  },
  'UUBL': { 
    description: 'UU Banlist - Too strong for UU but not used enough for OU',
    color: 'from-blue-500 to-blue-600'
  },
  'UU': { 
    description: 'UnderUsed - Strong Pokémon that see less usage than OU',
    color: 'from-green-600 to-blue-600'
  },
  'RUBL': { 
    description: 'RU Banlist - Too strong for RU but not used enough for UU',
    color: 'from-green-500 to-green-600'
  },
  'RU': { 
    description: 'RarelyUsed - Viable Pokémon with niche roles',
    color: 'from-yellow-600 to-green-600'
  },
  'NUBL': { 
    description: 'NU Banlist - Too strong for NU but not used enough for RU',
    color: 'from-yellow-500 to-yellow-600'
  },
  'NU': { 
    description: 'NeverUsed - Lower tier but still competitively viable',
    color: 'from-orange-600 to-yellow-600'
  },
  'PUBL': { 
    description: 'PU Banlist - Too strong for PU but not used enough for NU',
    color: 'from-orange-500 to-orange-600'
  },
  'PU': { 
    description: 'Lowest official tier, requires specific strategies',
    color: 'from-red-600 to-orange-600'
  },
  'ZU': { 
    description: 'Zero Used - Unofficial tier below PU',
    color: 'from-red-700 to-red-600'
  },
  
  // Special Formats
  'LC': { 
    description: 'Little Cup - Only unevolved Pokémon at Level 5',
    color: 'from-pink-600 to-purple-600'
  },
  'LC Uber': { 
    description: 'Little Cup Uber - Banned from Little Cup for being too strong',
    color: 'from-pink-700 to-pink-600'
  },
  'NFE': {
    description: 'Not Fully Evolved - Can still evolve further',
    color: 'from-stone-600 to-stone-500'
  },
  
  // Doubles Tiers (shown without D prefix in UI)
  'DOU': { 
    description: 'OverUsed - Top tier in 2v2 format',
    color: 'from-indigo-600 to-purple-600'
  },
  'DUU': { 
    description: 'UnderUsed - Below OU in usage',
    color: 'from-indigo-500 to-indigo-600'
  },
  'DNU': { 
    description: 'NeverUsed - Lower tier format',
    color: 'from-indigo-400 to-indigo-500'
  },
  
  // National Dex Tiers
  'ND': { 
    description: 'National Dex - Includes all Pokémon from all generations',
    color: 'from-teal-600 to-blue-600'
  },
  'ND UU': { 
    description: 'National Dex UnderUsed',
    color: 'from-teal-500 to-teal-600'
  },
  'ND RU': { 
    description: 'National Dex RarelyUsed',
    color: 'from-teal-400 to-teal-500'
  },
  
  'Untiered': {
    description: 'Not ranked in any competitive tier',
    color: 'from-stone-600 to-stone-500'
  },
  
  // Special Status Tiers
  'Illegal': {
    description: 'Not obtainable or usable in this generation/format',
    color: 'from-stone-800 to-stone-700'
  },
  'Unreleased': {
    description: 'Not yet released but exists in game data',
    color: 'from-stone-700 to-stone-600'
  }
};

// Role descriptions for movesets
export const ROLE_INFO: Record<string, RoleInfo> = {
  'Physical Sweeper': {
    description: 'High Attack and Speed, designed to KO opponents quickly',
    icon: GiSwordWound,
    color: 'text-red-400'
  },
  'Special Sweeper': {
    description: 'High Special Attack and Speed, uses special moves',
    icon: GiSparkles,
    color: 'text-purple-400'
  },
  'Bulky Pivot': {
    description: 'High defenses, switches in to take hits and pivot to teammates',
    icon: GiShield,
    color: 'text-blue-400'
  },
  'Wall': {
    description: 'Extremely high defenses, stalls opponents',
    icon: FaShieldAlt,
    color: 'text-stone-400'
  },
  'Support': {
    description: 'Sets up entry hazards, status, or team support',
    icon: FaHeart,
    color: 'text-pink-400'
  },
  'Setup Sweeper': {
    description: 'Uses stat-boosting moves before sweeping',
    icon: FaBrain,
    color: 'text-yellow-400'
  },
  'Mixed Attacker': {
    description: 'Uses both physical and special attacks',
    icon: FaBalanceScale,
    color: 'text-green-400'
  },
  'Mega Sweeper': {
    description: 'Mega Evolution focused on offense',
    icon: FaStar,
    color: 'text-orange-400'
  }
};

// Sample data for fallback
export const SAMPLE_MOVESETS = [
  {
    name: 'Physical Sweeper',
    usage: 45.3,
    item: 'Life Orb',
    ability: 'Intimidate',
    nature: 'Adamant',
    evs: { hp: 0, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 4, speed: 252 },
    moves: ['Dragon Dance', 'Earthquake', 'Ice Fang', 'Waterfall']
  },
  {
    name: 'Bulky Pivot',
    usage: 32.7,
    item: 'Leftovers',
    ability: 'Intimidate',
    nature: 'Impish',
    evs: { hp: 248, attack: 8, defense: 252, 'special-attack': 0, 'special-defense': 0, speed: 0 },
    moves: ['Stealth Rock', 'Earthquake', 'Ice Fang', 'Roar']
  },
  {
    name: 'Mega Sweeper',
    usage: 22.0,
    item: 'Gyaradosite',
    ability: 'Mold Breaker',
    nature: 'Jolly',
    evs: { hp: 0, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 4, speed: 252 },
    moves: ['Dragon Dance', 'Crunch', 'Ice Fang', 'Waterfall']
  }
];

// Format-specific usage and win rate data
export const FORMAT_STATS = {
  standard: {
    singles: { usage: 4.5, winRate: 48.7 },
    doubles: { usage: 2.1, winRate: 51.2 }
  },
  nationalDex: {
    usage: 3.8,
    winRate: 49.3
  },
  otherFormats: {
    littleCup: { usage: 0, winRate: 0 },
    monotype: { usage: 5.2, winRate: 52.1 },
    vgc: { usage: 3.1, winRate: 50.8 }
  }
};

export const COMMON_TEAMMATES = [
  { name: 'Ferrothorn', usage: 42.1 },
  { name: 'Landorus-Therian', usage: 38.7 },
  { name: 'Tapu Koko', usage: 35.2 },
  { name: 'Heatran', usage: 31.9 },
  { name: 'Toxapex', usage: 28.4 }
];

export const COUNTERS = [
  { name: 'Tapu Koko', winRate: 78.3 },
  { name: 'Rotom-Wash', winRate: 71.2 },
  { name: 'Ferrothorn', winRate: 68.9 },
  { name: 'Zapdos', winRate: 66.4 },
  { name: 'Tangrowth', winRate: 63.7 }
];