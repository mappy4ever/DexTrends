import React, { 
  useState, 
  useEffect, 
  useRef, 
  useCallback,
  Children,
  cloneElement,
  ReactNode,
  ReactElement,
  CSSProperties
} from 'react';
import { HapticFeedback, VisualFeedback } from './MicroInteractionSystem';

/**
 * Progressive Disclosure Components for Complex Interfaces
 * Helps users focus on the most important information first
 */

// Type definitions
interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  icon?: ReactNode;
  badge?: string | number;
  level?: 1 | 2 | 3 | 4;
  variant?: 'default' | 'card' | 'minimal' | 'outlined' | 'filled';
  animation?: 'smooth' | 'none';
  onToggle?: (isExpanded: boolean) => void;
  disabled?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

interface AccordionProps {
  children: ReactNode;
  allowMultiple?: boolean;
  defaultExpandedIndex?: number | number[] | null;
  variant?: 'default' | 'card' | 'minimal' | 'outlined' | 'filled';
  className?: string;
  onSelectionChange?: (indices: number[]) => void;
}

interface Step {
  title: string;
  description?: string;
  content?: ReactNode | ((props: { onComplete: () => void }) => ReactNode);
}

interface StepByStepDisclosureProps {
  steps: Step[];
  currentStep?: number;
  onStepChange?: (stepIndex: number) => void;
  allowSkip?: boolean;
  showProgress?: boolean;
  variant?: 'default';
  className?: string;
}

interface Tab {
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
}

interface TabbedDisclosureProps {
  tabs: Tab[];
  defaultActiveTab?: number;
  onTabChange?: (tabIndex: number) => void;
  variant?: 'default';
  position?: 'top' | 'bottom' | 'left' | 'right';
  lazy?: boolean;
  className?: string;
}

interface DetailsSummaryProps {
  summary: string;
  children: ReactNode;
  icon?: ReactNode;
  defaultOpen?: boolean;
  variant?: 'default' | 'card' | 'minimal';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

interface FormSection {
  content: (props: { onComplete: (data: any) => void; formData: any }) => ReactNode;
}

interface ProgressiveFormProps {
  sections: FormSection[];
  onSubmit?: (formData: any) => void;
  showProgress?: boolean;
  allowSkip?: boolean;
  className?: string;
}

// Collapsible Section Component
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  icon,
  badge,
  level = 1,
  variant = 'default',
  animation = 'smooth',
  onToggle,
  disabled = false,
  className = '',
  headerClassName = '',
  contentClassName = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, isExpanded]);
  
  const handleToggle = useCallback(() => {
    if (disabled) return;
    
    setIsAnimating(true);
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    
    HapticFeedback.light();
    
    if (onToggle) {
      onToggle(newExpanded);
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  }, [isExpanded, disabled, onToggle]);
  
  const getVariantClasses = () => {
    const variants: Record<string, string> = {
      default: 'border border-gray-200 rounded-lg bg-white',
      card: 'border border-gray-200 rounded-lg bg-white shadow-sm',
      minimal: 'border-b border-gray-200 last:border-b-0',
      outlined: 'border-2 border-gray-300 rounded-lg',
      filled: 'bg-gray-50 rounded-lg border border-gray-200'
    };
    return variants[variant] || variants.default;
  };
  
  const getHeaderClasses = () => {
    const base = 'flex items-center justify-between w-full p-4 text-left transition-colors duration-200';
    const interactive = disabled 
      ? 'cursor-not-allowed opacity-50' 
      : 'cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-pokemon-blue focus:ring-inset';
    
    return `${base} ${interactive}`;
  };
  
  const getLevelClasses = () => {
    const levels: Record<number, string> = {
      1: 'text-lg font-semibold',
      2: 'text-base font-medium',
      3: 'text-sm font-medium',
      4: 'text-sm font-normal'
    };
    return levels[level] || levels[1];
  };
  
  const getAnimationClasses = () => {
    if (animation === 'none') return '';
    
    return `transition-all duration-300 ease-out ${
      isExpanded ? 'opacity-100' : 'opacity-0'
    }`;
  };
  
  return (
    <div className={`collapsible-section ${getVariantClasses()} ${className}`}>
      <button
        className={`${getHeaderClasses()} ${headerClassName}`}
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isExpanded}
        aria-controls={`section-content-${title}`}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex-shrink-0 text-gray-500">
              {icon}
            </span>
          )}
          <span className={`text-gray-900 ${getLevelClasses()}`}>
            {title}
          </span>
          {badge && (
            <span className="px-2 py-1 text-xs font-medium bg-pokemon-red text-white rounded-full">
              {badge}
            </span>
          )}
        </div>
        
        <div className={`flex items-center gap-2 ${isAnimating ? 'animate-pulse' : ''}`}>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      
      <div
        id={`section-content-${title}`}
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? '' : 'max-h-0'
        }`}
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : '0'
        }}
      >
        <div className={`${getAnimationClasses()} ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Accordion Component (Multiple Collapsible Sections)
