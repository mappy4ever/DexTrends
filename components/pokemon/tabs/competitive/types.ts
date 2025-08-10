// Type definitions for CompetitiveTab components
export interface MovesetData {
  name: string;
  usage: number;
  item: string;
  ability: string;
  nature: string;
  evs: Record<string, number>;
  moves: string[];
}

export interface TeammateData {
  name: string;
  usage: number;
  reason?: string;
}

export interface CounterData {
  name: string;
  winRate: number;
  reason?: string;
}

export interface FormatEligibility {
  littleCup: boolean;
  monotype: boolean;
  nfe: boolean;
  vgc: boolean;
  battleStadium: boolean;
}

export interface UsageStats {
  usage: number;
  winRate: number;
}

export interface RoleInfo {
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

export interface TierInfo {
  description: string;
  color: string;
}

export interface FormatInfo {
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}