// Pokemon locations and encounter types

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

// Location interface
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