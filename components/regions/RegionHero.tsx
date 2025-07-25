import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getRegionMap } from '../../utils/scrapedImageMapping';
import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

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
  const router = useRouter();
  
  // Define region order for navigation
  const regionOrder: RegionId[] = ['kanto', 'johto', 'hoenn', 'sinnoh', 'unova', 'kalos', 'alola', 'galar', 'paldea'];
  const currentRegionIndex = regionOrder.indexOf(region.id as RegionId);
  const prevRegion = currentRegionIndex > 0 ? regionOrder[currentRegionIndex - 1] : null;
  const nextRegion = currentRegionIndex < regionOrder.length - 1 ? regionOrder[currentRegionIndex + 1] : null;
  const [scrollY, setScrollY] = useState(0);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax effect calculation
  const parallaxOffset = scrollY * 0.5;

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
        transform: `translateY(${parallaxOffset}px)`,
        transition: 'transform 0.1s ease-out'
      }}>
        {/* Map Image */}
        <img 
          src={mapPath}
          alt={`${region.name} Map`}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%',
            height: '120%',
            objectFit: 'cover',
            filter: 'brightness(0.8) contrast(1.1)',
            borderRadius: '0 0 100px 100px',
            maskImage: 'radial-gradient(ellipse 100% 100% at center center, black 50%, transparent 90%)',
            WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at center center, black 50%, transparent 90%)'
          }}
          onLoad={(e) => console.log('Region map loaded!', (e.target as HTMLImageElement).src)}
          onError={(e) => {
            console.error('Region map failed!', (e.target as HTMLImageElement).src);
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
        zIndex: 10,
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
      
      {/* Navigation Arrows */}
      {prevRegion && (
        <button
          onClick={() => router.push(`/pokemon/regions/${prevRegion}`)}
          style={{
            position: 'absolute',
            left: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '2.5rem',
            width: '3.5rem',
            height: '6rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 20
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
          aria-label="Previous region"
        >
          <BsChevronLeft style={{ fontSize: '2.5rem', color: 'white' }} />
        </button>
      )}
      
      {nextRegion && (
        <button
          onClick={() => router.push(`/pokemon/regions/${nextRegion}`)}
          style={{
            position: 'absolute',
            right: '2rem',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '2.5rem',
            width: '3.5rem',
            height: '6rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            zIndex: 20
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          }}
          aria-label="Next region"
        >
          <BsChevronRight style={{ fontSize: '2.5rem', color: 'white' }} />
        </button>
      )}
    </div>
  );
};

export default RegionHero;