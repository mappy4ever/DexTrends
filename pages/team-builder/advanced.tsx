/**
 * Advanced Team Builder with Synergy Analysis
 * For hardcore Pokemon enthusiasts and competitive players
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { getPokemonSDK } from '../../utils/pokemonSDK';
import { FadeIn, SlideUp } from '../../components/ui/animations/animations';
import logger from '../../utils/logger';
import { TypeBadge } from '../../components/ui/TypeBadge';
import { PageLoader } from '@/components/ui/SkeletonLoadingSystem';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import { CircularButton } from '../../components/ui/design-system';
import { analyzeTeamTypeSynergy, getTypeMatchups } from '../../utils/typeEffectiveness';
import type { TeamMember, Move, Nature, StatSpread } from '../../types/team-builder';
import type { Pokemon } from "../../types/pokemon";

// Dynamic import for the graph component to avoid SSR issues
const TeamSynergyGraph = dynamic(
  () => import('../../components/team-builder/TeamSynergyGraph'),
  { 
    ssr: false,
    loading: () => <div className="h-[500px] flex items-center justify-center">Loading graph...</div>
  }
);

const NATURES: Nature[] = [
  { name: 'Hardy', increased_stat: null, decreased_stat: null },
  { name: 'Adamant', increased_stat: 'attack', decreased_stat: 'special-attack' },
  { name: 'Bold', increased_stat: 'defense', decreased_stat: 'attack' },
  { name: 'Modest', increased_stat: 'special-attack', decreased_stat: 'attack' },
  { name: 'Calm', increased_stat: 'special-defense', decreased_stat: 'attack' },
  { name: 'Timid', increased_stat: 'speed', decreased_stat: 'attack' },
  { name: 'Lonely', increased_stat: 'attack', decreased_stat: 'defense' },
  { name: 'Brave', increased_stat: 'attack', decreased_stat: 'speed' },
  { name: 'Naughty', increased_stat: 'attack', decreased_stat: 'special-defense' },
  { name: 'Relaxed', increased_stat: 'defense', decreased_stat: 'speed' },
  { name: 'Impish', increased_stat: 'defense', decreased_stat: 'special-attack' },
  { name: 'Lax', increased_stat: 'defense', decreased_stat: 'special-defense' },
  { name: 'Quiet', increased_stat: 'special-attack', decreased_stat: 'speed' },
  { name: 'Mild', increased_stat: 'special-attack', decreased_stat: 'defense' },
  { name: 'Rash', increased_stat: 'special-attack', decreased_stat: 'special-defense' },
  { name: 'Gentle', increased_stat: 'special-defense', decreased_stat: 'defense' },
  { name: 'Careful', increased_stat: 'special-defense', decreased_stat: 'special-attack' },
  { name: 'Sassy', increased_stat: 'special-defense', decreased_stat: 'speed' },
  { name: 'Hasty', increased_stat: 'speed', decreased_stat: 'defense' },
  { name: 'Jolly', increased_stat: 'speed', decreased_stat: 'special-attack' },
  { name: 'Naive', increased_stat: 'speed', decreased_stat: 'special-defense' },
];

const AdvancedTeamBuilder: NextPage = () => {
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'analysis' | 'export'>('builder');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Search for Pokemon
  const searchPokemon = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const sdk = getPokemonSDK();
      // @ts-ignore - Pokemon SDK types issue
      const results = await sdk.pokemon.list({ limit: 20 });
      
      // Filter by name
      const filtered = results.results.filter((p: { name: string }) => 
        p.name.toLowerCase().includes(query.toLowerCase())
      );
      
      // Fetch details for filtered results
      const detailedResults = await Promise.all(
        // @ts-ignore - Pokemon SDK types issue
        filtered.slice(0, 6).map(p => sdk.pokemon.get(p.name))
      );
      
      setSearchResults(detailedResults as Pokemon[]);
    } catch (error) {
      logger.error('Error searching Pokemon:', { error });
      setSearchResults([]);
    }
    setLoading(false);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPokemon(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchPokemon]);

  // Add Pokemon to team
  const addToTeam = (pokemon: Pokemon) => {
    if (team.length >= 6) {
      alert('Team is full! Remove a Pokemon first.');
      return;
    }

    const defaultMember: TeamMember = {
      pokemon,
      level: 50,
      nature: NATURES[0],
      ability: pokemon.abilities?.[0]?.ability.name || '',
      moves: [],
      evs: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 },
      ivs: { hp: 31, attack: 31, defense: 31, specialAttack: 31, specialDefense: 31, speed: 31 },
    };

    if (editingIndex !== null) {
      const newTeam = [...team];
      newTeam[editingIndex] = defaultMember;
      setTeam(newTeam);
      setEditingIndex(null);
    } else {
      setTeam([...team, defaultMember]);
    }

    setSelectedPokemon(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Remove from team
  const removeFromTeam = (index: number) => {
    setTeam(team.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  // Update team member
  const updateTeamMember = (index: number, updates: Partial<TeamMember>) => {
    const newTeam = [...team];
    newTeam[index] = { ...newTeam[index], ...updates };
    setTeam(newTeam);
  };

  // Export team (SSR safe)
  const exportTeam = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      logger.warn('Export functionality is not available on server');
      return;
    }
    
    const exportData = {
      team: team.map(member => ({
        pokemon: member.pokemon.name,
        nickname: member.nickname,
        level: member.level,
        nature: member.nature.name,
        ability: member.ability,
        item: member.item,
        moves: member.moves.map(m => m.name),
        evs: member.evs,
        ivs: member.ivs,
      })),
      format: 'DexTrends Advanced Team Builder',
      version: '1.0',
      date: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokemon-team-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <FullBleedWrapper gradient="pokedex">
      <Head>
        <title>Advanced Team Builder | DexTrends</title>
        <meta name="description" content="Build competitive Pokemon teams with advanced synergy analysis and type coverage visualization" />
      </Head>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <FadeIn>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
              Advanced Team Builder
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Build competitive teams with real-time synergy analysis and type coverage visualization
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            <CircularButton
              onClick={() => setActiveTab('builder')}
              variant={activeTab === 'builder' ? 'primary' : 'secondary'}
              size="md"
              className={activeTab === 'builder' ? 'bg-blue-600' : ''}
            >
              Team Builder
            </CircularButton>
            <CircularButton
              onClick={() => setActiveTab('analysis')}
              variant={activeTab === 'analysis' ? 'primary' : 'secondary'}
              size="md"
              className={activeTab === 'analysis' ? 'bg-blue-600' : ''}
            >
              Synergy Analysis
            </CircularButton>
            <CircularButton
              onClick={() => setActiveTab('export')}
              variant={activeTab === 'export' ? 'primary' : 'secondary'}
              size="md"
              className={activeTab === 'export' ? 'bg-blue-600' : ''}
            >
              Export/Import
            </CircularButton>
            <Link
              href="/team-builder/ev-optimizer"
              className="min-h-[44px] px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm sm:text-base rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 touch-target"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              EV Optimizer
            </Link>
          </div>

          {/* Content */}
          {activeTab === 'builder' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Search Panel */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Add Pokemon</h2>
                  
                  <input
                    type="text"
                    placeholder="Search Pokemon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full min-h-[44px] px-3 sm:px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                  />

                  {loading && (
                    <div className="mt-4 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {searchResults.map((pokemon) => (
                        <CircularButton
                          key={pokemon.id}
                          onClick={() => addToTeam(pokemon)}
                          variant="secondary"
                          size="lg"
                          className="w-full p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 !rounded-lg justify-start"
                        >
                          <Image
                            src={pokemon.sprites?.front_default || '/dextrendslogo.png'}
                            alt={pokemon.name}
                            width={48}
                            height={48}
                          />
                          <div className="text-left">
                            <div className="font-medium capitalize">{pokemon.name}</div>
                            <div className="flex gap-1">
                              {pokemon.types?.map((t) => (
                                <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
                              )) || null}
                            </div>
                          </div>
                        </CircularButton>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Display */}
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Your Team ({team.length}/6)</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {team.map((member, index) => (
                      <TeamMemberCard
                        key={index}
                        member={member}
                        index={index}
                        onRemove={() => removeFromTeam(index)}
                        onEdit={() => setEditingIndex(index)}
                        onUpdate={(updates) => updateTeamMember(index, updates)}
                      />
                    ))}
                    
                    {/* Empty slots */}
                    {Array.from({ length: 6 - team.length }).map((_, index) => (
                      <div
                        key={`empty-${index}`}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 flex items-center justify-center"
                      >
                        <span className="text-gray-400 dark:text-gray-500">Empty Slot</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="space-y-6">
              {/* Synergy Graph */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <TeamSynergyGraph
                  team={team}
                  onPokemonClick={(member) => logger.debug('Pokemon clicked:', { member })}
                  highlightWeaknesses={true}
                  showRoles={true}
                />
              </div>

              {/* Type Coverage Matrix */}
              <TypeCoverageMatrix team={team} />

              {/* Speed Tiers */}
              <SpeedTierAnalysis team={team} />
            </div>
          )}

          {activeTab === 'export' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Export/Import Team</h2>
              
              <div className="space-y-4">
                <CircularButton
                  onClick={exportTeam}
                  disabled={team.length === 0}
                  variant="primary"
                  size="lg"
                  className="min-h-[44px] px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 touch-target"
                >
                  Export Team as JSON
                </CircularButton>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Showdown Format</h3>
                  <textarea
                    readOnly
                    value={generateShowdownFormat(team)}
                    className="w-full h-48 sm:h-64 p-3 sm:p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-xs sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </FullBleedWrapper>
  );
};

// Team member card component
const TeamMemberCard: React.FC<{
  member: TeamMember;
  index: number;
  onRemove: () => void;
  onEdit: () => void;
  onUpdate: (updates: Partial<TeamMember>) => void;
}> = ({ member, index, onRemove, onEdit, onUpdate }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image
            src={member.pokemon.sprites?.front_default || '/dextrendslogo.png'}
            alt={member.pokemon.name}
            width={56}
            height={56}
            className="w-14 h-14 sm:w-16 sm:h-16"
          />
          <div>
            <h3 className="font-bold capitalize">
              {member.nickname || member.pokemon.name}
            </h3>
            <div className="flex gap-1 mt-1">
              {member.pokemon.types?.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} size="sm" />
              )) || null}
            </div>
          </div>
        </div>
        
        <div className="flex gap-1 sm:gap-2">
          <CircularButton
            onClick={onEdit}
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm min-h-[36px] touch-target"
          >
            Edit
          </CircularButton>
          <CircularButton
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 text-xs sm:text-sm min-h-[36px] touch-target"
          >
            Remove
          </CircularButton>
        </div>
      </div>

      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Level:</span>
          <span>{member.level}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Nature:</span>
          <span>{member.nature.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Ability:</span>
          <span className="capitalize">{member.ability}</span>
        </div>
        {member.item && (
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Item:</span>
            <span>{member.item}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Type coverage matrix component
const TypeCoverageMatrix: React.FC<{ team: TeamMember[] }> = ({ team }) => {
  const teamTypes = team.map(m => m.pokemon.types?.map(t => t.type.name) || []);
  const analysis = analyzeTeamTypeSynergy(teamTypes);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Type Coverage Analysis</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <h4 className="font-medium mb-2 text-red-600">Shared Weaknesses</h4>
          {Object.keys(analysis.sharedWeaknesses).length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No shared weaknesses!</p>
          ) : (
            <ul className="space-y-1">
              {Object.entries(analysis.sharedWeaknesses).map(([type, count]) => (
                <li key={type} className="flex justify-between">
                  <span className="capitalize">{type}</span>
                  <span className="text-red-600">{count} members weak</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div>
          <h4 className="font-medium mb-2 text-orange-600">Uncovered Types</h4>
          {analysis.uncoveredTypes.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">All types covered!</p>
          ) : (
            <ul className="space-y-1">
              {analysis.uncoveredTypes.map((type) => (
                <li key={type} className="capitalize">{type}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// Speed tier analysis component
const SpeedTierAnalysis: React.FC<{ team: TeamMember[] }> = ({ team }) => {
  const speeds = team.map(member => {
    const speedStat = member.pokemon.stats?.find(s => s.stat.name === 'speed');
    const baseSpeed = speedStat?.base_stat || 0;
    
    // Calculate actual speed with nature
    let actualSpeed = baseSpeed;
    if (member.nature.increased_stat === 'speed') {
      actualSpeed = Math.floor(actualSpeed * 1.1);
    } else if (member.nature.decreased_stat === 'speed') {
      actualSpeed = Math.floor(actualSpeed * 0.9);
    }
    
    return {
      name: member.nickname || member.pokemon.name,
      baseSpeed,
      actualSpeed,
      nature: member.nature.name,
    };
  }).sort((a, b) => b.actualSpeed - a.actualSpeed);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Speed Tiers</h3>
      
      <div className="space-y-2">
        {speeds.map((pokemon, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
              <div>
                <div className="font-medium capitalize">{pokemon.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Nature: {pokemon.nature}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold">{pokemon.actualSpeed}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Base: {pokemon.baseSpeed}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Generate Showdown format
function generateShowdownFormat(team: TeamMember[]): string {
  return team.map(member => {
    const lines = [
      `${member.nickname || member.pokemon.name} ${member.item ? `@ ${member.item}` : ''}`,
      `Ability: ${member.ability}`,
      `Level: ${member.level}`,
      `${member.nature.name} Nature`,
    ];
    
    if (member.evs) {
      const evParts = [];
      if (member.evs.hp > 0) evParts.push(`${member.evs.hp} HP`);
      if (member.evs.attack > 0) evParts.push(`${member.evs.attack} Atk`);
      if (member.evs.defense > 0) evParts.push(`${member.evs.defense} Def`);
      if (member.evs.specialAttack > 0) evParts.push(`${member.evs.specialAttack} SpA`);
      if (member.evs.specialDefense > 0) evParts.push(`${member.evs.specialDefense} SpD`);
      if (member.evs.speed > 0) evParts.push(`${member.evs.speed} Spe`);
      
      if (evParts.length > 0) {
        lines.push(`EVs: ${evParts.join(' / ')}`);
      }
    }
    
    if (member.moves.length > 0) {
      member.moves.forEach(move => {
        lines.push(`- ${move.name}`);
      });
    }
    
    return lines.join('\n');
  }).join('\n\n');
}

// Mark this page as full bleed to remove Layout padding
(AdvancedTeamBuilder as any).fullBleed = true;

export default AdvancedTeamBuilder;