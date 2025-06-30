import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback, 
  createContext, 
  useContext,
  Fragment 
} from 'react';
import { createPortal } from 'react-dom';
import { HapticFeedback, VisualFeedback } from './MicroInteractionSystem';

/**
 * Advanced Modal System with Focus Management, Animations, and Accessibility
 */

// Modal Context for global state management
const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

// Modal Provider Component
export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState([]);
  const [overlay, setOverlay] = useState(null);
  
  const openModal = useCallback((modalComponent, options = {}) => {
    const modalId = Math.random().toString(36).substr(2, 9);
    const modal = {
      id: modalId,
      component: modalComponent,
      options: {
        closable: true,
        backdrop: true,
        animation: 'scale',
        size: 'medium',
        position: 'center',
        ...options
      }
    };
    
    setModals(prev => [...prev, modal]);
    HapticFeedback.medium();
    
    return modalId;
  }, []);
  
  const closeModal = useCallback((modalId) => {
    setModals(prev => prev.filter(modal => modal.id !== modalId));
    HapticFeedback.light();
  }, []);
  
  const closeAllModals = useCallback(() => {
    setModals([]);
    HapticFeedback.medium();
  }, []);
  
  const showOverlay = useCallback((overlayComponent, options = {}) => {
    setOverlay({
      component: overlayComponent,
      options: {
        backdrop: true,
        ...options
      }
    });
  }, []);
  
  const hideOverlay = useCallback(() => {
    setOverlay(null);
  }, []);
  
  const contextValue = {
    modals,
    overlay,
    openModal,
    closeModal,
    closeAllModals,
    showOverlay,
    hideOverlay
  };
  
  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <ModalRenderer />
      {overlay && <OverlayRenderer />}
    </ModalContext.Provider>
  );
};

// Focus Management Hook
const useFocusManagement = (isOpen, modalRef) => {
  const previousActiveElement = useRef(null);
  const focusableElements = useRef([]);
  
  const getFocusableElements = useCallback(() => {
    if (!modalRef.current) return [];
    
    const selectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ];
    
    return Array.from(modalRef.current.querySelectorAll(selectors.join(', ')));
  }, [modalRef]);
  
  const trapFocus = useCallback((event) => {
    if (event.key !== 'Tab') return;
    
    const focusable = getFocusableElements();
    if (focusable.length === 0) return;
    
    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];
    
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);
  
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the first focusable element in the modal
      setTimeout(() => {
        const focusable = getFocusableElements();
        if (focusable.length > 0) {
          focusable[0].focus();
        }
      }, 100);
      
      // Add focus trap
      document.addEventListener('keydown', trapFocus);
      
      return () => {
        document.removeEventListener('keydown', trapFocus);
        
        // Restore focus to the previously focused element
        if (previousActiveElement.current && previousActiveElement.current.focus) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, trapFocus, getFocusableElements]);
};

