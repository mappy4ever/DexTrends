import React from 'react';
import Image from 'next/image';
import { TypeBadge } from './TypeBadge';
import type { EvolutionDetail } from "../../types/pokemon";
import logger from '@/utils/logger';

// Inline EvolutionStageCard component (replaces removed component)
interface EvolutionStageCardProps {
  name: string;
  id: number | string;
  spriteUrl: string;
  types?: string[];
  isCurrent?: boolean;
  circleSize?: 'small' | 'medium' | 'large';
}

const EvolutionStageCard: React.FC<EvolutionStageCardProps> = ({
  name,
  id,
  spriteUrl,
  types = [],
  isCurrent = false,
  circleSize = 'medium'
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24'
  };

  return (
    <div className={`flex flex-col items-center ${isCurrent ? 'scale-110' : ''}`}>
      <div className={`relative ${sizeClasses[circleSize]} rounded-full overflow-hidden bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-700 dark:to-stone-800 border-2 ${isCurrent ? 'border-pokemon-red shadow-lg' : 'border-stone-300 dark:border-stone-600'}`}>
        <Image
          src={spriteUrl}
          alt={name}
          fill
          className="object-contain p-2"
        />
      </div>
      <span className={`mt-2 text-sm font-medium text-center ${isCurrent ? 'text-pokemon-red' : 'text-stone-700 dark:text-stone-300'}`}>
        {name}
      </span>
      {types && types.length > 0 && (
        <div className="flex gap-1 mt-1">
          {types.slice(0, 2).map((type, idx) => (
            <TypeBadge key={idx} type={type} size="xs" />
          ))}
        </div>
      )}
    </div>
  );
};

interface EvolutionNode {
  name: string;
  id: number | string;
  spriteUrl?: string;
  shinySpriteUrl?: string;
  types?: string[];
  evolutionDetails?: EvolutionDetail[];
  children?: EvolutionNode[];
}

interface EvolutionTreeRendererProps {
  node: EvolutionNode | null;
  showShiny?: boolean;
  currentId?: number | string | null;
  formatEvolutionDetails?: (detail: EvolutionDetail) => string;
}

// Component to render the evolution tree structure
export default function EvolutionTreeRenderer({ 
  node, 
  showShiny = false, 
  currentId = null, 
  formatEvolutionDetails 
}: EvolutionTreeRendererProps) {
  logger.debug('EvolutionTreeRenderer received node', { node });
  
  if (!node || !node.name) {
    logger.warn('EvolutionTreeRenderer: Invalid node data', { node });
    return null;
  }

  const renderEvolutionDetails = (details: EvolutionDetail[]) => {
    if (!details || details.length === 0) return null;
    
    return (
      <div className="text-xs text-stone-600 dark:text-stone-400 mt-1">
        {details.map((detail, idx) => (
          <div key={idx}>
            {formatEvolutionDetails ? formatEvolutionDetails(detail) : 'Evolves'}
          </div>
        ))}
      </div>
    );
  };

  const isCurrent = node.id === currentId;
  
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col items-center">
        <EvolutionStageCard
          name={node.name}
          id={node.id}
          spriteUrl={(showShiny ? node.shinySpriteUrl : node.spriteUrl) || '/dextrendslogo.png'}
          types={node.types}
          isCurrent={isCurrent}
          circleSize={isCurrent ? "large" : "medium"}
        />
        
        {node.children && Array.isArray(node.children) && node.children.length > 0 && (
          <>
            {/* Evolution details */}
            {node.children[0]?.evolutionDetails && renderEvolutionDetails(node.children[0].evolutionDetails)}
            
            {/* Arrow */}
            <div className="my-2">
              <svg className="w-6 h-6 text-stone-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* Children */}
            <div className={`flex ${node.children.length > 1 ? 'gap-8' : ''}`}>
              {node.children.filter(child => child && child.name).map((child, index) => (
                <EvolutionTreeRenderer
                  key={child.id || index}
                  node={child}
                  showShiny={showShiny}
                  currentId={currentId}
                  formatEvolutionDetails={formatEvolutionDetails}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}