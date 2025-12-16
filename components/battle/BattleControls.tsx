/**
 * BattleControls Component
 *
 * Battle control buttons and move selection grid.
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { TypeGradientBadge } from '@/components/ui/design-system/TypeGradientBadge';
import { POKEMON_TYPE_COLORS } from '@/utils/unifiedTypeColors';
import { cn } from '@/utils/cn';
import type { Pokemon, PokemonMove, Move } from '@/types/pokemon';
import type { BattleConfig } from '@/hooks/useBattleSimulator';

interface MoveButtonProps {
  move: PokemonMove;
  moveData: Move | undefined;
  effectiveness: number;
  onClick: () => void;
  disabled?: boolean;
}

const MoveButton = memo(({ move, moveData, effectiveness, onClick, disabled }: MoveButtonProps) => {
  const typeColor = moveData?.type
    ? POKEMON_TYPE_COLORS[moveData.type.name as keyof typeof POKEMON_TYPE_COLORS]
    : '#6B7280';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'relative p-4 border-2 rounded-lg min-h-[100px] transition-all duration-200',
        'hover:scale-105 hover:shadow-lg overflow-hidden',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
      )}
      style={{
        backgroundColor: `${typeColor}15`,
        borderColor: `${typeColor}40`
      }}
    >
      {/* Type Badge Background */}
      <div className="absolute top-0 right-0 opacity-20">
        {moveData?.type && <TypeGradientBadge type={moveData.type.name} size="sm" />}
      </div>

      {/* Move Content */}
      <div className="relative z-10">
        <div className="font-semibold capitalize text-stone-700 dark:text-stone-300">
          {move.move.name.replace(/-/g, ' ')}
        </div>

        {moveData && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-600 dark:text-stone-400">
                PP: {moveData.pp}/{moveData.pp}
              </span>
              {effectiveness > 1 && (
                <span className="text-red-600 font-bold">Super Effective!</span>
              )}
              {effectiveness < 1 && effectiveness > 0 && (
                <span className="text-stone-500">Not very effective</span>
              )}
            </div>

            <div className="flex justify-between text-xs text-stone-500 dark:text-stone-400">
              <span>Power: {moveData.power || '-'}</span>
              <span>Acc: {moveData.accuracy || '-'}%</span>
            </div>
          </div>
        )}
      </div>
    </button>
  );
});

MoveButton.displayName = 'MoveButton';

interface BattleControlsProps {
  pokemon1: Pokemon | null;
  pokemon2: Pokemon | null;
  config1: BattleConfig;
  config2: BattleConfig;
  currentTurn: 1 | 2 | null;
  battleActive: boolean;
  isSimulating: boolean;
  movesData: Record<string, Move>;
  onExecuteMove: (player: 1 | 2, move: PokemonMove) => void;
  onStartBattle: () => void;
  onFastForward: () => void;
  onReset: () => void;
  getTypeEffectiveness: (moveType: string, defenderTypes: { type: { name: string } }[]) => number;
}

export const BattleControls: React.FC<BattleControlsProps> = memo(({
  pokemon1,
  pokemon2,
  config1,
  config2,
  currentTurn,
  battleActive,
  isSimulating,
  movesData,
  onExecuteMove,
  onStartBattle,
  onFastForward,
  onReset,
  getTypeEffectiveness,
}) => {
  const canStartBattle = pokemon1 && pokemon2 && !battleActive;
  const hasSelectedMoves = config1.selectedMoves.length > 0 || config2.selectedMoves.length > 0;

  // Get effectiveness for a move against the opponent
  const getMoveEffectiveness = (move: PokemonMove, targetPokemon: Pokemon | null) => {
    const moveData = movesData[move.move.name];
    if (!moveData?.type || !targetPokemon?.types) return 1;
    return getTypeEffectiveness(moveData.type.name, targetPokemon.types);
  };

  return (
    <div className="space-y-6">
      {/* Battle Start/Reset Controls */}
      {!battleActive && (
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={onStartBattle}
            disabled={!canStartBattle}
            className={cn(
              'px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-200',
              'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700',
              'text-white hover:shadow-lg',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md'
            )}
          >
            Start Battle
          </button>

          {(pokemon1 || pokemon2) && (
            <button
              onClick={onReset}
              className={cn(
                'px-4 py-3 font-medium rounded-lg transition-all duration-200',
                'bg-stone-700 hover:bg-stone-800 text-white'
              )}
            >
              Reset All
            </button>
          )}
        </div>
      )}

      {/* Active Battle Controls */}
      {battleActive && (
        <div className="space-y-6">
          {/* Current Turn Indicator */}
          <div className="text-center">
            <span className="text-lg font-semibold text-stone-700 dark:text-stone-300">
              {currentTurn === 1 ? `${config1.level > 0 ? 'Player 1' : 'Player 1'}'s Turn` : `Player 2's Turn`}
            </span>
          </div>

          {/* Move Grid for Current Player */}
          {currentTurn === 1 && config1.selectedMoves.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {config1.selectedMoves.map((move, index) => (
                <MoveButton
                  key={index}
                  move={move}
                  moveData={movesData[move.move.name]}
                  effectiveness={getMoveEffectiveness(move, pokemon2)}
                  onClick={() => onExecuteMove(1, move)}
                  disabled={isSimulating}
                />
              ))}
            </div>
          )}

          {currentTurn === 2 && config2.selectedMoves.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {config2.selectedMoves.map((move, index) => (
                <MoveButton
                  key={index}
                  move={move}
                  moveData={movesData[move.move.name]}
                  effectiveness={getMoveEffectiveness(move, pokemon1)}
                  onClick={() => onExecuteMove(2, move)}
                  disabled={isSimulating}
                />
              ))}
            </div>
          )}

          {/* Battle Control Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onFastForward}
              disabled={isSimulating}
              className={cn(
                'px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-200',
                'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
                'text-white hover:shadow-lg',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isSimulating ? 'Simulating...' : 'Auto Complete Battle'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Battle Option */}
      {!battleActive && canStartBattle && (
        <div className="pt-6 border-t border-stone-200 dark:border-stone-700">
          <h4 className="text-lg font-medium mb-3 text-center text-stone-700 dark:text-stone-300">
            Alternative Battle Mode
          </h4>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onFastForward}
              disabled={battleActive}
              className={cn(
                'px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-200',
                'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600',
                'text-white hover:shadow-lg',
                'disabled:opacity-50'
              )}
            >
              Quick Battle (Auto)
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

BattleControls.displayName = 'BattleControls';

export default BattleControls;
