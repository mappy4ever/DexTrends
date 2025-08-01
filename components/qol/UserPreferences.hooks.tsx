import { useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { PreferencesContext, PreferencesContextValue } from './UserPreferences';
import logger from '../../utils/logger';

export const usePreferences = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};
