// Pokemon stats, abilities, and competitive data types

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
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