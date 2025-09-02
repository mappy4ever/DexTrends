import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/utils/cn';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  label?: string;
  animated?: boolean;
  indeterminate?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
  backgroundColor = 'rgba(209, 213, 219, 0.3)',
  showValue = true,
  label,
  animated = true,
  indeterminate = false,
  className
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Spring animation for smooth progress updates
  const springValue = useSpring(value, {
    stiffness: 100,
    damping: 20
  });
  
  const strokeDashoffset = useTransform(
    springValue,
    [0, 100],
    [circumference, 0]
  );

  return (
    <div className={cn('circular-progress', className)}>
      <div className="progress-wrapper" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="progress-svg"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          {indeterminate ? (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
              strokeLinecap="round"
              style={{
                transformOrigin: 'center',
                transform: 'rotate(-90deg)'
              }}
              animate={{
                rotate: 360
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ) : (
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={animated ? strokeDashoffset : circumference - (value / 100) * circumference}
              strokeLinecap="round"
              style={{
                transformOrigin: 'center',
                transform: 'rotate(-90deg)',
                transition: animated ? undefined : 'stroke-dashoffset 0.3s ease'
              }}
              initial={animated ? { strokeDashoffset: circumference } : undefined}
              animate={animated ? { strokeDashoffset: circumference - (value / 100) * circumference } : undefined}
              transition={animated ? { duration: 1, ease: "easeOut" } : undefined}
            />
          )}
          
          {/* Gradient definition for fancy effect */}
          <defs>
            <linearGradient id={`progress-gradient-${value}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center content */}
        <div className="progress-content">
          {showValue && !indeterminate && (
            <motion.div
              className="progress-value"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.span
                className="value-number"
                key={Math.floor(value)}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {Math.round(value)}
              </motion.span>
              <span className="value-percent">%</span>
            </motion.div>
          )}
          
          {label && (
            <motion.div
              className="progress-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {label}
            </motion.div>
          )}
          
          {indeterminate && (
            <motion.div
              className="indeterminate-icon"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="spinner-dot" />
              <div className="spinner-dot" />
              <div className="spinner-dot" />
            </motion.div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .circular-progress {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
        }
        
        .progress-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .progress-svg {
          position: absolute;
          top: 0;
          left: 0;
          transform: rotateY(180deg);
        }
        
        .progress-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        
        .progress-value {
          display: flex;
          align-items: baseline;
          gap: 2px;
        }
        
        .value-number {
          font-size: ${size / 4}px;
          font-weight: 700;
          color: #1f2937;
          line-height: 1;
        }
        
        .value-percent {
          font-size: ${size / 8}px;
          font-weight: 500;
          color: #6b7280;
        }
        
        .progress-label {
          font-size: ${size / 10}px;
          color: #6b7280;
          text-align: center;
          max-width: ${size * 0.8}px;
        }
        
        .indeterminate-icon {
          display: flex;
          gap: 4px;
        }
        
        .spinner-dot {
          width: 6px;
          height: 6px;
          background: ${color};
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .spinner-dot:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .spinner-dot:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        /* Dark mode */
        @media (prefers-color-scheme: dark) {
          .value-number {
            color: #f3f4f6;
          }
          
          .value-percent,
          .progress-label {
            color: #9ca3af;
          }
        }
      `}</style>
    </div>
  );
};