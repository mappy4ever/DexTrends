import React, { useState, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import { usePreferences } from './UserPreferences.hooks';
import { useNotifications } from '../../hooks/useNotifications';
import logger from '../../utils/logger';

// Type definitions
interface UserPreferences {
  // General
  language: string;
  timezone: string;
  
  // Appearance
  theme: 'light' | 'dark' | 'auto';
  cardDisplayMode: 'grid' | 'list';
  cardsPerPage: number;
  showPrices: boolean;
  showRarity: boolean;
  animationsEnabled: boolean;
  
  // Notifications
  enableNotifications: boolean;
  notificationDuration: number;
  soundEnabled: boolean;
  
  // Search & Browsing
  enableSearchSuggestions: boolean;
  saveSearchHistory: boolean;
  autoCompleteEnabled: boolean;
  infiniteScrollEnabled: boolean;
  
  // Accessibility
  highContrastMode: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  screenReaderOptimized: boolean;
  
  // Performance
  enableImageOptimization: boolean;
  enableCaching: boolean;
  lowDataMode: boolean;
  
  // Privacy
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  
  // Advanced
  enableBetaFeatures: boolean;
  debugMode: boolean;
}

export interface PreferencesContextValue {
  preferences: UserPreferences;
  isLoading: boolean;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  resetPreferences: () => void;
  exportPreferences: () => void;
  importPreferences: (file: File) => void;
}

interface PreferencesSectionProps {
  id: string;
  title: string;
  icon: string;
}

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// User preferences context
export const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

// Default preferences
const defaultPreferences: UserPreferences = {
  // General
  language: 'en',
  timezone: 'auto',
  
  // Appearance
  theme: 'auto',
  cardDisplayMode: 'grid',
  cardsPerPage: 20,
  showPrices: true,
  showRarity: true,
  animationsEnabled: true,
  
  // Notifications
  enableNotifications: true,
  notificationDuration: 4000,
  soundEnabled: false,
  
  // Search & Browsing
  enableSearchSuggestions: true,
  saveSearchHistory: true,
  autoCompleteEnabled: true,
  infiniteScrollEnabled: true,
  
  // Accessibility
  highContrastMode: false,
  reducedMotion: false,
  largeText: false,
  screenReaderOptimized: false,
  
  // Performance
  enableImageOptimization: true,
  enableCaching: true,
  lowDataMode: false,
  
  // Privacy
  analyticsEnabled: true,
  crashReportingEnabled: true,
  
  // Advanced
  enableBetaFeatures: false,
  debugMode: false
};

// Preferences provider
export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const { notify } = useNotifications();

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Apply preferences when they change
  useEffect(() => {
    applyPreferences(preferences);
  }, [preferences]);

  const loadPreferences = async () => {
    try {
      const saved = localStorage.getItem('userPreferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      logger.error('Failed to load preferences', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
      logger.debug('Preferences saved', { preferences: newPreferences });
    } catch (error) {
      logger.error('Failed to save preferences', { error });
      notify.error('Failed to save preferences');
    }
  };

  const updatePreference = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    const newPreferences = { ...preferences, [key]: value };
    savePreferences(newPreferences);
  };

  const resetPreferences = () => {
    setPreferences(defaultPreferences);
    localStorage.removeItem('userPreferences');
    notify.success('Preferences reset to defaults');
  };

  const applyPreferences = (prefs: UserPreferences) => {
    // Apply theme
    if (prefs.theme === 'auto') {
      // Let system handle auto theme
    } else {
      document.documentElement.classList.toggle('dark', prefs.theme === 'dark');
    }

    // Apply accessibility preferences
    if (prefs.reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }

    if (prefs.highContrastMode) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (prefs.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    // Apply performance preferences
    if (prefs.lowDataMode) {
      document.documentElement.classList.add('low-data-mode');
    } else {
      document.documentElement.classList.remove('low-data-mode');
    }
  };

  const exportPreferences = () => {
    const dataStr = JSON.stringify(preferences, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'dextrends-preferences.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    notify.success('Preferences exported successfully');
  };

  const importPreferences = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const imported = JSON.parse(result);
          const mergedPreferences = { ...defaultPreferences, ...imported };
          savePreferences(mergedPreferences);
          notify.success('Preferences imported successfully');
        }
      } catch (error) {
        logger.error('Failed to import preferences', { error });
        notify.error('Invalid preferences file');
      }
    };
    reader.readAsText(file);
  };

  const contextValue: PreferencesContextValue = {
    preferences,
    isLoading,
    updatePreference,
    resetPreferences,
    exportPreferences,
    importPreferences
  };

  return (
    <PreferencesContext.Provider value={contextValue}>
      {children}
    </PreferencesContext.Provider>
  );
};

