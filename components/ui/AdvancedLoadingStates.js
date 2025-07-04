import React, { useState, useEffect } from 'react';

/**
 * Advanced Loading States Component
 * Provides sophisticated loading animations and skeleton screens
 */

// Enhanced Card Skeleton with Pokemon-specific styling
export const PokemonCardSkeleton = ({ count = 1, showPrice = true, variant = 'card' }) => {
  return (
    <div className="pokemon-card-skeleton-container">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`pokemon-card-skeleton ${variant}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Card Image Skeleton */}
          <div className="card-image-skeleton">
            <div className="shimmer-overlay" />
            <div className="pokeball-loader">
              <div className="pokeball">
                <div className="pokeball-top"></div>
                <div className="pokeball-bottom"></div>
                <div className="pokeball-center"></div>
              </div>
            </div>
          </div>
          
          {/* Card Info Skeleton */}
          <div className="card-info-skeleton">
            <div className="title-skeleton shimmer"></div>
            <div className="subtitle-skeleton shimmer"></div>
            
            {showPrice && (
              <div className="price-skeleton">
                <div className="price-line shimmer"></div>
                <div className="price-line short shimmer"></div>
              </div>
            )}
            
            <div className="badges-skeleton">
              <div className="badge-skeleton shimmer"></div>
              <div className="badge-skeleton shimmer"></div>
            </div>
          </div>
        </div>
      ))}
      
      <style jsx>{`
        .pokemon-card-skeleton-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          padding: 1rem;
        }
        
        .pokemon-card-skeleton {
          background: #fff;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          animation: skeleton-fade-in 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .dark .pokemon-card-skeleton {
          background: #1f2937;
        }
        
        .pokemon-card-skeleton.grid {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .card-image-skeleton {
          position: relative;
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dark .card-image-skeleton {
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
        }
        
        .shimmer-overlay {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        
        .dark .shimmer-overlay {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
        }
        
        .pokeball-loader {
          z-index: 1;
        }
        
        .pokeball {
          width: 40px;
          height: 40px;
          position: relative;
          animation: pokeball-spin 2s linear infinite;
        }
        
        .pokeball-top,
        .pokeball-bottom {
          width: 40px;
          height: 20px;
          border-radius: 40px 40px 0 0;
          position: absolute;
        }
        
        .pokeball-top {
          background: #ff0000;
          top: 0;
        }
        
        .pokeball-bottom {
          background: #ffffff;
          bottom: 0;
          border-radius: 0 0 40px 40px;
        }
        
        .pokeball-center {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 12px;
          height: 12px;
          background: #ffffff;
          border: 3px solid #000000;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        
        .card-info-skeleton {
          margin-top: 1rem;
          flex: 1;
        }
        
        .title-skeleton {
          height: 1.5rem;
          background: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 0.5rem;
        }
        
        .subtitle-skeleton {
          height: 1rem;
          background: #e5e7eb;
          border-radius: 4px;
          width: 70%;
          margin-bottom: 1rem;
        }
        
        .dark .title-skeleton,
        .dark .subtitle-skeleton {
          background: #4b5563;
        }
        
        .price-skeleton {
          margin-bottom: 1rem;
        }
        
        .price-line {
          height: 0.875rem;
          background: #e5e7eb;
          border-radius: 4px;
          margin-bottom: 0.25rem;
        }
        
        .price-line.short {
          width: 60%;
        }
        
        .dark .price-line {
          background: #4b5563;
        }
        
        .badges-skeleton {
          display: flex;
          gap: 0.5rem;
        }
        
        .badge-skeleton {
          height: 1.5rem;
          width: 3rem;
          background: #e5e7eb;
          border-radius: 16px;
        }
        
        .dark .badge-skeleton {
          background: #4b5563;
        }
        
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 2s infinite;
        }
        
        .dark .shimmer::after {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.1),
            transparent
          );
        }
        
        @keyframes skeleton-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes pokeball-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 640px) {
          .pokemon-card-skeleton-container {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
            padding: 0.5rem;
          }
          
          .card-image-skeleton {
            height: 150px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .pokemon-card-skeleton,
          .pokeball,
          .shimmer-overlay,
          .shimmer::after {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

// Advanced Search Results Skeleton
export const SearchResultsSkeleton = () => {
  return (
    <div className="search-results-skeleton">
      {/* Search Stats Skeleton */}
      <div className="search-stats-skeleton">
        <div className="stat-item shimmer"></div>
        <div className="stat-item short shimmer"></div>
      </div>
      
      {/* Filter Pills Skeleton */}
      <div className="filter-pills-skeleton">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="filter-pill shimmer"></div>
        ))}
      </div>
      
      {/* Results Grid */}
      <PokemonCardSkeleton count={12} />
      
      <style jsx>{`
        .search-results-skeleton {
          padding: 1rem;
        }
        
        .search-stats-skeleton {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .stat-item {
          height: 1.25rem;
          background: #e5e7eb;
          border-radius: 4px;
          width: 120px;
        }
        
        .stat-item.short {
          width: 80px;
        }
        
        .filter-pills-skeleton {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .filter-pill {
          height: 2rem;
          width: 80px;
          background: #e5e7eb;
          border-radius: 16px;
        }
        
        .dark .stat-item,
        .dark .filter-pill {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
};

// Progressive Loading Component
export const ProgressiveLoader = ({ 
  stages = [], 
  currentStage = 0, 
  showPercentage = true,
  showStageDescription = true 
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    if (currentStage < stages.length) {
      const stageProgress = (currentStage / stages.length) * 100;
      setProgress(stageProgress);
    }
  }, [currentStage, stages.length]);
  
  return (
    <div className="progressive-loader">
      <div className="loader-content">
        <div className="pokeball-spinner">
          <div className="pokeball">
            <div className="pokeball-half top"></div>
            <div className="pokeball-half bottom"></div>
            <div className="pokeball-center"></div>
          </div>
        </div>
        
        {showStageDescription && stages[currentStage] && (
          <div className="stage-description">
            <h3 className="stage-title">{stages[currentStage].title}</h3>
            <p className="stage-subtitle">{stages[currentStage].description}</p>
          </div>
        )}
        
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
        style={{ width: `${progress}%` }}
      ></div>
          </div>
          
          {showPercentage && (
            <div className="progress-percentage">
              {Math.round(progress)}%
            </div>
          )}
        </div>
        
        <div className="stage-indicators">
          {stages.map((stage, index) => (
            <div
              key={index}
              className={`stage-indicator ${
                index <= currentStage ? 'completed' : 'pending'
              }`}
              title={stage.title}
            >
              <div className="indicator-dot"></div>
              <span className="indicator-label">{stage.shortLabel || stage.title}</span>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        .progressive-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          padding: 2rem;
        }
        
        .loader-content {
          text-align: center;
          max-width: 400px;
          width: 100%;
        }
        
        .pokeball-spinner {
          margin-bottom: 2rem;
        }
        
        .pokeball {
          width: 60px;
          height: 60px;
          margin: 0 auto;
          position: relative;
          animation: pokeball-bounce 1.5s ease-in-out infinite;
        }
        
        .pokeball-half {
          width: 60px;
          height: 30px;
          position: absolute;
        }
        
        .pokeball-half.top {
          background: #ff0000;
          border-radius: 60px 60px 0 0;
          top: 0;
        }
        
        .pokeball-half.bottom {
          background: #ffffff;
          border-radius: 0 0 60px 60px;
          bottom: 0;
          border: 2px solid #000;
          border-top: none;
        }
        
        .pokeball-center {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 16px;
          height: 16px;
          background: #ffffff;
          border: 3px solid #000;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: pokeball-center-pulse 1s ease-in-out infinite;
        }
        
        .stage-description {
          margin-bottom: 2rem;
        }
        
        .stage-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .dark .stage-title {
          color: #f9fafb;
        }
        
        .stage-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }
        
        .dark .stage-subtitle {
          color: #9ca3af;
        }
        
        .progress-container {
          margin-bottom: 2rem;
        }
        
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }
        
        .dark .progress-bar {
          background: #374151;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          border-radius: 4px;
          transition: width 0.3s ease;
          animation: progress-shimmer 2s infinite;
        }
        
        .progress-percentage {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }
        
        .dark .progress-percentage {
          color: #f9fafb;
        }
        
        .stage-indicators {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        
        .stage-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        
        .indicator-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #d1d5db;
          transition: all 0.3s ease;
        }
        
        .stage-indicator.completed .indicator-dot {
          background: #10b981;
          transform: scale(1.2);
        }
        
        .indicator-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-align: center;
        }
        
        .dark .indicator-label {
          color: #9ca3af;
        }
        
        .stage-indicator.completed .indicator-label {
          color: #1f2937;
          font-weight: 600;
        }
        
        .dark .stage-indicator.completed .indicator-label {
          color: #f9fafb;
        }
        
        @keyframes pokeball-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pokeball-center-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
        
        @keyframes progress-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @media (max-width: 640px) {
          .progressive-loader {
            padding: 1rem;
            min-height: 250px;
          }
          
          .pokeball {
            width: 50px;
            height: 50px;
          }
          
          .pokeball-half {
            width: 50px;
            height: 25px;
          }
          
          .pokeball-half.top {
            border-radius: 50px 50px 0 0;
          }
          
          .pokeball-half.bottom {
            border-radius: 0 0 50px 50px;
          }
          
          .stage-indicators {
            gap: 0.5rem;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .pokeball,
          .pokeball-center,
          .progress-fill {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

// Smart Loading State Manager
export const useLoadingState = (initialState = 'idle') => {
  const [loadingState, setLoadingState] = useState(initialState);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const startLoading = (stages = []) => {
    setLoadingState('loading');
    setProgress(0);
    setError(null);
    return { stages };
  };
  
  const updateProgress = (currentStage, totalStages) => {
    const newProgress = (currentStage / totalStages) * 100;
    setProgress(newProgress);
  };
  
  const completeLoading = () => {
    setLoadingState('success');
    setProgress(100);
  };
  
  const failLoading = (errorMessage) => {
    setLoadingState('error');
    setError(errorMessage);
  };
  
  const resetLoading = () => {
    setLoadingState('idle');
    setProgress(0);
    setError(null);
  };
  
  return {
    loadingState,
    progress,
    error,
    startLoading,
    updateProgress,
    completeLoading,
    failLoading,
    resetLoading,
    isLoading: loadingState === 'loading',
    isSuccess: loadingState === 'success',
    isError: loadingState === 'error',
    isIdle: loadingState === 'idle'
  };
};

export default {
  PokemonCardSkeleton,
  SearchResultsSkeleton,
  ProgressiveLoader,
  useLoadingState
};