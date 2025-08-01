import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Step {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  status?: 'pending' | 'active' | 'completed' | 'error';
}

interface StepProgressProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  allowClickNavigation?: boolean;
  onStepClick?: (stepIndex: number) => void;
  variant?: 'default' | 'minimal' | 'detailed';
  className?: string;
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  currentStep,
  orientation = 'horizontal',
  showLabels = true,
  allowClickNavigation = false,
  onStepClick,
  variant = 'default',
  className
}) => {
  const getStepStatus = (index: number): Step['status'] => {
    if (steps[index].status) return steps[index].status;
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  const handleStepClick = (index: number) => {
    if (allowClickNavigation && onStepClick) {
      onStepClick(index);
    }
  };

  return (
    <div className={cn(
      'step-progress',
      orientation,
      variant,
      className
    )}>
      <div className="steps-container">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = allowClickNavigation && status !== 'active';
          
          return (
            <motion.div
              key={step.id}
              className={cn('step-wrapper', status)}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Connector line */}
              {index > 0 && (
                <div className="connector-wrapper">
                  <div className="connector-background" />
                  <motion.div
                    className="connector-progress"
                    initial={{ scaleX: 0 }}
                    animate={{
                      scaleX: index <= currentStep ? 1 : 0
                    }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    style={{
                      transformOrigin: orientation === 'horizontal' ? 'left' : 'top'
                    }}
                  />
                </div>
              )}
              
              {/* Step indicator */}
              <motion.button
                className={cn('step-indicator', status, isClickable && 'clickable')}
                onClick={() => handleStepClick(index)}
                disabled={!isClickable}
                whileHover={isClickable ? { scale: 1.1 } : {}}
                whileTap={isClickable ? { scale: 0.95 } : {}}
              >
                <AnimatePresence mode="wait">
                  {status === 'completed' ? (
                    <motion.svg
                      key="check"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="white"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </motion.svg>
                  ) : status === 'error' ? (
                    <motion.svg
                      key="error"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </motion.svg>
                  ) : step.icon ? (
                    <motion.div
                      key="icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {step.icon}
                    </motion.div>
                  ) : (
                    <motion.span
                      key="number"
                      className="step-number"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      {index + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {/* Active pulse effect */}
                {status === 'active' && (
                  <motion.div
                    className="active-pulse"
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
              </motion.button>
              
              {/* Step content */}
              {showLabels && (
                <motion.div
                  className="step-content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <div className="step-label">{step.label}</div>
                  {variant === 'detailed' && step.description && (
                    <div className="step-description">{step.description}</div>
                  )}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* Progress summary */}
      {variant === 'detailed' && (
        <motion.div
          className="progress-summary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="summary-text">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="summary-progress">
            <motion.div
              className="summary-bar"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
      
      <style jsx>{`
        .step-progress {
          width: 100%;
        }
        
        .steps-container {
          display: flex;
          position: relative;
        }
        
        .step-progress.horizontal .steps-container {
          flex-direction: row;
          align-items: flex-start;
        }
        
        .step-progress.vertical .steps-container {
          flex-direction: column;
        }
        
        .step-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
        }
        
        .step-progress.horizontal .step-wrapper {
          flex-direction: column;
          text-align: center;
        }
        
        .step-progress.vertical .step-wrapper {
          flex-direction: row;
          margin-bottom: 32px;
        }
        
        .step-progress.vertical .step-wrapper:last-child {
          margin-bottom: 0;
        }
        
        .connector-wrapper {
          position: absolute;
          overflow: hidden;
        }
        
        .step-progress.horizontal .connector-wrapper {
          left: -50%;
          right: 50%;
          top: 20px;
          height: 2px;
        }
        
        .step-progress.vertical .connector-wrapper {
          left: 20px;
          top: -16px;
          bottom: 50%;
          width: 2px;
        }
        
        .connector-background {
          position: absolute;
          inset: 0;
          background: rgba(209, 213, 219, 0.5);
        }
        
        .connector-progress {
          position: absolute;
          inset: 0;
          background: #3b82f6;
        }
        
        .step-indicator {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          transition: all 0.3s ease;
          z-index: 1;
          cursor: default;
        }
        
        .step-indicator.clickable {
          cursor: pointer;
        }
        
        .step-indicator.pending {
          border-color: #d1d5db;
          color: #9ca3af;
          background: rgba(255, 255, 255, 0.8);
        }
        
        .step-indicator.active {
          border-color: #3b82f6;
          color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        
        .step-indicator.completed {
          border-color: #3b82f6;
          background: #3b82f6;
          color: white;
        }
        
        .step-indicator.error {
          border-color: #ef4444;
          background: #ef4444;
          color: white;
        }
        
        .step-number {
          font-size: 14px;
          font-weight: 600;
        }
        
        .active-pulse {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: #3b82f6;
          z-index: -1;
        }
        
        .step-content {
          margin-top: 12px;
        }
        
        .step-progress.vertical .step-content {
          margin-top: 0;
          margin-left: 16px;
          flex: 1;
        }
        
        .step-label {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          line-height: 1.4;
        }
        
        .step-wrapper.pending .step-label {
          color: #9ca3af;
        }
        
        .step-wrapper.active .step-label {
          color: #3b82f6;
          font-weight: 600;
        }
        
        .step-description {
          margin-top: 4px;
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
        }
        
        .progress-summary {
          margin-top: 24px;
          padding: 16px;
          background: rgba(243, 244, 246, 0.5);
          border-radius: 8px;
        }
        
        .summary-text {
          display: block;
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        
        .summary-progress {
          height: 4px;
          background: rgba(209, 213, 219, 0.5);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .summary-bar {
          height: 100%;
          background: #3b82f6;
          border-radius: 2px;
        }
        
        /* Minimal variant */
        .step-progress.minimal .step-indicator {
          width: 24px;
          height: 24px;
          font-size: 12px;
        }
        
        .step-progress.minimal .step-label {
          font-size: 12px;
        }
        
        .step-progress.minimal.horizontal .connector-wrapper {
          top: 12px;
        }
        
        .step-progress.minimal.vertical .connector-wrapper {
          left: 12px;
        }
        
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .step-indicator {
            background: #1f2937;
          }
          
          .step-indicator.pending {
            border-color: #4b5563;
            background: rgba(31, 41, 55, 0.8);
          }
          
          .step-indicator.active {
            background: #1f2937;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
          }
          
          .step-label {
            color: #f3f4f6;
          }
          
          .step-wrapper.pending .step-label {
            color: #6b7280;
          }
          
          .step-description {
            color: #9ca3af;
          }
          
          .progress-summary {
            background: rgba(55, 65, 81, 0.5);
          }
          
          .summary-text {
            color: #9ca3af;
          }
          
          .connector-background,
          .summary-progress {
            background: rgba(75, 85, 99, 0.5);
          }
        }
        
        /* Responsive */
        @media (max-width: 640px) {
          .step-progress.horizontal .step-label {
            font-size: 12px;
          }
          
          .step-progress.horizontal .step-description {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};