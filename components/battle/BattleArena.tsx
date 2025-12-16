/**
 * BattleArena Component
 *
 * Clean battle display showing two Pokemon facing each other with HP bars,
 * current turn indicator, and damage effects.
 */

import React, { memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap } from 'react-icons/fi';
import { TypeBadge } from '@/components/ui/TypeBadge';
import {
  DamageNumber,
  AnimatedHPBar,
  BattleAnnouncement,
} from '@/components/ui/BattleEffects';
import { POKEMON_TYPE_COLORS } from '@/utils/unifiedTypeColors';
import { cn } from '@/utils/cn';
import type { Pokemon, PokemonMove, Move } from '@/types/pokemon';
import type { BattleConfig, DamageEffect, Announcement } from '@/hooks/useBattleSimulator';

interface BattleArenaProps {
  pokemon1: Pokemon;
  pokemon2: Pokemon;
  config1: BattleConfig;
  config2: BattleConfig;
  currentHP1: number;
  currentHP2: number;
  maxHP1: number;
  maxHP2: number;
  player1Name: string;
  player2Name: string;
  currentTurn: 1 | 2 | null;
  hitTarget: 1 | 2 | null;
  damageEffect: DamageEffect | null;
  announcement: Announcement | null;
  movesData: Record<string, Move>;
  isSimulating: boolean;
  onExecuteMove: (player: 1 | 2, move: PokemonMove) => void;
  onDamageEffectClear: () => void;
  onAnnouncementClear: () => void;
  onFastForward: () => void;
  getTypeEffectiveness: (moveType: string, defenderTypes: { type: { name: string } }[]) => number;
}

// Compact Pokemon display for battle
const BattlePokemon = memo(({
  pokemon,
  currentHP,
  maxHP,
  playerName,
  isActive,
  isHit,
  position,
  level,
}: {
  pokemon: Pokemon;
  currentHP: number;
  maxHP: number;
  playerName: string;
  isActive: boolean;
  isHit: boolean;
  position: 'left' | 'right';
  level: number;
}) => {
  const hpPercentage = maxHP > 0 ? (currentHP / maxHP) * 100 : 0;
  const isFainted = currentHP <= 0;

  return (
    <motion.div
      className={cn(
        'relative flex flex-col items-center',
        position === 'right' && 'md:flex-row-reverse'
      )}
      animate={isHit ? { x: position === 'left' ? [-10, 10, -10, 5, 0] : [10, -10, 10, -5, 0] } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Pokemon Sprite */}
      <div className={cn(
        'relative w-28 h-28 md:w-36 md:h-36',
        isFainted && 'grayscale opacity-50'
      )}>
        <Image
          src={pokemon.sprites?.front_default || pokemon.sprites?.other?.['official-artwork']?.front_default || ''}
          alt={pokemon.name}
          fill
          className={cn(
            'object-contain drop-shadow-lg transition-all duration-300',
            position === 'right' && 'scale-x-[-1]',
            isActive && !isFainted && 'animate-pulse'
          )}
          priority
        />
        {/* Active Turn Indicator */}
        {isActive && !isFainted && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <FiZap className="w-5 h-5 text-amber-500" />
          </motion.div>
        )}
      </div>

      {/* Info Panel */}
      <div className={cn(
        'w-full max-w-[160px] mt-2',
        'bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm rounded-lg p-3 shadow-md',
        isActive && 'ring-2 ring-amber-400'
      )}>
        {/* Name & Level */}
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold capitalize text-stone-800 dark:text-white text-sm truncate">
            {pokemon.name}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            Lv.{level}
          </span>
        </div>

        {/* Type Badges */}
        <div className="flex gap-1 mb-2">
          {pokemon.types?.map((type, index) => (
            <TypeBadge key={index} type={type.type.name} size="xs" />
          ))}
        </div>

        {/* HP Bar */}
        <div className="space-y-0.5">
          <AnimatedHPBar current={currentHP} max={maxHP} />
          <div className="flex justify-between text-xs text-stone-600 dark:text-stone-400">
            <span>HP</span>
            <span>{Math.max(0, currentHP)}/{maxHP}</span>
          </div>
        </div>

        {/* Player Name */}
        <div className="mt-2 pt-2 border-t border-stone-200 dark:border-stone-700">
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {playerName}
          </span>
        </div>
      </div>
    </motion.div>
  );
});
BattlePokemon.displayName = 'BattlePokemon';

