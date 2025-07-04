import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// Enhanced Modal that appears at current scroll position
export const PositionedModal = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  maxWidth = 'max-w-4xl',
  maxHeight = 'max-h-[90vh]',
  showCloseButton = true,
  centerVertically = false,
  className = ''
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      // Focus trap
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements?.[0];
      const lastElement = focusableElements?.[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      const handleEscapeKey = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleTabKey);
      document.addEventListener('keydown', handleEscapeKey);
      
      // Focus first element
      setTimeout(() => firstElement?.focus(), 100);

      return () => {
        document.body.style.overflow = originalStyle;
        document.removeEventListener('keydown', handleTabKey);
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-start justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm ${
        centerVertically ? 'items-center' : 'pt-8 md:pt-16'
      }`}
      onClick={handleOverlayClick}
      style={{
        // Position modal at current scroll position on mobile
        top: centerVertically ? 0 : window.scrollY || 0,
        height: centerVertically ? '100vh' : `calc(100vh + ${window.scrollY || 0}px)`
      }}
    >
      <div 
        ref={modalRef}
        className={`
          relative w-full ${maxWidth} ${maxHeight} 
          bg-white rounded-2xl shadow-2xl 
          transform transition-all duration-300 ease-out
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${className}
        `}
        style={{
          // Ensure modal appears in viewport
          marginTop: centerVertically ? 0 : Math.max(0, window.innerHeight * 0.1)
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h2 id="modal-title" className="text-2xl font-bold text-gray-800">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
      </div>
    </div>
  );

  // Render modal at document root to avoid z-index issues
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

// Specialized Pokemon Selector Modal
export const PokemonSelectorModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  title = "Choose a Pokémon",
  pokemonList = [],
  loading = false 
}) => {
  return (
    <PositionedModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-6xl"
      maxHeight="max-h-[85vh]"
    >
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading Pokémon...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pokemonList.map((pokemon, index) => (
              <button
                key={pokemon.name || index}
                onClick={() => {
                  onSelect(pokemon);
                  onClose();
                }}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="text-center">
                  <div className="text-lg font-medium capitalize text-gray-800">
                    {pokemon.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    #{String(index + 1).padStart(3, '0')}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PositionedModal>
  );
};

// Pack Opening Modal
export const PackOpeningModal = ({ 
  isOpen, 
  onClose, 
  pack,
  onOpenPack
}) => {
  return (
    <PositionedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Open ${pack?.name || 'Pack'}`}
      maxWidth="max-w-2xl"
      centerVertically={true}
    >
      <div className="p-6 text-center">
        <div className="text-6xl mb-4">🎁</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          Ready to open your pack?
        </h3>
        <p className="text-gray-600 mb-6">
          You're about to open a {pack?.name} pack. This will reveal new cards!
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onOpenPack();
              onClose();
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open Pack!
          </button>
        </div>
      </div>
    </PositionedModal>
  );
};

export default PositionedModal;