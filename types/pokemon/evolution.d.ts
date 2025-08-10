// Pokemon evolution and breeding types

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