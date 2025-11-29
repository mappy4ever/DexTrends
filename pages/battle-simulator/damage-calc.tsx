import React, { useState, useMemo } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { IoArrowBack, IoInformationCircle, IoFlash, IoShield, IoFitness } from 'react-icons/io5';
import FullBleedWrapper from '../../components/ui/FullBleedWrapper';
import { Container } from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { cn } from '../../utils/cn';
import { TYPOGRAPHY, TRANSITION } from '../../components/ui/design-system/glass-constants';

// ===========================================
// TYPES & DATA
// ===========================================

interface CalcState {
  level: number;
  attackStat: number;
  defenseStat: number;
  movePower: number;
  moveCategory: 'physical' | 'special';
  stab: boolean;
  typeEffectiveness: number;
  critical: boolean;
  weather: 'none' | 'sun' | 'rain' | 'sand' | 'hail' | 'snow';
  otherModifier: number;
}

const TYPE_EFFECTIVENESS_OPTIONS = [
  { value: '0', label: 'Immune (0x)' },
  { value: '0.25', label: 'Double Resist (0.25x)' },
  { value: '0.5', label: 'Not Very Effective (0.5x)' },
  { value: '1', label: 'Neutral (1x)' },
  { value: '2', label: 'Super Effective (2x)' },
  { value: '4', label: 'Double Super Effective (4x)' },
];

const WEATHER_OPTIONS = [
  { value: 'none', label: 'No Weather' },
  { value: 'sun', label: 'Harsh Sunlight' },
  { value: 'rain', label: 'Rain' },
  { value: 'sand', label: 'Sandstorm' },
  { value: 'hail', label: 'Hail' },
  { value: 'snow', label: 'Snow' },
];

const COMMON_MOVE_POWERS = [
  { value: 40, label: '40 (Weak)' },
  { value: 60, label: '60 (Average)' },
  { value: 80, label: '80 (Strong)' },
  { value: 90, label: '90 (Very Strong)' },
  { value: 100, label: '100 (Powerful)' },
  { value: 120, label: '120 (Very Powerful)' },
  { value: 150, label: '150 (Signature Move)' },
];

// ===========================================
// DAMAGE CALCULATION
// ===========================================

function calculateDamage(state: CalcState): { min: number; max: number; average: number } {
  const {
    level,
    attackStat,
    defenseStat,
    movePower,
    stab,
    typeEffectiveness,
    critical,
    weather,
    otherModifier,
  } = state;

  // Base damage formula
  const baseDamage = Math.floor(((2 * level / 5 + 2) * movePower * attackStat / defenseStat) / 50) + 2;

  // Calculate modifiers
  let modifier = 1;

  // STAB (Same Type Attack Bonus)
  if (stab) modifier *= 1.5;

  // Type effectiveness
  modifier *= typeEffectiveness;

  // Critical hit
  if (critical) modifier *= 1.5;

  // Weather (simplified)
  if (weather === 'sun' && state.moveCategory === 'special') modifier *= 1.5; // Fire boost
  if (weather === 'rain' && state.moveCategory === 'special') modifier *= 1.5; // Water boost

  // Other modifier
  modifier *= otherModifier;

  // Random factor range (0.85 to 1.0)
  const minDamage = Math.floor(baseDamage * modifier * 0.85);
  const maxDamage = Math.floor(baseDamage * modifier * 1.0);
  const avgDamage = Math.floor(baseDamage * modifier * 0.925);

  return { min: minDamage, max: maxDamage, average: avgDamage };
}

// ===========================================
// INPUT COMPONENT
// ===========================================

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  icon?: React.ReactNode;
  helpText?: string;
}

function NumberInput({ label, value, onChange, min = 1, max = 999, icon, helpText }: NumberInputProps) {
  return (
    <div>
      <label className={cn(TYPOGRAPHY.label, 'flex items-center gap-1.5 mb-1.5')}>
        {icon}
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
        min={min}
        max={max}
        className={cn(
          'w-full h-11 px-4 rounded-xl',
          'bg-white dark:bg-stone-800',
          'border border-stone-200 dark:border-stone-700',
          'text-stone-900 dark:text-white',
          'placeholder-stone-400 dark:placeholder-stone-500',
          'focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500',
          TRANSITION.fast
        )}
      />
      {helpText && (
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{helpText}</p>
      )}
    </div>
  );
}

