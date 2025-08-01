import React, { 
  useState, 
  useRef, 
  useEffect, 
  useCallback,
  createContext,
  useContext,
  Fragment,
  ReactNode,
  CSSProperties
} from 'react';
import { useTooltip, useContextualHelp } from './TooltipHelpSystem.hooks';
import { createPortal } from 'react-dom';
import { HapticFeedback } from './MicroInteractionSystem';

// Re-export hooks for backward compatibility
export { useTooltip, useContextualHelp } from './TooltipHelpSystem.hooks';

/**
 * Advanced Contextual Tooltip and Help System
 */

// Type definitions
interface TooltipOptions {
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  variant?: 'dark' | 'light';
  size?: 'small' | 'medium' | 'large';
}

interface ActiveTooltip extends TooltipOptions {
  content: ReactNode;
  targetElement: HTMLElement;
}

interface Position {
  x: number;
  y: number;
}

export interface TooltipContextType {
  activeTooltip: ActiveTooltip | null;
  tooltipPosition: Position;
  showTooltip: (content: ReactNode, targetElement: HTMLElement, options?: TooltipOptions) => void;
  hideTooltip: () => void;
}

interface TooltipProviderProps {
  children: ReactNode;
  delay?: number;
  hideDelay?: number;
}

interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
  variant?: 'dark' | 'light';
  size?: 'small' | 'medium' | 'large';
}

interface RichTooltipAction {
  label: string;
  onClick: () => void;
}

interface RichTooltipProps {
  children: ReactNode;
  title?: string;
  content: ReactNode;
  icon?: ReactNode;
  action?: RichTooltipAction;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
  className?: string;
}

interface HelpStep {
  target: string;
  title?: string;
  content?: string;
}

interface HelpSystemProps {
  children: (props: { startTour: () => void; isActive: boolean }) => ReactNode;
  steps?: HelpStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  overlay?: boolean;
  showProgress?: boolean;
  className?: string;
}

interface HelpOverlayProps {
  step?: HelpStep;
  currentStep: number;
  totalSteps: number;
  highlightedElement: HTMLElement | null;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  showOverlay: boolean;
  showProgress: boolean;
  className?: string;
}

interface QuickHelpButtonProps {
  content: ReactNode;
  title?: string;
  icon?: ReactNode;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  className?: string;
}

interface HelpContentEntry {
  [key: string]: string | HelpContentEntry;
}

// Tooltip Context for global management
export const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

// Tooltip Provider Component
export const TooltipProvider: React.FC<TooltipProviderProps> = ({ children, delay = 500, hideDelay = 0 }) => {
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<Position>({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const showTooltip = useCallback((content: ReactNode, targetElement: HTMLElement, options: TooltipOptions = {}) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      const rect = targetElement.getBoundingClientRect();
      const position = calculatePosition(rect, options.placement || 'top');
      
      setTooltipPosition(position);
      setActiveTooltip({
        content,
        targetElement,
        ...options
      });
      
      HapticFeedback.light();
    }, options.delay ?? delay);
  }, [delay]);
  
  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setActiveTooltip(null);
    }, hideDelay);
  }, [hideDelay]);
  
  const calculatePosition = (targetRect: DOMRect, placement: string): Position => {
    const tooltipWidth = 200; // Estimated tooltip width
    const tooltipHeight = 40; // Estimated tooltip height
    const offset = 8;
    
    let x: number, y: number;
    
    switch (placement) {
      case 'top':
        x = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        y = targetRect.top - tooltipHeight - offset;
        break;
      case 'bottom':
        x = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        y = targetRect.bottom + offset;
        break;
      case 'left':
        x = targetRect.left - tooltipWidth - offset;
        y = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = targetRect.right + offset;
        y = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        break;
      default:
        x = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        y = targetRect.top - tooltipHeight - offset;
    }
    
    // Ensure tooltip stays within viewport
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    x = Math.max(8, Math.min(x, viewport.width - tooltipWidth - 8));
    y = Math.max(8, Math.min(y, viewport.height - tooltipHeight - 8));
    
    return { x, y };
  };
  
  const contextValue: TooltipContextType = {
    activeTooltip,
    tooltipPosition,
    showTooltip,
    hideTooltip
  };
  
  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
      <TooltipRenderer />
    </TooltipContext.Provider>
  );
};

// Tooltip Renderer Component
const TooltipRenderer: React.FC = () => {
  const { activeTooltip, tooltipPosition } = useTooltip();
  
  if (!activeTooltip || typeof window === 'undefined') {
    return null;
  }
  
  const tooltipContent = (
    <div
      className="tooltip-container fixed z-50 pointer-events-none"
      style={{
        left: tooltipPosition.x,
        top: tooltipPosition.y
      }}
    >
      <div className="tooltip-content bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg max-w-xs animate-in fade-in slide-in-from-bottom-1 duration-200">
        {typeof activeTooltip.content === 'string' ? (
          <span>{activeTooltip.content}</span>
        ) : (
          activeTooltip.content
        )}
        
        {/* Tooltip Arrow */}
        <div
          className="tooltip-arrow absolute w-2 h-2 bg-gray-900 transform rotate-45"
          style={{
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            bottom: '-4px'
          }}
        />
      </div>
    </div>
  );
  
  return createPortal(tooltipContent, document.body);
};

