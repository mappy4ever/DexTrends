/**
 * BattleSetup Component
 *
 * Step-by-step Pokemon and move selection for battle setup.
 * Combines Pokemon selection with inline move configuration.
 */

import React, { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiCheck, FiChevronRight, FiZap } from 'react-icons/fi';
import { Container } from '@/components/ui/Container';
import { TypeBadge } from '@/components/ui/TypeBadge';
import { POKEMON_TYPE_COLORS } from '@/utils/unifiedTypeColors';
import { cn } from '@/utils/cn';
import type { Pokemon, PokemonMove, Move } from '@/types/pokemon';
import type { BattleConfig } from '@/hooks/useBattleSimulator';

interface BattleSetupProps {
  // Player 1
  pokemon1: Pokemon | null;
  config1: BattleConfig;
  availableMoves1: PokemonMove[];
  // Player 2
  pokemon2: Pokemon | null;
  config2: BattleConfig;
  availableMoves2: PokemonMove[];
  // Move data
  movesData: Record<string, Move>;
  // Callbacks
  onSelectPokemon: (player: 1 | 2) => void;
  onRandomPokemon: (player: 1 | 2) => void;
  onToggleMove: (player: 1 | 2, move: PokemonMove) => void;
  onAutoSelectMoves: (player: 1 | 2) => void;
  onStartBattle: () => void;
  onSimulateBattle: () => void;
  // Loading
  isLoading?: boolean;
}

// Step indicator component
const StepIndicator = memo(({ step, currentStep }: { step: number; currentStep: number }) => {
  const isComplete = currentStep > step;
  const isCurrent = currentStep === step;

  return (
    <div className={cn(
      'flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300',
      isComplete && 'bg-green-500 text-white',
      isCurrent && 'bg-amber-500 text-white ring-4 ring-amber-200 dark:ring-amber-500/30',
      !isComplete && !isCurrent && 'bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
    )}>
      {isComplete ? <FiCheck className="w-4 h-4" /> : step}
    </div>
  );
});
StepIndicator.displayName = 'StepIndicator';

// Compact move chip for selection
const MoveChip = memo(({
  move,
  moveData,
  isSelected,
  onClick,
  disabled
}: {
  move: PokemonMove;
  moveData?: Move;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) => {
  const typeColor = moveData?.type
    ? POKEMON_TYPE_COLORS[moveData.type.name as keyof typeof POKEMON_TYPE_COLORS]
    : '#6B7280';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        'border-2 flex items-center gap-2',
        isSelected
          ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
          : 'border-stone-200 dark:border-stone-600 hover:border-stone-300 dark:hover:border-stone-500',
        disabled && !isSelected && 'opacity-50 cursor-not-allowed'
      )}
      style={isSelected ? {} : { borderLeftColor: typeColor, borderLeftWidth: 4 }}
    >
      <span className="capitalize">{move.move.name.replace(/-/g, ' ')}</span>
      {isSelected && <FiCheck className="w-4 h-4 text-green-600" />}
      {moveData?.power && (
        <span className="text-xs text-stone-500 dark:text-stone-400">
          {moveData.power}
        </span>
      )}
    </button>
  );
});
MoveChip.displayName = 'MoveChip';

