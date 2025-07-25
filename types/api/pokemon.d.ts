// Pokemon API type definitions

export interface Pokemon {
  id: number | string;
  name: string;
  height?: number;
  weight?: number;
  base_experience?: number;
  order?: number;
  is_default?: boolean;
  sprites?: PokemonSprites;
  types?: PokemonType[];
  abilities?: PokemonAbility[];
  stats?: PokemonStat[];
  moves?: PokemonMove[];
  species?: {
    name: string;
    url: string;
  };
  forms?: PokemonForm[];
  game_indices?: GameIndex[];
  held_items?: HeldItem[];
  location_area_encounters?: string;
  past_types?: PastType[];
}

export interface PokemonSprites {
  front_default?: string | null;
  front_shiny?: string | null;
  front_female?: string | null;
  front_shiny_female?: string | null;
  back_default?: string | null;
  back_shiny?: string | null;
  back_female?: string | null;
  back_shiny_female?: string | null;
  other?: {
    dream_world?: {
      front_default?: string | null;
      front_female?: string | null;
    };
    home?: {
      front_default?: string | null;
      front_shiny?: string | null;
      front_female?: string | null;
      front_shiny_female?: string | null;
    };
    'official-artwork'?: {
      front_default?: string | null;
      front_shiny?: string | null;
    };
    showdown?: {
      front_default?: string | null;
      front_shiny?: string | null;
      back_default?: string | null;
      back_shiny?: string | null;
    };
  };
  versions?: Record<string, Record<string, PokemonSprites>>;
}

export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonMove {
  move: {
    name: string;
    url: string;
  };
  version_group_details: VersionGroupDetail[];
}

export interface VersionGroupDetail {
  level_learned_at: number;
  move_learn_method: {
    name: string;
    url: string;
  };
  version_group: {
    name: string;
    url: string;
  };
}

export interface PokemonForm {
  name: string;
  url: string;
}

export interface GameIndex {
  game_index: number;
  version: {
    name: string;
    url: string;
  };
}

export interface HeldItem {
  item: {
    name: string;
    url: string;
  };
  version_details: {
    rarity: number;
    version: {
      name: string;
      url: string;
    };
  }[];
}

export interface PastType {
  generation: {
    name: string;
    url: string;
  };
  types: PokemonType[];
}

// Evolution chain types
export interface EvolutionChain {
  id: number;
  baby_trigger_item?: {
    name: string;
    url: string;
  } | null;
  chain: EvolutionLink;
}

export interface EvolutionLink {
  evolution_details: EvolutionDetail[];
  evolves_to: EvolutionLink[];
  is_baby: boolean;
  species: {
    name: string;
    url: string;
  };
}

export interface EvolutionDetail {
  gender?: number | null;
  held_item?: {
    name: string;
    url: string;
  } | null;
  item?: {
    name: string;
    url: string;
  } | null;
  known_move?: {
    name: string;
    url: string;
  } | null;
  known_move_type?: {
    name: string;
    url: string;
  } | null;
  location?: {
    name: string;
    url: string;
  } | null;
  min_affection?: number | null;
  min_beauty?: number | null;
  min_happiness?: number | null;
  min_level?: number | null;
  needs_overworld_rain: boolean;
  party_species?: {
    name: string;
    url: string;
  } | null;
  party_type?: {
    name: string;
    url: string;
  } | null;
  relative_physical_stats?: number | null;
  time_of_day: string;
  trade_species?: {
    name: string;
    url: string;
  } | null;
  trigger: {
    name: string;
    url: string;
  };
  turn_upside_down: boolean;
}

