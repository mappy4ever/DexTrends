import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { createGlassStyle } from '../ui/design-system';
import type { CardSet } from '@/types/api/cards';

interface CompactStatsBarProps {
  setInfo: CardSet;
  cardCount: number;
  totalValue: number;
  uniqueRarities: number;
  averagePrice: number;
}

const StatItem: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  delay?: number;
}> = ({ label, value, icon, color = 'purple', delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-3"
    >
      {icon && (
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center',
          `bg-gradient-to-br from-${color}-400/20 to-${color}-600/20`
        )}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-stone-500 dark:text-stone-400">{label}</p>
        <p className="text-lg font-bold text-stone-900 dark:text-white">{value}</p>
      </div>
    </motion.div>
  );
};

export const CompactStatsBar: React.FC<CompactStatsBarProps> = ({
  setInfo,
  cardCount,
  totalValue,
  uniqueRarities,
  averagePrice
}) => {
  const releaseYear = new Date(setInfo.releaseDate).getFullYear();
  
  return (
    <div className={cn(
      'w-full',
      createGlassStyle({ 
        blur: 'xl', 
        opacity: 'medium', 
        gradient: true,
        border: 'strong',
        rounded: 'xl',
        shadow: 'lg'
      })
    )}>
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-pink-500/5" />
        
        {/* Content */}
        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Set Info */}
            <div className="flex items-center gap-4">
              {/* Set Logo */}
              {setInfo.images?.logo && (
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className={cn(
                    'w-20 h-20 rounded-xl flex items-center justify-center p-2',
                    createGlassStyle({ blur: 'sm', opacity: 'strong', border: 'strong' }),
                    'bg-gradient-to-br from-amber-500/30 to-pink-500/30 shadow-lg'
                  )}
                >
                  <img 
                    src={setInfo.images.logo} 
                    alt={`${setInfo.name} logo`}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              )}
              
              {/* Set Symbol/Code */}
              {setInfo.images?.symbol && (
                <motion.div
                  initial={{ rotate: 180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                  className={cn(
                    'w-16 h-16 rounded-xl flex items-center justify-center p-2',
                    createGlassStyle({ blur: 'sm', opacity: 'medium', border: 'medium' }),
                    'bg-gradient-to-br from-amber-500/20 to-cyan-500/20'
                  )}
                >
                  <img 
                    src={setInfo.images.symbol} 
                    alt={`${setInfo.name} symbol`}
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              )}
              
              {/* Fallback if no images */}
              {!setInfo.images?.logo && !setInfo.images?.symbol && (
                <motion.div
                  initial={{ rotate: -180, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className={cn(
                    'w-20 h-20 rounded-xl flex items-center justify-center',
                    createGlassStyle({ blur: 'sm', opacity: 'strong', border: 'strong' }),
                    'bg-gradient-to-br from-amber-500/30 to-pink-500/30 shadow-lg'
                  )}
                >
                  <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {setInfo.name.substring(0, 2).toUpperCase()}
                  </span>
                </motion.div>
              )}
              
              {/* Set Name and Series */}
              <div>
                <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                  {setInfo.name}
                </h1>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  {setInfo.series} • {releaseYear}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="flex items-center gap-8">
              <StatItem
                label="Total Cards"
                value={cardCount}
                delay={0.1}
                icon={
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
                color="purple"
              />
              
              <StatItem
                label="Total Value"
                value={`$${totalValue.toLocaleString()}`}
                delay={0.2}
                icon={
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="green"
              />
              
              <StatItem
                label="Avg. Price"
                value={`$${averagePrice.toFixed(2)}`}
                delay={0.3}
                icon={
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
                color="blue"
              />
              
              <StatItem
                label="Rarities"
                value={uniqueRarities}
                delay={0.4}
                icon={
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                }
                color="yellow"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};