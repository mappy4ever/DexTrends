// components/ui/Tooltip.js
import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  text: string;
  position?: string;
  className?: string;
}

export default function Tooltip({ children, text, position = 'top', className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Position classes - adjust these pixel values as needed for your design
  const getPositionClasses = (): string => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2'; // Default to top
    }
  };

  const getArrowClasses = (): string => {
    switch (position) {
      case 'top':
        return 'absolute left-1/2 -translate-x-1/2 top-full border-x-8 border-x-transparent border-t-8';
      case 'bottom':
        return 'absolute left-1/2 -translate-x-1/2 bottom-full border-x-8 border-x-transparent border-b-8';
      case 'left':
        return 'absolute top-1/2 -translate-y-1/2 left-full border-y-8 border-y-transparent border-l-8';
      case 'right':
        return 'absolute top-1/2 -translate-y-1/2 right-full border-y-8 border-y-transparent border-r-8';
      default:
        return 'absolute left-1/2 -translate-x-1/2 top-full border-x-8 border-x-transparent border-t-8';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)} // For accessibility with keyboard navigation
      onBlur={() => setIsVisible(false)}  // For accessibility
      tabIndex={0} // Make it focusable
    >
      {children} {/* This is the element the tooltip is attached to (e.g., an icon) */}
      {isVisible && text && (
        <div
          role="tooltip"
          className={`absolute z-30 w-max max-w-xs px-2 py-2 text-sm text-white bg-gray-800 dark:bg-slate-700 rounded-lg shadow-lg whitespace-normal break-words transition-opacity ${getPositionClasses()}`}
        >
          {text}
          {/* Tooltip Arrow - adjust border color to match tooltip bg */}
          <div className={`${getArrowClasses()} border-gray-800 dark:border-slate-700`}></div>
        </div>
      )}
    </div>
  );
}