// Basic Tooltip Component
export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  delay = 500,
  disabled = false,
  className = '',
  variant = 'dark',
  size = 'medium',
  ...props
}) => {
  const { showTooltip, hideTooltip } = useTooltip();
  const triggerRef = useRef<HTMLDivElement>(null);
  
  const handleMouseEnter = useCallback(() => {
    if (disabled || !content) return;
    
    if (triggerRef.current) {
      showTooltip(content, triggerRef.current, { placement, delay, variant, size });
    }
  }, [disabled, content, placement, delay, variant, size, showTooltip]);
  
  const handleMouseLeave = useCallback(() => {
    if (disabled) return;
    hideTooltip();
  }, [disabled, hideTooltip]);
  
  const handleFocus = useCallback(() => {
    if (disabled || !content) return;
    
    if (triggerRef.current) {
      showTooltip(content, triggerRef.current, { placement, delay: 0, variant, size });
    }
  }, [disabled, content, placement, variant, size, showTooltip]);
  
  const handleBlur = useCallback(() => {
    if (disabled) return;
    hideTooltip();
  }, [disabled, hideTooltip]);
  
  return (
    <div
      ref={triggerRef}
      className={`tooltip-trigger ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </div>
  );
};

// Rich Tooltip Component with advanced content
export const RichTooltip: React.FC<RichTooltipProps> = ({
  children,
  title,
  content,
  icon,
  action,
  placement = 'top',
  maxWidth = '300px',
  className = '',
  ...props
}) => {
  const richContent = (
    <div className="rich-tooltip-content" style={{ maxWidth }}>
      {/* Header */}
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
          {icon && <span className="text-blue-400">{icon}</span>}
          {title && <h4 className="font-semibold text-white">{title}</h4>}
        </div>
      )}
      
      {/* Content */}
      <div className="text-gray-200 text-sm leading-relaxed mb-3">
        {content}
      </div>
      
      {/* Action */}
      {action && (
        <div className="flex justify-end">
          <button
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
  
  return (
    <Tooltip
      content={richContent}
      placement={placement}
      className={className}
      {...props}
    >
      {children}
    </Tooltip>
  );
};

// Help System Component
export const HelpSystem: React.FC<HelpSystemProps> = ({
  children,
  steps = [],
  onComplete,
  onSkip,
  overlay = true,
  showProgress = true,
  className = ''
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  
  const highlightStep = useCallback((stepIndex: number) => {
    const step = steps[stepIndex];
    if (!step || !step.target) return;
    
    const targetElement = document.querySelector(step.target) as HTMLElement;
    if (targetElement) {
      setHighlightedElement(targetElement);
      
      // Scroll element into view
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center'
      });
    }
  }, [steps]);
  
  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    highlightStep(0);
    HapticFeedback.medium();
  }, [highlightStep]);
  
  const completeTour = useCallback(() => {
    setIsActive(false);
    setHighlightedElement(null);
    HapticFeedback.success();
    
    if (onComplete) {
      onComplete();
    }
  }, [onComplete]);
  
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      highlightStep(newStep);
      HapticFeedback.light();
    } else {
      completeTour();
    }
  }, [currentStep, steps.length, highlightStep, completeTour]);
  
  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      highlightStep(newStep);
      HapticFeedback.light();
    }
  }, [currentStep, highlightStep]);
  
  const skipTour = useCallback(() => {
    setIsActive(false);
    setHighlightedElement(null);
    HapticFeedback.light();
    
    if (onSkip) {
      onSkip();
    }
  }, [onSkip]);
  
  const currentStepData = steps[currentStep];
  
  return (
    <Fragment>
      {children({ startTour, isActive })}
      
      {isActive && (
        <HelpOverlay
          step={currentStepData}
          currentStep={currentStep}
          totalSteps={steps.length}
          highlightedElement={highlightedElement}
          onNext={nextStep}
          onPrevious={previousStep}
          onSkip={skipTour}
          showOverlay={overlay}
          showProgress={showProgress}
          className={className}
        />
      )}
    </Fragment>
  );
};

// Help Overlay Component
const HelpOverlay: React.FC<HelpOverlayProps> = ({
  step,
  currentStep,
  totalSteps,
  highlightedElement,
  onNext,
  onPrevious,
  onSkip,
  showOverlay,
  showProgress,
  className
}) => {
  const [tooltipPosition, setTooltipPosition] = useState<Position>({ x: 0, y: 0 });
  const [highlightStyle, setHighlightStyle] = useState<CSSProperties>({});
  
  useEffect(() => {
    if (highlightedElement) {
      const rect = highlightedElement.getBoundingClientRect();
      
      // Position tooltip
      const tooltipX = rect.left + rect.width / 2;
      const tooltipY = rect.bottom + 16;
      setTooltipPosition({ x: tooltipX, y: tooltipY });
      
      // Style highlight
      setHighlightStyle({
        left: rect.left - 4,
        top: rect.top - 4,
        width: rect.width + 8,
        height: rect.height + 8
      });
      
      // Add highlight class to element
      highlightedElement.classList.add('help-highlighted');
      
      return () => {
        highlightedElement.classList.remove('help-highlighted');
      };
    }
    return undefined;
  }, [highlightedElement]);
  
  const overlayContent = (
    <div className={`help-overlay fixed inset-0 z-50 ${className}`}>
      {/* Background Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
      )}
      
      {/* Element Highlight */}
      {highlightedElement && (
        <div
          className="absolute border-2 border-blue-500 rounded-lg bg-white bg-opacity-10 animate-pulse"
          style={highlightStyle}
        />
      )}
      
      {/* Tooltip */}
      <div
        className="absolute transform -translate-x-1/2 z-10"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y
        }}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-sm p-4 border border-gray-200">
          {/* Progress */}
          {showProgress && (
            <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <div className="flex gap-1">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Content */}
          <div className="mb-4">
            {step?.title && (
              <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
            )}
            {step?.content && (
              <p className="text-gray-700 text-sm leading-relaxed">{step.content}</p>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              className="text-gray-500 hover:text-gray-700 text-sm"
              onClick={onSkip}
            >
              Skip Tour
            </button>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                  onClick={onPrevious}
                >
                  Previous
                </button>
              )}
              <button
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={onNext}
              >
                {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Tooltip Arrow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white" />
        </div>
      </div>
    </div>
  );
  
  if (typeof window === 'undefined') {
    return null;
  }
  
  return createPortal(overlayContent, document.body);
};

// Quick Help Button
export const QuickHelpButton: React.FC<QuickHelpButtonProps> = ({
  content,
  title = 'Help',
  icon,
  position = 'bottom-right',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleHelp = useCallback(() => {
    setIsOpen(!isOpen);
    HapticFeedback.light();
  }, [isOpen]);
  
  const getPositionClasses = () => {
    const positions: Record<string, string> = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4'
    };
    return positions[position] || positions['bottom-right'];
  };
  
  return (
    <Fragment>
      <button
        className={`
          quick-help-button
          fixed
          w-12
          h-12
          bg-blue-500
          hover:bg-blue-600
          text-white
          rounded-full
          shadow-lg
          hover:shadow-xl
          transition-all
          duration-200
          flex
          items-center
          justify-center
          z-40
          ${getPositionClasses()}
          ${className}
        `}
        onClick={toggleHelp}
        aria-label={title}
        {...props}
      >
        {icon || (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>
      
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsOpen(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-gray-700 leading-relaxed">
              {content}
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};

// Contextual Help Hook

// Help Content Database
export const HelpContentDatabase: HelpContentEntry = {
  pokemon: {
    cards: {
      rarity: "Card rarity indicates how difficult a card is to find in booster packs. Common cards are easy to find, while Secret Rare cards are extremely rare.",
      hp: "Hit Points (HP) represent how much damage a Pokémon can take before being knocked out.",
      attacks: "Each attack has an energy cost and damage amount. Some attacks have special effects.",
      weakness: "Pokémon take double damage from their weakness type.",
      resistance: "Pokémon take reduced damage from their resistance type."
    },
    sets: {
      release: "Sets are released periodically and contain new cards with different themes and mechanics.",
      booster: "Booster packs contain a random selection of cards from a set.",
      prerelease: "Prerelease events allow players to play with new cards before the official release."
    }
  },
  trading: {
    prices: "Card prices fluctuate based on competitive play, rarity, and demand.",
    condition: "Card condition greatly affects value. Mint condition cards are worth significantly more.",
    market: "The trading card market can be volatile. Research current prices before trading."
  }
};

// Global Styles for Help System
export const HelpSystemStyles = `
  .help-highlighted {
    position: relative;
    z-index: 51;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
    border-radius: 4px;
  }
  
  .tooltip-trigger:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  .quick-help-button:focus-visible {
    outline: 2px solid #ffffff;
    outline-offset: 2px;
  }
  
  @media (prefers-reduced-motion: reduce) {
    .help-highlighted {
      animation: none;
    }
    
    .tooltip-content {
      animation: none;
    }
  }
`;

export default {
  TooltipProvider,
  Tooltip,
  RichTooltip,
  HelpSystem,
  QuickHelpButton,
  useTooltip,
  useContextualHelp,
  HelpContentDatabase,
  HelpSystemStyles
};