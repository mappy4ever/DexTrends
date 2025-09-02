import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  createContext,
  useContext,
  Fragment,
  ReactNode,
  CSSProperties
} from 'react';
import { useFAB, useContextualFAB, useScrollFAB } from './FloatingActionSystem.hooks';
import { useRouter } from 'next/router';
import { HapticFeedback, VisualFeedback } from './MicroInteractionSystem';

/**
 * Advanced Floating Action Button System with Contextual Actions
 */

type FABPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center' | 'top-center' | 'center-right' | 'center-left';
type FABSize = 'small' | 'medium' | 'large' | 'xl';
type FABColor = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'white';
type FABVariant = 'circular' | 'rounded' | 'square' | 'extended';
type FABAnimation = 'scale' | 'slide' | 'bounce' | 'pulse';
type HapticType = 'light' | 'medium' | 'strong' | 'success' | 'error' | 'select';
type FABDirection = 'up' | 'down' | 'left' | 'right';

export interface FABAction {
  icon: ReactNode;
  label?: string;
  onClick: (event: React.MouseEvent) => void;
  disabled?: boolean;
}

export interface FABConfig {
  id?: string;
  icon?: ReactNode;
  label?: string;
  onClick?: (event: React.MouseEvent) => void;
  position?: FABPosition;
  size?: FABSize;
  color?: FABColor;
  variant?: FABVariant;
  actions?: FABAction[];
  tooltip?: string;
  disabled?: boolean;
  hidden?: boolean;
  animation?: FABAnimation;
  className?: string;
}

export interface FABContextValue {
  fabs: FABConfig[];
  globalFAB: FABConfig | null;
  addFAB: (fabConfig: FABConfig) => string;
  removeFAB: (fabId: string) => void;
  setGlobalFABConfig: (config: FABConfig) => void;
  clearGlobalFAB: () => void;
}

// FAB Context for global state management
export const FABContext = createContext<FABContextValue | undefined>(undefined);

interface FABProviderProps {
  children: ReactNode;
}

// FAB Provider Component
export const FABProvider: React.FC<FABProviderProps> = ({ children }) => {
  const [fabs, setFabs] = useState<FABConfig[]>([]);
  const [globalFAB, setGlobalFAB] = useState<FABConfig | null>(null);
  
  const addFAB = useCallback((fabConfig: FABConfig): string => {
    const fabId = Math.random().toString(36).substr(2, 9);
    const fab = { id: fabId, ...fabConfig };
    setFabs(prev => [...prev, fab]);
    return fabId;
  }, []);
  
  const removeFAB = useCallback((fabId: string) => {
    setFabs(prev => prev.filter(fab => fab.id !== fabId));
  }, []);
  
  const setGlobalFABConfig = useCallback((config: FABConfig) => {
    setGlobalFAB(config);
  }, []);
  
  const clearGlobalFAB = useCallback(() => {
    setGlobalFAB(null);
  }, []);
  
  const contextValue: FABContextValue = {
    fabs,
    globalFAB,
    addFAB,
    removeFAB,
    setGlobalFABConfig,
    clearGlobalFAB
  };
  
  return (
    <FABContext.Provider value={contextValue}>
      {children}
      <FABRenderer />
    </FABContext.Provider>
  );
};

interface FloatingActionButtonProps {
  icon?: ReactNode;
  label?: string;
  onClick?: (event: React.MouseEvent) => void;
  position?: FABPosition;
  size?: FABSize;
  color?: FABColor;
  variant?: FABVariant;
  actions?: FABAction[];
  tooltip?: string;
  disabled?: boolean;
  hidden?: boolean;
  animation?: FABAnimation;
  haptic?: HapticType;
  className?: string;
}

