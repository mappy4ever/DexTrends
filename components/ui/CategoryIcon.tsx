import React from 'react';
import { cn } from '@/utils/cn';

interface CategoryIconProps {
  category: 'physical' | 'special' | 'status' | null;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  category, 
  size = 16 
}) => {
  if (!category) return null;

  const abbreviations = {
    physical: 'PHY',
    special: 'SPE', 
    status: 'STA'
  };

  const colors = {
    physical: 'text-orange-600 dark:text-orange-400',
    special: 'text-amber-600 dark:text-amber-400',
    status: 'text-stone-600 dark:text-stone-300'
  };

  return (
    <span
      title={category.charAt(0).toUpperCase() + category.slice(1)}
      aria-label={`${category.charAt(0).toUpperCase() + category.slice(1)} attack category`}
      className={cn(
        "inline-flex items-center font-bold text-xs",
        colors[category]
      )}
      style={{ fontSize: size }}
    >
      {abbreviations[category]}
    </span>
  );
};

export default CategoryIcon;