// ===========================================
// MAIN COMPONENT
// ===========================================

const DamageCalcPage: NextPage = () => {
  const [state, setState] = useState<CalcState>({
    level: 50,
    attackStat: 100,
    defenseStat: 100,
    movePower: 80,
    moveCategory: 'physical',
    stab: false,
    typeEffectiveness: 1,
    critical: false,
    weather: 'none',
    otherModifier: 1,
  });

  const updateState = (updates: Partial<CalcState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Calculate damage whenever state changes
  const damage = useMemo(() => calculateDamage(state), [state]);

  // Calculate percentage of 200 HP Pokemon
  const damagePercent = Math.round((damage.average / 200) * 100);

  return (
    <>
      <Head>
        <title>Damage Calculator | Pokemon Battle Tools | DexTrends</title>
        <meta name="description" content="Calculate Pokemon battle damage with type effectiveness, STAB, critical hits, and weather modifiers." />
      </Head>

      <FullBleedWrapper gradient="pokedex">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/battle-simulator">
              <Button variant="ghost" size="sm" icon={<IoArrowBack className="w-4 h-4" />}>
                Back
              </Button>
            </Link>
            <div>
              <h1 className={TYPOGRAPHY.heading.h2}>Damage Calculator</h1>
              <p className="text-stone-500 dark:text-stone-400 text-sm">
                Calculate attack damage with all modifiers
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column - Inputs */}
            <div className="space-y-4">
              {/* Basic Stats */}
              <Container variant="default" className="p-4">
                <h2 className={cn(TYPOGRAPHY.heading.h5, 'mb-4 flex items-center gap-2')}>
                  <IoFitness className="w-5 h-5 text-amber-600" />
                  Basic Stats
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <NumberInput
                    label="Level"
                    value={state.level}
                    onChange={(v) => updateState({ level: v })}
                    min={1}
                    max={100}
                    helpText="1-100"
                  />
                  <NumberInput
                    label="Move Power"
                    value={state.movePower}
                    onChange={(v) => updateState({ movePower: v })}
                    min={0}
                    max={300}
                    icon={<IoFlash className="w-3.5 h-3.5 text-amber-500" />}
                  />
                  <NumberInput
                    label={state.moveCategory === 'physical' ? 'Attack' : 'Sp. Attack'}
                    value={state.attackStat}
                    onChange={(v) => updateState({ attackStat: v })}
                    min={1}
                    max={999}
                  />
                  <NumberInput
                    label={state.moveCategory === 'physical' ? 'Defense' : 'Sp. Defense'}
                    value={state.defenseStat}
                    onChange={(v) => updateState({ defenseStat: v })}
                    min={1}
                    max={999}
                    icon={<IoShield className="w-3.5 h-3.5 text-blue-500" />}
                  />
                </div>

                {/* Quick power buttons */}
                <div className="mt-4">
                  <label className={cn(TYPOGRAPHY.label, 'mb-2 block')}>Quick Power Select</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_MOVE_POWERS.map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => updateState({ movePower: value })}
                        className={cn(
                          'px-3 py-1 text-xs font-medium rounded-full',
                          TRANSITION.fast,
                          state.movePower === value
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </Container>

              {/* Modifiers */}
              <Container variant="default" className="p-4">
                <h2 className={cn(TYPOGRAPHY.heading.h5, 'mb-4')}>Modifiers</h2>

                {/* Move Category Toggle */}
                <div className="mb-4">
                  <label className={cn(TYPOGRAPHY.label, 'mb-2 block')}>Move Category</label>
                  <div className="flex gap-2">
                    {(['physical', 'special'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateState({ moveCategory: cat })}
                        className={cn(
                          'flex-1 py-2 px-4 rounded-xl text-sm font-medium',
                          TRANSITION.fast,
                          state.moveCategory === cat
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                        )}
                      >
                        {cat === 'physical' ? '⚔️ Physical' : '✨ Special'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Effectiveness */}
                <div className="mb-4">
                  <Select
                    label="Type Effectiveness"
                    value={String(state.typeEffectiveness)}
                    onChange={(v: string) => updateState({ typeEffectiveness: Number(v) })}
                    options={TYPE_EFFECTIVENESS_OPTIONS}
                  />
                </div>

                {/* Weather */}
                <div className="mb-4">
                  <Select
                    label="Weather"
                    value={state.weather}
                    onChange={(v: string) => updateState({ weather: v as CalcState['weather'] })}
                    options={WEATHER_OPTIONS}
                  />
                </div>

                {/* Toggle modifiers */}
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.stab}
                      onChange={(e) => updateState({ stab: e.target.checked })}
                      className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      STAB (1.5x)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.critical}
                      onChange={(e) => updateState({ critical: e.target.checked })}
                      className="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                      Critical Hit (1.5x)
                    </span>
                  </label>
                </div>
              </Container>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-4">
              {/* Main Result */}
              <Container variant="elevated" className="p-6">
                <h2 className={cn(TYPOGRAPHY.heading.h5, 'mb-4 text-center')}>Damage Output</h2>

                {/* Big number display */}
                <div className="text-center mb-6">
                  <div className="text-5xl md:text-6xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {damage.average}
                  </div>
                  <div className="text-stone-500 dark:text-stone-400 text-sm mt-1">
                    Average Damage
                  </div>
                </div>

                {/* Range */}
                <div className="flex justify-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-700 dark:text-stone-300 tabular-nums">
                      {damage.min}
                    </div>
                    <div className="text-xs text-stone-500">Min (85%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-stone-700 dark:text-stone-300 tabular-nums">
                      {damage.max}
                    </div>
                    <div className="text-xs text-stone-500">Max (100%)</div>
                  </div>
                </div>

                {/* Damage bar visualization */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-stone-500 mb-1">
                    <span>vs 200 HP Pokemon</span>
                    <span>{damagePercent}%</span>
                  </div>
                  <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        damagePercent >= 100 ? 'bg-red-500' :
                        damagePercent >= 50 ? 'bg-orange-500' :
                        damagePercent >= 25 ? 'bg-amber-500' : 'bg-green-500'
                      )}
                      style={{ width: `${Math.min(damagePercent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* KO info */}
                <div className="text-center text-sm">
                  {damagePercent >= 100 ? (
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      ⚡ Guaranteed OHKO!
                    </span>
                  ) : damagePercent >= 50 ? (
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      🎯 2HKO likely
                    </span>
                  ) : damagePercent >= 34 ? (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      💪 3HKO range
                    </span>
                  ) : (
                    <span className="text-stone-500 dark:text-stone-400">
                      Low damage - may need boosts
                    </span>
                  )}
                </div>
              </Container>

              {/* Formula Info */}
              <Container variant="outline" className="p-4">
                <div className="flex items-start gap-2">
                  <IoInformationCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    <p className="font-medium mb-1">Damage Formula:</p>
                    <code className="text-xs bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded block">
                      ((2×Lv/5+2) × Power × Atk/Def / 50 + 2) × Modifiers × Random(0.85-1.0)
                    </code>
                    <p className="mt-2 text-xs">
                      This is a simplified calculation. Actual damage may vary based on abilities, items, and other factors.
                    </p>
                  </div>
                </div>
              </Container>

              {/* Active Modifiers Summary */}
              <Container variant="ghost" className="p-4">
                <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                  Active Modifiers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {state.stab && (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      STAB ×1.5
                    </span>
                  )}
                  {state.typeEffectiveness !== 1 && (
                    <span className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      state.typeEffectiveness > 1
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    )}>
                      Type ×{state.typeEffectiveness}
                    </span>
                  )}
                  {state.critical && (
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-full">
                      Critical ×1.5
                    </span>
                  )}
                  {state.weather !== 'none' && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                      {state.weather}
                    </span>
                  )}
                  {!state.stab && state.typeEffectiveness === 1 && !state.critical && state.weather === 'none' && (
                    <span className="text-stone-500 dark:text-stone-400 text-xs">
                      No modifiers active
                    </span>
                  )}
                </div>
              </Container>
            </div>
          </div>
        </div>
      </FullBleedWrapper>
    </>
  );
};

// Mark this page as full bleed to remove Layout padding
(DamageCalcPage as any).fullBleed = true;

export default DamageCalcPage;
