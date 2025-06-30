import React from 'react';
import EvolutionStageCard from './EvolutionStageCard';

// Component to render the evolution tree structure
export default function EvolutionTreeRenderer({ 
  node, 
  showShiny = false, 
  currentId = null, 
  formatEvolutionDetails 
}) {
  if (!node || !node.name) {
    return null;
  }

  const renderEvolutionDetails = (details) => {
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
        <EvolutionStageCard
          name={node.name}
          id={node.id}
          spriteUrl={showShiny ? node.shinySpriteUrl : node.spriteUrl}
          types={node.types}
          isCurrent={isCurrent}
          circleSize={isCurrent ? "large" : "medium"}
        />
        
        {node.children && node.children.length > 0 && (
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
              {node.children.map((child, index) => (
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