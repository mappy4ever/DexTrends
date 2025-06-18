// components/ui/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ 
  size = 'lg', 
  text = 'Loading data...', 
  showText = true,
  className = '',
  inline = false 
}) => {
  const sizeMap = {
    sm: { width: '24px', height: '24px', border: '3px' },
    md: { width: '40px', height: '40px', border: '4px' },
    lg: { width: '56px', height: '56px', border: '6px' },
    xl: { width: '72px', height: '72px', border: '8px' }
  };

  const containerClass = inline 
    ? `flex items-center justify-center gap-3 py-4 ${className}`
    : `flex flex-col items-center justify-center h-64 text-foreground-muted ${className}`;

  return (
    <div className={containerClass}>
      <span 
        className="loader-fancy-glow" 
        aria-label="Loading"
        style={{
          width: sizeMap[size].width,
          height: sizeMap[size].height,
          border: `${sizeMap[size].border} solid #e5e7eb`,
          borderTop: `${sizeMap[size].border} solid #fbbf24`
        }}
      ></span>
      {showText && (
        <div className={`${inline ? '' : 'mt-4'} ${size === 'sm' ? 'text-sm' : 'text-lg'} font-semibold text-gray-600 dark:text-gray-400`}>
          {text}
        </div>
      )}
      <style jsx>{`
        .loader-fancy-glow {
          display: inline-block;
          border-radius: 50%;
          animation: spin-fancy 1s linear infinite;
          box-shadow: 0 0 16px 2px #fbbf2455;
        }
        @keyframes spin-fancy {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Inline spinner for infinite scroll
export const InlineLoadingSpinner = ({ 
  text = 'Loading more...',
  className = ''
}) => (
  <LoadingSpinner 
    size="md" 
    text={text} 
    inline={true} 
    className={className}
  />
);

export default LoadingSpinner;