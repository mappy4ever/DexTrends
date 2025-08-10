// Type definitions for StarterPokemonShowcase
export interface Evolution {
  name: string;
  level: number;
  id: number;
  types: string[];
}

export interface MegaEvolution {
  name: string;
  types: string[];
}

export interface RegionalForm {
  region: string;
  types: string[];
  description: string;
}

export interface GenderRatio {
  male: number;
  female: number;
}

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface StarterData {
  number: string;
  types: string[];
  species: string;
  height: string;
  weight: string;
  abilities: string[];
  genderRatio: GenderRatio;
  description: string;
  stats: Stats;
  evolutions: Evolution[];
  megaEvolution?: MegaEvolution | MegaEvolution[];
  gigantamax?: boolean;
  regionalForm?: RegionalForm;
  strengths: string[];
  weaknesses: string[];
  notableTrainers: string[];
  signature: string;
  hiddenAbility: string;
  competitiveRole: string;
  tier: string;
  funFacts: string[];
}

export interface StarterPokemonShowcaseProps {
  region: string;
  starters: string[];
  theme: string;
}