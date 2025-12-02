/**
 * UIContext - Focused context for UI state management
 * Split from UnifiedAppContext for performance optimization (GAMMA-003)
 *
 * Combines related UI concerns:
 * - View settings (grid/list, card size)
 * - Sorting (pokemon, cards)
 * - Modal state
 */

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import {
  ViewSettings,
  SortingState,
  ModalState,
  SortDirection,
  ViewType,
  CardSize
} from './modules/types';

// UI context value interface
export interface UIContextValue {
  // View Settings
  viewSettings: ViewSettings;
  updateViewSettings: (settings: Partial<ViewSettings>) => void;

  // Sorting
  sorting: SortingState;
  updateSorting: (sorting: Partial<SortingState>) => void;

  // Modal
  modal: ModalState;
  openModal: (type: string, data?: unknown) => void;
  closeModal: () => void;
}

// Create the context
const UIContext = createContext<UIContextValue | undefined>(undefined);

// Storage keys
const VIEW_STORAGE_KEY = 'dextrends-view-settings';
const SORTING_STORAGE_KEY = 'dextrends-sorting';

// Default states
const defaultViewSettings: ViewSettings = {
  pokemonView: 'grid',
  cardView: 'grid',
  cardSize: 'regular',
  showAnimations: true
};

const defaultSorting: SortingState = {
  pokemon: { field: 'id', direction: 'asc' },
  cards: { field: 'name', direction: 'asc' }
};

const defaultModal: ModalState = {
  isOpen: false,
  type: null,
  data: null
};

// Get initial view settings from localStorage
function getInitialViewSettings(): ViewSettings {
  if (typeof window === 'undefined') return defaultViewSettings;

  try {
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultViewSettings, ...parsed };
    }
  } catch (e) {
    // localStorage not available
  }

  return defaultViewSettings;
}

// Get initial sorting from localStorage
function getInitialSorting(): SortingState {
  if (typeof window === 'undefined') return defaultSorting;

  try {
    const stored = localStorage.getItem(SORTING_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSorting, ...parsed };
    }
  } catch (e) {
    // localStorage not available
  }

  return defaultSorting;
}

// Provider props
interface UIProviderProps {
  children: ReactNode;
}

// UI Provider Component
export function UIProvider({ children }: UIProviderProps) {
  const [viewSettings, setViewSettings] = useState<ViewSettings>(getInitialViewSettings);
  const [sorting, setSorting] = useState<SortingState>(getInitialSorting);
  const [modal, setModal] = useState<ModalState>(defaultModal);

  // Persist view settings to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(viewSettings));
    } catch (e) {
      // localStorage not available
    }
  }, [viewSettings]);

  // Persist sorting to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(SORTING_STORAGE_KEY, JSON.stringify(sorting));
    } catch (e) {
      // localStorage not available
    }
  }, [sorting]);

  // Update view settings
  const updateViewSettings = useCallback((settings: Partial<ViewSettings>) => {
    setViewSettings(prev => ({ ...prev, ...settings }));
  }, []);

  // Update sorting
  const updateSorting = useCallback((newSorting: Partial<SortingState>) => {
    setSorting(prev => ({ ...prev, ...newSorting }));
  }, []);

  // Open modal
  const openModal = useCallback((type: string, data?: unknown) => {
    setModal({
      isOpen: true,
      type,
      data: data ?? null
    });
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    setModal({
      isOpen: false,
      type: null,
      data: null
    });
  }, []);

  const value: UIContextValue = {
    viewSettings,
    updateViewSettings,
    sorting,
    updateSorting,
    modal,
    openModal,
    closeModal
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

// Hook to use UI context
export function useUIContext(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUIContext must be used within a UIProvider');
  }
  return context;
}

// Safe hook that doesn't throw
export function useUIContextSafe(): UIContextValue | null {
  return useContext(UIContext) ?? null;
}

// Convenience hooks for specific UI concerns
export function useViewSettingsContext() {
  const { viewSettings, updateViewSettings } = useUIContext();
  return { viewSettings, updateViewSettings };
}

export function useSortingContext() {
  const { sorting, updateSorting } = useUIContext();
  return { sorting, updateSorting };
}

export function useModalContext() {
  const { modal, openModal, closeModal } = useUIContext();
  return { modal, openModal, closeModal };
}

export default UIContext;
