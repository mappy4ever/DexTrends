import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import logger from '../../utils/logger';

const PullToRefresh = ({
  children,
  onRefresh,
  refreshThreshold = 80,
  className = '',
  disabled = false,
  refreshText = 'Pull to refresh',
  releaseText = 'Release to refresh',
  refreshingText = 'Refreshing...',
  showLoadingDots = true
}) => {
  const containerRef = useRef(null);
  const { isTouch, utils } = useMobileUtils();
  const [pullState, setPullState] = useState({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    canRefresh: false
  });
  
  const touchState = useRef({
    startY: 0,
    currentY: 0,
    scrollTop: 0,
    isActive: false
  });

  const updatePullState = useCallback((distance, canRefresh = false) => {
    const progress = Math.min((distance / refreshThreshold) * 100, 100);
    
    setPullState(prev => ({
      ...prev,
      pullDistance: distance,
      canRefresh,
      isPulling: distance > 0
    }));
    
    // Provide haptic feedback at milestones
    if (distance >= refreshThreshold && !touchState.current.hapticTriggered) {
      utils.hapticFeedback('medium');
      touchState.current.hapticTriggered = true;
    } else if (distance < refreshThreshold) {
      touchState.current.hapticTriggered = false;
    }
  }, [refreshThreshold, utils]);

  const handleTouchStart = useCallback((e) => {
    if (disabled || !isTouch) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const touch = e.touches[0];
    const scrollTop = container.scrollTop;
    
    // Only allow pull-to-refresh when at the top
    if (scrollTop === 0) {
      touchState.current = {
        startY: touch.clientY,
        currentY: touch.clientY,
        scrollTop,
        isActive: true,
        hapticTriggered: false
      };
    }
  }, [disabled, isTouch]);

  const handleTouchMove = useCallback((e) => {
    if (disabled || !isTouch || !touchState.current.isActive) return;
    
    const touch = e.touches[0];
    const deltaY = touch.clientY - touchState.current.startY;
    
    // Only handle downward pulls when at the top
    if (deltaY > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      
      // Apply resistance curve for natural feel
      const resistance = 0.5;
      const adjustedDistance = deltaY * resistance;
      const canRefresh = adjustedDistance >= refreshThreshold;
      
      updatePullState(adjustedDistance, canRefresh);
      touchState.current.currentY = touch.clientY;
    } else {
      // Reset if scrolling up or not at top
      if (pullState.isPulling) {
        updatePullState(0, false);
      }
      touchState.current.isActive = false;
    }
  }, [disabled, isTouch, refreshThreshold, updatePullState, pullState.isPulling]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || !isTouch || !touchState.current.isActive) return;
    
    touchState.current.isActive = false;
    
    if (pullState.canRefresh && !pullState.isRefreshing) {
      // Trigger refresh
      setPullState(prev => ({
        ...prev,
        isRefreshing: true,
        isPulling: false,
        pullDistance: refreshThreshold
      }));
      
      utils.hapticFeedback('heavy');
      logger.debug('Pull-to-refresh triggered');
      
      try {
        if (onRefresh) {
          await onRefresh();
        }
      } catch (error) {
        logger.error('Refresh failed:', error);
      } finally {
        // Animate back to normal state
        setTimeout(() => {
          setPullState({
            isPulling: false,
            pullDistance: 0,
            isRefreshing: false,
            canRefresh: false
          });
        }, 300);
      }
    } else {
      // Animate back to normal state
      updatePullState(0, false);
    }
  }, [disabled, isTouch, pullState.canRefresh, pullState.isRefreshing, onRefresh, refreshThreshold, utils, updatePullState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isTouch) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, isTouch]);

  const getIndicatorText = () => {
    if (pullState.isRefreshing) return refreshingText;
    if (pullState.canRefresh) return releaseText;
    return refreshText;
  };

  const getIndicatorIcon = () => {
    if (pullState.isRefreshing) return '🔄';
    if (pullState.canRefresh) return '🚀';
    return '⬇️';
  };

  return (
    <div
      ref={containerRef}
      className={`pull-to-refresh-container ${className}`}
      style={{
        position: 'relative',
        height: '100%',
        overflowY: 'auto',
        transform: `translateY(${pullState.isPulling || pullState.isRefreshing ? pullState.pullDistance * 0.5 : 0}px)`,
        transition: pullState.isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Pull-to-refresh indicator */}
      <div 
        className="pull-refresh-indicator">
        style={{
          position: 'absolute',
          top: -80,
          left: 0,
          right: 0,
          height: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
          zIndex: 10,
          opacity: pullState.isPulling || pullState.isRefreshing ? 1 : 0,
          transform: `translateY(${pullState.pullDistance}px) scale(${0.8 + (pullState.pullDistance / refreshThreshold) * 0.2})`,
          transition: pullState.isPulling ? 'none' : 'all 0.3s ease'
        }}
      >
        <div 
          className={`indicator-icon ${pullState.isRefreshing ? 'spinning' : ''}`}
          style={{
            fontSize: '24px',
            marginBottom: '8px',
            transform: pullState.canRefresh && !pullState.isRefreshing ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        >
          {getIndicatorIcon()}
        </div>
        
        <div 
          className="indicator-text">
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#3b82f6',
            textAlign: 'center'
          }}
        >
          {getIndicatorText()}
        </div>
        
        {showLoadingDots && pullState.isRefreshing && (
          <div className="loading-dots" style={{ marginTop: '8px' }}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        {/* Progress indicator */}
        <div 
          className="progress-bar">
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '3px',
            background: 'rgba(59, 130, 246, 0.2)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              height: '100%',
              background: '#3b82f6',
              width: `${(pullState.pullDistance / refreshThreshold) * 100}%`,
              transition: pullState.isPulling ? 'none' : 'width 0.3s ease',
              borderRadius: '2px'
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ minHeight: '100%' }}>
        {children}
      </div>

      <style jsx>{`
        .pull-to-refresh-container {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .loading-dots {
          display: flex;
          gap: 4px;
        }
        
        .loading-dots span {
          width: 6px;
          height: 6px;
          background: #3b82f6;
          border-radius: 50%;
          animation: loading-dot 1.4s ease-in-out infinite both;
        }
        
        .loading-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .loading-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes loading-dot {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .spinning,
          .loading-dots span {
            animation: none !important;
          }
          
          .pull-to-refresh-container {
            transition: none !important;
          }
          
          .pull-refresh-indicator {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PullToRefresh;