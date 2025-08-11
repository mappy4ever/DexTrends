import React, { useState, useEffect } from 'react';
import type { Pokemon, PokemonSpecies } from "../../../types/pokemon";
import type { CompetitiveTierRecord } from '../../../utils/supabase';
import { showdownQueries } from '../../../utils/supabase';
import {
  generateMovesets,
  generateTeammates,
  generateCounters,
  calculateUsageStats,
} from '../../../utils/competitiveAnalysis';
import logger from '@/utils/logger';

// Import sub-components
import { TierLegend } from './competitive/TierLegend';
import { FormatStats } from './competitive/FormatStats';
import { MovesetsSection } from './competitive/MovesetsSection';
import { TeammatesCountersSection } from './competitive/TeammatesCountersSection';
import { SpeedTiersSection } from './competitive/SpeedTiersSection';

// Import types and utilities
import type { MovesetData, TeammateData, CounterData, UsageStats } from './competitive/types';
import { checkFormatEligibility } from './competitive/utils';
import { SAMPLE_MOVESETS, COMMON_TEAMMATES, COUNTERS } from './competitive/constants';

interface CompetitiveTabProps {
  pokemon: Pokemon;
  species: PokemonSpecies;
  _typeColors: Record<string, unknown>;
  competitiveTiers?: CompetitiveTierRecord | null;
}


const CompetitiveTab: React.FC<CompetitiveTabProps> = ({ pokemon, species, _typeColors, competitiveTiers }) => {
  
  // State for real competitive data
  const [movesets, setMovesets] = useState<MovesetData[]>([]);
  const [teammates, setTeammates] = useState<TeammateData[]>([]);
  const [counters, setCounters] = useState<CounterData[]>([]);
  const [usageStats, setUsageStats] = useState<{ usage: number; winRate: number }>({ usage: 0, winRate: 0 });
  const [loading, setLoading] = useState(true);
  
  // Calculate base stat total for fallback tier estimation
  const baseStatTotal = pokemon.stats?.reduce((sum, stat) => sum + stat.base_stat, 0) || 0;
  const estimatedTier = baseStatTotal >= 600 ? 'Uber' : 
    baseStatTotal >= 500 ? 'OU' : 
    baseStatTotal >= 450 ? 'UU' : 
    baseStatTotal >= 400 ? 'RU' : 'NU';

  // Check format eligibility
  const formatEligibility = checkFormatEligibility(pokemon, species);

  // Load competitive data on mount
  useEffect(() => {
    async function loadCompetitiveData() {
      setLoading(true);
      try {
        // Get learnset for moveset generation
        const learnset = await showdownQueries.getPokemonLearnset(pokemon.name);
        
        // Generate movesets
        const generatedMovesets = await generateMovesets(pokemon, species, learnset);
        setMovesets(generatedMovesets);
        
        // Generate teammates
        const generatedTeammates = await generateTeammates(pokemon, species);
        setTeammates(generatedTeammates);
        
        // Generate counters
        const generatedCounters = await generateCounters(pokemon, species);
        setCounters(generatedCounters);
        
        // Calculate usage stats based on tier
        const tier = competitiveTiers?.singles_tier || estimatedTier;
        const stats = calculateUsageStats(pokemon, tier);
        setUsageStats(stats);
      } catch (error) {
        logger.error('Error loading competitive data:', { error });
        // Fall back to sample data if needed
        setMovesets(SAMPLE_MOVESETS);
        setTeammates(COMMON_TEAMMATES);
        setCounters(COUNTERS);
        setUsageStats({ usage: 4.5, winRate: 48.7 });
      } finally {
        setLoading(false);
      }
    }

    loadCompetitiveData();
  }, [pokemon, species, competitiveTiers, estimatedTier]);

  return (
    <div className="space-y-6">
      <TierLegend />
      
      <FormatStats 
        pokemon={pokemon}
        species={species}
        competitiveTiers={competitiveTiers}
        estimatedTier={estimatedTier}
        formatEligibility={formatEligibility}
        usageStats={usageStats}
        baseStatTotal={baseStatTotal}
      />

      <MovesetsSection 
        movesets={loading ? SAMPLE_MOVESETS : movesets}
        loading={loading}
      />

      <TeammatesCountersSection 
        teammates={loading ? COMMON_TEAMMATES : teammates}
        counters={loading ? COUNTERS : counters}
        loading={loading}
      />

      <SpeedTiersSection 
        pokemon={pokemon}
      />
    </div>
  );
};

export default CompetitiveTab;