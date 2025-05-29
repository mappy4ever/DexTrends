// components/ui/Modal.js
import React from 'react';
import { FaTimes } from 'react-icons/fa';

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  // Define size classes based on props
  // These should align with Tailwind's max-width scale or your custom extensions
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl", // Example: Added more sizes
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  };
  const resolvedSizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300 ease-in-out" // Using Tailwind opacity shorthand
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-card text-card-foreground rounded-app-lg shadow-2xl m-4 w-full ${resolvedSizeClass} transform transition-all duration-300 ease-in-out scale-100 opacity-100 animate-fadeIn overflow-y-auto max-h-[90vh]`} // Added overflow and max-height
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-border"> {/* Standardized padding */}
          {title && (
            typeof title === 'string' ? (
                <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            ) : (
                title // Allow JSX title
            )
          )}
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground transition-colors rounded-full p-1 -mr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" // Improved focus and spacing
            aria-label="Close modal"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="p-4 md:p-6"> {/* Standardized padding */}
            {children}
        </div>
      </div>
    </div>
  );
}