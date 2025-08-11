import React, { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface SimpleCardWrapperProps {
  children: ReactNode;
  className?: string;
  rarity?: string;
  disabled?: boolean;
  intensity?: 'low' | 'medium' | 'high'; // Keep for compatibility but ignore
}

/**
 * Simple card wrapper to replace HolographicCard
 * Provides basic hover effects without resource-intensive animations
 */
const SimpleCardWrapper: React.FC<SimpleCardWrapperProps> = ({
  children,
  className,
  rarity = '',
  disabled = false,
}) => {
  // Determine border color based on rarity
  const getBorderClass = () => {
    if (disabled) return 'border-gray-300';
    
    const rarityLower = rarity.toLowerCase();
    
    if (rarityLower.includes('secret') || rarityLower.includes('rainbow')) {
      return 'border-yellow-400';
    }
    if (rarityLower.includes('ultra') || rarityLower.includes('hyper')) {
      return 'border-purple-400';
    }
    if (rarityLower.includes('rare')) {
      return 'border-blue-400';
    }
    return 'border-gray-300';
  };

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden transition-all duration-200',
        'hover:scale-105 hover:shadow-lg',
        getBorderClass(),
        'border-2',
        disabled && 'pointer-events-none opacity-60',
        className
      )}
    >
      {children}
    </div>
  );
};

export default SimpleCardWrapper;