export const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = false,
  defaultExpandedIndex = null,
  variant = 'default',
  className = '',
  onSelectionChange
}) => {
  const [expandedIndices, setExpandedIndices] = useState<number[]>(
    defaultExpandedIndex !== null 
      ? (Array.isArray(defaultExpandedIndex) ? defaultExpandedIndex : [defaultExpandedIndex])
      : []
  );
  
  const handleSectionToggle = useCallback((index: number, isExpanded: boolean) => {
    setExpandedIndices(prev => {
      let newIndices: number[];
      
      if (allowMultiple) {
        if (isExpanded) {
          newIndices = [...prev, index];
        } else {
          newIndices = prev.filter(i => i !== index);
        }
      } else {
        newIndices = isExpanded ? [index] : [];
      }
      
      if (onSelectionChange) {
        onSelectionChange(newIndices);
      }
      
      return newIndices;
    });
  }, [allowMultiple, onSelectionChange]);
  
  return (
    <div className={`accordion ${className}`}>
      {Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === CollapsibleSection) {
          const childProps = child.props as CollapsibleSectionProps;
          return cloneElement(child as ReactElement<CollapsibleSectionProps>, {
            ...childProps,
            defaultExpanded: expandedIndices.includes(index),
            onToggle: (isExpanded: boolean) => {
              handleSectionToggle(index, isExpanded);
              if (childProps.onToggle) {
                childProps.onToggle(isExpanded);
              }
            },
            variant,
            key: index
          });
        }
        return child;
      })}
    </div>
  );
};

