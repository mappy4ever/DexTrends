import React from 'react';
import { useRouter } from 'next/router';

type Variant = 'default' | 'pokemon' | 'pocket' | 'tcg';
type Size = 'sm' | 'md' | 'lg';

interface StyledBackButtonProps {
  onClick?: () => void;
  text?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}

const StyledBackButton: React.FC<StyledBackButtonProps> = ({ 
  onClick, 
  text = "Back", 
  variant = "default",
  size = "md",
  className = "" 
}) => {
  const router = useRouter();
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  const getVariantStyles = (): string => {
    switch (variant) {
      case "pokemon":
        return "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/25";
      case "pocket":
        return "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-amber-500/25";
      case "tcg":
        return "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-amber-500/25";
      default:
        return "bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-stone-600 shadow-sm hover:shadow-md";
    }
  };

  const getSizeStyles = (): string => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "lg":
        return "px-6 py-3 text-lg";
      default:
        return "px-4 py-2 text-base";
    }
  };

  const getIconSize = (): string => {
    switch (size) {
      case "sm":
        return "w-4 h-4";
      case "lg":
        return "w-6 h-6";
      default:
        return "w-5 h-5";
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Go back"
      className={`
        inline-flex items-center gap-2 font-medium rounded-lg
        min-h-[44px] touch-manipulation
        transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
    >
      {/* Pokeball Icon for Pokemon variant */}
      {variant === "pokemon" && (
        <div className={`${getIconSize()} flex items-center justify-center`}>
          <div className="w-full h-full relative">
            {/* Pokeball SVG */}
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2"/>
              <path d="M2 12h20M12 2a10 10 0 0 1 0 20" stroke="currentColor" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </div>
        </div>
      )}
      
      {/* Card Icon for TCG variant */}
      {variant === "tcg" && (
        <svg className={getIconSize()} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )}
      
      {/* Phone Icon for Pocket variant */}
      {variant === "pocket" && (
        <svg className={getIconSize()} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )}
      
      {/* Default Arrow Icon */}
      {variant === "default" && (
        <svg className={getIconSize()} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      )}
      
      <span>{text}</span>
    </button>
  );
};

export default StyledBackButton;