// Individual FAB Component
export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  size = 'medium',
  color = 'primary',
  variant = 'circular',
  actions = [],
  tooltip,
  disabled = false,
  hidden = false,
  animation = 'scale',
  haptic = 'medium',
  className = '',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(!hidden);
  const [showTooltip, setShowTooltip] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle visibility changes
  useEffect(() => {
    if (hidden !== !isVisible) {
      setIsVisible(!hidden);
    }
  }, [hidden, isVisible]);
  
  // Handle clicks outside to close expanded FAB
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isExpanded]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isExpanded) return;
      
      if (event.key === 'Escape') {
        setIsExpanded(false);
        fabRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);
  
  const handleMainClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (disabled) return;
    
    HapticFeedback[haptic]();
    
    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick(event);
    }
  }, [disabled, actions.length, isExpanded, onClick, haptic]);
  
  const handleActionClick = useCallback((action: FABAction, event: React.MouseEvent) => {
    event.stopPropagation();
    
    HapticFeedback.light();
    setIsExpanded(false);
    
    if (action.onClick) {
      action.onClick(event);
    }
  }, []);
  
  const handleMouseEnter = useCallback(() => {
    if (tooltip && !isExpanded) {
      timeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 500);
    }
  }, [tooltip, isExpanded]);
  
  const handleMouseLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  }, []);
  
  // Style configurations
  const getPositionClasses = (): string => {
    const positions: Record<FABPosition, string> = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
      'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2',
      'top-center': 'top-6 left-1/2 transform -translate-x-1/2',
      'center-right': 'top-1/2 right-6 transform -translate-y-1/2',
      'center-left': 'top-1/2 left-6 transform -translate-y-1/2'
    };
    return positions[position] || positions['bottom-right'];
  };
  
  const getSizeClasses = (): string => {
    const sizes: Record<FABSize, string> = {
      small: 'w-12 h-12',
      medium: 'w-14 h-14',
      large: 'w-16 h-16',
      xl: 'w-20 h-20'
    };
    return sizes[size] || sizes.medium;
  };
  
  const getColorClasses = (): string => {
    const colors: Record<FABColor, string> = {
      primary: 'bg-pokemon-red hover:bg-red-600 text-white shadow-red-500/25',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-gray-500/25',
      success: 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/25',
      warning: 'bg-yellow-500 hover:bg-yellow-600 text-white shadow-yellow-500/25',
      danger: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/25',
      info: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/25',
      white: 'bg-white hover:bg-gray-50 text-gray-700 shadow-gray-500/25 border border-gray-200'
    };
    return colors[color] || colors.primary;
  };
  
  const getVariantClasses = (): string => {
    const variants: Record<FABVariant, string> = {
      circular: 'rounded-full',
      rounded: 'rounded-xl',
      square: 'rounded-lg',
      extended: 'rounded-full px-6'
    };
    return variants[variant] || variants.circular;
  };
  
  const getAnimationClasses = (): string => {
    if (!isVisible) return 'scale-0 opacity-0';
    
    const animations: Record<FABAnimation, string> = {
      scale: 'scale-100 opacity-100',
      slide: 'translate-y-0 opacity-100',
      bounce: 'animate-bounce opacity-100',
      pulse: 'animate-pulse opacity-100'
    };
    return animations[animation] || animations.scale;
  };
  
  const baseClasses = `
    fixed
    flex
    items-center
    justify-center
    font-medium
    cursor-pointer
    transition-all
    duration-300
    ease-out
    shadow-lg
    hover:shadow-xl
    hover:scale-105
    active:scale-95
    focus:outline-none
    focus:ring-4
    focus:ring-offset-2
    focus:ring-opacity-50
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${getPositionClasses()}
    ${getSizeClasses()}
    ${getColorClasses()}
    ${getVariantClasses()}
    ${getAnimationClasses()}
  `;
  
  return (
    <div
      ref={fabRef}
      className={`fab-container ${isExpanded ? 'expanded' : ''}`}
      style={{ zIndex: 1000 }}
    >
      {/* Expanded Actions */}
      {isExpanded && actions.length > 0 && (
        <div className="fab-actions">
          {actions.map((action, index) => (
            <div
              key={index}
              className={`
                absolute
                flex
                items-center
                justify-center
                w-12
                h-12
                bg-white
                hover:bg-gray-50
                text-gray-700
                rounded-full
                shadow-lg
                hover:shadow-xl
                cursor-pointer
                transition-all
                duration-200
                hover:scale-105
                active:scale-95
                focus:outline-none
                focus:ring-2
                focus:ring-pokemon-blue
                animate-in
                slide-in-from-bottom-2
                fade-in
              `}
              style={{
                bottom: `${(index + 1) * 60}px`,
                animationDelay: `${index * 50}ms`,
                right: position.includes('right') ? '0' : 'auto',
                left: position.includes('left') ? '0' : 'auto'
              }}
              onClick={(event) => handleActionClick(action, event)}
              title={action.label}
              tabIndex={0}
              role="button"
              aria-label={action.label}
            >
              {action.icon}
            </div>
          ))}
        </div>
      )}
      
      {/* Main FAB */}
      <button
        className={`${baseClasses} ${className}`}
        onClick={handleMainClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        aria-label={label || 'Floating action button'}
        aria-expanded={actions.length > 0 ? isExpanded : undefined}
        {...props}
      >
        <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-45' : ''}`}>
          {icon}
        </span>
        
        {/* Label for extended FABs */}
        {label && variant === 'extended' && (
          <span className="ml-2 text-sm font-medium">
            {label}
          </span>
        )}
      </button>
      
      {/* Tooltip */}
      {showTooltip && tooltip && !isExpanded && (
        <div
          className={`
            absolute
            px-3
            py-1
            bg-gray-900
            text-white
            text-sm
            rounded
            whitespace-nowrap
            pointer-events-none
            z-10
            animate-in
            fade-in
            slide-in-from-bottom-1
            ${position.includes('right') ? 'right-full mr-3' : 'left-full ml-3'}
            top-1/2
            transform
            -translate-y-1/2
          `}
        >
          {tooltip}
          <div
            className={`
              absolute
              top-1/2
              transform
              -translate-y-1/2
              w-2
              h-2
              bg-gray-900
              rotate-45
              ${position.includes('right') ? 'right-0 translate-x-1' : 'left-0 -translate-x-1'}
            `}
          />
        </div>
      )}
      
      {/* Backdrop for expanded state */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
          style={{ zIndex: -1 }}
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

interface SpeedDialFABProps extends Omit<FloatingActionButtonProps, 'icon'> {
  icon?: ReactNode;
  direction?: FABDirection;
}

// Speed Dial FAB (Multiple Actions)
export const SpeedDialFAB: React.FC<SpeedDialFABProps> = ({
  icon = '+',
  actions = [],
  position = 'bottom-right',
  direction = 'up',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getActionPosition = (index: number): CSSProperties => {
    const spacing = 60;
    const positions: Record<FABDirection, CSSProperties> = {
      up: { bottom: `${(index + 1) * spacing}px` },
      down: { top: `${(index + 1) * spacing}px` },
      left: { right: `${(index + 1) * spacing}px` },
      right: { left: `${(index + 1) * spacing}px` }
    };
    return positions[direction] || positions.up;
  };
  
  return (
    <FloatingActionButton
      icon={icon}
      onClick={() => setIsOpen(!isOpen)}
      position={position}
      actions={actions}
      {...props}
    />
  );
};

// Contextual FAB Hook

// FAB Renderer Component
const FABRenderer: React.FC = () => {
  const { fabs, globalFAB } = useFAB();
  
  return (
    <Fragment>
      {/* Render individual FABs */}
      {fabs.map((fab) => (
        <FloatingActionButton key={fab.id} {...fab} />
      ))}
      
      {/* Render global FAB */}
      {globalFAB && <FloatingActionButton {...globalFAB} />}
    </Fragment>
  );
};

// Scroll-triggered FAB Hook

// Pre-built FAB configurations
export const FABPresets = {
  scrollToTop: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    tooltip: 'Scroll to top'
  },
  
  addNew: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
    tooltip: 'Add new'
  },
  
  filter: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
    ),
    tooltip: 'Filter'
  },
  
  search: {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    tooltip: 'Search'
  }
};

export default {
  FABProvider,
  FloatingActionButton,
  SpeedDialFAB,
  useFAB,
  useContextualFAB,
  useScrollFAB,
  FABPresets
};