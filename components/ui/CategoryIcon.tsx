import React from 'react';

type MoveCategory = 'physical' | 'special' | 'status';
type IconSize = 'sm' | 'md' | 'lg' | 'xl';

interface CategoryColors {
  bg: string;
  border: string;
  text: string;
}

interface CategoryIconProps {
  category: MoveCategory;
  size?: IconSize;
}

// Pokemon game-style move category icons
export default function CategoryIcon({ category, size = 'md' }: CategoryIconProps) {
  const sizeClasses: Record<IconSize, string> = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  const colors: Record<MoveCategory, CategoryColors> = {
    physical: {
      bg: '#C92112',
      border: '#8B0000',
      text: '#FFFFFF'
    },
    special: {
      bg: '#4F5870',
      border: '#2C3E50',
      text: '#FFFFFF'
    },
    status: {
      bg: '#8C888C',
      border: '#555555',
      text: '#FFFFFF'
    }
  };

  const categoryColors = colors[category] || colors.status;

  if (category === 'physical') {
    return (
      <div 
        className={`${sizeClasses[size]} inline-flex items-center justify-center rounded`}
        style={{ 
          backgroundColor: categoryColors.bg,
          border: `2px solid ${categoryColors.border}`
        }}
        title="Physical"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill={categoryColors.text}>
          {/* Burst/Star impact pattern for Physical moves */}
          <g transform="translate(50, 50)">
            {/* Center circle */}
            <circle cx="0" cy="0" r="8" fill={categoryColors.text}/>
            {/* Star burst pattern */}
            <path d="M 0,-25 L 5,-10 L 20,-12 L 8,-2 L 15,15 L 0,5 L -15,15 L -8,-2 L -20,-12 L -5,-10 Z" fill={categoryColors.text}/>
            {/* Additional burst lines */}
            <path d="M 0,-35 L 3,-25 L -3,-25 Z" fill={categoryColors.text}/>
            <path d="M 25,-25 L 20,-15 L 15,-20 Z" fill={categoryColors.text} transform="rotate(45)"/>
            <path d="M 25,-25 L 20,-15 L 15,-20 Z" fill={categoryColors.text} transform="rotate(90)"/>
            <path d="M 25,-25 L 20,-15 L 15,-20 Z" fill={categoryColors.text} transform="rotate(135)"/>
            <path d="M 25,-25 L 20,-15 L 15,-20 Z" fill={categoryColors.text} transform="rotate(180)"/>
            <path d="M 25,-25 L 20,-15 L 15,-20 Z" fill={categoryColors.text} transform="rotate(225)"/>
            <path d="M 25,-25 L 20,-15 L 15,-20 Z" fill={categoryColors.text} transform="rotate(270)"/>
            <path d="M 25,-25 L 20,-15 L 15,-20 Z" fill={categoryColors.text} transform="rotate(315)"/>
          </g>
        </svg>
      </div>
    );
  }

  if (category === 'special') {
    return (
      <div 
        className={`${sizeClasses[size]} inline-flex items-center justify-center rounded`}
        style={{ 
          backgroundColor: categoryColors.bg,
          border: `2px solid ${categoryColors.border}`
        }}
        title="Special"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-1">
          {/* Ripple/Ring pattern for Special moves */}
          <g transform="translate(50, 50)">
            {/* Center dot */}
            <circle cx="0" cy="0" r="6" fill={categoryColors.text}/>
            {/* Concentric rings */}
            <circle cx="0" cy="0" r="14" fill="none" stroke={categoryColors.text} strokeWidth="4"/>
            <circle cx="0" cy="0" r="24" fill="none" stroke={categoryColors.text} strokeWidth="3"/>
            <circle cx="0" cy="0" r="34" fill="none" stroke={categoryColors.text} strokeWidth="2"/>
            {/* Ring segments for energy effect */}
            <path d="M -10,-10 A 14,14 0 0,1 10,-10" fill="none" stroke={categoryColors.text} strokeWidth="2" opacity="0.5"/>
            <path d="M 10,10 A 14,14 0 0,1 -10,10" fill="none" stroke={categoryColors.text} strokeWidth="2" opacity="0.5"/>
          </g>
        </svg>
      </div>
    );
  }

  // Status moves
  return (
    <div 
      className={`${sizeClasses[size]} inline-flex items-center justify-center rounded`}
      style={{ 
        backgroundColor: categoryColors.bg,
        border: `2px solid ${categoryColors.border}`
      }}
      title="Status"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full p-1" fill={categoryColors.text}>
        {/* Yin-yang style swirl for Status moves */}
        <g transform="translate(50, 50)">
          {/* Main swirl shape */}
          <path d="M 0,-30 C -16.5,-30 -30,-16.5 -30,0 C -30,16.5 -16.5,30 0,30 C 8.25,30 15,23.25 15,15 C 15,6.75 8.25,0 0,0 C -8.25,0 -15,-6.75 -15,-15 C -15,-23.25 -8.25,-30 0,-30 Z" fill={categoryColors.text}/>
          {/* Small circles */}
          <circle cx="0" cy="-15" r="5" fill={categoryColors.bg}/>
          <circle cx="0" cy="15" r="5" fill={categoryColors.text}/>
          {/* Outer ring */}
          <circle cx="0" cy="0" r="35" fill="none" stroke={categoryColors.text} strokeWidth="3"/>
        </g>
      </svg>
    </div>
  );
}