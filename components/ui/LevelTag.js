import React from 'react';

/**
 * LevelTag component for displaying Pokémon levels in the new "Lv. X" format
 * Replaces the old circular number badges with modern styled level indicators
 */
export default function LevelTag({ level, size = "md", className = "" }) {
  if (!level || level === 0) return null;
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm", 
    lg: "px-4 py-2 text-base"
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <span 
      className={`
        inline-flex items-center justify-center font-bold rounded-md
        bg-gradient-to-r from-gray-800 to-gray-900 
        text-white shadow-md border border-gray-700
        dark:from-gray-700 dark:to-gray-800 dark:border-gray-600
        transition-all duration-200 hover:shadow-lg
        ${sizeClass}
        ${className}
      `}
      style={{
        textShadow: '1px 1px 0px rgba(0,0,0,0.8)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}
    >
      Lv. {level}
    </span>
  );
}

/**
 * Alternative compact version for smaller spaces
 */
export function CompactLevelTag({ level, className = "" }) {
  if (!level || level === 0) return null;
  
  return (
    <span 
      className={`
        inline-flex items-center justify-center font-bold rounded
        bg-black text-white shadow-sm
        px-2 py-0.5 text-xs
        ${className}
      `}
      style={{
        textShadow: '0 1px 1px rgba(0,0,0,0.5)'
      }}
    >
      Lv.{level}
    </span>
  );
}