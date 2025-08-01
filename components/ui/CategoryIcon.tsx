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
    special: 'text-blue-600 dark:text-blue-400',
    status: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <span 
      title={category.charAt(0).toUpperCase() + category.slice(1)}
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