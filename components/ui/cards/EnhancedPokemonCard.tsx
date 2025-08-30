import React, { memo } from 'react';
import Image from 'next/image';
import { ProgressiveImage } from '../ProgressiveImage';
import { useRouter } from 'next/router';
import { TypeBadge } from '../TypeBadge';
import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';
import { cardHover } from '@/utils/animations';

interface EnhancedPokemonCardProps {
  pokemon: {
    id: number;
    name: string;
    sprite?: string;
    types?: Array<{ type: { name: string } }>;
    isLegendary?: boolean;
    isMythical?: boolean;
    isStarter?: boolean;
  };
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
}

// Type color mappings for gradients
const typeGradients: Record<string, string> = {
  normal: 'from-gray-300/60 via-gray-200/40 to-gray-100/60',
  fire: 'from-red-300/60 via-orange-200/40 to-yellow-100/60',
  water: 'from-blue-300/60 via-cyan-200/40 to-blue-100/60',
  electric: 'from-yellow-300/60 via-amber-200/40 to-yellow-100/60',
  grass: 'from-green-300/60 via-emerald-200/40 to-lime-100/60',
  ice: 'from-cyan-300/60 via-blue-200/40 to-sky-100/60',
  fighting: 'from-red-400/60 via-orange-300/40 to-red-200/60',
  poison: 'from-purple-400/60 via-purple-300/40 to-pink-200/60',
  ground: 'from-yellow-500/60 via-amber-400/40 to-orange-300/60',
  flying: 'from-indigo-300/60 via-blue-200/40 to-sky-100/60',
  psychic: 'from-pink-400/60 via-purple-300/40 to-pink-200/60',
  bug: 'from-lime-400/60 via-green-300/40 to-lime-200/60',
  rock: 'from-yellow-600/60 via-amber-500/40 to-yellow-400/60',
  ghost: 'from-purple-500/60 via-indigo-400/40 to-purple-300/60',
  dragon: 'from-indigo-500/60 via-purple-400/40 to-blue-300/60',
  dark: 'from-gray-700/60 via-gray-600/40 to-gray-500/60',
  steel: 'from-gray-400/60 via-slate-300/40 to-gray-200/60',
  fairy: 'from-pink-300/60 via-rose-200/40 to-pink-100/60',
};

// Size mappings for circular design
const sizeClasses = {
  sm: 'w-28 h-28',
  md: 'w-36 h-36',
  lg: 'w-44 h-44',
  xl: 'w-52 h-52'
};

const imageSizes = {
  sm: 70,
  md: 90,
  lg: 110,
  xl: 130
};

const EnhancedPokemonCard = memo(({ 
  pokemon, 
  size = 'md', 
  onClick,
  className = ''
}: EnhancedPokemonCardProps) => {
  const router = useRouter();
  
  // Get type gradient
  const getTypeGradient = () => {
    if (!pokemon.types || pokemon.types.length === 0) {
      return typeGradients.normal;
    }
    
    const primaryType = pokemon.types[0].type.name;
    return typeGradients[primaryType] || typeGradients.normal;
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/pokedex/${pokemon.id}`);
    }
  };

  // Format Pokemon number
  const formatNumber = (num: number) => {
    return String(num).padStart(3, '0');
  };

  return (
    <div className={cn('group relative', className)}>
      {/* Main Circular Card Container with Glass Morphism */}
      <motion.div 
        className={cn(
          'relative cursor-pointer',
          'transform-gpu transition-gpu',
          'hover:scale-110 hover:-translate-y-2',
          'will-change-transform'
        )}
        onClick={handleClick}
        data-testid="pokemon-card"
        variants={cardHover as any}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
      >
        {/* Outer Glass Circle */}
        <div className={cn(
          sizeClasses[size],
          'relative rounded-full overflow-hidden',
          'backdrop-blur-xl bg-white/80 dark:bg-gray-800/80',
          'border-2 border-white/50 dark:border-gray-600/50',
          'shadow-xl hover:shadow-2xl',
          'transition-all duration-500'
        )}>
          {/* Type Gradient Overlay */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-60 rounded-full',
            getTypeGradient(),
            'transition-opacity duration-300 group-hover:opacity-80'
          )} />
          
          {/* Inner Glass Container */}
          <div className="relative z-10 w-full h-full p-4 flex items-center justify-center">
            {/* Pokemon Image Container - also circular */}
            <div className={cn(
              'relative rounded-full overflow-hidden',
              'bg-white/60 dark:bg-gray-700/60',
              'backdrop-blur-md',
              'shadow-inner',
              'p-2'
            )}
            style={{ width: imageSizes[size], height: imageSizes[size] }}>
              {pokemon.sprite ? (
                <Image 
                  src={pokemon.sprite} 
                  alt={pokemon.name}
                  fill
                  className="object-contain p-1 drop-shadow-lg transition-transform duration-300 ease-out group-hover:scale-125 group-hover:drop-shadow-2xl"
                  sizes={`${imageSizes[size]}px`}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-400/50">
                    {pokemon.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Hover Glow Effect */}
          <div className={cn(
            'absolute inset-0 rounded-full',
            'bg-gradient-to-t from-white/0 via-white/0 to-white/30',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-500',
            'pointer-events-none'
          )} />
        </div>
        
        {/* Pokédex Number - Perfectly centered at top */}
        <div className={cn(
          'absolute top-2 left-1/2 -translate-x-1/2 z-20',
          'text-xs font-mono font-extrabold',
          'text-gray-800 dark:text-gray-200',
          'tracking-wider',
          'transition-all duration-200',
          'group-hover:text-gray-900 dark:group-hover:text-gray-100',
          'group-hover:scale-110'
        )}>
          #{formatNumber(pokemon.id)}
        </div>
      </motion.div>
      
      {/* Pokemon Name - No Container */}
      <h3 className={cn(
        'mt-3 font-bold text-center capitalize',
        'text-gray-800 dark:text-gray-200',
        'group-hover:text-transparent group-hover:bg-clip-text',
        'group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-purple-600 group-hover:to-pink-600',
        'transition-all duration-300',
        size === 'sm' ? 'text-sm' : size === 'xl' ? 'text-lg' : 'text-base'
      )}>
        {pokemon.name}
      </h3>
      
      {/* Pokemon Types - No Container */}
      {pokemon.types && pokemon.types.length > 0 && (
        <div className="flex justify-center gap-1.5 mt-1.5 flex-wrap">
          {pokemon.types.map((type, index) => (
            <TypeBadge
              key={index}
              type={type.type.name}
              size="sm"
            />
          ))}
        </div>
      )}
    </div>
  );
});

EnhancedPokemonCard.displayName = 'EnhancedPokemonCard';

export default EnhancedPokemonCard;