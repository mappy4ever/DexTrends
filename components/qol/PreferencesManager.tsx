import React, { useState, useEffect } from 'react';
import { PreferencesPanel } from './UserPreferences';

/**
 * Global preferences manager that handles showing/hiding the preferences panel
 * Listens for global events and keyboard shortcuts to toggle preferences
 */
export const PreferencesManager: React.FC = () => {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  useEffect(() => {
    // Listen for global toggle preferences event
    const handleTogglePreferences = () => {
      setIsPreferencesOpen(prev => !prev);
    };

    window.addEventListener('togglePreferences', handleTogglePreferences);

    return () => {
      window.removeEventListener('togglePreferences', handleTogglePreferences);
    };
  }, []);

  return (
    <PreferencesPanel 
      isOpen={isPreferencesOpen}
      onClose={() => setIsPreferencesOpen(false)}
    />
  );
};

export default PreferencesManager;