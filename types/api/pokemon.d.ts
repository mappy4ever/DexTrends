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