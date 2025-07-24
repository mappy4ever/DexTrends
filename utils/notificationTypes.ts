// Notification type definitions and configurations
// Separated from NotificationSystem.tsx to avoid Fast Refresh issues

export type NotificationType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' | 'LOADING' | 'CARD_ADDED' | 'POKEMON_FOUND';

export interface NotificationAction {
  label: string;
  handler: () => void;
}

export interface Notification {
  id: string | number;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number | null;
  persistent?: boolean;
  actions?: NotificationAction[];
  timestamp: number;
}

export interface NotificationConfig {
  icon: string;
  className: string;
  iconColor: string;
  duration: number | null;
}

export interface NotifyHelpers {
  success: (message: string, options?: Partial<Notification>) => string | number;
  error: (message: string, options?: Partial<Notification>) => string | number;
  warning: (message: string, options?: Partial<Notification>) => string | number;
  info: (message: string, options?: Partial<Notification>) => string | number;
  loading: (message: string, options?: Partial<Notification>) => string | number;
  cardAdded: (cardName: string, options?: Partial<Notification>) => string | number;
  pokemonFound: (pokemonName: string, options?: Partial<Notification>) => string | number;
  priceAlert: (cardName: string, oldPrice: number, newPrice: number, options?: Partial<Notification>) => string | number;
}

// Notification types and configurations
export const NOTIFICATION_TYPES: Record<NotificationType, NotificationConfig> = {
  SUCCESS: {
    icon: '✅',
    className: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-200',
    iconColor: 'text-green-500',
    duration: 4000
  },
  ERROR: {
    icon: '❌',
    className: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-200',
    iconColor: 'text-red-500',
    duration: 6000
  },
  WARNING: {
    icon: '⚠️',
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-200',
    iconColor: 'text-yellow-500',
    duration: 5000
  },
  INFO: {
    icon: 'ℹ️',
    className: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-200',
    iconColor: 'text-blue-500',
    duration: 4000
  },
  LOADING: {
    icon: '⏳',
    className: 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200',
    iconColor: 'text-gray-500',
    duration: null // Loading notifications don't auto-dismiss
  },
  CARD_ADDED: {
    icon: '🃏',
    className: 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-200',
    iconColor: 'text-purple-500',
    duration: 3000
  },
  POKEMON_FOUND: {
    icon: '⭐',
    className: 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-700 dark:text-indigo-200',
    iconColor: 'text-indigo-500',
    duration: 4000
  }
};