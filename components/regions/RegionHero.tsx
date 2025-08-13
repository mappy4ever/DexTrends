import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getRegionMap } from '../../utils/scrapedImageMapping';
import { useSmoothParallax } from '../../hooks/useSmoothParallax';
import logger from '@/utils/logger';

// Types
interface Region {
  id: string;
  name: string;
  description: string;
}

interface RegionHeroProps {
  region: Region;
  theme: 'light' | 'dark';
}

type RegionId = 'kanto' | 'johto' | 'hoenn' | 'sinnoh' | 'unova' | 'kalos' | 'alola' | 'galar' | 'paldea';

interface GameLogos {
  [key: string]: string[];
}

const RegionHero: React.FC<RegionHeroProps> = ({ region, theme }) => {
  const [mapError, setMapError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Use smooth parallax hook for jitter-free scrolling
  const parallaxOffset = useSmoothParallax(0.5); // Increased parallax factor for more noticeable effect

  // Get map path with fallback
  const mapPath = getRegionMap(region.id);
  const fallbackMapPath = `/images/regions/${region.id}-map.png`;

  // Game logos based on region
  const getGameLogos = (): string[] => {
    const gameLogos: GameLogos = {
      kanto: ['red', 'blue', 'yellow', 'firered', 'leafgreen'],
      johto: ['gold', 'silver', 'crystal', 'heartgold', 'soulsilver'],
      hoenn: ['ruby', 'sapphire', 'emerald', 'omegaruby', 'alphasapphire'],
      sinnoh: ['diamond', 'pearl', 'platinum', 'brilliantdiamond', 'shiningpearl'],
      unova: ['black', 'white', 'black2', 'white2'],
      kalos: ['x', 'y'],
      alola: ['sun', 'moon', 'ultrasun', 'ultramoon'],
      galar: ['sword', 'shield'],
      paldea: ['scarlet', 'violet']
    };

    return gameLogos[region.id] || [];
  };

  return (
    <div style={{ 
      position: 'relative', 
      height: '100vh',
      overflow: 'hidden',
      background: '#16213e'
    }}>
      {/* Map Background Container */}
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transform: `translate3d(0, ${parallaxOffset * -0.5}px, 0)`,
        willChange: 'transform'
      }}>
        {/* Map Image */}
        <img 
          src={mapPath}
          alt={`${region.name} Map`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: imageLoaded 
              ? 'translate(-50%, -50%) scale(1.2)' 
              : 'translate(-50%, -50%) scale(1.5)',
            minWidth: '120%',
            minHeight: '120%',
            width: 'auto',
            height: 'auto',
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(0.8) contrast(1.1)',
            transition: 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            opacity: imageLoaded ? 1 : 0
          }}
          onLoad={(e) => {
            logger.debug('Region map loaded!', { src: (e.target as HTMLImageElement).src });
            setImageLoaded(true);
          }}
          onError={(e) => {
            logger.error('Region map failed!', { src: (e.target as HTMLImageElement).src });
            setMapError(true);
          }}
        />
        
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(26, 26, 46, 0.3) 60%, rgba(26, 26, 46, 0.8) 100%)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        {/* Region Name */}
        <h1 style={{
          fontSize: '6rem',
          fontWeight: '900',
          color: '#fff',
          textShadow: '4px 4px 12px rgba(0, 0, 0, 0.8)',
          marginBottom: '1rem',
          letterSpacing: '-4px',
          textTransform: 'uppercase'
        }}>
          {region.name.toUpperCase()}
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: '1.5rem',
          color: '#e0e0e0',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
          maxWidth: '600px',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          {region.description}
        </p>
      </div>
    </div>
  );
};

export default RegionHero;