// Move button during battle
const BattleMoveButton = memo(({
  move,
  moveData,
  effectiveness,
  onClick,
  disabled,
}: {
  move: PokemonMove;
  moveData?: Move;
  effectiveness: number;
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
        'p-3 rounded-lg border-2 text-left transition-all duration-200',
        'hover:scale-102 hover:shadow-md active:scale-98',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
      )}
      style={{
        backgroundColor: `${typeColor}15`,
        borderColor: typeColor,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold capitalize text-sm text-stone-700 dark:text-stone-200">
          {move.move.name.replace(/-/g, ' ')}
        </span>
        {moveData?.type && (
          <TypeBadge type={moveData.type.name} size="xs" />
        )}
      </div>
      <div className="flex items-center gap-3 mt-1 text-xs text-stone-500 dark:text-stone-400">
        <span>Pwr: {moveData?.power || '-'}</span>
        <span>Acc: {moveData?.accuracy || '-'}%</span>
        {effectiveness > 1 && (
          <span className="text-green-600 dark:text-green-400 font-bold">2x</span>
        )}
        {effectiveness < 1 && effectiveness > 0 && (
          <span className="text-red-500 font-bold">½x</span>
        )}
        {effectiveness === 0 && (
          <span className="text-stone-400 font-bold">0x</span>
        )}
      </div>
    </button>
  );
});
BattleMoveButton.displayName = 'BattleMoveButton';

export const BattleArena: React.FC<BattleArenaProps> = memo(({
  pokemon1,
  pokemon2,
  config1,
  config2,
  currentHP1,
  currentHP2,
  maxHP1,
  maxHP2,
  player1Name,
  player2Name,
  currentTurn,
  hitTarget,
  damageEffect,
  announcement,
  movesData,
  isSimulating,
  onExecuteMove,
  onDamageEffectClear,
  onAnnouncementClear,
  onFastForward,
  getTypeEffectiveness,
}) => {
  const isBattleOver = currentHP1 <= 0 || currentHP2 <= 0;
  const currentPokemon = currentTurn === 1 ? pokemon1 : pokemon2;
  const currentMoves = currentTurn === 1 ? config1.selectedMoves : config2.selectedMoves;
  const targetPokemon = currentTurn === 1 ? pokemon2 : pokemon1;

  // Get effectiveness for a move
  const getMoveEffectiveness = (move: PokemonMove) => {
    const moveData = movesData[move.move.name];
    if (!moveData?.type || !targetPokemon?.types) return 1;
    return getTypeEffectiveness(moveData.type.name, targetPokemon.types);
  };

  return (
    <div className="relative">
      {/* Battle Announcement Overlay */}
      <AnimatePresence>
        {announcement && (
          <BattleAnnouncement
            message={announcement.message}
            type={announcement.type}
            onComplete={onAnnouncementClear}
          />
        )}
      </AnimatePresence>

      {/* Battle Field */}
      <div className="relative bg-gradient-to-b from-sky-100 to-green-100 dark:from-stone-800 dark:to-stone-900 rounded-2xl p-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white dark:border-stone-600 rounded-full" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white dark:bg-stone-600" />
        </div>

        {/* Pokemon Display */}
        <div className="relative flex items-center justify-between gap-4 md:gap-12">
          <BattlePokemon
            pokemon={pokemon1}
            currentHP={currentHP1}
            maxHP={maxHP1}
            playerName={player1Name}
            isActive={currentTurn === 1 && !isBattleOver}
            isHit={hitTarget === 1}
            position="left"
            level={config1.level}
          />

          {/* VS Badge */}
          <div className="flex-shrink-0">
            <motion.div
              className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
              animate={!isBattleOver ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="text-white font-black text-sm md:text-lg">VS</span>
            </motion.div>
          </div>

          <BattlePokemon
            pokemon={pokemon2}
            currentHP={currentHP2}
            maxHP={maxHP2}
            playerName={player2Name}
            isActive={currentTurn === 2 && !isBattleOver}
            isHit={hitTarget === 2}
            position="right"
            level={config2.level}
          />
        </div>

        {/* Damage Numbers */}
        <AnimatePresence>
          {damageEffect && (
            <DamageNumber
              damage={damageEffect.damage}
              position={damageEffect.position}
              isCritical={damageEffect.isCritical}
              effectiveness={damageEffect.effectiveness}
              onComplete={onDamageEffectClear}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Move Selection - Shows whose turn it is and their moves */}
      {!isBattleOver && currentTurn && (
        <div className="mt-6">
          <div className="text-center mb-4">
            <span className="text-lg font-bold text-stone-700 dark:text-stone-200">
              {currentTurn === 1 ? player1Name : player2Name}&apos;s Turn
            </span>
            <span className="text-stone-500 dark:text-stone-400 ml-2">
              — Choose a move for {currentPokemon?.name}
            </span>
          </div>

          {/* Move Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currentMoves.map((move, index) => (
              <BattleMoveButton
                key={index}
                move={move}
                moveData={movesData[move.move.name]}
                effectiveness={getMoveEffectiveness(move)}
                onClick={() => onExecuteMove(currentTurn, move)}
                disabled={isSimulating}
              />
            ))}
          </div>

          {/* Auto-complete option */}
          <div className="mt-4 text-center">
            <button
              onClick={onFastForward}
              disabled={isSimulating}
              className={cn(
                'px-4 py-2 text-sm rounded-lg transition-all',
                'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200',
                'hover:bg-stone-100 dark:hover:bg-stone-800',
                'disabled:opacity-50'
              )}
            >
              {isSimulating ? 'Simulating...' : 'Skip to end →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

BattleArena.displayName = 'BattleArena';

export default BattleArena;
