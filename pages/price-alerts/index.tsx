/**
 * Price Alerts Page
 *
 * Card price monitoring with:
 * - Set target prices
 * - Get notified on price changes
 * - Price history tracking
 * - Email notification settings
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { PriceAlerts, PriceAlert, AlertSettings } from '@/components/price/PriceAlerts';
import { Container } from '@/components/ui/Container';
import logger from '@/utils/logger';

// LocalStorage keys
const ALERTS_STORAGE_KEY = 'dextrends_price_alerts';
const SETTINGS_STORAGE_KEY = 'dextrends_alert_settings';

const DEFAULT_SETTINGS: AlertSettings = {
  emailNotifications: false,
  checkFrequency: 'daily',
  digestEnabled: false,
  digestFrequency: 'weekly',
  soundEnabled: true,
};

export default function PriceAlertsPage() {
  const [initialAlerts, setInitialAlerts] = useState<PriceAlert[]>([]);
  const [initialSettings, setInitialSettings] = useState<AlertSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (savedAlerts) {
        const alerts = JSON.parse(savedAlerts);
        setInitialAlerts(alerts);
        logger.info('Price alerts loaded', { count: alerts.length });
      }

      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setInitialSettings({ ...DEFAULT_SETTINGS, ...settings });
      }
    } catch (error) {
      logger.error('Failed to load price alerts', { error });
    }
    setIsLoaded(true);
  }, []);

  // Save alerts to localStorage
  const handleAlertChange = (alerts: PriceAlert[]) => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
      logger.info('Price alerts saved', { count: alerts.length });
    } catch (error) {
      logger.error('Failed to save price alerts', { error });
    }
  };

  // Save settings to localStorage
  const handleSettingsChange = (settings: AlertSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      logger.info('Alert settings saved');
    } catch (error) {
      logger.error('Failed to save alert settings', { error });
    }
  };

  return (
    <>
      <Head>
        <title>Price Alerts | DexTrends</title>
        <meta name="description" content="Set price alerts for Pokemon TCG cards and get notified when prices change." />
        <meta property="og:title" content="Card Price Alerts | DexTrends" />
        <meta property="og:description" content="Monitor Pokemon TCG card prices and get notified on drops and changes." />
      </Head>

      <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
        {/* Page Header */}
        <div className="bg-gradient-to-b from-green-50 to-stone-50 dark:from-stone-800 dark:to-stone-900 border-b border-stone-200 dark:border-stone-700">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <nav className="text-sm text-stone-500 dark:text-stone-400 mb-4">
              <Link href="/" className="hover:text-amber-600">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-stone-800 dark:text-white">Price Alerts</span>
            </nav>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-white">
              Price Alerts
            </h1>
            <p className="text-stone-600 dark:text-stone-300 mt-2">
              Track card prices and get notified when they reach your target
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {isLoaded ? (
            <PriceAlerts
              initialAlerts={initialAlerts}
              initialSettings={initialSettings}
              onAlertChange={handleAlertChange}
              onSettingsChange={handleSettingsChange}
            />
          ) : (
            <Container variant="elevated" padding="lg" className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600" />
            </Container>
          )}
        </div>
      </div>
    </>
  );
}
