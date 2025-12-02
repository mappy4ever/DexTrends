import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { RADIUS, TRANSITION, ANIMATION_DURATION } from './design-system/glass-constants';
import { motion, AnimatePresence } from 'framer-motion';

// ===========================================
// TYPES
// ===========================================

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsContextValue {
  activeTab: string;
  setActiveTab: (id: string) => void;
}

export interface TabsProps {
  /** Array of tab configurations */
  tabs: Tab[];
  /** Currently active tab ID */
  activeTab?: string;
  /** Default active tab (uncontrolled) */
  defaultTab?: string;
  /** Callback when tab changes */
  onChange?: (tabId: string) => void;
  /** Visual variant */
  variant?: 'pill' | 'underline' | 'solid' | 'ghost';
  /** Size of tabs */
  size?: 'sm' | 'md' | 'lg';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Alignment */
  align?: 'start' | 'center' | 'end';
  /** Additional className for container */
  className?: string;
  /** Children (tab panels) */
  children?: ReactNode;
}

export interface TabPanelProps {
  /** Tab ID this panel corresponds to */
  tabId: string;
  /** Panel content */
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Disable animation */
  noAnimation?: boolean;
}

export interface TabListProps {
  /** Tab configurations */
  tabs: Tab[];
  /** Visual variant */
  variant?: 'pill' | 'underline' | 'solid' | 'ghost';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Alignment */
  align?: 'start' | 'center' | 'end';
  /** Additional className */
  className?: string;
}

// ===========================================
// CONTEXT
// ===========================================

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tab components must be used within a Tabs provider');
  }
  return context;
}

// ===========================================
// TAB LIST COMPONENT
// ===========================================

export function TabList({
  tabs,
  variant = 'pill',
  size = 'md',
  fullWidth = false,
  align = 'center',
  className,
}: TabListProps) {
  const { activeTab, setActiveTab } = useTabsContext();

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2',
  };

  // Container styles per variant
  const containerStyles = {
    pill: 'bg-stone-100 dark:bg-stone-800 p-1 rounded-full',
    underline: 'border-b border-stone-200 dark:border-stone-700',
    solid: 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl p-1',
    ghost: 'gap-1',
  };

  // Active tab styles per variant
  const activeStyles = {
    pill: 'bg-amber-600 text-white shadow-sm',
    underline: 'text-amber-600 dark:text-amber-400 border-b-2 border-amber-600 dark:border-amber-400 -mb-px',
    solid: 'bg-amber-600 text-white shadow-sm',
    ghost: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  };

  // Inactive tab styles per variant
  const inactiveStyles = {
    pill: 'text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-200',
    underline: 'text-stone-500 dark:text-stone-300 hover:text-stone-700 dark:hover:text-stone-200 border-b-2 border-transparent -mb-px',
    solid: 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800',
    ghost: 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800',
  };

  // Tab border radius per variant
  const tabRadius = {
    pill: 'rounded-full',
    underline: 'rounded-none',
    solid: 'rounded-lg',
    ghost: 'rounded-lg',
  };

  // Alignment styles
  const alignStyles = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
  };

  return (
    <div
      role="tablist"
      className={cn(
        'flex',
        alignStyles[align],
        fullWidth ? 'w-full' : 'inline-flex',
        containerStyles[variant],
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = tab.disabled;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            disabled={isDisabled}
            onClick={() => !isDisabled && setActiveTab(tab.id)}
            className={cn(
              'relative inline-flex items-center justify-center font-medium',
              sizeStyles[size],
              tabRadius[variant],
              TRANSITION.fast,
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-1',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              fullWidth && 'flex-1',
              isActive ? activeStyles[variant] : inactiveStyles[variant]
            )}
          >
            {/* Icon */}
            {tab.icon && (
              <span className={cn('flex-shrink-0', size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4')}>
                {tab.icon}
              </span>
            )}

            {/* Label */}
            <span>{tab.label}</span>

            {/* Badge */}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                )}
              >
                {tab.badge}
              </span>
            )}

            {/* Pill variant: animated indicator */}
            {variant === 'pill' && isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-amber-600 rounded-full -z-10"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ===========================================
// TAB PANEL COMPONENT
// ===========================================

export function TabPanel({
  tabId,
  children,
  className,
  noAnimation = false,
}: TabPanelProps) {
  const { activeTab } = useTabsContext();
  const isActive = activeTab === tabId;

  if (!isActive) return null;

  const content = (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      className={className}
    >
      {children}
    </div>
  );

  if (noAnimation) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: ANIMATION_DURATION.fast / 1000 }}
    >
      {content}
    </motion.div>
  );
}

// ===========================================
// TAB PANELS CONTAINER (with AnimatePresence)
// ===========================================

export function TabPanels({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { activeTab } = useTabsContext();

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {React.Children.map(children, (child) => {
          if (React.isValidElement<TabPanelProps>(child) && child.props.tabId === activeTab) {
            return React.cloneElement(child, { key: activeTab });
          }
          return null;
        })}
      </AnimatePresence>
    </div>
  );
}

// ===========================================
// MAIN TABS COMPONENT
// ===========================================

export function Tabs({
  tabs,
  activeTab: controlledActiveTab,
  defaultTab,
  onChange,
  variant = 'pill',
  size = 'md',
  fullWidth = false,
  align = 'center',
  className,
  children,
}: TabsProps) {
  // Use controlled or uncontrolled state
  const [uncontrolledActiveTab, setUncontrolledActiveTab] = useState(
    defaultTab || tabs[0]?.id || ''
  );

  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : uncontrolledActiveTab;

  const setActiveTab = useCallback(
    (id: string) => {
      if (!isControlled) {
        setUncontrolledActiveTab(id);
      }
      onChange?.(id);
    },
    [isControlled, onChange]
  );

  const contextValue: TabsContextValue = {
    activeTab,
    setActiveTab,
  };

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>
        <TabList
          tabs={tabs}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          align={align}
        />
        {children && <div className="mt-4">{children}</div>}
      </div>
    </TabsContext.Provider>
  );
}

// ===========================================
// SIMPLE TABS (All-in-one convenience component)
// ===========================================

export interface SimpleTabsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    content: ReactNode;
    disabled?: boolean;
    badge?: string | number;
  }>;
  defaultTab?: string;
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'pill' | 'underline' | 'solid' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  align?: 'start' | 'center' | 'end';
  className?: string;
  panelClassName?: string;
}

export function SimpleTabs({
  tabs,
  defaultTab,
  activeTab,
  onChange,
  variant = 'pill',
  size = 'md',
  fullWidth = false,
  align = 'center',
  className,
  panelClassName,
}: SimpleTabsProps) {
  const tabConfigs: Tab[] = tabs.map(({ id, label, icon, disabled, badge }) => ({
    id,
    label,
    icon,
    disabled,
    badge,
  }));

  return (
    <Tabs
      tabs={tabConfigs}
      defaultTab={defaultTab}
      activeTab={activeTab}
      onChange={onChange}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      align={align}
      className={className}
    >
      <TabPanels className={panelClassName}>
        {tabs.map((tab) => (
          <TabPanel key={tab.id} tabId={tab.id}>
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}

// ===========================================
// EXPORTS
// ===========================================

export default Tabs;