// Preferences panel component
export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ isOpen, onClose }) => {
  const { preferences, updatePreference, resetPreferences, exportPreferences, importPreferences } = usePreferences();
  const [activeSection, setActiveSection] = useState('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const sections: PreferencesSectionProps[] = [
    { id: 'general', title: 'General', icon: '⚙️' },
    { id: 'appearance', title: 'Appearance', icon: '🎨' },
    { id: 'notifications', title: 'Notifications', icon: '🔔' },
    { id: 'browsing', title: 'Browsing', icon: '🔍' },
    { id: 'accessibility', title: 'Accessibility', icon: '♿' },
    { id: 'performance', title: 'Performance', icon: '⚡' },
    { id: 'privacy', title: 'Privacy', icon: '🔒' },
    { id: 'advanced', title: 'Advanced', icon: '🔧' }
  ];

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importPreferences(file);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={preferences.language}
                onChange={(e) => updatePreference('language', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) => updatePreference('theme', e.target.value as UserPreferences['theme'])}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                <option value="auto">Auto (System)</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Card Display Mode</label>
              <select
                value={preferences.cardDisplayMode}
                onChange={(e) => updatePreference('cardDisplayMode', e.target.value as UserPreferences['cardDisplayMode'])}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                <option value="grid">Grid</option>
                <option value="list">List</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cards per Page</label>
              <select
                value={preferences.cardsPerPage}
                onChange={(e) => updatePreference('cardsPerPage', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">

                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.showPrices}
                  onChange={(e) => updatePreference('showPrices', e.target.checked)}
                  className="mr-2" />
                Show card prices
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.showRarity}
                  onChange={(e) => updatePreference('showRarity', e.target.checked)}
                  className="mr-2" />
                Show card rarity
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.animationsEnabled}
                  onChange={(e) => updatePreference('animationsEnabled', e.target.checked)}
                  className="mr-2" />
                Enable animations
              </label>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.enableNotifications}
                onChange={(e) => updatePreference('enableNotifications', e.target.checked)}
                className="mr-2" />
              Enable notifications
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Notification Duration (ms)</label>
              <input
                type="number"
                value={preferences.notificationDuration}
                onChange={(e) => updatePreference('notificationDuration', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                max="10000"
                step="500"
              />
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => updatePreference('soundEnabled', e.target.checked)}
                className="mr-2" />
              Enable notification sounds
            </label>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.highContrastMode}
                onChange={(e) => updatePreference('highContrastMode', e.target.checked)}
                className="mr-2" />
              High contrast mode
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.reducedMotion}
                onChange={(e) => updatePreference('reducedMotion', e.target.checked)}
                className="mr-2" />
              Reduce motion and animations
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.largeText}
                onChange={(e) => updatePreference('largeText', e.target.checked)}
                className="mr-2" />
              Large text
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.screenReaderOptimized}
                onChange={(e) => updatePreference('screenReaderOptimized', e.target.checked)}
                className="mr-2" />
              Screen reader optimized
            </label>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.enableImageOptimization}
                onChange={(e) => updatePreference('enableImageOptimization', e.target.checked)}
                className="mr-2" />
              Enable image optimization
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.enableCaching}
                onChange={(e) => updatePreference('enableCaching', e.target.checked)}
                className="mr-2" />
              Enable caching
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.lowDataMode}
                onChange={(e) => updatePreference('lowDataMode', e.target.checked)}
                className="mr-2" />
              Low data mode
            </label>
          </div>
        );

      case 'advanced':
        return (
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.enableBetaFeatures}
                onChange={(e) => updatePreference('enableBetaFeatures', e.target.checked)}
                className="mr-2" />
              Enable beta features
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.debugMode}
                onChange={(e) => updatePreference('debugMode', e.target.checked)}
                className="mr-2" />
              Debug mode
            </label>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-medium mb-3">Import/Export</h4>
              <div className="space-y-2">
                <button
                  onClick={exportPreferences}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">

                  Export Preferences
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden" />
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">

                  Import Preferences
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Preferences
              </h2>
            </div>
            
            <nav className="p-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {sections.find(s => s.id === activeSection)?.title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">

                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {renderSection()}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={resetPreferences}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">

                Reset to Defaults
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">

                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesProvider;