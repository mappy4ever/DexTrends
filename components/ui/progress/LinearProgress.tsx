import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/utils/cn';

interface LinearProgressProps {
  value: number; // 0-100
  height?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  label?: string;
  variant?: 'default' | 'striped' | 'gradient';
  animated?: boolean;
  indeterminate?: boolean;
  segments?: number; // For segmented progress
  className?: string;
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
  value,
  height = 8,
  color = '#3b82f6',
  backgroundColor = 'rgba(209, 213, 219, 0.3)',
  showValue = false,
  label,
  variant = 'default',
  animated = true,
  indeterminate = false,
  segments,
  className
}) => {
  // Spring animation for smooth progress updates
  const springValue = useSpring(value, {
    stiffness: 100,
    damping: 20
  });
  
  const width = useTransform(springValue, [0, 100], ['0%', '100%']);

  const renderSegments = () => {
    if (!segments) return null;
    
    return Array.from({ length: segments }).map((_, index) => {
      const segmentWidth = 100 / segments;
      const segmentValue = value - (index * segmentWidth);
      const isActive = segmentValue > 0;
      const fillWidth = Math.min(segmentValue, segmentWidth) / segmentWidth * 100;
      
      return (
        <div
          key={index}
          className="segment"
          style={{ width: `${segmentWidth}%` }}
        >
          <motion.div
            className="segment-fill"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: isActive ? `${fillWidth}%` : 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut"
            }}
          />
        </div>
      );
    });
  };

  return (
    <div className={cn('linear-progress', variant, className)}>
      {(label || showValue) && (
        <div className="progress-header">
          {label && <span className="progress-label">{label}</span>}
          {showValue && !indeterminate && (
            <motion.span
              className="progress-value"
              key={Math.floor(value)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {Math.round(value)}%
            </motion.span>
          )}
        </div>
      )}
      
      <div 
        className="progress-track"
        style={{ 
          height,
          backgroundColor 
        }}
      >
        {segments ? (
          <div className="segments-container">
            {renderSegments()}
          </div>
        ) : indeterminate ? (
          <motion.div
            className="indeterminate-bar"
            style={{
              height: '100%',
              background: color
            }}
            animate={{
              x: ['-100%', '200%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ) : (
          <motion.div
            className="progress-bar"
            style={{
              width: animated ? width : `${value}%`,
              height: '100%',
              backgroundColor: variant === 'gradient' ? undefined : color,
              transition: animated ? undefined : 'width 0.3s ease'
            }}
            initial={animated ? { width: 0 } : undefined}
            animate={animated ? { width: `${value}%` } : undefined}
            transition={animated ? { duration: 1, ease: "easeOut" } : undefined}
          >
            {/* Striped pattern */}
            {variant === 'striped' && (
              <motion.div
                className="stripes"
                animate={{
                  backgroundPosition: ['0px 0px', '40px 40px']
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            )}
            
            {/* Animated glow effect */}
            <motion.div
              className="progress-glow"
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Leading edge highlight */}
            <motion.div
              className="progress-edge"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
        
        {/* Milestone markers */}
        {!segments && !indeterminate && (
          <>
            {[25, 50, 75].map(milestone => (
              <motion.div
                key={milestone}
                className="milestone-marker"
                style={{ left: `${milestone}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: value >= milestone ? 1 : 0.3,
                  scale: value >= milestone ? 1 : 0.8
                }}
                transition={{
                  duration: 0.3,
                  delay: value >= milestone ? 0.2 : 0
                }}
              />
            ))}
          </>
        )}
      </div>
      
      {/* Tooltip on hover */}
      {showValue && !indeterminate && (
        <motion.div
          className="progress-tooltip"
          style={{
            left: animated ? width : `${value}%`
          }}
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {Math.round(value)}%
        </motion.div>
      )}
      
      <style jsx>{`
        .linear-progress {
          width: 100%;
          position: relative;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .progress-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        
        .progress-value {
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .progress-track {
          position: relative;
          width: 100%;
          border-radius: 9999px;
          overflow: hidden;
          background-color: ${backgroundColor};
        }
        
        .progress-bar {
          position: relative;
          border-radius: 9999px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .linear-progress.gradient .progress-bar {
          background: linear-gradient(90deg, 
            ${color} 0%, 
            ${color}dd 50%, 
            ${color} 100%
          );
        }
        
        .stripes {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.15) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.15) 75%,
            transparent 75%,
            transparent
          );
          background-size: 40px 40px;
        }
        
        .progress-glow {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.3), 
            transparent
          );
        }
        
        .progress-edge {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255, 255, 255, 0.6);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        .indeterminate-bar {
          position: absolute;
          width: 40%;
          border-radius: 9999px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .segments-container {
          display: flex;
          height: 100%;
          gap: 2px;
        }
        
        .segment {
          position: relative;
          height: 100%;
          background: ${backgroundColor};
          overflow: hidden;
        }
        
        .segment:first-child {
          border-radius: 9999px 0 0 9999px;
        }
        
        .segment:last-child {
          border-radius: 0 9999px 9999px 0;
        }
        
        .segment-fill {
          height: 100%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .milestone-marker {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
          z-index: 1;
        }
        
        .progress-tooltip {
          position: absolute;
          bottom: 100%;
          transform: translateX(-50%);
          margin-bottom: 8px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          font-size: 12px;
          font-weight: 500;
          border-radius: 4px;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
        }
        
        .progress-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: rgba(0, 0, 0, 0.8);
        }
        
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .progress-label {
            color: #d1d5db;
          }
          
          .progress-value {
            color: #f3f4f6;
          }
          
          .milestone-marker {
            background: #1f2937;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
          }
        }
        
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .progress-bar,
          .indeterminate-bar,
          .stripes,
          .progress-glow,
          .progress-edge {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};