// Player setup card
const PlayerSetupCard = memo(({
  playerNumber,
  pokemon,
  config,
  availableMoves,
  movesData,
  onSelectPokemon,
  onRandomPokemon,
  onToggleMove,
  onAutoSelectMoves,
}: {
  playerNumber: 1 | 2;
  pokemon: Pokemon | null;
  config: BattleConfig;
  availableMoves: PokemonMove[];
  movesData: Record<string, Move>;
  onSelectPokemon: () => void;
  onRandomPokemon: () => void;
  onToggleMove: (move: PokemonMove) => void;
  onAutoSelectMoves: () => void;
}) => {
  const [showAllMoves, setShowAllMoves] = useState(false);
  const selectedMoveNames = config.selectedMoves.map(m => m.move.name);
  const displayMoves = showAllMoves ? availableMoves.slice(0, 30) : availableMoves.slice(0, 8);
  const hasMoreMoves = availableMoves.length > 8;

  return (
    <Container variant="elevated" className="p-5">
      {/* Player Label */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-stone-700 dark:text-stone-200">
          Player {playerNumber}
        </h3>
        {pokemon && (
          <span className="text-xs px-2 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
            Lv. {config.level}
          </span>
        )}
      </div>

      {pokemon ? (
        <>
          {/* Selected Pokemon Display */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-stone-200 dark:border-stone-700">
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={pokemon.sprites?.front_default || pokemon.sprites?.other?.['official-artwork']?.front_default || ''}
                alt={pokemon.name}
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xl font-bold capitalize text-stone-800 dark:text-white truncate">
                {pokemon.name}
              </h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {pokemon.types?.map((type, index) => (
                  <TypeBadge key={index} type={type.type.name} size="xs" />
                ))}
              </div>
              <button
                onClick={onSelectPokemon}
                className="mt-2 text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
              >
                Change Pokemon
              </button>
            </div>
          </div>

          {/* Move Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-semibold text-stone-700 dark:text-stone-300">
                Select Moves ({config.selectedMoves.length}/4)
              </h5>
              <button
                onClick={onAutoSelectMoves}
                className="text-xs px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                <FiZap className="inline w-3 h-3 mr-1" />
                Auto-pick
              </button>
            </div>

            {/* Move Grid */}
            <div className="flex flex-wrap gap-2">
              {displayMoves.map((move, index) => (
                <MoveChip
                  key={index}
                  move={move}
                  moveData={movesData[move.move.name]}
                  isSelected={selectedMoveNames.includes(move.move.name)}
                  onClick={() => onToggleMove(move)}
                  disabled={config.selectedMoves.length >= 4 && !selectedMoveNames.includes(move.move.name)}
                />
              ))}
            </div>

            {/* Show More Toggle */}
            {hasMoreMoves && (
              <button
                onClick={() => setShowAllMoves(!showAllMoves)}
                className="mt-3 text-sm text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                {showAllMoves ? 'Show less' : `Show ${availableMoves.length - 8} more moves...`}
              </button>
            )}
          </div>
        </>
      ) : (
        /* Empty State */
        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-4 bg-stone-100 dark:bg-stone-700 rounded-full flex items-center justify-center">
            <span className="text-5xl opacity-50">?</span>
          </div>
          <p className="text-stone-500 dark:text-stone-400 mb-4">
            No Pokemon selected
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onSelectPokemon}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
            >
              Choose Pokemon
            </button>
            <button
              onClick={onRandomPokemon}
              className="px-4 py-2.5 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-lg font-medium transition-colors"
            >
              <FiRefreshCw className="inline w-4 h-4 mr-1" />
              Random
            </button>
          </div>
        </div>
      )}
    </Container>
  );
});
PlayerSetupCard.displayName = 'PlayerSetupCard';

export const BattleSetup: React.FC<BattleSetupProps> = memo(({
  pokemon1,
  config1,
  availableMoves1,
  pokemon2,
  config2,
  availableMoves2,
  movesData,
  onSelectPokemon,
  onRandomPokemon,
  onToggleMove,
  onAutoSelectMoves,
  onStartBattle,
  onSimulateBattle,
  isLoading,
}) => {
  // Calculate current step
  const hasBothPokemon = pokemon1 !== null && pokemon2 !== null;
  const hasMoves = config1.selectedMoves.length > 0 && config2.selectedMoves.length > 0;
  const currentStep = !hasBothPokemon ? 1 : !hasMoves ? 2 : 3;

  const canBattle = hasBothPokemon && hasMoves;

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-3 mb-6">
        <StepIndicator step={1} currentStep={currentStep} />
        <span className="text-xs text-stone-500 dark:text-stone-400">Choose Pokemon</span>
        <FiChevronRight className="text-stone-400" />
        <StepIndicator step={2} currentStep={currentStep} />
        <span className="text-xs text-stone-500 dark:text-stone-400">Select Moves</span>
        <FiChevronRight className="text-stone-400" />
        <StepIndicator step={3} currentStep={currentStep} />
        <span className="text-xs text-stone-500 dark:text-stone-400">Battle!</span>
      </div>

      {/* Two-Column Setup */}
      <div className="grid md:grid-cols-2 gap-6">
        <PlayerSetupCard
          playerNumber={1}
          pokemon={pokemon1}
          config={config1}
          availableMoves={availableMoves1}
          movesData={movesData}
          onSelectPokemon={() => onSelectPokemon(1)}
          onRandomPokemon={() => onRandomPokemon(1)}
          onToggleMove={(move) => onToggleMove(1, move)}
          onAutoSelectMoves={() => onAutoSelectMoves(1)}
        />

        {/* VS Divider (visible on mobile) */}
        <div className="flex md:hidden items-center justify-center">
          <div className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-full text-sm">
            VS
          </div>
        </div>

        <PlayerSetupCard
          playerNumber={2}
          pokemon={pokemon2}
          config={config2}
          availableMoves={availableMoves2}
          movesData={movesData}
          onSelectPokemon={() => onSelectPokemon(2)}
          onRandomPokemon={() => onRandomPokemon(2)}
          onToggleMove={(move) => onToggleMove(2, move)}
          onAutoSelectMoves={() => onAutoSelectMoves(2)}
        />
      </div>

      {/* Battle Action Buttons */}
      <AnimatePresence>
        {hasBothPokemon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          >
            <button
              onClick={onStartBattle}
              disabled={!canBattle || isLoading}
              className={cn(
                'px-8 py-3 font-bold text-lg rounded-xl shadow-lg transition-all duration-200',
                'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                'hover:from-amber-600 hover:to-orange-600 hover:shadow-xl hover:scale-105',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg'
              )}
            >
              {!hasMoves ? 'Select Moves First' : 'Start Battle'}
            </button>

            <span className="text-stone-400 dark:text-stone-500 text-sm">or</span>

            <button
              onClick={onSimulateBattle}
              disabled={!hasBothPokemon || isLoading}
              className={cn(
                'px-6 py-3 font-medium rounded-xl border-2 transition-all duration-200',
                'border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200',
                'hover:bg-stone-100 dark:hover:bg-stone-800',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              Quick Simulate
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Text */}
      {!hasBothPokemon && (
        <p className="text-center text-sm text-stone-500 dark:text-stone-400">
          Select a Pokemon for each player to begin
        </p>
      )}
    </div>
  );
});

BattleSetup.displayName = 'BattleSetup';

export default BattleSetup;
