import React, { useRef, useEffect } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Short label for mobile (optional) - if not provided, uses first word of label */
  shortLabel?: string;
  /** Badge count to display (optional) */
  badge?: number;
}

interface TabPillsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  /** Variant style */
  variant?: 'default' | 'amber' | 'stone';
  /** Size of the pills */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className for the container */
  className?: string;
  /** Whether to auto-scroll active tab into view */
  autoScrollActive?: boolean;
  /** Aria label for the tab group */
  ariaLabel?: string;
}

/**
 * TabPills - Reusable horizontal tab navigation component
 *
 * Features:
 * - 44px minimum touch targets for accessibility
 * - Horizontal scroll on mobile with hidden scrollbar
 * - Active state indicator with smooth transition
 * - Icon + label with responsive label hiding
 * - Auto-scrolls active tab into view
 *
 * Usage:
 * ```tsx
 * <TabPills
 *   tabs={[
 *     { id: 'overview', label: 'Market Overview', icon: <FiTrendingUp /> },
 *     { id: 'trending', label: 'Trending Cards', icon: <FiActivity /> },
 *   ]}
 *   activeTab={activeTab}
 *   onChange={setActiveTab}
 * />
 * ```
 */
export const TabPills: React.FC<TabPillsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'amber',
  size = 'md',
  className,
  autoScrollActive = true,
  ariaLabel = 'Tab navigation',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active tab into view on mount and tab change
  useEffect(() => {
    if (autoScrollActive && activeButtonRef.current && containerRef.current) {
      const container = containerRef.current;
      const button = activeButtonRef.current;

      // Calculate scroll position to center the active button
      const containerWidth = container.offsetWidth;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

      container.scrollTo({
        left: Math.max(0, scrollPosition),
        behavior: 'smooth',
      });
    }
  }, [activeTab, autoScrollActive]);

  const getVariantStyles = () => {
    switch (variant) {
      case 'amber':
        return {
          container: 'bg-stone-100 dark:bg-stone-800',
          active: 'bg-amber-600 text-white',
          inactive: 'text-stone-600 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400',
        };
      case 'stone':
        return {
          container: 'bg-stone-100 dark:bg-stone-800',
          active: 'bg-stone-800 dark:bg-stone-600 text-white',
          inactive: 'text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-white',
        };
      default:
        return {
          container: 'bg-stone-100 dark:bg-stone-800',
          active: 'bg-amber-600 text-white',
          inactive: 'text-stone-600 dark:text-stone-300 hover:text-amber-600',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2.5 py-1.5 text-xs min-h-[36px]';
      case 'lg':
        return 'px-5 py-3 text-base min-h-[52px]';
      default:
        return 'px-3 sm:px-4 py-2 text-sm min-h-[44px]';
    }
  };

  const styles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <div
      className={cn(
        'overflow-x-auto scrollbar-hide -mx-4 px-4',
        className
      )}
    >
      <div
        ref={containerRef}
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          'flex gap-1 p-1 rounded-full w-fit min-w-full sm:min-w-0',
          styles.container
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const displayLabel = tab.shortLabel || tab.label.split(' ')[0];

          return (
            <button
              key={tab.id}
              ref={isActive ? activeButtonRef : null}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full font-medium',
                'transition-all duration-150 ease-out',
                'whitespace-nowrap touch-manipulation',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
                sizeStyles,
                isActive ? styles.active : styles.inactive
              )}
            >
              {tab.icon && (
                <span className="w-4 h-4 flex-shrink-0">
                  {tab.icon}
                </span>
              )}
              {/* Full label on sm+ screens, short label on mobile */}
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{displayLabel}</span>

              {/* Optional badge */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={cn(
                    'ml-1 px-1.5 py-0.5 text-xs rounded-full',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                  )}
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * TabPanel - Companion component for TabPills content areas
 *
 * Usage:
 * ```tsx
 * <TabPanel id="overview" activeTab={activeTab}>
 *   <OverviewContent />
 * </TabPanel>
 * ```
 */
interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  id,
  activeTab,
  children,
  className,
}) => {
  if (activeTab !== id) return null;

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      className={className}
    >
      {children}
    </div>
  );
};

export default TabPills;
