import React from 'react';
// EvolutionStageCard removed - use TCGCard or PokemonDisplay instead
import { TCGCard } from './cards/TCGCard';
import type { EvolutionDetail } from "../../types/pokemon";
import logger from '@/utils/logger';

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
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
        {/* EvolutionStageCard removed in Stage 5 - Using simple display */}
        <div className={`flex flex-col items-center ${isCurrent ? 'scale-110' : ''}`}>
          <img 
            src={(showShiny ? node.shinySpriteUrl : node.spriteUrl) || '/dextrendslogo.png'}
            alt={node.name}
            className="w-20 h-20 object-contain"
          />
          <p className="text-sm font-semibold">{node.name}</p>
          <p className="text-xs text-gray-500">#{node.id}</p>
        </div>
        
        {node.children && Array.isArray(node.children) && node.children.length > 0 && (
          <>
            {/* Evolution details */}
            {node.children[0]?.evolutionDetails && renderEvolutionDetails(node.children[0].evolutionDetails)}
            
            {/* Arrow */}
            <div className="my-2">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
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