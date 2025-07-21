import React, { useState, useEffect, useCallback } from 'react';
import { useMobileUtils } from '../../utils/mobileUtils';
import logger from '../../utils/logger';
import { postJSON } from '../../utils/unifiedFetch';

// Type definitions
interface PriceAlert {
  id: string;
  type: 'price';
  cardId: string;
  cardName: string;
  targetPrice: number;
  condition: 'above' | 'below' | 'change';
  enabled: boolean;
  createdAt: string;
}

interface PushNotificationsProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
  onNotificationReceived?: (data: any) => void;
  className?: string;
  vapidPublicKey?: string;
}

interface PushSubscriptionData {
  subscription: PushSubscription;
  userId: string;
  preferences: {
    priceAlerts: boolean;
    marketAlerts: boolean;
    systemAlerts: boolean;
  };
}

const PushNotifications: React.FC<PushNotificationsProps> = ({
  onPermissionChange,
  onNotificationReceived,
  className = '',
  vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY' // Replace with actual VAPID key
}) => {
  const { utils } = useMobileUtils();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [marketAlerts, setMarketAlerts] = useState<string[]>([]);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Check push notification support
  useEffect(() => {
    const checkSupport = () => {
      try {
        const supported = 'Notification' in window && 
                         'serviceWorker' in navigator && 
                         'PushManager' in window;
        
        setIsSupported(supported);
        
        if (supported && window.Notification) {
          setPermission(Notification.permission);
          logger.debug('Push notifications support:', { supported, permission: Notification.permission });
        } else {
          logger.debug('Push notifications support:', { supported, permission: 'default' });
        }
      } catch (error) {
        // Notification API not available (e.g., in tests or certain environments)
        setIsSupported(false);
        logger.warn('Push notifications not supported', { error });
      }
    };
    
    checkSupport();
  }, []);

  // Initialize service worker and push subscription
  useEffect(() => {
    if (isSupported && permission === 'granted') {
      initializePushSubscription();
    }
  }, [isSupported, permission]);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Push notifications not supported');
    }
    
    try {
      if (!window.Notification) {
        logger.debug('Notification API not available');
        return 'denied';
      }
      
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (onPermissionChange) {
        onPermissionChange(result);
      }
      
      utils.hapticFeedback(result === 'granted' ? 'medium' : 'heavy');
      
      if (result === 'granted') {
        await initializePushSubscription();
        showWelcomeNotification();
      }
      
      logger.debug('Notification permission result:', { result });
      return result;
    } catch (error) {
      logger.error('Failed to request notification permission:', error);
      throw error;
    }
  }, [isSupported, onPermissionChange, utils]);

  // Initialize push subscription
  const initializePushSubscription = useCallback(async (): Promise<PushSubscription | null> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const existingSubscription = await registration.pushManager.getSubscription();
      
      if (existingSubscription) {
        setSubscription(existingSubscription);
        logger.debug('Existing push subscription found');
        return existingSubscription;
      }
      
      // Create new subscription
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      
      setSubscription(newSubscription);
      
      // Send subscription to server
      await sendSubscriptionToServer(newSubscription);
      
      logger.debug('New push subscription created');
      return newSubscription;
    } catch (error) {
      logger.error('Failed to initialize push subscription:', error);
      throw error;
    }
  }, [vapidPublicKey]);

  // Send subscription to server
  const sendSubscriptionToServer = useCallback(async (subscription: PushSubscription) => {
    try {
      // In a real implementation, send to your backend
      const data: PushSubscriptionData = {
        subscription: subscription,
        userId: 'current-user-id', // Get from auth context
        preferences: {
          priceAlerts: true,
          marketAlerts: true,
          systemAlerts: true
        }
      };

      await postJSON('/api/push-subscription', data);
      
      logger.debug('Subscription saved to server');
    } catch (error) {
      logger.error('Failed to send subscription to server:', error);
      // Don't throw - allow local functionality to continue
    }
  }, []);

  // Convert VAPID key
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Show welcome notification
  const showWelcomeNotification = useCallback(() => {
    if (permission === 'granted') {
      new Notification('DexTrends Notifications Enabled! 🎉', {
        body: 'You\'ll now receive price alerts and market updates',
        icon: '/dextrendslogo.png',
        badge: '/dextrendslogo.png',
        tag: 'welcome',
        requireInteraction: false
      });
    }
  }, [permission]);

  // Add price alert
  const addPriceAlert = useCallback((
    cardId: string, 
    cardName: string, 
    targetPrice: number, 
    condition: 'above' | 'below' | 'change' = 'below'
  ): PriceAlert => {
    const alert: PriceAlert = {
      id: `price-${Date.now()}`,
      type: 'price',
      cardId,
      cardName,
      targetPrice,
      condition,
      enabled: true,
      createdAt: new Date().toISOString()
    };
    
    setPriceAlerts(prev => [...prev, alert]);
    
    // Save to localStorage
    const allAlerts = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    localStorage.setItem('priceAlerts', JSON.stringify([...allAlerts, alert]));
    
    utils.hapticFeedback('light');
    logger.debug('Price alert added:', { alert });
    
    return alert;
  }, [utils]);

  // Remove price alert
  const removePriceAlert = useCallback((alertId: string) => {
    setPriceAlerts(prev => prev.filter(alert => alert.id !== alertId));
    
    // Update localStorage
    const allAlerts: PriceAlert[] = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    const updated = allAlerts.filter(alert => alert.id !== alertId);
    localStorage.setItem('priceAlerts', JSON.stringify(updated));
    
    utils.hapticFeedback('light');
    logger.debug('Price alert removed:', { alertId });
  }, [utils]);

  // Toggle alert
  const toggleAlert = useCallback((alertId: string) => {
    setPriceAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
    ));
    
    // Update localStorage
    const allAlerts: PriceAlert[] = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    const updated = allAlerts.map(alert => 
      alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
    );
    localStorage.setItem('priceAlerts', JSON.stringify(updated));
    
    utils.hapticFeedback('light');
  }, [utils]);

  // Send test notification
  const sendTestNotification = useCallback(() => {
    if (permission === 'granted') {
      new Notification('Test Notification 🧪', {
        body: 'This is a test notification from DexTrends',
        icon: '/dextrendslogo.png',
        badge: '/dextrendslogo.png',
        tag: 'test',
        requireInteraction: false
      });
      
      utils.hapticFeedback('medium');
    }
  }, [permission, utils]);

  // Load saved alerts
  useEffect(() => {
    const savedAlerts: PriceAlert[] = JSON.parse(localStorage.getItem('priceAlerts') || '[]');
    setPriceAlerts(savedAlerts);
  }, []);

  // Listen for service worker messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'push-notification') {
        if (onNotificationReceived) {
          onNotificationReceived(event.data);
        }
        logger.debug('Push notification received:', { data: event.data });
      }
    };
    
    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [onNotificationReceived]);

  if (!isSupported) {
    return (
      <div className={`push-notifications-unsupported ${className}`}>
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
          <span className="text-gray-500 text-sm">Push notifications not supported in this browser</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`push-notifications ${className}`}>
      {/* Permission Status */}
      <div className="permission-status">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">
              {permission === 'granted' ? '🔔' : 
               permission === 'denied' ? '🔕' : '⏰'}
            </span>
            <div>
              <h3 className="font-semibold text-gray-900">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-600">
                {permission === 'granted' ? 'Enabled and active' :
                 permission === 'denied' ? 'Blocked by user' :
                 'Not enabled'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {permission !== 'granted' && (
              <button
                onClick={requestPermission}
                className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">

                Enable
              </button>
            )}
            
            {permission === 'granted' && (
              <button
                onClick={sendTestNotification}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors">

                Test
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      {permission === 'granted' && (
        <div className="notification-settings mt-4">
          <h3 className="text-lg font-semibold mb-3">Notification Preferences</h3>
          
          <div className="space-y-3">
            {/* System Alerts */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <h4 className="font-medium">System Alerts</h4>
                <p className="text-sm text-gray-600">App updates and important announcements</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemAlerts}
                  onChange={(e) => setSystemAlerts(e.target.checked)}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            {/* Market Alerts */}
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div>
                <h4 className="font-medium">Market Alerts</h4>
                <p className="text-sm text-gray-600">Trending cards and market insights</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketAlerts.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setMarketAlerts(['trending', 'market-changes']);
                    } else {
                      setMarketAlerts([]);
                    }
                  }}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Price Alerts */}
      {permission === 'granted' && (
        <div className="price-alerts mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Price Alerts ({priceAlerts.length})</h3>
            <button
              onClick={() => {
                // Mock adding a price alert
                addPriceAlert('charizard-base-4', 'Charizard Base Set', 1000, 'below');
              }}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">

              + Add Alert
            </button>
          </div>
          
          {priceAlerts.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <span className="text-4xl mb-2 block">📊</span>
              <p className="text-gray-600">No price alerts set up yet</p>
              <p className="text-sm text-gray-500 mt-1">Add alerts to get notified when card prices change</p>
            </div>
          ) : (
            <div className="space-y-2">
              {priceAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 bg-white rounded-lg border ${
                    alert.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.cardName}</h4>
                    <p className="text-sm text-gray-600">
                      Alert when price goes {alert.condition} ${alert.targetPrice}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        alert.enabled 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {alert.enabled ? '✓' : '○'}
                    </button>
                    
                    <button
                      onClick={() => removePriceAlert(alert.id)}
                      className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm hover:bg-red-200 transition-colors">

                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscription Info */}
      {subscription && (
        <div className="subscription-info mt-6 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Subscription Status</h4>
          <p className="text-sm text-blue-800">
            Active subscription registered with push service
          </p>
          <details className="mt-2">
            <summary className="text-xs text-blue-700 cursor-pointer">Technical Details</summary>
            <pre className="mt-2 text-xs bg-blue-100 p-2 rounded overflow-auto">
              {JSON.stringify(subscription.toJSON(), null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default PushNotifications;