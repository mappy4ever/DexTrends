import React, { useEffect, useState } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import adaptiveLoading from '../../utils/adaptiveLoading';
import batteryOptimization from '../../utils/batteryOptimization';
import hapticFeedback from '../../utils/hapticFeedback';
import deepLinking from '../../utils/deepLinking';
import mobileAnalytics from '../../utils/mobileAnalytics';
import logger from '../../utils/logger';

// Import components
import PullToRefresh from './PullToRefresh';
import TouchGestures from './TouchGestures';
import VoiceSearch from './VoiceSearch';
import CardScanner from './CardScanner';
import BottomSheet, { useBottomSheet } from './BottomSheet';
import FloatingActionButton, { QuickActionFAB } from './FloatingActionButton';
import PushNotifications from './PushNotifications';
import AppUpdateNotification from '../pwa/AppUpdateNotification';
import InstallPrompt from '../pwa/InstallPrompt';

const MobileIntegration = ({ 
  children, 
  enablePullToRefresh = true,
  enableVoiceSearch = true,
  enableCardScanner = true,
  enableQuickActions = true,
  enablePushNotifications = true,
  onRefresh,
  onVoiceSearch,
  onCardScan,
  onShare
}) => {
  const { isMobile, isStandalone, utils } = useMobileUtils();
  const [mobileFeatures, setMobileFeatures] = useState({
    loading: adaptiveLoading.getCurrentStrategy(),
    battery: batteryOptimization.getOptimizationLevel(),
    connectivity: 'online'
  });
  
  const [notifications, setNotifications] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showVoiceSearch, setShowVoiceSearch] = useState(false);
  
  const scannerSheet = useBottomSheet(false);
  const voiceSheet = useBottomSheet(false);
  const shareSheet = useBottomSheet(false);

  // Initialize mobile features
  useEffect(() => {
    if (!isMobile) return;

    // Initialize haptic feedback
    hapticFeedback.trigger('light');
    
    // Track mobile session
    mobileAnalytics.trackEvent('mobile_session_start', {
      is_standalone: isStandalone,
      loading_strategy: adaptiveLoading.getCurrentStrategy(),
      battery_level: batteryOptimization.getBatteryInfo().percentage
    });

    // Setup deep linking
    const handleDeepLink = (event) => {
      const { detail } = event;
      logger.debug('Deep link received:', detail);
      
      // Handle different deep link types
      switch (detail.type) {
        case 'card':
          // Navigate to card page
          break;
        case 'search':
          if (onVoiceSearch) {
            onVoiceSearch(detail.query, detail.filters);
          }
          break;
        case 'share':
          handleShareReceived(detail.shareData);
          break;
      }
      
      mobileAnalytics.trackEvent('deep_link_handled', {
        link_type: detail.type,
        source: detail.source || 'unknown'
      });
    };

    window.addEventListener('deepLinkReceived', handleDeepLink);
    
    // Setup share target handling
    const handleShareTarget = (event) => {
      const { detail } = event;
      shareSheet.open();
      // Process share data
    };
    
    window.addEventListener('shareTargetReceived', handleShareTarget);

    // Setup adaptive loading updates
    const handleLoadingStrategyChange = (event) => {
      const { detail } = event;
      setMobileFeatures(prev => ({
        ...prev,
        loading: detail.strategy
      }));
      
      showNotification('Performance mode updated based on device conditions', 'info');
    };

    window.addEventListener('adaptiveLoadingStrategyChange', handleLoadingStrategyChange);

    // Setup battery optimization updates
    const handleBatteryOptimization = (event) => {
      const { detail } = event;
      setMobileFeatures(prev => ({
        ...prev,
        battery: detail.level
      }));
      
      if (detail.level !== 'none') {
        showNotification('Battery saver mode activated', 'warning');
      }
    };

    window.addEventListener('batteryOptimizationChange', handleBatteryOptimization);

    // Setup network status
    const handleNetworkStatus = () => {
      const isOnline = navigator.onLine;
      setMobileFeatures(prev => ({
        ...prev,
        connectivity: isOnline ? 'online' : 'offline'
      }));
      
      if (!isOnline) {
        showNotification('You\'re offline. Some features may be limited.', 'warning');
      } else {
        showNotification('You\'re back online!', 'success');
      }
    };

    window.addEventListener('online', handleNetworkStatus);
    window.addEventListener('offline', handleNetworkStatus);

    return () => {
      window.removeEventListener('deepLinkReceived', handleDeepLink);
      window.removeEventListener('shareTargetReceived', handleShareTarget);
      window.removeEventListener('adaptiveLoadingStrategyChange', handleLoadingStrategyChange);
      window.removeEventListener('batteryOptimizationChange', handleBatteryOptimization);
      window.removeEventListener('online', handleNetworkStatus);
      window.removeEventListener('offline', handleNetworkStatus);
    };
  }, [isMobile, isStandalone, onVoiceSearch]);

  // Handle pull to refresh
  const handlePullToRefresh = async () => {
    try {
      hapticFeedback.pullRefresh();
      mobileAnalytics.trackGestureUsage('pull_to_refresh', true);
      
      if (onRefresh) {
        await onRefresh();
      }
      
      showNotification('Content refreshed', 'success');
    } catch (error) {
      logger.error('Pull to refresh failed:', error);
      mobileAnalytics.trackGestureUsage('pull_to_refresh', false);
      showNotification('Failed to refresh content', 'error');
    }
  };

  // Handle voice search
  const handleVoiceSearchResult = (result, transcript, confidence) => {
    hapticFeedback.medium();
    mobileAnalytics.trackPWAFeature('voice_search', {
      command_type: result.type,
      confidence,
      success: true
    });
    
    if (onVoiceSearch) {
      onVoiceSearch(result, transcript, confidence);
    }
    
    voiceSheet.close();
    showNotification(`Voice command: "${transcript}"`, 'info');
  };

  // Handle card scanning
  const handleCardDetected = (card, imageData) => {
    hapticFeedback.cardMatch();
    mobileAnalytics.trackPWAFeature('card_scanner', {
      card_detected: true,
      confidence: card.confidence
    });
    
    if (onCardScan) {
      onCardScan(card, imageData);
    }
    
    showNotification(`Detected: ${card.name}`, 'success');
  };

  // Handle share
  const handleShare = async (data) => {
    try {
      const shared = await deepLinking.share(data);
      
      if (shared) {
        hapticFeedback.success();
        mobileAnalytics.trackPWAFeature('native_share', { success: true });
        showNotification('Content shared successfully', 'success');
      }
    } catch (error) {
      logger.error('Share failed:', error);
      mobileAnalytics.trackPWAFeature('native_share', { success: false });
      showNotification('Failed to share content', 'error');
    }
  };

  // Handle share received
  const handleShareReceived = (shareData) => {
    showNotification('Shared content received', 'info');
    // Process shared content
  };

  // Show notification
  const showNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 3000);
  };

  // Quick action handlers
  const quickActions = {
    onSearch: () => {
      voiceSheet.open();
      mobileAnalytics.trackInteraction('fab_action', { action: 'voice_search' });
    },
    onScan: () => {
      scannerSheet.open();
      mobileAnalytics.trackInteraction('fab_action', { action: 'card_scanner' });
    },
    onFavorites: () => {
      // Navigate to favorites
      mobileAnalytics.trackInteraction('fab_action', { action: 'favorites' });
    },
    onShare: () => {
      shareSheet.open();
      mobileAnalytics.trackInteraction('fab_action', { action: 'share' });
    }
  };

  // Don't render mobile features on desktop
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="mobile-integration">
      {/* Main content with mobile enhancements */}
      <TouchGestures
        enableSwipe={true}
        enablePinch={false}
        enableDoubleTap={true}
        onSwipeLeft={() => mobileAnalytics.trackGestureUsage('swipe_left')}
        onSwipeRight={() => mobileAnalytics.trackGestureUsage('swipe_right')}
        onDoubleTap={() => mobileAnalytics.trackGestureUsage('double_tap')}
      >
        {enablePullToRefresh ? (
          <PullToRefresh
            onRefresh={handlePullToRefresh}
            refreshThreshold={80}
            disabled={mobileFeatures.battery === 'aggressive'}
          >
            {children}
          </PullToRefresh>
        ) : (
          children
        )}
      </TouchGestures>

      {/* Quick Actions FAB */}
      {enableQuickActions && (
        <QuickActionFAB
          {...quickActions}
          hideOnScroll={true}
          position="bottom-right"
          pulse={notifications.length > 0}
        />
      )}

      {/* Voice Search Bottom Sheet */}
      {enableVoiceSearch && (
        <BottomSheet
          isOpen={voiceSheet.isOpen}
          onClose={voiceSheet.close}
          title="Voice Search"
          snapPoints={[0.4, 0.7]}
          initialSnapPoint={0.4}
        >
          <div className="p-4">
            <VoiceSearch
              onSearchResult={handleVoiceSearchResult}
              onError={(error) => showNotification('Voice search error', 'error')}
              placeholder="Say 'Search for Pikachu' or other commands"
              autoStart={true}
            />
          </div>
        </BottomSheet>
      )}

      {/* Card Scanner Bottom Sheet */}
      {enableCardScanner && (
        <BottomSheet
          isOpen={scannerSheet.isOpen}
          onClose={scannerSheet.close}
          title="Card Scanner"
          snapPoints={[0.8, 0.95]}
          initialSnapPoint={0.8}
          showHeader={true}
        >
          <CardScanner
            onCardDetected={handleCardDetected}
            onError={(error) => showNotification('Scanner error', 'error')}
            autoCapture={true}
            overlayEnabled={true}
          />
        </BottomSheet>
      )}

      {/* Share Bottom Sheet */}
      <BottomSheet
        isOpen={shareSheet.isOpen}
        onClose={shareSheet.close}
        title="Share"
        snapPoints={[0.3, 0.5]}
        initialSnapPoint={0.3}
      >
        <div className="p-4 space-y-4">
          <button
            onClick={() => handleShare({
              title: 'DexTrends - Pokemon TCG Price Tracker',
              text: 'Check out DexTrends for Pokemon card prices!',
              url: window.location.href
            })}
            className="w-full p-3 bg-blue-500 text-white rounded-lg font-medium">
          >
            Share App
          </button>
          
          <button
            onClick={() => handleShare({
              title: document.title,
              text: 'Found this on DexTrends!',
              url: window.location.href
            })}
            className="w-full p-3 bg-green-500 text-white rounded-lg font-medium">
          >
            Share Current Page
          </button>
        </div>
      </BottomSheet>

      {/* Push Notifications */}
      {enablePushNotifications && (
        <PushNotifications
          onPermissionChange={(permission) => {
            mobileAnalytics.trackPWAFeature('push_notifications', {
              permission,
              granted: permission === 'granted'
            });
          }}
          onNotificationReceived={(data) => {
            showNotification(data.title || 'New notification', 'info');
          }}
        />
      )}

      {/* PWA Features */}
      <AppUpdateNotification />
      <InstallPrompt />

      {/* Mobile Notifications */}
      <div className="mobile-notifications">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`mobile-notification ${notification.type}`}
          >
            <span className="notification-icon">
              {notification.type === 'success' && '✅'}
              {notification.type === 'error' && '❌'}
              {notification.type === 'warning' && '⚠️'}
              {notification.type === 'info' && 'ℹ️'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
        ))}
      </div>

      {/* Mobile Status Bar */}
      <div className="mobile-status-bar">
        <div className="status-item">
          <span className={`status-indicator ${mobileFeatures.connectivity}`}>
            {mobileFeatures.connectivity === 'online' ? '🟢' : '🔴'}
          </span>
          <span className="status-text">{mobileFeatures.connectivity}</span>
        </div>
        
        <div className="status-item">
          <span className="status-indicator">⚡</span>
          <span className="status-text">{mobileFeatures.loading}</span>
        </div>
        
        {mobileFeatures.battery !== 'none' && (
          <div className="status-item">
            <span className="status-indicator">🔋</span>
            <span className="status-text">{mobileFeatures.battery}</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .mobile-integration {
          position: relative;
          width: 100%;
          min-height: 100vh;
        }

        .mobile-notifications {
          position: fixed;
          top: calc(env(safe-area-inset-top) + 20px);
          left: 16px;
          right: 16px;
          z-index: 9999;
          pointer-events: none;
        }

        .mobile-notification {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          margin-bottom: 8px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          animation: slideInDown 0.3s ease, slideOutUp 0.3s ease 2.7s;
          font-size: 14px;
          font-weight: 500;
        }

        .mobile-notification.success {
          background: rgba(16, 185, 129, 0.95);
          color: white;
        }

        .mobile-notification.error {
          background: rgba(239, 68, 68, 0.95);
          color: white;
        }

        .mobile-notification.warning {
          background: rgba(245, 158, 11, 0.95);
          color: white;
        }

        .mobile-notification.info {
          background: rgba(59, 130, 246, 0.95);
          color: white;
        }

        .notification-icon {
          font-size: 16px;
        }

        .mobile-status-bar {
          position: fixed;
          bottom: calc(env(safe-area-inset-bottom) + 100px);
          left: 16px;
          display: flex;
          gap: 8px;
          z-index: 40;
          opacity: 0.8;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border-radius: 16px;
          font-size: 10px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .status-indicator {
          font-size: 8px;
        }

        .status-indicator.online {
          color: #10b981;
        }

        .status-indicator.offline {
          color: #ef4444;
        }

        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideOutUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-100%);
            opacity: 0;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .mobile-notification {
            background: #1f2937;
            color: white;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .mobile-notification {
            animation: none;
          }
        }

        /* High contrast support */
        @media (prefers-contrast: high) {
          .mobile-notification {
            border: 2px solid currentColor;
          }
          
          .status-item {
            border: 1px solid currentColor;
          }
        }
      `}</style>
    </div>
  );
};

export default MobileIntegration;