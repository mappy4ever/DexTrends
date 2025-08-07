/**
 * Regional variant evolution mappings
 * Maps regional forms to their unique evolution chains
 */

interface RegionalEvolution {
  from: string;
  to: string;
  method: string;
  level?: number;
  item?: string;
}

export const REGIONAL_EVOLUTIONS: Record<string, RegionalEvolution[]> = {
  // Galarian Forms
  'meowth-galar': [{
    from: 'meowth-galar',
    to: 'perrserker',
    method: 'level-up',
    level: 28
  }],
  
  'ponyta-galar': [{
    from: 'ponyta-galar',
    to: 'rapidash-galar',
    method: 'level-up',
    level: 40
  }],
  
  'farfetchd-galar': [{
    from: 'farfetchd-galar',
    to: 'sirfetchd',
    method: 'level-up',
    // Note: Actually requires 3 critical hits in one battle
  }],
  
  'slowpoke-galar': [
    {
      from: 'slowpoke-galar',
      to: 'slowbro-galar',
      method: 'use-item',
      item: 'galarica-cuff'
    },
    {
      from: 'slowpoke-galar',
      to: 'slowking-galar',
      method: 'use-item',
      item: 'galarica-wreath'
    }
  ],
  
  'corsola-galar': [{
    from: 'corsola-galar',
    to: 'cursola',
    method: 'level-up',
    level: 38
  }],
  
  'zigzagoon-galar': [{
    from: 'zigzagoon-galar',
    to: 'linoone-galar',
    method: 'level-up',
    level: 20
  }],
  
  'linoone-galar': [{
    from: 'linoone-galar',
    to: 'obstagoon',
    method: 'level-up',
    level: 35
    // Note: Night time only
  }],
  
  'yamask-galar': [{
    from: 'yamask-galar',
    to: 'runerigus',
    method: 'level-up',
    // Note: Take 49+ damage and pass under stone sculpture in Wild Area
  }],
  
  'mr-mime-galar': [{
    from: 'mr-mime-galar',
    to: 'mr-rime',
    method: 'level-up',
    level: 42
  }],
  
  // Hisuian Forms
  'sneasel-hisui': [{
    from: 'sneasel-hisui',
    to: 'sneasler',
    method: 'level-up',
    // Note: Day time with Razor Claw
  }],
  
  'qwilfish-hisui': [{
    from: 'qwilfish-hisui',
    to: 'overqwil',
    method: 'level-up',
    // Note: Use Barb Barrage 20 times in Strong Style
  }],
  
  'basculin-white-striped': [{
    from: 'basculin-white-striped',
    to: 'basculegion',
    method: 'level-up',
    // Note: Take 294+ recoil damage
  }],
  
  // Alolan Forms
  'pikachu': [{
    from: 'pikachu',
    to: 'raichu-alola',
    method: 'use-item',
    item: 'thunder-stone'
    // Note: Only in Alola region
  }],
  
  'exeggcute': [{
    from: 'exeggcute',
    to: 'exeggutor-alola',
    method: 'use-item',
    item: 'leaf-stone'
    // Note: Only in Alola region
  }],
  
  'cubone': [{
    from: 'cubone',
    to: 'marowak-alola',
    method: 'level-up',
    level: 28
    // Note: Night time in Alola region
  }]
};

/**
 * Check if a Pokemon has a regional evolution
 */
export function hasRegionalEvolution(pokemonName: string): boolean {
  return pokemonName in REGIONAL_EVOLUTIONS;
}

/**
 * Get regional evolution data for a Pokemon
 */
export function getRegionalEvolution(pokemonName: string): RegionalEvolution[] | null {
  return REGIONAL_EVOLUTIONS[pokemonName] || null;
}

/**
 * Check if this is a regional evolution (evolved from a regional form)
 */
export function isRegionalEvolution(pokemonName: string): boolean {
  const regionalEvos = [
    'perrserker', 'rapidash-galar', 'sirfetchd', 'slowbro-galar', 'slowking-galar',
    'cursola', 'linoone-galar', 'obstagoon', 'runerigus', 'mr-rime',
    'sneasler', 'overqwil', 'basculegion', 'raichu-alola', 'exeggutor-alola', 'marowak-alola'
  ];
  
  return regionalEvos.includes(pokemonName);
}