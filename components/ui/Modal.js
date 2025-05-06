// components/ui/Modal.js (New File)
import React from 'react';
import { FaTimes } from 'react-icons/fa';

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;

  let sizeClass = "max-w-md"; // Default md
  if (size === "lg") sizeClass = "max-w-lg";
  if (size === "xl") sizeClass = "max-w-xl";
  if (size === "2xl") sizeClass = "max-w-2xl";


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close on overlay click
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-card text-card-foreground rounded-lg shadow-2xl p-6 m-4 w-full ${sizeClass} transform transition-all duration-300 ease-in-out scale-100 opacity-100 animate-fadeIn`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-semibold text-foreground">{title}</h2>}
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

// Add to your globals.css for the animation (optional)
/*
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
*/