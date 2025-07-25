import React, { useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import logger from '../../utils/logger';

type FABPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
type FABSize = 'small' | 'medium' | 'large';
type FABColor = 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'pink' | 'gray';
type ExpandDirection = 'up' | 'down' | 'left' | 'right';

interface FABAction {
  icon: ReactNode;
  label?: string;
  onClick?: (action: FABAction, index: number) => void;
  disabled?: boolean;
  color?: string;
  badge?: string | number;
}

interface FloatingActionButtonProps {
  icon?: ReactNode;
  label?: string;
  onClick?: () => void;
  actions?: FABAction[];
  position?: FABPosition;
  size?: FABSize;
  color?: FABColor;
  disabled?: boolean;
  hideOnScroll?: boolean;
  expandDirection?: ExpandDirection;
  className?: string;
  badge?: string | number;
  pulse?: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon = '➕',
  label,
  onClick,
  actions = [],
  position = 'bottom-right',
  size = 'large',
  color = 'blue',
  disabled = false,
  hideOnScroll = true,
  expandDirection = 'up',
  className = '',
  badge,
  pulse = false
}) => {
  const { utils } = useMobileUtils();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const fabRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll visibility
  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down - hide FAB
        setIsVisible(false);
        setIsExpanded(false);
      } else {
        // Scrolling up - show FAB
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll, lastScrollY]);

  // Handle click outside to close expanded menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    return undefined;
  }, [isExpanded]);

  // Handle main FAB click
  const handleMainClick = useCallback(() => {
    if (disabled) return;

    utils.hapticFeedback('medium');
    
    if (actions.length > 0) {
      setIsExpanded(!isExpanded);
      logger.debug('FAB expanded:', { expanded: !isExpanded });
    } else if (onClick) {
      onClick();
      logger.debug('FAB clicked');
    }
  }, [disabled, actions.length, isExpanded, onClick, utils]);

  // Handle action click
  const handleActionClick = useCallback((action: FABAction, index: number) => {
    if (action.disabled) return;

    utils.hapticFeedback('light');
    setIsExpanded(false);
    
    if (action.onClick) {
      action.onClick(action, index);
    }
    
    logger.debug('FAB action clicked:', { label: action.label });
  }, [utils]);

  // Auto-collapse after timeout
  useEffect(() => {
    if (isExpanded) {
      timeoutRef.current = setTimeout(() => {
        setIsExpanded(false);
      }, 5000); // Auto-collapse after 5 seconds
      
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
    return undefined;
  }, [isExpanded]);

  // Get position classes
  const getPositionClasses = (): string => {
    switch (position) {
      case 'top-left':
        return 'top-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  // Get size classes
  const getSizeClasses = (): string => {
    switch (size) {
      case 'small':
        return 'w-12 h-12 text-lg';
      case 'medium':
        return 'w-14 h-14 text-xl';
      case 'large':
      default:
        return 'w-16 h-16 text-2xl';
    }
  };

  // Get color classes
  const getColorClasses = (): string => {
    const colors: Record<FABColor, string> = {
      blue: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30',
      green: 'bg-green-500 hover:bg-green-600 shadow-green-500/30',
      red: 'bg-red-500 hover:bg-red-600 shadow-red-500/30',
      purple: 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/30',
      orange: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30',
      pink: 'bg-pink-500 hover:bg-pink-600 shadow-pink-500/30',
      gray: 'bg-gray-500 hover:bg-gray-600 shadow-gray-500/30'
    };
    
    return colors[color] || colors.blue;
  };

  // Get expand direction style
  const getExpandDirection = (): string => {
    switch (expandDirection) {
      case 'up':
        return 'flex-col-reverse';
      case 'down':
        return 'flex-col';
      case 'left':
        return 'flex-row-reverse';
      case 'right':
        return 'flex-row';
      default:
        return 'flex-col-reverse';
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={fabRef}
      className={`fab-container ${getPositionClasses()} ${className}`}
    >
      {/* Action Items */}
      {actions.length > 0 && isExpanded && (
        <div className={`fab-actions ${getExpandDirection()}`}>
          {actions.map((action, index) => (
            <div
              key={index}
              className="fab-action-item"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              {/* Action Label */}
              {action.label && (
                <div className="fab-action-label">
                  {action.label}
                </div>
              )}
              
              {/* Action Button */}
              <button
                onClick={() => handleActionClick(action, index)}
                disabled={action.disabled}
                className={`fab-action-button ${action.disabled ? 'disabled' : ''}`}
                style={{
                  backgroundColor: action.color || '#6b7280',
                  transform: isExpanded ? 'scale(1)' : 'scale(0)'
                }}
                aria-label={action.label || `Action ${index + 1}`}
              >
                <span className="action-icon">{action.icon}</span>
                
                {/* Action Badge */}
                {action.badge && (
                  <span className="action-badge">
                    {action.badge}
                  </span>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={handleMainClick}
        disabled={disabled}
        className={`fab-main ${getSizeClasses()} ${getColorClasses()} ${
          disabled ? 'disabled' : ''
        } ${isExpanded ? 'expanded' : ''} ${pulse ? 'pulse' : ''}`}
        aria-label={label || 'Floating action button'}
        aria-expanded={actions.length > 0 ? isExpanded : undefined}
      >
        {/* Main Icon */}
        <span 
          className={`fab-icon ${isExpanded ? 'rotated' : ''}`}
          style={{
            transform: isExpanded && actions.length > 0 ? 'rotate(45deg)' : 'rotate(0deg)'
          }}
        >
          {icon}
        </span>
        
        {/* Badge */}
        {badge && !isExpanded && (
          <span className="fab-badge">
            {badge}
          </span>
        )}
        
        {/* Ripple Effect */}
        <span className="ripple"></span>
      </button>

      <style jsx>{`
        .fab-container {
          position: fixed;
          z-index: 1000;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .fab-main {
          position: relative;
          border: none;
          border-radius: 50%;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          user-select: none;
          touch-action: manipulation;
          overflow: hidden;
        }

        .fab-main:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .fab-main:active {
          transform: translateY(0) scale(0.95);
        }

        .fab-main.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .fab-main.expanded {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
        }

        .fab-main.pulse {
          animation: fab-pulse 2s infinite;
        }

        .fab-icon {
          transition: transform 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fab-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: badge-bounce 0.5s ease;
        }

        .fab-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .fab-action-item {
          display: flex;
          align-items: center;
          gap: 8px;
          animation: action-slide-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transform: scale(0.8);
        }

        .fab-action-label {
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          backdrop-filter: blur(10px);
          animation: label-fade-in 0.3s ease forwards;
        }

        .fab-action-button {
          width: 48px;
          height: 48px;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
          position: relative;
          overflow: hidden;
        }

        .fab-action-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
        }

        .fab-action-button:active {
          transform: scale(0.95);
        }

        .fab-action-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .action-icon {
          font-size: 18px;
        }

        .action-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          font-size: 8px;
          font-weight: 600;
          padding: 1px 4px;
          border-radius: 6px;
          min-width: 12px;
          height: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: scale(0);
          animation: ripple-effect 0.6s linear;
          pointer-events: none;
        }

        .fab-main:active .ripple {
          animation: ripple-effect 0.6s linear;
        }

        @keyframes fab-pulse {
          0%, 100% {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          50% {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 20px rgba(59, 130, 246, 0);
          }
        }

        @keyframes badge-bounce {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes action-slide-in {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes label-fade-in {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes ripple-effect {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .fab-container.bottom-right {
            bottom: calc(env(safe-area-inset-bottom) + 80px);
            right: 16px;
          }

          .fab-container.bottom-left {
            bottom: calc(env(safe-area-inset-bottom) + 80px);
            left: 16px;
          }

          .fab-action-label {
            display: none;
          }

          .fab-actions.flex-row,
          .fab-actions.flex-row-reverse {
            flex-direction: column-reverse;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .fab-action-label {
            background: rgba(255, 255, 255, 0.9);
            color: #1f2937;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .fab-main,
          .fab-action-button,
          .fab-icon,
          .fab-action-item {
            transition: none !important;
            animation: none !important;
          }

          .fab-main:hover,
          .fab-action-button:hover {
            transform: none !important;
          }

          .fab-main.pulse {
            animation: none !important;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .fab-main,
          .fab-action-button {
            border: 2px solid currentColor;
          }

          .fab-action-label {
            border: 1px solid currentColor;
          }
        }
      `}</style>
    </div>
  );
};

// Pre-configured FAB variants
interface QuickActionFABProps extends Omit<FloatingActionButtonProps, 'actions'> {
  onSearch?: () => void;
  onScan?: () => void;
  onFavorites?: () => void;
  onShare?: () => void;
}

export const QuickActionFAB: React.FC<QuickActionFABProps> = ({ 
  onSearch, 
  onScan, 
  onFavorites, 
  onShare, 
  ...props 
}) => {
  const actions: FABAction[] = [
    {
      icon: '🔍',
      label: 'Search',
      onClick: onSearch as any,
      color: '#3b82f6'
    },
    {
      icon: '📷',
      label: 'Scan Card',
      onClick: onScan as any,
      color: '#10b981'
    },
    {
      icon: '❤️',
      label: 'Favorites',
      onClick: onFavorites as any,
      color: '#ef4444'
    },
    {
      icon: '📤',
      label: 'Share',
      onClick: onShare as any,
      color: '#8b5cf6'
    }
  ].filter(action => action.onClick);

  return (
    <FloatingActionButton
      icon="⚡"
      label="Quick Actions"
      actions={actions}
      color="blue"
      {...props}
    />
  );
};

interface CollectionFABProps extends Omit<FloatingActionButtonProps, 'actions'> {
  onAdd?: () => void;
  onCreate?: () => void;
  onImport?: () => void;
  onExport?: () => void;
}

export const CollectionFAB: React.FC<CollectionFABProps> = ({ 
  onAdd, 
  onCreate, 
  onImport, 
  onExport, 
  ...props 
}) => {
  const actions: FABAction[] = [
    {
      icon: '➕',
      label: 'Add Card',
      onClick: onAdd as any,
      color: '#10b981'
    },
    {
      icon: '📝',
      label: 'Create List',
      onClick: onCreate as any,
      color: '#3b82f6'
    },
    {
      icon: '📥',
      label: 'Import',
      onClick: onImport as any,
      color: '#8b5cf6'
    },
    {
      icon: '📤',
      label: 'Export',
      onClick: onExport as any,
      color: '#f59e0b'
    }
  ].filter(action => action.onClick);

  return (
    <FloatingActionButton
      icon="📚"
      label="Collection Actions"
      actions={actions}
      color="green"
      {...props}
    />
  );
};

export default FloatingActionButton;