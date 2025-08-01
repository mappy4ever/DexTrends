import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for Showdown integration tables
export interface TypeEffectivenessRecord {
  id?: number;
  attacking_type: string;
  defending_type: string;
  multiplier: number;
  created_at?: string;
  updated_at?: string;
}

export interface CompetitiveTierRecord {
  id?: number;
  pokemon_name: string;
  singles_tier: string | null;
  doubles_tier: string | null;
  national_dex_tier: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PokemonLearnsetRecord {
  id?: number;
  pokemon_id: string;
  move_name: string;
  generation: number;
  learn_method: 'level-up' | 'machine' | 'tutor' | 'egg' | 'other';
  level: number | null;
  created_at?: string;
}

export interface MoveCompetitiveDataRecord {
  id?: number;
  move_name: string;
  base_power: number | null;
  accuracy: number | null;
  priority: number;
  category: 'physical' | 'special' | 'status' | null;
  type: string | null;
  target: string | null;
  flags: string[];
  secondary_effects: Record<string, any> | null;
  description: string | null;
  short_description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AbilityRatingRecord {
  id?: number;
  ability_id: number;
  name: string;
  rating: number | null;
  competitive_desc: string | null;
  flags: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// Helper functions for common queries
export const showdownQueries = {
  async getTypeEffectiveness(attackingType: string, defendingType: string) {
    const { data, error } = await supabase
      .from('type_effectiveness')
      .select('multiplier')
      .eq('attacking_type', attackingType.toLowerCase())
      .eq('defending_type', defendingType.toLowerCase())
      .single();
    
    if (error) {
      console.error('Error fetching type effectiveness:', error);
      return null;
    }
    
    return data?.multiplier ?? 1;
  },

  async getPokemonTiers(pokemonName: string) {
    const { data, error } = await supabase
      .from('competitive_tiers')
      .select('*')
      .eq('pokemon_name', pokemonName.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found is ok
      console.error('Error fetching Pokemon tiers:', error);
    }
    
    return data;
  },

  async getPokemonLearnset(pokemonId: string, generation?: number, learnMethod?: string) {
    let query = supabase
      .from('pokemon_learnsets')
      .select('*')
      .eq('pokemon_id', pokemonId.toLowerCase())
      .order('level', { ascending: true, nullsFirst: false });
    
    if (generation) {
      query = query.lte('generation', generation);
    }
    
    if (learnMethod) {
      query = query.eq('learn_method', learnMethod);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching Pokemon learnset:', error);
      return [];
    }
    
    return data || [];
  },

  async getAllTypeChart() {
    const { data, error } = await supabase
      .from('type_effectiveness')
      .select('*');
    
    if (error) {
      console.error('Error fetching type chart:', error);
      return null;
    }
    
    // Transform flat records into nested object for easier lookup
    const chart: Record<string, Record<string, number>> = {};
    
    data?.forEach(record => {
      if (!chart[record.attacking_type]) {
        chart[record.attacking_type] = {};
      }
      chart[record.attacking_type][record.defending_type] = record.multiplier;
    });
    
    return chart;
  },

  async getMoveData(moveName: string) {
    const { data, error } = await supabase
      .from('move_competitive_data')
      .select('*')
      .eq('move_name', moveName.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') { // Not found is ok
      console.error('Error fetching move data:', error);
    }
    
    return data;
  },

  async getMovesByType(type: string) {
    const { data, error } = await supabase
      .from('move_competitive_data')
      .select('*')
      .eq('type', type.toLowerCase())
      .order('base_power', { ascending: false, nullsFirst: false });
    
    if (error) {
      console.error('Error fetching moves by type:', error);
      return [];
    }
    
    return data || [];
  },

  async getMovesByCategory(category: 'physical' | 'special' | 'status') {
    const { data, error } = await supabase
      .from('move_competitive_data')
      .select('*')
      .eq('category', category)
      .order('base_power', { ascending: false, nullsFirst: false });
    
    if (error) {
      console.error('Error fetching moves by category:', error);
      return [];
    }
    
    return data || [];
  },

  async searchMoves(searchTerm: string) {
    const { data, error } = await supabase
      .from('move_competitive_data')
      .select('*')
      .ilike('move_name', `%${searchTerm}%`)
      .limit(20);
    
    if (error) {
      console.error('Error searching moves:', error);
      return [];
    }
    
    return data || [];
  }
};

// Export everything
export default supabase;