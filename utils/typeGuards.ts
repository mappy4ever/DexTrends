// Type guard utilities for handling unknown types safely
// Used to fix TS18046 'unknown' type errors throughout the application

// === Basic Type Guards ===

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function hasProperty<T extends string>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> {
  return isObject(obj) && prop in obj;
}

// === Error Type Guards ===

export function isError(value: unknown): value is Error {
  return value instanceof Error || (
    isObject(value) && 
    hasProperty(value, 'message') && 
    isString(value.message)
  );
}

export function isErrorWithStack(value: unknown): value is Error & { stack: string } {
  return isError(value) && hasProperty(value, 'stack') && isString(value.stack);
}

export function isApiError(value: unknown): value is { message: string; status?: number; code?: string } {
  return isObject(value) && 
    hasProperty(value, 'message') && 
    isString(value.message);
}

// === TCG/Pokemon Type Guards ===

export function isTCGSet(value: unknown): value is {
  id: string;
  name: string;
  series?: string;
  printedTotal?: number;
  total?: number;
  legalities?: Record<string, string>;
  ptcgoCode?: string;
  releaseDate?: string;
  updatedAt?: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
} {
  return isObject(value) &&
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'name') && isString(value.name);
}

export function isTCGCard(value: unknown): value is {
  id: string;
  name: string;
  supertype?: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  rules?: string[];
  attacks?: Array<{
    name: string;
    cost?: string[];
    convertedEnergyCost?: number;
    damage?: string;
    text?: string;
  }>;
  weaknesses?: Array<{
    type: string;
    value: string;
  }>;
  resistances?: Array<{
    type: string;
    value: string;
  }>;
  retreatCost?: string[];
  convertedRetreatCost?: number;
  set?: {
    id: string;
    name: string;
    series?: string;
    printedTotal?: number;
    total?: number;
    legalities?: Record<string, string>;
    ptcgoCode?: string;
    releaseDate?: string;
    updatedAt?: string;
    images?: {
      symbol?: string;
      logo?: string;
    };
  };
  number?: string;
  artist?: string;
  rarity?: string;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities?: Record<string, string>;
  images?: {
    small?: string;
    large?: string;
  };
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: Record<string, {
      low?: number;
      mid?: number;
      high?: number;
      market?: number;
      directLow?: number;
    }>;
  };
  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      germanProLow?: number;
      suggestedPrice?: number;
      reverseHoloSell?: number;
      reverseHoloLow?: number;
      reverseHoloTrend?: number;
      lowPriceExPlus?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
      reverseHoloAvg1?: number;
      reverseHoloAvg7?: number;
      reverseHoloAvg30?: number;
    };
  };
} {
  return isObject(value) &&
    hasProperty(value, 'id') && isString(value.id) &&
    hasProperty(value, 'name') && isString(value.name);
}

