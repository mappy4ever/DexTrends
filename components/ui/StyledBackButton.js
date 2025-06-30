import React from 'react';
import { useRouter } from 'next/router';

const StyledBackButton = ({ 
  onClick, 
  text = "Back", 
  variant = "default", // default, pokemon, pocket, tcg
  size = "md", // sm, md, lg
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

  const getVariantStyles = () => {
    switch (variant) {
      case "pokemon":
        return "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-red-500/25";
      case "pocket":
        return "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/25";
      case "tcg":
        return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/25";
      default:
        return "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md";
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "px-3 py-1.5 text-sm";
      case "lg":
        return "px-6 py-3 text-lg";
      default:
        return "px-4 py-2 text-base";
    }
  };

  const getIconSize = () => {
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
      className={`
        inline-flex items-center gap-2 font-medium rounded-lg
        transition-all duration-200 ease-in-out
        transform hover:scale-105 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
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