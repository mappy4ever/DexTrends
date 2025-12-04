/**
 * TeamBuilderPanel - Comprehensive Pokemon Team Builder
 *
 * Features:
 * - 6 Pokemon team slots with drag-and-drop
 * - Type coverage analysis (offensive/defensive)
 * - Weakness/resistance calculator
 * - Team synergy scoring
 * - Export/share functionality
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Container, ContainerHeader, ContainerTitle, ContainerDescription, ContainerFooter } from '@/components/ui/Container';
import Button, { ButtonGroup, IconButton } from '@/components/ui/Button';
import { Modal, useModalState } from '@/components/ui/Modal';
import { EnergyIcon, EnergyBadge } from '@/components/ui/EnergyIcon';
import { cn } from '@/utils/cn';
import { TRANSITION } from '@/components/ui/design-system/glass-constants';
import {
  BsPlus,
  BsX,
  BsArrowsMove,
  BsDownload,
  BsShare,
  BsShieldCheck,
  BsLightningCharge,
  BsExclamationTriangle,
  BsCheckCircle,
  BsTrash,
  BsSearch,
  BsStarFill,
  BsInfoCircle,
  BsClipboardCheck
} from 'react-icons/bs';
import logger from '@/utils/logger';

// Pokemon type effectiveness chart
const TYPE_CHART: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

// Defensive type chart (what types are weak/resistant to)
const DEFENSIVE_CHART: Record<string, { weak: string[]; resist: string[]; immune: string[] }> = {
  normal: { weak: ['fighting'], resist: [], immune: ['ghost'] },
  fire: { weak: ['water', 'ground', 'rock'], resist: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immune: [] },
  water: { weak: ['electric', 'grass'], resist: ['fire', 'water', 'ice', 'steel'], immune: [] },
  electric: { weak: ['ground'], resist: ['electric', 'flying', 'steel'], immune: [] },
  grass: { weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resist: ['water', 'electric', 'grass', 'ground'], immune: [] },
  ice: { weak: ['fire', 'fighting', 'rock', 'steel'], resist: ['ice'], immune: [] },
  fighting: { weak: ['flying', 'psychic', 'fairy'], resist: ['bug', 'rock', 'dark'], immune: [] },
  poison: { weak: ['ground', 'psychic'], resist: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immune: [] },
  ground: { weak: ['water', 'grass', 'ice'], resist: ['poison', 'rock'], immune: ['electric'] },
  flying: { weak: ['electric', 'ice', 'rock'], resist: ['grass', 'fighting', 'bug'], immune: ['ground'] },
  psychic: { weak: ['bug', 'ghost', 'dark'], resist: ['fighting', 'psychic'], immune: [] },
  bug: { weak: ['fire', 'flying', 'rock'], resist: ['grass', 'fighting', 'ground'], immune: [] },
  rock: { weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resist: ['normal', 'fire', 'poison', 'flying'], immune: [] },
  ghost: { weak: ['ghost', 'dark'], resist: ['poison', 'bug'], immune: ['normal', 'fighting'] },
  dragon: { weak: ['ice', 'dragon', 'fairy'], resist: ['fire', 'water', 'electric', 'grass'], immune: [] },
  dark: { weak: ['fighting', 'bug', 'fairy'], resist: ['ghost', 'dark'], immune: ['psychic'] },
  steel: { weak: ['fire', 'fighting', 'ground'], resist: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immune: ['poison'] },
  fairy: { weak: ['poison', 'steel'], resist: ['fighting', 'bug', 'dark'], immune: ['dragon'] },
};

const ALL_TYPES = Object.keys(TYPE_CHART);

export interface TeamPokemon {
  id: string;
  pokedexId: number;
  name: string;
  types: string[];
  sprite: string;
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
}

interface TeamBuilderPanelProps {
  initialTeam?: TeamPokemon[];
  onTeamChange?: (team: TeamPokemon[]) => void;
  onSave?: (team: TeamPokemon[]) => void;
  onShare?: (team: TeamPokemon[]) => void;
  className?: string;
}

export const TeamBuilderPanel: React.FC<TeamBuilderPanelProps> = ({
  initialTeam = [],
  onTeamChange,
  onSave,
  onShare,
  className,
}) => {
  const [team, setTeam] = useState<TeamPokemon[]>(initialTeam);
  const [activeTab, setActiveTab] = useState<'team' | 'coverage' | 'analysis'>('team');
  const [copied, setCopied] = useState(false);

  const addPokemonModal = useModalState();
  const shareModal = useModalState();

  // Sync with initialTeam changes
  useEffect(() => {
    if (initialTeam.length > 0) {
      setTeam(initialTeam);
    }
  }, [initialTeam]);

  // Calculate type coverage
  const typeCoverage = useMemo(() => {
    const coverage = {
      offensive: {} as Record<string, number>,
      defensive: {
        weaknesses: {} as Record<string, number>,
        resistances: {} as Record<string, number>,
        immunities: {} as Record<string, number>,
      },
    };

    // Initialize all types
    ALL_TYPES.forEach(type => {
      coverage.offensive[type] = 0;
      coverage.defensive.weaknesses[type] = 0;
      coverage.defensive.resistances[type] = 0;
      coverage.defensive.immunities[type] = 0;
    });

    team.forEach(pokemon => {
      // Offensive coverage (what types this Pokemon can hit super effectively)
      pokemon.types.forEach(attackType => {
        const typeKey = attackType.toLowerCase();
        if (TYPE_CHART[typeKey]) {
          Object.entries(TYPE_CHART[typeKey]).forEach(([target, effectiveness]) => {
            if (effectiveness === 2) {
              coverage.offensive[target] = (coverage.offensive[target] || 0) + 1;
            }
          });
        }
      });

      // Defensive coverage (team weaknesses/resistances)
      const pokemonDefense = calculateDefensiveProfile(pokemon.types);
      pokemonDefense.weaknesses.forEach(type => {
        coverage.defensive.weaknesses[type] = (coverage.defensive.weaknesses[type] || 0) + 1;
      });
      pokemonDefense.resistances.forEach(type => {
        coverage.defensive.resistances[type] = (coverage.defensive.resistances[type] || 0) + 1;
      });
      pokemonDefense.immunities.forEach(type => {
        coverage.defensive.immunities[type] = (coverage.defensive.immunities[type] || 0) + 1;
      });
    });

    return coverage;
  }, [team]);

  // Calculate team synergy score
  const synergyScore = useMemo(() => {
    if (team.length === 0) return 0;

    let score = 0;
    const maxScore = 100;

    // Type diversity bonus (up to 30 points)
    const uniqueTypes = new Set(team.flatMap(p => p.types.map(t => t.toLowerCase())));
    score += Math.min(30, uniqueTypes.size * 5);

    // Offensive coverage bonus (up to 30 points)
    const coveredTypes = Object.values(typeCoverage.offensive).filter(v => v > 0).length;
    score += Math.min(30, (coveredTypes / ALL_TYPES.length) * 30);

    // Defensive balance bonus (up to 25 points)
    const totalWeaknesses = Object.values(typeCoverage.defensive.weaknesses).reduce((a, b) => a + b, 0);
    const totalResistances = Object.values(typeCoverage.defensive.resistances).reduce((a, b) => a + b, 0);
    const defensiveRatio = totalResistances / Math.max(1, totalWeaknesses);
    score += Math.min(25, defensiveRatio * 10);

    // Immunity bonus (up to 15 points)
    const immunities = Object.values(typeCoverage.defensive.immunities).filter(v => v > 0).length;
    score += Math.min(15, immunities * 5);

    return Math.min(maxScore, Math.round(score));
  }, [team, typeCoverage]);

  // Team warnings
  const warnings = useMemo(() => {
    const issues: string[] = [];

    // Check for uncovered weaknesses
    const criticalWeaknesses = Object.entries(typeCoverage.defensive.weaknesses)
      .filter(([_, count]) => count >= 3)
      .map(([type]) => type);

    if (criticalWeaknesses.length > 0) {
      issues.push(`Team has 3+ Pokemon weak to: ${criticalWeaknesses.join(', ')}`);
    }

    // Check for missing coverage
    const uncoveredTypes = Object.entries(typeCoverage.offensive)
      .filter(([_, count]) => count === 0)
      .map(([type]) => type);

    if (uncoveredTypes.length > 5 && team.length >= 3) {
      issues.push(`No super-effective coverage against: ${uncoveredTypes.slice(0, 3).join(', ')}...`);
    }

    // Check for type redundancy
    const typeCount: Record<string, number> = {};
    team.forEach(p => {
      p.types.forEach(t => {
        const type = t.toLowerCase();
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
    });
    const redundantTypes = Object.entries(typeCount)
      .filter(([_, count]) => count >= 3)
      .map(([type]) => type);

    if (redundantTypes.length > 0) {
      issues.push(`Type redundancy: ${redundantTypes.join(', ')} (3+ Pokemon)`);
    }

    return issues;
  }, [team, typeCoverage]);

  const handleAddPokemon = useCallback((pokemon: TeamPokemon) => {
    if (team.length >= 6) {
      logger.warn('Team is full');
      return;
    }

    const newTeam = [...team, pokemon];
    setTeam(newTeam);
    onTeamChange?.(newTeam);
    addPokemonModal.close();
  }, [team, onTeamChange, addPokemonModal]);

  const handleRemovePokemon = useCallback((index: number) => {
    const newTeam = team.filter((_, i) => i !== index);
    setTeam(newTeam);
    onTeamChange?.(newTeam);
  }, [team, onTeamChange]);

  const handleReorderTeam = useCallback((newOrder: TeamPokemon[]) => {
    setTeam(newOrder);
    onTeamChange?.(newOrder);
  }, [onTeamChange]);

  const handleClearTeam = useCallback(() => {
    setTeam([]);
    onTeamChange?.([]);
  }, [onTeamChange]);

  const handleExport = useCallback(() => {
    const exportData = {
      team: team.map(p => ({
        id: p.pokedexId,
        name: p.name,
        types: p.types,
      })),
      synergy: synergyScore,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pokemon-team-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logger.info('Team exported', { teamSize: team.length });
  }, [team, synergyScore]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Container variant="elevated" padding="md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <ContainerTitle size="lg">Team Builder</ContainerTitle>
            <ContainerDescription>
              Build your dream team with type coverage analysis
            </ContainerDescription>
          </div>

          {/* Synergy Score */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={cn(
                'text-3xl font-bold',
                synergyScore >= 70 ? 'text-green-600 dark:text-green-400' :
                synergyScore >= 40 ? 'text-amber-600 dark:text-amber-400' :
                'text-red-600 dark:text-red-400'
              )}>
                {synergyScore}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">Synergy</div>
            </div>
            <div className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center',
              synergyScore >= 70 ? 'bg-green-100 dark:bg-green-900/30' :
              synergyScore >= 40 ? 'bg-amber-100 dark:bg-amber-900/30' :
              'bg-red-100 dark:bg-red-900/30'
            )}>
              {synergyScore >= 70 ? (
                <BsCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              ) : synergyScore >= 40 ? (
                <BsInfoCircle className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              ) : (
                <BsExclamationTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </div>

        {/* Warnings */}
        <AnimatePresence>
          {warnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {warnings.map((warning, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm"
                >
                  <BsExclamationTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{warning}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'team', label: 'Team', icon: BsArrowsMove },
          { id: 'coverage', label: 'Coverage', icon: BsLightningCharge },
          { id: 'analysis', label: 'Analysis', icon: BsShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
              TRANSITION.default,
              activeTab === tab.id
                ? 'bg-amber-600 text-white'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Team Tab */}
      {activeTab === 'team' && (
        <Container variant="elevated" padding="md">
          <Reorder.Group
            axis="y"
            values={team}
            onReorder={handleReorderTeam}
            className="space-y-3"
          >
            <AnimatePresence>
              {team.map((pokemon, index) => (
                <Reorder.Item
                  key={pokemon.id}
                  value={pokemon}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-800/50 cursor-grab active:cursor-grabbing',
                    TRANSITION.default,
                    'hover:bg-stone-100 dark:hover:bg-stone-700/50'
                  )}
                >
                  {/* Drag Handle */}
                  <div className="text-stone-400">
                    <BsArrowsMove className="w-5 h-5" />
                  </div>

                  {/* Pokemon Sprite */}
                  <div className="w-16 h-16 rounded-lg bg-white dark:bg-stone-700 flex items-center justify-center overflow-hidden">
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="w-14 h-14 object-contain"
                    />
                  </div>

                  {/* Pokemon Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-stone-800 dark:text-white capitalize">
                      {pokemon.name}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {pokemon.types.map(type => (
                        <EnergyBadge key={type} type={type} size="xs" />
                      ))}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePokemon(index)}
                    aria-label={`Remove ${pokemon.name}`}
                  >
                    <BsX className="w-5 h-5" />
                  </IconButton>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>

          {/* Empty Slots */}
          {Array.from({ length: 6 - team.length }).map((_, i) => (
            <button
              key={`empty-${i}`}
              onClick={() => addPokemonModal.open()}
              className={cn(
                'w-full flex items-center justify-center gap-3 p-4 mt-3 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600',
                'text-stone-500 dark:text-stone-400 hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400',
                TRANSITION.default
              )}
            >
              <BsPlus className="w-6 h-6" />
              <span className="font-medium">Add Pokemon</span>
            </button>
          ))}

          {/* Actions */}
          <ContainerFooter separator align="between" className="mt-6">
            <Button
              variant="ghost"
              size="sm"
              icon={<BsTrash className="w-4 h-4" />}
              onClick={handleClearTeam}
              disabled={team.length === 0}
            >
              Clear Team
            </Button>
            <ButtonGroup spacing="sm">
              <Button
                variant="secondary"
                size="sm"
                icon={<BsDownload className="w-4 h-4" />}
                onClick={handleExport}
                disabled={team.length === 0}
              >
                Export
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<BsShare className="w-4 h-4" />}
                onClick={() => {
                  shareModal.open();
                  onShare?.(team);
                }}
                disabled={team.length === 0}
              >
                Share
              </Button>
            </ButtonGroup>
          </ContainerFooter>
        </Container>
      )}

      {/* Coverage Tab */}
      {activeTab === 'coverage' && (
        <div className="grid gap-4 md:grid-cols-2">
          {team.length === 0 ? (
            <Container variant="elevated" padding="lg" className="md:col-span-2 text-center">
              <BsShieldCheck className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-4" />
              <h3 className="text-lg font-medium text-stone-800 dark:text-white mb-2">
                No Pokemon in Team
              </h3>
              <p className="text-stone-500 dark:text-stone-400 mb-4">
                Add Pokemon to your team to see type coverage analysis.
              </p>
              <Button variant="primary" onClick={addPokemonModal.open} icon={<BsPlus className="w-4 h-4" />}>
                Add Pokemon
              </Button>
            </Container>
          ) : (
            <>
          {/* Offensive Coverage */}
          <Container variant="elevated" padding="md">
            <ContainerHeader>
              <div className="flex items-center gap-2">
                <BsLightningCharge className="w-5 h-5 text-red-500" />
                <ContainerTitle size="sm">Offensive Coverage</ContainerTitle>
              </div>
              <ContainerDescription>Types your team can hit super effectively</ContainerDescription>
            </ContainerHeader>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ALL_TYPES.map(type => {
                const count = typeCoverage.offensive[type] || 0;
                return (
                  <div
                    key={type}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg',
                      count > 0
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-stone-100 dark:bg-stone-800'
                    )}
                  >
                    <EnergyIcon type={type} size="sm" />
                    <span className={cn(
                      'text-xs font-medium capitalize',
                      count > 0
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-stone-500 dark:text-stone-400'
                    )}>
                      {count > 0 ? `×${count}` : '-'}
                    </span>
                  </div>
                );
              })}
            </div>
          </Container>

          {/* Defensive Coverage */}
          <Container variant="elevated" padding="md">
            <ContainerHeader>
              <div className="flex items-center gap-2">
                <BsShieldCheck className="w-5 h-5 text-blue-500" />
                <ContainerTitle size="sm">Defensive Profile</ContainerTitle>
              </div>
              <ContainerDescription>Team weaknesses and resistances</ContainerDescription>
            </ContainerHeader>

            <div className="space-y-4">
              {/* Weaknesses */}
              <div>
                <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase mb-2">
                  Weaknesses
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ALL_TYPES.map(type => {
                    const count = typeCoverage.defensive.weaknesses[type] || 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={type}
                        className={cn(
                          'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
                          count >= 3
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        )}
                      >
                        <EnergyIcon type={type} size="xs" />
                        <span>×{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resistances */}
              <div>
                <h4 className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-2">
                  Resistances
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ALL_TYPES.map(type => {
                    const count = typeCoverage.defensive.resistances[type] || 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={type}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-medium"
                      >
                        <EnergyIcon type={type} size="xs" />
                        <span>×{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Immunities */}
              <div>
                <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-2">
                  Immunities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ALL_TYPES.map(type => {
                    const count = typeCoverage.defensive.immunities[type] || 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={type}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium"
                      >
                        <EnergyIcon type={type} size="xs" />
                        <span>×{count}</span>
                      </div>
                    );
                  })}
                  {Object.values(typeCoverage.defensive.immunities).every(v => v === 0) && (
                    <span className="text-xs text-stone-400">No immunities</span>
                  )}
                </div>
              </div>
            </div>
          </Container>
            </>
          )}
        </div>
      )}

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <Container variant="elevated" padding="md">
          {team.length === 0 ? (
            <div className="text-center py-8">
              <BsInfoCircle className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-4" />
              <h3 className="text-lg font-medium text-stone-800 dark:text-white mb-2">
                No Team to Analyze
              </h3>
              <p className="text-stone-500 dark:text-stone-400 mb-4">
                Add Pokemon to your team to see detailed analysis and recommendations.
              </p>
              <Button variant="primary" onClick={addPokemonModal.open} icon={<BsPlus className="w-4 h-4" />}>
                Add Pokemon
              </Button>
            </div>
          ) : (
            <>
          <ContainerHeader>
            <ContainerTitle size="sm">Team Analysis</ContainerTitle>
            <ContainerDescription>Detailed breakdown of your team composition</ContainerDescription>
          </ContainerHeader>

          <div className="space-y-6">
            {/* Synergy Breakdown */}
            <div>
              <h4 className="font-semibold text-stone-800 dark:text-white mb-3">Synergy Score Breakdown</h4>
              <div className="space-y-2">
                {[
                  { label: 'Type Diversity', value: Math.min(30, new Set(team.flatMap(p => p.types.map(t => t.toLowerCase()))).size * 5), max: 30 },
                  { label: 'Offensive Coverage', value: Math.min(30, (Object.values(typeCoverage.offensive).filter(v => v > 0).length / ALL_TYPES.length) * 30), max: 30 },
                  { label: 'Defensive Balance', value: Math.min(25, (Object.values(typeCoverage.defensive.resistances).reduce((a, b) => a + b, 0) / Math.max(1, Object.values(typeCoverage.defensive.weaknesses).reduce((a, b) => a + b, 0))) * 10), max: 25 },
                  { label: 'Immunity Bonus', value: Math.min(15, Object.values(typeCoverage.defensive.immunities).filter(v => v > 0).length * 5), max: 15 },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-sm text-stone-600 dark:text-stone-300 w-40">{item.label}</span>
                    <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-stone-800 dark:text-white w-16 text-right">
                      {Math.round(item.value)}/{item.max}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Stats */}
            {team.length > 0 && team.some(p => p.stats) && (
              <div>
                <h4 className="font-semibold text-stone-800 dark:text-white mb-3">Average Team Stats</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'].map(stat => {
                    const pokemonWithStats = team.filter(p => p.stats);
                    const avg = pokemonWithStats.length > 0
                      ? Math.round(pokemonWithStats.reduce((sum, p) => sum + (p.stats?.[stat as keyof TeamPokemon['stats']] || 0), 0) / pokemonWithStats.length)
                      : 0;

                    const statLabels: Record<string, string> = {
                      hp: 'HP',
                      attack: 'Atk',
                      defense: 'Def',
                      specialAttack: 'SpA',
                      specialDefense: 'SpD',
                      speed: 'Spe',
                    };

                    return (
                      <div key={stat} className="text-center p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
                        <div className="text-xs text-stone-500 dark:text-stone-400">{statLabels[stat]}</div>
                        <div className="text-xl font-bold text-stone-800 dark:text-white">{avg}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold text-stone-800 dark:text-white mb-3">Recommendations</h4>
              <div className="space-y-2">
                {team.length < 6 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm">
                    <BsInfoCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Add {6 - team.length} more Pokemon to complete your team.</span>
                  </div>
                )}
                {Object.entries(typeCoverage.offensive).filter(([_, v]) => v === 0).length > 6 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
                    <BsInfoCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Consider adding Pokemon with diverse type coverage to handle more threats.</span>
                  </div>
                )}
                {synergyScore >= 70 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm">
                    <BsStarFill className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Great team composition! Your synergy score is excellent.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
            </>
          )}
        </Container>
      )}

      {/* Add Pokemon Modal */}
      <PokemonSearchModal
        isOpen={addPokemonModal.isOpen}
        onClose={addPokemonModal.close}
        onSelect={handleAddPokemon}
        existingTeam={team}
      />

      {/* Share Modal */}
      <Modal
        isOpen={shareModal.isOpen}
        onClose={() => {
          shareModal.close();
          setCopied(false);
        }}
        title="Share Your Team"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-stone-600 dark:text-stone-300">
            Share your team with friends or save it for later!
          </p>

          {/* Team Preview */}
          <div className="flex gap-2 justify-center p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
            {team.map(pokemon => (
              <div key={pokemon.id} className="w-14 h-14 rounded-lg bg-white dark:bg-stone-700 p-1">
                <img src={pokemon.sprite} alt={pokemon.name} className="w-full h-full object-contain" />
              </div>
            ))}
          </div>

          {/* Synergy Badge */}
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-stone-500 dark:text-stone-400">Synergy Score:</span>
            <span className={cn(
              'font-bold',
              synergyScore >= 70 ? 'text-green-600 dark:text-green-400' :
              synergyScore >= 40 ? 'text-amber-600 dark:text-amber-400' :
              'text-red-600 dark:text-red-400'
            )}>
              {synergyScore}/100
            </span>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              fullWidth
              icon={<BsDownload className="w-4 h-4" />}
              onClick={handleExport}
            >
              Download JSON
            </Button>
            <Button
              variant={copied ? 'success' : 'primary'}
              fullWidth
              icon={copied ? <BsClipboardCheck className="w-4 h-4" /> : <BsShare className="w-4 h-4" />}
              onClick={() => {
                const teamIds = team.map(p => p.pokedexId).join(',');
                const shareUrl = `${window.location.origin}/team-builder?team=${teamIds}`;
                navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                logger.info('Team URL copied to clipboard');
              }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Helper function to calculate defensive profile for a Pokemon
function calculateDefensiveProfile(types: string[]): {
  weaknesses: string[];
  resistances: string[];
  immunities: string[];
} {
  const multipliers: Record<string, number> = {};

  // Initialize all types to 1x
  ALL_TYPES.forEach(type => {
    multipliers[type] = 1;
  });

  // Apply each type's defensive properties
  types.forEach(pokemonType => {
    const typeKey = pokemonType.toLowerCase();
    const defense = DEFENSIVE_CHART[typeKey];
    if (!defense) return;

    defense.weak.forEach(type => {
      multipliers[type] *= 2;
    });
    defense.resist.forEach(type => {
      multipliers[type] *= 0.5;
    });
    defense.immune.forEach(type => {
      multipliers[type] = 0;
    });
  });

  const weaknesses: string[] = [];
  const resistances: string[] = [];
  const immunities: string[] = [];

  Object.entries(multipliers).forEach(([type, mult]) => {
    if (mult === 0) immunities.push(type);
    else if (mult > 1) weaknesses.push(type);
    else if (mult < 1) resistances.push(type);
  });

  return { weaknesses, resistances, immunities };
}

// Pokemon Search Modal Component
interface PokemonSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pokemon: TeamPokemon) => void;
  existingTeam: TeamPokemon[];
}

// Helper to fetch Pokemon data by ID
async function fetchPokemonById(id: number): Promise<TeamPokemon | null> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (response.ok) {
      const data = await response.json();
      return {
        id: `p-${data.id}`,
        pokedexId: data.id,
        name: data.name,
        types: data.types.map((t: { type: { name: string } }) => t.type.name),
        sprite: data.sprites.front_default,
        stats: {
          hp: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'hp')?.base_stat || 0,
          attack: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'attack')?.base_stat || 0,
          defense: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'defense')?.base_stat || 0,
          specialAttack: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'special-attack')?.base_stat || 0,
          specialDefense: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'special-defense')?.base_stat || 0,
          speed: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'speed')?.base_stat || 0,
        },
      };
    }
  } catch (error) {
    logger.error('Failed to fetch Pokemon', { id, error });
  }
  return null;
}

