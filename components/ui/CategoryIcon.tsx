import React from 'react';
import { cn } from '@/utils/cn';

interface CategoryIconProps {
  category: 'physical' | 'special' | 'status' | string | null;
  size?: number;
  showLabel?: boolean;
}

/**
 * CategoryIcon - Game-accurate category icons for Pokemon moves
 *
 * Physical: Orange starburst (damage based on Attack stat)
 * Special: Blue/Purple rings (damage based on Sp. Attack stat)
 * Status: Gray swirl (no damage, applies effects)
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category,
  size = 20,
  showLabel = false
}) => {
  if (!category) return null;

  const normalizedCategory = category.toLowerCase();
  const label = normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1);

  // Physical - Orange starburst icon
  const PhysicalIcon = () => (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-label="Physical">
      <defs>
        <linearGradient id="physicalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#physicalGrad)" />
      <g fill="#FFF">
        <polygon points="16,4 18,12 26,12 20,17 22,25 16,20 10,25 12,17 6,12 14,12" />
      </g>
    </svg>
  );

  // Special - Purple/Blue rings icon
  const SpecialIcon = () => (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-label="Special">
      <defs>
        <linearGradient id="specialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#specialGrad)" />
      <g fill="none" stroke="#FFF" strokeWidth="2">
        <circle cx="16" cy="16" r="10" />
        <circle cx="16" cy="16" r="6" />
        <circle cx="16" cy="16" r="2" fill="#FFF" />
      </g>
    </svg>
  );

  // Status - Gray swirl icon
  const StatusIcon = () => (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-label="Status">
      <defs>
        <linearGradient id="statusGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78716C" />
          <stop offset="100%" stopColor="#57534E" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill="url(#statusGrad)" />
      <g fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round">
        <path d="M16 8 C22 8 24 14 20 16 C16 18 12 16 12 12" />
        <path d="M12 20 C10 16 12 12 16 12" />
        <circle cx="16" cy="16" r="2" fill="#FFF" />
      </g>
    </svg>
  );

  const getIcon = () => {
    switch (normalizedCategory) {
      case 'physical':
        return <PhysicalIcon />;
      case 'special':
        return <SpecialIcon />;
      case 'status':
      default:
        return <StatusIcon />;
    }
  };

  const getLabelColor = () => {
    switch (normalizedCategory) {
      case 'physical':
        return 'text-orange-600 dark:text-orange-400';
      case 'special':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'status':
      default:
        return 'text-stone-600 dark:text-stone-400';
    }
  };

  if (showLabel) {
    return (
      <span
        title={label}
        className="inline-flex items-center gap-1.5"
      >
        {getIcon()}
        <span className={cn('text-sm font-medium capitalize', getLabelColor())}>
          {label}
        </span>
      </span>
    );
  }

  return (
    <span title={label}>
      {getIcon()}
    </span>
  );
};

export default CategoryIcon;