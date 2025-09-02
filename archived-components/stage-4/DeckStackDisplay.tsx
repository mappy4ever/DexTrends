import React, { useState, useRef } from 'react';

// Type definitions
interface Card {
  id: string;
  name?: string;
  imageUrl?: string;
  // Add other card properties as needed
}

interface GroupedCard {
  card: Card;
  count: number;
}

interface DeckStackDisplayProps {
  deck?: Card[];
  maxVisible?: number;
  onCardClick?: (card: Card) => void;
  onCardRemove?: (cardId: string) => void;
  showCounts?: boolean;
  stackOffset?: number;
  perspective?: boolean;
}

const DeckStackDisplay: React.FC<DeckStackDisplayProps> = ({ 
  deck = [], 
  maxVisible = 5, 
  onCardClick,
  onCardRemove,
  showCounts = true,
  stackOffset = 8,
  perspective = true 
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedView, setExpandedView] = useState(false);
  const stackRef = useRef<HTMLDivElement>(null);

  // Group cards by ID and count duplicates
  const groupedCards = deck.reduce<GroupedCard[]>((acc, card) => {
    const existingCard = acc.find(item => item.card.id === card.id);
    if (existingCard) {
      existingCard.count += 1;
    } else {
      acc.push({ card, count: 1 });
    }
    return acc;
  }, []);

  // Get visible cards for stacking
  const visibleCards = groupedCards.slice(0, maxVisible);
  const remainingCount = Math.max(0, groupedCards.length - maxVisible);

  const handleStackClick = () => {
    setExpandedView(!expandedView);
  };

  const handleCardRemoveClick = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    if (onCardRemove) {
      onCardRemove(cardId);
    }
  };

  if (deck.length === 0) {
    return (
      <div className="deck-stack-empty">
        <div className="empty-deck-placeholder">
          <div className="empty-card-outline">
            <div className="plus-icon">+</div>
          </div>
          <p className="text-gray-500 text-sm mt-2">Add cards to your deck</p>
        </div>
        
        <style jsx>{`
          .deck-stack-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 200px;
            padding: 20px;
          }
          
          .empty-deck-placeholder {
            text-align: center;
          }
          
          .empty-card-outline {
            width: 120px;
            height: 168px;
            border: 2px dashed #cbd5e0;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(243, 244, 246, 0.5);
            transition: all 0.3s ease;
          }
          
          .empty-card-outline:hover {
            border-color: #3b82f6;
            background: rgba(59, 130, 246, 0.1);
          }
          
          .plus-icon {
            font-size: 2rem;
            color: #9ca3af;
            font-weight: bold;
          }
        `}</style>
      </div>
    );
  }

  if (expandedView) {
    return (
      <div className="deck-expanded-view">
        <div className="expanded-header">
          <h3 className="text-lg font-bold">Deck Cards ({deck.length}/{20})</h3>
          <button 
            onClick={() => setExpandedView(false)}
            className="collapse-btn">
            Collapse
          </button>
        </div>
        
        <div className="expanded-grid">
          {groupedCards.map(({ card, count }, index) => (
            <div key={`${card.id}-${index}`} className="expanded-card-item">
              <div className="card-wrapper">
                {/* Card component placeholder - replace with actual card component */}
                <div
                  onClick={() => onCardClick && onCardClick(card)}
                  className="deck-card bg-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  style={{ minHeight: '200px' }}
                >
                  <p className="text-center">{card.name || 'Card'}</p>
                </div>
                {showCounts && count > 1 && (
                  <div className="card-count-badge">
                    {count}x
                  </div>
                )}
                <button
                  onClick={(e) => handleCardRemoveClick(e, card.id)}
                  className="remove-btn"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <style jsx>{`
          .deck-expanded-view {
            width: 100%;
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          }
          
          .expanded-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .collapse-btn {
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 16px;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .collapse-btn:hover {
            background: #2563eb;
          }
          
          .expanded-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
          }
          
          .expanded-card-item {
            position: relative;
          }
          
          .card-wrapper {
            position: relative;
          }
          
          .card-count-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: #ef4444;
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            z-index: 10;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }
          
          .remove-btn {
            position: absolute;
            top: -8px;
            left: -8px;
            background: #ef4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            z-index: 10;
            transition: all 0.2s;
            opacity: 0;
          }
          
          .card-wrapper:hover .remove-btn {
            opacity: 1;
          }
          
          .remove-btn:hover {
            background: #dc2626;
            transform: scale(1.1);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="deck-stack-container" ref={stackRef}>
      <div 
        className={`deck-stack ${perspective ? 'perspective-enabled' : ''}`}
        onClick={handleStackClick}
      >
        {visibleCards.map(({ card, count }, index) => (
          <div
            key={`${card.id}-${index}`}
            className={`stacked-card ${hoveredIndex === index ? 'hovered' : ''}`}
            style={{
              zIndex: visibleCards.length - index,
              transform: `translateY(${index * stackOffset}px) translateX(${index * 2}px) ${
                perspective ? `rotateX(${index * 2}deg) rotateY(${index * 1}deg)` : ''
              }`,
              opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.7 : 1
            }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Card component placeholder - replace with actual card component */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onCardClick) onCardClick(card);
              }}
              className="stack-card bg-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
              style={{ minHeight: '150px' }}
            >
              <p className="text-center">{card.name || 'Card'}</p>
            </div>
            
            {showCounts && count > 1 && (
              <div className="stack-count-badge">
                {count}x
              </div>
            )}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className="remaining-cards-indicator">
            +{remainingCount} more
          </div>
        )}
      </div>
      
      <div className="deck-info">
        <div className="deck-count">{deck.length}/20 cards</div>
        <button className="expand-btn" onClick={handleStackClick}>
          {expandedView ? 'Collapse' : 'View All'}
        </button>
      </div>

      <style jsx>{`
        .deck-stack-container {
          position: relative;
          width: fit-content;
          margin: 20px auto;
        }
        
        .deck-stack {
          position: relative;
          width: 150px;
          height: 210px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        
        .deck-stack.perspective-enabled {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        
        .deck-stack:hover {
          transform: scale(1.05);
        }
        
        .stacked-card {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center center;
        }
        
        .stacked-card.hovered {
          transform: translateY(-20px) translateX(10px) scale(1.1) !important;
          z-index: 999 !important;
        }
        
        .stack-count-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: linear-gradient(45deg, #ef4444, #dc2626);
          color: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
          border: 2px solid white;
        }
        
        .remaining-cards-indicator {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: #6b7280;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }
        
        .deck-info {
          margin-top: 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .deck-count {
          font-weight: bold;
          color: #374151;
          font-size: 14px;
        }
        
        .expand-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .expand-btn:hover {
          background: #2563eb;
        }
        
        /* Enhanced 3D stacking for perspective mode */
        .perspective-enabled .stacked-card:nth-child(1) {
          filter: brightness(1);
        }
        
        .perspective-enabled .stacked-card:nth-child(2) {
          filter: brightness(0.95);
        }
        
        .perspective-enabled .stacked-card:nth-child(3) {
          filter: brightness(0.9);
        }
        
        .perspective-enabled .stacked-card:nth-child(4) {
          filter: brightness(0.85);
        }
        
        .perspective-enabled .stacked-card:nth-child(5) {
          filter: brightness(0.8);
        }
      `}</style>
    </div>
  );
};

export default DeckStackDisplay;