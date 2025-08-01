import React from 'react';
import { motion } from 'framer-motion';

interface TypeGradientBadgeProps {
  type: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  circular?: boolean;
  gradient?: boolean;
  onClick?: () => void;
  className?: string;
}

const typeColors: { [key: string]: { bg: string; text: string; gradient: string } } = {
  normal: { 
    bg: 'bg-stone-400', 
    text: 'text-white',
    gradient: 'from-stone-300 to-stone-500'
  },
  fire: { 
    bg: 'bg-red-500', 
    text: 'text-white',
    gradient: 'from-orange-400 to-red-600'
  },
  water: { 
    bg: 'bg-blue-500', 
    text: 'text-white',
    gradient: 'from-blue-400 to-blue-600'
  },
  electric: { 
    bg: 'bg-yellow-400', 
    text: 'text-gray-900',
    gradient: 'from-yellow-300 to-yellow-500'
  },
  grass: { 
    bg: 'bg-green-500', 
    text: 'text-white',
    gradient: 'from-green-400 to-green-600'
  },
  ice: { 
    bg: 'bg-blue-300', 
    text: 'text-gray-900',
    gradient: 'from-cyan-300 to-blue-400'
  },
  fighting: { 
    bg: 'bg-red-700', 
    text: 'text-white',
    gradient: 'from-red-600 to-red-800'
  },
  poison: { 
    bg: 'bg-violet-600', 
    text: 'text-white',
    gradient: 'from-fuchsia-500 to-violet-700'
  },
  ground: { 
    bg: 'bg-yellow-600', 
    text: 'text-white',
    gradient: 'from-yellow-500 to-amber-700'
  },
  flying: { 
    bg: 'bg-indigo-400', 
    text: 'text-white',
    gradient: 'from-blue-300 to-indigo-500'
  },
  psychic: { 
    bg: 'bg-pink-500', 
    text: 'text-white',
    gradient: 'from-pink-400 to-pink-600'
  },
  bug: { 
    bg: 'bg-yellow-500', 
    text: 'text-gray-900',
    gradient: 'from-yellow-400 to-lime-600'
  },
  rock: { 
    bg: 'bg-yellow-800', 
    text: 'text-white',
    gradient: 'from-amber-600 to-yellow-900'
  },
  ghost: { 
    bg: 'bg-purple-800', 
    text: 'text-white',
    gradient: 'from-purple-700 to-purple-900'
  },
  dragon: { 
    bg: 'bg-indigo-800', 
    text: 'text-white',
    gradient: 'from-indigo-600 to-purple-800'
  },
  dark: { 
    bg: 'bg-gray-800', 
    text: 'text-white',
    gradient: 'from-gray-700 to-gray-900'
  },
  steel: { 
    bg: 'bg-gray-500', 
    text: 'text-white',
    gradient: 'from-slate-400 to-gray-600'
  },
  fairy: { 
    bg: 'bg-pink-300', 
    text: 'text-gray-900',
    gradient: 'from-pink-300 to-pink-500'
  },
  // Pokemon Pocket TCG Types
  colorless: {
    bg: 'bg-gray-300',
    text: 'text-gray-900',
    gradient: 'from-gray-200 to-gray-400'
  },
  darkness: {
    bg: 'bg-gray-900',
    text: 'text-white',
    gradient: 'from-gray-800 to-black'
  },
  metal: {
    bg: 'bg-slate-500',
    text: 'text-white',
    gradient: 'from-slate-400 to-slate-600'
  }
};

const sizeClasses = {
  xs: 'text-xs px-2 py-1 min-w-[60px]',
  sm: 'text-sm px-3 py-1.5 min-w-[70px]',
  md: 'text-base px-4 py-2 min-w-[80px]',
  lg: 'text-lg px-5 py-2.5 min-w-[90px]'
};

const circularSizeClasses = {
  xs: 'w-12 h-12 text-xs',
  sm: 'w-16 h-16 text-sm',
  md: 'w-20 h-20 text-base',
  lg: 'w-24 h-24 text-lg'
};

export const TypeGradientBadge: React.FC<TypeGradientBadgeProps> = ({
  type,
  size = 'sm',
  circular = false,
  gradient = true,
  onClick,
  className = ''
}) => {
  const typeStyle = typeColors[type.toLowerCase()] || typeColors.normal;
  const isClickable = !!onClick;

  // Check if this is a regular Pokemon type (not Pocket TCG)
  const isPocketType = ['colorless', 'darkness', 'metal'].includes(type.toLowerCase());
  const isRegularType = !isPocketType;

  const baseClasses = circular
    ? `${circularSizeClasses[size]} rounded-full flex items-center justify-center`
    : `${sizeClasses[size]} rounded-full`;

  const bgClass = gradient 
    ? `bg-gradient-to-r ${typeStyle.gradient}`
    : typeStyle.bg;

  const borderClass = isRegularType ? 'border border-gray-400' : '';

  return (
    <motion.button
      onClick={onClick}
      disabled={!isClickable}
      className={`
        ${baseClasses}
        ${bgClass}
        ${borderClass}
        ${typeStyle.text}
        font-semibold uppercase tracking-wider
        shadow-md
        ${isClickable ? 'cursor-pointer hover:shadow-lg' : 'cursor-default'}
        transition-all duration-300
        relative overflow-hidden
        ${className}
      `}
      whileHover={isClickable ? { scale: 1.1 } : {}}
      whileTap={isClickable ? { scale: 0.95 } : {}}
    >
      {/* Shine effect for circular badges */}
      {circular && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent rounded-full"
          initial={{ opacity: 0, rotate: -45 }}
          whileHover={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
      
      {/* Badge text */}
      <span className="relative z-10">{type}</span>
    </motion.button>
  );
};

export default TypeGradientBadge;