const PokemonSearchModal: React.FC<PokemonSearchModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  existingTeam,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TeamPokemon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Popular Pokemon for quick selection (with full stats)
  const popularPokemon: TeamPokemon[] = [
    { id: 'p-6', pokedexId: 6, name: 'Charizard', types: ['fire', 'flying'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', stats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100 } },
    { id: 'p-25', pokedexId: 25, name: 'Pikachu', types: ['electric'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90 } },
    { id: 'p-149', pokedexId: 149, name: 'Dragonite', types: ['dragon', 'flying'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png', stats: { hp: 91, attack: 134, defense: 95, specialAttack: 100, specialDefense: 100, speed: 80 } },
    { id: 'p-143', pokedexId: 143, name: 'Snorlax', types: ['normal'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png', stats: { hp: 160, attack: 110, defense: 65, specialAttack: 65, specialDefense: 110, speed: 30 } },
    { id: 'p-130', pokedexId: 130, name: 'Gyarados', types: ['water', 'flying'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png', stats: { hp: 95, attack: 125, defense: 79, specialAttack: 60, specialDefense: 100, speed: 81 } },
    { id: 'p-94', pokedexId: 94, name: 'Gengar', types: ['ghost', 'poison'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png', stats: { hp: 60, attack: 65, defense: 60, specialAttack: 130, specialDefense: 75, speed: 110 } },
    { id: 'p-248', pokedexId: 248, name: 'Tyranitar', types: ['rock', 'dark'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png', stats: { hp: 100, attack: 134, defense: 110, specialAttack: 95, specialDefense: 100, speed: 61 } },
    { id: 'p-376', pokedexId: 376, name: 'Metagross', types: ['steel', 'psychic'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png', stats: { hp: 80, attack: 135, defense: 130, specialAttack: 95, specialDefense: 90, speed: 70 } },
    { id: 'p-445', pokedexId: 445, name: 'Garchomp', types: ['dragon', 'ground'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/445.png', stats: { hp: 108, attack: 130, defense: 95, specialAttack: 80, specialDefense: 85, speed: 102 } },
    { id: 'p-658', pokedexId: 658, name: 'Greninja', types: ['water', 'dark'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/658.png', stats: { hp: 72, attack: 95, defense: 67, specialAttack: 103, specialDefense: 71, speed: 122 } },
    { id: 'p-887', pokedexId: 887, name: 'Dragapult', types: ['dragon', 'ghost'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/887.png', stats: { hp: 88, attack: 120, defense: 75, specialAttack: 100, specialDefense: 75, speed: 142 } },
    { id: 'p-812', pokedexId: 812, name: 'Rillaboom', types: ['grass'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/812.png', stats: { hp: 100, attack: 125, defense: 90, specialAttack: 60, specialDefense: 70, speed: 85 } },
    { id: 'p-3', pokedexId: 3, name: 'Venusaur', types: ['grass', 'poison'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png', stats: { hp: 80, attack: 82, defense: 83, specialAttack: 100, specialDefense: 100, speed: 80 } },
    { id: 'p-9', pokedexId: 9, name: 'Blastoise', types: ['water'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png', stats: { hp: 79, attack: 83, defense: 100, specialAttack: 85, specialDefense: 105, speed: 78 } },
    { id: 'p-65', pokedexId: 65, name: 'Alakazam', types: ['psychic'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png', stats: { hp: 55, attack: 50, defense: 45, specialAttack: 135, specialDefense: 95, speed: 120 } },
    { id: 'p-68', pokedexId: 68, name: 'Machamp', types: ['fighting'], sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png', stats: { hp: 90, attack: 130, defense: 80, specialAttack: 65, specialDefense: 85, speed: 55 } },
  ];

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchError(null);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      // Try direct search first (by name or ID)
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchQuery.toLowerCase().trim()}`);
      if (response.ok) {
        const data = await response.json();
        const pokemon: TeamPokemon = {
          id: `p-${data.id}`,
          pokedexId: data.id,
          name: data.name,
          types: data.types.map((t: { type: { name: string } }) => t.type.name),
          sprite: data.sprites.front_default,
          stats: {
            hp: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'hp')?.base_stat || 0,
            attack: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'attack')?.base_stat || 0,
            defense: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'defense')?.base_stat || 0,
            specialAttack: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'special-attack')?.base_stat || 0,
            specialDefense: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'special-defense')?.base_stat || 0,
            speed: data.stats.find((s: { stat: { name: string } }) => s.stat.name === 'speed')?.base_stat || 0,
          },
        };
        setSearchResults([pokemon]);
      } else {
        // Try fuzzy search by listing pokemon and filtering
        const listResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1010');
        if (listResponse.ok) {
          const listData = await listResponse.json();
          const query = searchQuery.toLowerCase().trim();
          const matches = listData.results
            .filter((p: { name: string }) => p.name.includes(query))
            .slice(0, 5);

          if (matches.length > 0) {
            const results = await Promise.all(
              matches.map(async (match: { name: string; url: string }) => {
                const id = parseInt(match.url.split('/').filter(Boolean).pop() || '0');
                return fetchPokemonById(id);
              })
            );
            setSearchResults(results.filter(Boolean) as TeamPokemon[]);
          } else {
            setSearchResults([]);
            setSearchError(`No Pokemon found matching "${searchQuery}"`);
          }
        } else {
          setSearchResults([]);
          setSearchError('Search failed. Please try again.');
        }
      }
    } catch (error) {
      logger.error('Failed to search Pokemon', { error });
      setSearchResults([]);
      setSearchError('Search failed. Please check your connection.');
    }
    setIsLoading(false);
  }, [searchQuery]);

  // Handle selecting a popular Pokemon (fetch full stats)
  const handleSelectPopular = useCallback(async (pokemon: TeamPokemon) => {
    // Popular Pokemon already have stats, just select them
    onSelect(pokemon);
  }, [onSelect]);

  const existingIds = existingTeam.map(p => p.pokedexId);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
      setHasSearched(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Pokemon"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or Pokedex number..."
              className={cn(
                'w-full pl-10 pr-4 py-3 rounded-lg',
                'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                'text-stone-800 dark:text-white placeholder:text-stone-400',
                'focus:outline-none focus:ring-2 focus:ring-amber-500'
              )}
            />
          </div>
          <Button variant="primary" onClick={handleSearch} loading={isLoading}>
            Search
          </Button>
        </div>

        {/* Search Error */}
        {searchError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            <BsExclamationTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-stone-600 dark:text-stone-300">Search Results</h4>
            {searchResults.map(pokemon => (
              <button
                key={pokemon.id}
                onClick={() => onSelect(pokemon)}
                disabled={existingIds.includes(pokemon.pokedexId)}
                className={cn(
                  'w-full flex items-center gap-4 p-3 rounded-lg',
                  'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700',
                  TRANSITION.default,
                  existingIds.includes(pokemon.pokedexId) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <img src={pokemon.sprite} alt={pokemon.name} className="w-12 h-12" />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-stone-800 dark:text-white capitalize">{pokemon.name}</div>
                  <div className="flex gap-1 mt-1">
                    {pokemon.types.map(type => (
                      <EnergyBadge key={type} type={type} size="xs" />
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-stone-400">#{pokemon.pokedexId}</span>
                  {existingIds.includes(pokemon.pokedexId) && (
                    <div className="text-xs text-amber-600 dark:text-amber-400">In team</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {hasSearched && searchResults.length === 0 && !searchError && !isLoading && (
          <div className="text-center py-4 text-stone-500 dark:text-stone-400 text-sm">
            No Pokemon found. Try a different search term.
          </div>
        )}

        {/* Popular Pokemon */}
        <div>
          <h4 className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-2">Popular Pokemon</h4>
          <div className="grid grid-cols-4 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
            {popularPokemon.map(pokemon => (
              <button
                key={pokemon.id}
                onClick={() => handleSelectPopular(pokemon)}
                disabled={existingIds.includes(pokemon.pokedexId)}
                className={cn(
                  'flex flex-col items-center p-2 rounded-lg',
                  'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700',
                  TRANSITION.default,
                  existingIds.includes(pokemon.pokedexId) && 'opacity-50 cursor-not-allowed'
                )}
              >
                <img src={pokemon.sprite} alt={pokemon.name} className="w-12 h-12" />
                <span className="text-xs text-stone-600 dark:text-stone-300 capitalize mt-1 truncate w-full text-center">
                  {pokemon.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TeamBuilderPanel;
