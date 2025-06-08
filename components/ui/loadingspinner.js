// components/ui/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-64 text-foreground-muted">
    <span className="loader-fancy-glow" aria-label="Loading"></span>
    <div className="mt-4 text-lg font-semibold">Loading data...</div>
    <style jsx>{`
      .loader-fancy-glow {
        display: inline-block;
        width: 56px;
        height: 56px;
        border: 6px solid #e5e7eb;
        border-top: 6px solid #fbbf24;
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

export default LoadingSpinner;