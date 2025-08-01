import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Enhanced3DCardProps {
  card: any;
  cardClassName?: string;
  isPocketCard?: boolean;
  showHP?: boolean;
  showRarity?: boolean;
  rarity?: any;
  cardFeatures?: string[];
  setZoomedCard?: (card: any) => void;
  children?: React.ReactNode;
}

const Enhanced3DCard = ({ 
  card, cardClassName = '', isPocketCard = false, showHP = true, showRarity = true, rarity = {}, cardFeatures = [], setZoomedCard, children 
}: Enhanced3DCardProps) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isHovered) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const rotateXValue = Math.max(-15, Math.min(15, (e.clientY - centerY) / 10));
    const rotateYValue = Math.max(-15, Math.min(15, (centerX - e.clientX) / 10));
    
    setRotateX(rotateXValue);
    setRotateY(rotateYValue);
  }, [isHovered]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  }, []);

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('a') ||
      target.closest('button') ||
      target.closest('.magnifier-icon')
    ) return;
    
    if (isPocketCard) {
      router.push(`/pocketmode/${card.id}`);
    } else {
      router.push(`/cards/${card.id}`);
    }
  };

  const handleDoubleClick = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFlipped(!isFlipped);
  };

  // Determine if card is holographic/special
  const isHolographic = card.rarity === '★★' || card.rarity === '★' || 
                       card.fullart === 'Yes' || card.ex === 'Yes' ||
                       card.name?.toLowerCase().includes('shiny') ||
                       card.name?.toLowerCase().includes('secret');

  return (
    <div className="enhanced-3d-card-container perspective-1000">
      <style jsx>{`
        .enhanced-3d-card-container {
          perspective: 1000px;
          transform-style: preserve-3d;
        }
        
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          backface-visibility: hidden;
        }
        
        .card-3d:hover {
          transform: rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px);
        }
        
        .card-flipped {
          transform: rotateY(180deg);
        }
        
        .holographic-effect {
          position: relative;
          overflow: hidden;
        }
        
        .holographic-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            rgba(255, 255, 255, 0.4),
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s ease-in-out;
          z-index: 1;
          pointer-events: none;
        }
        
        .holographic-effect:hover::before {
          left: 100%;
        }
        
        .holographic-shimmer {
          background: linear-gradient(
            45deg,
            rgba(255, 0, 150, 0.1),
            rgba(0, 255, 255, 0.1),
            rgba(255, 255, 0, 0.1),
            rgba(255, 0, 150, 0.1)
          );
          background-size: 400% 400%;
          animation: holographic-animation 3s ease-in-out infinite;
        }
        
        @keyframes holographic-animation {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .card-shadow {
          filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.15));
          transition: filter 0.3s ease;
        }
        
        .card-shadow:hover {
          filter: drop-shadow(0 35px 60px rgba(0, 0, 0, 0.25));
        }
        
        .rarity-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: -1;
        }
        
        .rarity-glow.crown {
          background: linear-gradient(45deg, #ff0000, #ff4500, #ffd700, #ff4500, #ff0000);
          background-size: 400% 400%;
          animation: rarity-glow-animation 2s ease-in-out infinite;
        }
        
        .rarity-glow.ex {
          background: linear-gradient(45deg, #ffd700, #ffff00, #ffa500, #ffff00, #ffd700);
          background-size: 400% 400%;
          animation: rarity-glow-animation 2s ease-in-out infinite;
        }
        
        .rarity-glow.rare {
          background: linear-gradient(45deg, #4169e1, #00bfff, #1e90ff, #00bfff, #4169e1);
          background-size: 400% 400%;
          animation: rarity-glow-animation 2s ease-in-out infinite;
        }
        
        .enhanced-3d-card-container:hover .rarity-glow {
          opacity: 0.6;
        }
        
        @keyframes rarity-glow-animation {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .card-front, .card-back {
          backface-visibility: hidden;
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        
        .card-back {
          transform: rotateY(180deg);
        }
        
        .flip-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 10;
        }
        
        .enhanced-3d-card-container:hover .flip-indicator {
          opacity: 1;
        }
        
        .texture-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
          pointer-events: none;
          border-radius: inherit;
        }
      `}</style>
      
      <div
        ref={cardRef}
        className={`card-3d card-shadow ${isFlipped ? 'card-flipped' : ''} ${cardClassName || 
          `card p-2 sm:p-3 md:p-4 flex flex-col items-center bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 animate-fadeIn group ring-0
          hover:border-primary/90 hover:ring-2 hover:ring-primary/60 hover:-translate-y-1 hover:bg-primary/5 hover:shadow-lg
          focus-within:border-primary/90 focus-within:ring-2 focus-within:ring-primary/60 focus-within:-translate-y-1 focus-within:bg-primary/5 focus-within:shadow-lg`
        } ${isHolographic ? 'holographic-effect holographic-shimmer' : ''}`}
        style={{ 
          boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)', 
          cursor: 'pointer',
          position: 'relative'
        }}
        tabIndex={0}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
        onDoubleClick={handleDoubleClick}
      >
        {/* Rarity Glow Effect */}
        {isHolographic && (
          <div className={`rarity-glow ${
            card.rarity === '★★' ? 'crown' : 
            card.rarity === '★' || card.ex === 'Yes' ? 'ex' : 
            'rare'
          }`} />
        )}
        
        {/* Flip Indicator */}
        <div className="flip-indicator">
          Double-click to flip
        </div>
        
        {/* Card Front */}
        <div className="card-front">
          <div className="w-full flex flex-col items-center relative">
            <Link href={`/${isPocketCard ? 'pocketmode' : 'cards'}/${card.id}`} legacyBehavior>
              <a
                className="block w-full"
                tabIndex={-1}
                onClick={e => e.stopPropagation()}
              >
                <div className="relative">
                  <Image
                    src={card.image || "/back-card.png"}
                    alt={card.name}
                    width={220}
                    height={308}
                    className="rounded-app-md mb-2 object-cover shadow-md hover:shadow-lg transition-all"
                    priority={false}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Eve6J4HNvbzTe7+v1+8BvxRf4X3/f/9k="
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e: any) => {
                      const target = e.target as HTMLImageElement;
                      if (target && target.src !== window.location.origin + '/back-card.png') {
                        target.src = '/back-card.png';
                      }
                    }}
                  />
                  {/* Texture Overlay for added depth */}
                  <div className="texture-overlay" />
                </div>
              </a>
            </Link>
          </div>
          
          {/* Card Info */}
          <h3 className="text-lg font-bold text-text-heading text-center mb-1 group-hover:text-primary group-focus-within:text-primary transition-colors duration-200 flex items-center justify-center gap-2">
            <Link href={`/${isPocketCard ? 'pocketmode' : 'cards'}/${card.id}`} legacyBehavior>
              <a className="text-blue-900 hover:text-blue-700 focus:text-blue-700 hover:underline focus:underline outline-none focus-visible:ring-2 focus-visible:ring-primary px-1 rounded" tabIndex={0} title={`View card details for ${card.name}`} onClick={e => e.stopPropagation()}>
                {card.name}
              </a>
            </Link>
            {setZoomedCard && (
              <button
                className="click-icon ml-1 p-1 rounded-full hover:bg-gray-200 focus:bg-gray-300 focus:outline-none"
                title="View card"
                tabIndex={0}
                onClick={e => { e.stopPropagation(); setZoomedCard(card); }}
                aria-label="View card"
                type="button"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
              </button>
            )}
          </h3>
          
          {/* Children content (badges, etc.) */}
          {children}
        </div>
        
        {/* Card Back */}
        <div className="card-back">
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="text-white text-center">
              <h4 className="font-bold text-lg mb-2">Pokémon</h4>
              <p className="text-sm opacity-90">Trading Card Game</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enhanced3DCard;