export function isPokemon(value: unknown): value is {
  id: number;
  name: string;
  height?: number;
  weight?: number;
  base_experience?: number;
  order?: number;
  is_default?: boolean;
  location_area_encounters?: string;
  sprites?: {
    front_default?: string;
    front_shiny?: string;
    front_female?: string;
    front_shiny_female?: string;
    back_default?: string;
    back_shiny?: string;
    back_female?: string;
    back_shiny_female?: string;
    other?: {
      dream_world?: {
        front_default?: string;
        front_female?: string;
      };
      home?: {
        front_default?: string;
        front_female?: string;
        front_shiny?: string;
        front_shiny_female?: string;
      };
      'official-artwork'?: {
        front_default?: string;
        front_shiny?: string;
      };
    };
  };
  abilities?: Array<{
    is_hidden: boolean;
    slot: number;
    ability: {
      name: string;
      url: string;
    };
  }>;
  forms?: Array<{
    name: string;
    url: string;
  }>;
  game_indices?: Array<{
    game_index: number;
    version: {
      name: string;
      url: string;
    };
  }>;
  held_items?: Array<{
    item: {
      name: string;
      url: string;
    };
    version_details: Array<{
      rarity: number;
      version: {
        name: string;
        url: string;
      };
    }>;
  }>;
  moves?: Array<{
    move: {
      name: string;
      url: string;
    };
    version_group_details: Array<{
      level_learned_at: number;
      version_group: {
        name: string;
        url: string;
      };
      move_learn_method: {
        name: string;
        url: string;
      };
    }>;
  }>;
  species?: {
    name: string;
    url: string;
  };
  stats?: Array<{
    base_stat: number;
    effort: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  types?: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  past_types?: Array<{
    generation: {
      name: string;
      url: string;
    };
    types: Array<{
      slot: number;
      type: {
        name: string;
        url: string;
      };
    }>;
  }>;
} {
  return isObject(value) &&
    hasProperty(value, 'id') && isNumber(value.id) &&
    hasProperty(value, 'name') && isString(value.name);
}

export function isMove(value: unknown): value is {
  id: number;
  name: string;
  accuracy?: number;
  effect_chance?: number;
  pp?: number;
  priority?: number;
  power?: number;
  damage_class?: {
    name: string;
    url: string;
  };
  effect_entries?: Array<{
    effect: string;
    short_effect: string;
    language: {
      name: string;
      url: string;
    };
  }>;
  effect_changes?: Array<{
    effect_entries: Array<{
      effect: string;
      language: {
        name: string;
        url: string;
      };
    }>;
    version_group: {
      name: string;
      url: string;
    };
  }>;
  learned_by_pokemon?: Array<{
    name: string;
    url: string;
  }>;
  flavor_text_entries?: Array<{
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }>;
  generation?: {
    name: string;
    url: string;
  };
  machines?: Array<{
    machine: {
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }>;
  meta?: {
    ailment: {
      name: string;
      url: string;
    };
    category: {
      name: string;
      url: string;
    };
    min_hits?: number;
    max_hits?: number;
    min_turns?: number;
    max_turns?: number;
    drain: number;
    healing: number;
    crit_rate: number;
    ailment_chance: number;
    flinch_chance: number;
    stat_chance: number;
  };
  names?: Array<{
    name: string;
    language: {
      name: string;
      url: string;
    };
  }>;
  past_values?: Array<{
    accuracy?: number;
    effect_chance?: number;
    power?: number;
    pp?: number;
    effect_entries: Array<{
      effect: string;
      short_effect: string;
      language: {
        name: string;
        url: string;
      };
    }>;
    type?: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }>;
  stat_changes?: Array<{
    change: number;
    stat: {
      name: string;
      url: string;
    };
  }>;
  super_contest_effect?: {
    url: string;
  };
  target?: {
    name: string;
    url: string;
  };
  type?: {
    name: string;
    url: string;
  };
} {
  return isObject(value) &&
    hasProperty(value, 'id') && isNumber(value.id) &&
    hasProperty(value, 'name') && isString(value.name);
}

// === Event Type Guards ===

export function isMouseEvent(value: unknown): value is MouseEvent {
  return value instanceof MouseEvent;
}

export function isKeyboardEvent(value: unknown): value is KeyboardEvent {
  return value instanceof KeyboardEvent;
}

export function isHTMLElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}

export function isHTMLInputElement(value: unknown): value is HTMLInputElement {
  return value instanceof HTMLInputElement;
}

// === API Response Type Guards ===

export function isApiResponse<T>(
  value: unknown,
  dataValidator: (data: unknown) => data is T
): value is { data: T; success: boolean; message?: string } {
  return isObject(value) &&
    hasProperty(value, 'data') &&
    dataValidator(value.data) &&
    hasProperty(value, 'success') &&
    isBoolean(value.success);
}

export function isPaginatedResponse<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T
): value is {
  data: T[];
  page: number;
  totalPages: number;
  totalCount: number;
  hasMore: boolean;
} {
  return isObject(value) &&
    hasProperty(value, 'data') && isArray(value.data) &&
    value.data.every(itemValidator) &&
    hasProperty(value, 'page') && isNumber(value.page) &&
    hasProperty(value, 'totalPages') && isNumber(value.totalPages) &&
    hasProperty(value, 'totalCount') && isNumber(value.totalCount) &&
    hasProperty(value, 'hasMore') && isBoolean(value.hasMore);
}

// === Utility Functions for Safe Access ===

export function safeGet<T>(obj: unknown, path: string[], defaultValue: T): T {
  try {
    let current = obj;
    for (const key of path) {
      if (!isObject(current) || !hasProperty(current, key)) {
        return defaultValue;
      }
      current = current[key];
    }
    return current as T;
  } catch {
    return defaultValue;
  }
}

export function safeStringify(value: unknown): string {
  try {
    if (isString(value)) return value;
    if (isNumber(value)) return value.toString();
    if (isBoolean(value)) return value.toString();
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    return JSON.stringify(value);
  } catch {
    return '[Unable to stringify]';
  }
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (isString(error)) {
    return error;
  }
  if (isObject(error) && hasProperty(error, 'message') && isString(error.message)) {
    return error.message;
  }
  return 'An unknown error occurred';
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${safeStringify(value)}`);
}