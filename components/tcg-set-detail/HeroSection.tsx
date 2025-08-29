import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { GlassContainer } from '../ui/design-system/GlassContainer';
import { createGlassStyle } from '../ui/design-system/glass-constants';
import type { CardSet, TCGCard } from '@/types/api/cards';

interface HeroSectionProps {
  setInfo: CardSet;
  cardCount: number;
  totalValue: number;
  topCards: TCGCard[];
  statistics: {
    rarityDistribution: Record<string, number>;
    valueByRarity: Record<string, { total: number; average: number; count: number }>;
  };
}

// Circular Progress Component
const CircularMetric: React.FC<{
  value: number;
  maxValue: number;
  label: string;
  color: string;
  size?: number;
  format?: 'number' | 'currency' | 'percentage';
}> = ({ value, maxValue, label, color, size = 120, format = 'number' }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const formatValue = () => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${Math.round(percentage)}%`;
      default:
        return value.toLocaleString();
    }
  };
  
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={12}
          className="text-gray-200/30 dark:text-gray-700/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${label})`}
          strokeWidth={12}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.split(' ')[0]} />
            <stop offset="100%" stopColor={color.split(' ')[1] || color.split(' ')[0]} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-gray-800 dark:text-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {formatValue()}
        </motion.span>
        <motion.span
          className="text-xs text-gray-500 dark:text-gray-400 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {label}
        </motion.span>
      </div>
    </motion.div>
  );
};

// Floating Card Display
const FloatingCard: React.FC<{
  card: TCGCard;
  index: number;
  onClick?: () => void;
}> = ({ card, index, onClick }) => {
  return (
    <motion.div
      className="relative cursor-pointer"
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        y: [0, -10, 0],
        scale: 1,
      }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.1,
        y: {
          repeat: Infinity,
          duration: 3 + index * 0.5,
          ease: "easeInOut"
        }
      }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      onClick={onClick}
    >
      <div className={cn(
        "relative",
        createGlassStyle({
          blur: 'xl',
          opacity: 'strong',
          border: 'strong',
          rounded: 'lg',
          shadow: 'xl'
        })
      )}>
        <Image
          src={card.images.small}
          alt={card.name}
          width={120}
          height={168}
          className="rounded-lg"
        />
        {/* Price overlay */}
        {card.tcgplayer?.prices && (
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
            <p className="text-white text-xs font-semibold text-center">
              ${Object.values(card.tcgplayer.prices)[0]?.market?.toFixed(2) || 'N/A'}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  setInfo,
  cardCount,
  totalValue,
  topCards,
  statistics
}) => {
  // Calculate additional metrics
  const uniqueRarities = Object.keys(statistics?.rarityDistribution || {}).length;
  const averageValue = cardCount > 0 ? totalValue / cardCount : 0;
  const premiumCards = Object.values(statistics?.valueByRarity || {})
    .filter(v => v && v.average > 50)
    .reduce((sum, v) => sum + v.count, 0);
  
  return (
    <div className="relative min-h-[600px] overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-blue-600/10 animate-gradient" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/20 via-transparent to-transparent dark:from-purple-900/20" />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
        {/* Left side - Set information and metrics */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassContainer
            variant="colored"
            blur="xl"
            rounded="3xl"
            padding="lg"
            className="h-full"
          >
            {/* Set Logo and Info */}
            <div className="flex items-start gap-6 mb-8">
              {setInfo.images?.logo && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 100 }}
                  className="relative w-32 h-32 flex-shrink-0"
                >
                  <Image
                    src={setInfo.images.logo}
                    alt={setInfo.name}
                    fill
                    className="object-contain filter drop-shadow-2xl"
                    priority
                  />
                </motion.div>
              )}
              
              <div className="flex-1">
                <motion.h1
                  className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {setInfo.name}
                </motion.h1>
                <motion.p
                  className="text-lg text-gray-600 dark:text-gray-400 mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {setInfo.series}
                </motion.p>
                <motion.p
                  className="text-sm text-gray-500 dark:text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  Released: {new Date(setInfo.releaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </motion.p>
                
                {/* Set Symbol */}
                {setInfo.images?.symbol && (
                  <motion.div
                    className="mt-4"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Image
                      src={setInfo.images.symbol}
                      alt={`${setInfo.name} symbol`}
                      width={40}
                      height={40}
                      className="opacity-80"
                    />
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Circular Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CircularMetric
                value={cardCount}
                maxValue={setInfo.total}
                label="Total Cards"
                color="#8B5CF6 #EC4899"
                size={100}
              />
              <CircularMetric
                value={totalValue}
                maxValue={totalValue * 1.2}
                label="Total Value"
                color="#10B981 #06B6D4"
                size={100}
                format="currency"
              />
              <CircularMetric
                value={uniqueRarities}
                maxValue={12}
                label="Rarities"
                color="#F59E0B #EF4444"
                size={100}
              />
              <CircularMetric
                value={premiumCards}
                maxValue={cardCount}
                label="Premium"
                color="#6366F1 #8B5CF6"
                size={100}
              />
            </div>
            
            {/* Quick Stats Pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              <StatPill
                label="Avg. Value"
                value={`$${averageValue.toFixed(2)}`}
                gradient="from-green-500 to-emerald-500"
              />
              <StatPill
                label="Set Code"
                value={setInfo.id.toUpperCase()}
                gradient="from-blue-500 to-cyan-500"
              />
              {setInfo.ptcgoCode && (
                <StatPill
                  label="PTCGO"
                  value={setInfo.ptcgoCode}
                  gradient="from-purple-500 to-pink-500"
                />
              )}
              <StatPill
                label="Printed"
                value={`${setInfo.printedTotal}`}
                gradient="from-orange-500 to-red-500"
              />
            </div>
          </GlassContainer>
        </motion.div>
        
        {/* Right side - Top cards carousel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <GlassContainer
            variant="colored"
            blur="xl"
            rounded="3xl"
            padding="lg"
            className="h-full"
          >
            <motion.h2
              className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Most Valuable Cards
            </motion.h2>
            
            {/* Floating cards display */}
            <div className="relative h-[400px] flex items-center justify-center">
              <div className="flex gap-4 flex-wrap justify-center">
                {topCards.slice(0, 5).map((card, index) => (
                  <FloatingCard
                    key={card.id}
                    card={card}
                    index={index}
                    onClick={() => {/* Handle card click */}}
                  />
                ))}
              </div>
            </div>
            
            {/* View All Button */}
            <motion.div
              className="text-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <button className={cn(
                "px-6 py-3 rounded-full",
                "bg-gradient-to-r from-purple-500 to-pink-500",
                "text-white font-semibold",
                "hover:scale-105 transition-transform",
                "shadow-lg hover:shadow-xl"
              )}>
                View All Cards
              </button>
            </motion.div>
          </GlassContainer>
        </motion.div>
      </div>
    </div>
  );
};

// Helper component for stat pills
const StatPill: React.FC<{
  label: string;
  value: string;
  gradient: string;
}> = ({ label, value, gradient }) => (
  <motion.div
    className={cn(
      "px-4 py-2 rounded-full",
      "backdrop-blur-md bg-white/60 dark:bg-gray-800/60",
      "border border-white/50 dark:border-gray-700/50",
      "hover:scale-105 transition-transform duration-200"
    )}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 200 }}
  >
    <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{label}:</span>
    <span className={cn(
      "text-sm font-bold bg-gradient-to-r bg-clip-text text-transparent",
      gradient
    )}>
      {value}
    </span>
  </motion.div>
);

export default HeroSection;