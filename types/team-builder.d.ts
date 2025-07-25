/**
 * Type definitions for advanced team building features
 */

import type { Pokemon } from './api/pokemon';

export interface TeamMember {
  pokemon: Pokemon;
  nickname?: string;
  level: number;
  nature: Nature;
  ability: string;
  item?: string;
  moves: Move[];
  evs: StatSpread;
  ivs: StatSpread;
}

export interface Move {
  id: number;
  name: string;
  type: string;
  category: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number;
  priority: number;
  target: string;
  damage_class?: {
    name: string;
  };
}

export interface StatSpread {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Nature {
  name: string;
  increased_stat: string | null;
  decreased_stat: string | null;
}

export interface TypeCoverage {
  offensive: TypeMatchup;
  defensive: TypeMatchup;
}

export interface TypeMatchup {
  superEffective: string[];
  notVeryEffective: string[];
  noEffect: string[];
  resistances: string[];
  weaknesses: string[];
  immunities: string[];
}

export interface TeamSynergy {
  typeCoverage: TypeCoverage;
  roleCoverage: RoleCoverage;
  speedTiers: SpeedTier[];
  threats: ThreatAnalysis[];
  cores: SynergyCore[];
  overallRating: number;
}

export interface RoleCoverage {
  physicalAttackers: number;
  specialAttackers: number;
  physicalWalls: number;
  specialWalls: number;
  pivots: number;
  speedControl: number;
  hazardSetters: number;
  hazardRemovers: number;
  clerics: number;
  setupSweepers: number;
}

export interface SpeedTier {
  pokemon: string;
  speed: number;
  speedWithModifiers: number;
  outspeeds: string[];
  outspeedBy: string[];
}

export interface ThreatAnalysis {
  pokemon: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  coverage: string[];
  counters: string[];
}

export interface SynergyCore {
  members: string[];
  synergy: 'excellent' | 'good' | 'average' | 'poor';
  description: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'pokemon' | 'type' | 'role';
  data: TeamMember | TypeNode | RoleNode;
  x?: number;
  y?: number;
  size: number;
  color: string;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  type: 'synergy' | 'weakness' | 'coverage';
  weight: number;
  label?: string;
  color: string;
}

export interface TypeNode {
  type: string;
  count: number;
}

export interface RoleNode {
  role: string;
  count: number;
}

export interface GraphData {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}