// Step-by-Step Disclosure Component
export const StepByStepDisclosure: React.FC<StepByStepDisclosureProps> = ({
  steps,
  currentStep = 0,
  onStepChange,
  allowSkip = false,
  showProgress = true,
  variant = 'default',
  className = ''
}) => {
  const [activeStep, setActiveStep] = useState(currentStep);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const handleStepClick = useCallback((stepIndex: number) => {
    if (!allowSkip && stepIndex > activeStep + 1) return;
    
    setActiveStep(stepIndex);
    HapticFeedback.light();
    
    if (onStepChange) {
      onStepChange(stepIndex);
    }
  }, [activeStep, allowSkip, onStepChange]);
  
  const handleStepComplete = useCallback((stepIndex: number) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    
    if (stepIndex === activeStep && stepIndex < steps.length - 1) {
      setActiveStep(stepIndex + 1);
      HapticFeedback.success();
      
      if (onStepChange) {
        onStepChange(stepIndex + 1);
      }
    }
  }, [activeStep, steps.length, onStepChange]);
  
  const getStepStatus = (stepIndex: number): 'completed' | 'active' | 'pending' => {
    if (completedSteps.has(stepIndex)) return 'completed';
    if (stepIndex === activeStep) return 'active';
    if (stepIndex < activeStep) return 'completed';
    return 'pending';
  };
  
  const getStepClasses = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    const base = 'flex items-center gap-3 p-4 rounded-lg transition-all duration-200';
    
    const statusClasses: Record<string, string> = {
      completed: 'bg-green-50 border border-green-200 text-green-800',
      active: 'bg-pokemon-red bg-opacity-10 border border-pokemon-red text-pokemon-red',
      pending: 'bg-gray-50 border border-gray-200 text-gray-500'
    };
    
    const interactive = (allowSkip || stepIndex <= activeStep + 1) 
      ? 'cursor-pointer hover:shadow-md' 
      : 'cursor-not-allowed opacity-50';
    
    return `${base} ${statusClasses[status]} ${interactive}`;
  };
  
  const getStepIcon = (stepIndex: number) => {
    const status = getStepStatus(stepIndex);
    
    if (status === 'completed') {
      return (
        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    if (status === 'active') {
      return (
        <div className="w-6 h-6 bg-pokemon-red text-white rounded-full flex items-center justify-center">
          <span className="text-sm font-bold">{stepIndex + 1}</span>
        </div>
      );
    }
    
    return (
      <div className="w-6 h-6 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">
        <span className="text-sm">{stepIndex + 1}</span>
      </div>
    );
  };
  
  return (
    <div className={`step-by-step-disclosure ${className}`}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((completedSteps.size + (activeStep > 0 ? 1 : 0)) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pokemon-red h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((completedSteps.size + (activeStep > 0 ? 1 : 0)) / steps.length) * 100}%`
              }}
            />
          </div>
        </div>
      )}
      
      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index}>
            <div
              className={getStepClasses(index)}
              onClick={() => handleStepClick(index)}
              role="button"
              tabIndex={0}
              aria-current={index === activeStep ? 'step' : undefined}
            >
              {getStepIcon(index)}
              <div className="flex-1">
                <h3 className="font-medium">{step.title}</h3>
                {step.description && (
                  <p className="text-sm opacity-75 mt-1">{step.description}</p>
                )}
              </div>
            </div>
            
            {/* Step Content */}
            {index === activeStep && step.content && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 animate-in slide-in-from-top-2 fade-in">
                {typeof step.content === 'function' 
                  ? step.content({ onComplete: () => handleStepComplete(index) })
                  : step.content
                }
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Tabbed Disclosure Component
export const TabbedDisclosure: React.FC<TabbedDisclosureProps> = ({
  tabs,
  defaultActiveTab = 0,
  onTabChange,
  variant = 'default',
  position = 'top',
  lazy = true,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const [loadedTabs, setLoadedTabs] = useState<Set<number>>(new Set([defaultActiveTab]));
  
  const handleTabClick = useCallback((tabIndex: number) => {
    setActiveTab(tabIndex);
    setLoadedTabs(prev => new Set([...prev, tabIndex]));
    
    HapticFeedback.light();
    
    if (onTabChange) {
      onTabChange(tabIndex);
    }
  }, [onTabChange]);
  
  const getTabClasses = (tabIndex: number) => {
    const isActive = tabIndex === activeTab;
    const base = 'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pokemon-blue';
    
    return `${base} ${
      isActive
        ? 'bg-pokemon-red text-white shadow-sm'
        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
    }`;
  };
  
  const getContentClasses = () => {
    return 'tab-content animate-in fade-in slide-in-from-bottom-1 duration-200';
  };
  
  const tabNavigation = (
    <div className={`flex gap-1 ${position === 'top' ? 'mb-4' : 'mt-4'} ${
      position === 'left' || position === 'right' ? 'flex-col' : ''
    }`}>
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={getTabClasses(index)}
          onClick={() => handleTabClick(index)}
          aria-selected={index === activeTab}
          role="tab"
        >
          <div className="flex items-center gap-2">
            {tab.icon && <span>{tab.icon}</span>}
            <span>{tab.title}</span>
            {tab.badge && (
              <span className="px-2 py-0.5 text-xs bg-white bg-opacity-20 rounded-full">
                {tab.badge}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
  
  const tabContent = (
    <div className={getContentClasses()} role="tabpanel">
      {tabs[activeTab] && (lazy ? loadedTabs.has(activeTab) : true) && tabs[activeTab].content}
    </div>
  );
  
  if (position === 'left') {
    return (
      <div className={`flex gap-6 ${className}`}>
        <div className="flex-shrink-0">{tabNavigation}</div>
        <div className="flex-1">{tabContent}</div>
      </div>
    );
  }
  
  if (position === 'right') {
    return (
      <div className={`flex gap-6 ${className}`}>
        <div className="flex-1">{tabContent}</div>
        <div className="flex-shrink-0">{tabNavigation}</div>
      </div>
    );
  }
  
  if (position === 'bottom') {
    return (
      <div className={className}>
        {tabContent}
        {tabNavigation}
      </div>
    );
  }
  
  // Default: top
  return (
    <div className={className}>
      {tabNavigation}
      {tabContent}
    </div>
  );
};

// Details/Summary Component with Enhanced Styling
export const DetailsSummary: React.FC<DetailsSummaryProps> = ({
  summary,
  children,
  icon,
  defaultOpen = false,
  variant = 'default',
  size = 'medium',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
    HapticFeedback.light();
  }, [isOpen]);
  
  const getVariantClasses = () => {
    const variants: Record<string, string> = {
      default: 'border border-gray-200 rounded-lg',
      card: 'border border-gray-200 rounded-lg shadow-sm',
      minimal: 'border-b border-gray-200 last:border-b-0'
    };
    return variants[variant] || variants.default;
  };
  
  const getSizeClasses = () => {
    const sizes: Record<string, string> = {
      small: 'text-sm',
      medium: 'text-base',
      large: 'text-lg'
    };
    return sizes[size] || sizes.medium;
  };
  
  return (
    <details
      className={`details-summary ${getVariantClasses()} ${className}`}
      open={isOpen}
      onToggle={handleToggle}
    >
      <summary className={`
        flex items-center justify-between p-4 cursor-pointer
        hover:bg-gray-50 transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-pokemon-blue focus:ring-inset
        ${getSizeClasses()}
      `}>
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="font-medium text-gray-900">{summary}</span>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <div className="p-4 pt-0 animate-in slide-in-from-top-1 fade-in duration-200">
        {children}
      </div>
    </details>
  );
};

// Progressive Form Component
export const ProgressiveForm: React.FC<ProgressiveFormProps> = ({
  sections,
  onSubmit,
  showProgress = true,
  allowSkip = false,
  className = ''
}) => {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<any>({});
  
  const handleSectionComplete = useCallback((sectionIndex: number, data: any) => {
    setCompletedSections(prev => new Set([...prev, sectionIndex]));
    setFormData((prev: any) => ({ ...prev, ...data }));
    
    if (sectionIndex < sections.length - 1) {
      setCurrentSection(sectionIndex + 1);
    }
  }, [sections.length]);
  
  const handleSubmit = useCallback(() => {
    if (onSubmit) {
      onSubmit(formData);
    }
  }, [formData, onSubmit]);
  
  const canProceed = completedSections.has(currentSection) || allowSkip;
  
  return (
    <div className={`progressive-form ${className}`}>
      {showProgress && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Section {currentSection + 1} of {sections.length}</span>
            <span>{Math.round((completedSections.size / sections.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pokemon-red h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedSections.size / sections.length) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      <div className="form-section">
        {sections[currentSection] && (
          <div className="animate-in slide-in-from-right-2 fade-in duration-300">
            {sections[currentSection].content({
              onComplete: (data: any) => handleSectionComplete(currentSection, data),
              formData
            })}
          </div>
        )}
      </div>
      
      <div className="flex justify-between mt-6">
        <button
          className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          disabled={currentSection === 0}
          onClick={() => setCurrentSection(currentSection - 1)}
        >
          Previous
        </button>
        
        {currentSection === sections.length - 1 ? (
          <button
            className="px-6 py-2 bg-pokemon-red text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            disabled={!canProceed}
            onClick={handleSubmit}
          >
            Submit
          </button>
        ) : (
          <button
            className="px-6 py-2 bg-pokemon-red text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
            disabled={!canProceed}
            onClick={() => setCurrentSection(currentSection + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default {
  CollapsibleSection,
  Accordion,
  StepByStepDisclosure,
  TabbedDisclosure,
  DetailsSummary,
  ProgressiveForm
};