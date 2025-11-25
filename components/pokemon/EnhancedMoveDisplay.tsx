import React, { useState, useEffect } from 'react';
import { useMoveData } from '@/hooks/useMoveData';
import { MoveCompetitiveDataRecord } from '@/utils/supabase';
import { cn } from '@/utils/cn';
import { typeColors } from '@/utils/unifiedTypeColors';
import { CategoryIcon } from '@/components/ui/CategoryIcon';

interface EnhancedMoveDisplayProps {
  moveName: string;
  className?: string;
}

export const EnhancedMoveDisplay: React.FC<EnhancedMoveDisplayProps> = ({ moveName, className }) => {
  const { getMoveData } = useMoveData();
  const [moveData, setMoveData] = useState<MoveCompetitiveDataRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMoveData = async () => {
      setIsLoading(true);
      const data = await getMoveData(moveName);
      setMoveData(data);
      setIsLoading(false);
    };

    fetchMoveData();
  }, [moveName, getMoveData]);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse rounded-lg p-4 space-y-3 bg-gray-800 dark:bg-gray-800", className)}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-5 bg-gray-700 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-gray-700 dark:bg-gray-700 rounded-full w-16"></div>
            <div className="h-6 bg-gray-700 dark:bg-gray-700 rounded w-6"></div>
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="text-center space-y-1">
              <div className="h-3 bg-gray-700 dark:bg-gray-700 rounded w-16 mx-auto"></div>
              <div className="h-4 bg-gray-700 dark:bg-gray-700 rounded w-12 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Description skeleton */}
        <div className="space-y-1">
          <div className="h-3 bg-gray-700 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 dark:bg-gray-700 rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  if (!moveData) {
    // Don't show anything if no competitive data is available
    return null;
  }

  const typeColor = moveData.type ? typeColors[moveData.type.toLowerCase()]?.bg : 'bg-gray-600';

  return (
    <div
      className={cn("bg-gray-800 rounded-lg p-4 space-y-3", className)}
      data-testid="enhanced-move-display"
    >
      {/* Move Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg capitalize">
          {moveData.name.replace(/-/g, ' ')}
        </h4>
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-1 rounded text-xs font-medium text-white", typeColor)}>
            {moveData.type?.toUpperCase()}
          </span>
          <CategoryIcon category={moveData.category} size={16} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-center">
          <div className="text-gray-400">Power</div>
          <div className="font-medium">{moveData.power || '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Accuracy</div>
          <div className="font-medium">{moveData.accuracy ? `${moveData.accuracy}%` : '—'}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Priority</div>
          <div className="font-medium">{moveData.priority > 0 ? `+${moveData.priority}` : moveData.priority}</div>
        </div>
      </div>

      {/* Flags */}
      {moveData.flags && moveData.flags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {moveData.flags.map(flag => (
            <span
              key={flag}
              className="text-xs bg-gray-700 px-2 py-1 rounded"
              title={getFlagDescription(flag)}
            >
              {flag}
            </span>
          ))}
        </div>
      )}

      {/* Secondary Effects */}
      {moveData.secondary_effect && (
        <div className="text-sm text-gray-300">
          <span className="text-gray-400">Effect: </span>
          {formatSecondaryEffects(moveData.secondary_effect)}
        </div>
      )}

      {/* Description */}
      {moveData.short_description && (
        <p className="text-sm text-gray-300">{moveData.short_description}</p>
      )}
    </div>
  );
};

// Helper functions
function getFlagDescription(flag: string): string {
  const flagDescriptions: Record<string, string> = {
    contact: 'Makes contact',
    protect: 'Blocked by Protect',
    mirror: 'Can be copied by Mirror Move',
    punch: 'Boosted by Iron Fist',
    sound: 'Sound-based move',
    gravity: 'Disabled by Gravity',
    defrost: 'Thaws frozen Pokemon',
    distance: 'Can target any Pokemon in Triple Battles',
    heal: 'Healing move',
    authentic: 'Ignores abilities like Unaware',
    powder: 'Powder move',
    bite: 'Boosted by Strong Jaw',
    pulse: 'Boosted by Mega Launcher',
    ballistics: 'Blocked by Bulletproof',
    mental: 'Prevented by Aroma Veil',
    nonsky: 'Hits non-Sky-Drop targets',
    dance: 'Dance move'
  };

  return flagDescriptions[flag] || flag;
}

function formatSecondaryEffects(effects: Record<string, unknown>): string {
  const parts: string[] = [];

  if (effects.chance) {
    parts.push(`${effects.chance}% chance to`);
  }

  if (effects.status) {
    parts.push(`inflict ${effects.status}`);
  }

  if (effects.volatileStatus) {
    parts.push(`cause ${effects.volatileStatus}`);
  }

  if (effects.boosts) {
    const boostStrings = Object.entries(effects.boosts as Record<string, number>).map(([stat, value]) => {
      const numValue = value as number;
      const direction = numValue > 0 ? 'raise' : 'lower';
      return `${direction} ${stat} by ${Math.abs(numValue)}`;
    });
    parts.push(boostStrings.join(' and '));
  }

  return parts.join(' ') || 'None';
}
