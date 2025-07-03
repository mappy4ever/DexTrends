import React from 'react';

export const PokeballSVG = ({ 
  size = 40, 
  className = "", 
  animate = false,
  color = "default" // default, shiny, premier, great, ultra, master
}) => {
  const colorSchemes = {
    default: {
      top: "#FF0000",
      topGradient: "#FF4444", 
      bottom: "#FFFFFF",
      bottomGradient: "#F0F0F0",
      ring: "#000000",
      center: "#FFFFFF",
      highlight: "#CCCCCC"
    },
    shiny: {
      top: "#FFD700",
      topGradient: "#FFED4E",
      bottom: "#FFFFFF", 
      bottomGradient: "#F0F0F0",
      ring: "#000000",
      center: "#FFFFFF",
      highlight: "#CCCCCC"
    },
    great: {
      top: "#4169E1",
      topGradient: "#6495ED",
      bottom: "#FFFFFF",
      bottomGradient: "#F0F0F0", 
      ring: "#000000",
      center: "#FFFFFF",
      highlight: "#CCCCCC"
    },
    ultra: {
      top: "#FFD700",
      topGradient: "#FFED4E",
      bottom: "#000000",
      bottomGradient: "#333333",
      ring: "#FFD700", 
      center: "#FFFFFF",
      highlight: "#CCCCCC"
    },
    master: {
      top: "#8A2BE2",
      topGradient: "#9932CC",
      bottom: "#FFFFFF",
      bottomGradient: "#F0F0F0",
      ring: "#000000",
      center: "#FFFFFF", 
      highlight: "#CCCCCC"
    },
    premier: {
      top: "#FFFFFF",
      topGradient: "#F0F0F0",
      bottom: "#FFFFFF",
      bottomGradient: "#F0F0F0",
      ring: "#FF0000",
      center: "#FFFFFF",
      highlight: "#CCCCCC"
    }
  };

  const colors = colorSchemes[color] || colorSchemes.default;
  const animationClass = animate ? "pokeball-spin" : "";

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`${className} ${animationClass}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={`topGradient-${color}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor={colors.topGradient} />
          <stop offset="100%" stopColor={colors.top} />
        </radialGradient>
        <radialGradient id={`bottomGradient-${color}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor={colors.bottomGradient} />
          <stop offset="100%" stopColor={colors.bottom} />
        </radialGradient>
        <radialGradient id={`centerGradient-${color}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor={colors.center} />
          <stop offset="100%" stopColor={colors.highlight} />
        </radialGradient>
      </defs>
      
      {/* Main Pokéball circle */}
      <circle cx="50" cy="50" r="48" fill={colors.ring} />
      
      {/* Top half */}
      <path 
        d="M 2 50 A 48 48 0 0 1 98 50 Z" 
        fill={`url(#topGradient-${color})`} 
      />
      
      {/* Bottom half */}
      <path 
        d="M 2 50 A 48 48 0 0 0 98 50 Z" 
        fill={`url(#bottomGradient-${color})`} 
      />
      
      {/* Center line */}
      <rect x="0" y="46" width="100" height="8" fill={colors.ring} />
      
      {/* Center circle */}
      <circle cx="50" cy="50" r="12" fill={colors.ring} />
      <circle cx="50" cy="50" r="8" fill={`url(#centerGradient-${color})`} />
      
      {/* Highlight */}
      <ellipse cx="42" cy="42" rx="8" ry="6" fill="rgba(255,255,255,0.6)" />
      
      {/* CSS for smooth spinning animation */}
      <style jsx>{`
        .pokeball-spin {
          animation: pokeball-rotate 2s linear infinite;
          transform-origin: 50% 50%;
        }
        
        @keyframes pokeball-rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        /* Prevent animation buffering and ensure smooth start */
        .pokeball-spin {
          animation-fill-mode: both;
          animation-timing-function: linear;
          will-change: transform;
        }
      `}</style>
    </svg>
  );
};

export const TypeBadgeSVG = ({ type, size = 24, className = "" }) => {
  const typeColors = {
    normal: "#A8A77A",
    fire: "#EE8130", 
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1", 
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC", 
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD"
  };

  const color = typeColors[type?.toLowerCase()] || typeColors.normal;

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`typeGradient-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      
      <circle 
        cx="12" 
        cy="12" 
        r="10" 
        fill={`url(#typeGradient-${type})`} 
        stroke="rgba(255,255,255,0.3)" 
        strokeWidth="1"
      />
      
      {/* Type symbol placeholder */}
      <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
};

export const LoadingDotsRun = ({ className = "", color = "#FF0000" }) => (
  <svg 
    width="60" 
    height="20" 
    viewBox="0 0 60 20" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10" cy="10" r="3" fill={color}>
      <animate attributeName="cy" values="10;5;10" dur="1s" repeatCount="indefinite" begin="0s" />
    </circle>
    <circle cx="30" cy="10" r="3" fill={color}>
      <animate attributeName="cy" values="10;5;10" dur="1s" repeatCount="indefinite" begin="0.3s" />
    </circle>
    <circle cx="50" cy="10" r="3" fill={color}>
      <animate attributeName="cy" values="10;5;10" dur="1s" repeatCount="indefinite" begin="0.6s" />
    </circle>
  </svg>
);

export const PikachuSilhouette = ({ size = 80, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Simplified Pikachu silhouette */}
    <g fill="currentColor">
      {/* Ears */}
      <path d="M25 20 L15 5 L35 15 Z" />
      <path d="M75 20 L85 5 L65 15 Z" />
      
      {/* Head */}
      <circle cx="50" cy="45" r="25" />
      
      {/* Body */}
      <ellipse cx="50" cy="75" rx="15" ry="18" />
      
      {/* Tail */}
      <path d="M65 65 Q80 50 85 35 Q90 45 75 55 Q70 65 65 65" />
      
      {/* Arms */}
      <ellipse cx="35" cy="65" rx="8" ry="12" />
      <ellipse cx="65" cy="65" rx="8" ry="12" />
    </g>
  </svg>
);

export const SearchMagnifyingGlass = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    className={className}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default { 
  PokeballSVG, 
  TypeBadgeSVG, 
  LoadingDotsRun, 
  PikachuSilhouette, 
  SearchMagnifyingGlass 
};