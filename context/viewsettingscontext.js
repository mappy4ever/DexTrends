import React, { createContext, useState, useContext, useEffect } from 'react';

const ViewSettingsContext = createContext();

export function ViewSettingsProvider({ children }) {
  // Initialize view settings with defaults
  const [viewSettings, setViewSettings] = useState({
    pokemonView: 'grid', // grid or list
    cardSize: 'regular', // compact, regular, large
    cardView: 'grid', // grid or list
    showAnimations: true,
  });
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('viewSettings');
    if (savedSettings) {
      try {
        setViewSettings(prev => ({
          ...prev,
          ...JSON.parse(savedSettings)
        }));
      } catch (error) {
        // Silently ignore invalid saved settings and use defaults
      }
    }
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('viewSettings', JSON.stringify(viewSettings));
  }, [viewSettings]);

  // Update a specific setting
  const updateSetting = (key, value) => {
    setViewSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <ViewSettingsContext.Provider value={{ 
      viewSettings,
      updateSetting
    }}>
      {children}
    </ViewSettingsContext.Provider>
  );
}

export function useViewSettings() {
  return useContext(ViewSettingsContext);
}