// Pokemon species types
export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: {
    name: string;
    url: string;
  };
  pokedex_numbers: {
    entry_number: number;
    pokedex: {
      name: string;
      url: string;
    };
  }[];
  egg_groups: {
    name: string;
    url: string;
  }[];
  color: {
    name: string;
    url: string;
  };
  shape: {
    name: string;
    url: string;
  };
  evolves_from_species?: {
    name: string;
    url: string;
  } | null;
  evolution_chain: {
    url: string;
  };
  habitat?: {
    name: string;
    url: string;
  } | null;
  generation: {
    name: string;
    url: string;
  };
  names: {
    name: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version: {
      name: string;
      url: string;
    };
  }[];
  form_descriptions: {
    description: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  genera: {
    genus: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  varieties: {
    is_default: boolean;
    pokemon: {
      name: string;
      url: string;
    };
  }[];
}

// Simplified Pokemon type for list displays
export interface SimplePokemon {
  id: number | string;
  name: string;
  types?: string[];
  sprite?: string;
  generation?: number;
}

// Pokemon list response
export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

// Nature interface
export interface Nature {
  id: number;
  name: string;
  decreased_stat: {
    name: string;
    url: string;
  } | null;
  increased_stat: {
    name: string;
    url: string;
  } | null;
  hates_flavor: {
    name: string;
    url: string;
  } | null;
  likes_flavor: {
    name: string;
    url: string;
  } | null;
  pokeathlon_stat_changes: {
    max_change: number;
    pokeathlon_stat: {
      name: string;
      url: string;
    };
  }[];
  move_battle_style_preferences: {
    low_hp_preference: number;
    high_hp_preference: number;
    move_battle_style: {
      name: string;
      url: string;
    };
  }[];
  names: {
    name: string;
    language: {
      name: string;
      url: string;
    };
  }[];
}

// Move interface
export interface Move {
  id: number;
  name: string;
  accuracy: number | null;
  effect_chance: number | null;
  pp: number;
  priority: number;
  power: number | null;
  contest_combos: {
    normal: {
      use_before: {
        name: string;
        url: string;
      }[] | null;
      use_after: {
        name: string;
        url: string;
      }[] | null;
    };
    super: {
      use_before: {
        name: string;
        url: string;
      }[] | null;
      use_after: {
        name: string;
        url: string;
      }[] | null;
    };
  } | null;
  contest_type: {
    name: string;
    url: string;
  } | null;
  contest_effect: {
    url: string;
  } | null;
  damage_class: {
    name: string;
    url: string;
  };
  effect_entries: {
    effect: string;
    short_effect: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  effect_changes: any[];
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }[];
  generation: {
    name: string;
    url: string;
  };
  machines: any[];
  meta: {
    ailment: {
      name: string;
      url: string;
    };
    category: {
      name: string;
      url: string;
    };
    min_hits: number | null;
    max_hits: number | null;
    min_turns: number | null;
    max_turns: number | null;
    drain: number;
    healing: number;
    crit_rate: number;
    ailment_chance: number;
    flinch_chance: number;
    stat_chance: number;
  } | null;
  names: {
    name: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  past_values: any[];
  stat_changes: {
    change: number;
    stat: {
      name: string;
      url: string;
    };
  }[];
  super_contest_effect: {
    url: string;
  } | null;
  target: {
    name: string;
    url: string;
  };
  type: {
    name: string;
    url: string;
  };
  learned_by_pokemon: {
    name: string;
    url: string;
  }[];
}

// Ability API response type
export interface AbilityData {
  id: number;
  name: string;
  is_main_series: boolean;
  generation: {
    name: string;
    url: string;
  };
  names: {
    name: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  effect_entries: {
    effect: string;
    short_effect: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  effect_changes: any[];
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }[];
  pokemon: {
    is_hidden: boolean;
    slot: number;
    pokemon: {
      name: string;
      url: string;
    };
  }[];
}

// Type info API response
export interface TypeInfo {
  id: number;
  name: string;
  damage_relations: {
    no_damage_to: Array<{ name: string; url: string }>;
    half_damage_to: Array<{ name: string; url: string }>;
    double_damage_to: Array<{ name: string; url: string }>;
    no_damage_from: Array<{ name: string; url: string }>;
    half_damage_from: Array<{ name: string; url: string }>;
    double_damage_from: Array<{ name: string; url: string }>;
  };
  past_damage_relations: any[];
  game_indices: {
    game_index: number;
    generation: {
      name: string;
      url: string;
    };
  }[];
  generation: {
    name: string;
    url: string;
  };
  move_damage_class: {
    name: string;
    url: string;
  } | null;
  names: {
    name: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  pokemon: {
    slot: number;
    pokemon: {
      name: string;
      url: string;
    };
  }[];
  moves: {
    name: string;
    url: string;
  }[];
}

// Item API response type
export interface ItemData {
  id: number;
  name: string;
  cost: number;
  fling_power: number | null;
  fling_effect: {
    name: string;
    url: string;
  } | null;
  attributes: {
    name: string;
    url: string;
  }[];
  category: {
    name: string;
    url: string;
  };
  effect_entries: {
    effect: string;
    short_effect: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  flavor_text_entries: {
    text: string;
    language: {
      name: string;
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }[];
  game_indices: {
    game_index: number;
    generation: {
      name: string;
      url: string;
    };
  }[];
  names: {
    name: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  sprites: {
    default: string | null;
  };
  held_by_pokemon: {
    pokemon: {
      name: string;
      url: string;
    };
    version_details: {
      rarity: number;
      version: {
        name: string;
        url: string;
      };
    }[];
  }[];
  baby_trigger_for: {
    url: string;
  } | null;
}

// Enhanced location encounter with method details
export interface LocationAreaEncounterDetail {
  location_area: {
    name: string;
    url: string;
  };
  version_details: {
    encounter_details: {
      chance: number;
      condition_values: any[];
      max_level: number;
      method: {
        name: string;
        url: string;
      };
      min_level: number;
    }[];
    max_chance: number;
    version: {
      name: string;
      url: string;
    };
  }[];
}

// Breeding data interface
export interface BreedingData {
  egg_groups: string[];
  gender_rate: number; // -1 for genderless, 0-8 for female ratio
  hatch_counter: number;
  baby_trigger_item?: string | null;
  egg_moves?: {
    move: string;
    learned_from: string[];
  }[];
  compatible_pokemon?: {
    name: string;
    id: number;
    sprite: string;
  }[];
}

// Competitive data interface
export interface CompetitiveData {
  tier?: string;
  usage_percent?: number;
  common_moves?: {
    move: string;
    usage: number;
  }[];
  common_items?: {
    item: string;
    usage: number;
  }[];
  common_abilities?: {
    ability: string;
    usage: number;
  }[];
  common_ev_spreads?: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
    nature: string;
    usage: number;
  }[];
  counters?: {
    pokemon: string;
    effectiveness: number;
  }[];
  teammates?: {
    pokemon: string;
    synergy: number;
  }[];
}

// Enhanced move detail interface
export interface MoveDetail extends Move {
  category: 'physical' | 'special' | 'status';
  contest_type?: {
    name: string;
    url: string;
  } | null;
  contest_effect?: {
    appeal: number;
    jam: number;
  } | null;
  machines?: {
    machine: {
      url: string;
    };
    version_group: {
      name: string;
      url: string;
    };
  }[];
  learned_by_pokemon?: {
    name: string;
    url: string;
  }[];
}

// Calculator settings interface
export interface CalculatorSettings {
  level: number;
  nature: string;
  evs: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
}

// Pokemon tab type
export type PokemonTab = 
  | 'overview' 
  | 'stats' 
  | 'evolution' 
  | 'moves' 
  | 'breeding' 
  | 'locations' 
  | 'cards' 
  | 'competitive';

// Theme configuration interface
export interface PokemonTheme {
  primaryColor: string;
  secondaryColor: string;
  gradient: string;
  particleColors: string[];
  glowColor: string;
  accentColor: string;
}

// Location interface (already exists, keeping for reference)
export interface Location {
  id: number;
  name: string;
  region?: {
    name: string;
    url: string;
  } | null;
  names: {
    name: string;
    language: {
      name: string;
      url: string;
    };
  }[];
  game_indices: {
    game_index: number;
    generation: {
      name: string;
      url: string;
    };
  }[];
  areas: {
    name: string;
    url: string;
  }[];
}