// Individual Modal Component
const Modal = ({ 
  modal, 
  onClose, 
  isLast,
  zIndex 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  
  useFocusManagement(isVisible, modalRef);
  
  const { component: ModalComponent, options } = modal;
  
  // Handle modal mounting animation
  useEffect(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(true);
      setIsAnimating(false);
    }, 50);
  }, []);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && options.closable && isLast) {
        handleClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [options.closable, isLast]);
  
  const handleClose = useCallback(() => {
    if (!options.closable) return;
    
    setIsVisible(false);
    setIsAnimating(true);
    
    setTimeout(() => {
      onClose(modal.id);
    }, 200);
  }, [modal.id, onClose, options.closable]);
  
  const handleBackdropClick = useCallback((event) => {
    if (event.target === backdropRef.current && options.backdrop && options.closable) {
      handleClose();
    }
  }, [handleClose, options.backdrop, options.closable]);
  
  // Animation classes
  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-in-out';
    
    switch (options.animation) {
      case 'slide-up':
        return `${baseClasses} ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`;
      case 'slide-down':
        return `${baseClasses} ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`;
      case 'slide-left':
        return `${baseClasses} ${
          isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`;
      case 'slide-right':
        return `${baseClasses} ${
          isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'
        }`;
      case 'fade':
        return `${baseClasses} ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`;
      case 'scale':
      default:
        return `${baseClasses} ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`;
    }
  };
  
  // Size classes
  const getSizeClasses = () => {
    switch (options.size) {
      case 'small':
        return 'max-w-md';
      case 'large':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-6xl';
      case 'full':
        return 'max-w-full max-h-full';
      case 'medium':
      default:
        return 'max-w-2xl';
    }
  };
  
  // Position classes
  const getPositionClasses = () => {
    switch (options.position) {
      case 'top':
        return 'items-start pt-20';
      case 'bottom':
        return 'items-end pb-20';
      case 'left':
        return 'items-center justify-start pl-20';
      case 'right':
        return 'items-center justify-end pr-20';
      case 'center':
      default:
        return 'items-center justify-center';
    }
  };
  
  const modalContent = (
    <div
      className={`fixed inset-0 flex ${getPositionClasses()}`}
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className={`absolute inset-0 transition-opacity duration-200 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        } ${options.backdrop ? 'bg-black bg-opacity-50 backdrop-blur-sm' : ''}`}
        onClick={handleBackdropClick}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          relative w-full mx-4 my-4
          ${getSizeClasses()}
          ${getAnimationClasses()}
        `}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Close Button */}
          {options.closable && (
            <button
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pokemon-blue">
              onClick={handleClose}
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          
          {/* Modal Content */}
          <ModalComponent onClose={handleClose} {...options.props} />
        </div>
      </div>
    </div>
  );
  
  // Render to portal if in browser
  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return null;
};

// Modal Renderer Component
const ModalRenderer = () => {
  const { modals, closeModal } = useModal();
  
  return (
    <Fragment>
      {modals.map((modal, index) => (
        <Modal
          key={modal.id}
          modal={modal}
          onClose={closeModal}
          isLast={index === modals.length - 1}
          zIndex={1000 + index * 10}
        />
      ))}
    </Fragment>
  );
};

// Overlay Component for non-modal overlays
const Overlay = ({ 
  children, 
  onClose, 
  backdrop = true, 
  animation = 'fade',
  position = 'center',
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);
  
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);
  
  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 200);
  }, [onClose]);
  
  const handleBackdropClick = useCallback((event) => {
    if (event.target === overlayRef.current && backdrop) {
      handleClose();
    }
  }, [handleClose, backdrop]);
  
  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-200 ease-in-out';
    
    switch (animation) {
      case 'slide-up':
        return `${baseClasses} ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`;
      case 'fade':
      default:
        return `${baseClasses} ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`;
    }
  };
  
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'items-start justify-center pt-4';
      case 'bottom':
        return 'items-end justify-center pb-4';
      case 'center':
      default:
        return 'items-center justify-center';
    }
  };
  
  const overlayContent = (
    <div
      ref={overlayRef}
      className={`fixed inset-0 flex ${getPositionClasses()}`}
      style={{ zIndex: 1500 }}
      onClick={handleBackdropClick}
    >
      {backdrop && (
        <div
          className={`absolute inset-0 transition-opacity duration-200 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          } bg-black bg-opacity-25`}
        />
      )}
      <div className={`relative ${getAnimationClasses()} ${className}`}>
        {children}
      </div>
    </div>
  );
  
  if (typeof window !== 'undefined') {
    return createPortal(overlayContent, document.body);
  }
  
  return null;
};

// Overlay Renderer Component
const OverlayRenderer = () => {
  const { overlay, hideOverlay } = useModal();
  
  if (!overlay) return null;
  
  const { component: OverlayComponent, options } = overlay;
  
  return (
    <Overlay onClose={hideOverlay} {...options}>
      <OverlayComponent onClose={hideOverlay} {...options.props} />
    </Overlay>
  );
};

// Pre-built Modal Components

// Confirmation Modal
export const ConfirmationModal = ({ 
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  variant = 'primary'
}) => {
  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (onClose) onClose();
    HapticFeedback.success();
  };
  
  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
    HapticFeedback.light();
  };
  
  const variantClasses = {
    primary: 'bg-pokemon-red hover:bg-red-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white'
  };
  
  return (
    <div className="p-6">
      <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {message}
      </p>
      <div className="flex gap-3 justify-end">
        <button
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
          onClick={handleCancel}
        >
          {cancelText}
        </button>
        <button
          className={`px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantClasses[variant]}`}
          onClick={handleConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
};

// Image Modal
export const ImageModal = ({ 
  src, 
  alt = '', 
  title,
  onClose 
}) => {
  return (
    <div className="p-4 max-w-full max-h-full">
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
          {title}
        </h2>
      )}
      <div className="flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg">
          loading="lazy"
        />
      </div>
    </div>
  );
};

// Loading Modal
export const LoadingModal = ({ 
  message = 'Loading...',
  progress,
  onClose 
}) => {
  return (
    <div className="p-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 animate-spin">
          <svg className="w-full h-full text-pokemon-red" viewBox="0 0 24 24">
            <circle
              className="opacity-25">
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75">
              fill="currentColor"
              d="M4,12a8,8,0,0,1,8-8V0A12,12,0,0,0,0,12Z"
            />
          </svg>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
        {progress !== undefined && (
          <div className="w-64 bg-gray-200 rounded-full h-2">
            <div
              className="bg-pokemon-red h-2 rounded-full transition-all duration-300">
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Custom Modal Hook
export const useModalManager = () => {
  const { openModal, closeModal, closeAllModals } = useModal();
  
  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      const modalId = openModal(ConfirmationModal, {
        props: {
          ...options,
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false)
        },
        closable: false
      });
    });
  }, [openModal]);
  
  const showImage = useCallback((src, options = {}) => {
    return openModal(ImageModal, {
      props: { src, ...options },
      size: 'large',
      animation: 'scale'
    });
  }, [openModal]);
  
  const showLoading = useCallback((message = 'Loading...', progress) => {
    return openModal(LoadingModal, {
      props: { message, progress },
      closable: false,
      backdrop: false,
      size: 'small'
    });
  }, [openModal]);
  
  return {
    openModal,
    closeModal,
    closeAllModals,
    confirm,
    showImage,
    showLoading
  };
};

export default {
  ModalProvider,
  useModal,
  useModalManager,
  ConfirmationModal,
  ImageModal,
  LoadingModal,
  Overlay
};