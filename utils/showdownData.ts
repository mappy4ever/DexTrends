// Utility functions for fetching and parsing Pokemon Showdown data

import logger from './logger';

export interface ShowdownItem {
  num: number;
  name: string;
  spritenum?: number;
  gen?: number;
  desc?: string;
  shortDesc?: string;
  fling?: {
    basePower?: number;
    status?: string;
    volatileStatus?: string;
  };
  isChoice?: boolean;
  isNonstandard?: boolean | string;
  boosts?: Record<string, number>;
  megaStone?: string;
  megaEvolves?: string;
  itemUser?: string[];
  zMove?: boolean | string;
  zMoveType?: string;
  zMoveFrom?: string;
  onTakeItem?: boolean | string;
}

export interface ShowdownAbility {
  num: number;
  name: string;
  rating?: number;
  desc?: string;
  shortDesc?: string;
  flags?: Record<string, number>;
}

const SHOWDOWN_BASE_URL = 'https://play.pokemonshowdown.com/data';
const SHOWDOWN_SPRITES_URL = 'https://play.pokemonshowdown.com/sprites';

// Cache for fetched data
let itemsCache: Record<string, ShowdownItem> | null = null;
let abilitiesCache: Record<string, ShowdownAbility> | null = null;

export async function fetchShowdownItems(): Promise<Record<string, ShowdownItem>> {
  if (itemsCache) {
    return itemsCache;
  }

  try {
    const response = await fetch(`${SHOWDOWN_BASE_URL}/items.js`);
    const text = await response.text();
    
    // Parse the JavaScript file more safely
    // The file exports to exports.BattleItems
    let items: Record<string, ShowdownItem> = {};
    
    try {
      // Try using Function constructor (works in Node.js)
      const sandbox: any = { exports: {} };
      const func = new Function('exports', `${text}; return exports.BattleItems;`);
      items = func(sandbox.exports);
    } catch (funcError) {
      // Fallback: Parse using regex if Function constructor is blocked (CSP)
      // Extract the object literal from exports.BattleItems = {...}
      const match = text.match(/exports\.BattleItems\s*=\s*({[\s\S]*});?\s*$/);
      if (match && match[1]) {
        // Use eval as last resort (still safer than raw eval since we control the source)
        try {
          items = eval('(' + match[1] + ')');
        } catch (evalError) {
          logger.warn('Failed to parse items data:', { error: evalError });
          return {};
        }
      }
    }
    
    itemsCache = items;
    return items;
  } catch (error) {
    logger.warn('Failed to fetch Showdown items:', { error });
    return {};
  }
}

export async function fetchShowdownAbilities(): Promise<Record<string, ShowdownAbility>> {
  if (abilitiesCache) {
    return abilitiesCache;
  }

  try {
    const response = await fetch(`${SHOWDOWN_BASE_URL}/abilities.js`);
    const text = await response.text();
    
    // Parse the JavaScript file more safely
    let abilities: Record<string, ShowdownAbility> = {};
    
    try {
      // Try using Function constructor (works in Node.js)
      const sandbox: any = { exports: {} };
      const func = new Function('exports', `${text}; return exports.BattleAbilities;`);
      abilities = func(sandbox.exports);
    } catch (funcError) {
      // Fallback: Parse using regex if Function constructor is blocked (CSP)
      const match = text.match(/exports\.BattleAbilities\s*=\s*({[\s\S]*});?\s*$/);
      if (match && match[1]) {
        try {
          abilities = eval('(' + match[1] + ')');
        } catch (evalError) {
          logger.warn('Failed to parse abilities data:', { error: evalError });
          return {};
        }
      }
    }
    
    abilitiesCache = abilities;
    return abilities;
  } catch (error) {
    logger.warn('Failed to fetch Showdown abilities:', { error });
    return {};
  }
}

export function getItemSpriteUrl(itemName: string): string {
  // Convert item name to sprite filename format
  const spriteName = itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Try multiple sprite sources in order of preference
  // First try Showdown's item icons
  const showdownUrl = `${SHOWDOWN_SPRITES_URL}/itemicons/${spriteName}.png`;
  
  // If that fails, the component will try PokeAPI sprites as fallback
  return showdownUrl;
}

export function getItemCategory(itemName: string, itemData: ShowdownItem): string {
  const name = itemName.toLowerCase();
  
  // Berries
  if (name.includes('berry')) return 'berries';
  
  // Medicine/healing items
  if (name.includes('potion') || name.includes('heal') || name.includes('restore') || 
      name.includes('revive') || name.includes('antidote') || name.includes('cure') ||
      name.includes('elixir') || name.includes('ether')) return 'medicine';
  
  // Evolution items
  if (name.includes('stone') || name.includes('scale') || name.includes('claw') ||
      name.includes('fang') || name.includes('crown') || itemData.itemUser) return 'evolution';
  
  // Battle items
  if (name.includes('x ') || name.includes('guard') || name.includes('dire hit')) return 'battle';
  
  // Held items (most competitive items)
  if (itemData.fling || itemData.boosts || itemData.isChoice ||
      name.includes('orb') || name.includes('band') || name.includes('specs') ||
      name.includes('scarf') || name.includes('lens') || name.includes('focus') ||
      name.includes('sash') || name.includes('belt') || name.includes('vest')) return 'holdable';
  
  // Treasures
  if (name.includes('nugget') || name.includes('pearl') || name.includes('shard') ||
      name.includes('star') || name.includes('comet')) return 'treasures';
  
  // Pokeballs
  if (name.includes('ball') && !name.includes('orb')) return 'pokeballs';
  
  // TMs
  if (name.startsWith('tm') || name.startsWith('tr')) return 'machines';
  
  // Mega Stones
  if (itemData.megaStone || name.includes('ite') && name !== 'eviolite') return 'mega-stones';
  
  // Z-Crystals
  if (itemData.zMove || name.includes('ium z') || name.endsWith(' z')) return 'z-crystals';
  
  // Key items
  if (itemData.isNonstandard || name.includes('key') || name.includes('card')) return 'key-items';
  
  return 'misc';
}