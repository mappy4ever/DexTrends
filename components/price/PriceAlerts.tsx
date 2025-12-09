/**
 * PriceAlerts - Card Price Alert System
 *
 * Features:
 * - Set target prices for cards
 * - Get notified when prices drop/rise
 * - Daily/weekly price digests
 * - Price history tracking
 * - Multiple alert types (below, above, percentage change)
 * - Email notifications (integration ready)
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, ContainerHeader, ContainerTitle, ContainerDescription, ContainerFooter } from '@/components/ui/Container';
import Button, { ButtonGroup, IconButton } from '@/components/ui/Button';
import { Modal, useModalState } from '@/components/ui/Modal';
import { EnergyBadge } from '@/components/ui/EnergyIcon';
import { Pagination, PageInfo } from '@/components/ui/Pagination';
import { cn } from '@/utils/cn';
import { TRANSITION } from '@/components/ui/design-system/glass-constants';
import {
  FiBell,
  FiBellOff,
  FiTrendingDown,
  FiTrendingUp,
  FiPercent,
  FiPlus,
  FiX,
  FiTrash2,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiSearch,
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiMail,
  FiSettings,
  FiFilter,
  FiMoreHorizontal,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';
import logger from '@/utils/logger';

// Alert types
export type AlertType = 'below' | 'above' | 'percent_drop' | 'percent_rise' | 'any_change';

export interface PriceAlert {
  id: string;
  cardId: string;
  cardName: string;
  cardImage: string;
  cardSet: string;
  cardNumber: string;
  currentPrice: number;
  alertType: AlertType;
  targetValue: number; // Price for below/above, percentage for percent alerts
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: string;
  triggeredPrice?: number;
  createdAt: string;
  lastChecked?: string;
  notificationSent?: boolean;
}

export interface PriceHistory {
  date: string;
  price: number;
}

export interface AlertSettings {
  emailNotifications: boolean;
  emailAddress?: string;
  checkFrequency: 'hourly' | 'daily' | 'weekly';
  digestEnabled: boolean;
  digestFrequency: 'daily' | 'weekly';
  soundEnabled: boolean;
}

interface PriceAlertsProps {
  initialAlerts?: PriceAlert[];
  initialSettings?: AlertSettings;
  onAlertChange?: (alerts: PriceAlert[]) => void;
  onSettingsChange?: (settings: AlertSettings) => void;
  className?: string;
}

const ALERT_TYPE_CONFIG: Record<AlertType, {
  label: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  description: string;
}> = {
  below: {
    label: 'Price Below',
    icon: FiArrowDown,
    color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    description: 'Alert when price drops below target',
  },
  above: {
    label: 'Price Above',
    icon: FiArrowUp,
    color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
    description: 'Alert when price rises above target',
  },
  percent_drop: {
    label: 'Price Drop %',
    icon: FiPercent,
    color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    description: 'Alert when price drops by percentage',
  },
  percent_rise: {
    label: 'Price Rise %',
    icon: FiPercent,
    color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
    description: 'Alert when price rises by percentage',
  },
  any_change: {
    label: 'Any Change',
    icon: FiTrendingUp,
    color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    description: 'Alert on any significant price change',
  },
};

export const PriceAlerts: React.FC<PriceAlertsProps> = ({
  initialAlerts = [],
  initialSettings = {
    emailNotifications: false,
    checkFrequency: 'daily',
    digestEnabled: false,
    digestFrequency: 'weekly',
    soundEnabled: true,
  },
  onAlertChange,
  onSettingsChange,
  className,
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>(initialAlerts);
  const [settings, setSettings] = useState<AlertSettings>(initialSettings);
  const [filterType, setFilterType] = useState<'all' | 'active' | 'triggered'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const addAlertModal = useModalState();
  const settingsModal = useModalState();
  const historyModal = useModalState();

  const [selectedAlert, setSelectedAlert] = useState<PriceAlert | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Statistics
  const stats = useMemo(() => ({
    total: alerts.length,
    active: alerts.filter(a => a.isActive).length,
    triggered: alerts.filter(a => a.isTriggered).length,
    pendingNotification: alerts.filter(a => a.isTriggered && !a.notificationSent).length,
  }), [alerts]);

  // Filter and sort alerts
  const filteredAlerts = useMemo(() => {
    let result = [...alerts];

    // Filter by type
    if (filterType === 'active') {
      result = result.filter(a => a.isActive && !a.isTriggered);
    } else if (filterType === 'triggered') {
      result = result.filter(a => a.isTriggered);
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.cardName.toLowerCase().includes(query) ||
        a.cardSet.toLowerCase().includes(query)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price':
          return b.currentPrice - a.currentPrice;
        case 'name':
          return a.cardName.localeCompare(b.cardName);
        default:
          return 0;
      }
    });

    return result;
  }, [alerts, filterType, searchQuery, sortBy]);

  // Pagination
  const paginatedAlerts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAlerts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAlerts, currentPage]);

  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);

  // Handlers
  const handleCreateAlert = useCallback((alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered' | 'isActive'>) => {
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isActive: true,
      isTriggered: false,
    };

    const newAlerts = [...alerts, newAlert];
    setAlerts(newAlerts);
    onAlertChange?.(newAlerts);
    addAlertModal.close();
    logger.info('Price alert created', { cardId: alert.cardId, type: alert.alertType });
  }, [alerts, onAlertChange, addAlertModal]);

  const handleUpdateAlert = useCallback((alertId: string, updates: Partial<PriceAlert>) => {
    const newAlerts = alerts.map(a =>
      a.id === alertId ? { ...a, ...updates } : a
    );
    setAlerts(newAlerts);
    onAlertChange?.(newAlerts);
  }, [alerts, onAlertChange]);

  const handleDeleteAlert = useCallback((alertId: string) => {
    const newAlerts = alerts.filter(a => a.id !== alertId);
    setAlerts(newAlerts);
    onAlertChange?.(newAlerts);
    logger.info('Price alert deleted', { alertId });
  }, [alerts, onAlertChange]);

  const handleToggleAlert = useCallback((alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      handleUpdateAlert(alertId, { isActive: !alert.isActive });
    }
  }, [alerts, handleUpdateAlert]);

  const handleDismissTriggered = useCallback((alertId: string) => {
    handleUpdateAlert(alertId, { isTriggered: false, notificationSent: true });
  }, [handleUpdateAlert]);

  const handleUpdateSettings = useCallback((updates: Partial<AlertSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onSettingsChange?.(newSettings);
  }, [settings, onSettingsChange]);

  const handleClearAllTriggered = useCallback(() => {
    const newAlerts = alerts.map(a =>
      a.isTriggered ? { ...a, isTriggered: false, notificationSent: true } : a
    );
    setAlerts(newAlerts);
    onAlertChange?.(newAlerts);
  }, [alerts, onAlertChange]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Alerts"
          value={stats.total}
          icon={<FiBell className="w-5 h-5" />}
          color="stone"
        />
        <StatCard
          label="Active"
          value={stats.active}
          icon={<FiBell className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Triggered"
          value={stats.triggered}
          icon={<FiCheckCircle className="w-5 h-5" />}
          color="green"
          highlight={stats.triggered > 0}
        />
        <StatCard
          label="Pending"
          value={stats.pendingNotification}
          icon={<FiAlertCircle className="w-5 h-5" />}
          color="amber"
          highlight={stats.pendingNotification > 0}
        />
      </div>

      {/* Triggered Alerts Banner */}
      <AnimatePresence>
        {stats.triggered > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Container
              variant="gradient"
              gradient="green"
              padding="md"
              className="border-green-200 dark:border-green-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                    <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 dark:text-green-200">
                      {stats.triggered} Alert{stats.triggered > 1 ? 's' : ''} Triggered!
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Your target prices have been reached
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearAllTriggered}
                >
                  Dismiss All
                </Button>
              </div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <Container variant="elevated" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter Tabs */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All', count: stats.total },
              { id: 'active', label: 'Active', count: stats.active },
              { id: 'triggered', label: 'Triggered', count: stats.triggered },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterType(tab.id as typeof filterType);
                  setCurrentPage(1);
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                  TRANSITION.default,
                  filterType === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-xs',
                    filterType === tab.id
                      ? 'bg-white/20'
                      : 'bg-stone-200 dark:bg-stone-700'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search alerts..."
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-lg',
                'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                'text-stone-800 dark:text-white placeholder:text-stone-400',
                'focus:outline-none focus:ring-2 focus:ring-amber-500'
              )}
            />
          </div>

          {/* Actions */}
          <ButtonGroup spacing="sm">
            <IconButton
              variant="ghost"
              onClick={settingsModal.open}
              aria-label="Settings"
            >
              <FiSettings className="w-5 h-5" />
            </IconButton>
            <Button
              variant="primary"
              size="sm"
              icon={<FiPlus className="w-4 h-4" />}
              onClick={addAlertModal.open}
            >
              New Alert
            </Button>
          </ButtonGroup>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-sm text-stone-500 dark:text-stone-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm',
              'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
              'text-stone-800 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-amber-500'
            )}
          >
            <option value="date">Date Created</option>
            <option value="price">Current Price</option>
            <option value="name">Card Name</option>
          </select>
        </div>
      </Container>

      {/* Alerts List */}
      <Container variant="elevated" padding="md">
        {paginatedAlerts.length === 0 ? (
          <EmptyState
            filterType={filterType}
            onCreateAlert={addAlertModal.open}
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {paginatedAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <AlertItem
                    alert={alert}
                    onToggle={() => handleToggleAlert(alert.id)}
                    onDelete={() => handleDeleteAlert(alert.id)}
                    onDismiss={() => handleDismissTriggered(alert.id)}
                    onViewHistory={() => {
                      setSelectedAlert(alert);
                      historyModal.open();
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <PageInfo
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAlerts.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </Container>

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={addAlertModal.isOpen}
        onClose={addAlertModal.close}
        onCreate={handleCreateAlert}
        existingAlerts={alerts}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.close}
        settings={settings}
        onUpdate={handleUpdateSettings}
      />

      {/* Price History Modal */}
      {selectedAlert && (
        <PriceHistoryModal
          isOpen={historyModal.isOpen}
          onClose={historyModal.close}
          alert={selectedAlert}
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'stone' | 'blue' | 'green' | 'amber';
  highlight?: boolean;
}> = ({ label, value, icon, color, highlight }) => {
  const colorClasses = {
    stone: 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  };

  return (
    <Container
      variant="elevated"
      padding="sm"
      className={cn(
        'text-center',
        highlight && 'ring-2 ring-green-500 dark:ring-green-400'
      )}
    >
      <div className={cn('w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-2', colorClasses[color])}>
        {icon}
      </div>
      <div className="text-xl font-bold text-stone-800 dark:text-white">{value}</div>
      <div className="text-xs text-stone-500 dark:text-stone-400">{label}</div>
    </Container>
  );
};

// Alert Item Component
const AlertItem: React.FC<{
  alert: PriceAlert;
  onToggle: () => void;
  onDelete: () => void;
  onDismiss: () => void;
  onViewHistory: () => void;
}> = ({ alert, onToggle, onDelete, onDismiss, onViewHistory }) => {
  const config = ALERT_TYPE_CONFIG[alert.alertType];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-xl',
        alert.isTriggered
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          : alert.isActive
          ? 'bg-stone-50 dark:bg-stone-800/50'
          : 'bg-stone-100/50 dark:bg-stone-800/30 opacity-60'
      )}
    >
      {/* Card Image */}
      <div className="relative w-12 h-16 rounded-lg overflow-hidden flex-shrink-0">
        <Image src={alert.cardImage} alt={alert.cardName} fill className="object-cover" sizes="48px" loading="lazy" />
      </div>

      {/* Alert Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-stone-800 dark:text-white truncate">
            {alert.cardName}
          </h4>
          {alert.isTriggered && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs font-medium">
              <FiCheckCircle className="w-3 h-3" />
              Triggered
            </span>
          )}
        </div>
        <div className="text-xs text-stone-500 dark:text-stone-400">
          {alert.cardSet} #{alert.cardNumber}
        </div>

        {/* Alert Condition */}
        <div className="flex items-center gap-2 mt-2">
          <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', config.color)}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
          <span className="text-sm text-stone-600 dark:text-stone-300">
            {alert.alertType.includes('percent') ? `${alert.targetValue}%` : `$${alert.targetValue.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Current Price */}
      <div className="text-right">
        <div className="text-lg font-bold text-stone-800 dark:text-white">
          ${alert.currentPrice.toFixed(2)}
        </div>
        <div className="text-xs text-stone-500 dark:text-stone-400">Current</div>
        {alert.isTriggered && alert.triggeredPrice && (
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            Triggered at ${alert.triggeredPrice.toFixed(2)}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        {alert.isTriggered ? (
          <Button
            variant="success"
            size="sm"
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        ) : (
          <>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onToggle}
              aria-label={alert.isActive ? 'Pause alert' : 'Activate alert'}
            >
              {alert.isActive ? (
                <FiBellOff className="w-4 h-4" />
              ) : (
                <FiBell className="w-4 h-4" />
              )}
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onViewHistory}
              aria-label="View price history"
            >
              <FiTrendingUp className="w-4 h-4" />
            </IconButton>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={onDelete}
              aria-label="Delete alert"
            >
              <FiTrash2 className="w-4 h-4 text-red-500" />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState: React.FC<{
  filterType: 'all' | 'active' | 'triggered';
  onCreateAlert: () => void;
}> = ({ filterType, onCreateAlert }) => {
  const messages = {
    all: {
      title: 'No price alerts yet',
      description: 'Create an alert to get notified when card prices change.',
    },
    active: {
      title: 'No active alerts',
      description: 'All your alerts have been triggered or paused.',
    },
    triggered: {
      title: 'No triggered alerts',
      description: 'None of your alerts have reached their target yet.',
    },
  };

  return (
    <div className="text-center py-12">
      <FiBell className="w-12 h-12 mx-auto text-stone-300 dark:text-stone-600 mb-4" />
      <h3 className="text-lg font-medium text-stone-800 dark:text-white mb-2">
        {messages[filterType].title}
      </h3>
      <p className="text-stone-500 dark:text-stone-400 mb-4">
        {messages[filterType].description}
      </p>
      {filterType === 'all' && (
        <Button variant="primary" onClick={onCreateAlert} icon={<FiPlus className="w-4 h-4" />}>
          Create Your First Alert
        </Button>
      )}
    </div>
  );
};

// Create Alert Modal
const CreateAlertModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCreate: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered' | 'isActive'>) => void;
  existingAlerts: PriceAlert[];
}> = ({ isOpen, onClose, onCreate, existingAlerts }) => {
  const [step, setStep] = useState<'search' | 'configure'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    name: string;
    image: string;
    set: string;
    number: string;
    price: number;
  }>>([]);
  const [selectedCard, setSelectedCard] = useState<typeof searchResults[0] | null>(null);
  const [alertType, setAlertType] = useState<AlertType>('below');
  const [targetValue, setTargetValue] = useState<string>('');

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/tcg-cards?name=${encodeURIComponent(searchQuery)}&pageSize=10`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults((data.data || []).map((card: Record<string, unknown>) => ({
          id: card.id as string,
          name: card.name as string,
          image: (card.images as { small: string })?.small || '',
          set: (card.set as { name: string })?.name || '',
          number: card.number as string || '',
          price: (card.tcgplayer as { prices?: { normal?: { market?: number } } })?.prices?.normal?.market || 0,
        })));
      }
    } catch (error) {
      logger.error('Failed to search cards', { error });
    }
    setIsSearching(false);
  }, [searchQuery]);

  const handleSelectCard = useCallback((card: typeof searchResults[0]) => {
    setSelectedCard(card);
    setStep('configure');
  }, []);

  const handleCreate = useCallback(() => {
    if (!selectedCard || !targetValue) return;

    onCreate({
      cardId: selectedCard.id,
      cardName: selectedCard.name,
      cardImage: selectedCard.image,
      cardSet: selectedCard.set,
      cardNumber: selectedCard.number,
      currentPrice: selectedCard.price,
      alertType,
      targetValue: parseFloat(targetValue),
    });

    // Reset
    setStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCard(null);
    setAlertType('below');
    setTargetValue('');
  }, [selectedCard, alertType, targetValue, onCreate]);

  const resetModal = useCallback(() => {
    setStep('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCard(null);
    setAlertType('below');
    setTargetValue('');
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetModal();
        onClose();
      }}
      title={step === 'search' ? 'Select a Card' : 'Configure Alert'}
      size="lg"
    >
      {step === 'search' ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search for a card..."
                className={cn(
                  'w-full pl-10 pr-4 py-3 rounded-lg',
                  'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                  'text-stone-800 dark:text-white placeholder:text-stone-400',
                  'focus:outline-none focus:ring-2 focus:ring-amber-500'
                )}
              />
            </div>
            <Button variant="primary" onClick={handleSearch} loading={isSearching}>
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {searchResults.map(card => {
                const hasExistingAlert = existingAlerts.some(a => a.cardId === card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelectCard(card)}
                    disabled={hasExistingAlert}
                    className={cn(
                      'w-full flex items-center gap-4 p-3 rounded-lg text-left',
                      'bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700',
                      TRANSITION.default,
                      hasExistingAlert && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0">
                      <Image src={card.image} alt={card.name} fill className="object-cover" sizes="40px" loading="lazy" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-stone-800 dark:text-white truncate">{card.name}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">{card.set} #{card.number}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600 dark:text-green-400">${card.price.toFixed(2)}</div>
                      {hasExistingAlert && (
                        <div className="text-xs text-amber-600 dark:text-amber-400">Alert exists</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Card */}
          {selectedCard && (
            <div className="flex items-center gap-4 p-3 rounded-lg bg-stone-50 dark:bg-stone-800">
              <div className="relative w-16 h-22 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={selectedCard.image} alt={selectedCard.name} fill className="object-cover" sizes="64px" loading="lazy" />
              </div>
              <div>
                <h4 className="font-semibold text-stone-800 dark:text-white">{selectedCard.name}</h4>
                <p className="text-sm text-stone-500 dark:text-stone-400">{selectedCard.set} #{selectedCard.number}</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                  ${selectedCard.price.toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Alert Type */}
          <div>
            <label className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-2 block">
              Alert Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(ALERT_TYPE_CONFIG) as [AlertType, typeof ALERT_TYPE_CONFIG[AlertType]][]).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setAlertType(type)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2',
                    TRANSITION.default,
                    alertType === type
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600'
                  )}
                >
                  <config.icon className={cn('w-5 h-5', alertType === type ? 'text-amber-600' : 'text-stone-500')} />
                  <span className={cn(
                    'text-xs font-medium',
                    alertType === type ? 'text-amber-600 dark:text-amber-400' : 'text-stone-600 dark:text-stone-300'
                  )}>
                    {config.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Target Value */}
          <div>
            <label className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-2 block">
              {alertType.includes('percent') ? 'Percentage Change' : 'Target Price'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
                {alertType.includes('percent') ? '%' : '$'}
              </span>
              <input
                type="number"
                value={targetValue}
                onChange={e => setTargetValue(e.target.value)}
                placeholder={alertType.includes('percent') ? '10' : selectedCard ? (selectedCard.price * 0.8).toFixed(2) : '0.00'}
                min={0}
                step={alertType.includes('percent') ? 1 : 0.01}
                className={cn(
                  'w-full pl-8 pr-4 py-3 rounded-lg',
                  'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                  'text-stone-800 dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-amber-500'
                )}
              />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {ALERT_TYPE_CONFIG[alertType].description}
            </p>
          </div>

          {/* Actions */}
          <ContainerFooter separator align="between">
            <Button variant="ghost" onClick={() => setStep('search')}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!targetValue || parseFloat(targetValue) <= 0}
              icon={<FiBell className="w-4 h-4" />}
            >
              Create Alert
            </Button>
          </ContainerFooter>
        </div>
      )}
    </Modal>
  );
};

// Settings Modal
const SettingsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  settings: AlertSettings;
  onUpdate: (updates: Partial<AlertSettings>) => void;
}> = ({ isOpen, onClose, settings, onUpdate }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alert Settings"
      size="md"
    >
      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FiMail className="w-5 h-5 text-stone-500" />
              <div>
                <h4 className="font-medium text-stone-800 dark:text-white">Email Notifications</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400">Receive alerts via email</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.emailNotifications}
              onChange={(checked) => onUpdate({ emailNotifications: checked })}
            />
          </div>

          {settings.emailNotifications && (
            <input
              type="email"
              value={settings.emailAddress || ''}
              onChange={e => onUpdate({ emailAddress: e.target.value })}
              placeholder="your@email.com"
              className={cn(
                'w-full px-4 py-2 rounded-lg',
                'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                'text-stone-800 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-amber-500'
              )}
            />
          )}
        </div>

        {/* Check Frequency */}
        <div>
          <label className="text-sm font-medium text-stone-600 dark:text-stone-300 mb-2 block">
            Price Check Frequency
          </label>
          <select
            value={settings.checkFrequency}
            onChange={e => onUpdate({ checkFrequency: e.target.value as AlertSettings['checkFrequency'] })}
            className={cn(
              'w-full px-4 py-2 rounded-lg',
              'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
              'text-stone-800 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-amber-500'
            )}
          >
            <option value="hourly">Every hour</option>
            <option value="daily">Once a day</option>
            <option value="weekly">Once a week</option>
          </select>
        </div>

        {/* Digest */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-medium text-stone-800 dark:text-white">Price Digest</h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">Summary of all tracked cards</p>
            </div>
            <ToggleSwitch
              checked={settings.digestEnabled}
              onChange={(checked) => onUpdate({ digestEnabled: checked })}
            />
          </div>

          {settings.digestEnabled && (
            <select
              value={settings.digestFrequency}
              onChange={e => onUpdate({ digestFrequency: e.target.value as AlertSettings['digestFrequency'] })}
              className={cn(
                'w-full px-4 py-2 rounded-lg',
                'bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700',
                'text-stone-800 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-amber-500'
              )}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          )}
        </div>

        {/* Sound */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-stone-800 dark:text-white">Sound Notifications</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">Play sound when alert triggers</p>
          </div>
          <ToggleSwitch
            checked={settings.soundEnabled}
            onChange={(checked) => onUpdate({ soundEnabled: checked })}
          />
        </div>
      </div>
    </Modal>
  );
};

// Price History Modal
const PriceHistoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  alert: PriceAlert;
}> = ({ isOpen, onClose, alert }) => {
  // Mock price history data
  const priceHistory: PriceHistory[] = useMemo(() => {
    const history: PriceHistory[] = [];
    const basePrice = alert.currentPrice;
    const now = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const variance = (Math.random() - 0.5) * basePrice * 0.2;
      history.push({
        date: date.toISOString().split('T')[0],
        price: Math.max(0.01, basePrice + variance),
      });
    }

    return history;
  }, [alert.currentPrice]);

  const minPrice = Math.min(...priceHistory.map(p => p.price));
  const maxPrice = Math.max(...priceHistory.map(p => p.price));
  const priceChange = priceHistory[priceHistory.length - 1].price - priceHistory[0].price;
  const percentChange = (priceChange / priceHistory[0].price) * 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Price History"
      size="lg"
    >
      <div className="space-y-6">
        {/* Card Info */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-22 rounded-lg overflow-hidden flex-shrink-0">
            <Image src={alert.cardImage} alt={alert.cardName} fill className="object-cover" sizes="64px" loading="lazy" />
          </div>
          <div>
            <h4 className="font-semibold text-stone-800 dark:text-white">{alert.cardName}</h4>
            <p className="text-sm text-stone-500 dark:text-stone-400">{alert.cardSet}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">${minPrice.toFixed(2)}</div>
            <div className="text-xs text-stone-500 dark:text-stone-400">30-Day Low</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
            <div className="text-lg font-bold text-stone-800 dark:text-white">${alert.currentPrice.toFixed(2)}</div>
            <div className="text-xs text-stone-500 dark:text-stone-400">Current</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-stone-50 dark:bg-stone-800/50">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">${maxPrice.toFixed(2)}</div>
            <div className="text-xs text-stone-500 dark:text-stone-400">30-Day High</div>
          </div>
        </div>

        {/* Change Indicator */}
        <div className={cn(
          'flex items-center justify-center gap-2 p-3 rounded-lg',
          priceChange >= 0
            ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
        )}>
          {priceChange >= 0 ? <FiArrowUp className="w-5 h-5" /> : <FiArrowDown className="w-5 h-5" />}
          <span className="font-semibold">
            {priceChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}% ({priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)})
          </span>
          <span className="text-sm opacity-75">in 30 days</span>
        </div>

        {/* Simple Chart */}
        <div className="h-40 relative">
          <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={priceChange >= 0 ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
                <stop offset="100%" stopColor={priceChange >= 0 ? '#22c55e' : '#ef4444'} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Area */}
            <path
              d={`
                M 0 ${40 - ((priceHistory[0].price - minPrice) / (maxPrice - minPrice)) * 35}
                ${priceHistory.map((p, i) => {
                  const x = (i / (priceHistory.length - 1)) * 100;
                  const y = 40 - ((p.price - minPrice) / (maxPrice - minPrice)) * 35;
                  return `L ${x} ${y}`;
                }).join(' ')}
                L 100 40 L 0 40 Z
              `}
              fill="url(#priceGradient)"
            />

            {/* Line */}
            <path
              d={`
                M 0 ${40 - ((priceHistory[0].price - minPrice) / (maxPrice - minPrice)) * 35}
                ${priceHistory.map((p, i) => {
                  const x = (i / (priceHistory.length - 1)) * 100;
                  const y = 40 - ((p.price - minPrice) / (maxPrice - minPrice)) * 35;
                  return `L ${x} ${y}`;
                }).join(' ')}
              `}
              fill="none"
              stroke={priceChange >= 0 ? '#22c55e' : '#ef4444'}
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Target Line Info */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
          <div className="flex items-center gap-2">
            <FiBell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm text-amber-700 dark:text-amber-300">
              Alert Target: {ALERT_TYPE_CONFIG[alert.alertType].label}
            </span>
          </div>
          <span className="font-medium text-amber-700 dark:text-amber-300">
            {alert.alertType.includes('percent')
              ? `${alert.targetValue}%`
              : `$${alert.targetValue.toFixed(2)}`}
          </span>
        </div>
      </div>
    </Modal>
  );
};

// Toggle Switch Component
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ checked, onChange }) => {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full',
        TRANSITION.default,
        checked ? 'bg-amber-600' : 'bg-stone-300 dark:bg-stone-600'
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
};

export default PriceAlerts;
