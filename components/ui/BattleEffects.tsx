/**
 * Battle Effects - Modern visual effects for the battle simulator
 * Includes damage numbers, hit effects, and status animations
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Floating damage number that animates upward and fades
interface DamageNumberProps {
  damage: number;
  isCritical?: boolean;
  effectiveness?: number; // 0.5, 1, 2, etc.
  position: 'left' | 'right';
  onComplete?: () => void;
}

export const DamageNumber: React.FC<DamageNumberProps> = ({
  damage,
  isCritical = false,
  effectiveness = 1,
  position,
  onComplete
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const getColor = () => {
    if (effectiveness >= 2) return 'text-green-500'; // Super effective
    if (effectiveness <= 0.5) return 'text-stone-400'; // Not very effective
    if (isCritical) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMessage = () => {
    if (effectiveness >= 2) return "Super Effective!";
    if (effectiveness <= 0.5) return "Not Very Effective...";
    if (effectiveness === 0) return "No Effect!";
    return null;
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 1, y: -60, scale: isCritical ? 1.3 : 1 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`absolute ${position === 'left' ? 'left-1/4' : 'right-1/4'} top-1/3 pointer-events-none z-50`}
        >
          <div className="flex flex-col items-center">
            <span className={`text-3xl md:text-4xl font-black ${getColor()} drop-shadow-lg`}>
              {isCritical && <span className="text-yellow-400">!</span>}
              -{damage}
            </span>
            {getMessage() && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`text-sm font-bold mt-1 ${getColor()}`}
              >
                {getMessage()}
              </motion.span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hit flash effect on Pokemon sprite
interface HitFlashProps {
  isActive: boolean;
  children: React.ReactNode;
}

export const HitFlash: React.FC<HitFlashProps> = ({ isActive, children }) => {
  return (
    <motion.div
      animate={isActive ? {
        filter: ['brightness(1)', 'brightness(2)', 'brightness(1)', 'brightness(1.5)', 'brightness(1)'],
        x: [0, -5, 5, -3, 0],
      } : {}}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

// Animated HP bar with smooth transitions
interface AnimatedHPBarProps {
  current: number;
  max: number;
  showNumbers?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AnimatedHPBar: React.FC<AnimatedHPBarProps> = ({
  current,
  max,
  showNumbers = true,
  size = 'md'
}) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));

  const getBarColor = () => {
    if (percentage > 50) return 'from-green-400 to-green-500';
    if (percentage > 20) return 'from-yellow-400 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  return (
    <div className="w-full">
      {showNumbers && (
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-stone-600 dark:text-stone-300">HP</span>
          <motion.span
            key={current}
            initial={{ scale: 1.2, color: '#ef4444' }}
            animate={{ scale: 1, color: percentage > 50 ? '#22c55e' : percentage > 20 ? '#f59e0b' : '#ef4444' }}
            className="font-bold"
          >
            {current}/{max}
          </motion.span>
        </div>
      )}
      <div className={`w-full bg-stone-200 dark:bg-stone-700 rounded-full ${heights[size]} overflow-hidden shadow-inner`}>
        <motion.div
          className={`${heights[size]} rounded-full bg-gradient-to-r ${getBarColor()} shadow-sm`}
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

// Battle action announcement
interface BattleAnnouncementProps {
  message: string;
  type?: 'attack' | 'status' | 'victory' | 'info';
  onComplete?: () => void;
}

export const BattleAnnouncement: React.FC<BattleAnnouncementProps> = ({
  message,
  type = 'info',
  onComplete
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [message, onComplete]);

  const getStyles = () => {
    switch (type) {
      case 'attack':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-white';
      case 'status':
        return 'bg-gradient-to-r from-amber-500 to-pink-500 text-white';
      case 'victory':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-900';
      default:
        return 'bg-gradient-to-r from-amber-500 to-cyan-500 text-white';
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg ${getStyles()}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// VS Badge for battle screen
export const VSBadge: React.FC<{ animated?: boolean }> = ({ animated = true }) => {
  return (
    <motion.div
      initial={animated ? { scale: 0, rotate: -180 } : {}}
      animate={animated ? { scale: 1, rotate: 0 } : {}}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="relative"
    >
      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 flex items-center justify-center shadow-xl">
        <span className="text-white font-black text-xl md:text-2xl drop-shadow-md">VS</span>
      </div>
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-yellow-400"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
};

// Turn indicator
interface TurnIndicatorProps {
  currentTurn: 1 | 2;
  player1Name: string;
  player2Name: string;
}

export const TurnIndicator: React.FC<TurnIndicatorProps> = ({
  currentTurn,
  player1Name,
  player2Name
}) => {
  return (
    <motion.div
      key={currentTurn}
      initial={{ opacity: 0, x: currentTurn === 1 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-center gap-2 py-2 px-4 bg-white/80 dark:bg-stone-800/80 rounded-full shadow-md"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className={`w-3 h-3 rounded-full ${currentTurn === 1 ? 'bg-red-500' : 'bg-amber-500'}`}
      />
      <span className="font-semibold text-stone-700 dark:text-stone-300">
        {currentTurn === 1 ? player1Name : player2Name}'s Turn
      </span>
    </motion.div>
  );
};

// Pokemon entry animation
interface PokemonEntryProps {
  children: React.ReactNode;
  side: 'left' | 'right';
  delay?: number;
}

export const PokemonEntry: React.FC<PokemonEntryProps> = ({ children, side, delay = 0 }) => {
  return (
    <motion.div
      initial={{
        x: side === 'left' ? -100 : 100,
        opacity: 0,
        scale: 0.5
      }}
      animate={{
        x: 0,
        opacity: 1,
        scale: 1
      }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay
      }}
    >
      {children}
    </motion.div>
  );
};

// Status effect badge with animation
interface StatusBadgeProps {
  status: string;
  turns?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, turns }) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'burn':
        return 'bg-gradient-to-r from-orange-400 to-red-500 text-white';
      case 'poison':
      case 'badpoison':
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      case 'paralysis':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-900';
      case 'sleep':
        return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white';
      case 'freeze':
        return 'bg-gradient-to-r from-cyan-400 to-amber-500 text-white';
      case 'confusion':
        return 'bg-gradient-to-r from-pink-400 to-rose-500 text-white';
      default:
        return 'bg-stone-500 text-white';
    }
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-md ${getStatusStyle()}`}
    >
      <motion.span
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {status}
      </motion.span>
      {turns && <span className="opacity-75">({turns})</span>}
    </motion.span>
  );
};

// Move button with type coloring
interface MoveButtonProps {
  move: {
    name: string;
    type?: string;
    power?: number;
    pp?: number;
  };
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export const MoveButton: React.FC<MoveButtonProps> = ({
  move,
  onClick,
  disabled = false,
  selected = false
}) => {
  const typeColors: Record<string, string> = {
    normal: 'from-stone-400 to-stone-500',
    fire: 'from-orange-400 to-red-500',
    water: 'from-amber-400 to-amber-600',
    electric: 'from-yellow-400 to-amber-500',
    grass: 'from-green-400 to-green-600',
    ice: 'from-cyan-300 to-amber-400',
    fighting: 'from-red-600 to-red-800',
    poison: 'from-amber-400 to-amber-600',
    ground: 'from-amber-500 to-amber-700',
    flying: 'from-amber-300 to-amber-400',
    psychic: 'from-pink-400 to-pink-600',
    bug: 'from-lime-400 to-green-500',
    rock: 'from-amber-600 to-amber-800',
    ghost: 'from-amber-500 to-amber-600',
    dragon: 'from-amber-500 to-amber-700',
    dark: 'from-stone-600 to-stone-800',
    steel: 'from-stone-400 to-stone-500',
    fairy: 'from-pink-300 to-pink-500',
  };

  const bgGradient = move.type ? typeColors[move.type.toLowerCase()] || typeColors.normal : typeColors.normal;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative w-full p-3 rounded-xl font-semibold text-white shadow-md
        bg-gradient-to-br ${bgGradient}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg cursor-pointer'}
        ${selected ? 'ring-2 ring-white ring-offset-2' : ''}
        transition-shadow duration-200
      `}
    >
      <div className="flex justify-between items-center">
        <span className="capitalize">{move.name.replace('-', ' ')}</span>
        {move.power && (
          <span className="text-sm opacity-80">PWR: {move.power}</span>
        )}
      </div>
      {move.pp !== undefined && (
        <div className="text-xs opacity-70 mt-1">
          PP: {move.pp}
        </div>
      )}
    </motion.button>
  );
};

// Victory celebration
interface VictoryCelebrationProps {
  winner: string;
  pokemonName: string;
  onClose: () => void;
}

export const VictoryCelebration: React.FC<VictoryCelebrationProps> = ({
  winner,
  pokemonName,
  onClose
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-8 rounded-xl shadow-2xl text-center max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>
        <h2 className="text-3xl font-black text-white mb-2">Victory!</h2>
        <p className="text-xl text-white/90 mb-4">
          {winner}'s <span className="capitalize font-bold">{pokemonName}</span> wins!
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="px-6 py-3 bg-white text-amber-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
