// Pokemon battle, moves, and items types

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